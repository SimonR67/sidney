// Tests for the "WHERE WE'VE COME FROM" band's 50/50 layout: its copy on the
// left, Sofia.jpg on the right, framed the way the "C-Suite Advisory" box is.
// Plan: specs/1416c200-4729-4c71-8e75-e674bd0519d5/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { openPage, parseColor, serveStatic } from './browser.mjs'
import {
  CARD_FRAME,
  FRAME_SOURCE,
  HOMEPAGE,
  ORIGIN_ANCHOR,
  ORIGIN_HEADING,
  ORIGIN_IMAGE,
  ORIGIN_IMAGE_NOTES,
  ORIGIN_IMAGE_SIZE,
  ORIGIN_PARAGRAPHS,
  SERVICES_STYLESHEET,
  parseHex,
  read,
  repoRoot,
  rules,
  siteFiles,
  textOf,
} from './site.mjs'

/** The two columns' classes: the copy on the left, the framed photograph on the right. */
const TEXT_COLUMN = '.origin__text'
const IMAGE_COLUMN = '.origin__image'

/** The widths the two-column layout is asserted at, and the ones it stacks at. */
const WIDE = [1440, 1024, 768]
const NARROW = [414, 375]

/**
 * Serves the repo and opens one headless-Chrome page on the home page for the
 * enclosing suite. `page`/`url` are filled in by the time tests run.
 */
const servedInBrowser = () => {
  const handle = {}
  before(async () => {
    handle.server = await serveStatic(repoRoot)
    handle.origin = handle.server.origin
    handle.url = `${handle.origin}/${HOMEPAGE}`
    handle.page = await openPage(handle.url)
  })
  after(async () => {
    await handle.page?.close()
    await handle.server?.close()
  })
  return handle
}

/** The section of the notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(ORIGIN_IMAGE_NOTES).catch(() => '')
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

/** The band, its two columns and the photograph inside, measured as the browser lays them out. */
const LAYOUT = `
  const box = (el) => {
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return {
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    }
  }
  const section = document.querySelector('#${ORIGIN_ANCHOR}')
  const text = section.querySelector('${TEXT_COLUMN}')
  const image = section.querySelector('${IMAGE_COLUMN}')
  const photo = image && image.querySelector('img')
  return {
    container: box(section.querySelector('.container')),
    text: box(text),
    image: box(image),
    photo: box(photo),
    natural: photo ? { width: photo.naturalWidth, height: photo.naturalHeight } : null,
    complete: photo ? photo.complete : null,
    viewport: window.innerWidth,
    pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }
`

/** The four-sided border of the photograph and of the "C-Suite Advisory" box, side by side. */
const FRAMES = `
  const of = (el) => {
    if (!el) return null
    const style = getComputedStyle(el)
    const sides = ['Top', 'Right', 'Bottom', 'Left']
    const corners = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']
    return {
      width: sides.map((side) => style['border' + side + 'Width']).join('|'),
      style: sides.map((side) => style['border' + side + 'Style']).join('|'),
      color: sides.map((side) => style['border' + side + 'Color']).join('|'),
      radius: corners.map((corner) => style['border' + corner + 'Radius']).join('|'),
    }
  }
  const card = [...document.querySelectorAll('#services .card')]
    .find((el) => el.querySelector('.card__title').textContent.trim() === ${JSON.stringify(FRAME_SOURCE.box)})
  const photo = document.querySelector('#${ORIGIN_ANCHOR} ${IMAGE_COLUMN} img')
  return { card: of(card), photo: of(photo) }
`

/** A fresh load at the given width; the query keeps every navigation a cross-document one. */
let loads = 0
const freshLoad = async (site, width, height = 900) => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}`)
}

/** `ref`'s copy of `file`, or `null` when the ref is missing from this checkout. */
const atBaseline = (ref, file) => {
  const exists = spawnSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], { cwd: repoRoot })
  if (exists.status !== 0) return null
  const show = spawnSync('git', ['show', `${ref}:${file}`], { cwd: repoRoot, encoding: 'utf8' })
  return show.status === 0 ? show.stdout : null
}

describe('Image task 1: the "C-Suite Advisory" frame, read off the box and written down', () => {
  const site = servedInBrowser()

  it('records the three values, and where they come from', async () => {
    const frame = await notesSection('The frame')

    assert.ok(frame, `${ORIGIN_IMAGE_NOTES} has no "The frame" section`)
    assert.match(frame, /`\.card`/, 'the notes do not name the class the box takes its border from')
    assert.match(frame, /border-radius:\s*10px/, 'the notes do not record the corner radius')
    assert.match(frame, /1px solid/, 'the notes do not record the border width and style')
    assert.match(frame, /--papaya/, 'the notes do not record the custom property the papaya is declared under')
    assert.ok(frame.includes(CARD_FRAME.colour), `the notes do not record the papaya as ${CARD_FRAME.colour}`)
    assert.match(
      frame,
      /nth-child/,
      'the notes do not record how the box gets its papaya rather than the default line colour',
    )
    assert.match(frame, /class(es)? rather than inline|not inline|no inline/i, 'the notes do not settle class vs inline')
  })

  it('states whether the frame could be shared, and flags the duplication if not', async () => {
    const frame = await notesSection('The frame')

    assert.match(frame, /duplicat/i, 'the notes do not say whether the values had to be duplicated')
    assert.ok(
      frame.includes(FRAME_SOURCE.section) || frame.includes('services'),
      'the notes do not say which section the frame is read from',
    )
  })

  it('reads those recorded values back off the rendered box, so the record is true', async () => {
    const frames = await site.page.evaluate(FRAMES)
    const { width, style, radius } = CARD_FRAME

    assert.ok(frames.card, `no box on the page is titled "${FRAME_SOURCE.box}"`)
    assert.equal(frames.card.width, Array(4).fill(width).join('|'))
    assert.equal(frames.card.style, Array(4).fill(style).join('|'))
    assert.equal(frames.card.radius, Array(4).fill(radius).join('|'))
    for (const colour of frames.card.color.split('|')) {
      assert.deepEqual(parseColor(colour), parseHex(CARD_FRAME.colour), `the box's border is ${colour}`)
    }
  })

  it('leaves the papaya declared exactly once, as a custom property', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const declarations = rules(css).filter((rule) => rule.declarations['--papaya'])

    assert.equal(declarations.length, 1, 'the papaya is declared in more than one place')
    assert.deepEqual(declarations[0].selectors, [':root'])
    assert.equal(declarations[0].declarations['--papaya'], CARD_FRAME.colour)
  })
})

describe(`Image task 2: ${ORIGIN_IMAGE}, at the path it already sits on`, () => {
  const site = servedInBrowser()

  it('finds it in the repository, and records the path the markup points at', async () => {
    const path = await notesSection('The photograph')

    assert.ok((await siteFiles()).includes(ORIGIN_IMAGE), `${ORIGIN_IMAGE} is not part of the site`)
    assert.ok(path, `${ORIGIN_IMAGE_NOTES} has no "The photograph" section`)
    assert.ok(path.includes(ORIGIN_IMAGE), `the notes do not name ${ORIGIN_IMAGE}`)
    assert.match(path, /repository root|root of the repo/i, 'the notes do not record where the file sits')
    assert.ok(
      path.includes(`${ORIGIN_IMAGE_SIZE.width}`) && path.includes(`${ORIGIN_IMAGE_SIZE.height}`),
      'the notes do not record the intrinsic size the markup reserves space with',
    )
  })

  it('serves it from that path, with no 404 and no redirect', async () => {
    const response = await fetch(`${site.origin}/${ORIGIN_IMAGE}`, { redirect: 'manual' })

    assert.equal(response.status, 200, `${ORIGIN_IMAGE} is not served from the repository root`)
    assert.match(response.headers.get('content-type'), /^image\//, 'it is not served as an image')
    assert.ok((await response.arrayBuffer()).byteLength > 0, `${ORIGIN_IMAGE} is served empty`)
  })

  it('decodes in the browser at its intrinsic size', async () => {
    const layout = await site.page.evaluate(LAYOUT)

    assert.ok(layout.photo, `no <img> renders inside ${IMAGE_COLUMN}`)
    assert.equal(layout.complete, true, `${ORIGIN_IMAGE} never finished loading`)
    assert.deepEqual(layout.natural, ORIGIN_IMAGE_SIZE, `${ORIGIN_IMAGE} decoded to an unexpected size`)
  })

  it('loads it as part of the page, cleanly', async () => {
    assert.ok(
      site.page.requests.some((url) => url.endsWith(`/${ORIGIN_IMAGE}`)),
      `the page never requested ${ORIGIN_IMAGE}`,
    )
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
  })
})

describe('Image task 3: the band split into a copy column and an image column', () => {
  const site = servedInBrowser()

  it('wraps the two paragraphs, unchanged, in the copy column', async () => {
    const copy = await site.page.evaluate(`
      const text = document.querySelector('#${ORIGIN_ANCHOR} ${TEXT_COLUMN}')
      return text && {
        paragraphs: [...text.querySelectorAll('p')].map((p) => p.textContent.replace(/\\s+/g, ' ').trim()),
        classes: [...text.querySelectorAll('p')].map((p) => [...p.classList].join('.')),
        sectionParagraphs: document.querySelectorAll('#${ORIGIN_ANCHOR} p').length,
      }
    `)

    assert.ok(copy, `the band has no ${TEXT_COLUMN} column`)
    assert.deepEqual(copy.paragraphs, ORIGIN_PARAGRAPHS)
    assert.deepEqual(copy.classes, ['origin__copy', 'origin__copy'])
    assert.equal(copy.sectionParagraphs, 2, 'the band gained a paragraph outside the copy column')
  })

  it('puts the photograph in the image column, with an alt attribute that describes it', async () => {
    const image = await site.page.evaluate(`
      const column = document.querySelector('#${ORIGIN_ANCHOR} ${IMAGE_COLUMN}')
      const photo = column && column.querySelector('img')
      return photo && {
        src: photo.getAttribute('src'),
        alt: photo.getAttribute('alt'),
        width: photo.getAttribute('width'),
        height: photo.getAttribute('height'),
        images: document.querySelectorAll('#${ORIGIN_ANCHOR} img').length,
      }
    `)

    assert.ok(image, `the band has no <img> inside ${IMAGE_COLUMN}`)
    assert.equal(image.src, ORIGIN_IMAGE, `the photograph points at ${image.src}`)
    assert.ok(image.alt && image.alt.trim().length > 10, `the photograph's alt text is "${image.alt}"`)
    assert.match(image.alt, /Sofia/i, 'the alt text does not say what the photograph shows')
    assert.equal(image.width, `${ORIGIN_IMAGE_SIZE.width}`, 'the photograph reserves no intrinsic width')
    assert.equal(image.height, `${ORIGIN_IMAGE_SIZE.height}`, 'the photograph reserves no intrinsic height')
    assert.equal(image.images, 1, 'the band carries more than one image')
  })

  it('keeps the band wrapped in one .container, labelled by its own heading', async () => {
    const shape = await site.page.evaluate(`
      const section = document.querySelector('#${ORIGIN_ANCHOR}')
      const heading = section.querySelector('.section__heading')
      const split = section.querySelector('${TEXT_COLUMN}').parentElement
      return {
        children: [...section.children].map((el) => el.tagName.toLowerCase() + '.' + [...el.classList].join('.')),
        headingParent: [...heading.parentElement.classList],
        headingText: heading.textContent.trim(),
        labelledBy: section.getAttribute('aria-labelledby'),
        headingId: heading.id,
        columns: [...split.children].map((el) => [...el.classList].join('.')),
        splitInContainer: [...split.parentElement.classList].includes('container'),
        subHeadings: section.querySelectorAll('h3').length,
      }
    `)

    assert.deepEqual(shape.children, ['div.container'], 'the band no longer wraps its content in one .container')
    assert.deepEqual(shape.headingParent, ['container'], 'the heading moved out of the container')
    assert.equal(shape.headingText, ORIGIN_HEADING)
    assert.equal(shape.labelledBy, shape.headingId, 'the band is no longer labelled by its own heading')
    assert.equal(shape.subHeadings, 0, 'the band introduces an <h3>, which the service cards own')
    assert.equal(shape.splitInContainer, true, 'the two columns sit outside the band container')
    assert.deepEqual(shape.columns, ['origin__text', 'origin__image'], 'the copy does not come first in the markup')
  })

  it('adds no inline style and no new shade for either column', async () => {
    const html = await read(HOMEPAGE)
    const css = await read(SERVICES_STYLESHEET)
    const origin = css.split(/^\.origin\b/m).slice(1).join('')

    assert.doesNotMatch(html, /style="/, `${HOMEPAGE} carries an inline style`)
    assert.doesNotMatch(origin, /#[0-9a-f]{3,8}\b/i, `${SERVICES_STYLESHEET} hardcodes a shade for the new columns`)
  })
})

describe('Image task 4: two columns of the same width, with a gap between them', () => {
  const site = servedInBrowser()

  for (const width of WIDE) {
    it(`splits the band roughly 50/50 at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)
      const widest = Math.max(layout.text.width, layout.image.width)
      const drift = Math.abs(layout.text.width - layout.image.width) / widest

      assert.ok(drift <= 0.1, `the columns are ${layout.text.width}px and ${layout.image.width}px at ${width}px`)
      assert.ok(layout.text.left < layout.image.left, `the photograph renders left of the copy at ${width}px`)
      assert.ok(layout.text.top === layout.image.top, `the columns start ${layout.text.top - layout.image.top}px apart`)
    })

    it(`keeps a visible gap between them at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)
      const gap = layout.image.left - layout.text.right

      assert.ok(gap >= 16, `the columns are ${gap}px apart at ${width}px`)
      assert.ok(layout.text.left >= layout.container.left, 'the copy column runs outside the band container')
      assert.ok(layout.image.right <= layout.container.right, 'the image column runs outside the band container')
      assert.equal(layout.pageOverflow, 0, `the page overflows by ${layout.pageOverflow}px at ${width}px`)
    })
  }

  it('takes the split from a grid on the wrapper, not from a width on either column', async () => {
    await freshLoad(site, 1440)
    const layout = await site.page.evaluate(`
      const split = document.querySelector('#${ORIGIN_ANCHOR} ${TEXT_COLUMN}').parentElement
      const style = getComputedStyle(split)
      return {
        display: style.display,
        columns: style.gridTemplateColumns.split(' ').map((value) => Math.round(parseFloat(value))),
        gap: Math.round(parseFloat(style.columnGap)),
      }
    `)

    assert.equal(layout.display, 'grid')
    assert.equal(layout.columns.length, 2, `the wrapper lays out ${layout.columns.length} columns at 1440px`)
    assert.equal(layout.columns[0], layout.columns[1], 'the two grid tracks are different widths')
    assert.ok(layout.gap >= 16, `the grid gap is ${layout.gap}px`)
  })
})

describe(`Image task 5: the photograph framed exactly as the "${FRAME_SOURCE.box}" box is`, () => {
  const site = servedInBrowser()

  it('gives it the same border width, style, colour and corner radius, side by side', async () => {
    const frames = await site.page.evaluate(FRAMES)

    assert.ok(frames.photo, 'the photograph has no border to compare')
    assert.deepEqual(frames.photo, frames.card)
  })

  it('and those are the recorded papaya, 1px solid and 10px radius', async () => {
    const frames = await site.page.evaluate(FRAMES)

    assert.equal(frames.photo.width, Array(4).fill(CARD_FRAME.width).join('|'))
    assert.equal(frames.photo.style, Array(4).fill(CARD_FRAME.style).join('|'))
    assert.equal(frames.photo.radius, Array(4).fill(CARD_FRAME.radius).join('|'))
    for (const colour of frames.photo.color.split('|')) {
      assert.deepEqual(parseColor(colour), parseHex(CARD_FRAME.colour), `the photograph's border is ${colour}`)
    }
  })

  it('takes the papaya from the custom property rather than from a second literal', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const photo = rules(css).filter((rule) => rule.selectors.some((selector) => selector.includes('origin__')))

    assert.ok(photo.length > 0, `${SERVICES_STYLESHEET} declares no rules for the new columns`)
    const border = photo.map((rule) => rule.declarations.border).filter(Boolean).join(' ')
    assert.match(border, /var\(--papaya\)/, 'the photograph does not take its papaya from --papaya')
  })
})

describe('Image task 6: the photograph scaling inside its column', () => {
  const site = servedInBrowser()

  for (const width of [...WIDE, ...NARROW]) {
    it(`fits its column without overflowing or distorting at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)
      const rendered = layout.photo.width / layout.photo.height
      const intrinsic = ORIGIN_IMAGE_SIZE.width / ORIGIN_IMAGE_SIZE.height

      assert.ok(layout.photo.width > 0 && layout.photo.height > 0, `the photograph renders 0×0 at ${width}px`)
      assert.ok(
        layout.photo.width <= layout.image.width + 1,
        `the photograph is ${layout.photo.width}px inside a ${layout.image.width}px column at ${width}px`,
      )
      assert.ok(layout.photo.left >= 0 && layout.photo.right <= layout.viewport, `it runs off screen at ${width}px`)
      assert.ok(
        Math.abs(rendered - intrinsic) < 0.02,
        `it renders at ${rendered.toFixed(3)} against an intrinsic ${intrinsic.toFixed(3)} at ${width}px`,
      )
      assert.equal(layout.pageOverflow, 0, `the page overflows by ${layout.pageOverflow}px at ${width}px`)
    })
  }

  it('carries visual weight comparable to the copy beside it on a wide screen', async () => {
    await freshLoad(site, 1440)
    const layout = await site.page.evaluate(LAYOUT)
    const ratio = layout.photo.height / layout.text.height

    assert.ok(ratio >= 0.5 && ratio <= 1.5, `the photograph is ${layout.photo.height}px to the copy's ${layout.text.height}px`)
  })

  it('scales with its column rather than at a fixed size', async () => {
    await freshLoad(site, 1440)
    const wide = await site.page.evaluate(LAYOUT)
    await freshLoad(site, 375)
    const narrow = await site.page.evaluate(LAYOUT)

    assert.ok(narrow.photo.width < wide.photo.width, 'the photograph renders the same width at 375px as at 1440px')
  })
})

describe('Image task 7: the columns stacked on a narrow screen, copy first', () => {
  const site = servedInBrowser()

  for (const width of NARROW) {
    it(`stacks the copy above the photograph at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)

      assert.ok(
        layout.text.bottom <= layout.image.top,
        `the photograph overlaps the copy by ${layout.text.bottom - layout.image.top}px at ${width}px`,
      )
      assert.equal(layout.text.left, layout.image.left, `the two columns start at different edges at ${width}px`)
      assert.equal(layout.text.width, layout.image.width, `the two columns are different widths at ${width}px`)
    })

    it(`spans the photograph across the column and keeps its frame whole at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)
      const frame = await site.page.evaluate(`
        const photo = document.querySelector('#${ORIGIN_ANCHOR} ${IMAGE_COLUMN} img')
        const style = getComputedStyle(photo)
        const rect = photo.getBoundingClientRect()
        const next = document.querySelector('#${ORIGIN_ANCHOR}').nextElementSibling.getBoundingClientRect()
        return {
          radius: style.borderTopLeftRadius,
          width: style.borderTopWidth,
          colour: style.borderTopColor,
          overflow: style.overflow,
          clearsNextBand: Math.round(next.top - rect.bottom),
        }
      `)

      assert.ok(
        layout.photo.width >= Math.round(layout.container.width * 0.85),
        `the photograph is ${layout.photo.width}px across a ${layout.container.width}px band at ${width}px`,
      )
      assert.equal(frame.radius, CARD_FRAME.radius, `the corners are ${frame.radius} at ${width}px`)
      assert.equal(frame.width, CARD_FRAME.width, `the border is ${frame.width} at ${width}px`)
      assert.deepEqual(parseColor(frame.colour), parseHex(CARD_FRAME.colour))
      assert.ok(frame.clearsNextBand >= 0, `the photograph runs ${-frame.clearsNextBand}px into the next band`)
    })
  }

  it('stacks below the breakpoint and pairs up above it, and nowhere in between', async () => {
    const stacked = []
    for (const width of [375, 414, 600, 767, 768, 1024, 1440]) {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)
      stacked.push({ width, stacked: layout.text.bottom <= layout.image.top })
    }

    assert.deepEqual(stacked, [
      { width: 375, stacked: true },
      { width: 414, stacked: true },
      { width: 600, stacked: true },
      { width: 767, stacked: true },
      { width: 768, stacked: false },
      { width: 1024, stacked: false },
      { width: 1440, stacked: false },
    ])
  })
})

describe('Image task 8: the band with the photograph missing', () => {
  const site = servedInBrowser()

  /** The copy column as it lays out with the photograph loaded, then with it blocked. */
  const measure = async () => {
    const loaded = await site.page.evaluate(LAYOUT)
    await site.page.blockUrls([`*${ORIGIN_IMAGE}`])
    await site.page.reload()
    const broken = await site.page.evaluate(LAYOUT)
    return { loaded, broken }
  }

  it('leaves the copy column exactly where it was, and the page unbroken', async () => {
    await freshLoad(site, 1440)
    const { loaded, broken } = await measure()

    assert.equal(broken.natural.width, 0, `${ORIGIN_IMAGE} still loaded, so nothing was tested`)
    assert.deepEqual(
      { left: broken.text.left, top: broken.text.top, width: broken.text.width, height: broken.text.height },
      { left: loaded.text.left, top: loaded.text.top, width: loaded.text.width, height: loaded.text.height },
      'the copy column moved when the photograph failed to load',
    )
    assert.deepEqual(
      [...ORIGIN_PARAGRAPHS],
      await site.page.evaluate(`
        return [...document.querySelectorAll('#${ORIGIN_ANCHOR} p')].map((p) => p.textContent.replace(/\\s+/g, ' ').trim())
      `),
      'the copy no longer reads as it did',
    )
    assert.equal(broken.pageOverflow, 0, `the page overflows by ${broken.pageOverflow}px without the photograph`)
    assert.ok(broken.text.right <= broken.image.left, 'the two columns overlap without the photograph')
  })

  it('shows the alt text in the photograph\'s place instead', async () => {
    const fallback = await site.page.evaluate(`
      const photo = document.querySelector('#${ORIGIN_ANCHOR} ${IMAGE_COLUMN} img')
      const rect = photo.getBoundingClientRect()
      return {
        alt: photo.getAttribute('alt'),
        naturalWidth: photo.naturalWidth,
        rendered: { width: Math.round(rect.width), height: Math.round(rect.height) },
        inColumn: photo.closest('${IMAGE_COLUMN}') !== null,
      }
    `)

    assert.equal(fallback.naturalWidth, 0, 'the photograph loaded after all')
    assert.ok(fallback.alt.trim().length > 10, `the alt text is "${fallback.alt}"`)
    assert.ok(fallback.rendered.width > 0, 'the broken photograph collapses to nothing, taking its alt text with it')
    assert.equal(fallback.inColumn, true, 'the broken photograph fell out of its column')
  })

  it('stacks the same way without it on a narrow screen', async () => {
    await site.page.setViewport(375, 900)
    await site.page.reload()
    const layout = await site.page.evaluate(LAYOUT)

    assert.equal(layout.natural.width, 0, `${ORIGIN_IMAGE} still loaded, so nothing was tested`)
    assert.ok(layout.text.bottom <= layout.image.top, 'the columns overlap at 375px without the photograph')
    assert.equal(layout.pageOverflow, 0, `the page overflows by ${layout.pageOverflow}px at 375px`)
  })
})

describe('Image task 9: the copy and the "WHAT WE OFFER" band untouched', () => {
  const BASELINE = 'main'

  /** The `<section class="services">…</section>` band, markup and all. */
  const servicesBand = (html) => html.match(/<section class="services"[\s\S]*?\n {6}<\/section>/)?.[0] ?? null

  /** The stylesheet's "Services" block, from its comment to the next section's. */
  const servicesStyles = (css) => css.split('/* Services ---').at(1)?.split('/* Where we').at(0) ?? null

  /** Every rule the service cards, their tags or their grid are styled by, wherever it sits. */
  const cardRules = (css) =>
    rules(css)
      .filter((rule) => rule.selectors.some((selector) => /^\.(card|tag|services)/.test(selector)))
      .map((rule) => ({ selectors: rule.selectors, declarations: rule.declarations }))

  it('leaves the two paragraphs reading exactly as they did', async () => {
    const before = atBaseline(BASELINE, HOMEPAGE)
    const html = await read(HOMEPAGE)
    const paragraphs = (markup) =>
      [...markup.matchAll(/<p class="origin__copy">([\s\S]*?)<\/p>/g)].map(([, inner]) => textOf(inner))

    assert.deepEqual(paragraphs(html), ORIGIN_PARAGRAPHS)
    if (before === null) return // No baseline to compare against in this checkout.
    assert.deepEqual(paragraphs(html), paragraphs(before), 'the band\'s copy was reworded')
    assert.equal(
      textOf(html.match(/<h2 class="section__heading" id="origin-heading">[\s\S]*?<\/h2>/)?.[0] ?? ''),
      ORIGIN_HEADING,
      'the band\'s heading was rewritten',
    )
  })

  it('leaves the services band\'s markup byte for byte as it was', async () => {
    const before = atBaseline(BASELINE, HOMEPAGE)
    const html = await read(HOMEPAGE)

    assert.ok(servicesBand(html), `${HOMEPAGE} no longer holds the services band`)
    if (before === null) return
    assert.equal(servicesBand(html), servicesBand(before), 'the "WHAT WE OFFER" band was edited')
  })

  it('leaves the services styles byte for byte as they were, breakpoints included', async () => {
    const before = atBaseline(BASELINE, SERVICES_STYLESHEET)
    const css = await read(SERVICES_STYLESHEET)

    assert.ok(servicesStyles(css), `${SERVICES_STYLESHEET} no longer holds a "Services" block`)
    if (before === null) return
    assert.equal(servicesStyles(css), servicesStyles(before), 'the services styles were edited')
    assert.deepEqual(cardRules(css), cardRules(before), 'a card, tag or grid rule was edited or added')
  })

  it('changes nothing outside the origin band and its own styles', async () => {
    const before = atBaseline(BASELINE, HOMEPAGE)
    if (before === null) return
    const html = await read(HOMEPAGE)
    // The values band and the "Values" href it repointed are blanked out the
    // same way the origin band is: they are the whole of what
    // specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/plan.md added, and
    // tests/values-section.test.mjs holds them to their own byte-exact diff.
    const without = (markup) =>
      markup
        .replace(/<section class="origin"[\s\S]*?\n {6}<\/section>/, '<!-- origin -->')
        .replace(/\n {6}<!-- The "Values" nav entry's target\.[\s\S]*?\n {6}<\/section>/, '')
        .replace('<li><a href="#values">Values</a></li>', '<li><a href="#">Values</a></li>')

    assert.equal(without(html), without(before), `${HOMEPAGE} was edited outside the origin band`)
  })
})
