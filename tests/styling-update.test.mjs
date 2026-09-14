// Tests for the single page's navigation colours and "what we offer" box borders.
// Plan: specs/35b5ae80-1213-4bd7-8102-4c3e12e97bc2/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { openPage, serveStatic } from './browser.mjs'
import {
  HOMEPAGE,
  SERVICES_STYLESHEET,
  STYLESHEET,
  declaredValue,
  hexColours,
  parseHex,
  read,
  repoRoot,
} from './site.mjs'

/** Where this job's discovery and its flagged edge cases are written down. */
const NOTES = 'specs/35b5ae80-1213-4bd7-8102-4c3e12e97bc2/notes.md'

/** The three shades the request names, and the blue they are scoped around. */
const PAPAYA = '#e56717'
const LIME = '#32cd32'
const BLACK = '#000000'
const ACCENT = '#0a66ff'
const ACCENT_PRESSED = '#0850cc'

/**
 * The border colour of each box, in the order the grid writes them. The section
 * was cut from eight boxes to six, and the cycle from papaya-lime-black to
 * papaya-lime-black-black-papaya-lime, by
 * specs/7931a152-83fe-4f91-8093-e167e642681a/plan.md.
 */
const BOX_BORDERS = [PAPAYA, LIME, BLACK, BLACK, PAPAYA, LIME]

/** The same hex written the way `getComputedStyle` reports it. */
const rgb = (hex) => {
  const { r, g, b } = parseHex(hex)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Every property of the "TALK TO US" button except the one background colour
 * this job changes, as the button rendered before the change. Spec and plan put
 * all of these out of scope, so they are the baseline the change is held to.
 */
const CTA_UNCHANGED = {
  color: 'rgb(255, 255, 255)',
  borderColor: rgb(ACCENT),
  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: '7px',
  padding: ['12px', '24px', '12px', '24px'],
  fontSize: '13px',
  fontWeight: '600',
  letterSpacing: '1.04px',
}

/** The default, un-hovered state of a nav item, before and after the change alike. */
const NAV_DEFAULT = {
  color: 'rgb(26, 26, 26)',
  fontWeight: '400',
  fontSize: '14px',
  background: 'rgba(0, 0, 0, 0)',
  textDecorationLine: 'none',
}

/** The eight nav links, in the order the header writes them. */
const NAV_LABELS = ['About', 'Services', 'Values', 'Team', 'Case Studies', 'Careers', 'Blog', 'Contact']

/** The one link in the header this job paints rather than leaves to its hover. */
const CTA = '.masthead__cta'

/** The nth nav item's link, addressed by position so hover can be forced on each in turn. */
const navLink = (position) => `.masthead__links li:nth-child(${position}) a`

const CTA_STYLE = `
  const style = getComputedStyle(document.querySelector('.masthead__cta'))
  return {
    background: style.backgroundColor,
    color: style.color,
    borderColor: style.borderTopColor,
    borderWidth: style.borderTopWidth,
    borderStyle: style.borderTopStyle,
    borderRadius: style.borderTopLeftRadius,
    padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
  }
`

const linkStyle = (selector) => `
  const style = getComputedStyle(document.querySelector('${selector}'))
  return {
    color: style.color,
    fontWeight: style.fontWeight,
    fontSize: style.fontSize,
    background: style.backgroundColor,
    textDecorationLine: style.textDecorationLine,
  }
`

const BOXES = `
  return [...document.querySelectorAll('#services .services__grid > .card')].map((card) => {
    const style = getComputedStyle(card)
    return {
      title: card.querySelector('h3').textContent.replace(/\\s+/g, ' ').trim(),
      colour: [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor],
      width: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
      style: [style.borderTopStyle, style.borderRightStyle, style.borderBottomStyle, style.borderLeftStyle],
      radius: [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ],
    }
  })
`

/** Every element on the page that draws a border, and the colour it draws it in. */
const BORDERS = `
  return [...document.querySelectorAll('body, body *')]
    .map((el) => ({ el, style: getComputedStyle(el) }))
    .filter(({ style }) => ['Top', 'Right', 'Bottom', 'Left'].some((side) =>
      parseFloat(style['border' + side + 'Width']) > 0 && style['border' + side + 'Style'] !== 'none'))
    .map(({ el, style }) => ({
      what: el.tagName.toLowerCase() + (el.className ? '.' + [...el.classList].join('.') : ''),
      card: el.matches('.services__grid > .card'),
      tag: el.matches('.services__grid .tag'),
      colours: [...new Set([
        style.borderTopColor,
        style.borderRightColor,
        style.borderBottomColor,
        style.borderLeftColor,
      ])],
    }))
`

/**
 * Serves the repo and opens one headless-Chrome page on the single page for the
 * enclosing suite. `page`/`origin` are filled in by the time tests run.
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

/** Reads `selector`'s computed style with `pseudo` (e.g. `['hover']`) forced on it. */
const whileForced = async (page, selector, pseudo) => {
  await page.forcePseudoState(selector, pseudo)
  try {
    return await page.evaluate(linkStyle(selector))
  } finally {
    await page.forcePseudoState(selector, [])
  }
}

describe('Styling task 1: the page, the stylesheet and the selectors, written down', () => {
  /** The section of the notes under the given `## n. Heading`, up to the next heading. */
  const section = async (heading) => {
    const notes = await read(NOTES)
    return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
  }

  it('names the single page and the one stylesheet that styles it', async () => {
    const discovery = await section('Discovery')

    assert.ok(discovery, `${NOTES} has no "Discovery" section`)
    for (const file of [HOMEPAGE, SERVICES_STYLESHEET]) {
      assert.match(discovery, new RegExp(`\`${file}\``), `the discovery notes do not name ${file}`)
    }
    for (const file of ['about.html', 'contact.html', STYLESHEET]) {
      assert.match(discovery, new RegExp(file.replace('.', '\\.')), `the notes never say what was decided about ${file}`)
    }
  })

  it('records the selector behind each of the three changes', async () => {
    const discovery = await section('Discovery')

    for (const selector of ['.masthead__cta', '.masthead__links a:hover', '.services__grid', '--accent']) {
      assert.ok(discovery.includes(selector), `the discovery notes do not name ${selector}`)
    }
  })

  it('rules out each edge case the spec asks to be flagged rather than guessed at', async () => {
    const discovery = await section('Discovery')

    assert.match(discovery, /flat colour/i, 'the notes do not say whether the button background is a flat colour')
    assert.match(discovery, /pure CSS|no `?<script>?`?/i, 'the notes do not say whether the hover is CSS or JavaScript')
    assert.match(discovery, /eight/i, 'the notes do not say how many boxes the section holds')
    assert.match(discovery, /shared/i, 'the notes do not say whether the blue comes from a shared custom property')
  })

  it('flags the consequences it did not resolve on its own', async () => {
    const flagged = await section('Flagged for the reviewer')

    assert.ok(flagged, `${NOTES} has no "Flagged for the reviewer" section`)
    assert.match(flagged, /border/i, 'the notes do not flag what happens to the button border')
    assert.match(flagged, /3\.34:1|contrast/i, 'the notes do not flag the contrast of the orange button')
    assert.match(flagged, /footer/i, 'the notes do not settle whether the footer links count as navigation')
    assert.match(flagged, /focus/i, 'the notes do not settle whether the change extends to the focus state')
  })
})

describe('Styling task 2: the "TALK TO US" button, papaya in its base state', () => {
  const site = servedInBrowser()

  it('paints its base background papaya orange', async () => {
    const cta = await site.page.evaluate(CTA_STYLE)

    assert.equal(cta.background, rgb(PAPAYA), `the call to action is ${cta.background}`)
  })

  it('changes nothing else about the button', async () => {
    const { background, ...rest } = await site.page.evaluate(CTA_STYLE)

    assert.deepEqual(rest, CTA_UNCHANGED)
  })

  it('leaves its hover and active states on the accent they already had', async () => {
    for (const pseudo of ['hover', 'active']) {
      await site.page.forcePseudoState(CTA, [pseudo])
      const cta = await site.page.evaluate(CTA_STYLE)
      await site.page.forcePseudoState(CTA, [])

      assert.equal(cta.background, rgb(ACCENT_PRESSED), `the call to action is ${cta.background} on :${pseudo}`)
    }
  })

  it('takes the papaya from one custom property, written once', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.equal(declaredValue(css, [':root'], '--papaya'), PAPAYA)
    assert.equal(
      hexColours(css).filter((colour) => colour === PAPAYA).length,
      1,
      `${PAPAYA} is written more than once in ${SERVICES_STYLESHEET}; it should come from --papaya`,
    )
  })
})

describe('Styling task 3: the other nav items, papaya and bold on hover', () => {
  const site = servedInBrowser()

  it('hovers every one of the eight nav items papaya orange and bold', async () => {
    for (const [index, label] of NAV_LABELS.entries()) {
      const hovered = await whileForced(site.page, navLink(index + 1), ['hover'])

      assert.equal(hovered.color, rgb(PAPAYA), `"${label}" highlights ${hovered.color} on hover`)
      assert.equal(hovered.fontWeight, '700', `"${label}" is weight ${hovered.fontWeight} on hover`)
    }
  })

  it('leaves their default state exactly as it was', async () => {
    for (const [index, label] of NAV_LABELS.entries()) {
      const resting = await site.page.evaluate(linkStyle(navLink(index + 1)))

      assert.deepEqual(resting, NAV_DEFAULT, `"${label}" does not rest in its original state`)
    }
  })

  it('leaves the call to action out of the nav hover rule', async () => {
    const hovered = await whileForced(site.page, CTA, ['hover'])

    assert.notEqual(hovered.color, rgb(PAPAYA), 'the call to action picked up the nav items\' hover colour')
    assert.equal(hovered.fontWeight, '600', `the call to action is weight ${hovered.fontWeight} on hover`)
  })
})

describe('Styling task 4: the hover reverting when the mouse leaves', () => {
  const site = servedInBrowser()

  it('returns every nav item to the state it was in before it was hovered', async () => {
    for (const [index, label] of NAV_LABELS.entries()) {
      const selector = navLink(index + 1)
      const before = await site.page.evaluate(linkStyle(selector))

      await site.page.forcePseudoState(selector, ['hover'])
      await site.page.forcePseudoState(selector, [])
      const after = await site.page.evaluate(linkStyle(selector))

      assert.deepEqual(after, before, `"${label}" did not revert after the hover was cleared`)
      assert.deepEqual(after, NAV_DEFAULT, `"${label}" reverted to something other than its original default`)
    }
  })

  it('reverts the colour and the weight together, leaving neither behind', async () => {
    const selector = navLink(1)

    await site.page.forcePseudoState(selector, ['hover'])
    await site.page.forcePseudoState(selector, [])
    const after = await site.page.evaluate(linkStyle(selector))

    assert.equal(after.color, NAV_DEFAULT.color, `the highlight stayed at ${after.color}`)
    assert.equal(after.fontWeight, NAV_DEFAULT.fontWeight, `the text stayed at weight ${after.fontWeight}`)
  })
})

describe('Styling task 5: the "what we offer" boxes and their border colours', () => {
  const site = servedInBrowser()

  it('borders the boxes papaya, lime, black, black, papaya, lime, in order', async () => {
    const boxes = await site.page.evaluate(BOXES)

    assert.equal(boxes.length, BOX_BORDERS.length, `the section holds ${boxes.length} boxes`)
    for (const [index, box] of boxes.entries()) {
      assert.deepEqual(
        box.colour,
        Array(4).fill(rgb(BOX_BORDERS[index])),
        `box ${index + 1} ("${box.title}") is bordered ${box.colour.join(', ')}`,
      )
    }
  })

  it('leaves the border width, style and radius of every box as it found them', async () => {
    const boxes = await site.page.evaluate(BOXES)

    for (const [index, box] of boxes.entries()) {
      assert.deepEqual(box.width, Array(4).fill('1px'), `box ${index + 1} is ${box.width.join(', ')} thick`)
      assert.deepEqual(box.style, Array(4).fill('solid'), `box ${index + 1} is drawn ${box.style.join(', ')}`)
      assert.deepEqual(box.radius, Array(4).fill('10px'), `box ${index + 1} is rounded ${box.radius.join(', ')}`)
    }
  })

  it('sets the pattern by position, so it survives the grid being rewritten', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.match(css, /:nth-child\(\s*6n\b/, `${SERVICES_STYLESHEET} hardcodes the boxes instead of repeating by position`)
    for (const [property, colour] of [['--lime', LIME], ['--black', BLACK]]) {
      assert.equal(declaredValue(css, [':root'], property), colour)
      assert.equal(
        hexColours(css).filter((hex) => hex === colour).length,
        1,
        `${colour} is written more than once in ${SERVICES_STYLESHEET}; it should come from ${property}`,
      )
    }
  })

  it('holds the pattern at every breakpoint, however the grid reflows', async () => {
    for (const width of [375, 768, 1200]) {
      await site.page.setViewport(width, 900)
      await site.page.goto(site.url)
      const boxes = await site.page.evaluate(BOXES)

      assert.deepEqual(
        boxes.map((box) => box.colour[0]),
        BOX_BORDERS.map(rgb),
        `the border sequence changes at ${width}px`,
      )
    }
  })
})

describe('Styling task 6: nothing else on the page moved', () => {
  const site = servedInBrowser()

  // The boxes' own tags were brought into the sequence by
  // specs/7931a152-83fe-4f91-8093-e167e642681a/plan.md, so they are exempt too;
  // tests/homepage-refresh.test.mjs holds each one to its own box's shade.
  it('touches no border outside the boxes and the tags inside them', async () => {
    const borders = await site.page.evaluate(BORDERS)
    const introduced = [PAPAYA, LIME, BLACK].map(rgb)

    assert.ok(borders.some((border) => border.card), 'no bordered boxes found, so the check proves nothing')
    assert.ok(borders.some((border) => border.tag), 'no bordered tags found, so the check proves nothing')
    for (const border of borders.filter((b) => !b.card && !b.tag)) {
      for (const colour of border.colours) {
        assert.ok(
          !introduced.includes(colour),
          `${border.what} draws a ${colour} border, outside the "what we offer" boxes`,
        )
      }
    }
  })

  it('leaves the accent, and everything still painted with it, alone', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const accents = await site.page.evaluate(`
      return {
        band: getComputedStyle(document.querySelector('.invitation .button--accent')).backgroundColor,
        outline: getComputedStyle(document.querySelector('.masthead__cta')).outlineColor,
        ctaBorder: getComputedStyle(document.querySelector('.masthead__cta')).borderTopColor,
      }
    `)

    assert.equal(declaredValue(css, [':root'], '--accent'), ACCENT)
    assert.equal(accents.band, rgb(ACCENT), `the band's button is ${accents.band}`)
    assert.equal(accents.ctaBorder, rgb(ACCENT), `the call to action's border is ${accents.ctaBorder}`)
  })

  // The markup did change afterwards — the section was cut to six boxes by
  // specs/7931a152-83fe-4f91-8093-e167e642681a/plan.md — but the shades are
  // still spent from the stylesheet alone, which is what this check is for.
  it('keeps the shades in the stylesheet, never in the markup', async () => {
    const html = await read(HOMEPAGE)
    const grid = html.match(/<ul class="services__grid">[\s\S]*?\n {10}<\/ul>/)?.[0] ?? ''

    assert.equal([...grid.matchAll(/<li class="card">/g)].length, 6, 'the boxes no longer carry the bare card class')
    assert.doesNotMatch(html, /style="/, `${HOMEPAGE} carries an inline style`)
    assert.doesNotMatch(html, new RegExp(PAPAYA.slice(1) + '|' + LIME.slice(1), 'i'), `${HOMEPAGE} hardcodes a shade`)
  })

  it('reaches no other page: the legacy stylesheet knows none of the three shades', async () => {
    const legacy = await read(STYLESHEET)

    for (const colour of [PAPAYA, LIME, BLACK]) {
      assert.ok(!hexColours(legacy).includes(colour), `${STYLESHEET} now carries ${colour}`)
    }
    for (const file of ['about.html', 'contact.html']) {
      assert.ok(!(await read(file)).includes(SERVICES_STYLESHEET), `${file} links ${SERVICES_STYLESHEET}`)
    }
  })
})
