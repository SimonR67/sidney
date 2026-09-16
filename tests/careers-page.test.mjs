// Tests for the Careers page and the nav tab that now reaches it.
// Plan: specs/4f3c50ca-cd61-46ec-8aab-969cc72d95db/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { contrastRatio, openPage, parseColor, serveStatic } from './browser.mjs'
import {
  BOX_BORDERS,
  BREAKPOINTS,
  CAREERS_ACCENT,
  CAREERS_HEADING,
  CAREERS_LINK_LABEL,
  CAREERS_NOTES,
  CAREERS_OPENINGS_COPY,
  CAREERS_OPENINGS_HEADING,
  CAREERS_PAGE,
  CAREERS_PROCESS_ACCENT,
  CAREERS_PROCESS_CLOSING,
  CAREERS_PROCESS_HEADING,
  CAREERS_PROCESS_OPENING,
  CAREERS_PROCESS_WHITE,
  CAREERS_ROW_A,
  CAREERS_ROW_B,
  CAREERS_STEPS,
  CAREERS_SUBHEADING,
  CAREERS_SUB_ACCENT,
  CAREERS_TITLE,
  CASE_STUDIES_PAGE,
  CONTACT_PAGE,
  HOMEPAGE,
  LINKEDIN_URL,
  MIN_CONTRAST,
  MIN_CONTRAST_LARGE,
  SERVICES_STYLESHEET,
  TEAM_BORDERS,
  TEAM_PAGE,
  beforeCareersPage,
  careersBorders,
  declaredValue,
  htmlFiles,
  isLargeText,
  linksIn,
  mainOf,
  navBlock,
  parseHex,
  read,
  repoRoot,
  textOf,
  titleOf,
} from './site.mjs'

/** The section of this job's notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(CAREERS_NOTES).catch(() => '')
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

/**
 * Serves the repo and opens one headless-Chrome page for the enclosing suite,
 * on the Careers page unless another is named. `page`/`origin` are filled in by
 * the time the tests run.
 */
const servedInBrowser = (file = CAREERS_PAGE) => {
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

/** The `<head>`, header, nav and footer of a page, each as its own chunk of markup. */
const shellOf = (html) => ({
  head: html.match(/<head>[\s\S]*?<\/head>/)?.[0] ?? null,
  header: html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? null,
  nav: navBlock(html),
  footer: html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? null,
  includes: [...html.matchAll(/<(?:link|script)\b[^>]*>/g)].map(([tag]) => tag),
})

/** The stylesheet's "Careers page" block, from its own header to the footer's. */
const careersBlock = (css) =>
  css.split(/\/\* Careers page -+ \*\//).at(1)?.split(/\/\* Footer -+ \*\//).at(0) ?? ''

/**
 * A chunk of markup's copy, tags and comments dropped and whitespace collapsed.
 * `textOf` puts a space where each tag stood, which splits a headline painted
 * with a span ("CAREERS" + ", GRAB A TICKET"); this joins the two back up the
 * way the browser does.
 */
const sourceText = (markup) =>
  markup
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/** The shade a `--x` token resolves to, as Chrome reports colours. */
const shade = (css, name) => {
  const { r, g, b } = parseHex(declaredValue(css, [':root'], `--${name}`))
  return `rgb(${r}, ${g}, ${b})`
}

/** Every Softpapaya page: the four that carry the shared masthead, plus the new one. */
const SOFTPAPAYA_PAGES = [HOMEPAGE, TEAM_PAGE, CASE_STUDIES_PAGE, CONTACT_PAGE, CAREERS_PAGE]

/** A pristine load at the given width; the query keeps every navigation a cross-document one. */
let loads = 0
const freshLoad = async (site, width = 1280, height = 900) => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}`)
}

/** The whole page as the browser draws it: every band, every box, every statement. */
const BANDS = `
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, right: r.right, bottom: r.bottom, left: r.left, width: r.width, height: r.height }
  }
  const text = (el) => el.textContent.replace(/\\s+/g, ' ').trim()
  const painted = (el) => el && {
    tag: el.tagName.toLowerCase(),
    classes: [...el.classList],
    text: text(el),
    color: getComputedStyle(el).color,
    background: getComputedStyle(el).backgroundColor,
    fontSize: parseFloat(getComputedStyle(el).fontSize),
    fontWeight: getComputedStyle(el).fontWeight,
    rect: box(el),
  }
  const card = (el) => Object.assign(painted(el), {
    radius: getComputedStyle(el).borderTopLeftRadius,
    widths: ['Top', 'Right', 'Bottom', 'Left'].map((side) => getComputedStyle(el)['border' + side + 'Width']),
    border: ['Top', 'Right', 'Bottom', 'Left'].map((side) => getComputedStyle(el)['border' + side + 'Color']),
    title: el.querySelector('.card__title') && painted(el.querySelector('.card__title')),
    copy: [...el.querySelectorAll('.card__copy')].map(text),
    fits: el.scrollWidth <= el.clientWidth + 1,
  })
  const row = (selector) => {
    const grid = document.querySelector(selector)
    return grid && {
      tag: grid.tagName.toLowerCase(),
      classes: [...grid.classList],
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      gap: getComputedStyle(grid).columnGap,
      rect: box(grid),
      cards: [...grid.children].map(card),
    }
  }
  const measure = (selector) => {
    const el = document.querySelector(selector)
    if (!el) return null
    const style = getComputedStyle(el)
    return Object.assign(box(el), {
      content: el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
    })
  }
  const process = document.querySelector('main .careers-process')
  const openings = document.querySelector('main .careers-openings')
  const link = openings && openings.querySelector('a')
  return {
    heading: painted(document.querySelector('main .hero h1')),
    accent: painted(document.querySelector('main .hero h1 span')),
    subheading: painted(document.querySelector('main .careers__subheading')),
    subAccent: painted(document.querySelector('main .careers__subheading span')),
    rows: {
      a: row('.careers__row--four'),
      b: row('.careers__row--two'),
      steps: row('.careers__row--steps'),
    },
    process: process && Object.assign(painted(process), {
      heading: painted(process.querySelector('h2')),
      accent: painted(process.querySelector('h2 span')),
      statements: [...process.querySelectorAll('.careers-process__statement')].map(painted),
      order: [...process.querySelector('.careers-process__inner').children]
        .map((el) => el.tagName.toLowerCase() + '.' + [...el.classList].join('.')),
    }),
    openings: openings && Object.assign(painted(openings), {
      heading: painted(openings.querySelector('h2')),
      copy: [...openings.querySelectorAll('p')].map(painted),
      link: link && Object.assign(painted(link), {
        href: link.getAttribute('href'),
        target: link.getAttribute('target'),
        rel: link.getAttribute('rel'),
        decoration: getComputedStyle(link).textDecorationLine,
      }),
    }),
    bands: [...document.querySelectorAll('main > section')].map((el) => ({
      classes: [...el.classList],
      rect: box(el),
      background: getComputedStyle(el).backgroundColor,
    })),
    container: measure('main .careers > .container'),
    page: { width: document.documentElement.clientWidth, viewport: window.innerWidth },
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }
`

describe('Careers task 1: the spike — the box component, the nav tab, the route, the content layer', () => {
  it('records what the repository holds, page set and stylesheet included', async () => {
    const discovery = await notesSection('Discovery')

    assert.ok(discovery, `${CAREERS_NOTES} has no "Discovery" section`)
    for (const file of [HOMEPAGE, TEAM_PAGE, CASE_STUDIES_PAGE, CONTACT_PAGE, SERVICES_STYLESHEET]) {
      assert.ok(discovery.includes(file), `the discovery notes never mention ${file}`)
    }
  })

  it('settles every one of the spec\'s six open questions, in writing', async () => {
    const settled = await notesSection('Open questions from the spec, settled')

    assert.ok(settled, `${CAREERS_NOTES} has no "Open questions from the spec, settled" section`)
    // (a) the lime variant, (b) the current "Careers" destination, (c) the route
    // convention, (d) the content layer, plus the LinkedIn URL and the boxes the
    // numbered steps are built from.
    for (const phrase of ['--lime', 'href="#"', CAREERS_PAGE, 'linkedin.com/company/softpapaya', '.card']) {
      assert.ok(settled.includes(phrase), `the settled answers never mention ${phrase}`)
    }
    assert.match(settled, /CMS/, 'the settled answers never say whether a CMS exists')
    assert.match(settled, /hardcoded/i, 'the settled answers never say where the copy is written')
  })

  it('maps the plan\'s src/ file map onto the files this static site actually has', async () => {
    const map = await notesSection('File map, as the plan names it and as it exists')

    assert.ok(map, `${CAREERS_NOTES} has no "File map" section`)
    for (const row of ['src/pages/careers', 'src/components/RoundedBox', 'src/content/careers', 'src/styles/careers']) {
      assert.ok(map.includes(row), `the file map never says what became of ${row}.*`)
    }
    assert.ok(map.includes(CAREERS_PAGE), `the file map does not name ${CAREERS_PAGE}`)
    assert.ok(map.includes('tests/careers-page.test.mjs'), 'the file map does not name the test file')
  })

  it('flags what it had to decide rather than deciding it silently', async () => {
    const flagged = await notesSection('Flagged for the reviewer')

    assert.ok(flagged, `${CAREERS_NOTES} has no "Flagged for the reviewer" section`)
    assert.match(flagged, /--deep/, 'the notes do not say which black the headings take')
    assert.match(flagged, /Wrocław/, 'the spec\'s "Wrocław" spelling is not flagged')
    assert.match(flagged, /placeholder/i, 'the notes do not say the LinkedIn link is a placeholder')
  })
})

describe('Careers task 2: the lime outline variant — already in the box component', () => {
  const site = servedInBrowser(HOMEPAGE)

  it('finds the variant already declared, off the palette\'s own lime token', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.ok(declaredValue(css, [':root'], '--lime'), `${SERVICES_STYLESHEET} declares no --lime token`)
    assert.match(
      css,
      /\.services__grid > \.card:nth-child\(6n \+ 2\)[\s\S]*?border-color: var\(--lime\)/,
      'the rounded-box component paints no box lime',
    )
  })

  it('renders a lime-outlined box on a page that already shipped, so nothing had to be added', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const borders = await site.page.evaluate(`
      return [...document.querySelectorAll('#services .services__grid > .card')]
        .map((card) => getComputedStyle(card).borderTopColor)
    `)

    assert.ok(borders.includes(shade(css, 'lime')), 'no box on the home page is outlined lime')
  })

  it('adds no second lime, and no colour token of its own, for this page', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const careers = css.split(/\/\* Careers page -+ \*\//).at(1) ?? ''

    assert.equal(/--papaya:|--lime:|--black:|--[\w-]+: *#/.test(careers), false, 'the careers block declares a shade')
    assert.equal(/#[0-9a-f]{3,8}\b/i.test(careers), false, 'the careers block writes a hex colour of its own')
  })
})

describe('Careers task 3: the page shell, copied rather than rewritten', () => {
  const site = servedInBrowser()

  it('exists, and is served as HTML at the slug the tab points at', async () => {
    const response = await fetch(`${site.origin}/${CAREERS_PAGE}`)

    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/html/)
    assert.ok((await htmlFiles()).includes(CAREERS_PAGE), `${CAREERS_PAGE} is not one of the site's pages`)
  })

  it('takes its head, header, nav and footer from an existing page, byte for byte', async () => {
    const mine = shellOf(await read(CAREERS_PAGE))
    const theirs = shellOf(await read(TEAM_PAGE))

    assert.equal(
      mine.head.replace(/<title>[^<]*<\/title>/, ''),
      theirs.head.replace(/<title>[^<]*<\/title>/, ''),
      'the head differs from the page it was copied from by more than its title',
    )
    assert.equal(beforeCareersPage(mine.header), beforeCareersPage(theirs.header), 'the header differs by more than the "Careers" tab')
    assert.equal(beforeCareersPage(mine.nav), beforeCareersPage(theirs.nav), 'the nav differs by more than the "Careers" tab')
    assert.equal(mine.footer, theirs.footer, 'the footer differs from the page it was copied from')
    assert.deepEqual(mine.includes, theirs.includes, 'the page loads a different set of files')
  })

  it('links the one stylesheet the rest of the site is styled from, and no script', async () => {
    const html = await read(CAREERS_PAGE)

    assert.ok(html.includes(`<link rel="stylesheet" href="${SERVICES_STYLESHEET}" />`), 'the stylesheet is not linked')
    assert.equal(/<style\b/.test(html), false, 'the page carries a <style> block')
    assert.equal(/<script\b/.test(html), false, 'the page carries a script the rest of the site does not')
    assert.deepEqual([...html.matchAll(/\sstyle="/g)], [], 'the page carries inline styles')
  })

  it('titles itself for the page it is, and carries the "Careers" tab in its own nav', async () => {
    const html = await read(CAREERS_PAGE)

    assert.equal(titleOf(html), CAREERS_TITLE)
    assert.ok(
      linksIn(navBlock(html)).some((link) => link.label === 'Careers' && link.href === CAREERS_PAGE),
      `${CAREERS_PAGE} does not carry its own "Careers" tab`,
    )
  })

  it('renders the same chrome the rest of the site does, with nothing logged or missing', async () => {
    const chrome = await site.page.evaluate(`
      return {
        masthead: !!document.querySelector('.masthead .masthead__links'),
        mark: document.querySelector('.masthead__mark')?.naturalWidth ?? 0,
        footer: !!document.querySelector('.footer .footer__bottom'),
        font: getComputedStyle(document.body).fontFamily,
        main: !!document.querySelector('main'),
      }
    `)

    assert.ok(chrome.masthead, 'the page has no masthead')
    assert.ok(chrome.mark > 0, 'the masthead mark never decoded')
    assert.ok(chrome.footer, 'the page has no footer')
    assert.ok(chrome.main, 'the page has no <main>')
    assert.equal(chrome.font, 'Inter, "Helvetica Neue", Arial, sans-serif')
    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })
})

describe('Careers task 4: the "Careers" tab, repointed in place', () => {
  const site = servedInBrowser(HOMEPAGE)

  it('points the tab at the new page on every page that carries the shared nav', async () => {
    for (const file of SOFTPAPAYA_PAGES) {
      const nav = navBlock(await read(file))
      const careers = linksIn(nav).filter((link) => link.label === 'Careers')

      assert.equal(careers.length, 1, `${file} carries ${careers.length} "Careers" tabs`)
      assert.equal(careers[0].href, CAREERS_PAGE, `the "Careers" tab on ${file} points at ${careers[0].href}`)
    }
  })

  it('leaves it sixth in the list, worded as it was, with no class of its own', async () => {
    const html = await read(HOMEPAGE)
    const entries = [...navBlock(html).matchAll(/<li><a href="([^"]*)">([^<]*)<\/a><\/li>/g)]

    assert.equal(entries.length, 8, 'the nav no longer holds its eight tabs')
    assert.deepEqual(entries.map(([, , label]) => label), [
      'About',
      'Services',
      'Values',
      'Team',
      'Case Studies',
      'Careers',
      'Blog',
      'Contact',
    ])
    assert.equal(entries[5][1], CAREERS_PAGE, 'the sixth tab is not the one repointed')
  })

  it('changes nothing else on the pages it touched: one href each', async () => {
    for (const file of [HOMEPAGE, TEAM_PAGE, CASE_STUDIES_PAGE, CONTACT_PAGE]) {
      const html = await read(file)
      const before = beforeCareersPage(html)

      assert.notEqual(before, html, `${file} never had its "Careers" tab repointed`)
      assert.ok(!before.includes(CAREERS_PAGE), `${file} names ${CAREERS_PAGE} somewhere else too`)
    }
  })

  it('leaves the legacy page set, which has no "Careers" tab, alone', async () => {
    for (const file of ['about.html', 'contact.html', 'style.css']) {
      const contents = await read(file)

      assert.ok(!contents.includes(CAREERS_PAGE), `${file} now links ${CAREERS_PAGE}`)
      assert.ok(!contents.includes('masthead'), `${file} has been given the shared masthead`)
    }
  })

  it('renders it as one more link in the same list, in the same shade and size', async () => {
    const links = await site.page.evaluate(`
      return [...document.querySelectorAll('.masthead__links a')].map((a) => {
        const style = getComputedStyle(a)
        return {
          label: a.textContent.trim(),
          href: a.getAttribute('href'),
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          textDecoration: style.textDecorationLine,
          classes: [...a.classList],
        }
      })
    `)
    const careers = links.find((link) => link.label === 'Careers')
    const others = links.filter((link) => link.label !== 'Careers')

    assert.ok(careers, 'the home page renders no "Careers" tab')
    assert.equal(careers.href, CAREERS_PAGE)
    assert.deepEqual(careers.classes, [])
    for (const property of ['color', 'fontSize', 'fontWeight', 'textDecoration']) {
      assert.equal(
        careers[property],
        others[0][property],
        `the "Careers" tab's ${property} is ${careers[property]}, not the ${others[0][property]} its siblings take`,
      )
    }
  })

  it('reaches the page when clicked, from every page that carries the tab', async () => {
    const { page } = site

    for (const from of SOFTPAPAYA_PAGES) {
      await page.goto(`${site.origin}/${from}`)
      const reached = await page.evaluate(`
        const tab = [...document.querySelectorAll('.masthead__links a')].find((a) => a.textContent.trim() === 'Careers')
        return tab ? new URL(tab.href, location.href).pathname : null
      `)

      assert.equal(reached, `/${CAREERS_PAGE}`, `the "Careers" tab on ${from} does not point at the page`)
    }
  })
})

describe('Careers task 5: the title block and the sub heading', () => {
  const site = servedInBrowser()

  it('sets the headline in the class the home page sets its own headline in', async () => {
    const home = (await read(HOMEPAGE)).match(/<h1 class="([^"]*)"/)[1]
    const { heading } = await site.page.evaluate(BANDS)

    assert.ok(heading, 'the page has no <h1>')
    assert.deepEqual(heading.classes, home.split(' '), `the headline is a ${heading.classes} rather than a ${home}`)
    assert.equal(heading.text, CAREERS_HEADING)
  })

  it('paints "CAREERS" in the papaya the hero\'s own accent span takes, and the rest in the ink', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const home = (await read(HOMEPAGE)).match(/<span class="([^"]*)">REALLY WELL<\/span>/)[1]
    const { heading, accent } = await site.page.evaluate(BANDS)

    assert.ok(accent, 'the headline paints nothing')
    assert.deepEqual(accent.classes, home.split(' '), `"${CAREERS_ACCENT}" is a ${accent.classes} rather than a ${home}`)
    assert.equal(accent.text, CAREERS_ACCENT)
    assert.equal(accent.color, shade(css, 'papaya'))
    assert.equal(heading.color, shade(css, 'deep'), '"GRAB A TICKET" is not the ink the rest of the headings take')
  })

  it('reads the sub heading exactly as the spec wrote it, under the headline', async () => {
    const { heading, subheading } = await site.page.evaluate(BANDS)

    assert.ok(subheading, 'the page has no sub heading')
    assert.equal(subheading.text, CAREERS_SUBHEADING)
    assert.equal(subheading.tag, 'h2', `the sub heading is a <${subheading.tag}>`)
    assert.ok(subheading.rect.top >= heading.rect.bottom, 'the sub heading is not below the headline')
  })

  it('splits the sub heading the same way: "WHAT YOU GET." papaya, "WHAT YOU DON\'T" black', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { subheading, subAccent } = await site.page.evaluate(BANDS)

    assert.ok(subAccent, 'the sub heading paints nothing')
    assert.equal(subAccent.text, CAREERS_SUB_ACCENT)
    assert.equal(subAccent.color, shade(css, 'papaya'))
    assert.equal(subheading.color, shade(css, 'deep'), '"WHAT YOU DON\'T" is not the ink the headings take')
    assert.equal(subheading.classes.includes('section__heading'), false, 'the sub heading takes the muted eyebrow style')
  })

  it('sits above every box on the page, and paints no third shade into either line', async () => {
    const { heading, subheading, rows } = await site.page.evaluate(BANDS)
    const spans = await site.page.evaluate(`
      return [...document.querySelectorAll('main .hero h1 span, main .careers__subheading span')].length
    `)

    assert.equal(spans, 2, `the two lines carry ${spans} painted spans between them`)
    assert.ok(subheading.rect.bottom <= rows.a.rect.top, 'the sub heading is not above the four-box row')
    assert.ok(heading.rect.bottom <= rows.a.rect.top, 'the headline is not above the four-box row')
  })
})

describe('Careers task 6: Row A — four boxes, a quarter of the band each', () => {
  const site = servedInBrowser()

  it('builds them from the grid and the box the rest of the site is built from', async () => {
    const { rows } = await site.page.evaluate(BANDS)

    assert.ok(rows.a, 'the page has no four-box row')
    assert.equal(rows.a.tag, 'ul')
    assert.ok(rows.a.classes.includes('services__grid'), `the row is a ${rows.a.classes}`)
    assert.equal(rows.a.cards.length, CAREERS_ROW_A.length, `the row holds ${rows.a.cards.length} boxes`)
    for (const [index, card] of rows.a.cards.entries()) {
      assert.equal(card.tag, 'li', `box ${index + 1} is a <${card.tag}>`)
      assert.deepEqual(card.classes, ['card'], `box ${index + 1} carries ${card.classes}`)
      assert.equal(card.radius, '10px', `box ${index + 1} is not rounded`)
      assert.deepEqual(card.widths, Array(4).fill('1px'), `box ${index + 1} is not outlined`)
    }
  })

  it('writes the four titles and the four paragraphs exactly as the spec supplied them', async () => {
    const { rows } = await site.page.evaluate(BANDS)

    assert.deepEqual(rows.a.cards.map((card) => card.title.text), CAREERS_ROW_A.map((box) => box.title))
    for (const [index, card] of rows.a.cards.entries()) {
      assert.deepEqual(card.copy, [CAREERS_ROW_A[index].copy], `box ${index + 1} ("${card.title.text}") is worded wrongly`)
      assert.equal(
        card.text,
        `${CAREERS_ROW_A[index].title} ${CAREERS_ROW_A[index].copy}`,
        `box ${index + 1} carries copy beyond its title and paragraph`,
      )
    }
  })

  it('outlines them papaya, lime, black, papaya — no two neighbours alike', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { rows } = await site.page.evaluate(BANDS)
    const expected = careersBorders(CAREERS_ROW_A.length)

    assert.deepEqual(expected, ['papaya', 'lime', 'black', 'papaya'])
    for (const [index, card] of rows.a.cards.entries()) {
      assert.deepEqual(card.border, Array(4).fill(shade(css, expected[index])), `box ${index + 1} is not ${expected[index]}`)
    }
    for (const [index, name] of expected.slice(1).entries()) {
      assert.notEqual(name, expected[index], `boxes ${index + 1} and ${index + 2} share an outline shade`)
    }
  })

  it('gives each of them a quarter of the band at desktop width', async () => {
    await freshLoad(site, 1280)
    const { rows, container } = await site.page.evaluate(BANDS)
    const gap = parseFloat(rows.a.gap)
    const quarter = (container.content - 3 * gap) / 4

    assert.equal(rows.a.columns, 4, `the row runs ${rows.a.columns} columns at 1280px`)
    for (const [index, card] of rows.a.cards.entries()) {
      assert.ok(
        Math.abs(card.rect.width - quarter) < 1.5,
        `box ${index + 1} is ${card.rect.width.toFixed(1)}px wide, not the ${quarter.toFixed(1)}px a quarter of the band is`,
      )
      assert.ok(Math.abs(card.rect.top - rows.a.cards[0].rect.top) < 1, `box ${index + 1} is not on the first row`)
    }
  })
})

describe('Careers task 7: Row B — two boxes, half the band each', () => {
  const site = servedInBrowser()

  it('is a second grid of its own, below Row A, built from the same box', async () => {
    const { rows } = await site.page.evaluate(BANDS)

    assert.ok(rows.b, 'the page has no two-box row')
    assert.equal(rows.b.tag, 'ul')
    assert.ok(rows.b.classes.includes('services__grid'), `the row is a ${rows.b.classes}`)
    assert.equal(rows.b.cards.length, CAREERS_ROW_B.length, `the row holds ${rows.b.cards.length} boxes`)
    assert.ok(rows.b.rect.top >= rows.a.rect.bottom, 'the two-box row is not below the four-box row')
    for (const [index, card] of rows.b.cards.entries()) {
      assert.deepEqual(card.classes, ['card'], `box ${index + 1} carries ${card.classes}`)
      assert.equal(card.radius, '10px', `box ${index + 1} is not rounded`)
    }
  })

  it('writes both titles and both paragraphs exactly as the spec supplied them', async () => {
    const { rows } = await site.page.evaluate(BANDS)

    assert.deepEqual(rows.b.cards.map((card) => card.title.text), CAREERS_ROW_B.map((box) => box.title))
    for (const [index, card] of rows.b.cards.entries()) {
      assert.deepEqual(card.copy, [CAREERS_ROW_B[index].copy], `box ${index + 1} ("${card.title.text}") is worded wrongly`)
      assert.equal(
        card.text,
        `${CAREERS_ROW_B[index].title} ${CAREERS_ROW_B[index].copy}`,
        `box ${index + 1} carries copy beyond its title and paragraph`,
      )
    }
  })

  it('outlines the two of them differently, the rotation starting again at this row', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { rows } = await site.page.evaluate(BANDS)
    const expected = careersBorders(CAREERS_ROW_B.length)

    assert.deepEqual(expected, ['papaya', 'lime'])
    for (const [index, card] of rows.b.cards.entries()) {
      assert.deepEqual(card.border, Array(4).fill(shade(css, expected[index])), `box ${index + 1} is not ${expected[index]}`)
    }
    assert.notEqual(rows.b.cards[0].border[0], rows.b.cards[1].border[0], 'the two boxes share an outline shade')
  })

  it('gives each of them half the band at desktop width', async () => {
    await freshLoad(site, 1280)
    const { rows, container } = await site.page.evaluate(BANDS)
    const gap = parseFloat(rows.b.gap)
    const half = (container.content - gap) / 2

    assert.equal(rows.b.columns, 2, `the row runs ${rows.b.columns} columns at 1280px`)
    for (const [index, card] of rows.b.cards.entries()) {
      assert.ok(
        Math.abs(card.rect.width - half) < 1.5,
        `box ${index + 1} is ${card.rect.width.toFixed(1)}px wide, not the ${half.toFixed(1)}px half the band is`,
      )
    }
  })
})

describe('Careers task 8: both rows at every width the site supports', () => {
  const site = servedInBrowser()

  /** What each row runs at each of the site's widths: one up, two up, then four and two. */
  const COLUMNS = { 320: [1, 1], 375: [1, 1], 414: [1, 1], 768: [2, 2], 1024: [4, 2], 1280: [4, 2], 1440: [4, 2] }

  for (const width of BREAKPOINTS) {
    it(`stacks the two rows to ${COLUMNS[width][0]} and ${COLUMNS[width][1]} columns at ${width}px`, async () => {
      await freshLoad(site, width)
      const { rows } = await site.page.evaluate(BANDS)
      const [a, b] = COLUMNS[width]

      assert.equal(rows.a.columns, a, `the four-box row runs ${rows.a.columns} columns at ${width}px`)
      assert.equal(rows.b.columns, b, `the two-box row runs ${rows.b.columns} columns at ${width}px`)
    })
  }

  for (const width of BREAKPOINTS) {
    it(`draws every box inside the band, with its copy wrapped, at ${width}px`, async () => {
      await freshLoad(site, width)
      const { rows, container, overflow } = await site.page.evaluate(BANDS)

      assert.equal(overflow, 0, `the page scrolls sideways at ${width}px`)
      for (const [name, row] of Object.entries(rows)) {
        for (const [index, card] of row.cards.entries()) {
          assert.ok(card.rect.width > 0 && card.rect.height > 0, `${name} box ${index + 1} is not drawn at ${width}px`)
          assert.ok(card.rect.width <= container.content + 1, `${name} box ${index + 1} is wider than the band at ${width}px`)
          assert.ok(card.rect.left >= container.left - 1, `${name} box ${index + 1} starts left of the band at ${width}px`)
          assert.ok(card.fits, `${name} box ${index + 1}'s copy overflows it at ${width}px`)
        }
      }
    })
  }

  it('declares nothing outside the site\'s own two breakpoints', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const widths = [...css.matchAll(/@media \(min-width: (\d+)px\)/g)].map(([, px]) => Number(px))

    assert.deepEqual([...new Set(widths)].sort((a, b) => a - b), [768, 1024])
  })

  it('logs nothing, raises nothing and fails no request across those widths', async () => {
    for (const width of BREAKPOINTS) {
      await freshLoad(site, width)
    }

    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })
})

describe('Careers task 9: the full-width "How it Works" band', () => {
  const site = servedInBrowser()

  it('paints itself papaya, edge to edge, with the content still on the shared measure', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { process, page } = await site.page.evaluate(BANDS)

    assert.ok(process, 'the page has no "How it Works" band')
    assert.equal(process.background, shade(css, 'papaya'), `the band is painted ${process.background}`)
    assert.ok(Math.abs(process.rect.width - page.width) < 1, 'the band is not the full width of the page')
    assert.equal(process.rect.left, 0, 'the band does not start at the left edge')
    const inner = await site.page.evaluate(`
      const el = document.querySelector('.careers-process__inner')
      return { classes: [...el.classList], width: el.getBoundingClientRect().width }
    `)
    assert.ok(inner.classes.includes('container'), `the band's content is not on the shared container: ${inner.classes}`)
    assert.ok(inner.width < process.rect.width, 'the band\'s content is not inset from its edges')
  })

  it('heads it with the spec\'s own line, in white and black', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { process } = await site.page.evaluate(BANDS)

    assert.equal(process.heading.text, CAREERS_PROCESS_HEADING)
    assert.equal(process.heading.tag, 'h2', `the heading is a <${process.heading.tag}>`)
    assert.equal(process.heading.color, shade(css, 'page'), `"${CAREERS_PROCESS_WHITE}" is ${process.heading.color}`)
    assert.equal(process.accent.text, CAREERS_PROCESS_ACCENT)
    assert.equal(process.accent.color, shade(css, 'black'), `"${CAREERS_PROCESS_ACCENT}" is ${process.accent.color}`)
  })

  it('keeps both shades legible on the papaya: AA for the heading, AA for the copy', async () => {
    const { process } = await site.page.evaluate(BANDS)
    const background = parseColor(process.background)
    const heading = contrastRatio(parseColor(process.heading.color), background)
    const accent = contrastRatio(parseColor(process.accent.color), background)

    assert.ok(isLargeText(process.heading.fontSize, process.heading.fontWeight), 'the heading is not large text')
    assert.ok(heading >= MIN_CONTRAST_LARGE, `the white heading is only ${heading.toFixed(2)}:1 on the papaya`)
    assert.ok(accent >= MIN_CONTRAST, `the black in the heading is only ${accent.toFixed(2)}:1 on the papaya`)
    for (const statement of process.statements) {
      const ratio = contrastRatio(parseColor(statement.color), background)
      assert.ok(ratio >= MIN_CONTRAST, `"${statement.text.slice(0, 30)}…" is only ${ratio.toFixed(2)}:1 on the papaya`)
    }
  })

  it('sits between the boxes above it and the openings below it', async () => {
    const { bands } = await site.page.evaluate(BANDS)

    assert.deepEqual(
      bands.map((band) => band.classes[0]),
      ['hero', 'careers', 'careers-process', 'careers-openings'],
      'the page no longer runs hero, boxes, process, openings',
    )
  })
})

describe('Careers task 10: the statements and the three numbered steps, in order', () => {
  const site = servedInBrowser()

  it('writes the opening statement, the three boxes and the closing statement, in that order', async () => {
    const { process, rows } = await site.page.evaluate(BANDS)

    assert.deepEqual(process.order, [
      'h2.careers-process__heading',
      'p.careers-process__statement',
      'ul.services__grid.careers__row.careers__row--steps',
      'p.careers-process__statement',
    ])
    assert.equal(process.statements.length, 2, `the band carries ${process.statements.length} statements`)
    assert.equal(process.statements[0].text, CAREERS_PROCESS_OPENING)
    assert.equal(process.statements[1].text, CAREERS_PROCESS_CLOSING)
    assert.ok(process.statements[0].rect.bottom <= rows.steps.rect.top, 'the opening statement is not above the steps')
    assert.ok(process.statements[1].rect.top >= rows.steps.rect.bottom, 'the closing statement is not below the steps')
  })

  it('builds the steps from the same rounded box the rows above use', async () => {
    const { rows } = await site.page.evaluate(BANDS)

    assert.ok(rows.steps, 'the band has no steps row')
    assert.equal(rows.steps.tag, 'ul')
    assert.ok(rows.steps.classes.includes('services__grid'), `the steps row is a ${rows.steps.classes}`)
    assert.equal(rows.steps.cards.length, CAREERS_STEPS.length, `the band holds ${rows.steps.cards.length} steps`)
    for (const [index, card] of rows.steps.cards.entries()) {
      assert.equal(card.tag, 'li', `step ${index + 1} is a <${card.tag}>`)
      assert.deepEqual(card.classes, ['card'], `step ${index + 1} carries ${card.classes}`)
      assert.equal(card.radius, '10px', `step ${index + 1} is not rounded`)
      assert.deepEqual(card.widths, Array(4).fill('1px'), `step ${index + 1} is not outlined`)
    }
  })

  it('numbers and words them exactly as the spec supplied them', async () => {
    const { rows } = await site.page.evaluate(BANDS)

    assert.deepEqual(rows.steps.cards.map((card) => card.title.text), CAREERS_STEPS.map((step) => step.title))
    for (const [index, card] of rows.steps.cards.entries()) {
      assert.deepEqual(card.copy, [CAREERS_STEPS[index].copy], `step ${index + 1} is worded wrongly`)
      assert.equal(
        card.text,
        `${CAREERS_STEPS[index].title} ${CAREERS_STEPS[index].copy}`,
        `step ${index + 1} carries copy beyond its title and paragraph`,
      )
    }
  })

  it('stacks them one to a row, full width, at every width the site supports', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const expected = careersBorders(CAREERS_STEPS.length)

    assert.deepEqual(expected, ['papaya', 'lime', 'black'])
    for (const width of BREAKPOINTS) {
      await freshLoad(site, width)
      const { rows } = await site.page.evaluate(BANDS)

      assert.equal(rows.steps.columns, 1, `the steps run ${rows.steps.columns} columns at ${width}px`)
      for (const [index, card] of rows.steps.cards.entries()) {
        assert.ok(
          Math.abs(card.rect.width - rows.steps.rect.width) < 1,
          `step ${index + 1} is not the full width of the band at ${width}px`,
        )
        assert.deepEqual(card.border, Array(4).fill(shade(css, expected[index])), `step ${index + 1} is not ${expected[index]}`)
      }
    }
  })
})

describe('Careers task 11: "CURRENT OPENINGS", and the one link off the page', () => {
  const site = servedInBrowser()

  it('heads the band with the shared eyebrow, worded as the spec asks', async () => {
    const { openings } = await site.page.evaluate(BANDS)

    assert.ok(openings, 'the page has no openings band')
    assert.equal(openings.heading.text, CAREERS_OPENINGS_HEADING)
    assert.deepEqual(openings.heading.classes, ['section__heading'], `the heading carries ${openings.heading.classes}`)
  })

  it('reads the sub text verbatim', async () => {
    const { openings } = await site.page.evaluate(BANDS)

    assert.equal(openings.copy[0].text, CAREERS_OPENINGS_COPY)
  })

  it('carries one link, labelled exactly as the spec words it, opening in a new tab', async () => {
    const { openings } = await site.page.evaluate(BANDS)
    const links = await site.page.evaluate(`return [...document.querySelectorAll('main a')].length`)

    assert.equal(links, 1, `the page's content carries ${links} links`)
    assert.ok(openings.link, 'the band carries no link')
    assert.equal(openings.link.text, CAREERS_LINK_LABEL)
    assert.equal(openings.link.target, '_blank')
    assert.match(openings.link.rel ?? '', /noopener/, 'the new tab keeps a handle on this one')
  })

  it('points it at the SoftPapaya company page on LinkedIn — the URL the site already links', async () => {
    const { openings } = await site.page.evaluate(BANDS)

    assert.equal(openings.link.href, LINKEDIN_URL)
    assert.match(openings.link.href, /^https:\/\/www\.linkedin\.com\/company\/softpapaya\//)
    assert.ok((await read(CONTACT_PAGE)).includes(LINKEDIN_URL), 'the Contact Us page no longer links the same URL')
  })

  it('paints and underlines it the way the Contact Us page paints its own LinkedIn link', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { openings } = await site.page.evaluate(BANDS)

    assert.equal(openings.link.color, shade(css, 'accent'))
    assert.equal(openings.link.decoration, 'underline')
    assert.equal(
      declaredValue(css, ['.contact__linkedin a'], 'color'),
      declaredValue(css, ['.careers-openings__copy a'], 'color'),
      'the two LinkedIn links are painted from different values',
    )
  })
})

describe('Careers task 12: every string on the page, against the copy the spec supplied', () => {
  const site = servedInBrowser()

  /** The whole page's copy, in the order the spec writes it. */
  const EXPECTED = [
    CAREERS_HEADING,
    CAREERS_SUBHEADING,
    ...CAREERS_ROW_A.flatMap((box) => [box.title, box.copy]),
    ...CAREERS_ROW_B.flatMap((box) => [box.title, box.copy]),
    CAREERS_PROCESS_HEADING,
    CAREERS_PROCESS_OPENING,
    ...CAREERS_STEPS.flatMap((step) => [step.title, step.copy]),
    CAREERS_PROCESS_CLOSING,
    CAREERS_OPENINGS_HEADING,
    CAREERS_OPENINGS_COPY,
    CAREERS_LINK_LABEL,
  ]

  it('renders exactly that copy, in that order, and nothing else', async () => {
    const rendered = await site.page.evaluate(`return document.querySelector('main').innerText`)
    const flattened = rendered.replace(/\s+/g, ' ').trim()

    assert.equal(flattened, EXPECTED.join(' '))
  })

  it('matches the source markup too, so nothing is added by the stylesheet', async () => {
    const source = sourceText(mainOf(await read(CAREERS_PAGE)))

    assert.equal(source, EXPECTED.join(' '))
  })

  it('keeps the spec\'s straight quotes, hyphens and apostrophes as they were written', async () => {
    const source = sourceText(mainOf(await read(CAREERS_PAGE)))

    assert.doesNotMatch(source, /[“”‘’–—]/, 'the copy was typeset with curly quotes or long dashes')
    assert.equal((source.match(/"/g) ?? []).length, 8, 'the copy no longer carries the spec\'s eight quotation marks')
    assert.ok(source.includes('5-7 business days'), 'the spec\'s hyphen was replaced')
    assert.ok(source.includes('Wrocław'), 'the spec\'s spelling of Wrocław was changed')
  })

  it('escapes nothing it does not have to: no entities left showing in the copy', async () => {
    const source = sourceText(mainOf(await read(CAREERS_PAGE)))

    assert.doesNotMatch(source, /&[a-z]+;|&#\d+;/i, 'an HTML entity is rendering as text')
  })
})

describe('Careers task 13: no new colour, font or component beside the ones already there', () => {
  const site = servedInBrowser()

  it('uses only classes the site already had, plus the page\'s own layout ones', async () => {
    const used = await site.page.evaluate(`
      return [...new Set([...document.querySelectorAll('main *')].flatMap((el) => [...el.classList]))].sort()
    `)
    // Every one of these is a class the site already shipped, taken as it is:
    // the home page's hero band and its painted span, the "WHAT WE OFFER" grid
    // and box, the shared container and the shared band heading.
    const shared = [
      'card',
      'card__copy',
      'card__title',
      'container',
      'hero',
      'hero__heading',
      'hero__papaya',
      'section__heading',
      'services__grid',
    ]
    const own = used.filter((name) => !shared.includes(name))

    for (const name of own) {
      assert.match(name, /^careers(-[a-z]+)?(__[\w-]+)?$/, `${name} is neither a shared class nor one of this page's`)
    }
    for (const name of shared) {
      assert.ok(used.includes(name), `the page no longer uses the shared ${name}`)
    }
  })

  it('declares every one of its own classes, and declares nothing it does not use', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const block = careersBlock(css)
    const html = await read(CAREERS_PAGE)
    const declared = [...new Set([...block.matchAll(/\.(careers[\w-]*)/g)].map(([, name]) => name))]

    assert.ok(declared.length > 0, `${SERVICES_STYLESHEET} has no "Careers page" block`)
    for (const name of declared) {
      assert.ok(html.includes(`"${name}"`) || html.includes(`${name} `) || html.includes(`${name}"`), `${name} is declared and never used`)
    }
  })

  it('takes every colour from a token the palette already declared', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const block = careersBlock(css)
    const tokens = [...new Set([...css.matchAll(/^ {2}(--[\w-]+):/gm)].map(([, name]) => name))]

    for (const [, property, value] of block.matchAll(/\n {2}([a-z-]*colou?r): ([^;]+);/g)) {
      const named = value.match(/var\((--[\w-]+)\)/)
      assert.ok(named, `the careers block writes ${property}: ${value} rather than naming a token`)
      assert.ok(tokens.includes(named[1]), `${named[1]} is no token the palette declares`)
    }
  })

  it('adds no font, and renders in the family the rest of the site renders in', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const block = careersBlock(css)
    const fonts = await site.page.evaluate(`
      return [...document.querySelectorAll('main h1, main h2, main h3, main p')]
        .map((el) => getComputedStyle(el).fontFamily)
    `)

    assert.doesNotMatch(css, /@import|@font-face/i, `${SERVICES_STYLESHEET} pulls in a font file`)
    assert.equal(/font-family/.test(block), false, 'the careers block names a font of its own')
    assert.deepEqual([...new Set(fonts)], ['Inter, "Helvetica Neue", Arial, sans-serif'])
  })

  it('leaves the boxes on the pages that already shipped exactly as they were', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { page } = site

    for (const [file, selector, expected] of [
      [HOMEPAGE, '#services .services__grid > .card', BOX_BORDERS],
      [HOMEPAGE, '#values .services__grid > .card', BOX_BORDERS],
      [TEAM_PAGE, '.team .services__grid > .card', TEAM_BORDERS],
    ]) {
      await page.goto(`${site.origin}/${file}`)
      const borders = await page.evaluate(
        `return [...document.querySelectorAll('${selector}')].map((card) => getComputedStyle(card).borderTopColor)`,
      )

      assert.deepEqual(borders, expected.map((name) => shade(css, name)), `the boxes on ${file} changed shade`)
    }
  })
})

describe('Careers test plan: the page beyond its own tasks', () => {
  const site = servedInBrowser()

  it('is reached by clicking "CAREERS" in the nav on the home page, sections and all', async () => {
    const { page } = site
    await page.goto(`${site.origin}/${HOMEPAGE}`)
    const href = await page.evaluate(`
      const tab = [...document.querySelectorAll('.masthead__links a')].find((a) => a.textContent.trim() === 'Careers')
      return new URL(tab.href, location.href).href
    `)
    await page.goto(href)
    const landed = await page.evaluate(`
      return {
        path: location.pathname,
        heading: document.querySelector('main h1').textContent.replace(/\\s+/g, ' ').trim(),
        bands: [...document.querySelectorAll('main > section')].map((el) => el.classList[0]),
        boxes: document.querySelectorAll('main .card').length,
      }
    `)

    assert.equal(landed.path, `/${CAREERS_PAGE}`)
    assert.equal(landed.heading, CAREERS_HEADING)
    assert.deepEqual(landed.bands, ['hero', 'careers', 'careers-process', 'careers-openings'])
    assert.equal(landed.boxes, CAREERS_ROW_A.length + CAREERS_ROW_B.length + CAREERS_STEPS.length)
  })

  it('still reads in full with the stylesheet blocked, boxes and statements alike', async () => {
    const { page } = site
    await page.blockUrls([`*${SERVICES_STYLESHEET}*`])
    await page.goto(`${site.origin}/${CAREERS_PAGE}?css=off`)
    const bare = await page.evaluate(`
      return {
        painted: getComputedStyle(document.querySelector('.careers-process')).backgroundColor,
        text: document.querySelector('main').innerText.replace(/\\s+/g, ' ').trim(),
      }
    `)
    await page.blockUrls([])

    // Nothing is painted, so the stylesheet really did fail to arrive — which is
    // the condition this asserts the copy survives.
    assert.equal(bare.painted, 'rgba(0, 0, 0, 0)', 'the stylesheet was not actually blocked')
    for (const line of [CAREERS_HEADING, CAREERS_SUBHEADING, CAREERS_PROCESS_OPENING, CAREERS_PROCESS_CLOSING, CAREERS_LINK_LABEL]) {
      assert.ok(bare.text.includes(line), `"${line.slice(0, 30)}…" is unreadable without the stylesheet`)
    }
    for (const box of [...CAREERS_ROW_A, ...CAREERS_ROW_B, ...CAREERS_STEPS]) {
      assert.ok(bare.text.includes(box.title), `"${box.title}" is unreadable without the stylesheet`)
      assert.ok(bare.text.includes(box.copy), `the copy under "${box.title}" is unreadable without the stylesheet`)
    }
  })

  it('reads and wraps on a phone: nothing clipped, nothing off the side at 375px', async () => {
    await freshLoad(site, 375, 800)
    const narrow = await site.page.evaluate(BANDS)
    const wrapped = await site.page.evaluate(`
      return [...document.querySelectorAll('main .card__title, main .card__copy, main p')].map((el) => ({
        text: el.textContent.replace(/\\s+/g, ' ').trim().slice(0, 24),
        fits: el.scrollWidth <= el.clientWidth + 1,
      }))
    `)

    assert.equal(narrow.overflow, 0, 'the page scrolls sideways at 375px')
    assert.ok(Math.abs(narrow.process.rect.width - narrow.page.width) < 1, 'the papaya band is not full width at 375px')
    for (const line of wrapped) {
      assert.ok(line.fits, `"${line.text}…" overflows its box at 375px`)
    }
  })
})
