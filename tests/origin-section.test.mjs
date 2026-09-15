// Tests for the "WHERE WE'VE COME FROM" section and the "About" nav link that
// now scrolls to it.
// Plan: specs/6cbe8670-bc69-497e-838f-81bd88499f36/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { openPage, serveStatic } from './browser.mjs'
import {
  HOMEPAGE,
  ORIGIN_ANCHOR,
  ORIGIN_HEADING,
  ORIGIN_NOTES,
  ORIGIN_PARAGRAPHS,
  SERVICES_STYLESHEET,
  read,
  repoRoot,
} from './site.mjs'

/** The request's own copy, as the spec wrote it down — the verbatim check's source. */
const SPEC = 'specs/6cbe8670-bc69-497e-838f-81bd88499f36/spec.md'

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
  const notes = await read(ORIGIN_NOTES)
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

describe('Origin task 1: the heading, the wrapper, the id convention and the scroll mechanism', () => {
  it('names the heading element and the class it takes its styling from', async () => {
    const discovery = await notesSection('Discovery')

    assert.ok(discovery, `${ORIGIN_NOTES} has no "Discovery" section`)
    assert.match(discovery, /`\.section__heading`/, 'the notes do not name the heading class to reuse')
    assert.match(discovery, /<h2/, 'the notes do not say which element carries the heading')
    for (const file of [HOMEPAGE, SERVICES_STYLESHEET]) {
      assert.ok(discovery.includes(file), `the discovery notes do not name ${file}`)
    }
  })

  it('records the section wrapper pattern and the anchor id convention it found', async () => {
    const discovery = await notesSection('Discovery')

    assert.match(discovery, /`\.container`/, 'the notes do not name the layout container every band uses')
    assert.match(discovery, /aria-labelledby/, 'the notes do not record the labelling pattern sections follow')
    assert.match(discovery, /#services/, 'the notes do not record the existing section anchor convention')
  })

  it('settles what "Services" actually does, and rules the alternatives out', async () => {
    const mechanism = await notesSection('Scroll mechanism')

    assert.ok(mechanism, `${ORIGIN_NOTES} has no "Scroll mechanism" section`)
    assert.match(mechanism, /href="#services"/, 'the notes do not quote the link "Services" is wired through')
    assert.match(mechanism, /scroll-behavior/, 'the notes do not say whether the jump is smoothed')
    assert.match(mechanism, /scrollIntoView/, 'the notes do not rule out a JavaScript scroll handler')
    assert.match(mechanism, /no (<script>|javascript|script)/i, 'the notes do not record that the page ships no script')
  })
})

describe('Origin task 2: whether an "About" slot already exists to fill instead', () => {
  it('states where the new section goes, and why', async () => {
    const placement = await notesSection('Placement')

    assert.ok(placement, `${ORIGIN_NOTES} has no "Placement" section`)
    assert.match(
      placement,
      /no existing About (slot|section)|existing About (slot|section) found/i,
      'the notes do not settle whether an About slot already existed',
    )
    assert.match(placement, /WHAT WE OFFER/, 'the notes do not say which section the new one follows')
  })

  it('accounts for the two places "About" already appears, and leaves both standing', async () => {
    const placement = await notesSection('Placement')
    const html = await read(HOMEPAGE)

    assert.match(placement, /footer/i, 'the notes do not account for the footer\'s "About" column')
    assert.match(placement, /href="#"/, 'the notes do not record what the "About" nav link pointed at before')
    for (const link of ['Our Story', 'Values', 'Team']) {
      assert.ok(html.includes(`>${link}</a>`), `the footer's "About" column lost its "${link}" link`)
    }
  })
})

describe('Origin task 3: the section itself — the heading, the copy and the anchor', () => {
  const site = servedInBrowser()

  it('sets its heading in the same element and the same classes as "WHAT WE OFFER"', async () => {
    const headings = await site.page.evaluate(`
      const of = (el) => el && {
        tag: el.tagName.toLowerCase(),
        classes: [...el.classList],
        text: el.textContent.replace(/\\s+/g, ' ').trim(),
      }
      const offer = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
        .find((el) => el.textContent.trim() === 'WHAT WE OFFER')
      const origin = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
        .find((el) => el.textContent.trim() === ${JSON.stringify(ORIGIN_HEADING)})
      return { offer: of(offer), origin: of(origin) }
    `)

    assert.ok(headings.origin, `no heading on the page reads "${ORIGIN_HEADING}"`)
    assert.equal(headings.origin.tag, headings.offer.tag, 'the two headings are set in different elements')
    assert.deepEqual(
      headings.origin.classes,
      headings.offer.classes,
      'the new heading carries a different class list to "WHAT WE OFFER"',
    )
    assert.deepEqual(headings.origin.classes, ['section__heading'])
  })

  it('renders it at exactly the size, weight, tracking and colour "WHAT WE OFFER" renders at', async () => {
    const styles = await site.page.evaluate(`
      const of = (selector) => {
        const style = getComputedStyle(document.querySelector(selector))
        return {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontFamily: style.fontFamily,
          letterSpacing: style.letterSpacing,
          color: style.color,
          textTransform: style.textTransform,
          marginBottom: style.marginBottom,
        }
      }
      return { offer: of('#services .section__heading'), origin: of('#${ORIGIN_ANCHOR} .section__heading') }
    `)

    assert.deepEqual(styles.origin, styles.offer)
  })

  it('reproduces both paragraphs character for character', async () => {
    const copy = await site.page.evaluate(`
      const section = document.querySelector('#${ORIGIN_ANCHOR}')
      return [...section.querySelectorAll('p')].map((p) => p.textContent.replace(/\\s+/g, ' ').trim())
    `)

    assert.deepEqual(copy, ORIGIN_PARAGRAPHS)
  })

  // The constants the assertion above runs on are only trustworthy if they are
  // the request's own words, so they are checked back against the spec.
  it('takes that copy from the request unaltered — no rewording, no comma fixed', async () => {
    const spec = await read(SPEC)
    const supplied = [...spec.matchAll(/- Paragraph \d+: "([^"]*)"/g)].map(([, text]) => text)

    assert.equal(supplied.length, 2, `the spec states ${supplied.length} paragraphs`)
    assert.deepEqual(ORIGIN_PARAGRAPHS, supplied)
    assert.match(ORIGIN_PARAGRAPHS[0], /teams providing, Enterprise/, 'the supplied comma was corrected away')
  })

  it('wraps the band the way every other band on the page is wrapped', async () => {
    const shape = await site.page.evaluate(`
      const section = document.querySelector('#${ORIGIN_ANCHOR}')
      const heading = section.querySelector('.section__heading')
      return {
        tag: section.tagName.toLowerCase(),
        inMain: !!section.closest('main'),
        children: [...section.children].map((el) => el.tagName.toLowerCase() + '.' + [...el.classList].join('.')),
        headingParent: [...heading.parentElement.classList],
        labelledBy: section.getAttribute('aria-labelledby'),
        headingId: heading.id,
        subHeadings: section.querySelectorAll('h3').length,
      }
    `)

    assert.equal(shape.tag, 'section')
    assert.equal(shape.inMain, true, 'the new band sits outside <main>')
    assert.deepEqual(shape.children, ['div.container'], 'the band does not wrap its content in one .container')
    assert.deepEqual(shape.headingParent, ['container'])
    assert.equal(shape.labelledBy, shape.headingId, 'the band is not labelled by its own heading')
    assert.equal(shape.subHeadings, 0, 'the band introduces an <h3>, which the service cards own')
  })

  it('gives it an id nothing else on the page already answers to', async () => {
    const ids = await site.page.evaluate(`return [...document.querySelectorAll('[id]')].map((el) => el.id)`)

    assert.ok(ids.includes(ORIGIN_ANCHOR), `no element on the page carries id="${ORIGIN_ANCHOR}"`)
    assert.equal(new Set(ids).size, ids.length, `the page declares a duplicate id: ${ids.join(', ')}`)
  })

  it('needs no new shade, size literal or inline style of its own', async () => {
    const html = await read(HOMEPAGE)
    const css = await read(SERVICES_STYLESHEET)
    const origin = css.split(/^\.origin\b/m).slice(1).join('')

    assert.doesNotMatch(html, /style="/, `${HOMEPAGE} carries an inline style`)
    assert.doesNotMatch(origin, /#[0-9a-f]{3,8}\b/i, `${SERVICES_STYLESHEET} hardcodes a shade for the new band`)
    assert.ok(
      css.match(/\.section__heading\s*\{/g).length === 1,
      `${SERVICES_STYLESHEET} declares .section__heading more than once, so the two headings can drift`,
    )
  })
})

describe('Origin task 4: the section directly after "WHAT WE OFFER"', () => {
  const site = servedInBrowser()

  const ORDER = `
    const sections = [...document.querySelectorAll('main > section')]
    const origin = document.querySelector('#${ORIGIN_ANCHOR}')
    return {
      ids: sections.map((el) => el.id),
      index: sections.indexOf(origin),
      previousId: origin.previousElementSibling?.id ?? null,
      nextId: origin.nextElementSibling?.id ?? null,
      top: Math.round(origin.getBoundingClientRect().top),
      servicesBottom: Math.round(document.querySelector('#services').getBoundingClientRect().bottom),
      contactTop: Math.round(document.querySelector('#contact').getBoundingClientRect().top),
    }
  `

  it('places it immediately after the services band in document order', async () => {
    const order = await site.page.evaluate(ORDER)

    assert.equal(order.previousId, 'services', `the new band follows "#${order.previousId}"`)
    // The values band was inserted directly below this one by
    // specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/plan.md; what this task owns
    // is that the origin band still follows the services band, which it does.
    assert.deepEqual(order.ids, ['', 'services', ORIGIN_ANCHOR, 'values', 'contact'])
  })

  it('leaves the invitation band last, where it was', async () => {
    const order = await site.page.evaluate(ORDER)

    assert.equal(order.nextId, 'values', 'the values band no longer follows the origin one')
    assert.equal(order.ids.at(-1), 'contact', 'the invitation band is no longer last')
  })

  it('renders it between the two, not overlapping either', async () => {
    const order = await site.page.evaluate(ORDER)

    assert.ok(order.top >= order.servicesBottom, 'the new band renders over the services band')
    assert.ok(order.top < order.contactTop, 'the new band renders below the invitation band')
  })
})

/**
 * A pristine load of the home page at the given width. The URL carries a fresh
 * query each time on purpose: once a click has put `#about` in the address, a
 * plain re-navigation to the same path would be a same-document one, which
 * fires no load event for the driver to wait on.
 */
let loads = 0
const freshLoad = async (site, width = 1280, height = 800, hash = '') => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}${hash}`)
}

/** The nav's "About" and "Services" links, side by side, however they are wired. */
const NAV = `
  const of = (label) => {
    const link = [...document.querySelectorAll('.masthead__links a')]
      .find((a) => a.textContent.trim() === label)
    const href = link.getAttribute('href')
    return link && {
      href,
      attributes: link.getAttributeNames(),
      target: href.length > 1 ? document.querySelector(href)?.id ?? null : null,
    }
  }
  return { about: of('About'), services: of('Services') }
`

/**
 * Clicks a nav link and reports where the viewport ended up against the band
 * it should have reached — the same measurement for both links.
 */
const clickTo = (label) => `
  const link = [...document.querySelectorAll('.masthead__links a')]
    .find((a) => a.textContent.trim() === ${JSON.stringify(label)})
  const before = window.scrollY
  link.click()
  const section = document.querySelector(link.getAttribute('href'))
  // Two frames: enough for a jump, and enough to catch a smooth scroll mid-flight
  // rather than at rest, if one is ever introduced.
  return new Promise((resolve) =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        resolve({
          hash: location.hash,
          before,
          after: window.scrollY,
          top: Math.round(section.getBoundingClientRect().top) + 0,
          id: section.id,
        }),
      ),
    ),
  )
`

describe('Origin task 5: the "About" link pointed at the new band', () => {
  const site = servedInBrowser()

  it('points it at the new section, by the same mechanism "Services" uses', async () => {
    const nav = await site.page.evaluate(NAV)

    assert.equal(nav.about.href, `#${ORIGIN_ANCHOR}`, `"About" points at ${nav.about.href}`)
    assert.equal(nav.about.target, ORIGIN_ANCHOR, `"About" points at no section on the page`)
    assert.deepEqual(
      nav.about.attributes,
      nav.services.attributes,
      'the "About" link is wired through different attributes to "Services"',
    )
  })

  it('brings the band to the top of the viewport when clicked, as "Services" does', async () => {
    await freshLoad(site)
    const about = await site.page.evaluate(clickTo('About'))

    assert.equal(about.id, ORIGIN_ANCHOR, `clicking "About" reached #${about.id}`)
    assert.equal(about.hash, `#${ORIGIN_ANCHOR}`)
    assert.ok(about.after > about.before, `clicking "About" moved the page ${about.after - about.before}px`)
    assert.equal(about.top, 0, `the band landed ${about.top}px from the top of the viewport`)
  })

  it('needs no script to do it: the anchor works with JavaScript disabled', async () => {
    const html = await read(HOMEPAGE)

    assert.ok(!html.includes('<script'), `${HOMEPAGE} carries a <script>`)
    assert.doesNotMatch(html, /\son[a-z]+="/i, `${HOMEPAGE} carries an inline event handler`)

    // The jump is made with scripting off; scripting only comes back to read
    // where it landed, which moves nothing on a page that ships no script.
    await site.page.setScriptExecution(false)
    await freshLoad(site, 1280, 800, `#${ORIGIN_ANCHOR}`)
    await site.page.setScriptExecution(true)
    // `+ 0` normalises the -0 a rect sitting exactly at the fold can round to;
    // the driver hands -0 back as undefined, since CDP cannot serialise it.
    const landed = await site.page.evaluate(`
      return {
        top: Math.round(document.querySelector('#${ORIGIN_ANCHOR}').getBoundingClientRect().top) + 0,
        scrolled: window.scrollY > 0,
      }
    `)

    assert.equal(landed.scrolled, true, `the page never moved to #${ORIGIN_ANCHOR} without JavaScript`)
    assert.equal(landed.top, 0, `#${ORIGIN_ANCHOR} landed ${landed.top}px from the top without JavaScript`)
  })

  it('introduces no smooth scroll, which "Services" does not have either', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const behaviour = await site.page.evaluate(`
      return [getComputedStyle(document.documentElement).scrollBehavior, getComputedStyle(document.body).scrollBehavior]
    `)

    assert.doesNotMatch(css, /scroll-behavior/, `${SERVICES_STYLESHEET} now smooths the page's anchor jumps`)
    assert.deepEqual(behaviour, ['auto', 'auto'])
  })
})

describe('Origin task 6: the same link on a narrow screen', () => {
  const site = servedInBrowser()

  // There is no separate mobile menu to retarget — one <nav> reflows at every
  // width — so this is the desktop check repeated at 375px on the same markup.
  it('keeps the nav a single menu, so one "About" link serves both widths', async () => {
    const menus = await site.page.evaluate(`
      return {
        navs: document.querySelectorAll('nav').length,
        about: document.querySelectorAll('a[href="#${ORIGIN_ANCHOR}"]').length,
      }
    `)

    assert.equal(menus.navs, 1, `the page carries ${menus.navs} navigations`)
    assert.equal(menus.about, 1, `${menus.about} links point at #${ORIGIN_ANCHOR}`)
  })

  for (const [what, width] of [['mobile', 375], ['tablet', 768], ['desktop', 1440]]) {
    it(`scrolls to the band from the nav at ${width}px (${what})`, async () => {
      await freshLoad(site, width, 700)
      const about = await site.page.evaluate(clickTo('About'))

      assert.equal(about.id, ORIGIN_ANCHOR, `clicking "About" reached #${about.id} at ${width}px`)
      assert.equal(about.top, 0, `the band landed ${about.top}px from the top at ${width}px`)
    })
  }

  it('wraps both paragraphs on a narrow screen rather than clipping them', async () => {
    await freshLoad(site, 375, 700)
    const copy = await site.page.evaluate(`
      return [...document.querySelectorAll('#${ORIGIN_ANCHOR} .origin__copy')].map((p) => {
        const rect = p.getBoundingClientRect()
        const style = getComputedStyle(p)
        return {
          right: Math.round(rect.right),
          left: Math.round(rect.left),
          lines: Math.round(rect.height / parseFloat(style.lineHeight)),
          overflow: style.textOverflow + ' ' + style.overflow,
          clipped: p.scrollHeight > Math.ceil(rect.height) + 1,
        }
      }).concat([{ viewport: window.innerWidth, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }])
    `)
    const [first, second, page] = copy

    assert.equal(page.overflow, 0, `the page overflows by ${page.overflow}px at 375px`)
    for (const paragraph of [first, second]) {
      assert.ok(paragraph.left >= 0 && paragraph.right <= page.viewport, 'a paragraph runs off the screen')
      assert.ok(paragraph.lines > 3, `a paragraph renders on ${paragraph.lines} lines, so it is not wrapping`)
      assert.equal(paragraph.overflow, 'clip visible', `a paragraph is set to ${paragraph.overflow}`)
      assert.equal(paragraph.clipped, false, 'a paragraph is taller than the box it is given')
    }
  })
})

describe('Origin task 7: "Services", "WHAT WE OFFER" and everything else, untouched', () => {
  const site = servedInBrowser()

  it('leaves "Services" pointed at the services band, still reaching it', async () => {
    await freshLoad(site)
    const nav = await site.page.evaluate(NAV)
    const services = await site.page.evaluate(clickTo('Services'))

    assert.equal(nav.services.href, '#services')
    assert.equal(services.id, 'services', `clicking "Services" reached #${services.id}`)
    assert.equal(services.hash, '#services')
    assert.equal(services.top, 0, `the services band landed ${services.top}px from the top`)
  })

  it("leaves the services band's own markup and copy as it was", async () => {
    const html = await read(HOMEPAGE)
    const services = html.match(/<section class="services"[\s\S]*?\n      <\/section>/)?.[0] ?? ''

    assert.ok(services, `${HOMEPAGE} no longer holds the services band`)
    assert.ok(
      services.includes('<h2 class="section__heading" id="services-heading">WHAT WE OFFER</h2>'),
      'the "WHAT WE OFFER" heading was rewritten',
    )
    assert.ok(!services.includes(ORIGIN_HEADING), 'the new copy was added inside the services band')
    assert.equal((html.match(/id="services"/g) ?? []).length, 1)
  })

  // "Values" was repointed at the band
  // specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/plan.md added, by the same
  // one-attribute change this job made to "About". The other five are still inert.
  it('leaves the eight nav entries, in order, and every other one inert', async () => {
    const links = await site.page.evaluate(`
      return [...document.querySelectorAll('.masthead__links a')].map((a) => ({
        label: a.textContent.trim(),
        href: a.getAttribute('href'),
      }))
    `)

    assert.deepEqual(links, [
      { label: 'About', href: `#${ORIGIN_ANCHOR}` },
      { label: 'Services', href: '#services' },
      { label: 'Values', href: '#values' },
      { label: 'Team', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#contact' },
    ])
  })

  it('renders the page cleanly, console and network included', async () => {
    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })
})
