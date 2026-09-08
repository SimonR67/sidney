// Tests for the "Beta Centuri" site.
// Original build plan: specs/8393b537-ac67-46f5-b4e0-0b0d2e416f06/plan.md
// Grey rebrand plan (dark grey page, orange accents):
// specs/201be276-bbdc-4548-b65d-b0f2c227227f/plan.md
// Alpha rebrand plan (dark blue page, orange accents, new name):
// specs/392b9d9e-063b-4b5e-80e0-17475eb94210/plan.md
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { join } from 'node:path'
import {
  contrastRatio,
  isDarkBlue,
  isLightGrey,
  isOrange,
  openPage,
  parseColor,
  serveStatic,
} from './browser.mjs'
import {
  COLOURS,
  COLOUR_VARS,
  OLD_COLOURS,
  PAGES,
  NAV_LINKS,
  MIN_CONTRAST,
  OLD_SITE_NAME,
  NOTES,
  SITE_NAME,
  STYLESHEET,
  declaredValue,
  headingsIn,
  hexColours,
  htmlFiles,
  linksIn,
  mainOf,
  navBlock,
  parseHex,
  read,
  repoRoot,
  rootEntries,
  siteFiles,
  tagsIn,
  textOf,
  titleOf,
} from './site.mjs'

const GLOBAL_SELECTORS = [':root', '*', 'html', 'body']

/**
 * Serves the repo and opens one headless-Chrome page for the enclosing suite.
 * Returns a handle whose `page`/`origin` are filled in by the time tests run.
 */
const servedInBrowser = () => {
  const handle = {}
  before(async () => {
    handle.server = await serveStatic(repoRoot)
    handle.origin = handle.server.origin
    handle.page = await openPage(`${handle.origin}/index.html`)
  })
  after(async () => {
    await handle.page?.close()
    await handle.server?.close()
  })
  return handle
}

/** Every text-bearing element's colour against the background it actually sits on. */
const TEXT_ON_BACKGROUND = `
  const opaque = (colour) => {
    const [, , , a = '1'] = colour.match(/[\\d.]+/g) ?? []
    return Number(a) > 0
  }
  return [...document.querySelectorAll('body, body *')]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .map((el) => {
      let node = el
      let background = 'rgba(0, 0, 0, 0)'
      while (node) {
        const candidate = getComputedStyle(node).backgroundColor
        if (opaque(candidate)) { background = candidate; break }
        node = node.parentElement
      }
      return { text: el.textContent.trim().slice(0, 40), color: getComputedStyle(el).color, background }
    })
`

/** Clicks the nav link labelled `label` and waits for `expectedPath` to finish loading. */
const clickNav = async (page, label, expectedPath) => {
  await page.evaluate(`
    const label = ${JSON.stringify(label)};
    const link = [...document.querySelectorAll('nav a')].find((a) => a.textContent.trim() === label);
    if (!link) throw new Error('no nav link labelled ' + label);
    link.click();
    return null;
  `)
  for (let i = 0; i < 100; i++) {
    try {
      const state = await page.evaluate('return { path: location.pathname, ready: document.readyState }')
      if (state.path === expectedPath && state.ready === 'complete') return
    } catch {
      // The execution context goes away mid-navigation; try again.
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  assert.fail(`clicking "${label}" never landed on ${expectedPath}`)
}

describe('Task 1: shared stylesheet base colours', () => {
  it('paints the page a dark blue', async () => {
    const css = await read(STYLESHEET)
    const background = declaredValue(css, GLOBAL_SELECTORS, 'background-color')

    assert.ok(background, `no background-color on any of ${GLOBAL_SELECTORS.join(', ')} in ${STYLESHEET}`)
    assert.ok(
      isDarkBlue(parseHex(background)),
      `${STYLESHEET} sets background-color: ${background}, which is not a dark blue`,
    )
  })

  it('writes the body copy in a light grey', async () => {
    const css = await read(STYLESHEET)
    const colour = declaredValue(css, GLOBAL_SELECTORS, 'color')

    assert.ok(colour, `no color on any of ${GLOBAL_SELECTORS.join(', ')} in ${STYLESHEET}`)
    assert.ok(isLightGrey(parseHex(colour)), `${STYLESHEET} sets color: ${colour}, which is not a light grey`)
  })

  it('declares the base colours as the values the tests expect', async () => {
    const css = await read(STYLESHEET)

    assert.equal(declaredValue(css, GLOBAL_SELECTORS, 'background-color'), COLOURS.darkBlue)
    assert.equal(declaredValue(css, GLOBAL_SELECTORS, 'color'), COLOURS.lightGrey)
  })
})

describe('Task 2: the Home page', () => {
  it('carries the site title in the browser tab', async () => {
    assert.equal(titleOf(await read('index.html')), SITE_NAME)
  })

  it('links the shared stylesheet', async () => {
    const html = await read('index.html')

    assert.match(html, new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="${STYLESHEET}"`))
  })

  it('shows the site title as the page heading', async () => {
    const headings = headingsIn(await read('index.html'))

    assert.deepEqual(headings.at(0), { level: 1, text: SITE_NAME })
  })

  it('offers the three-item nav menu', async () => {
    const nav = navBlock(await read('index.html'))

    assert.ok(nav, 'index.html has no <nav>')
    assert.deepEqual(linksIn(nav), NAV_LINKS)
  })

  it('welcomes the visitor to the site by name', async () => {
    const main = mainOf(await read('index.html'))

    assert.match(textOf(main), /welcome/i)
    assert.match(textOf(main), new RegExp(SITE_NAME))
  })
})

describe('Task 3: the About Us page', () => {
  it('carries the site title and the shared stylesheet', async () => {
    const html = await read('about.html')

    assert.equal(titleOf(html), SITE_NAME)
    assert.match(html, new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="${STYLESHEET}"`))
    assert.deepEqual(headingsIn(html).at(0), { level: 1, text: SITE_NAME })
  })

  it('offers the same three-item nav menu', async () => {
    const nav = navBlock(await read('about.html'))

    assert.ok(nav, 'about.html has no <nav>')
    assert.deepEqual(linksIn(nav), NAV_LINKS)
  })

  it('is headed "About Us" and says only that it is coming soon', async () => {
    const main = mainOf(await read('about.html'))

    assert.deepEqual(headingsIn(main), [{ level: 2, text: 'About Us' }])
    assert.match(textOf(main), /^About Us\b.*coming soon/i)
  })

  it('holds no content beyond that heading and placeholder', async () => {
    const main = mainOf(await read('about.html'))

    assert.deepEqual(tagsIn(main), ['h2', 'p'])
  })
})

describe('Task 4: the Contact page', () => {
  it('carries the site title and the shared stylesheet', async () => {
    const html = await read('contact.html')

    assert.equal(titleOf(html), SITE_NAME)
    assert.match(html, new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="${STYLESHEET}"`))
    assert.deepEqual(headingsIn(html).at(0), { level: 1, text: SITE_NAME })
  })

  it('offers the same three-item nav menu', async () => {
    const nav = navBlock(await read('contact.html'))

    assert.ok(nav, 'contact.html has no <nav>')
    assert.deepEqual(linksIn(nav), NAV_LINKS)
  })

  it('is headed "Contact" and says only that it is coming soon', async () => {
    const main = mainOf(await read('contact.html'))

    assert.deepEqual(headingsIn(main), [{ level: 2, text: 'Contact' }])
    assert.match(textOf(main), /^Contact\b.*coming soon/i)
  })

  it('carries no contact form', async () => {
    const html = await read('contact.html')

    for (const tag of ['form', 'input', 'textarea', 'select', 'button']) {
      assert.ok(!tagsIn(html).includes(tag), `contact.html contains a <${tag}>`)
    }
  })
})

describe('Task 5: the nav menu, styled the same on every page', () => {
  it('uses byte-identical nav markup on all three pages', async () => {
    const [home, ...rest] = await Promise.all(PAGES.map(async (p) => navBlock(await read(p.file))))

    for (const [index, nav] of rest.entries()) {
      assert.equal(nav, home, `${PAGES[index + 1].file} nav markup differs from index.html`)
    }
  })

  it('paints the nav itself dark blue with orange links, not just the body', async () => {
    const css = await read(STYLESHEET)
    const background = declaredValue(css, ['.site-nav'], 'background-color')
    const linkColour = declaredValue(css, ['.site-nav__links a'], 'color')

    assert.ok(background, `${STYLESHEET} sets no background-color on .site-nav`)
    assert.ok(isDarkBlue(parseHex(background)), `.site-nav background-color is ${background}, not a dark blue`)
    assert.ok(linkColour, `${STYLESHEET} sets no color on the nav links`)
    assert.ok(isOrange(parseHex(linkColour)), `nav link color is ${linkColour}, not an orange`)
  })

  it('keeps the layout simple: no grids, columns, animations or transitions', async () => {
    const css = await read(STYLESHEET)

    for (const pattern of [/@keyframes/i, /\banimation\b/i, /\btransition\b/i, /display:\s*grid/i, /\bfloat:/i, /\bcolumn-count\b/i]) {
      assert.ok(!pattern.test(css), `${STYLESHEET} should not use ${pattern}`)
    }
  })
})

describe('Task 5 (rendered): nav colours in the browser', () => {
  const site = servedInBrowser()

  for (const { file } of PAGES) {
    it(`renders ${file} with a dark blue nav and orange nav links`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      const state = await page.evaluate(`
        const nav = document.querySelector('nav');
        const link = nav.querySelector('a');
        return {
          navBg: getComputedStyle(nav).backgroundColor,
          linkColor: getComputedStyle(link).color,
          bodyBg: getComputedStyle(document.body).backgroundColor,
          bodyColor: getComputedStyle(document.body).color,
        }
      `)

      assert.ok(isDarkBlue(parseColor(state.navBg)), `nav background on ${file} is ${state.navBg}`)
      assert.ok(isOrange(parseColor(state.linkColor)), `nav link colour on ${file} is ${state.linkColor}`)
      assert.ok(isDarkBlue(parseColor(state.bodyBg)), `body background on ${file} is ${state.bodyBg}`)
      assert.ok(isLightGrey(parseColor(state.bodyColor)), `body text colour on ${file} is ${state.bodyColor}`)
    })
  }
})

describe('Task 6: the foreground shades stay legible on every surface', () => {
  const FOREGROUNDS = ['lightGrey', 'orange', 'orangeBright', 'orangeDeep']
  const SURFACES = Object.keys(COLOURS).filter((name) => !FOREGROUNDS.includes(name))

  for (const surface of SURFACES) {
    for (const foreground of FOREGROUNDS) {
      it(`clears the readability threshold for ${foreground} on ${surface}`, () => {
        const ratio = contrastRatio(parseHex(COLOURS[foreground]), parseHex(COLOURS[surface]))

        assert.ok(
          ratio >= MIN_CONTRAST,
          `${COLOURS[foreground]} on ${COLOURS[surface]} is only ${ratio.toFixed(2)}:1, below ${MIN_CONTRAST}:1`,
        )
      })
    }
  }

  it('uses no colours beyond the declared palette', async () => {
    const css = await read(STYLESHEET)

    assert.deepEqual([...new Set(hexColours(css))].sort(), Object.values(COLOURS).sort())
  })
})

describe('Task 6 (rendered): every line of text on every page', () => {
  const site = servedInBrowser()

  for (const { file } of PAGES) {
    it(`keeps every line on ${file} legible against its background`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      const lines = await page.evaluate(TEXT_ON_BACKGROUND)

      assert.ok(lines.length > 0, `no text found on ${file}`)
      for (const line of lines) {
        const ratio = contrastRatio(parseColor(line.color), parseColor(line.background))
        assert.ok(
          ratio >= MIN_CONTRAST,
          `"${line.text}" on ${file}: ${line.color} on ${line.background} is ${ratio.toFixed(2)}:1`,
        )
      }
    })
  }
})

describe('Task 7: nothing left of the superseded site', () => {
  it('serves exactly the three pages of the new site', async () => {
    assert.deepEqual(await htmlFiles(), ['about.html', 'contact.html', 'index.html'])
  })

  it('is built from those pages and the one stylesheet, nothing else', async () => {
    assert.deepEqual(await siteFiles(), ['about.html', 'contact.html', 'index.html', 'package.json', 'style.css'])
  })

  it('leaves no old pages, stylesheets or asset folders in the repository root', async () => {
    assert.deepEqual(await rootEntries(), [
      '.github',
      'about.html',
      'contact.html',
      'index.html',
      'package.json',
      'specs',
      'style.css',
      'tests',
    ])
  })

  it('mentions the superseded site name nowhere in the site or its tests', async () => {
    const files = [...(await siteFiles()), 'tests/browser.mjs', 'tests/page.test.mjs', 'tests/site.mjs']

    for (const file of files) {
      const contents = await read(file)
      const mentions = file === 'tests/site.mjs'
        ? contents.replace(/^.*OLD_SITE_NAME.*$/m, '')
        : contents
      assert.ok(!OLD_SITE_NAME.test(mentions), `${file} still mentions the superseded site name`)
    }
  })
})

describe('Task 8: every link resolves', () => {
  it('points every href on every page at a file that exists', async () => {
    for (const { file } of PAGES) {
      for (const { href } of linksIn(await read(file))) {
        assert.ok(!href.startsWith('#'), `${file} links to the in-page anchor ${href}`)
        await access(join(repoRoot, href))
      }
    }
  })
})

describe('Task 8 (rendered): clicking through the nav', () => {
  const site = servedInBrowser()

  for (const from of PAGES) {
    it(`reaches every page from ${from.file} without a missing file`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${from.file}`)

      for (const to of PAGES) {
        await clickNav(page, to.label, `/${to.file}`)
        const state = await page.evaluate(`
          return {
            title: document.title,
            siteTitle: document.querySelector('h1').textContent.trim(),
            heading: document.querySelector('main h2').textContent.trim(),
            navLinks: document.querySelectorAll('nav a').length,
            body: document.body.textContent.trim(),
          }
        `)

        assert.equal(state.title, SITE_NAME)
        assert.equal(state.siteTitle, SITE_NAME)
        assert.equal(state.heading, to.heading)
        assert.equal(state.navLinks, NAV_LINKS.length)
        assert.ok(state.body.length > 0, `${to.file} rendered no text`)
        await page.goto(`${site.origin}/${from.file}`)
      }

      assert.deepEqual(page.failedRequests, [], `${from.file} produced failed requests`)
      assert.deepEqual(page.consoleMessages, [], `${from.file} logged console errors`)
      assert.deepEqual(page.pageErrors, [])
    })
  }
})

describe('Test plan: the visitor journey end to end', () => {
  const site = servedInBrowser()

  const VISITOR_STATE = `
    return {
      path: location.pathname,
      title: document.title,
      siteTitle: document.querySelector('h1').textContent.trim(),
      heading: document.querySelector('main h2').textContent.trim(),
      copy: document.querySelector('main p').textContent.trim(),
      nav: [...document.querySelectorAll('nav a')].map((a) => ({ href: a.getAttribute('href'), label: a.textContent.trim() })),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      navBg: getComputedStyle(document.querySelector('nav')).backgroundColor,
      navColor: getComputedStyle(document.querySelector('nav a')).color,
      headingColor: getComputedStyle(document.querySelector('main h2')).color,
      copyColor: getComputedStyle(document.querySelector('main p')).color,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      interactive: document.querySelectorAll('form, input, button, select, textarea, img, script').length,
    }
  `

  const assertHouseStyle = (state, where) => {
    assert.equal(state.title, SITE_NAME, `${where}: browser tab`)
    assert.equal(state.siteTitle, SITE_NAME, `${where}: visible site title`)
    assert.deepEqual(state.nav, NAV_LINKS, `${where}: nav menu`)
    assert.ok(isDarkBlue(parseColor(state.bodyBg)), `${where}: body background ${state.bodyBg}`)
    assert.ok(isDarkBlue(parseColor(state.navBg)), `${where}: nav background ${state.navBg}`)
    assert.ok(isOrange(parseColor(state.navColor)), `${where}: nav link colour ${state.navColor}`)
    assert.ok(isOrange(parseColor(state.headingColor)), `${where}: heading colour ${state.headingColor}`)
    assert.ok(isLightGrey(parseColor(state.copyColor)), `${where}: body copy colour ${state.copyColor}`)
    assert.equal(state.overflow, false, `${where}: page overflows sideways`)
    assert.equal(state.interactive, 0, `${where}: page carries forms, images or scripts`)
  }

  for (const width of [1280, 375]) {
    it(`walks Home → About Us → Contact → Home at ${width}px`, async () => {
      const { page } = site
      await page.setViewport(width, 900)
      await page.goto(`${site.origin}/index.html`)

      const home = await page.evaluate(VISITOR_STATE)
      assertHouseStyle(home, `Home at ${width}px`)
      assert.equal(home.heading, 'Home')
      assert.match(home.copy, /welcome/i)

      for (const label of ['About Us', 'Contact', 'Home']) {
        const { file, heading } = PAGES.find((p) => p.label === label)
        await clickNav(page, label, `/${file}`)
        const state = await page.evaluate(VISITOR_STATE)

        assertHouseStyle(state, `${label} at ${width}px`)
        assert.equal(state.heading, heading)
        assert.match(state.copy, label === 'Home' ? /welcome/i : /coming soon/i)
      }
    })
  }

  it('serves structurally sound markup on every page', async () => {
    const nonVoid = ['html', 'head', 'body', 'header', 'nav', 'main', 'ul', 'li', 'a', 'h1', 'h2', 'p', 'title']

    for (const { file } of PAGES) {
      const html = await read(file)

      assert.match(html, /^<!DOCTYPE html>\n<html lang="en">/, `${file} lacks a doctype and language`)
      assert.equal(tagsIn(html).filter((tag) => tag === 'h1').length, 1, `${file} should have exactly one h1`)
      for (const tag of nonVoid) {
        const open = [...html.matchAll(new RegExp(`<${tag}\\b`, 'gi'))].length
        const close = [...html.matchAll(new RegExp(`</${tag}>`, 'gi'))].length
        assert.equal(open, close, `${file} has ${open} <${tag}> against ${close} </${tag}>`)
      }
    }
  })
})

describe('Beta rebrand task 7: two layered surfaces', () => {
  const site = servedInBrowser()

  it('declares a base surface and a raised one, both dark blue and not the same', async () => {
    const css = await read(STYLESHEET)
    const base = declaredValue(css, GLOBAL_SELECTORS, 'background-color')
    const raised = declaredValue(css, ['.site-header'], 'background-color')

    assert.ok(raised, `${STYLESHEET} sets no background-color on .site-header`)
    assert.ok(isDarkBlue(parseHex(base)), `the page background ${base} is not a dark blue`)
    assert.ok(isDarkBlue(parseHex(raised)), `the header background ${raised} is not a dark blue`)
    assert.notEqual(raised, base, 'the header and the page share one shade, so nothing is layered')
  })

  for (const { file } of PAGES) {
    it(`renders ${file} with the header sitting on a different dark blue to the page`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      const state = await page.evaluate(`
        return {
          pageBg: getComputedStyle(document.body).backgroundColor,
          headerBg: getComputedStyle(document.querySelector('.site-header')).backgroundColor,
        }
      `)

      assert.ok(isDarkBlue(parseColor(state.pageBg)), `page background on ${file} is ${state.pageBg}`)
      assert.ok(isDarkBlue(parseColor(state.headerBg)), `header background on ${file} is ${state.headerBg}`)
      assert.notEqual(state.headerBg, state.pageBg, `header and page render the same shade on ${file}`)
    })
  }
})

describe('Beta rebrand task 10: body copy stays light grey and legible', () => {
  const site = servedInBrowser()

  for (const { file } of PAGES) {
    it(`renders the copy on ${file} in light grey, well clear of the contrast floor`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      const state = await page.evaluate(`
        const copy = document.querySelector('main p');
        return { color: getComputedStyle(copy).color, background: getComputedStyle(document.body).backgroundColor }
      `)
      const ratio = contrastRatio(parseColor(state.color), parseColor(state.background))

      assert.ok(isLightGrey(parseColor(state.color)), `body copy on ${file} is ${state.color}, not a light grey`)
      assert.ok(
        ratio >= MIN_CONTRAST,
        `body copy on ${file} is ${state.color} on ${state.background}: ${ratio.toFixed(2)}:1`,
      )
    })
  }
})

describe('Beta rebrand task 7: one documented palette', () => {
  it('records every chosen shade in the plan notes', async () => {
    const notes = await read(NOTES)

    for (const hex of Object.values(COLOURS)) {
      assert.match(notes, new RegExp(hex, 'i'), `${NOTES} does not record ${hex}`)
    }
  })

  it('writes each shade once, as a custom property named after it', async () => {
    const css = await read(STYLESHEET)

    for (const [name, hex] of Object.entries(COLOURS)) {
      assert.equal(declaredValue(css, [':root'], COLOUR_VARS[name]), hex)
      assert.equal(
        hexColours(css).filter((colour) => colour === hex).length,
        1,
        `${hex} is written more than once in ${STYLESHEET}; it should come from ${COLOUR_VARS[name]}`,
      )
    }
  })
})

describe('Beta rebrand task 8: buttons carry the orange, hover and active included', () => {
  const site = servedInBrowser()

  /** Adds a primary and a secondary button to the page under test. */
  const INJECT_BUTTONS = `
    for (const [id, className] of [['probe-primary', 'btn'], ['probe-secondary', 'btn btn--secondary']]) {
      const button = document.createElement('button')
      button.id = id
      button.className = className
      button.textContent = 'Probe'
      document.body.append(button)
    }
    return null
  `

  const paintOf = (selector) => `
    const style = getComputedStyle(document.querySelector(${JSON.stringify(selector)}));
    return { background: style.backgroundColor, border: style.borderTopColor, label: style.color }
  `

  /** The `{ rest, hover, active }` paint of `selector`, each state forced in turn. */
  const paintByState = async (page, selector) => {
    const paint = {}
    for (const [name, forced] of [['rest', []], ['hover', ['hover']], ['active', ['active']]]) {
      await page.forcePseudoState(selector, forced)
      paint[name] = await page.evaluate(paintOf(selector))
    }
    await page.forcePseudoState(selector, [])
    return paint
  }

  it('paints a primary button orange, in a visibly different shade on hover and on press', async () => {
    const { page } = site
    await page.goto(`${site.origin}/index.html`)
    await page.evaluate(INJECT_BUTTONS)
    const paint = await paintByState(page, '#probe-primary')

    for (const [state, colours] of Object.entries(paint)) {
      assert.ok(
        isOrange(parseColor(colours.background)),
        `a primary button under :${state} is ${colours.background}, which is not an orange`,
      )
      assert.ok(
        isOrange(parseColor(colours.border)),
        `a primary button's border under :${state} is ${colours.border}, which is not an orange`,
      )
      const ratio = contrastRatio(parseColor(colours.label), parseColor(colours.background))
      assert.ok(
        ratio >= MIN_CONTRAST,
        `a primary button's label under :${state} is ${colours.label} on ${colours.background}: ${ratio.toFixed(2)}:1`,
      )
    }
    assert.notEqual(paint.hover.background, paint.rest.background, 'hover is indistinguishable from rest')
    assert.notEqual(paint.active.background, paint.rest.background, 'active is indistinguishable from rest')
    assert.notEqual(paint.active.background, paint.hover.background, 'active is indistinguishable from hover')
  })

  it('carries the orange on a secondary button through its border and label', async () => {
    const { page } = site
    await page.goto(`${site.origin}/index.html`)
    await page.evaluate(INJECT_BUTTONS)
    const paint = await paintByState(page, '#probe-secondary')

    for (const [state, colours] of Object.entries(paint)) {
      assert.ok(
        isOrange(parseColor(colours.border)),
        `a secondary button's border under :${state} is ${colours.border}, which is not an orange`,
      )
      assert.ok(
        isOrange(parseColor(colours.label)),
        `a secondary button's label under :${state} is ${colours.label}, which is not an orange`,
      )
    }
    assert.notEqual(paint.hover.border, paint.rest.border, 'hover is indistinguishable from rest')
    assert.notEqual(paint.active.border, paint.hover.border, 'active is indistinguishable from hover')
  })
})

describe('Beta rebrand task 9: links, the current nav item, badges and the focus ring', () => {
  const site = servedInBrowser()

  it('paints a link outside the nav and a badge in orange', async () => {
    const { page } = site
    await page.goto(`${site.origin}/index.html`)
    const paint = await page.evaluate(`
      const link = document.createElement('a')
      link.href = 'about.html'
      link.textContent = 'Probe'
      const badge = document.createElement('span')
      badge.className = 'badge'
      badge.textContent = 'New'
      document.querySelector('main').append(link, badge)
      return {
        link: getComputedStyle(link).color,
        badgeLabel: getComputedStyle(badge).color,
        badgeBorder: getComputedStyle(badge).borderTopColor,
      }
    `)

    assert.ok(isOrange(parseColor(paint.link)), `a link is ${paint.link}, which is not an orange`)
    assert.ok(isOrange(parseColor(paint.badgeLabel)), `a badge's label is ${paint.badgeLabel}`)
    assert.ok(isOrange(parseColor(paint.badgeBorder)), `a badge's border is ${paint.badgeBorder}`)
  })

  it('sets the current nav item apart from its neighbours, in orange', async () => {
    const { page } = site
    await page.goto(`${site.origin}/index.html`)
    const paint = await page.evaluate(`
      const [current, other] = document.querySelectorAll('nav a')
      current.setAttribute('aria-current', 'page')
      return {
        currentColor: getComputedStyle(current).color,
        currentDecoration: getComputedStyle(current).textDecorationLine,
        otherColor: getComputedStyle(other).color,
        otherDecoration: getComputedStyle(other).textDecorationLine,
      }
    `)

    assert.ok(isOrange(parseColor(paint.currentColor)), `the current nav item is ${paint.currentColor}`)
    assert.notEqual(
      `${paint.currentColor} ${paint.currentDecoration}`,
      `${paint.otherColor} ${paint.otherDecoration}`,
      'the current nav item looks exactly like the other nav items',
    )
  })

  for (const { file } of PAGES) {
    it(`rings a keyboard-focused nav link on ${file} in orange`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      await page.forcePseudoState('nav a', ['focus-visible'])
      const outline = await page.evaluate(`
        const style = getComputedStyle(document.querySelector('nav a'));
        return { color: style.outlineColor, style: style.outlineStyle, width: style.outlineWidth }
      `)
      await page.forcePseudoState('nav a', [])

      assert.ok(isOrange(parseColor(outline.color)), `the focus ring on ${file} is ${outline.color}`)
      assert.notEqual(outline.style, 'none', `the focus ring on ${file} has no outline style`)
      assert.notEqual(outline.width, '0px', `the focus ring on ${file} is 0px wide`)
    })
  }
})

describe('Beta rebrand task 8: the pages themselves stay button-free', () => {
  const site = servedInBrowser()

  const BUTTONS = `
    return [...document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], .btn, .button')]
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        background: getComputedStyle(el).backgroundColor,
        border: getComputedStyle(el).borderColor,
      }))
  `

  for (const { file } of PAGES) {
    it(`ships no button on ${file}, so the button styles wait for one`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)
      const buttons = await page.evaluate(BUTTONS)

      // Should a button ever appear, it has to carry the orange itself.
      for (const button of buttons) {
        assert.ok(
          isOrange(parseColor(button.background)) || isOrange(parseColor(button.border)),
          `<${button.tag}> on ${file} is ${button.background} on ${button.border}, neither of them orange`,
        )
      }
      assert.deepEqual(buttons, [], `${file} now carries a button; the gap flagged in ${NOTES} is out of date`)
    })
  }
})

describe('Beta rebrand task 9 (rendered): every accent is orange, in every state', () => {
  const site = servedInBrowser()

  const ACCENTS = { 'the site title': 'h1.site-title', 'the page heading': 'main h2', 'a nav link': 'nav a' }

  for (const { file } of PAGES) {
    it(`paints the accents on ${file} orange at rest, on hover and on focus`, async () => {
      const { page } = site
      await page.goto(`${site.origin}/${file}`)

      for (const [what, selector] of Object.entries(ACCENTS)) {
        for (const state of [[], ['hover'], ['focus'], ['active']]) {
          await page.forcePseudoState(selector, state)
          const colour = await page.evaluate(
            `return getComputedStyle(document.querySelector(${JSON.stringify(selector)})).color`,
          )

          assert.ok(
            isOrange(parseColor(colour)),
            `${what} on ${file} is ${colour} under :${state.join(':') || 'rest'}, which is not an orange`,
          )
        }
        await page.forcePseudoState(selector, [])
      }
    })
  }
})

describe('Beta rebrand tasks 5-6: the metadata and footer this site does not carry', () => {
  it('carries no meta tag beyond charset and viewport, so none can name the site', async () => {
    for (const file of await htmlFiles()) {
      const metas = [...(await read(file)).matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag)

      assert.equal(metas.length, 2, `${file} has meta tags this rebrand has not accounted for:\n${metas.join('\n')}`)
      assert.match(metas[0], /charset="utf-8"/)
      assert.match(metas[1], /name="viewport"/)
    }
  })

  it('ships no web app manifest to rename', async () => {
    const manifests = (await siteFiles()).filter((file) => /manifest\.json$|\.webmanifest$/.test(file))

    assert.deepEqual(manifests, [], `${NOTES} flags the site as having no manifest`)
    for (const file of await htmlFiles()) {
      assert.ok(!/rel="manifest"/i.test(await read(file)), `${file} links a manifest`)
    }
  })

  it('renders no footer or copyright line to rename', async () => {
    for (const file of await htmlFiles()) {
      const html = await read(file)

      assert.ok(!tagsIn(html).includes('footer'), `${file} contains a <footer>`)
      assert.ok(!/©|&copy;|copyright/i.test(html), `${file} carries a copyright line`)
    }
  })
})

describe('Beta rebrand task 11: the flagged gaps are written down', () => {
  it('lists each out-of-scope gap in the plan notes', async () => {
    const notes = await read(NOTES)
    const [, gaps] = notes.split(/^## \d+\. Flagged gaps.*$/m)

    assert.ok(gaps, `${NOTES} has no "Flagged gaps" section`)
    const GAPS = ['package.json', 'button', 'badge', 'meta', 'manifest', 'footer', 'toggle', 'favicon', 'image', 'README']

    for (const gap of GAPS) {
      assert.match(gaps, new RegExp(gap, 'i'), `the flagged gaps say nothing about ${gap}`)
    }
  })
})

describe('Beta rebrand task 1: the superseded name, found and written down', () => {
  /** The section of the notes under the given `## n. Heading`, up to the next heading. */
  const section = async (heading) => {
    const notes = await read(NOTES)
    return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
  }

  it('names every file the old site name was found in', async () => {
    const discovery = await section('Discovery')

    assert.ok(discovery, `${NOTES} has no "Discovery" section`)
    for (const file of ['index.html', 'about.html', 'contact.html', 'style.css', 'package.json', 'tests/']) {
      assert.match(discovery, new RegExp(file.replace('.', '\\.')), `the discovery notes omit ${file}`)
    }
  })

  it('splits those occurrences into the user-visible ones and the internal-only ones', async () => {
    const discovery = await section('Discovery')

    assert.match(discovery, /user-visible/i, 'the discovery notes do not mark the user-visible occurrences')
    assert.match(discovery, /internal[- ]only/i, 'the discovery notes do not mark the internal-only occurrences')
  })

  it('records where the theme colours are defined', async () => {
    const discovery = await section('Discovery')

    assert.match(discovery, new RegExp(STYLESHEET.replace('.', '\\.')), `the discovery notes omit ${STYLESHEET}`)
    assert.match(discovery, /custom propert/i, 'the discovery notes do not say how the colours are centralised')
  })
})

describe('Alpha rebrand task 1: the audit of what has to change', () => {
  /** The block under a `### Heading` inside the notes, up to the next heading of any level. */
  const subsection = async (heading) => {
    const notes = await read(NOTES)
    return notes.split(new RegExp(`^### ${heading}.*$`, 'm')).at(1)?.split(/^#{2,3} /m).at(0) ?? null
  }

  /** Every `file.ext:line` reference written in a block of the audit. */
  const references = (block) => [...block.matchAll(/`([\w./-]+\.\w+):(\d+)`/g)].map(([, file, line]) => `${file}:${line}`)

  const AUDIT = {
    'Site title occurrences': ['index.html:6', 'about.html:6', 'contact.html:6'],
    'Background colour declarations': ['style.css:17', 'style.css:23', 'style.css:70', 'style.css:76'],
    'Button colour declarations': ['style.css:121', 'style.css:122', 'style.css:123'],
    'Link and text-accent colour declarations': ['style.css:33', 'style.css:39', 'style.css:47', 'style.css:89'],
    'Home page content source': ['index.html:26', 'index.html:27'],
  }

  for (const [heading, expected] of Object.entries(AUDIT)) {
    it(`lists concrete file:line references under "${heading}"`, async () => {
      const block = await subsection(heading)

      assert.ok(block, `${NOTES} has no "### ${heading}" section`)
      const found = references(block)
      for (const reference of expected) {
        assert.ok(found.includes(reference), `the "${heading}" audit omits ${reference}`)
      }
    })
  }

  it('accounts for every file of the site and its tests, so nothing found is left off the list', async () => {
    const notes = await read(NOTES)
    const [, discovery] = notes.split(/^## \d+\. Discovery.*$/m)

    assert.ok(discovery, `${NOTES} has no "Discovery" section`)
    for (const file of [...(await siteFiles()), 'tests/site.mjs', 'tests/page.test.mjs']) {
      assert.match(discovery, new RegExp(file.replace(/\./g, '\\.')), `the audit never mentions ${file}`)
    }
  })

  it('names the branding text and the home page copy the rebrand has to rewrite', async () => {
    const branding = await subsection('Site title occurrences')
    const home = await subsection('Home page content source')

    for (const reference of ['index.html:16', 'about.html:16', 'contact.html:16']) {
      assert.ok(references(branding).includes(reference), `the audit omits the visible branding at ${reference}`)
    }
    assert.match(home, /<main>/, 'the audit does not say where the home page copy lives')
  })
})

describe('Alpha rebrand task 2: the new theme values, named and centralised', () => {
  const SURFACES = { darkBlue: 'the page surface', raisedBlue: 'the raised header/nav surface' }
  const ACCENTS = { orange: 'the accent', orangeBright: 'its hover shade', orangeDeep: 'its pressed shade' }

  it('declares the dark blues as custom properties holding the intended hexes', async () => {
    const css = await read(STYLESHEET)

    for (const [name, what] of Object.entries(SURFACES)) {
      const declared = declaredValue(css, [':root'], COLOUR_VARS[name])

      assert.equal(declared, COLOURS[name], `${COLOUR_VARS[name]} (${what}) is not ${COLOURS[name]}`)
      assert.ok(isDarkBlue(parseHex(declared)), `${COLOUR_VARS[name]} is ${declared}, which is not a dark blue`)
    }
  })

  it('keeps the oranges as custom properties holding the intended hexes', async () => {
    const css = await read(STYLESHEET)

    for (const [name, what] of Object.entries(ACCENTS)) {
      const declared = declaredValue(css, [':root'], COLOUR_VARS[name])

      assert.equal(declared, COLOURS[name], `${COLOUR_VARS[name]} (${what}) is not ${COLOURS[name]}`)
      assert.ok(isOrange(parseHex(declared)), `${COLOUR_VARS[name]} is ${declared}, which is not an orange`)
    }
  })

  it('keeps the two blues distinct, so the header can sit on its own layer', () => {
    assert.notEqual(COLOURS.darkBlue, COLOURS.raisedBlue)
  })

  it('writes the new shades once each, so nothing hard-codes them', async () => {
    const css = await read(STYLESHEET)

    for (const name of Object.keys(SURFACES)) {
      assert.equal(
        hexColours(css).filter((colour) => colour === COLOURS[name]).length,
        1,
        `${COLOURS[name]} is written more than once in ${STYLESHEET}; it should come from ${COLOUR_VARS[name]}`,
      )
    }
  })
})

describe('Beta rebrand task 7: no trace of the superseded shades', () => {
  it('mentions none of the old dark green, old gold or old dark blue anywhere in the site', async () => {
    for (const file of await siteFiles()) {
      const contents = await read(file)

      for (const digits of OLD_COLOURS) {
        assert.ok(
          !new RegExp(digits, 'i').test(contents),
          `${file} still uses the superseded colour #${digits}`,
        )
      }
    }
  })
})
