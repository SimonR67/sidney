// Minimal headless-Chrome driver over the DevTools Protocol.
// No npm dependencies: uses the Chrome binary already on the machine plus
// Node's built-in fetch/WebSocket.
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

/** Serves `root` over http so tests can exercise the page as a static site. */
export async function serveStatic(root) {
  const { createServer } = await import('node:http')
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const file = join(root, path === '/' ? '/index.html' : path)
    if (!file.startsWith(root)) {
      res.writeHead(403).end()
      return
    }
    try {
      const body = await readFile(file)
      res.writeHead(200, { 'content-type': types[file.slice(file.lastIndexOf('.'))] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

function chromeBinary() {
  const bin = CHROME_CANDIDATES.find((p) => existsSync(p))
  if (!bin) throw new Error(`No Chrome binary found (looked in ${CHROME_CANDIDATES.join(', ')})`)
  return bin
}

async function devtoolsPort(profileDir) {
  const portFile = join(profileDir, 'DevToolsActivePort')
  for (let i = 0; i < 100; i++) {
    if (existsSync(portFile)) {
      const [port] = (await readFile(portFile, 'utf8')).split('\n')
      if (port) return Number(port)
    }
    await sleep(100)
  }
  throw new Error('Chrome did not report a DevTools port')
}

class Session {
  #ws
  #nextId = 1
  #pending = new Map()
  #listeners = new Map()

  constructor(ws) {
    this.#ws = ws
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id !== undefined) {
        const pending = this.#pending.get(msg.id)
        this.#pending.delete(msg.id)
        if (!pending) return
        if (msg.error) pending.reject(new Error(msg.error.message))
        else pending.resolve(msg.result)
        return
      }
      for (const listener of this.#listeners.get(msg.method) ?? []) listener(msg.params)
    })
  }

  on(method, listener) {
    if (!this.#listeners.has(method)) this.#listeners.set(method, [])
    this.#listeners.get(method).push(listener)
  }

  send(method, params = {}) {
    const id = this.#nextId++
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject })
      this.#ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

/**
 * Loads `url` in headless Chrome and returns a page handle.
 * Console errors/warnings and uncaught exceptions raised during load are
 * recorded on `page.consoleMessages` / `page.pageErrors`.
 */
export async function openPage(url, { width = 1280, height = 800 } = {}) {
  const profileDir = await mkdtemp(join(tmpdir(), 'mordor-chrome-'))
  const chrome = spawn(chromeBinary(), [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ], { stdio: 'ignore' })

  const port = await devtoolsPort(profileDir)
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const target = targets.find((t) => t.type === 'page')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', () => reject(new Error('DevTools socket failed')), { once: true })
  })

  const session = new Session(ws)
  const consoleMessages = []
  const pageErrors = []
  const failedRequests = []
  session.on('Runtime.consoleAPICalled', ({ type, args }) => {
    consoleMessages.push({
      type,
      text: args.map((a) => a.value ?? a.description ?? '').join(' '),
    })
  })
  session.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
    pageErrors.push(exceptionDetails.text ?? 'exception')
  })
  session.on('Log.entryAdded', ({ entry }) => {
    if (entry.level === 'error' || entry.level === 'warning') {
      consoleMessages.push({ type: entry.level, text: entry.text })
    }
  })
  session.on('Network.loadingFailed', ({ type, errorText }) => {
    failedRequests.push({ type, errorText })
  })
  const requests = []
  session.on('Network.requestWillBeSent', ({ request }) => {
    requests.push(request.url)
  })

  await session.send('Runtime.enable')
  await session.send('Log.enable')
  await session.send('Network.enable')
  await session.send('Page.enable')

  const page = {
    consoleMessages,
    pageErrors,
    failedRequests,
    requests,
    async setViewport(w, h = 800) {
      await session.send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: w < 600,
      })
    },
    /** Blocks the given URL patterns for the rest of the session. */
    async blockUrls(patterns) {
      await session.send('Network.setBlockedURLs', { urls: patterns })
    },
    async goto(target) {
      const loaded = new Promise((resolve) => session.on('Page.loadEventFired', resolve))
      await session.send('Page.navigate', { url: target })
      await loaded
      // Give late stylesheet/font work a chance to settle.
      await sleep(150)
    },
    async reload() {
      const loaded = new Promise((resolve) => session.on('Page.loadEventFired', resolve))
      await session.send('Page.reload', { ignoreCache: true })
      await loaded
      await sleep(150)
    },
    /** Evaluates `expression` in the page and returns the JSON-serialised result. */
    async evaluate(expression) {
      const { result, exceptionDetails } = await session.send('Runtime.evaluate', {
        expression: `(() => { ${expression} })()`,
        returnByValue: true,
        awaitPromise: true,
      })
      if (exceptionDetails) throw new Error(exceptionDetails.text + ': ' + (exceptionDetails.exception?.description ?? ''))
      return result.value
    },
    async close() {
      ws.close()
      const exited = new Promise((resolve) => chrome.once('exit', resolve))
      chrome.kill()
      await exited
      // Chrome can still be flushing profile files; a leftover temp dir is harmless.
      await rm(profileDir, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
    },
  }

  await page.setViewport(width, height)
  await page.goto(url)
  return page
}

/** Parses any CSS colour Chrome reports (`rgb(a)`) into `{r,g,b,a}`. */
export function parseColor(value) {
  const nums = value.match(/[\d.]+/g)?.map(Number) ?? []
  const [r = 0, g = 0, b = 0, a = 1] = nums
  return { r, g, b, a }
}

const channel = (c) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance({ r, g, b }) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

/** True for near-black: every channel dark and the colour is not strongly tinted. */
export function isNearBlack(color) {
  return relativeLuminance(color) < 0.05 && color.a > 0.9
}

/** True for an orange hue: red dominant, mid green, minimal blue. */
export function isOrange({ r, g, b }) {
  return r > 180 && g > 60 && g < 190 && b < 90 && r - g > 50 && g - b > 20
}
