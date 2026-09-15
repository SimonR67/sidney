// Tests for the Case Studies page, and for the two site-wide nav changes that
// ship with it: the sticky masthead and the 1.6x logo.
// Plan: specs/4bc05d6f-e783-43e8-a21e-807feef4dbc6/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { openPage, serveStatic } from './browser.mjs'
import {
  BREAKPOINTS,
  CASE_SOURCES,
  CASE_STUDIES,
  CASE_STUDIES_HEADING,
  CASE_STUDIES_NOTES,
  CASE_STUDIES_PAGE,
  CASE_STUDIES_TITLE,
  CONTACT_PAGE,
  HOMEPAGE,
  LOGO_BASE_HEIGHT,
  LOGO_HEIGHT,
  LOGO_SCALE,
  MASTHEAD_CLEARANCE,
  MASTHEAD_CLEARANCE_VAR,
  SERVICES_STYLESHEET,
  declaredValue,
  parseHex,
  read,
  repoRoot,
  textOf,
} from './site.mjs'

/** The section of the notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(CASE_STUDIES_NOTES)
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

/**
 * Serves the repo and opens one headless-Chrome page for the enclosing suite,
 * on the Case Studies page unless another is named. `page`/`origin` are filled
 * in by the time tests run.
 */
const servedInBrowser = (file = CASE_STUDIES_PAGE) => {
  const handle = {}
  before(async () => {
    handle.server = await serveStatic(repoRoot)
    handle.origin = handle.server.origin
    handle.url = `${handle.origin}/${file}`
    handle.page = await openPage(handle.url)
  })
  after(async () => {
    await handle.page?.close()
    await handle.server?.close()
  })
  return handle
}

/** A pristine load at the given width; the query keeps every navigation a cross-document one. */
let loads = 0
const freshLoad = async (site, width = 1280, height = 900, hash = '') => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}${hash}`)
}

/** Every box on the page, with the classes it carries and the box the browser draws for it. */
const BOXES = `
  const grid = document.querySelector('.case-studies .services__grid')
  return {
    gridTag: grid.tagName.toLowerCase(),
    gridClasses: [...grid.classList],
    columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    boxes: [...grid.children].map((card) => {
      const style = getComputedStyle(card)
      const rect = card.getBoundingClientRect()
      const img = card.querySelector('img')
      return {
        tag: card.tagName.toLowerCase(),
        classes: [...card.classList],
        title: card.querySelector('.card__title')?.textContent.replace(/\\s+/g, ' ').trim() ?? null,
        radius: style.borderTopLeftRadius,
        width: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
        border: [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor],
        padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
        background: style.backgroundColor,
        shadow: style.boxShadow,
        rect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width },
        text: card.textContent.replace(/\\s+/g, ' ').trim(),
        img: img && { src: img.getAttribute('src'), alt: img.getAttribute('alt'), natural: img.naturalWidth },
      }
    }),
  }
`

/** The masthead and the first thing under it, measured where they sit right now. */
const MASTHEAD = `
  const head = document.querySelector('.masthead')
  const mark = document.querySelector('.masthead__mark')
  const style = getComputedStyle(head)
  const rect = head.getBoundingClientRect()
  const markRect = mark.getBoundingClientRect()
  const main = document.querySelector('main').getBoundingClientRect()
  return {
    position: style.position,
    top: style.top,
    zIndex: style.zIndex,
    background: style.backgroundColor,
    rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
    mark: { width: markRect.width, height: markRect.height },
    nav: (() => { const r = document.querySelector('.masthead__nav').getBoundingClientRect()
      return { top: r.top, right: r.right, bottom: r.bottom, left: r.left } })(),
    logo: (() => { const r = document.querySelector('.masthead__logo').getBoundingClientRect()
      return { top: r.top, right: r.right, bottom: r.bottom, left: r.left } })(),
    cta: (() => { const r = document.querySelector('.masthead__cta').getBoundingClientRect()
      return { top: r.top, right: r.right, bottom: r.bottom, left: r.left } })(),
    links: [...document.querySelectorAll('.masthead__links li')].map((li) => {
      const r = li.getBoundingClientRect()
      return { label: li.textContent.trim(), top: r.top, right: r.right, bottom: r.bottom, left: r.left }
    }),
    mainTop: main.top,
    scrollY: window.scrollY,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewport: window.innerWidth,
  }
`

const overlap = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5

/** Every colour literal an SVG paints with. */
const svgColours = (svg) => [...new Set([...svg.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0].toLowerCase()))]

/** The lettering an SVG sets, as a reader sees it — `&` is the only entity the panels need. */
const panelText = (svg) => textOf(svg).replace(/&amp;/g, '&')

/** True for a neutral: no channel leads. */
const isNeutral = ({ r, g, b }) => r === g && g === b

/** True for a papaya: warm all the way down the channels, and not a near-grey. */
const isPapaya = ({ r, g, b }) => r >= g && g >= b && r - b >= 40

describe('Case studies task 1: the copy, taken from the PDFs and checked back against them', () => {
  const site = servedInBrowser()

  it('finds all three sources in the repository, none of them empty', async () => {
    for (const source of CASE_SOURCES) {
      const info = await stat(join(repoRoot, source))

      assert.ok(info.size > 0, `${source} is empty, so its box has no content to ship`)
    }
  })

  it('records which file each box was transcribed from, and that the transcription was eyeballed', async () => {
    const sources = await notesSection('The three sources')

    assert.ok(sources, `${CASE_STUDIES_NOTES} has no "The three sources" section`)
    for (const source of CASE_SOURCES) {
      assert.ok(sources.includes(source), `the notes do not name ${source}`)
    }
    assert.match(sources, /verbatim/i, 'the notes do not say the copy is verbatim')
  })

  for (const study of CASE_STUDIES) {
    it(`sets ${study.source}'s title, subtitle and sector line word for word`, async () => {
      const { boxes } = await site.page.evaluate(BOXES)
      const box = boxes.find((candidate) => candidate.title === study.title)

      assert.ok(box, `no box on the page is titled "${study.title}"`)
      assert.ok(box.text.includes(study.eyebrow), `the ${study.slug} box carries no "${study.eyebrow}" label`)
      assert.ok(box.text.includes(study.subtitle), `the ${study.slug} box lost the subtitle "${study.subtitle}"`)
      assert.ok(box.text.includes(study.meta), `the ${study.slug} box lost the line "${study.meta}"`)
    })

    it(`sets ${study.source}'s Challenge, Solution and Effects word for word`, async () => {
      const { boxes } = await site.page.evaluate(BOXES)
      const box = boxes.find((candidate) => candidate.title === study.title)

      for (const section of study.sections) {
        assert.ok(box.text.includes(section.heading), `the ${study.slug} box has no "${section.heading}" heading`)
        for (const line of section.paragraphs ?? section.bullets) {
          assert.ok(box.text.includes(line), `the ${study.slug} box's "${section.heading}" is not verbatim:\n${line}`)
        }
      }
      assert.ok(box.text.includes(study.stack), `the ${study.slug} box lost the line "${study.stack}"`)
    })

    it(`keeps ${study.source}'s Challenge, Solution and Effects in that order`, async () => {
      const { boxes } = await site.page.evaluate(BOXES)
      const box = boxes.find((candidate) => candidate.title === study.title)
      const at = study.sections.map((section) => box.text.indexOf(section.heading))

      assert.deepEqual([...at].sort((a, b) => a - b), at, `the ${study.slug} box reorders its sections`)
      assert.ok(box.text.indexOf(study.stack) > at.at(-1), `the ${study.slug} box sets its stack before its copy`)
    })
  }

  it('leaves the source PDFs untouched: nothing on the site links or rewrites one', async () => {
    const page = await read(CASE_STUDIES_PAGE)

    for (const source of CASE_SOURCES) {
      assert.ok(!page.includes(source), `${CASE_STUDIES_PAGE} links ${source} rather than carrying its copy`)
    }
  })
})

describe('Case studies task 2: the graphics, recoloured into the papaya palette', () => {
  const site = servedInBrowser()

  it('ships one graphic per source, and no placeholder beside them', async () => {
    for (const study of CASE_STUDIES) {
      const info = await stat(join(repoRoot, study.graphic))

      assert.ok(info.size > 0, `${study.graphic} is empty`)
      assert.match(study.graphic, /\.svg$/, `${study.graphic} is not the vector the PDF panels were rebuilt as`)
    }
  })

  for (const study of CASE_STUDIES) {
    it(`keeps ${study.slug}'s panel recognisable: its wording, shape for shape`, async () => {
      const text = panelText(await read(study.graphic))

      for (const phrase of study.panel) {
        assert.ok(text.includes(phrase), `${study.graphic} lost the panel's "${phrase}"`)
      }
    })

    it(`paints ${study.slug}'s panel in papaya and neutrals, nothing else`, async () => {
      const svg = await read(study.graphic)
      const colours = svgColours(svg)
      const papaya = colours.filter((hex) => isPapaya(parseHex(hex)))
      const neutral = colours.filter((hex) => isNeutral(parseHex(hex)))

      assert.deepEqual(
        colours.filter((hex) => !papaya.includes(hex) && !neutral.includes(hex)),
        [],
        `${study.graphic} paints with a shade that is neither papaya nor neutral`,
      )
      assert.ok(
        papaya.length > neutral.length,
        `${study.graphic} is ${papaya.length} papaya shades to ${neutral.length} neutrals, so papaya is not dominant`,
      )
    })

    it(`draws ${study.slug}'s panel with the site's own papaya in it`, async () => {
      const css = await read(SERVICES_STYLESHEET)
      const svg = await read(study.graphic)

      assert.ok(
        svgColours(svg).includes(declaredValue(css, [':root'], '--papaya')),
        `${study.graphic} never uses --papaya itself`,
      )
    })
  }

  it('renders every graphic in the page rather than leaving a broken image', async () => {
    const { boxes } = await site.page.evaluate(BOXES)

    for (const [index, box] of boxes.entries()) {
      assert.ok(box.img, `box ${index + 1} carries no graphic`)
      assert.equal(box.img.src, CASE_STUDIES[index].graphic)
      assert.ok(box.img.natural > 0, `${box.img.src} never decoded`)
      assert.ok(box.img.alt?.length > 0, `${box.img.src} ships without alt text`)
    }
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })

  it('writes the palette down, shade by shade, against the shade it replaces', async () => {
    const palette = await notesSection('Papaya palette')

    assert.ok(palette, `${CASE_STUDIES_NOTES} has no "Papaya palette" section`)
    const declared = new Set()
    for (const study of CASE_STUDIES) for (const hex of svgColours(await read(study.graphic))) declared.add(hex)
    for (const hex of declared) {
      assert.ok(palette.includes(hex), `the notes never say what ${hex} is doing in the artwork`)
    }
  })
})

describe('Case studies task 3: the "WHAT WE OFFER" component, reused rather than copied', () => {
  const home = servedInBrowser(HOMEPAGE)

  /** The offer boxes as the home page draws them, which this job may not change. */
  const OFFER = `
    const grid = document.querySelector('#services .services__grid')
    const style = getComputedStyle(grid)
    const card = getComputedStyle(grid.children[0])
    return {
      count: grid.children.length,
      columns: style.gridTemplateColumns.split(' ').length,
      gap: [style.rowGap, style.columnGap],
      radius: card.borderTopLeftRadius,
      borderWidth: card.borderTopWidth,
      padding: [card.paddingTop, card.paddingRight, card.paddingBottom, card.paddingLeft],
      background: card.backgroundColor,
      shadow: card.boxShadow,
    }
  `

  it('leaves the offer boxes three across, and shaped exactly as they were', async () => {
    await home.page.setViewport(1280, 900)
    await home.page.goto(`${home.url}?offer=1`)
    const offer = await home.page.evaluate(OFFER)

    assert.equal(offer.count, 6, `the services band renders ${offer.count} boxes`)
    assert.equal(offer.columns, 3, `the services band is ${offer.columns} columns wide at 1280px`)
    assert.deepEqual(offer.gap, ['18px', '18px'])
    assert.equal(offer.radius, '10px')
    assert.equal(offer.borderWidth, '1px')
    assert.deepEqual(offer.padding, ['26px', '24px', '26px', '24px'])
    assert.equal(offer.background, 'rgb(255, 255, 255)')
    assert.equal(offer.shadow, 'rgba(17, 17, 17, 0.06) 0px 1px 2px 0px')
  })

  it('adds no second box component to the stylesheet to hold the full-width variant', async () => {
    const css = await read(SERVICES_STYLESHEET)

    for (const property of ['border-radius', 'box-shadow']) {
      assert.ok(
        !new RegExp(`\\.case-stud[^{}]*\\{[^{}]*${property}`, 's').test(css),
        `a .case-stud… rule re-declares ${property} instead of taking it from .card`,
      )
    }
  })

  it('leaves the .card and .services__grid rules themselves alone', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.match(css, /\.card \{\s*display: flex;/, '.card no longer opens the way it did')
    assert.match(css, /\.services__grid \{\s*display: grid;\s*grid-template-columns: 1fr;/, '.services__grid changed')
  })
})

describe('Case studies task 4: three full-width boxes, in the order the plan sets', () => {
  const site = servedInBrowser()

  it('holds exactly three boxes, built from the shared component', async () => {
    const { gridTag, gridClasses, boxes } = await site.page.evaluate(BOXES)

    assert.equal(gridTag, 'ul', `the boxes sit in a <${gridTag}>`)
    assert.ok(gridClasses.includes('services__grid'), `the grid carries ${gridClasses.join(', ')}`)
    assert.equal(boxes.length, 3, `the page renders ${boxes.length} boxes`)
    for (const [index, box] of boxes.entries()) {
      assert.equal(box.tag, 'li', `box ${index + 1} is a <${box.tag}>`)
      assert.ok(box.classes.includes('card'), `box ${index + 1} carries ${box.classes.join(', ')}`)
    }
  })

  it('stacks them ComixIT, then Learning, then Professional Services', async () => {
    const { boxes } = await site.page.evaluate(BOXES)

    assert.deepEqual(boxes.map((box) => box.title), CASE_STUDIES.map((study) => study.title))
    for (const [index, box] of boxes.slice(1).entries()) {
      assert.ok(box.rect.top >= boxes[index].rect.bottom, `box ${index + 2} does not sit below box ${index + 1}`)
    }
  })

  it('wears the offer boxes\' border, radius, padding, background and shadow', async () => {
    const { boxes } = await site.page.evaluate(BOXES)

    for (const [index, box] of boxes.entries()) {
      assert.equal(box.radius, '10px', `box ${index + 1} is rounded ${box.radius}`)
      assert.deepEqual(box.width, Array(4).fill('1px'), `box ${index + 1} is ${box.width.join(', ')} thick`)
      assert.deepEqual(box.padding, ['26px', '24px', '26px', '24px'], `box ${index + 1} is padded differently`)
      assert.equal(box.background, 'rgb(255, 255, 255)', `box ${index + 1} is filled ${box.background}`)
      assert.equal(box.shadow, 'rgba(17, 17, 17, 0.06) 0px 1px 2px 0px', `box ${index + 1} is shadowed differently`)
    }
  })

  it('runs one box to a row at every width, where the offer boxes open out to three', async () => {
    for (const width of BREAKPOINTS) {
      await freshLoad(site, width)
      const { columns, boxes } = await site.page.evaluate(BOXES)

      assert.equal(columns, 1, `the boxes are ${columns} columns wide at ${width}px`)
      const widths = new Set(boxes.map((box) => Math.round(box.rect.width)))
      assert.equal(widths.size, 1, `the boxes are ${[...widths].join(', ')}px wide at ${width}px`)
      for (const box of boxes) {
        assert.ok(box.rect.left >= 0, `a box starts at ${box.rect.left}px at ${width}px`)
        assert.ok(box.rect.right <= width, `a box runs to ${box.rect.right}px past ${width}px`)
      }
    }
  })

  it('puts the band under the site\'s own heading, and the page under the site\'s own chrome', async () => {
    await freshLoad(site)
    const page = await site.page.evaluate(`
      return {
        title: document.title,
        heading: document.querySelector('main h1')?.textContent.trim() ?? null,
        stylesheets: [...document.styleSheets].map((sheet) => sheet.href).filter(Boolean),
        font: getComputedStyle(document.body).fontFamily,
        header: !!document.querySelector('.masthead'),
        footer: !!document.querySelector('.footer'),
      }
    `)

    assert.equal(page.title, CASE_STUDIES_TITLE)
    assert.equal(page.heading, CASE_STUDIES_HEADING)
    assert.deepEqual(
      page.stylesheets.map((href) => href.slice(site.origin.length + 1)),
      [SERVICES_STYLESHEET],
      'the page is styled from something other than the site stylesheet',
    )
    assert.equal(page.font, 'Inter, "Helvetica Neue", Arial, sans-serif')
    assert.ok(page.header, 'the page has no masthead')
    assert.ok(page.footer, 'the page has no footer')
  })

  it('renders cleanly, console and network included', async () => {
    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })
})

describe('Case studies task 5: the page is reachable at its own slug', () => {
  it('serves it, as HTML, at the slug the nav points at', async () => {
    const server = await serveStatic(repoRoot)
    try {
      const response = await fetch(`${server.origin}/${CASE_STUDIES_PAGE}`)
      const body = await response.text()

      assert.equal(response.status, 200, `/${CASE_STUDIES_PAGE} answered ${response.status}`)
      assert.equal(response.headers.get('content-type'), 'text/html')
      assert.ok(body.includes(`<title>${CASE_STUDIES_TITLE}</title>`), 'the slug serves some other page')
    } finally {
      await server.close()
    }
  })

  it('serves each graphic it asks for, as SVG', async () => {
    const server = await serveStatic(repoRoot)
    try {
      for (const study of CASE_STUDIES) {
        const response = await fetch(`${server.origin}/${study.graphic}`)

        assert.equal(response.status, 200, `${study.graphic} answered ${response.status}`)
        assert.equal(response.headers.get('content-type'), 'image/svg+xml')
      }
    } finally {
      await server.close()
    }
  })

  it('needs no build step to do it: the file served is the file committed', async () => {
    const manifest = JSON.parse(await read('package.json'))

    assert.deepEqual(Object.keys(manifest.scripts), ['test'])
    assert.match(manifest.scripts.test, /tests\/case-studies\.test\.mjs/, 'the suite never runs these tests')
  })
})

describe('Case studies task 6: the "Case Studies" tab, on every page of the site', () => {
  for (const file of [HOMEPAGE, CONTACT_PAGE, CASE_STUDIES_PAGE]) {
    const site = servedInBrowser(file)

    it(`carries it in the nav on ${file}, pointed at the page`, async () => {
      const nav = await site.page.evaluate(`
        return [...document.querySelectorAll('.masthead__links a')].map((a) => ({
          label: a.textContent.trim(),
          href: a.getAttribute('href'),
          attributes: a.getAttributeNames(),
        }))
      `)
      const tab = nav.find((link) => link.label === 'Case Studies')
      const sibling = nav.find((link) => link.label === 'Team')

      assert.ok(tab, `${file} has no "Case Studies" nav entry`)
      assert.equal(tab.href, CASE_STUDIES_PAGE, `"Case Studies" on ${file} points at ${tab.href}`)
      assert.deepEqual(tab.attributes, sibling.attributes, `"Case Studies" on ${file} is wired differently`)
      assert.equal(nav.indexOf(tab), 4, `"Case Studies" moved to position ${nav.indexOf(tab) + 1}`)
    })

    it(`paints it exactly as its siblings on ${file}`, async () => {
      const paint = await site.page.evaluate(`
        return [...document.querySelectorAll('.masthead__links a')].map((a) => {
          const style = getComputedStyle(a)
          return [style.color, style.backgroundColor, style.fontSize, style.fontWeight, style.textDecorationLine].join(' ')
        })
      `)

      assert.equal(new Set(paint).size, 1, `the "Case Studies" tab on ${file} no longer looks like its siblings`)
    })
  }

  it('lands on the page when clicked from somewhere else', async () => {
    const server = await serveStatic(repoRoot)
    const page = await openPage(`${server.origin}/${HOMEPAGE}`)
    try {
      await page.evaluate(`
        [...document.querySelectorAll('.masthead__links a')].find((a) => a.textContent.trim() === 'Case Studies').click()
      `)
      await new Promise((resolve) => setTimeout(resolve, 400))
      const arrived = await page.evaluate(`
        return {
          path: location.pathname,
          title: document.title,
          boxes: document.querySelectorAll('.case-studies .card').length,
        }
      `)

      assert.equal(arrived.path, `/${CASE_STUDIES_PAGE}`, `the tab led to ${arrived.path}`)
      assert.equal(arrived.title, CASE_STUDIES_TITLE)
      assert.equal(arrived.boxes, CASE_STUDIES.length)
      assert.deepEqual(page.failedRequests, [], 'the click produced failed requests')
    } finally {
      await page.close()
      await server.close()
    }
  })
})

describe('Case studies task 7: the masthead, pinned to the top of every page', () => {
  it('declares one sticky rule, with a top offset and a stacking order, in the shared stylesheet', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.equal(declaredValue(css, ['.masthead'], 'position'), 'sticky', '.masthead is not sticky')
    assert.equal(declaredValue(css, ['.masthead'], 'top'), '0', '.masthead has no top offset to stick to')
    assert.ok(Number(declaredValue(css, ['.masthead'], 'z-index')) > 0, '.masthead has no stacking order')
    assert.ok(declaredValue(css, ['.masthead'], 'background-color'), '.masthead is transparent, so content shows through')
  })

  it('publishes the clearance an anchor jump has to make, stepped at the site\'s own breakpoints', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.ok(
      css.includes(`scroll-padding-top: var(${MASTHEAD_CLEARANCE_VAR})`),
      `no anchor jump is offset by ${MASTHEAD_CLEARANCE_VAR}`,
    )
    // Written narrow-first like the rest of the sheet: the base value is the
    // narrowest screen's masthead, and each breakpoint below shortens it. The
    // heights themselves are measured, not trusted — see the anchor-jump test.
    const declared = [...css.matchAll(new RegExp(`${MASTHEAD_CLEARANCE_VAR}: ([\\d.]+px)`, 'g'))].map((m) => m[1])

    assert.deepEqual(declared, MASTHEAD_CLEARANCE.map((step) => step.value))
  })

  for (const file of [HOMEPAGE, CONTACT_PAGE, CASE_STUDIES_PAGE]) {
    const site = servedInBrowser(file)

    it(`keeps it at the top of ${file} while the page scrolls under it`, async () => {
      await freshLoad(site)
      const onLoad = await site.page.evaluate(MASTHEAD)
      const scrolled = await site.page.evaluate(`
        window.scrollTo(0, 1200)
        return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => {
          const rect = document.querySelector('.masthead').getBoundingClientRect()
          resolve({ top: rect.top, bottom: rect.bottom, scrollY: window.scrollY })
        })))
      `)

      assert.equal(onLoad.position, 'sticky', `the masthead on ${file} is ${onLoad.position}`)
      assert.ok(scrolled.scrollY > 0, `${file} never scrolled`)
      assert.equal(Math.round(scrolled.top), 0, `the masthead on ${file} scrolled to ${scrolled.top}px`)
      assert.ok(scrolled.bottom > 0, `the masthead on ${file} left the viewport`)
    })

    it(`hides nothing under it on ${file}: the content starts where it ends`, async () => {
      await freshLoad(site)
      const { rect, mainTop } = await site.page.evaluate(MASTHEAD)

      assert.ok(
        mainTop >= rect.bottom - 0.5,
        `<main> on ${file} starts ${mainTop}px down, above the masthead's ${rect.bottom}px`,
      )
    })
  }

  it('drops an anchor jump clear of the masthead rather than under it', async () => {
    const server = await serveStatic(repoRoot)
    const page = await openPage(`${server.origin}/${HOMEPAGE}`)
    try {
      for (const { from } of MASTHEAD_CLEARANCE) {
        const width = Math.max(from, 375)
        await page.setViewport(width, 900)
        await page.goto(`${server.origin}/${HOMEPAGE}?jump=${width}#values`)
        const landed = await page.evaluate(`
          const band = document.querySelector('#values').getBoundingClientRect()
          const head = document.querySelector('.masthead').getBoundingClientRect()
          return { band: band.top, head: head.bottom, scrolled: window.scrollY > 0 }
        `)

        assert.ok(landed.scrolled, `the page never moved to #values at ${width}px`)
        assert.ok(
          landed.band >= landed.head - 0.5,
          `#values landed ${landed.band}px down at ${width}px, under a masthead ending at ${landed.head}px`,
        )
      }
    } finally {
      await page.close()
      await server.close()
    }
  })
})

describe('Case studies task 8: the mark, 60% larger', () => {
  it('scales it by 1.6 in the stylesheet rather than by a rounded number', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.equal(declaredValue(css, [':root'], '--logo-height'), `${LOGO_BASE_HEIGHT}px`)
    assert.equal(declaredValue(css, [':root'], '--logo-scale'), String(LOGO_SCALE))
    assert.equal(declaredValue(css, ['.masthead__mark'], 'height'), `calc(${LOGO_BASE_HEIGHT}px * ${LOGO_SCALE})`)
    assert.equal(declaredValue(css, ['.masthead__mark'], 'width'), 'auto', 'the mark no longer keeps its ratio')
  })

  for (const file of [HOMEPAGE, CONTACT_PAGE, CASE_STUDIES_PAGE]) {
    const site = servedInBrowser(file)

    it(`renders it 1.6x its old height on ${file}, at every supported width`, async () => {
      for (const width of BREAKPOINTS) {
        await freshLoad(site, width)
        const { mark } = await site.page.evaluate(MASTHEAD)

        assert.ok(
          Math.abs(mark.height - LOGO_HEIGHT) < 0.5,
          `the mark on ${file} is ${mark.height}px tall at ${width}px, not ${LOGO_HEIGHT}px`,
        )
        assert.ok(
          Math.abs(mark.width / mark.height - 655 / 198) < 0.01,
          `the mark on ${file} is ${mark.width}×${mark.height} at ${width}px, off its 655×198 ratio`,
        )
      }
    })

    it(`clears the nav and the button on ${file} at every supported width`, async () => {
      for (const width of BREAKPOINTS) {
        await freshLoad(site, width)
        const head = await site.page.evaluate(MASTHEAD)

        assert.equal(head.overflow, 0, `${file} overflows by ${head.overflow}px at ${width}px`)
        assert.equal(overlap(head.logo, head.nav), false, `the mark overlaps the nav at ${width}px on ${file}`)
        assert.equal(overlap(head.logo, head.cta), false, `the mark overlaps the button at ${width}px on ${file}`)
        assert.equal(overlap(head.nav, head.cta), false, `the nav overlaps the button at ${width}px on ${file}`)
        for (const [what, part] of [['mark', head.logo], ['nav', head.nav], ['button', head.cta]]) {
          assert.ok(part.left >= -0.5, `the ${what} starts at ${part.left}px at ${width}px on ${file}`)
          assert.ok(part.right <= head.viewport + 0.5, `the ${what} is clipped at ${width}px on ${file}`)
        }
      }
    })

    it(`leaves every nav entry, "Case Studies" included, on a line of its own on ${file}`, async () => {
      for (const width of BREAKPOINTS) {
        await freshLoad(site, width)
        const { links, viewport } = await site.page.evaluate(MASTHEAD)

        assert.ok(links.some((link) => link.label === 'Case Studies'), `no "Case Studies" entry at ${width}px`)
        for (const [index, link] of links.entries()) {
          assert.ok(link.right <= viewport + 0.5, `"${link.label}" is clipped at ${width}px on ${file}`)
          for (const other of links.slice(index + 1)) {
            assert.equal(overlap(link, other), false, `"${link.label}" overlaps "${other.label}" at ${width}px`)
          }
        }
      }
    })
  }
})

describe('Case studies task 9: the pages that were already here, unbroken', () => {
  for (const file of [HOMEPAGE, CONTACT_PAGE]) {
    const site = servedInBrowser(file)

    it(`leaves ${file}'s first heading fully visible on load and while scrolled`, async () => {
      for (const width of BREAKPOINTS) {
        await freshLoad(site, width)
        const state = await site.page.evaluate(`
          const heading = document.querySelector('main h1, main h2')
          const measure = () => {
            const h = heading.getBoundingClientRect()
            const head = document.querySelector('.masthead').getBoundingClientRect()
            return { heading: h.top, bottom: h.bottom, head: head.bottom }
          }
          const onLoad = measure()
          window.scrollTo(0, 40)
          return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() =>
            resolve({ onLoad, scrolled: measure() }))))
        `)

        assert.ok(
          state.onLoad.heading >= state.onLoad.head - 0.5,
          `${file}'s heading is under the masthead at ${width}px on load`,
        )
        assert.ok(state.scrolled.head > 0, `the masthead left the viewport on ${file} at ${width}px`)
      }
    })

    it(`keeps ${file} free of console errors and dropped requests`, async () => {
      assert.deepEqual(site.page.consoleMessages, [], `${file} logged console errors or warnings`)
      assert.deepEqual(site.page.pageErrors, [], `${file} raised errors`)
      assert.deepEqual(site.page.failedRequests, [], `${file} produced failed requests`)
    })
  }

  it('changes nothing on the two pages but the nav href they share', async () => {
    for (const file of [HOMEPAGE, CONTACT_PAGE]) {
      const html = await read(file)
      const before = html.replace(`<li><a href="${CASE_STUDIES_PAGE}">Case Studies</a></li>`, '<li><a href="#">Case Studies</a></li>')

      assert.notEqual(before, html, `${file} never had its "Case Studies" tab repointed`)
      assert.ok(!before.includes(CASE_STUDIES_PAGE), `${file} names ${CASE_STUDIES_PAGE} somewhere else too`)
    }
  })

  it('leaves the legacy page set and its stylesheet alone', async () => {
    for (const file of ['about.html', 'contact.html', 'style.css']) {
      const contents = await read(file)

      assert.ok(!contents.includes('masthead'), `${file} has been given the shared masthead`)
      assert.ok(!contents.includes(CASE_STUDIES_PAGE), `${file} now links ${CASE_STUDIES_PAGE}`)
    }
  })

  it('writes down why the nav is sticky rather than fixed, and what that cost', async () => {
    const sticky = await notesSection('Sticky nav')

    assert.ok(sticky, `${CASE_STUDIES_NOTES} has no "Sticky nav" section`)
    assert.match(sticky, /position: fixed|`fixed`/, 'the notes do not say what was weighed against sticky')
    assert.match(sticky, /scroll-padding-top/, 'the notes do not say how anchor jumps clear the masthead')
  })
})
