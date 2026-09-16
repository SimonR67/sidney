// Tests for swapping the watermark photograph from `Wroclaw.jpg` to `Wroclaw1.jpg`.
// Plan: specs/03066e16-c33c-41b7-a8d1-80b1659ad7d3/plan.md
// One describe per numbered task in that plan. The layer itself — that it is
// painted at all, behind everything, faint enough to read through, and gone in
// print — stays covered by tests/watermark.test.mjs, which these hold to the
// new filename through `WATERMARK_IMAGE`.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { openPage, serveStatic } from './browser.mjs'
import {
  SERVICES_STYLESHEET,
  STYLESHEET,
  WATERMARK_IMAGE,
  WATERMARK_IMAGE_FILE,
  WATERMARK_IMAGE_WAS,
  WATERMARK_IMAGE_WAS_FILE,
  WATERMARK_LAYER,
  WATERMARK_OPACITY,
  WATERMARK_SWAP_NOTES,
  WATERMARK_SWAP_PLAN,
  htmlFiles,
  read,
  repoRoot,
  rules,
  siteFiles,
} from './site.mjs'

/** The two widths every check is made at: a common desktop, and a common phone. */
const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 375, height: 667 }

/** The path each sheet reaches the photograph by, relative to the sheet itself. */
const REFERENCES = [
  [SERVICES_STYLESHEET, `../${WATERMARK_IMAGE}`],
  [STYLESHEET, WATERMARK_IMAGE],
]

/** Text the site ships that could name an image; the rest of it is bytes. */
const READABLE = /\.(html|css|js|mjs|json|svg|txt|md)$/

const git = (...args) => spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 28 })

/** The commit that added this job's plan — the site as it stood before any of this. */
const baselineCommit = () => {
  const added = git('log', '--diff-filter=A', '--format=%H', '--', WATERMARK_SWAP_PLAN)
  return added.status === 0 && added.stdout.trim() ? added.stdout.trim().split('\n').at(-1) : null
}

/** A file as it stood in that commit, as text, or `null` when it was not there. */
const baseline = (commit, file) => {
  const show = spawnSync('git', ['show', `${commit}:${file}`], { cwd: repoRoot, maxBuffer: 1 << 28 })
  return show.status === 0 ? show.stdout.toString('utf8') : null
}

/** The declarations every `body::before` block in a sheet carries, in source order. */
const layerBlocks = (css) =>
  rules(css)
    .filter((rule) => rule.selectors.includes(WATERMARK_LAYER))
    .map((rule) => rule.declarations)

/** Every `url(...)` a stylesheet asks the browser to fetch. */
const urls = (css) => [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map(([, url]) => url)

/** A JPEG's pixel size, read off its first start-of-frame marker. */
const jpegSize = (bytes) => {
  for (let i = 2; i < bytes.length; ) {
    if (bytes[i] !== 0xff) {
      i++
      continue
    }
    const marker = bytes[i + 1]
    if (marker >= 0xc0 && marker <= 0xc3) return { width: bytes.readUInt16BE(i + 7), height: bytes.readUInt16BE(i + 5) }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2
      continue
    }
    i += 2 + bytes.readUInt16BE(i + 2)
  }
  return null
}

/** The box `background-size: cover` draws `image` in, inside `viewport`. */
const cover = (viewport, image) => {
  const scale = Math.max(viewport.width / image.width, viewport.height / image.height)
  return { width: image.width * scale, height: image.height * scale }
}

/** Everything the swap can be read off the painted layer by. */
const LAYER = `
  const layer = getComputedStyle(document.body, '::before')
  return {
    backgroundImage: layer.backgroundImage,
    backgroundSize: layer.backgroundSize,
    backgroundPosition: layer.backgroundPosition,
    backgroundRepeat: layer.backgroundRepeat,
    opacity: layer.opacity,
    size: [layer.width, layer.height],
  }
`

/** Hides the watermark layer, or puts it back — the page with no photograph behind it. */
const SUPPRESS = `
  const style = document.createElement('style')
  style.id = 'no-watermark'
  style.textContent = 'body::before { display: none !important; }'
  document.head.append(style)
  return true
`
const RESTORE = `document.getElementById('no-watermark')?.remove(); return true`

/** Waits for the fonts and every image on the page, then for two frames. */
const SETTLED = `
  return Promise.all([
    document.fonts.ready,
    ...[...document.images].map((image) => image.decode().catch(() => {})),
  ]).then(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)))
  }))
`

const render = async (page) => {
  await page.evaluate(SETTLED)
  return page.screenshot()
}

/** True where `image` is one flat colour over a 5×5 box: no glyph, edge or photograph. */
const flatAt = (image, x, y) => {
  const here = image.pixelAt(x, y)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const there = image.pixelAt(x + dx, y + dy)
      if (there.r !== here.r || there.g !== here.g || there.b !== here.b) return false
    }
  }
  return true
}

/**
 * How far the watermark shifts the flat pixels of a page: the largest and the
 * average channel difference between the page with the layer and the same page
 * with it hidden. Anti-aliased edges are left out on purpose — a translucent
 * layer under the page costs Chrome its sub-pixel text anti-aliasing whatever
 * it paints. Same measurement tests/watermark.test.mjs makes at its own width.
 */
const flatShift = (painted, bare) => {
  assert.equal(painted.pixels.length, bare.pixels.length, 'the two renderings are different sizes')
  let changed = 0
  let flat = 0
  let max = 0
  let total = 0
  for (let y = 2; y < bare.height - 2; y++) {
    for (let x = 2; x < bare.width - 2; x++) {
      if (!flatAt(bare, x, y)) continue
      flat++
      const here = painted.pixelAt(x, y)
      const there = bare.pixelAt(x, y)
      const delta = Math.max(Math.abs(here.r - there.r), Math.abs(here.g - there.g), Math.abs(here.b - there.b))
      if (delta) changed++
      if (delta > max) max = delta
      total += delta
    }
  }
  return { changed, flat, max, mean: total / flat }
}

/** Serves the repository and holds one headless-Chrome page open for the suite. */
const servedInBrowser = ({ width, height } = DESKTOP) => {
  const handle = {}
  before(async () => {
    handle.server = await serveStatic(repoRoot)
    handle.origin = handle.server.origin
    handle.url = (page) => `${handle.origin}/${page}`
    handle.page = await openPage(`${handle.origin}/index.html`, { width, height })
  })
  after(async () => {
    await handle.page?.close()
    await handle.server?.close()
  })
  return handle
}

/** The section of this job's notes under the given `## n. Heading`, up to the next heading. */
const section = async (heading) => {
  const notes = await read(WATERMARK_SWAP_NOTES)
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

describe('Swap task 1: every reference to the old photograph, traced and written down', () => {
  it('accounts in the notes for every file that named the old photograph', () => {
    const commit = baselineCommit()
    assert.ok(commit, `no commit adds ${WATERMARK_SWAP_PLAN} to diff the swap against`)

    const tracked = git('ls-tree', '-r', '--name-only', commit)
      .stdout.split('\n')
      .filter((file) => file && !file.startsWith('specs/'))
    const named = tracked.filter((file) => (baseline(commit, file) ?? '').includes(WATERMARK_IMAGE_WAS))

    assert.deepEqual(
      named.sort(),
      [STYLESHEET, SERVICES_STYLESHEET, 'tests/site.mjs'].sort(),
      `the files naming ${WATERMARK_IMAGE_WAS} are not the ones the notes were written from`,
    )
  })

  it('names each of them, and the line it was found on, in the discovery notes', async () => {
    const discovery = await section('Discovery')
    assert.ok(discovery, `${WATERMARK_SWAP_NOTES} has no "Discovery" section`)

    for (const file of [STYLESHEET, SERVICES_STYLESHEET, 'tests/site.mjs', 'index.html']) {
      assert.ok(discovery.includes(file), `the discovery notes do not name ${file}`)
    }
    for (const reference of [`url('../${WATERMARK_IMAGE_WAS}')`, `url('${WATERMARK_IMAGE_WAS}')`]) {
      assert.ok(discovery.includes(reference), `the discovery notes do not record ${reference}`)
    }
  })

  it('records the mechanism each reference uses: one CSS layer per sheet, no markup', async () => {
    const discovery = await section('Discovery')

    assert.match(discovery, /body::before/, 'the notes do not record which hook carries the photograph')
    assert.match(discovery, /opacity: 0\.05/, 'the notes do not record how the faintness is set')
    assert.match(discovery, /max-width: 767px/, 'the notes do not settle whether a mobile rule names the image too')
    assert.match(discovery, /no HTML file names the photograph/i, 'the notes do not settle the inline-style/`<img>` question')

    // And the same, read off the pages rather than the prose: no page names
    // either photograph, so there is no markup reference to swap.
    for (const page of await htmlFiles()) {
      const html = await read(page)
      for (const image of [WATERMARK_IMAGE_WAS, WATERMARK_IMAGE]) {
        assert.ok(!html.includes(image), `${page} names ${image} in its markup`)
      }
    }
  })

  it('separates the city named in the prose from the file: it is not a reference', async () => {
    const home = await read('index.html')

    assert.match(home, /Wroclaw/, 'the home page no longer names the city the notes traced')
    assert.ok(!/Wroclaw[^\s,.]*\.jpg/.test(home), 'the home page names a Wroclaw file after all')
    assert.match(await section('Discovery'), /the \*\*city\*\*, not the image/, 'the notes do not resolve the prose match')
  })
})

describe('Swap task 2: the new photograph, at the path it already sits on', () => {
  const site = servedInBrowser()

  it('ships the new photograph at the repository root, under that exact name', async () => {
    const files = await siteFiles()

    assert.ok(files.includes(WATERMARK_IMAGE), `${WATERMARK_IMAGE} is not one of the files the site ships`)
    assert.equal(
      git('ls-files', '--error-unmatch', WATERMARK_IMAGE).status,
      0,
      `${WATERMARK_IMAGE} is not tracked by git`,
    )
  })

  it('is a JPEG of the length and pixel size the tests hold it to', async () => {
    const bytes = await readFile(join(repoRoot, WATERMARK_IMAGE))

    assert.equal(bytes.readUInt16BE(0), 0xffd8, `${WATERMARK_IMAGE} is not a JPEG`)
    assert.equal(bytes.length, WATERMARK_IMAGE_FILE.bytes, `${WATERMARK_IMAGE} is not the file that was committed`)
    assert.deepEqual(jpegSize(bytes), { width: WATERMARK_IMAGE_FILE.width, height: WATERMARK_IMAGE_FILE.height })
  })

  it('is served with a 200 at the path both sheets resolve to', async () => {
    const response = await fetch(`${site.origin}/${WATERMARK_IMAGE}`)

    assert.equal(response.status, 200, `the site serves /${WATERMARK_IMAGE} with ${response.status}`)
    assert.equal(response.headers.get('content-type'), 'image/jpeg')
    assert.equal((await response.arrayBuffer()).byteLength, WATERMARK_IMAGE_FILE.bytes)
  })

  it('decodes at its natural size in the browser, on every page', async () => {
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      const decoded = await site.page.evaluate(`
        const image = new Image()
        image.src = ${JSON.stringify(`/${WATERMARK_IMAGE}`)}
        return image.decode().then(() => ({ width: image.naturalWidth, height: image.naturalHeight }), (e) => String(e))
      `)

      assert.deepEqual(
        decoded,
        { width: WATERMARK_IMAGE_FILE.width, height: WATERMARK_IMAGE_FILE.height },
        `${page} cannot reach ${WATERMARK_IMAGE}`,
      )
    }
  })

  it('writes its size and aspect ratio down before anything points at it', async () => {
    const files = await section('The two files')
    assert.ok(files, `${WATERMARK_SWAP_NOTES} has no "The two files" section`)

    assert.ok(files.includes(WATERMARK_IMAGE), `the notes do not name ${WATERMARK_IMAGE}`)
    assert.ok(files.includes('602,887'), 'the notes do not record the new file\'s length')
    assert.match(files, /2900 × 2263/, 'the notes do not record the new file\'s pixel size')
    assert.match(files, /1\.2815:1/, 'the notes do not record the new file\'s aspect ratio')
  })
})

describe('Swap task 3: the layer draws the new photograph at the faintness it already had', () => {
  const site = servedInBrowser()

  it('points both stylesheets at the new file, by a path relative to the sheet', async () => {
    for (const [sheet, url] of REFERENCES) {
      const declared = layerBlocks(await read(sheet)).map((block) => block['background-image']).filter(Boolean)

      assert.deepEqual(declared, [`url('${url}')`], `${sheet} points the watermark at ${declared.join(', ')}`)
    }
  })

  it('leaves every other declaration of the layer exactly as it was', () => {
    const commit = baselineCommit()
    assert.ok(commit, 'no baseline commit to compare the layer against')

    for (const [sheet] of REFERENCES) {
      const was = layerBlocks(baseline(commit, sheet))
      const now = layerBlocks(readFileSync(join(repoRoot, sheet), 'utf8'))
      const withoutImage = (blocks) => blocks.map(({ 'background-image': image, ...rest }) => rest)

      assert.ok(was.length > 0, `${sheet} declared no watermark layer before the swap`)
      assert.deepEqual(withoutImage(now), withoutImage(was), `${sheet} changes more of the layer than the filename`)
      assert.equal(now.at(0)['opacity'], '0.05', `${sheet} now paints the watermark at ${now.at(0)['opacity']}`)
    }
  })

  it('draws the new photograph at that faintness on every page', async () => {
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      const layer = await site.page.evaluate(LAYER)

      assert.match(layer.backgroundImage, new RegExp(`/${WATERMARK_IMAGE}"?\\)$`), `${page} draws ${layer.backgroundImage}`)
      assert.equal(layer.opacity, '0.05', `${page} paints the watermark at ${layer.opacity}`)
      assert.ok(
        site.page.requests.some((url) => url.endsWith(`/${WATERMARK_IMAGE}`)),
        `${page} never requested ${WATERMARK_IMAGE}`,
      )
    }
  })
})

describe('Swap task 4: no reference to the old photograph anywhere the site ships', () => {
  const site = servedInBrowser()

  it('names the old file in none of the files the site ships', async () => {
    for (const file of (await siteFiles()).filter((name) => READABLE.test(name))) {
      assert.ok(!(await read(file)).includes(WATERMARK_IMAGE_WAS), `${file} still names ${WATERMARK_IMAGE_WAS}`)
    }
  })

  it('asks the browser for no other image from either stylesheet', async () => {
    for (const [sheet, url] of REFERENCES) {
      assert.deepEqual(urls(await read(sheet)), [url], `${sheet} fetches something other than ${url}`)
    }
  })

  it('requests the old file on no page, and loses no request it makes', async () => {
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      await site.page.evaluate(SETTLED)

      assert.deepEqual(
        site.page.requests.filter((url) => url.includes(WATERMARK_IMAGE_WAS)),
        [],
        `${page} still requests ${WATERMARK_IMAGE_WAS}`,
      )
      assert.deepEqual(site.page.failedRequests, [], `${page} lost a request: ${JSON.stringify(site.page.failedRequests)}`)
    }
  })
})

describe('Swap task 5: cover, centred, and cropped no harder than before', () => {
  const site = servedInBrowser()

  it('keeps the sizing the sheets already declared — the new shape needs no adjustment', () => {
    const commit = baselineCommit()
    assert.ok(commit, 'no baseline commit to compare the sizing against')

    for (const [sheet] of REFERENCES) {
      for (const property of ['background-size', 'background-position', 'background-repeat']) {
        const was = layerBlocks(baseline(commit, sheet)).map((block) => block[property])
        const now = layerBlocks(readFileSync(join(repoRoot, sheet), 'utf8')).map((block) => block[property])

        assert.deepEqual(now, was, `${sheet} changed ${property} to ${now.join(', ')}`)
      }
      assert.equal(layerBlocks(readFileSync(join(repoRoot, sheet), 'utf8')).at(0)['background-size'], 'cover')
    }
  })

  it('scales it proportionally at desktop and phone widths: no stretching, no upsampling', () => {
    for (const viewport of [DESKTOP, MOBILE, { width: 1920, height: 1080 }, { width: 414, height: 896 }]) {
      const drawn = cover(viewport, WATERMARK_IMAGE_FILE)
      const natural = WATERMARK_IMAGE_FILE.width / WATERMARK_IMAGE_FILE.height

      assert.ok(
        Math.abs(drawn.width / drawn.height - natural) < natural * 0.001,
        `at ${viewport.width}px the image is drawn ${(drawn.width / drawn.height).toFixed(4)}:1, not ${natural.toFixed(4)}:1`,
      )
      assert.ok(drawn.width >= viewport.width - 0.5, `at ${viewport.width}px the image is ${drawn.width}px wide`)
      assert.ok(drawn.height >= viewport.height - 0.5, `at ${viewport.width}px the image is ${drawn.height}px tall`)
      assert.ok(
        drawn.width <= WATERMARK_IMAGE_FILE.width && drawn.height <= WATERMARK_IMAGE_FILE.height,
        `at ${viewport.width}px the image is scaled up past its ${WATERMARK_IMAGE_FILE.width}px width`,
      )
    }
  })

  it('crops it no harder than the photograph it replaces would have been cropped', () => {
    for (const viewport of [DESKTOP, MOBILE]) {
      const now = cover(viewport, WATERMARK_IMAGE_FILE)
      const was = cover(viewport, WATERMARK_IMAGE_WAS_FILE)
      const overflow = ({ width, height }) => Math.max(width / viewport.width, height / viewport.height)

      assert.ok(
        Math.abs(overflow(now) / overflow(was) - 1) <= 0.1,
        `at ${viewport.width}px the new image is cropped ${overflow(now).toFixed(3)}× against the old ${overflow(was).toFixed(3)}×`,
      )
    }
  })

  it('paints it centred, uncropped-to-the-edge and untiled, at both widths', async () => {
    for (const { width, height } of [DESKTOP, MOBILE]) {
      await site.page.setViewport(width, height)
      await site.page.goto(site.url('index.html'))
      const layer = await site.page.evaluate(LAYER)

      assert.equal(layer.backgroundSize, 'cover', `at ${width}px the watermark is sized ${layer.backgroundSize}`)
      assert.equal(layer.backgroundPosition, '50% 50%', `at ${width}px the watermark sits at ${layer.backgroundPosition}`)
      assert.equal(layer.backgroundRepeat, 'no-repeat', `at ${width}px the watermark tiles`)
      assert.deepEqual(layer.size, [`${width}px`, `${height}px`], `at ${width}px the layer is ${layer.size.join(' × ')}`)
    }
    await site.page.setViewport(DESKTOP.width, DESKTOP.height)
  })

  it('stays as faint on a phone as the layer is allowed to be', async () => {
    await site.page.setViewport(MOBILE.width, MOBILE.height)
    await site.page.goto(site.url('index.html'))
    const painted = await render(site.page)
    await site.page.evaluate(SUPPRESS)
    const bare = await render(site.page)
    await site.page.evaluate(RESTORE)
    await site.page.setViewport(DESKTOP.width, DESKTOP.height)
    const shift = flatShift(painted, bare)
    const ceiling = Math.ceil(255 * WATERMARK_OPACITY.max)

    assert.ok(shift.changed > 0, `the watermark is invisible at ${MOBILE.width}px`)
    assert.ok(shift.max <= ceiling, `at ${MOBILE.width}px the watermark shifts a pixel by ${shift.max}, past ${ceiling}`)
    assert.ok(shift.mean < ceiling / 2, `at ${MOBILE.width}px the watermark shifts the page by ${shift.mean.toFixed(1)} on average`)
  })
})

describe('Swap task 6: a filename, and nothing else in the changeset', () => {
  it('changes nothing in either stylesheet but the name of the photograph', () => {
    const commit = baselineCommit()
    assert.ok(commit, 'no baseline commit to diff the stylesheets against')

    for (const [sheet] of REFERENCES) {
      const was = baseline(commit, sheet)
      const now = readFileSync(join(repoRoot, sheet), 'utf8')

      assert.ok(now.includes(WATERMARK_IMAGE), `${sheet} does not name ${WATERMARK_IMAGE}`)
      assert.equal(
        now.replaceAll(WATERMARK_IMAGE, WATERMARK_IMAGE_WAS),
        was,
        `${sheet} has a change beyond the filename swap`,
      )
    }
  })

  it('changes no other file the site ships, and adds and removes none', async () => {
    const commit = baselineCommit()
    assert.ok(commit, 'no baseline commit to diff the site against')

    // `package.json` carries the test script, which every job appends its own
    // test file to; it is held to that one line in the next test instead.
    const allowed = new Set([...REFERENCES.map(([sheet]) => sheet), 'package.json'])
    const shipped = new Set(await siteFiles())
    const was = git('ls-tree', '-r', '--name-only', commit)
      .stdout.split('\n')
      .filter((file) => file && !/^(specs|tests|\.github)\//.test(file))
    const changed = []
    for (const file of was) {
      if (allowed.has(file)) continue
      const before = spawnSync('git', ['show', `${commit}:${file}`], { cwd: repoRoot, maxBuffer: 1 << 28 })
      if (before.status !== 0 || !(await readFile(join(repoRoot, file))).equals(before.stdout)) changed.push(file)
    }

    assert.deepEqual(changed, [], `the swap changed ${changed.join(', ')}`)
    assert.deepEqual(was.filter((file) => !shipped.has(file)), [], 'the swap removed a file the site ships')
    assert.deepEqual(
      [...shipped].filter((file) => !was.includes(file)),
      [],
      'the swap added a file to the site',
    )
  })

  it('adds nothing to package.json but this job\'s test file', () => {
    const commit = baselineCommit()
    assert.ok(commit, 'no baseline commit to diff package.json against')

    const was = JSON.parse(baseline(commit, 'package.json'))
    const now = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))

    assert.equal(now.scripts.test, `${was.scripts.test} tests/watermark-swap.test.mjs`)
    assert.deepEqual({ ...now, scripts: null }, { ...was, scripts: null }, 'package.json changed beyond its test script')
  })
})
