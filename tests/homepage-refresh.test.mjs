// Tests for the home page refresh: the part-coloured hero headline, its new
// lede, the logo image in place of the text title, and the six "what we offer"
// boxes that replace the eight.
// Plan: specs/7931a152-83fe-4f91-8093-e167e642681a/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { openPage, serveStatic } from './browser.mjs'
import {
  BOXES,
  BOX_BORDERS,
  BOX_TAGS,
  HOMEPAGE,
  HERO_ACCENT,
  HERO_LEDE,
  LOGO_ASSET,
  LOGO_HEIGHT,
  OLD_BOXES,
  REFRESH_PLAN,
  SERVICES_STYLESHEET,
  declaredValue,
  read,
  repoRoot,
} from './site.mjs'

/** The three shades the boxes are outlined in, as the stylesheet declares them. */
const PAPAYA = '#e56717'
const LIME = '#32cd32'
const BLACK = '#000000'

/** The same hex written the way `getComputedStyle` reports it. */
const rgb = (hex) => {
  const digits = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16))
  return `rgb(${r}, ${g}, ${b})`
}

const SHADES = { papaya: PAPAYA, lime: LIME, black: BLACK }

/** The hero heading, split into the part that is painted and the part that is not. */
const HERO = `
  const heading = document.querySelector('.hero__heading')
  const accent = heading.querySelector('.hero__papaya')
  const lede = document.querySelector('.hero__lede')
  return {
    heading: heading.textContent.replace(/\\s+/g, ' ').trim(),
    accentText: accent?.textContent ?? null,
    accentColour: accent ? getComputedStyle(accent).color : null,
    headingColour: getComputedStyle(heading).color,
    lede: lede?.textContent.replace(/\\s+/g, ' ').trim() ?? null,
  }
`

/** The header's brand slot: the link, whatever text it renders, and any image inside it. */
const LOGO = `
  const link = document.querySelector('.masthead__logo')
  const img = link.querySelector('img')
  return {
    href: link.getAttribute('href'),
    text: link.textContent.replace(/\\s+/g, ' ').trim(),
    tags: [...link.querySelectorAll('*')].map((el) => el.tagName.toLowerCase()),
    src: img?.getAttribute('src') ?? null,
    alt: img?.getAttribute('alt') ?? null,
    naturalWidth: img?.naturalWidth ?? 0,
    naturalHeight: img?.naturalHeight ?? 0,
    height: img ? Math.round(img.getBoundingClientRect().height) : 0,
    complete: img?.complete ?? false,
  }
`

/** Every card in the section, with its copy, its tags and the colours all of them draw. */
const CARDS = `
  const grid = document.querySelector('#services .services__grid')
  return [...grid.children].map((card) => {
    const style = getComputedStyle(card)
    const tags = [...card.querySelectorAll('.tag')]
    return {
      tag: card.tagName.toLowerCase(),
      classes: [...card.classList],
      title: card.querySelector('h3')?.textContent.replace(/\\s+/g, ' ').trim() ?? null,
      copy: card.querySelector('.card__copy')?.textContent.replace(/\\s+/g, ' ').trim() ?? null,
      border: [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor],
      width: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
      radius: style.borderTopLeftRadius,
      tags: tags.map((tag) => tag.textContent.replace(/\\s+/g, ' ').trim()),
      tagColours: tags.map((tag) => {
        const s = getComputedStyle(tag)
        return {
          border: [s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor],
          background: s.backgroundColor,
        }
      }),
    }
  })
`

/** The grid's own geometry, plus every card's box, for the breakpoint checks. */
const GRID = `
  const grid = document.querySelector('#services .services__grid')
  const style = getComputedStyle(grid)
  return {
    columns: style.gridTemplateColumns.split(' ').length,
    gap: [style.rowGap, style.columnGap],
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewport: window.innerWidth,
    cards: [...grid.children].map((card) => {
      const rect = card.getBoundingClientRect()
      return { top: Math.round(rect.top), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }
    }),
  }
`

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

describe('Refresh task 1: the files behind each change, confirmed and written down', () => {
  /** The plan's file map: the rows of the one markdown table in it. */
  const fileMap = async () => {
    const plan = await read(REFRESH_PLAN)
    return plan.split(/^## \d+\. File map.*$/m).at(1)?.split(/^## /m).at(0) ?? null
  }

  it('names the one page, the one stylesheet and the asset every change lands in', async () => {
    const map = await fileMap()

    assert.ok(map, `${REFRESH_PLAN} has no "File map" section`)
    for (const file of [HOMEPAGE, SERVICES_STYLESHEET, LOGO_ASSET]) {
      assert.ok(map.includes(file), `the file map does not name ${file}`)
    }
  })

  it('records the selector behind each of the four changes', async () => {
    const map = await fileMap()

    for (const selector of ['.hero__heading', '.hero__lede', '.masthead__logo', '.services__grid']) {
      assert.ok(map.includes(selector), `the file map does not name ${selector}`)
    }
  })

  it('settles the shades against the tokens the stylesheet already declares', async () => {
    const map = await fileMap()
    const css = await read(SERVICES_STYLESHEET)

    for (const [name, hex] of Object.entries(SHADES)) {
      assert.equal(declaredValue(css, [':root'], `--${name}`), hex, `--${name} is not declared ${hex}`)
      assert.ok(map.includes(`--${name}`), `the file map does not say which token carries the ${name}`)
    }
  })

  it('serves the logo asset the header points at, as a PNG', async () => {
    const site = await serveStatic(repoRoot)
    try {
      const response = await fetch(`${site.origin}/${LOGO_ASSET}`)

      assert.equal(response.status, 200, `${LOGO_ASSET} is not served from the repository root`)
      assert.equal(response.headers.get('content-type'), 'image/png')
    } finally {
      await site.close()
    }
  })
})

describe('Refresh task 2: "REALLY WELL", and only that, in papaya', () => {
  const site = servedInBrowser()

  it('paints "REALLY WELL" papaya', async () => {
    const hero = await site.page.evaluate(HERO)

    assert.equal(hero.accentText, HERO_ACCENT, `the painted span reads "${hero.accentText}"`)
    assert.equal(hero.accentColour, rgb(PAPAYA), `"${HERO_ACCENT}" renders ${hero.accentColour}`)
  })

  it('leaves the rest of the headline the colour it already was', async () => {
    const hero = await site.page.evaluate(HERO)

    assert.equal(hero.headingColour, 'rgb(17, 17, 17)', `the headline renders ${hero.headingColour}`)
    assert.equal(hero.heading, 'WHAT WE DO. AND WE DO IT REALLY WELL.', 'the headline no longer reads word for word')
  })

  it('leaves the closing full stop out of the painted span', async () => {
    const hero = await site.page.evaluate(HERO)

    assert.ok(!hero.accentText.includes('.'), `the span reads "${hero.accentText}", full stop and all`)
  })

  it('takes the papaya from the token already declared, not a second literal', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const html = await read(HOMEPAGE)

    assert.match(css, /\.hero__papaya\s*\{[^}]*color:\s*var\(--papaya\)/, '.hero__papaya hardcodes a shade')
    assert.doesNotMatch(html, /style="/, `${HOMEPAGE} carries an inline style`)
  })
})

describe('Refresh task 3: the new paragraph under the headline', () => {
  const site = servedInBrowser()

  it('reads the new copy, word for word', async () => {
    const hero = await site.page.evaluate(HERO)

    assert.equal(hero.lede, HERO_LEDE)
  })

  it('keeps none of the paragraph it replaces', async () => {
    const html = await read(HOMEPAGE)

    for (const phrase of ['small, senior studio', 'described in a deck', 'hand us the whole delivery']) {
      assert.ok(!html.includes(phrase), `${HOMEPAGE} still carries "${phrase}" from the old lede`)
    }
  })

  it('leaves it the one paragraph directly after the headline', async () => {
    const paragraphs = await site.page.evaluate(`
      const heading = document.querySelector('.hero__heading')
      return {
        next: heading.nextElementSibling?.tagName.toLowerCase() ?? null,
        count: document.querySelectorAll('.hero p').length,
      }
    `)

    assert.equal(paragraphs.next, 'p')
    assert.equal(paragraphs.count, 1, `the hero holds ${paragraphs.count} paragraphs`)
  })
})

describe('Refresh task 4: the logo image in place of the text title', () => {
  const site = servedInBrowser()

  it('renders no "SoftPapaya" text in the header brand slot', async () => {
    const logo = await site.page.evaluate(LOGO)

    assert.equal(logo.text, '', `the brand slot still renders the text "${logo.text}"`)
    assert.deepEqual(logo.tags, ['img'], `the brand slot holds ${logo.tags.join(', ') || 'no element'}`)
  })

  it('points the image at the asset already in the repository, with alt text', async () => {
    const logo = await site.page.evaluate(LOGO)

    assert.equal(logo.src, LOGO_ASSET)
    assert.equal(logo.alt, 'SoftPapaya')
  })

  it('loads it: the image decodes rather than rendering as a broken icon', async () => {
    const logo = await site.page.evaluate(LOGO)

    assert.equal(logo.complete, true, `${LOGO_ASSET} never finished loading`)
    assert.ok(logo.naturalWidth > 0 && logo.naturalHeight > 0, `${LOGO_ASSET} decoded to 0×0`)
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })

  // The 40px cap was the height the text title this mark replaced sat at.
  // specs/4bc05d6f-e783-43e8-a21e-807feef4dbc6/plan.md enlarges the mark by 60%
  // to LOGO_HEIGHT, which the header absorbs without growing — the TALK TO US
  // button still sets its first row's height. tests/case-studies.test.mjs holds
  // the mark to that height, and to its ratio, at every supported width.
  it('keeps the home link the text title carried, and the header height it sat at', async () => {
    const logo = await site.page.evaluate(LOGO)

    assert.equal(logo.href, '#', `the brand slot links ${logo.href}`)
    assert.ok(logo.height > 0 && logo.height <= Math.ceil(LOGO_HEIGHT), `the logo renders ${logo.height}px tall`)
  })
})

describe('Refresh task 5: eight boxes out, six of the existing cards in', () => {
  const site = servedInBrowser()

  it('holds exactly six boxes', async () => {
    const cards = await site.page.evaluate(CARDS)

    assert.equal(cards.length, 6, `the section holds ${cards.length} boxes`)
  })

  it('builds each of them from the card markup already on the page', async () => {
    const cards = await site.page.evaluate(CARDS)

    for (const [index, card] of cards.entries()) {
      assert.equal(card.tag, 'li', `box ${index + 1} is a <${card.tag}>`)
      assert.deepEqual(card.classes, ['card'], `box ${index + 1} carries ${card.classes.join(', ')}`)
      assert.deepEqual(card.width, Array(4).fill('1px'), `box ${index + 1} is ${card.width.join(', ')} thick`)
      assert.equal(card.radius, '10px', `box ${index + 1} is rounded ${card.radius}`)
    }
  })

  // The footer's link list names four of the old boxes and is out of this job's
  // scope, so the check is scoped to the section the boxes were removed from.
  it('leaves no title, copy or tag of the eight it replaces in the section', async () => {
    const html = await read(HOMEPAGE)
    const css = await read(SERVICES_STYLESHEET)
    const section = html.match(/<section class="services"[\s\S]*?<\/section>/)?.[0] ?? ''

    assert.ok(section, `${HOMEPAGE} no longer holds a services section`)
    for (const { title, phrase, tag } of OLD_BOXES) {
      assert.ok(!section.includes(`>${title}<`), `the section still holds the old box "${title}"`)
      assert.ok(!html.includes(phrase), `${HOMEPAGE} still holds copy from the old box "${title}"`)
      assert.ok(!section.includes(`>${tag}<`), `the section still holds "${tag}", a tag of the old boxes`)
    }
    assert.doesNotMatch(css, /3n\s*\+?\s*\d*\s*\)/, `${SERVICES_STYLESHEET} still cycles the borders in threes`)
  })
})

describe('Refresh task 6: the six titles and their copy, in order', () => {
  const site = servedInBrowser()

  it('titles the six boxes in the order the request sets', async () => {
    const cards = await site.page.evaluate(CARDS)

    assert.deepEqual(cards.map((card) => card.title), BOXES.map((box) => box.title))
  })

  it('gives each of them its own paragraph of copy', async () => {
    const cards = await site.page.evaluate(CARDS)

    for (const [index, card] of cards.entries()) {
      assert.equal(card.copy, BOXES[index].copy, `box ${index + 1} ("${card.title}") is described wrongly`)
    }
    assert.equal(new Set(cards.map((c) => c.copy)).size, cards.length, 'two boxes share a description')
  })
})

describe('Refresh task 7: the border sequence papaya, lime, black, black, papaya, lime', () => {
  const site = servedInBrowser()

  it('outlines the six boxes in that order', async () => {
    const cards = await site.page.evaluate(CARDS)

    for (const [index, card] of cards.entries()) {
      assert.deepEqual(
        card.border,
        Array(4).fill(rgb(SHADES[BOX_BORDERS[index]])),
        `box ${index + 1} ("${card.title}") is outlined ${card.border.join(', ')}, not ${BOX_BORDERS[index]}`,
      )
    }
  })

  it('sets the sequence by position, so it survives the grid being rewritten', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.match(css, /:nth-child\(\s*6n\b/, `${SERVICES_STYLESHEET} hardcodes the boxes instead of repeating by position`)
    for (const [name, hex] of Object.entries(SHADES)) {
      assert.equal(declaredValue(css, [':root'], `--${name}`), hex)
    }
  })

  it('holds the sequence at every breakpoint, however the grid reflows', async () => {
    for (const width of [375, 768, 1200]) {
      await site.page.setViewport(width, 900)
      await site.page.goto(site.url)
      const cards = await site.page.evaluate(CARDS)

      assert.deepEqual(
        cards.map((card) => card.border[0]),
        BOX_BORDERS.map((name) => rgb(SHADES[name])),
        `the border sequence changes at ${width}px`,
      )
    }
  })
})

describe('Refresh task 8: the tags each box carries', () => {
  const site = servedInBrowser()

  it('lists the tags the six new boxes call for', async () => {
    const cards = await site.page.evaluate(CARDS)

    for (const [index, card] of cards.entries()) {
      assert.deepEqual(card.tags, BOX_TAGS[index], `box ${index + 1} ("${card.title}") lists the wrong tags`)
    }
  })

  it('leaves every box at least two of them, and none of them empty', async () => {
    const cards = await site.page.evaluate(CARDS)

    for (const card of cards) {
      assert.ok(card.tags.length >= 2, `"${card.title}" lists ${card.tags.length} tags`)
      for (const tag of card.tags) assert.ok(tag.length > 0, `"${card.title}" carries an empty tag`)
    }
  })

  it('repeats no tag from one box in another, so each stays about its own box', async () => {
    const cards = await site.page.evaluate(CARDS)
    const all = cards.flatMap((card) => card.tags)

    assert.equal(new Set(all).size, all.length, 'two boxes share a tag')
  })
})

describe('Refresh task 9: the tags painted their own box\'s shade', () => {
  const site = servedInBrowser()

  it('rings every tag in the colour its box is outlined in', async () => {
    const cards = await site.page.evaluate(CARDS)

    for (const [index, card] of cards.entries()) {
      const expected = Array(4).fill(rgb(SHADES[BOX_BORDERS[index]]))
      for (const [position, colours] of card.tagColours.entries()) {
        assert.deepEqual(
          colours.border,
          expected,
          `tag "${card.tags[position]}" in box ${index + 1} is ringed ${colours.border.join(', ')}`,
        )
      }
    }
  })

  it('leaves none of them on the grey they were', async () => {
    const cards = await site.page.evaluate(CARDS)
    const grey = 'rgb(241, 243, 245)'

    for (const card of cards) {
      for (const [position, colours] of card.tagColours.entries()) {
        assert.notEqual(colours.background, grey, `tag "${card.tags[position]}" is still on the old grey chip`)
      }
    }
  })

  it('drops the chip token the grey came from, now nothing spends it', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.ok(!css.includes('--chip'), `${SERVICES_STYLESHEET} still declares --chip`)
  })
})

describe('Refresh task 10: six boxes in the grid the eight used', () => {
  const site = servedInBrowser()

  const measure = async (width) => {
    await site.page.setViewport(width, 900)
    await site.page.goto(site.url)
    return site.page.evaluate(GRID)
  }

  it('keeps the column counts the eight-box grid had', async () => {
    for (const [width, columns] of [[375, 1], [768, 2], [1200, 3]]) {
      const grid = await measure(width)

      assert.equal(grid.columns, columns, `the grid is ${grid.columns} columns wide at ${width}px`)
    }
  })

  it('fills every row it opens: no half-empty trailing row at any breakpoint', async () => {
    for (const width of [375, 768, 1200]) {
      const grid = await measure(width)
      const rows = new Map()
      for (const card of grid.cards) rows.set(card.top, (rows.get(card.top) ?? 0) + 1)

      assert.deepEqual(
        [...rows.values()],
        Array(6 / grid.columns).fill(grid.columns),
        `at ${width}px the six boxes fall into rows of ${[...rows.values()].join(', ')}`,
      )
    }
  })

  it('keeps the gutters the grid already used', async () => {
    const grid = await measure(1200)

    assert.deepEqual(grid.gap, ['18px', '18px'], `the grid gaps are ${grid.gap.join(' / ')}`)
  })

  it('never overflows sideways, and clips no box', async () => {
    for (const width of [375, 768, 1200, 1440]) {
      const grid = await measure(width)

      assert.equal(grid.overflow, 0, `the page overflows by ${grid.overflow}px at ${width}px`)
      for (const card of grid.cards) {
        assert.ok(card.left >= 0, `a box starts at ${card.left}px at ${width}px, off the left edge`)
        assert.ok(card.right <= grid.viewport, `a box runs to ${card.right}px past ${width}px`)
      }
    }
  })
})

describe('Refresh task 11: the whole page, desktop and mobile', () => {
  const site = servedInBrowser()

  for (const [what, width] of [['desktop', 1440], ['mobile', 375]]) {
    it(`renders every changed section cleanly at ${width}px (${what})`, async () => {
      await site.page.setViewport(width, 900)
      await site.page.goto(site.url)

      const hero = await site.page.evaluate(HERO)
      const logo = await site.page.evaluate(LOGO)
      const cards = await site.page.evaluate(CARDS)
      const grid = await site.page.evaluate(GRID)

      assert.equal(hero.accentColour, rgb(PAPAYA), `the headline accent is ${hero.accentColour} at ${width}px`)
      assert.equal(hero.lede, HERO_LEDE)
      assert.ok(logo.naturalWidth > 0, `the logo is broken at ${width}px`)
      assert.equal(cards.length, 6, `${cards.length} boxes render at ${width}px`)
      assert.equal(grid.overflow, 0, `the page overflows by ${grid.overflow}px at ${width}px`)
    })
  }

  it('logs nothing to the console and drops no request along the way', async () => {
    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })
})
