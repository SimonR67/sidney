// Tests for the "Softpapaya Services" home page.
// Plan: specs/24ad0907-f4a5-4d87-9555-0239522ef9df/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { contrastRatio, openPage, parseColor, serveStatic } from './browser.mjs'
import {
  BOXES,
  HOMEPAGE,
  HOME_PARAGRAPH,
  MIN_CONTRAST,
  MIN_CONTRAST_LARGE,
  SERVICES_NOTES,
  SERVICES_STYLESHEET,
  SERVICES_TITLE,
  SITE_NAME,
  STYLESHEET,
  declaredValue,
  hexColours,
  htmlFiles,
  isLargeText,
  LOGO_ASSET,
  read,
  repoRoot,
  siteFiles,
  tagsIn,
  textOf,
  titleOf,
} from './site.mjs'

/** The email every contact route on the page points at. */
const CONTACT = 'mailto:hello@softpapaya.com'

/** The one accent colour the page is allowed to spend. */
const ACCENT = '#0a66ff'

/**
 * Every text-bearing element's colour against the background it actually sits
 * on — bar the header's call to action, whose white label on the papaya it was
 * repainted with is 3.34:1. The shade and the label colour were both given, and
 * contrast is out of scope for that job; see
 * specs/35b5ae80-1213-4bd7-8102-4c3e12e97bc2/notes.md, where it is flagged.
 */
const TEXT_ON_BACKGROUND = `
  const opaque = (colour) => {
    const [, , , a = '1'] = colour.match(/[\\d.]+/g) ?? []
    return Number(a) > 0
  }
  return [...document.querySelectorAll('body, body *')]
    .filter((el) => !el.matches('.masthead__cta'))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .map((el) => {
      let node = el
      let background = 'rgba(0, 0, 0, 0)'
      while (node) {
        const candidate = getComputedStyle(node).backgroundColor
        if (opaque(candidate)) { background = candidate; break }
        node = node.parentElement
      }
      const style = getComputedStyle(el)
      return {
        text: el.textContent.trim().slice(0, 40),
        color: style.color,
        background,
        fontSize: parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
      }
    })
`

/** The eight nav links, in the order the header writes them. */
const NAV_LABELS = ['About', 'Services', 'Values', 'Team', 'Case Studies', 'Careers', 'Blog', 'Contact']

/**
 * The services, in the order the grid writes them. The eight this page opened
 * with were replaced by these six in
 * specs/7931a152-83fe-4f91-8093-e167e642681a/plan.md.
 */
const SERVICES = BOXES.map((box) => box.title)

/**
 * Serves the repo and opens one headless-Chrome page on the home page for the
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

describe('Services task 1: the served home page, identified and written down', () => {
  /** The section of the notes under the given `## n. Heading`, up to the next heading. */
  const section = async (heading) => {
    const notes = await read(SERVICES_NOTES)
    return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
  }

  it('names the one file served at the site root', async () => {
    const discovery = await section('Discovery')

    assert.ok(discovery, `${SERVICES_NOTES} has no "Discovery" section`)
    assert.match(discovery, new RegExp(`\`${HOMEPAGE}\``), `the discovery notes do not name ${HOMEPAGE}`)
  })

  it('rules out every other homepage candidate it looked at', async () => {
    const discovery = await section('Discovery')

    for (const candidate of ['about.html', 'contact.html', 'index.php', 'package.json']) {
      assert.match(
        discovery,
        new RegExp(candidate.replace('.', '\\.')),
        `the discovery notes never say what was decided about ${candidate}`,
      )
    }
    assert.match(discovery, /no build step|no templating|static/i, 'the notes do not rule out a generated homepage')
  })

  it('says which of the old assets are orphaned by the replacement and which are not', async () => {
    const orphans = await section('Orphaned assets')

    assert.ok(orphans, `${SERVICES_NOTES} has no "Orphaned assets" section`)
    assert.match(orphans, /style\.css/, 'the notes do not account for the old stylesheet')
    assert.match(orphans, /about\.html/, 'the notes do not account for about.html')
    assert.match(orphans, /contact\.html/, 'the notes do not account for contact.html')
  })
})

describe('Services task 2: the page skeleton and its title', () => {
  it('titles the page "Softpapaya Services"', async () => {
    assert.equal(titleOf(await read(HOMEPAGE)), SERVICES_TITLE)
  })

  it('declares a doctype, a language and the new stylesheet', async () => {
    const html = await read(HOMEPAGE)

    assert.match(html, /^<!DOCTYPE html>\n<html lang="en">/, `${HOMEPAGE} lacks a doctype and language`)
    assert.match(html, new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="${SERVICES_STYLESHEET}"`))
  })

  it('is built from semantic HTML5 landmarks', async () => {
    const tags = tagsIn(await read(HOMEPAGE))

    for (const tag of ['header', 'nav', 'main', 'section', 'footer']) {
      assert.ok(tags.includes(tag), `${HOMEPAGE} has no <${tag}>`)
    }
    assert.equal(tags.filter((tag) => tag === 'main').length, 1, `${HOMEPAGE} should have exactly one <main>`)
    assert.equal(tags.filter((tag) => tag === 'h1').length, 1, `${HOMEPAGE} should have exactly one <h1>`)
  })

  it('keeps none of the superseded home page behind', async () => {
    const html = await read(HOMEPAGE)
    const text = textOf(html)

    assert.ok(!text.includes(SITE_NAME), `${HOMEPAGE} still shows the superseded site name`)
    assert.ok(!html.includes(HOME_PARAGRAPH), `${HOMEPAGE} still carries the old board advisory paragraph`)
    assert.doesNotMatch(text, /welcome to/i, `${HOMEPAGE} still carries the old welcome line`)
    for (const leftover of [STYLESHEET, 'site-title', 'site-nav__links', 'about.html', 'contact.html']) {
      assert.ok(!html.includes(leftover), `${HOMEPAGE} still references the old home page's ${leftover}`)
    }
  })

  it('closes every non-void element it opens', async () => {
    const html = await read(HOMEPAGE)
    const nonVoid = ['html', 'head', 'body', 'header', 'nav', 'main', 'section', 'footer', 'div', 'ul', 'li', 'a', 'p', 'h1', 'h2', 'h3', 'title', 'span']

    for (const tag of nonVoid) {
      const open = [...html.matchAll(new RegExp(`<${tag}\\b`, 'gi'))].length
      const close = [...html.matchAll(new RegExp(`</${tag}>`, 'gi'))].length
      assert.equal(open, close, `${HOMEPAGE} has ${open} <${tag}> against ${close} </${tag}>`)
    }
  })
})

describe('Services task 3: the header, its nav and the "TALK TO US" call to action', () => {
  const site = servedInBrowser()

  const HEADER = `
    const header = document.querySelector('header')
    const logo = header.querySelector('a')
    const nav = header.querySelector('nav')
    const cta = [...header.querySelectorAll('a')].filter((a) => a.textContent.trim() === 'TALK TO US')
    const mark = logo.querySelector('img')
    return {
      logo: { text: logo.textContent.trim(), href: logo.getAttribute('href') },
      mark: mark && { src: mark.getAttribute('src'), alt: mark.getAttribute('alt') },
      navCount: document.querySelectorAll('nav').length,
      navLabel: nav.getAttribute('aria-label'),
      links: [...nav.querySelectorAll('a')].map((a) => a.textContent.trim()),
      hrefs: [...nav.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      cta: cta.map((a) => a.getAttribute('href')),
    }
  `

  // The brand slot set the words "SoftPapaya" until
  // specs/7931a152-83fe-4f91-8093-e167e642681a/plan.md swapped them for the
  // logo image; the link it sits in is unchanged.
  it('opens with the SoftPapaya logo, linked home', async () => {
    const header = await site.page.evaluate(HEADER)

    assert.deepEqual(header.logo, { text: '', href: '#' })
    assert.deepEqual(header.mark, { src: LOGO_ASSET, alt: 'SoftPapaya' })
  })

  it('carries the eight nav links, in order, in one labelled nav', async () => {
    const header = await site.page.evaluate(HEADER)

    assert.equal(header.navCount, 1, `${HOMEPAGE} has ${header.navCount} navigations`)
    assert.equal(header.navLabel, 'Primary')
    assert.deepEqual(header.links, NAV_LABELS)
  })

  it('points every nav link at a placeholder or an in-page section, never a dead route', async () => {
    const header = await site.page.evaluate(HEADER)
    const sections = await site.page.evaluate(
      `return [...document.querySelectorAll('[id]')].map((el) => '#' + el.id)`,
    )

    for (const href of header.hrefs) {
      assert.ok(href === '#' || sections.includes(href), `the nav links ${href}, which is on no section`)
    }
  })

  it('ends the header with exactly one "TALK TO US" button, pointed at the contact address', async () => {
    const header = await site.page.evaluate(HEADER)

    assert.deepEqual(header.cta, [CONTACT])
  })
})

describe('Services task 4: the hero statement', () => {
  const site = servedInBrowser()

  const HERO = `
    const heading = document.querySelector('main h1')
    const lede = heading.nextElementSibling
    return {
      heading: heading.textContent.replace(/\\s+/g, ' ').trim(),
      inHero: !!heading.closest('section'),
      first: heading.closest('section') === document.querySelector('main section'),
      ledeTag: lede?.tagName.toLowerCase() ?? null,
      lede: lede?.textContent.replace(/\\s+/g, ' ').trim() ?? '',
    }
  `

  it('states the hero heading word for word', async () => {
    const hero = await site.page.evaluate(HERO)

    assert.equal(hero.heading, 'WHAT WE DO. AND WE DO IT REALLY WELL.')
  })

  it('opens <main> with it, inside its own section', async () => {
    const hero = await site.page.evaluate(HERO)

    assert.equal(hero.inHero, true, 'the hero heading sits outside a <section>')
    assert.equal(hero.first, true, 'the hero is not the first section of <main>')
  })

  it('follows it with a subheading paragraph of original copy', async () => {
    const hero = await site.page.evaluate(HERO)

    assert.equal(hero.ledeTag, 'p', `the hero heading is followed by a <${hero.ledeTag}>`)
    assert.ok(hero.lede.length > 40, `the subheading is only ${hero.lede.length} characters long`)
    assert.doesNotMatch(hero.lede, /lorem ipsum/i, 'the subheading is filler text')
    assert.ok(!hero.lede.includes(hero.heading), 'the subheading only repeats the heading')
  })
})

describe('Services task 5: the service cards', () => {
  const site = servedInBrowser()

  const CARDS = `
    const section = document.querySelector('#services')
    const cards = [...section.querySelectorAll('h3')].map((h3) => {
      const card = h3.parentElement
      const copy = h3.nextElementSibling
      const tags = copy?.nextElementSibling
      return {
        title: h3.textContent.replace(/\\s+/g, ' ').trim(),
        copyTag: copy?.tagName.toLowerCase() ?? null,
        copy: copy?.textContent.replace(/\\s+/g, ' ').trim() ?? '',
        tagsTag: tags?.tagName.toLowerCase() ?? null,
        tags: tags ? [...tags.children].map((el) => el.textContent.trim()) : [],
        inGrid: card.parentElement === section.querySelector('.services__grid'),
      }
    })
    return { cards, headings: section.querySelectorAll('h3').length }
  `

  it('lists exactly the named services, in order', async () => {
    const { cards, headings } = await site.page.evaluate(CARDS)

    assert.deepEqual(cards.map((card) => card.title), SERVICES)
    // Counted inside the band rather than across the page: the values band
    // specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/plan.md added titles its own
    // six boxes with the same `<h3 class="card__title">`, deliberately.
    assert.equal(headings, SERVICES.length, `the band carries ${headings} <h3>, not just the service titles`)
  })

  it('gives every card a description and a tag list, all in one grid', async () => {
    const { cards } = await site.page.evaluate(CARDS)

    for (const card of cards) {
      assert.equal(card.copyTag, 'p', `"${card.title}" is described by a <${card.copyTag}>`)
      assert.ok(card.copy.length > 40, `"${card.title}" has only a ${card.copy.length}-character description`)
      assert.equal(card.tagsTag, 'ul', `"${card.title}" lists its tags in a <${card.tagsTag}>`)
      assert.ok(card.tags.length >= 2, `"${card.title}" lists ${card.tags.length} tags`)
      for (const tag of card.tags) assert.ok(tag.length > 0, `"${card.title}" has an empty tag`)
      assert.equal(card.inGrid, true, `"${card.title}" sits outside the services grid`)
    }
  })

  it('writes a description of its own for every service', async () => {
    const { cards } = await site.page.evaluate(CARDS)
    const copy = cards.map((card) => card.copy)

    assert.equal(new Set(copy).size, copy.length, 'two service cards share a description')
  })
})

describe('Services task 6: the call-to-action band', () => {
  const site = servedInBrowser()

  const BAND = `
    const band = document.querySelector('#contact')
    const heading = band.querySelector('h2')
    const copy = band.querySelector('p')
    const button = band.querySelector('a')
    return {
      heading: heading?.textContent.replace(/\\s+/g, ' ').trim() ?? null,
      copy: copy?.textContent.replace(/\\s+/g, ' ').trim() ?? '',
      button: button ? { label: button.textContent.trim(), href: button.getAttribute('href') } : null,
      buttons: band.querySelectorAll('a').length,
      last: band === [...document.querySelectorAll('main section')].at(-1),
    }
  `

  it('asks "HAVE A PROJECT TO DISCUSS?" at the foot of <main>', async () => {
    const band = await site.page.evaluate(BAND)

    assert.equal(band.heading, 'HAVE A PROJECT TO DISCUSS?')
    assert.equal(band.last, true, 'the call-to-action band is not the last section of <main>')
  })

  it('invites the visitor in a paragraph of its own', async () => {
    const band = await site.page.evaluate(BAND)

    assert.ok(band.copy.length > 40, `the invitation is only ${band.copy.length} characters long`)
    assert.notEqual(band.copy, band.heading)
  })

  it('offers one button, and it goes somewhere', async () => {
    const band = await site.page.evaluate(BAND)

    assert.equal(band.buttons, 1, `the band carries ${band.buttons} links`)
    assert.ok(band.button.label.length > 0, 'the button has no label')
    assert.match(band.button.href, /^(mailto:|#)/, `the button points at ${band.button.href}`)
    assert.equal(band.button.href, CONTACT, 'the band points somewhere other than the one contact address')
  })
})

describe('Services task 7: the footer', () => {
  const site = servedInBrowser()

  const FOOTER = `
    const footer = document.querySelector('footer')
    const columns = [...footer.querySelectorAll('.footer__column')].map((column) => ({
      heading: column.querySelector('h2')?.textContent.trim() ?? null,
      hrefs: [...column.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      links: [...column.querySelectorAll('a')].map((a) => a.textContent.trim()),
    }))
    const contact = footer.querySelector('.footer__contact')
    const bottom = footer.querySelector('.footer__bottom')
    return {
      columns,
      blurb: footer.querySelector('.footer__blurb')?.textContent.replace(/\\s+/g, ' ').trim() ?? null,
      contact: {
        heading: contact?.querySelector('h2')?.textContent.trim() ?? null,
        mailto: [...(contact?.querySelectorAll('a') ?? [])]
          .map((a) => a.getAttribute('href'))
          .filter((href) => href.startsWith('mailto:')),
      },
      bottom: {
        text: bottom?.textContent.replace(/\\s+/g, ' ').trim() ?? '',
        links: [...(bottom?.querySelectorAll('a') ?? [])].map((a) => ({
          label: a.textContent.trim(),
          href: a.getAttribute('href'),
        })),
      },
    }
  `

  it('offers the four link columns, each with placeholder links', async () => {
    const footer = await site.page.evaluate(FOOTER)

    assert.deepEqual(footer.columns.map((column) => column.heading), ['Services', 'Work', 'About', 'Careers'])
    for (const column of footer.columns) {
      assert.ok(column.links.length >= 3, `the ${column.heading} column offers ${column.links.length} links`)
      assert.deepEqual(
        [...new Set(column.hrefs)],
        ['#'],
        `the ${column.heading} column links somewhere other than a placeholder`,
      )
    }
  })

  it('carries a contact block with the email address in it', async () => {
    const footer = await site.page.evaluate(FOOTER)

    assert.equal(footer.contact.heading, 'Contact')
    assert.deepEqual(footer.contact.mailto, [CONTACT])
  })

  it('says who SoftPapaya is in a short blurb', async () => {
    const footer = await site.page.evaluate(FOOTER)

    assert.ok(footer.blurb, 'the footer carries no company blurb')
    assert.ok(footer.blurb.length > 40, `the blurb is only ${footer.blurb.length} characters long`)
  })

  it('closes with a copyright line and the two legal links', async () => {
    const footer = await site.page.evaluate(FOOTER)

    assert.match(footer.bottom.text, /©/, 'the bottom bar carries no copyright notice')
    assert.match(footer.bottom.text, /SoftPapaya/)
    assert.deepEqual(footer.bottom.links, [
      { label: 'Privacy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ])
  })
})

describe('Services task 8: the base visual system', () => {
  const site = servedInBrowser()

  const STYLE = `
    const of = (selector) => {
      const el = document.querySelector(selector)
      const style = getComputedStyle(el)
      return {
        color: style.color,
        background: style.backgroundColor,
        fontFamily: style.fontFamily,
        fontWeight: Number(style.fontWeight),
        letterSpacing: style.letterSpacing,
        borderRadius: style.borderTopLeftRadius,
        padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
        maxWidth: style.maxWidth,
      }
    }
    return {
      body: of('body'),
      h1: of('h1'),
      h2: of('h2'),
      // The band's button, not the header's: that one is papaya now, and
      // tests/styling-update.test.mjs holds it to the rest of this shape.
      button: of('.invitation .button--accent'),
      container: of('.container'),
    }
  `

  it('writes near-black copy on a white page', async () => {
    const { body } = await site.page.evaluate(STYLE)

    assert.equal(body.background, 'rgb(255, 255, 255)', `the page is ${body.background}`)
    const { r, g, b } = parseColor(body.color)
    for (const channel of [r, g, b]) {
      assert.ok(channel >= 0x1a && channel <= 0x22, `the body copy is ${body.color}, outside #1A1A1A–#222222`)
    }
  })

  it('sets a sans-serif stack that falls back past Inter', async () => {
    const { body } = await site.page.evaluate(STYLE)
    const stack = body.fontFamily.split(',').map((name) => name.trim().replace(/^["']|["']$/g, ''))

    assert.deepEqual(stack, ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'])
  })

  it('sets the headings bold and tracked out', async () => {
    const { h1, h2 } = await site.page.evaluate(STYLE)

    for (const [what, heading] of [['h1', h1], ['h2', h2]]) {
      assert.ok(heading.fontWeight >= 600, `the ${what} is only weight ${heading.fontWeight}`)
      assert.ok(
        parseFloat(heading.letterSpacing) > 0,
        `the ${what} has ${heading.letterSpacing} of letter-spacing, so it is not tracked out`,
      )
    }
  })

  it('rounds the accent button and pads it to the specified size', async () => {
    const { button } = await site.page.evaluate(STYLE)
    const radius = parseFloat(button.borderRadius)

    assert.deepEqual(parseColor(button.background), { r: 0x0a, g: 0x66, b: 0xff, a: 1 }, `the button is ${button.background}`)
    assert.ok(radius >= 6 && radius <= 8, `the button's corner radius is ${button.borderRadius}`)
    assert.deepEqual(button.padding, ['12px', '24px', '12px', '24px'], 'the button is not padded 12px 24px')
    assert.ok(
      contrastRatio(parseColor(button.color), parseColor(button.background)) >= MIN_CONTRAST,
      `the button label ${button.color} is illegible on ${button.background}`,
    )
  })

  it('centres the page on a 1200px container', async () => {
    const { container } = await site.page.evaluate(STYLE)

    assert.equal(container.maxWidth, '1200px')
  })

  it('takes the accent from one custom property, written once', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.equal(declaredValue(css, [':root'], '--accent'), ACCENT)
    assert.equal(
      hexColours(css).filter((colour) => colour === ACCENT).length,
      1,
      `${ACCENT} is written more than once in ${SERVICES_STYLESHEET}; it should come from --accent`,
    )
  })

  it('paints every accent on the page with that one colour', async () => {
    // The header's call to action is filled with papaya now, so the accent it
    // still carries is its border rather than its background; every other
    // accent surface is unchanged.
    const accents = await site.page.evaluate(`
      return [...document.querySelectorAll('.button--accent:not(.masthead__cta)')]
        .map((el) => getComputedStyle(el).backgroundColor)
        .concat(getComputedStyle(document.querySelector('.masthead__cta')).borderTopColor)
    `)

    assert.ok(accents.length >= 2, `only ${accents.length} accent surfaces on the page`)
    for (const accent of accents) {
      assert.deepEqual(parseColor(accent), { r: 0x0a, g: 0x66, b: 0xff, a: 1 }, `an accent renders as ${accent}`)
    }
  })

  it('keeps every line of text legible against the surface it sits on', async () => {
    const lines = await site.page.evaluate(TEXT_ON_BACKGROUND)

    assert.ok(lines.length > 0, 'no text found on the page')
    for (const line of lines) {
      const ratio = contrastRatio(parseColor(line.color), parseColor(line.background))
      const large = isLargeText(line.fontSize, line.fontWeight)
      const floor = large ? MIN_CONTRAST_LARGE : MIN_CONTRAST

      assert.ok(
        ratio >= floor,
        `"${line.text}": ${line.color} on ${line.background} is ${ratio.toFixed(2)}:1, ` +
          `under the ${floor}:1 AA asks of ${large ? 'large' : 'body'} text`,
      )
    }
  })
})

describe('Services task 9: the layout at every breakpoint', () => {
  const site = servedInBrowser()

  const LAYOUT = `
    const box = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect()
      return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
    }
    return {
      columns: getComputedStyle(document.querySelector('.services__grid')).gridTemplateColumns.split(' ').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      viewport: window.innerWidth,
      logo: box('.masthead__logo'),
      nav: box('.masthead__nav'),
      cta: box('.masthead__cta'),
      cards: [...document.querySelectorAll('.card')].map((card) => {
        const rect = card.getBoundingClientRect()
        return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
      }),
    }
  `

  const overlap = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

  const measure = async (width) => {
    await site.page.setViewport(width, 900)
    await site.page.goto(site.url)
    return site.page.evaluate(LAYOUT)
  }

  it('stacks the services into one column on a 375px screen', async () => {
    const layout = await measure(375)

    assert.equal(layout.columns, 1, `the grid is ${layout.columns} columns wide at 375px`)
  })

  it('opens the services out to three columns from 1200px up', async () => {
    for (const width of [1200, 1440]) {
      const layout = await measure(width)

      assert.equal(layout.columns, 3, `the grid is ${layout.columns} columns wide at ${width}px`)
    }
  })

  it('never overflows sideways, at any of the three breakpoints', async () => {
    for (const width of [375, 768, 1200]) {
      const layout = await measure(width)

      assert.equal(layout.overflow, 0, `the page overflows by ${layout.overflow}px at ${width}px`)
      for (const card of layout.cards) {
        assert.ok(card.left >= 0, `a card starts at ${card.left}px at ${width}px, off the left edge`)
        assert.ok(card.right <= layout.viewport, `a card runs to ${card.right}px past ${width}px`)
      }
    }
  })

  it('keeps the nav clear of the logo and the call to action on a narrow screen', async () => {
    const layout = await measure(375)

    assert.equal(overlap(layout.nav, layout.cta), false, 'the nav overlaps the TALK TO US button')
    assert.equal(overlap(layout.nav, layout.logo), false, 'the nav overlaps the logo')
    assert.equal(overlap(layout.logo, layout.cta), false, 'the logo overlaps the TALK TO US button')
    for (const [what, part] of [['nav', layout.nav], ['button', layout.cta], ['logo', layout.logo]]) {
      assert.ok(part.right <= layout.viewport, `the ${what} is clipped: it runs to ${part.right}px`)
      assert.ok(part.left >= 0, `the ${what} starts at ${part.left}px, off the left edge`)
    }
  })

  it('lets cards differ in height without letting them overlap each other', async () => {
    const layout = await measure(1200)

    for (const [index, card] of layout.cards.entries()) {
      for (const other of layout.cards.slice(index + 1)) {
        assert.equal(overlap(card, other), false, `card ${index + 1} overlaps a neighbour at 1200px`)
      }
    }
  })
})

describe('Services task 10: the page without JavaScript, and without the webfont', () => {
  const site = servedInBrowser()

  /** Enough of the rendered page to tell whether anything moved or disappeared. */
  const RENDERED = `
    const sections = [...document.querySelectorAll('header, main section, footer')].map((el) => {
      const rect = el.getBoundingClientRect()
      return { tag: el.tagName.toLowerCase(), height: Math.round(rect.height), text: el.textContent.trim().length }
    })
    return {
      sections,
      font: getComputedStyle(document.body).fontFamily,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      documentHeight: Math.round(document.documentElement.getBoundingClientRect().height),
    }
  `

  it('depends on no script at all', async () => {
    const html = await read(HOMEPAGE)

    assert.ok(!tagsIn(html).includes('script'), `${HOMEPAGE} carries a <script>`)
    assert.doesNotMatch(html, /\son[a-z]+="/i, `${HOMEPAGE} carries an inline event handler`)
    assert.doesNotMatch(html, /href="javascript:/i, `${HOMEPAGE} carries a javascript: link`)
  })

  it('renders the same page with JavaScript disabled', async () => {
    const { page } = site
    await page.setViewport(1280, 900)
    await page.goto(site.url)
    const withScripts = await page.evaluate(RENDERED)

    await page.setScriptExecution(false)
    await page.goto(site.url)
    const withoutScripts = await page.evaluate(RENDERED)
    await page.setScriptExecution(true)

    assert.deepEqual(withoutScripts.sections, withScripts.sections, 'a section moved or emptied without JavaScript')
    assert.equal(withoutScripts.documentHeight, withScripts.documentHeight)
    assert.equal(withoutScripts.overflow, 0)
    for (const section of withoutScripts.sections) {
      assert.ok(section.text > 0, `the <${section.tag}> renders no text without JavaScript`)
    }
  })

  it('leaves every link inert rather than broken', async () => {
    const { links } = await site.page.evaluate(RENDERED)

    assert.ok(links.length > 0, 'the page carries no links')
    for (const href of links) {
      assert.match(href, /^(#|mailto:)/, `${href} needs a destination this page does not have`)
    }
  })

  it('asks the network for nothing but its own files', async () => {
    const external = site.page.requests.filter((url) => !url.startsWith(site.origin) && !url.startsWith('data:'))

    assert.deepEqual(external, [], 'the page loads something from outside the site')
  })

  it('names Inter but loads no webfont, so the fallback stack is the default path', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const html = await read(HOMEPAGE)

    assert.doesNotMatch(css, /@import|@font-face/i, `${SERVICES_STYLESHEET} pulls in a font file`)
    assert.doesNotMatch(html, /rel="preconnect"|fonts\.googleapis|fonts\.gstatic/i, `${HOMEPAGE} links a font CDN`)
  })

  it('renders identically with the font CDNs blocked', async () => {
    const { page } = site
    await page.goto(site.url)
    const before = await page.evaluate(RENDERED)

    await page.blockUrls(['*fonts.googleapis.com*', '*fonts.gstatic.com*', '*.woff', '*.woff2'])
    await page.goto(site.url)
    const after = await page.evaluate(RENDERED)

    assert.deepEqual(after.sections, before.sections, 'the layout moved when the font CDNs were blocked')
    assert.equal(after.font, before.font)
    assert.equal(after.overflow, 0)
    assert.deepEqual(page.failedRequests, [], 'blocking the font CDNs failed a request the page needed')
  })

  it('logs nothing to the console and drops no request along the way', async () => {
    const { page } = site

    assert.deepEqual(page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(page.failedRequests, [], 'the page produced failed requests')
  })
})

describe('Services task 11: one home page, and nothing orphaned behind it', () => {
  const site = servedInBrowser()

  it('serves the Softpapaya Services page at the site root', async () => {
    const { page } = site
    await page.goto(`${site.origin}/`)
    const served = await page.evaluate(`
      return { title: document.title, heading: document.querySelector('h1').textContent.replace(/\\s+/g, ' ').trim() }
    `)

    assert.equal(served.title, SERVICES_TITLE)
    assert.equal(served.heading, 'WHAT WE DO. AND WE DO IT REALLY WELL.')
  })

  it('holds exactly one file a static host can serve as the root', async () => {
    const roots = (await siteFiles()).filter((file) => /^index\.[a-z]+$/.test(file) || file.includes('/index.'))

    assert.deepEqual(roots, [HOMEPAGE])
  })

  it('leaves no second page carrying home page content', async () => {
    for (const file of await htmlFiles()) {
      if (file === HOMEPAGE) continue
      const html = await read(file)

      assert.ok(!html.includes(SERVICES_TITLE), `${file} also carries the Softpapaya Services title`)
      assert.ok(!html.includes('WHAT WE DO.'), `${file} also carries the hero statement`)
      assert.ok(!html.includes(SERVICES_STYLESHEET), `${file} also links the home page stylesheet`)
    }
  })

  it('orphans no stylesheet: every one shipped is linked by a page that ships', async () => {
    const stylesheets = (await siteFiles()).filter((file) => file.endsWith('.css'))
    const pages = await Promise.all((await htmlFiles()).map((file) => read(file)))

    assert.deepEqual(stylesheets, [STYLESHEET, SERVICES_STYLESHEET])
    for (const stylesheet of stylesheets) {
      assert.ok(
        pages.some((html) => html.includes(`href="${stylesheet}"`)),
        `${stylesheet} is linked by no page, so it is orphaned`,
      )
    }
  })

  it('loads that one stylesheet and no other on the home page', async () => {
    const { page } = site
    await page.goto(site.url)
    const loaded = await page.evaluate(`
      return [...document.styleSheets].map((sheet) => sheet.href).filter(Boolean)
    `)

    assert.deepEqual(
      loaded.map((href) => href.slice(site.origin.length + 1)),
      [SERVICES_STYLESHEET],
    )
  })
})
