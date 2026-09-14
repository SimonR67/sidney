// Tests for the "Softpapaya Services" home page.
// Plan: specs/24ad0907-f4a5-4d87-9555-0239522ef9df/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { openPage, serveStatic } from './browser.mjs'
import {
  HOMEPAGE,
  HOME_PARAGRAPH,
  SERVICES_NOTES,
  SERVICES_STYLESHEET,
  SERVICES_TITLE,
  SITE_NAME,
  STYLESHEET,
  read,
  repoRoot,
  tagsIn,
  textOf,
  titleOf,
} from './site.mjs'

/** The email every contact route on the page points at. */
const CONTACT = 'mailto:hello@softpapaya.com'

/** The eight nav links, in the order the header writes them. */
const NAV_LABELS = ['About', 'Services', 'Values', 'Team', 'Case Studies', 'Careers', 'Blog', 'Contact']

/** The eight services, in the order the grid writes them. */
const SERVICES = [
  'Custom Software',
  'Team Augmentation',
  'Cloud & Infrastructure',
  'AI & Automation',
  'Data Engineering',
  'Project Governance',
  'Rapid Proof of Concept',
  'UI/UX Design',
]

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
    return {
      logo: { text: logo.textContent.trim(), href: logo.getAttribute('href') },
      navCount: document.querySelectorAll('nav').length,
      navLabel: nav.getAttribute('aria-label'),
      links: [...nav.querySelectorAll('a')].map((a) => a.textContent.trim()),
      hrefs: [...nav.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      cta: cta.map((a) => a.getAttribute('href')),
    }
  `

  it('opens with a "SoftPapaya" logo linked home', async () => {
    const header = await site.page.evaluate(HEADER)

    assert.deepEqual(header.logo, { text: 'SoftPapaya', href: '#' })
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

describe('Services task 5: the eight service cards', () => {
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
    return { cards, headings: document.querySelectorAll('h3').length }
  `

  it('lists exactly the eight named services, in order', async () => {
    const { cards, headings } = await site.page.evaluate(CARDS)

    assert.deepEqual(cards.map((card) => card.title), SERVICES)
    assert.equal(headings, SERVICES.length, `the page carries ${headings} <h3>, not just the service titles`)
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
