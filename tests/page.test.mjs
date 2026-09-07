// Tests for the "Alpha Centauri" site.
// Original build plan: specs/8393b537-ac67-46f5-b4e0-0b0d2e416f06/plan.md
// Rebrand plan (dark blue, orange, new name):
// specs/73e4bb2c-ee3b-4009-b0ed-97501935ff03/plan.md
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { contrastRatio, isDarkBlue, isOrange, openPage, parseColor, serveStatic } from './browser.mjs'
import {
  COLOURS,
  COLOUR_VARS,
  OLD_COLOURS,
  PAGES,
  NAV_LINKS,
  MIN_CONTRAST,
  OLD_SITE_NAME,
  PALETTE_NOTES,
  SITE_NAME,
  STYLESHEET,
  declaredValue,
  headingsIn,
  hexColours,
  htmlFiles,
  linksIn,
  mainOf,
  navBlock,
  parseHex,
  read,
  repoRoot,
  rootEntries,
  siteFiles,
  tagsIn,
  textOf,
  titleOf,
} from './site.mjs'

const GLOBAL_SELECTORS = [':root', '*', 'html', 'body']

/**
 * Serves the repo and opens one headless-Chrome page for the enclosing suite.
 * Returns a handle whose `page`/`origin` are filled in by the time tests run.
 */
const servedInBrowser = () => {
  const handle = {}
  before(async () => {
    handle.server = await serveStatic(repoRoot)
    handle.origin = handle.server.origin
    handle.page = await openPage(`${handle.origin}/index.html`)
  })
  after(async () => {
    await handle.page?.close()
    await handle.server?.close()
  })
  return handle
}

/** Every text-bearing element's colour against the background it actually sits on. */
const TEXT_ON_BACKGROUND = `
  const opaque = (colour) => {
    const [, , , a = '1'] = colour.match(/[\\d.]+/g) ?? []
    return Number(a) > 0
  }
  return [...document.querySelectorAll('body, body *')]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .map((el) => {
      let node = el
      let background = 'rgba(0, 0, 0, 0)'
      while (node) {
        const candidate = getComputedStyle(node).backgroundColor
        if (opaque(candidate)) { background = candidate; break }
        node = node.parentElement
      }
      return { text: el.textContent.trim().slice(0, 40), color: getComputedStyle(el).color, background }
    })
`

/** Clicks the nav link labelled `label` and waits for `expectedPath` to finish loading. */
const clickNav = async (page, label, expectedPath) => {
  await page.evaluate(`
    const label = ${JSON.stringify(label)};
    const link = [...document.querySelectorAll('nav a')].find((a) => a.textContent.trim() === label);
    if (!link) throw new Error('no nav link labelled ' + label);
    link.click();
    return null;
  `)
  for (let i = 0; i < 100; i++) {
    try {
      const state = await page.evaluate('return { path: location.pathname, ready: document.readyState }')
      if (state.path === expectedPath && state.ready === 'complete') return
    } catch {
      // The execution context goes away mid-navigation; try again.
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  assert.fail(`clicking "${label}" never landed on ${expectedPath}`)
}

describe('Task 1: shared stylesheet base colours', () => {
  it('paints the page a dark blue', async () => {
    const css = await read(STYLESHEET)
    const background = declaredValue(css, GLOBAL_SELECTORS, 'background-color')

    assert.ok(background, `no background-color on any of ${GLOBAL_SELECTORS.join(', ')} in ${STYLESHEET}`)
    assert.ok(
      isDarkBlue(parseHex(background)),
      `${STYLESHEET} sets background-color: ${background}, which is not a dark blue`,
    )
  })

  it('writes in orange', async () => {
    const css = await read(STYLESHEET)
    const colour = declaredValue(css, GLOBAL_SELECTORS, 'color')

    assert.ok(colour, `no color on any of ${GLOBAL_SELECTORS.join(', ')} in ${STYLESHEET}`)
    assert.ok(isOrange(parseHex(colour)), `${STYLESHEET} sets color: ${colour}, which is not an orange`)
  })

  it('declares the two scheme colours as the values the tests expect', async () => {
    const css = await read(STYLESHEET)

    assert.equal(declaredValue(css, GLOBAL_SELECTORS, 'background-color'), COLOURS.darkBlue)
    assert.equal(declaredValue(css, GLOBAL_SELECTORS, 'color'), COLOURS.orange)
  })
})

describe('Task 2: the Home page', () => {
  it('carries the site title in the browser tab', async () => {
    assert.equal(titleOf(await read('index.html')), SITE_NAME)
  })

  it('links the shared stylesheet', async () => {
    const html = await read('index.html')

    assert.match(html, new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="${STYLESHEET}"`))
  })

  it('shows the site title as the page heading', async () => {
    const headings = headingsIn(await read('index.html'))

    assert.deepEqual(headings.at(0), { level: 1, text: SITE_NAME })
  })

  it('offers the three-item nav menu', async () => {
    const nav = navBlock(await read('index.html'))

    assert.ok(nav, 'index.html has no <nav>')
    assert.deepEqual(linksIn(nav), NAV_LINKS)
  })

  it('welcomes the visitor', async () => {
    const main = mainOf(await read('index.html'))

    assert.match(textOf(main), /welcome/i)
  })
})

describe('Task 3: the About Us page', () => {
  it('carries the site title and the shared stylesheet', async () => {
    const html = await read('about.html')

    assert.equal(titleOf(html), SITE_NAME)
    assert.match(html, new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="${STYLESHEET}"`))
    assert.deepEqual(headingsIn(html).at(0), { level: 1, text: SITE_NAME })
  })

  it('offers the same three-item nav menu', async () => {
    const nav = navBlock(await read('about.html'))

    assert.ok(nav, 'about.html has no <nav>')
    assert.deepEqual(linksIn(nav), NAV_LINKS)
  })

  it('is headed "About Us" and says only that it is coming soon', async () => {
    const main = mainOf(await read('about.html'))

    assert.deepEqual(headingsIn(main), [{ level: 2, text: 'About Us' }])
    assert.match(textOf(main), /^About Us\b.*coming soon/i)
  })

  it('holds no content beyond that heading and placeholder', async () => {
    const main = mainOf(await read('about.html'))

    assert.deepEqual(tagsIn(main), ['h2', 'p'])
  })
})

describe('Task 4: the Contact page', () => {
  it('carries the site title and the shared stylesheet', async () => {
    const html = await read('contact.html')

    assert.equal(titleOf(html), SITE_NAME)
    assert.match(html, new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="${STYLESHEET}"`))
    assert.deepEqual(headingsIn(html).at(0), { level: 1, text: SITE_NAME })
  })

  it('offers the same three-item nav menu', async () => {
    const nav = navBlock(await read('contact.html'))

    assert.ok(nav, 'contact.html has no <nav>')
    assert.deepEqual(linksIn(nav), NAV_LINKS)
  })

  it('is headed "Contact" and says only that it is coming soon', async () => {
    const main = mainOf(await read('contact.html'))

    assert.deepEqual(headingsIn(main), [{ level: 2, text: 'Contact' }])
    assert.match(textOf(main), /^Contact\b.*coming soon/i)
  })

  it('carries no contact form', async () => {
    const html = await read('contact.html')

    for (const tag of ['form', 'input', 'textarea', 'select', 'button']) {
      assert.ok(!tagsIn(html).includes(tag), `contact.html contains a <${tag}>`)
    }
  })
})

describe('Task 5: the nav menu, styled the same on every page', () => {
  it('uses byte-identical nav markup on all three pages', async () => {
    const [home, ...rest] = await Promise.all(PAGES.map(async (p) => navBlock(await read(p.file))))

    for (const [index, nav] of rest.entries()) {
      assert.equal(nav, home, `${PAGES[index + 1].file} nav markup differs from index.html`)
    }
  })

  it('paints the nav itself dark blue with orange links, not just the body', async () => {
    const css = await read(STYLESHEET)
    const background = declaredValue(css, ['.site-nav'], 'background-color')
    const linkColour = declaredValue(css, ['.site-nav__links a'], 'color')

    assert.ok(background, `${STYLESHEET} sets no background-color on .site-nav`)
    assert.ok(isDarkBlue(parseHex(background)), `.site-nav background-color is ${background}, not a dark blue`)
    assert.ok(linkColour, `${STYLESHEET} sets no color on the nav links`)
    assert.ok(isOrange(parseHex(linkColour)), `nav link color is ${linkColour}, not an orange`)
  })

  it('keeps the layout simple: no grids, columns, animations or transitions', async () => {
    const css = await read(STYLESHEET)

    for (const pattern of [/@keyframes/i, /\banimation\b/i, /\btransition\b/i, /display:\s*grid/i, /\bfloat:/i, /\bcolumn-count\b/i]) {
      assert.ok(!pattern.test(css), `${STYLESHEET} should not use ${pattern}`)
    }
  })
})

describe('Task 5 (rendered): nav colours in the browser', () => {
  const site = servedInBrowser()

  for (const { file } of PAGES) {
    it(`renders ${file} with a dark blue nav and orange nav links`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      const state = await page.evaluate(`
        const nav = document.querySelector('nav');
        const link = nav.querySelector('a');
        return {
          navBg: getComputedStyle(nav).backgroundColor,
          linkColor: getComputedStyle(link).color,
          bodyBg: getComputedStyle(document.body).backgroundColor,
          bodyColor: getComputedStyle(document.body).color,
        }
      `)

      assert.ok(isDarkBlue(parseColor(state.navBg)), `nav background on ${file} is ${state.navBg}`)
      assert.ok(isOrange(parseColor(state.linkColor)), `nav link colour on ${file} is ${state.linkColor}`)
      assert.ok(isDarkBlue(parseColor(state.bodyBg)), `body background on ${file} is ${state.bodyBg}`)
      assert.ok(isOrange(parseColor(state.bodyColor)), `body text colour on ${file} is ${state.bodyColor}`)
    })
  }
})

describe('Task 6: orange on dark blue stays legible', () => {
  it('clears the readability threshold for the two declared shades', () => {
    const ratio = contrastRatio(parseHex(COLOURS.orange), parseHex(COLOURS.darkBlue))

    assert.ok(
      ratio >= MIN_CONTRAST,
      `${COLOURS.orange} on ${COLOURS.darkBlue} is only ${ratio.toFixed(2)}:1, below ${MIN_CONTRAST}:1`,
    )
  })

  it('uses no colours beyond those two shades', async () => {
    const css = await read(STYLESHEET)

    assert.deepEqual([...new Set(hexColours(css))].sort(), [COLOURS.darkBlue, COLOURS.orange].sort())
  })
})

describe('Task 6 (rendered): every line of text on every page', () => {
  const site = servedInBrowser()

  for (const { file } of PAGES) {
    it(`keeps every line on ${file} legible against its background`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      const lines = await page.evaluate(TEXT_ON_BACKGROUND)

      assert.ok(lines.length > 0, `no text found on ${file}`)
      for (const line of lines) {
        const ratio = contrastRatio(parseColor(line.color), parseColor(line.background))
        assert.ok(
          ratio >= MIN_CONTRAST,
          `"${line.text}" on ${file}: ${line.color} on ${line.background} is ${ratio.toFixed(2)}:1`,
        )
      }
    })
  }
})

describe('Task 7: nothing left of the superseded site', () => {
  it('serves exactly the three pages of the new site', async () => {
    assert.deepEqual(await htmlFiles(), ['about.html', 'contact.html', 'index.html'])
  })

  it('is built from those pages and the one stylesheet, nothing else', async () => {
    assert.deepEqual(await siteFiles(), ['about.html', 'contact.html', 'index.html', 'package.json', 'style.css'])
  })

  it('leaves no old pages, stylesheets or asset folders in the repository root', async () => {
    assert.deepEqual(await rootEntries(), [
      '.github',
      'about.html',
      'contact.html',
      'index.html',
      'package.json',
      'specs',
      'style.css',
      'tests',
    ])
  })

  it('mentions the superseded site name nowhere in the site or its tests', async () => {
    const files = [...(await siteFiles()), 'tests/browser.mjs', 'tests/page.test.mjs', 'tests/site.mjs']

    for (const file of files) {
      const contents = await read(file)
      const mentions = file === 'tests/site.mjs'
        ? contents.replace(/^.*OLD_SITE_NAME.*$/m, '')
        : contents
      assert.ok(!OLD_SITE_NAME.test(mentions), `${file} still mentions the superseded site name`)
    }
  })
})

describe('Task 8: every link resolves', () => {
  it('points every href on every page at a file that exists', async () => {
    for (const { file } of PAGES) {
      for (const { href } of linksIn(await read(file))) {
        assert.ok(!href.startsWith('#'), `${file} links to the in-page anchor ${href}`)
        await access(join(repoRoot, href))
      }
    }
  })
})

describe('Task 8 (rendered): clicking through the nav', () => {
  const site = servedInBrowser()

  for (const from of PAGES) {
    it(`reaches every page from ${from.file} without a missing file`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${from.file}`)

      for (const to of PAGES) {
        await clickNav(page, to.label, `/${to.file}`)
        const state = await page.evaluate(`
          return {
            title: document.title,
            siteTitle: document.querySelector('h1').textContent.trim(),
            heading: document.querySelector('main h2').textContent.trim(),
            navLinks: document.querySelectorAll('nav a').length,
            body: document.body.textContent.trim(),
          }
        `)

        assert.equal(state.title, SITE_NAME)
        assert.equal(state.siteTitle, SITE_NAME)
        assert.equal(state.heading, to.heading)
        assert.equal(state.navLinks, NAV_LINKS.length)
        assert.ok(state.body.length > 0, `${to.file} rendered no text`)
        await page.goto(`${site.origin}/${from.file}`)
      }

      assert.deepEqual(page.failedRequests, [], `${from.file} produced failed requests`)
      assert.deepEqual(page.consoleMessages, [], `${from.file} logged console errors`)
      assert.deepEqual(page.pageErrors, [])
    })
  }
})

describe('Test plan: the visitor journey end to end', () => {
  const site = servedInBrowser()

  const VISITOR_STATE = `
    return {
      path: location.pathname,
      title: document.title,
      siteTitle: document.querySelector('h1').textContent.trim(),
      heading: document.querySelector('main h2').textContent.trim(),
      copy: document.querySelector('main p').textContent.trim(),
      nav: [...document.querySelectorAll('nav a')].map((a) => ({ href: a.getAttribute('href'), label: a.textContent.trim() })),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      navBg: getComputedStyle(document.querySelector('nav')).backgroundColor,
      navColor: getComputedStyle(document.querySelector('nav a')).color,
      headingColor: getComputedStyle(document.querySelector('main h2')).color,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      interactive: document.querySelectorAll('form, input, button, select, textarea, img, script').length,
    }
  `

  const assertHouseStyle = (state, where) => {
    assert.equal(state.title, SITE_NAME, `${where}: browser tab`)
    assert.equal(state.siteTitle, SITE_NAME, `${where}: visible site title`)
    assert.deepEqual(state.nav, NAV_LINKS, `${where}: nav menu`)
    assert.ok(isDarkBlue(parseColor(state.bodyBg)), `${where}: body background ${state.bodyBg}`)
    assert.ok(isDarkBlue(parseColor(state.navBg)), `${where}: nav background ${state.navBg}`)
    assert.ok(isOrange(parseColor(state.navColor)), `${where}: nav link colour ${state.navColor}`)
    assert.ok(isOrange(parseColor(state.headingColor)), `${where}: heading colour ${state.headingColor}`)
    assert.equal(state.overflow, false, `${where}: page overflows sideways`)
    assert.equal(state.interactive, 0, `${where}: page carries forms, images or scripts`)
  }

  for (const width of [1280, 375]) {
    it(`walks Home → About Us → Contact → Home at ${width}px`, async () => {
      const { page } = site
      await page.setViewport(width, 900)
      await page.goto(`${site.origin}/index.html`)

      const home = await page.evaluate(VISITOR_STATE)
      assertHouseStyle(home, `Home at ${width}px`)
      assert.equal(home.heading, 'Home')
      assert.match(home.copy, /welcome/i)

      for (const label of ['About Us', 'Contact', 'Home']) {
        const { file, heading } = PAGES.find((p) => p.label === label)
        await clickNav(page, label, `/${file}`)
        const state = await page.evaluate(VISITOR_STATE)

        assertHouseStyle(state, `${label} at ${width}px`)
        assert.equal(state.heading, heading)
        assert.match(state.copy, label === 'Home' ? /welcome/i : /coming soon/i)
      }
    })
  }

  it('serves structurally sound markup on every page', async () => {
    const nonVoid = ['html', 'head', 'body', 'header', 'nav', 'main', 'ul', 'li', 'a', 'h1', 'h2', 'p', 'title']

    for (const { file } of PAGES) {
      const html = await read(file)

      assert.match(html, /^<!DOCTYPE html>\n<html lang="en">/, `${file} lacks a doctype and language`)
      assert.equal(tagsIn(html).filter((tag) => tag === 'h1').length, 1, `${file} should have exactly one h1`)
      for (const tag of nonVoid) {
        const open = [...html.matchAll(new RegExp(`<${tag}\\b`, 'gi'))].length
        const close = [...html.matchAll(new RegExp(`</${tag}>`, 'gi'))].length
        assert.equal(open, close, `${file} has ${open} <${tag}> against ${close} </${tag}>`)
      }
    }
  })
})

describe('Rebrand task 2: one documented palette', () => {
  it('records both chosen shades in the plan notes', async () => {
    const notes = await read(PALETTE_NOTES)

    for (const hex of Object.values(COLOURS)) {
      assert.match(notes, new RegExp(hex, 'i'), `${PALETTE_NOTES} does not record ${hex}`)
    }
  })

  it('writes each shade once, as a custom property named after it', async () => {
    const css = await read(STYLESHEET)

    for (const [name, hex] of Object.entries(COLOURS)) {
      assert.equal(declaredValue(css, [':root'], COLOUR_VARS[name]), hex)
      assert.equal(
        hexColours(css).filter((colour) => colour === hex).length,
        1,
        `${hex} is written more than once in ${STYLESHEET}; it should come from ${COLOUR_VARS[name]}`,
      )
    }
  })
})

describe('Rebrand task 4: buttons', () => {
  const site = servedInBrowser()

  const BUTTONS = `
    return [...document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], .btn, .button')]
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        background: getComputedStyle(el).backgroundColor,
        border: getComputedStyle(el).borderColor,
      }))
  `

  for (const { file } of PAGES) {
    it(`has no button on ${file}, so the orange lands on text accents alone`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      const buttons = await page.evaluate(BUTTONS)

      // Should a button ever appear, it has to carry the orange itself.
      for (const button of buttons) {
        assert.ok(
          isOrange(parseColor(button.background)) || isOrange(parseColor(button.border)),
          `<${button.tag}> on ${file} is ${button.background} on ${button.border}, neither of them orange`,
        )
      }
      assert.deepEqual(buttons, [], `${file} now carries a button; the gap flagged in ${PALETTE_NOTES} is out of date`)
    })
  }
})

describe('Rebrand task 5 (rendered): every accent is orange, in every state', () => {
  const site = servedInBrowser()

  const ACCENTS = { 'the site title': 'h1.site-title', 'the page heading': 'main h2', 'a nav link': 'nav a' }

  for (const { file } of PAGES) {
    it(`paints the accents on ${file} orange at rest, on hover and on focus`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)

      for (const [what, selector] of Object.entries(ACCENTS)) {
        for (const state of [[], ['hover'], ['focus'], ['active']]) {
          await page.forcePseudoState(selector, state)
          const colour = await page.evaluate(
            `return getComputedStyle(document.querySelector(${JSON.stringify(selector)})).color`,
          )

          assert.ok(
            isOrange(parseColor(colour)),
            `${what} on ${file} is ${colour} under :${state.join(':') || 'rest'}, which is not an orange`,
          )
        }
        await page.forcePseudoState(selector, [])
      }
    })
  }
})

describe('Rebrand tasks 9-11: the metadata this site does not carry', () => {
  it('carries no meta tag beyond charset and viewport, so none can name the site', async () => {
    for (const file of await htmlFiles()) {
      const metas = [...(await read(file)).matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag)

      assert.equal(metas.length, 2, `${file} has meta tags this rebrand has not accounted for:\n${metas.join('\n')}`)
      assert.match(metas[0], /charset="utf-8"/)
      assert.match(metas[1], /name="viewport"/)
    }
  })

  it('ships no web app manifest to rename', async () => {
    const manifests = (await siteFiles()).filter((file) => /manifest\.json$|\.webmanifest$/.test(file))

    assert.deepEqual(manifests, [], `${PALETTE_NOTES} flags the site as having no manifest`)
    for (const file of await htmlFiles()) {
      assert.ok(!/rel="manifest"/i.test(await read(file)), `${file} links a manifest`)
    }
  })

  it('renders no footer or copyright line to rename', async () => {
    for (const file of await htmlFiles()) {
      const html = await read(file)

      assert.ok(!tagsIn(html).includes('footer'), `${file} contains a <footer>`)
      assert.ok(!/©|&copy;|copyright/i.test(html), `${file} carries a copyright line`)
    }
  })
})

describe('Rebrand task 13: the flagged gaps are written down', () => {
  it('lists each out-of-scope gap in the plan notes', async () => {
    const notes = await read(PALETTE_NOTES)
    const [, gaps] = notes.split(/^## \d+\. Flagged gaps.*$/m)

    assert.ok(gaps, `${PALETTE_NOTES} has no "Flagged gaps" section`)
    for (const gap of ['package.json', 'button', 'meta', 'manifest', 'footer', 'toggle', 'favicon', 'README']) {
      assert.match(gaps, new RegExp(gap, 'i'), `the flagged gaps say nothing about ${gap}`)
    }
  })
})

describe('Rebrand task 6: no trace of the superseded shades', () => {
  it('mentions neither the old dark green nor the old gold anywhere in the site', async () => {
    for (const file of await siteFiles()) {
      const contents = await read(file)

      for (const digits of OLD_COLOURS) {
        assert.ok(
          !new RegExp(digits, 'i').test(contents),
          `${file} still uses the superseded colour #${digits}`,
        )
      }
    }
  })
})
