// Tests for the faint Wrocław watermark behind every page of the site.
// Plan: specs/aea7c6d4-8f64-4957-8f2d-8392a0fce7cb/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { contrastRatio, openPage, parseColor, serveStatic } from './browser.mjs'
import {
  COLOURS,
  MIN_CONTRAST,
  SERVICES_STYLESHEET,
  STYLESHEET,
  WATERMARK_IMAGE,
  WATERMARK_IMAGE_FILE,
  WATERMARK_IMAGE_WAS,
  WATERMARK_LAYER,
  WATERMARK_NOTES,
  WATERMARK_OPACITY,
  WATERMARK_SCROLL_BELOW,
  declaredValue,
  htmlFiles,
  parseHex,
  read,
  repoRoot,
} from './site.mjs'

/** The two widths every check is made at: a common desktop, and a common phone. */
const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 375, height: 667 }

/** The stylesheet each page links, read off the pages themselves in task 1. */
const stylesheetOf = (html) => html.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1] ?? null

/** Everything the watermark layer resolves to, plus the one declaration it needs from `body`. */
const LAYER = `
  const layer = getComputedStyle(document.body, '::before')
  const body = getComputedStyle(document.body)
  return {
    content: layer.content,
    position: layer.position,
    zIndex: layer.zIndex,
    opacity: layer.opacity,
    display: layer.display,
    backgroundImage: layer.backgroundImage,
    backgroundSize: layer.backgroundSize,
    backgroundPosition: layer.backgroundPosition,
    backgroundRepeat: layer.backgroundRepeat,
    backgroundAttachment: layer.backgroundAttachment,
    pointerEvents: layer.pointerEvents,
    inset: [layer.top, layer.right, layer.bottom, layer.left],
    size: [layer.width, layer.height],
    isolation: body.isolation,
  }
`

/** The box of every element on the page, in document order — the layout baseline. */
const GEOMETRY = `
  return [...document.querySelectorAll('body, body *')].map((el) => {
    const box = el.getBoundingClientRect()
    const name = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
      ? '.' + el.className.trim().split(/\\s+/).join('.')
      : '')
    return [name, box.x, box.y, Math.round(box.width * 100), Math.round(box.height * 100)]
  })
`

/** How wide the document actually is against the viewport it is shown in. */
const OVERFLOW = `
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }
`

/**
 * A point inside the page header that paints nothing but the header's own
 * opaque background: no glyph, no border, no child box, no image. Whatever the
 * watermark does, that pixel has to come out exactly that colour — which is how
 * "behind all content" is checked against the pixels rather than the z-index.
 */
const OPAQUE_HEADER_POINT = `
  const header = document.querySelector('.masthead, .site-header')
  const transparent = (el) => getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)'
  const box = header.getBoundingClientRect()
  const clean = (el) => {
    if (el !== header && !header.contains(el)) return false
    for (let node = el; node !== header; node = node.parentElement) if (!transparent(node)) return false
    if (getComputedStyle(el).display.startsWith('inline')) return false
    return ![...el.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim())
  }
  for (let y = Math.round(box.top) + 6; y < box.bottom - 6; y += 3) {
    for (let x = Math.round(box.right) - 8; x > box.left + 6; x -= 3) {
      const here = document.elementFromPoint(x, y)
      const around = [[x - 3, y], [x + 3, y], [x, y - 3], [x, y + 3]]
      if (here && clean(here) && around.every(([px, py]) => document.elementFromPoint(px, py) === here)) {
        return { x, y, colour: getComputedStyle(header).backgroundColor }
      }
    }
  }
  return null
`

/** Hides the watermark layer, or puts it back — the "before this job" rendering. */
const SUPPRESS = `
  const style = document.createElement('style')
  style.id = 'no-watermark'
  style.textContent = 'body::before { display: none !important; }'
  document.head.append(style)
  return true
`
const RESTORE = `document.getElementById('no-watermark')?.remove(); return true`

/**
 * Waits for the fonts and every image on the page to finish, then for two
 * frames — otherwise one screenshot can catch a photograph a beat before the
 * next one does and the comparison reads that as the watermark.
 */
const SETTLED = `
  return Promise.all([
    document.fonts.ready,
    ...[...document.images].map((image) => image.decode().catch(() => {})),
  ]).then(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)))
  }))
`

/** The page as it paints once it has settled. */
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
 * How far apart two renderings of the same page are, measured only where the
 * second one is flat colour. Anti-aliased edges are left out on purpose: a
 * translucent layer under the page costs Chrome its sub-pixel text
 * anti-aliasing, so every glyph edge comes out a shade different whether the
 * layer paints anything or not. See the notes' "Flagged for the reviewer".
 */
const flatDiff = (a, b) => {
  assert.equal(a.pixels.length, b.pixels.length, 'the two renderings are different sizes')
  let changed = 0
  let flat = 0
  let max = 0
  let total = 0
  for (let y = 2; y < b.height - 2; y++) {
    for (let x = 2; x < b.width - 2; x++) {
      if (!flatAt(b, x, y)) continue
      flat++
      const here = a.pixelAt(x, y)
      const there = b.pixelAt(x, y)
      const delta = Math.max(
        Math.abs(here.r - there.r),
        Math.abs(here.g - there.g),
        Math.abs(here.b - there.b),
      )
      if (delta) changed++
      if (delta > max) max = delta
      total += delta
    }
  }
  return { changed, max, flat, mean: total / flat }
}

/** The colour `source` comes out as once `layer` is painted over it at `opacity`. */
const blend = (source, layer, opacity) => ({
  r: source.r * (1 - opacity) + layer.r * opacity,
  g: source.g * (1 - opacity) + layer.g * opacity,
  b: source.b * (1 - opacity) + layer.b * opacity,
})

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

describe('Watermark task 1: the pages, and the stylesheets that reach all of them', () => {
  /** The section of the notes under the given `## n. Heading`, up to the next heading. */
  const section = async (heading) => {
    const notes = await read(WATERMARK_NOTES)
    return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
  }

  it('finds no shared template: every page links its stylesheet itself', async () => {
    const pages = await htmlFiles()

    assert.ok(pages.length >= 3, 'fewer than three pages to trace')
    for (const page of pages) {
      const sheet = stylesheetOf(await read(page))
      assert.ok(
        [SERVICES_STYLESHEET, STYLESHEET].includes(sheet),
        `${page} links ${sheet}, which is neither of the site's two stylesheets`,
      )
    }
  })

  it('reaches every page through those two stylesheets and no third one', async () => {
    const pages = await htmlFiles()
    const reached = new Map()
    for (const page of pages) reached.set(page, stylesheetOf(await read(page)))

    for (const sheet of [SERVICES_STYLESHEET, STYLESHEET]) {
      assert.ok([...reached.values()].includes(sheet), `no page links ${sheet}`)
    }
    assert.equal(new Set(reached.values()).size, 2, `the site is styled from ${new Set(reached.values()).size} sheets`)
  })

  it('writes the traced pages and the two stylesheets down in the notes', async () => {
    const discovery = await section('Discovery')

    assert.ok(discovery, `${WATERMARK_NOTES} has no "Discovery" section`)
    // The photograph this job traced, under the name it had then: the swap to
    // `Wroclaw1.jpg` came later, and is written up in its own notes.
    for (const file of [...(await htmlFiles()), SERVICES_STYLESHEET, STYLESHEET, WATERMARK_IMAGE_WAS]) {
      assert.ok(discovery.includes(file), `the discovery notes do not name ${file}`)
    }
  })

  it('settles the spec\'s open questions: no template, no build step, no script', async () => {
    const discovery = await section('Discovery')

    assert.match(discovery, /no (shared )?(layout|template)|no template engine/i, 'the notes do not settle the template question')
    assert.match(discovery, /no build step/i, 'the notes do not settle whether there is a build step')
    assert.match(discovery, /body::before|pseudo-element/i, 'the notes do not record which hook the watermark takes')
  })
})

describe('Watermark task 2: the image, at the path it already sits on', () => {
  const site = servedInBrowser()

  it('leaves the file itself untouched — same bytes, same pixels', async () => {
    const bytes = await readFile(join(repoRoot, WATERMARK_IMAGE))

    assert.equal(bytes.length, WATERMARK_IMAGE_FILE.bytes, `${WATERMARK_IMAGE} is no longer the file that was committed`)
    assert.equal(bytes.readUInt16BE(0), 0xffd8, `${WATERMARK_IMAGE} is no longer a JPEG`)
  })

  it('is referenced from both stylesheets at a path that resolves to it', async () => {
    for (const [sheet, url] of [
      [SERVICES_STYLESHEET, `../${WATERMARK_IMAGE}`],
      [STYLESHEET, WATERMARK_IMAGE],
    ]) {
      const css = await read(sheet)
      const declared = declaredValue(css, [WATERMARK_LAYER], 'background-image')

      assert.ok(declared, `${sheet} never sets a background-image on ${WATERMARK_LAYER}`)
      assert.equal(declared, `url('${url}')`, `${sheet} points the watermark at ${declared}`)
    }
  })

  it('is fetched once per page, and served', async () => {
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
      assert.ok(
        site.page.requests.some((url) => url.endsWith(`/${WATERMARK_IMAGE}`)),
        `${page} never requested ${WATERMARK_IMAGE}`,
      )
    }
  })
})

describe('Watermark task 3: the layer itself, on every page, behind everything', () => {
  const site = servedInBrowser()

  it('paints the same layer on every page of the site', async () => {
    let first = null
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      const layer = await site.page.evaluate(LAYER)

      assert.equal(layer.content, '""', `${page} has no watermark layer`)
      assert.equal(layer.position, 'fixed', `${page} paints the watermark ${layer.position}`)
      assert.equal(layer.zIndex, '-1', `${page} stacks the watermark at ${layer.zIndex}`)
      assert.equal(layer.backgroundSize, 'cover', `${page} sizes the watermark ${layer.backgroundSize}`)
      assert.equal(layer.backgroundPosition, '50% 50%', `${page} positions the watermark ${layer.backgroundPosition}`)
      assert.equal(layer.backgroundRepeat, 'no-repeat', `${page} repeats the watermark`)
      assert.equal(layer.pointerEvents, 'none', `${page} lets the watermark take the pointer`)
      assert.deepEqual(layer.inset, Array(4).fill('0px'), `${page} insets the watermark ${layer.inset.join(', ')}`)
      assert.match(layer.backgroundImage, new RegExp(`${WATERMARK_IMAGE}"?\\)$`), `${page} draws ${layer.backgroundImage}`)
      assert.equal(layer.isolation, 'isolate', `${page} never puts the watermark above the body's own background`)

      first ??= layer
      assert.deepEqual(layer, first, `${page} paints a different watermark than the first page does`)
    }
  })

  it('covers the viewport exactly, at desktop and at phone width', async () => {
    for (const { width, height } of [DESKTOP, MOBILE]) {
      await site.page.setViewport(width, height)
      await site.page.goto(site.url('index.html'))
      const layer = await site.page.evaluate(LAYER)

      assert.deepEqual(layer.size, [`${width}px`, `${height}px`], `at ${width}px the layer is ${layer.size.join(' × ')}`)
    }
    await site.page.setViewport(DESKTOP.width, DESKTOP.height)
  })

  it('is actually visible: blocking the image changes what the page paints', async () => {
    const painted = {}
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      painted[page] = await render(site.page)
    }

    await site.page.blockUrls([`*${WATERMARK_IMAGE}`])
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      const bare = await render(site.page)
      const diff = flatDiff(painted[page], bare)

      assert.ok(diff.changed > 0, `${page} paints nothing for the watermark`)
      assert.ok(
        diff.changed / diff.flat > 0.05,
        `${page} shows the watermark on only ${((diff.changed / diff.flat) * 100).toFixed(2)}% of its flat pixels`,
      )
    }
    await site.page.blockUrls([])
  })

  it('never paints over content: an opaque header pixel keeps its own colour', async () => {
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      const spot = await site.page.evaluate(OPAQUE_HEADER_POINT)
      assert.ok(spot, `${page} has no header pixel to read`)

      const shot = await render(site.page)
      const pixel = shot.pixelAt(spot.x, spot.y)
      const own = parseColor(spot.colour)

      assert.deepEqual(
        [pixel.r, pixel.g, pixel.b],
        [own.r, own.g, own.b],
        `${page} paints ${JSON.stringify(pixel)} where its header's own ${spot.colour} should be`,
      )
    }
  })

  it('does not intercept clicks: every link and button still takes its own pointer', async () => {
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      const blocked = await site.page.evaluate(`
        return [...document.querySelectorAll('a[href], button')]
          .map((el) => ({ el, box: el.getBoundingClientRect() }))
          .filter(({ box }) => box.width && box.height && box.top >= 0 && box.bottom <= window.innerHeight)
          .filter(({ el, box }) => {
            const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
            return !(hit && (hit === el || el.contains(hit) || hit.contains(el)))
          })
          .map(({ el }) => el.outerHTML.slice(0, 80))
      `)

      assert.deepEqual(blocked, [], `${page} has interactive elements the watermark sits on top of`)
    }
  })
})

describe('Watermark task 4: fixed on the desktop, scrolling on the phone', () => {
  const site = servedInBrowser()

  it('attaches the watermark fixed at desktop width and scroll below the breakpoint', async () => {
    for (const [width, attachment] of [
      [DESKTOP.width, 'fixed'],
      [1024, 'fixed'],
      [WATERMARK_SCROLL_BELOW, 'fixed'],
      [WATERMARK_SCROLL_BELOW - 1, 'scroll'],
      [MOBILE.width, 'scroll'],
    ]) {
      await site.page.setViewport(width, 800)
      await site.page.goto(site.url('index.html'))
      const layer = await site.page.evaluate(LAYER)

      assert.equal(layer.backgroundAttachment, attachment, `at ${width}px the watermark is attached ${layer.backgroundAttachment}`)
    }
  })

  it('switches at the same width in both stylesheets, through one max-width query', async () => {
    for (const sheet of [SERVICES_STYLESHEET, STYLESHEET]) {
      const css = await read(sheet)
      const query = new RegExp(`@media screen and \\(max-width: ${WATERMARK_SCROLL_BELOW - 1}px\\)`)

      assert.match(css, query, `${sheet} has no phone-width fallback for the watermark`)
      assert.equal(declaredValue(css, [WATERMARK_LAYER], 'background-attachment'), 'scroll')
    }
  })

  it('stays put over a scroll, in either mode', async () => {
    for (const { width, height } of [DESKTOP, MOBILE]) {
      await site.page.setViewport(width, height)
      await site.page.goto(site.url('index.html'))
      const scrolled = await site.page.evaluate(`
        const before = getComputedStyle(document.body, '::before')
        const was = [before.width, before.height]
        window.scrollTo(0, 400)
        const after = getComputedStyle(document.body, '::before')
        return { was, now: [after.width, after.height], offset: window.scrollY }
      `)

      assert.ok(scrolled.offset > 0, `the page does not scroll at ${width}px`)
      assert.deepEqual(scrolled.now, scrolled.was, `the watermark resized on scroll at ${width}px`)
      assert.deepEqual(scrolled.now, [`${width}px`, `${height}px`], `the watermark left the viewport at ${width}px`)
    }
    await site.page.setViewport(DESKTOP.width, DESKTOP.height)
  })
})

describe('Watermark task 5: nothing moved, nothing overflows, nothing is stretched', () => {
  const site = servedInBrowser()

  it('leaves every box on every page exactly where it was, at both widths', async () => {
    for (const { width, height } of [DESKTOP, MOBILE]) {
      await site.page.setViewport(width, height)
      for (const page of await htmlFiles()) {
        await site.page.goto(site.url(page))
        const withLayer = await site.page.evaluate(GEOMETRY)
        await site.page.evaluate(SUPPRESS)
        const without = await site.page.evaluate(GEOMETRY)
        await site.page.evaluate(RESTORE)

        assert.deepEqual(withLayer, without, `${page} lays out differently with the watermark at ${width}px`)
      }
    }
    await site.page.setViewport(DESKTOP.width, DESKTOP.height)
  })

  it('adds no horizontal scrollbar at either width', async () => {
    for (const { width, height } of [DESKTOP, MOBILE]) {
      await site.page.setViewport(width, height)
      for (const page of await htmlFiles()) {
        await site.page.goto(site.url(page))
        const overflow = await site.page.evaluate(OVERFLOW)

        assert.ok(
          overflow.scrollWidth <= overflow.innerWidth,
          `${page} is ${overflow.scrollWidth}px wide in a ${overflow.innerWidth}px viewport`,
        )
      }
    }
    await site.page.setViewport(DESKTOP.width, DESKTOP.height)
  })

  it('crops rather than distorts: the image keeps its aspect ratio at every width', async () => {
    for (const sheet of [SERVICES_STYLESHEET, STYLESHEET]) {
      assert.equal(declaredValue(await read(sheet), [WATERMARK_LAYER], 'background-size'), 'cover')
    }
    for (const { width, height } of [DESKTOP, MOBILE, { width: 1024, height: 768 }]) {
      await site.page.setViewport(width, height)
      await site.page.goto(site.url('index.html'))
      const layer = await site.page.evaluate(LAYER)

      assert.equal(layer.backgroundSize, 'cover', `at ${width}px the watermark is sized ${layer.backgroundSize}`)
      assert.deepEqual(layer.size, [`${width}px`, `${height}px`], `at ${width}px the layer is ${layer.size.join(' × ')}`)
    }
    await site.page.setViewport(DESKTOP.width, DESKTOP.height)
  })
})

describe('Watermark task 6: the image gone, and the page none the worse', () => {
  const site = servedInBrowser()

  it('carries the watermark in CSS alone, so there is no image to break', async () => {
    for (const page of await htmlFiles()) {
      const html = await read(page)

      assert.doesNotMatch(html, new RegExp(`<img[^>]*${WATERMARK_IMAGE}`, 'i'), `${page} renders the watermark as an <img>`)
      assert.ok(!html.includes(WATERMARK_IMAGE), `${page} names ${WATERMARK_IMAGE} in its markup`)
    }
  })

  it('renders exactly as it would with the layer hidden when the image cannot be fetched', async () => {
    await site.page.goto(site.url('index.html'))
    const painted = await render(site.page)
    await site.page.evaluate(SUPPRESS)
    const suppressed = await render(site.page)
    const geometry = await site.page.evaluate(GEOMETRY)
    assert.ok(flatDiff(painted, suppressed).changed > 0, 'the page paints no watermark to lose in the first place')

    await site.page.blockUrls([`*${WATERMARK_IMAGE}`])
    await site.page.goto(site.url('index.html'))
    const broken = await render(site.page)
    const brokenGeometry = await site.page.evaluate(GEOMETRY)
    await site.page.blockUrls([])

    assert.deepEqual(brokenGeometry, geometry, 'the page moves when the watermark image is missing')
    assert.equal(flatDiff(broken, suppressed).changed, 0, 'a missing watermark image leaves something on the page')
  })

  it('raises nothing at the user: no exception, no console error of its own', async () => {
    await site.page.blockUrls([`*${WATERMARK_IMAGE}`])
    const fresh = await openPage(site.url('contact-us.html'))
    try {
      await fresh.blockUrls([`*${WATERMARK_IMAGE}`])
      await fresh.goto(site.url('contact-us.html'))

      assert.deepEqual(fresh.pageErrors, [], 'a missing watermark image threw')
      const noise = fresh.consoleMessages.filter((message) => !message.text.includes(WATERMARK_IMAGE))
      assert.deepEqual(noise, [], `the page logged ${JSON.stringify(noise)}`)
    } finally {
      await fresh.close()
      await site.page.blockUrls([])
    }
  })
})

describe('Watermark task 7: faint enough to read through, on light and on dark', () => {
  const site = servedInBrowser()

  it('sets the faintness once per stylesheet, inside the range the spec allows', async () => {
    for (const sheet of [SERVICES_STYLESHEET, STYLESHEET]) {
      const opacity = Number(declaredValue(await read(sheet), [WATERMARK_LAYER], 'opacity'))

      assert.ok(
        opacity >= WATERMARK_OPACITY.min && opacity <= WATERMARK_OPACITY.max,
        `${sheet} paints the watermark at ${opacity}, outside ${WATERMARK_OPACITY.min}–${WATERMARK_OPACITY.max}`,
      )
    }
  })

  // Every body-size colour the two page sets set text in, held to AA against the
  // worst the photograph could possibly be behind it — a pixel of pure black or
  // of pure white — at the faintness its own sheet declares. The light page and
  // the dark page the plan asks for are the first and the last two rows.
  it('cannot take body text below AA on either page, however dark or light the photograph runs', async () => {
    const worstCase = [
      { page: 'index.html', sheet: SERVICES_STYLESHEET, text: '#1a1a1a', background: '#ffffff' },
      { page: 'index.html', sheet: SERVICES_STYLESHEET, text: '#4a4a4a', background: '#ffffff' },
      { page: 'about.html', sheet: STYLESHEET, text: COLOURS.gold, background: COLOURS.darkGrey },
      { page: 'about.html', sheet: STYLESHEET, text: COLOURS.orange, background: COLOURS.darkGrey },
    ]

    for (const { page, sheet, text, background } of worstCase) {
      const opacity = Number(declaredValue(await read(sheet), [WATERMARK_LAYER], 'opacity'))
      for (const extreme of [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }]) {
        const behind = blend(parseHex(background), extreme, opacity)
        const ratio = contrastRatio(parseHex(text), behind)

        assert.ok(
          ratio >= MIN_CONTRAST,
          `on ${page}, ${text} on ${background} falls to ${ratio.toFixed(2)}:1 over the watermark`,
        )
      }
    }
  })

  it('shifts no flat pixel of a page by more than the faintness it is allowed', async () => {
    const ceiling = Math.ceil(255 * WATERMARK_OPACITY.max)
    for (const page of ['index.html', 'about.html']) {
      await site.page.goto(site.url(page))
      const painted = await render(site.page)
      await site.page.evaluate(SUPPRESS)
      const bare = await render(site.page)
      await site.page.evaluate(RESTORE)
      const diff = flatDiff(painted, bare)

      assert.ok(diff.changed > 0, `the watermark is invisible on ${page}`)
      assert.ok(diff.max <= ceiling, `the watermark shifts a pixel of ${page} by ${diff.max}, past ${ceiling}`)
      assert.ok(diff.mean < ceiling / 2, `the watermark shifts ${page} by ${diff.mean.toFixed(1)} on average`)
    }
  })
})

describe('Watermark task 8: nothing of it reaches the printed page', () => {
  const site = servedInBrowser()

  it('leaves both stylesheets without a print block, as it found them', async () => {
    for (const sheet of [SERVICES_STYLESHEET, STYLESHEET]) {
      assert.doesNotMatch(await read(sheet), /@media\s+print/, `${sheet} now carries a print stylesheet`)
    }
  })

  it('scopes the watermark to the screen in both stylesheets', async () => {
    for (const sheet of [SERVICES_STYLESHEET, STYLESHEET]) {
      const css = await read(sheet)
      const block = css.slice(css.indexOf('@media screen'))

      assert.ok(css.includes('@media screen'), `${sheet} does not scope the watermark to the screen`)
      assert.ok(block.includes(WATERMARK_LAYER), `${sheet} declares ${WATERMARK_LAYER} outside its @media screen block`)
      assert.equal(
        css.slice(0, css.indexOf('@media screen')).includes(WATERMARK_LAYER),
        false,
        `${sheet} declares ${WATERMARK_LAYER} before the screen scope`,
      )
    }
  })

  it('drops the layer entirely when the page is printed', async () => {
    for (const page of await htmlFiles()) {
      await site.page.goto(site.url(page))
      await site.page.emulateMedia('print')
      const printed = await site.page.evaluate(LAYER)
      await site.page.emulateMedia('screen')
      const shown = await site.page.evaluate(LAYER)

      assert.equal(printed.content, 'none', `${page} still carries the watermark layer in print`)
      assert.equal(printed.backgroundImage, 'none', `${page} still fetches the watermark in print`)
      assert.equal(shown.content, '""', `${page} lost the watermark on screen`)
    }
    await site.page.emulateMedia('')
  })
})
