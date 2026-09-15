// Tests for Sofia.jpg as the "WHERE WE'VE COME FROM" band sets it: right of the
// copy on a wide screen, sized to its column, and framed in the "WHAT WE OFFER"
// radius and the "C-Suite Advisory" papaya.
// Plan: specs/29617dac-16b5-4a2b-a6ce-006411c2b9fd/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { openPage, parseColor, serveStatic } from './browser.mjs'
import {
  CARD_FRAME,
  FRAME_SOURCE,
  HOMEPAGE,
  ORIGIN_ANCHOR,
  ORIGIN_IMAGE,
  ORIGIN_IMAGE_SIZE,
  ORIGIN_PARAGRAPHS,
  ORIGIN_PHOTO_CLASS,
  SERVICES_STYLESHEET,
  SOFIA_FRAME_NOTES,
  htmlFiles,
  parseHex,
  read,
  repoRoot,
  rules,
  siteFiles,
  textOf,
} from './site.mjs'

/** The copy column, the image column and the photograph inside it. */
const TEXT_COLUMN = '.origin__text'
const IMAGE_COLUMN = '.origin__image'
const PHOTO = `#${ORIGIN_ANCHOR} ${IMAGE_COLUMN} img`

/** Widths the two columns are asserted side by side at, and the ones they stack at. */
const WIDE = [1440, 1280, 1024, 768]
const NARROW = [767, 414, 375, 320]

/** Serves the repo and opens one headless-Chrome page on the home page for the enclosing suite. */
const servedInBrowser = () => {
  const handle = {}
  before(async () => {
    handle.server = await serveStatic(repoRoot)
    handle.url = `${handle.server.origin}/${HOMEPAGE}`
    handle.page = await openPage(handle.url)
  })
  after(async () => {
    await handle.page?.close()
    await handle.server?.close()
  })
  return handle
}

/** A fresh load at the given width; the query keeps every navigation a cross-document one. */
let loads = 0
const freshLoad = async (site, width, height = 900) => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}`)
}

/** The section of this job's notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(SOFIA_FRAME_NOTES).catch(() => '')
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

/** The band and its parts, measured as the browser lays them out. */
const LAYOUT = `
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      left: Math.round(r.left),
      right: Math.round(r.right),
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      width: Math.round(r.width),
      height: Math.round(r.height),
    }
  }
  const section = document.querySelector('#${ORIGIN_ANCHOR}')
  const photo = document.querySelector('${PHOTO}')
  return {
    container: box(section.querySelector('.container')),
    text: box(section.querySelector('${TEXT_COLUMN}')),
    image: box(section.querySelector('${IMAGE_COLUMN}')),
    photo: box(photo),
    natural: photo ? { width: photo.naturalWidth, height: photo.naturalHeight } : null,
    viewport: window.innerWidth,
    pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }
`

/** The four-sided frame of the photograph and of the "C-Suite Advisory" box, side by side. */
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
  const boxes = [...document.querySelectorAll('#services .card')]
  const card = boxes.find((el) => el.querySelector('.card__title').textContent.trim() === ${JSON.stringify(FRAME_SOURCE.box)})
  return {
    card: of(card),
    photo: of(document.querySelector('${PHOTO}')),
    radii: boxes.map((el) => getComputedStyle(el).borderRadius),
  }
`

describe(`Sofia task 1: ${ORIGIN_IMAGE} found, and its every usage written down`, () => {
  it('sits in the repository at the path the notes record', async () => {
    const found = await notesSection('The photograph')

    assert.ok(found, `${SOFIA_FRAME_NOTES} has no "The photograph" section`)
    assert.ok((await siteFiles()).includes(ORIGIN_IMAGE), `${ORIGIN_IMAGE} is not part of the site`)
    assert.ok(found.includes(ORIGIN_IMAGE), `the notes do not name ${ORIGIN_IMAGE}`)
    assert.ok(found.includes(HOMEPAGE), `the notes do not say which page carries ${ORIGIN_IMAGE}`)
  })

  it('is referenced from exactly one place, and the notes say so', async () => {
    const usages = []
    for (const file of await htmlFiles()) {
      const html = await read(file)
      for (const match of html.matchAll(new RegExp(`src="${ORIGIN_IMAGE}"`, 'g'))) usages.push(`${file}:${match.index}`)
    }

    assert.equal(usages.length, 1, `${ORIGIN_IMAGE} is referenced ${usages.length} times: ${usages.join(', ')}`)
    assert.ok((await notesSection('The photograph')).includes(ORIGIN_PHOTO_CLASS), 'the notes name no scoping class')
  })
})

describe(`Sofia task 2: the radius and the border read off the "${FRAME_SOURCE.section}" boxes`, () => {
  const site = servedInBrowser()

  it('records both values and the selectors they are declared on', async () => {
    const frame = await notesSection('The frame')

    assert.ok(frame, `${SOFIA_FRAME_NOTES} has no "The frame" section`)
    assert.ok(frame.includes(CARD_FRAME.radius), `the notes do not record the ${CARD_FRAME.radius} radius`)
    assert.ok(frame.includes(`${CARD_FRAME.width} ${CARD_FRAME.style}`), 'the notes do not record the border width and style')
    assert.match(frame, /--papaya/, 'the notes do not record where the papaya comes from')
    assert.ok(frame.includes('.card'), 'the notes do not name the selector the radius is declared on')
  })

  it('reads the same values back off every box, so one canonical radius was found', async () => {
    const frames = await site.page.evaluate(FRAMES)

    assert.equal(frames.radii.length, 6, `the "${FRAME_SOURCE.section}" band renders ${frames.radii.length} boxes`)
    assert.deepEqual([...new Set(frames.radii)], [CARD_FRAME.radius], 'the boxes carry more than one radius')
  })

  it("reads the recorded papaya back off the reference box's default state", async () => {
    const frames = await site.page.evaluate(FRAMES)

    assert.equal(frames.card.width, Array(4).fill(CARD_FRAME.width).join('|'))
    assert.equal(frames.card.style, Array(4).fill(CARD_FRAME.style).join('|'))
    for (const colour of frames.card.color.split('|')) {
      assert.deepEqual(parseColor(colour), parseHex(CARD_FRAME.colour), `the box's border is ${colour}`)
    }
  })
})

describe('Sofia task 3: the copy on the left and the photograph on the right', () => {
  const site = servedInBrowser()

  for (const width of WIDE) {
    it(`sets the two in one row, copy first, at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)

      assert.ok(layout.text, `the band has no ${TEXT_COLUMN} column`)
      assert.ok(layout.image, `the band has no ${IMAGE_COLUMN} column`)
      assert.ok(
        layout.text.right <= layout.image.left,
        `the columns overlap by ${layout.text.right - layout.image.left}px at ${width}px`,
      )
      assert.ok(layout.text.top === layout.image.top, `the columns start at different heights at ${width}px`)
    })
  }

  it('wraps both columns in one element, so the split comes from a shared parent', async () => {
    const wrapper = await site.page.evaluate(`
      const text = document.querySelector('#${ORIGIN_ANCHOR} ${TEXT_COLUMN}')
      const image = document.querySelector('#${ORIGIN_ANCHOR} ${IMAGE_COLUMN}')
      const parent = text.parentElement
      const style = getComputedStyle(parent)
      return {
        shared: parent === image.parentElement,
        className: parent.className,
        display: style.display,
        columns: style.gridTemplateColumns.split(' ').map((v) => Math.round(parseFloat(v))),
      }
    `)

    assert.equal(wrapper.shared, true, 'the two columns hang off different parents')
    assert.match(wrapper.display, /grid|flex/, `the wrapper lays out as ${wrapper.display}`)
    assert.equal(wrapper.columns.length, 2, `the wrapper makes ${wrapper.columns.length} tracks at 1280px`)
    assert.equal(wrapper.columns[0], wrapper.columns[1], 'the two tracks are different widths')
  })

  it('leaves both paragraphs reading exactly as they were written', async () => {
    const copy = await site.page.evaluate(`
      return [...document.querySelectorAll('#${ORIGIN_ANCHOR} ${TEXT_COLUMN} p')]
        .map((p) => p.textContent.replace(/\\s+/g, ' ').trim())
    `)

    assert.deepEqual(copy, ORIGIN_PARAGRAPHS)
  })
})

describe('Sofia task 4: the photograph sized to its column, at its own ratio', () => {
  const site = servedInBrowser()

  it('derives its height rather than being given one', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const photo = rules(css).filter((rule) => rule.selectors.includes(`.${ORIGIN_PHOTO_CLASS}`))

    assert.ok(photo.length > 0, `${SERVICES_STYLESHEET} declares no rule for .${ORIGIN_PHOTO_CLASS}`)
    const declarations = Object.assign({}, ...photo.map((rule) => rule.declarations))
    assert.equal(declarations.height, 'auto', `its height is ${declarations.height}`)
    assert.ok(declarations.width || declarations['max-width'], 'it is given neither a width nor a max-width')
  })

  for (const width of [...WIDE, ...NARROW]) {
    it(`fits inside its column undistorted at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)
      const rendered = layout.photo.width / layout.photo.height
      const intrinsic = ORIGIN_IMAGE_SIZE.width / ORIGIN_IMAGE_SIZE.height

      assert.deepEqual(layout.natural, ORIGIN_IMAGE_SIZE, `${ORIGIN_IMAGE} decoded to an unexpected size`)
      assert.ok(
        layout.photo.width <= layout.image.width + 1,
        `it is ${layout.photo.width}px inside a ${layout.image.width}px column at ${width}px`,
      )
      assert.ok(
        Math.abs(rendered - intrinsic) < 0.02,
        `it renders at ${rendered.toFixed(3)} against an intrinsic ${intrinsic.toFixed(3)} at ${width}px`,
      )
      assert.equal(layout.pageOverflow, 0, `the page overflows by ${layout.pageOverflow}px at ${width}px`)
    })
  }
})

describe(`Sofia task 5: the "${FRAME_SOURCE.section}" radius on the photograph`, () => {
  const site = servedInBrowser()

  it('rounds all four corners by exactly the radius the boxes carry', async () => {
    const frames = await site.page.evaluate(FRAMES)

    assert.ok(frames.photo, 'the photograph has no corners to compare')
    assert.equal(frames.photo.radius, frames.card.radius)
    assert.equal(frames.photo.radius, Array(4).fill(CARD_FRAME.radius).join('|'))
  })

  it('leaves the boxes rounded exactly as they were', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const card = rules(css).filter((rule) => rule.selectors.includes('.card'))
    const declarations = Object.assign({}, ...card.map((rule) => rule.declarations))

    assert.equal(declarations['border-radius'], CARD_FRAME.radius, '.card no longer declares the recorded radius')
  })
})

describe(`Sofia task 6: the "${FRAME_SOURCE.box}" papaya border on the photograph`, () => {
  const site = servedInBrowser()

  it('gives it the same border width, style and colour as the box', async () => {
    const frames = await site.page.evaluate(FRAMES)

    assert.equal(frames.photo.width, frames.card.width)
    assert.equal(frames.photo.style, frames.card.style)
    assert.equal(frames.photo.color, frames.card.color)
  })

  it('takes the papaya from the custom property rather than a second literal', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const photo = rules(css).filter((rule) => rule.selectors.includes(`.${ORIGIN_PHOTO_CLASS}`))
    const border = photo.map((rule) => rule.declarations.border).filter(Boolean).join(' ')

    assert.match(border, /var\(--papaya\)/, 'the photograph does not take its papaya from --papaya')
    assert.equal(css.match(new RegExp(CARD_FRAME.colour, 'gi')).length, 1, 'the papaya is written more than once')
  })

  it("leaves the box's own border where it was declared", async () => {
    const css = await read(SERVICES_STYLESHEET)
    const card = Object.assign({}, ...rules(css).filter((r) => r.selectors.includes('.card')).map((r) => r.declarations))
    const papaya = rules(css).filter((rule) =>
      rule.selectors.some((selector) => selector.includes('.services__grid > .card:nth-child(6n + 1)')),
    )

    assert.equal(card.border, `${CARD_FRAME.width} ${CARD_FRAME.style} var(--line)`, '.card\'s border changed')
    assert.ok(
      papaya.some((rule) => rule.declarations['border-color'] === 'var(--papaya)'),
      `the "${FRAME_SOURCE.box}" box no longer takes its papaya from the grid's own rule`,
    )
  })
})

describe('Sofia task 7: the columns stacking on a narrow screen', () => {
  const site = servedInBrowser()

  for (const width of NARROW) {
    it(`stacks the copy above the photograph, clear of it, at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)

      assert.ok(
        layout.text.bottom <= layout.image.top,
        `the photograph overlaps the copy by ${layout.text.bottom - layout.image.top}px at ${width}px`,
      )
      assert.equal(layout.text.width, layout.image.width, `the two columns are different widths at ${width}px`)
      assert.ok(layout.photo.left >= 0, `the photograph is clipped at the left edge at ${width}px`)
      assert.ok(layout.photo.right <= layout.viewport, `the photograph runs off the right edge at ${width}px`)
      assert.equal(layout.pageOverflow, 0, `the page scrolls sideways by ${layout.pageOverflow}px at ${width}px`)
    })
  }

  it('turns over at the breakpoint the service boxes already pair up on', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const breakpoints = [...css.matchAll(/@media \(min-width: (\d+)px\)/g)].map((m) => Number(m[1]))
    const paired = []
    for (const width of [767, 768]) {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)
      paired.push({ width, paired: layout.text.right <= layout.image.left })
    }

    assert.ok(breakpoints.includes(768), `the stylesheet's breakpoints are ${breakpoints.join(', ')}`)
    assert.deepEqual(paired, [{ width: 767, paired: false }, { width: 768, paired: true }])
  })
})

describe(`Sofia task 8: the frame scoped to this one usage of ${ORIGIN_IMAGE}`, () => {
  const site = servedInBrowser()

  it('hangs the frame off a class, never off the image or its src', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const framed = rules(css).filter(
      (rule) => rule.declarations.border?.includes('--papaya') || rule.declarations['border-radius'] === CARD_FRAME.radius,
    )

    assert.ok(framed.length > 0, `${SERVICES_STYLESHEET} declares the frame nowhere`)
    for (const rule of framed) {
      for (const selector of rule.selectors) {
        assert.doesNotMatch(selector, /\[src/, `${selector} selects on the src attribute`)
        assert.doesNotMatch(selector, /(^|\s)img(\s|$|[:.])/, `${selector} reaches every image on the page`)
      }
    }
  })

  it('leaves a second copy of the photograph elsewhere on the page unframed', async () => {
    await freshLoad(site, 1280)
    const probe = await site.page.evaluate(`
      const img = document.createElement('img')
      img.src = ${JSON.stringify(ORIGIN_IMAGE)}
      document.querySelector('#services .container').append(img)
      const style = getComputedStyle(img)
      const frame = {
        width: style.borderTopWidth,
        style: style.borderTopStyle,
        radius: style.borderTopLeftRadius,
      }
      img.remove()
      return frame
    `)

    assert.equal(probe.style, 'none', `a second ${ORIGIN_IMAGE} picks up a ${probe.style} border`)
    assert.equal(probe.width, '0px', `a second ${ORIGIN_IMAGE} picks up a ${probe.width} border`)
    assert.equal(probe.radius, '0px', `a second ${ORIGIN_IMAGE} picks up ${probe.radius} corners`)
  })

  it('carries the scoping class on the photograph it does frame', async () => {
    const html = await read(HOMEPAGE)
    const img = html.match(new RegExp(`<img[^>]*src="${ORIGIN_IMAGE}"[^>]*>|<img[\\s\\S]*?src="${ORIGIN_IMAGE}"[\\s\\S]*?>`))?.[0]

    assert.ok(img, `${HOMEPAGE} carries no <img> for ${ORIGIN_IMAGE}`)
    assert.match(img, new RegExp(`class="[^"]*\\b${ORIGIN_PHOTO_CLASS}\\b`), `the <img> carries no ${ORIGIN_PHOTO_CLASS} class`)
    assert.match(img, /alt="[^"]+"/, 'the <img> lost its alt text')
    assert.doesNotMatch(img, /style="/, 'the <img> carries an inline style')
  })

  it('reaches no other page: no other page names the photograph at all', async () => {
    for (const file of await htmlFiles()) {
      if (file === HOMEPAGE) continue
      assert.doesNotMatch(await read(file), new RegExp(ORIGIN_IMAGE), `${file} also carries ${ORIGIN_IMAGE}`)
    }
    assert.ok(textOf(await read(HOMEPAGE)).length > 0, `${HOMEPAGE} is empty`)
  })
})
