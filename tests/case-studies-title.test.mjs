// Tests for the one word of the Case Studies title painted papaya: "STUDIES",
// set in the very span the home page paints "REALLY WELL" with.
// Plan: specs/a8e4733b-d0b3-4d8b-961f-615f5797d5a5/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { openPage, serveStatic } from './browser.mjs'
import {
  BREAKPOINTS,
  CASE_STUDIES_ACCENT,
  CASE_STUDIES_ACCENT_NOTES,
  CASE_STUDIES_HEADING,
  CASE_STUDIES_PAGE,
  CASE_STUDIES_PLAIN,
  HERO_ACCENT,
  HERO_ACCENT_CLASS,
  HOMEPAGE,
  SERVICES_STYLESHEET,
  beforeCaseStudiesAccent,
  declaredValue,
  parseHex,
  read,
  repoRoot,
  textOf,
} from './site.mjs'

/** The section of this job's notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(CASE_STUDIES_ACCENT_NOTES).catch(() => '')
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

/**
 * Serves the repo and opens one headless-Chrome page for the enclosing suite,
 * on the Case Studies page unless another is named. `page`/`origin` are filled
 * in by the time the tests run.
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
const freshLoad = async (site, width = 1280, height = 900) => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}`)
}

/** A `:root` shade, written the way `getComputedStyle` reports it. */
const shade = (css, name) => {
  const { r, g, b } = parseHex(declaredValue(css, [':root'], `--${name}`))
  return `rgb(${r}, ${g}, ${b})`
}

/** The `<h1>` of a page, straight out of the committed markup. */
const headingMarkup = (html) => html.match(/<h1\b[\s\S]*?<\/h1>/)?.[0] ?? null

/** Markup with its HTML comments taken out, so a note about a class is not an occurrence of it. */
const withoutComments = (markup) => markup.replace(/<!--[\s\S]*?-->/g, '')

/** The class the home page paints `HERO_ACCENT` with, read off the page itself. */
const homeAccentClass = async () =>
  (await read(HOMEPAGE)).match(new RegExp(`<span class="([^"]*)">${HERO_ACCENT}</span>`))?.[1] ?? null

/** A headline, the span inside it, and the box the browser draws for each. */
const HEADLINE = (selector) => `
  const heading = document.querySelector(${JSON.stringify(selector)})
  if (!heading) return null
  const accent = heading.querySelector('span')
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, right: r.right, bottom: r.bottom, left: r.left, width: r.width, height: r.height }
  }
  const style = getComputedStyle(heading)
  return {
    tag: heading.tagName.toLowerCase(),
    classes: [...heading.classList],
    text: heading.textContent.replace(/\\s+/g, ' ').trim(),
    color: style.color,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    rect: box(heading),
    spans: heading.querySelectorAll('span').length,
    nodes: [...heading.childNodes].map((node) => ({
      element: node.nodeType === 1,
      name: node.nodeName.toLowerCase(),
      text: node.textContent,
      classes: node.nodeType === 1 ? [...node.classList] : [],
    })),
    accent: accent && {
      tag: accent.tagName.toLowerCase(),
      classes: [...accent.classList],
      inline: accent.getAttribute('style'),
      text: accent.textContent,
      color: getComputedStyle(accent).color,
      fontSize: getComputedStyle(accent).fontSize,
      fontWeight: getComputedStyle(accent).fontWeight,
      rect: box(accent),
    },
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewport: window.innerWidth,
  }
`

/**
 * The Case Studies title as it ships, and the same title with the span taken
 * back out in the live document — the pre-change baseline, measured rather than
 * remembered.
 */
const LAYOUT = `
  const heading = document.querySelector('.case-studies__heading')
  const grid = document.querySelector('.case-studies .services__grid')
  const lines = () => {
    const range = document.createRange()
    range.selectNodeContents(heading)
    return [...new Set([...range.getClientRects()].map((r) => Math.round(r.top)))].length
  }
  const measure = () => {
    const style = getComputedStyle(heading)
    const rect = heading.getBoundingClientRect()
    return {
      text: heading.textContent.replace(/\\s+/g, ' ').trim(),
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      lines: lines(),
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      margin: [style.marginTop, style.marginBottom],
      padding: [style.paddingTop, style.paddingBottom],
      grid: Math.round(grid.getBoundingClientRect().top),
      page: document.documentElement.scrollHeight,
    }
  }
  const shipped = measure()
  heading.textContent = ${JSON.stringify(CASE_STUDIES_HEADING)}
  void heading.getBoundingClientRect()
  return { shipped, before: measure() }
`

describe('Case studies title task 1: the home page\'s papaya, identified and written down', () => {
  const home = servedInBrowser(HOMEPAGE)

  it('finds it in one reusable class on the home page headline, with no inline style beside it', async () => {
    const headline = await home.page.evaluate(HEADLINE('.hero__heading'))

    assert.ok(headline?.accent, 'the home page headline has no accent span')
    assert.equal(headline.accent.text, HERO_ACCENT)
    assert.equal(headline.accent.classes.length, 1, `"${HERO_ACCENT}" carries ${headline.accent.classes.join(', ')}`)
    assert.equal(headline.accent.inline, null, `"${HERO_ACCENT}" is painted by an inline style as well as a class`)
    assert.equal(await homeAccentClass(), HERO_ACCENT_CLASS, 'the class the tests reuse is not the one on the page')
  })

  it('finds that class painted from the --papaya token rather than a shade of its own', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const rule = css.match(new RegExp(`\\.${HERO_ACCENT_CLASS}\\s*\\{([^}]*)\\}`))?.[1] ?? null

    assert.ok(rule, `${SERVICES_STYLESHEET} declares no .${HERO_ACCENT_CLASS} rule`)
    assert.match(rule, /color:\s*var\(--papaya\)/, `.${HERO_ACCENT_CLASS} hardcodes a shade`)
    assert.deepEqual(
      rule.split(';').map((decl) => decl.trim()).filter(Boolean),
      ['color: var(--papaya)'],
      `.${HERO_ACCENT_CLASS} declares more than the colour`,
    )
    assert.equal(declaredValue(css, [`.${HERO_ACCENT_CLASS}`], 'color'), '#e56717')
  })

  it('writes the mechanism down, by class, token and file', async () => {
    const mechanism = await notesSection('The mechanism')

    assert.ok(mechanism, `${CASE_STUDIES_ACCENT_NOTES} has no "The mechanism" section`)
    for (const naming of [HERO_ACCENT_CLASS, '--papaya', HOMEPAGE, SERVICES_STYLESHEET, HERO_ACCENT]) {
      assert.ok(mechanism.includes(naming), `the notes never name ${naming}`)
    }
  })
})

describe('Case studies title task 2: the title, static and splittable in two', () => {
  it('sets it once, in a single hardcoded <h1>, with no template or CMS hole in it', async () => {
    const html = await read(CASE_STUDIES_PAGE)
    const before = headingMarkup(beforeCaseStudiesAccent(html))

    assert.ok(before, `${CASE_STUDIES_PAGE} has no <h1>`)
    assert.equal(textOf(before), CASE_STUDIES_HEADING, `the title reads "${textOf(before)}"`)
    assert.equal(html.match(/<h1\b/g).length, 1, `${CASE_STUDIES_PAGE} carries more than one <h1>`)
    for (const hole of ['{{', '${', '{%', '<?', 'data-', 'innerHTML']) {
      assert.ok(!before.includes(hole), `the title is filled in by "${hole}" rather than written out`)
    }
    assert.ok(!html.includes('<script'), `${CASE_STUDIES_PAGE} runs script, which could rewrite its title`)
  })

  it('splits cleanly into "CASE" and "STUDIES", the second word appearing once', async () => {
    const before = textOf(headingMarkup(beforeCaseStudiesAccent(await read(CASE_STUDIES_PAGE))))

    assert.deepEqual(before.split(' '), [CASE_STUDIES_PLAIN, CASE_STUDIES_ACCENT])
    assert.equal(before.split(CASE_STUDIES_ACCENT).length - 1, 1, `"${CASE_STUDIES_ACCENT}" appears twice in the title`)
    assert.ok(before.endsWith(` ${CASE_STUDIES_ACCENT}`), `"${CASE_STUDIES_ACCENT}" is not the last word of the title`)
  })

  it('writes down that it is static, and that the wrapping breaks nothing dynamic', async () => {
    const title = await notesSection('The title')

    assert.ok(title, `${CASE_STUDIES_ACCENT_NOTES} has no "The title" section`)
    assert.match(title, /static|hardcoded/i, 'the notes do not say the title is static')
    assert.ok(title.includes(CASE_STUDIES_PAGE), `the notes never name ${CASE_STUDIES_PAGE}`)
  })
})

describe('Case studies title task 3: "STUDIES" in the home page\'s own span', () => {
  const site = servedInBrowser()

  it('wraps it in the class the home page paints "REALLY WELL" with, class for class', async () => {
    const home = await homeAccentClass()
    const title = await site.page.evaluate(HEADLINE('.case-studies__heading'))

    assert.ok(title?.accent, 'the Case Studies title has no accent span')
    assert.equal(title.accent.tag, 'span', `"${CASE_STUDIES_ACCENT}" is a <${title.accent.tag}>`)
    assert.deepEqual(title.accent.classes, home.split(' '), `it is a ${title.accent.classes} rather than a ${home}`)
    assert.equal(title.accent.inline, null, 'the span carries an inline style rather than reusing the class')
    assert.equal(title.accent.text, CASE_STUDIES_ACCENT)
  })

  it('paints it the papaya the home page accent takes, and leaves "CASE" in the ink', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const title = await site.page.evaluate(HEADLINE('.case-studies__heading'))
    const plain = title.nodes.filter((node) => !node.element).map((node) => node.text.trim()).join(' ').trim()

    assert.equal(title.accent.color, shade(css, 'papaya'))
    assert.equal(title.color, shade(css, 'deep'), `"${CASE_STUDIES_PLAIN}" is not the ink the rest of the headings take`)
    assert.equal(plain, CASE_STUDIES_PLAIN, `the text outside the span is "${plain}"`)
    assert.equal(title.spans, 1, `the title carries ${title.spans} spans`)
    assert.equal(title.text, CASE_STUDIES_HEADING, `the title now reads "${title.text}"`)
  })

  it('is the whole of the change: one span, and no rule of its own in the stylesheet', async () => {
    const html = await read(CASE_STUDIES_PAGE)
    const css = await read(SERVICES_STYLESHEET)
    const rewound = beforeCaseStudiesAccent(html)
    const bare = withoutComments(rewound)

    assert.notEqual(rewound, html, `${CASE_STUDIES_PAGE} never had "${CASE_STUDIES_ACCENT}" wrapped`)
    assert.ok(!bare.includes(HERO_ACCENT_CLASS), `${CASE_STUDIES_PAGE} uses .${HERO_ACCENT_CLASS} somewhere else too`)
    assert.ok(!bare.includes('<span'), `${CASE_STUDIES_PAGE} still carries a span this job did not put there`)
    assert.equal(
      declaredValue(css, ['.case-studies__heading', '.case-studies__heading span'], 'color'),
      null,
      'the stylesheet gained a title colour of its own rather than reusing the class',
    )
    assert.equal(css.split(`.${HERO_ACCENT_CLASS}`).length - 1, 1, `.${HERO_ACCENT_CLASS} is declared more than once`)
  })
})

describe('Case studies title task 4: the home page headline, untouched', () => {
  const home = servedInBrowser(HOMEPAGE)

  it('leaves its markup exactly as it stood', async () => {
    const html = await read(HOMEPAGE)

    assert.ok(
      html.includes(
        '<h1 class="hero__heading">WHAT WE DO. AND WE DO IT <span class="hero__papaya">REALLY WELL</span>.</h1>',
      ),
      `the home page headline has changed:\n${headingMarkup(html)}`,
    )
  })

  it('leaves "REALLY WELL" painted exactly as it was', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const headline = await home.page.evaluate(HEADLINE('.hero__heading'))

    assert.deepEqual(headline.classes, ['hero__heading'])
    assert.deepEqual(headline.accent.classes, [HERO_ACCENT_CLASS])
    assert.equal(headline.accent.text, HERO_ACCENT)
    assert.equal(headline.accent.color, shade(css, 'papaya'))
    assert.equal(headline.color, shade(css, 'deep'))
    assert.equal(headline.accent.fontSize, headline.fontSize, 'the accent no longer takes the headline\'s size')
    assert.equal(headline.accent.fontWeight, headline.fontWeight, 'the accent no longer takes the headline\'s weight')
    assert.equal(headline.spans, 1, `the headline carries ${headline.spans} spans`)
  })
})

describe('Case studies title task 5: the same box the plain title drew', () => {
  const site = servedInBrowser()

  for (const width of BREAKPOINTS) {
    it(`draws the title and everything under it where the plain title did, at ${width}px`, async () => {
      await freshLoad(site, width)
      const { shipped, before } = await site.page.evaluate(LAYOUT)

      assert.equal(shipped.text, before.text, 'the span changed the words of the title')
      assert.deepEqual(
        [shipped.top, shipped.left, shipped.width, shipped.height, shipped.lines],
        [before.top, before.left, before.width, before.height, before.lines],
        `the title's box moved at ${width}px`,
      )
      assert.equal(shipped.lineHeight, before.lineHeight, `the title's line height changed at ${width}px`)
      assert.equal(shipped.fontSize, before.fontSize, `the title's size changed at ${width}px`)
      assert.equal(shipped.fontWeight, before.fontWeight, `the title's weight changed at ${width}px`)
      assert.equal(shipped.letterSpacing, before.letterSpacing, `the title's tracking changed at ${width}px`)
      assert.deepEqual(shipped.margin, before.margin, `the title's margins changed at ${width}px`)
      assert.deepEqual(shipped.padding, before.padding, `the title's padding changed at ${width}px`)
      assert.equal(shipped.grid, before.grid, `the boxes below the title moved at ${width}px`)
      assert.equal(shipped.page, before.page, `the page got taller at ${width}px`)
    })
  }
})

describe('Case studies title task 6: the same papaya at every width the home page holds', () => {
  const site = servedInBrowser()
  const home = servedInBrowser(HOMEPAGE)

  it('declares the class once, outside every media query, so no width can change it', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.equal(css.split(`.${HERO_ACCENT_CLASS} {`).length - 1, 1, `.${HERO_ACCENT_CLASS} is declared at two widths`)
    assert.ok(
      css.indexOf(`.${HERO_ACCENT_CLASS} {`) < css.indexOf('@media'),
      `.${HERO_ACCENT_CLASS} sits inside a media query`,
    )
  })

  for (const width of BREAKPOINTS) {
    it(`paints "STUDIES" the papaya "REALLY WELL" takes at ${width}px, inside the title and on screen`, async () => {
      await freshLoad(site, width)
      await freshLoad(home, width)
      const title = await site.page.evaluate(HEADLINE('.case-studies__heading'))
      const headline = await home.page.evaluate(HEADLINE('.hero__heading'))

      assert.equal(title.accent.color, headline.accent.color, `the two accents differ at ${width}px`)
      assert.deepEqual(title.accent.classes, headline.accent.classes, `the two accents differ in class at ${width}px`)
      assert.equal(title.accent.fontSize, title.fontSize, `"${CASE_STUDIES_ACCENT}" is set apart in size at ${width}px`)
      assert.equal(title.accent.fontWeight, title.fontWeight, `"${CASE_STUDIES_ACCENT}" is set apart in weight at ${width}px`)
      assert.equal(title.text, CASE_STUDIES_HEADING, `the title reads "${title.text}" at ${width}px`)
      assert.ok(title.accent.rect.left >= title.rect.left - 0.5, `the accent starts left of the title at ${width}px`)
      assert.ok(title.accent.rect.right <= title.rect.right + 0.5, `the accent runs past the title at ${width}px`)
      assert.ok(title.accent.rect.right <= title.viewport + 0.5, `the accent is clipped at ${width}px`)
      assert.equal(title.overflow, 0, `the page overflows by ${title.overflow}px at ${width}px`)
    })
  }

  it('writes down why no breakpoint work was needed', async () => {
    const layout = await notesSection('Layout and breakpoints')

    assert.ok(layout, `${CASE_STUDIES_ACCENT_NOTES} has no "Layout and breakpoints" section`)
    assert.match(layout, /@media/, 'the notes do not say where the rule sits against the media queries')
    assert.match(layout, /inline|span/i, 'the notes do not say why the span leaves the box alone')
  })
})
