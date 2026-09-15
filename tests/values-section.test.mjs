// Tests for the "VALUES" section and the "Values" nav tab that now reaches it.
// Plan: specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { openPage, serveStatic } from './browser.mjs'
import {
  BOXES,
  CONTACT_PAGE,
  beforeContactPage,
  BOX_BORDERS,
  HOMEPAGE,
  ORIGIN_ANCHOR,
  SERVICES_STYLESHEET,
  VALUES_ANCHOR,
  VALUES_BOXES,
  VALUES_HEADING,
  VALUES_NOTES,
  VALUES_PLAN,
  declaredValue,
  parseHex,
  read,
  repoRoot,
  rules,
} from './site.mjs'

/** The section of the notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(VALUES_NOTES)
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

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

/**
 * A pristine load of the home page at the given width. The URL carries a fresh
 * query each time on purpose: once a click has put `#values` in the address, a
 * plain re-navigation to the same path would be a same-document one, which
 * fires no load event for the driver to wait on.
 */
let loads = 0
const freshLoad = async (site, width = 1280, height = 800) => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}`)
}

/** Clicks a nav link and reports where the viewport ended up against the band it should have reached. */
const clickTo = (label) => `
  const link = [...document.querySelectorAll('.masthead__links a')]
    .find((a) => a.textContent.trim() === ${JSON.stringify(label)})
  const before = window.scrollY
  link.click()
  const section = document.querySelector(link.getAttribute('href'))
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

describe('Values task 1: what the source actually says, confirmed and written down', () => {
  it('names the files every answer was read out of', async () => {
    const discovery = await notesSection('Discovery')

    assert.ok(discovery, `${VALUES_NOTES} has no "Discovery" section`)
    for (const file of [HOMEPAGE, SERVICES_STYLESHEET]) {
      assert.ok(discovery.includes(file), `the discovery notes do not name ${file}`)
    }
  })

  it('quotes the "Values" tab\'s href as it stood, and the convention the other anchors follow', async () => {
    const discovery = await notesSection('Discovery')

    assert.match(discovery, /href="#"/, 'the notes do not record what the "Values" nav link pointed at before')
    assert.match(discovery, /#services/, 'the notes do not record the services anchor')
    assert.match(discovery, /#about/, 'the notes do not record the origin anchor')
    assert.match(discovery, /aria-labelledby/, 'the notes do not record the labelling pattern sections follow')
    assert.match(discovery, /`\.section__heading`/, 'the notes do not name the heading class to reuse')
  })

  it('names the box component, class by class, and the grid it is rotated by', async () => {
    const discovery = await notesSection('Discovery')

    for (const selector of ['`.services__grid`', '`.card`', '`.card__title`', '`.card__copy`']) {
      assert.ok(discovery.includes(selector), `the discovery notes do not name ${selector}`)
    }
  })

  it('settles the colour rotation: what it is keyed on, and whether it stops at three', async () => {
    const rotation = await notesSection('Colour rotation')

    assert.ok(rotation, `${VALUES_NOTES} has no "Colour rotation" section`)
    assert.match(rotation, /nth-child\(6n \+ 1\)/, 'the notes do not quote the selector the rotation is keyed on')
    for (const shade of ['papaya', 'lime', 'black']) {
      assert.ok(rotation.includes(shade), `the notes do not name the ${shade} in the sequence`)
    }
    assert.match(
      rotation,
      /not (hard-?coded|fixed) (to|at) three|no fixed count of three|does not hard-?code/i,
      'the notes do not settle whether the rotation hard-codes a count of three',
    )
  })

  it('flags the nav mismatch the spec said to flag rather than pass over', async () => {
    const mismatch = await notesSection('Nav mismatch')

    assert.ok(mismatch, `${VALUES_NOTES} has no "Nav mismatch" section`)
    assert.match(mismatch, /href="#"/, 'the notes do not say what the "Values" tab pointed at')
    assert.match(mismatch, new RegExp(`#${VALUES_ANCHOR}`), 'the notes do not say what it is being pointed at instead')
    assert.match(mismatch, /About/, 'the notes do not cite the precedent the same one-attribute change already set')
  })
})

describe('Values task 2: the band itself, directly after "WHERE WE\'VE COME FROM"', () => {
  const site = servedInBrowser()

  const ORDER = `
    const sections = [...document.querySelectorAll('main > section')]
    const values = document.querySelector('#${VALUES_ANCHOR}')
    return {
      ids: sections.map((el) => el.id),
      previousId: values.previousElementSibling?.id ?? null,
      nextId: values.nextElementSibling?.id ?? null,
      top: Math.round(values.getBoundingClientRect().top),
      originBottom: Math.round(document.querySelector('#${ORIGIN_ANCHOR}').getBoundingClientRect().bottom),
      contactTop: Math.round(document.querySelector('#contact').getBoundingClientRect().top),
    }
  `

  it('sits between the origin band and the invitation, and reorders nothing else', async () => {
    const order = await site.page.evaluate(ORDER)

    assert.equal(order.previousId, ORIGIN_ANCHOR, `the new band follows "#${order.previousId}"`)
    assert.equal(order.nextId, 'contact', `the new band is followed by "#${order.nextId}"`)
    assert.deepEqual(order.ids, ['', 'services', ORIGIN_ANCHOR, VALUES_ANCHOR, 'contact'])
  })

  it('renders between the two, not overlapping either', async () => {
    const order = await site.page.evaluate(ORDER)

    assert.ok(order.top >= order.originBottom, 'the new band renders over the origin band')
    assert.ok(order.top < order.contactTop, 'the new band renders below the invitation band')
  })

  it('wraps itself the way every other band on the page is wrapped', async () => {
    const shape = await site.page.evaluate(`
      const section = document.querySelector('#${VALUES_ANCHOR}')
      const heading = section.querySelector('.section__heading')
      return {
        tag: section.tagName.toLowerCase(),
        inMain: !!section.closest('main'),
        children: [...section.children].map((el) => el.tagName.toLowerCase() + '.' + [...el.classList].join('.')),
        headingParent: [...heading.parentElement.classList],
        labelledBy: section.getAttribute('aria-labelledby'),
        headingId: heading.id,
      }
    `)

    assert.equal(shape.tag, 'section')
    assert.equal(shape.inMain, true, 'the new band sits outside <main>')
    assert.deepEqual(shape.children, ['div.container'], 'the band does not wrap its content in one .container')
    assert.deepEqual(shape.headingParent, ['container'])
    assert.equal(shape.labelledBy, shape.headingId, 'the band is not labelled by its own heading')
    assert.equal(shape.headingId, `${VALUES_ANCHOR}-heading`)
  })

  it('sets its heading in the same element and classes as the two bands above it', async () => {
    const headings = await site.page.evaluate(`
      const of = (el) => el && {
        tag: el.tagName.toLowerCase(),
        classes: [...el.classList],
        text: el.textContent.replace(/\\s+/g, ' ').trim(),
      }
      const at = (selector) => of(document.querySelector(selector + ' .section__heading'))
      return { offer: at('#services'), origin: at('#${ORIGIN_ANCHOR}'), values: at('#${VALUES_ANCHOR}') }
    `)

    assert.ok(headings.values, `the new band carries no .section__heading`)
    assert.equal(headings.values.text, VALUES_HEADING)
    assert.equal(headings.values.tag, headings.offer.tag, 'the heading is set in a different element')
    assert.deepEqual(headings.values.classes, headings.offer.classes)
    assert.deepEqual(headings.values.classes, headings.origin.classes)
  })

  it('renders that heading at exactly the size, weight, tracking and colour the others render at', async () => {
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
      return { offer: of('#services .section__heading'), values: of('#${VALUES_ANCHOR} .section__heading') }
    `)

    assert.deepEqual(styles.values, styles.offer)
  })

  it('gives it an id nothing else on the page already answers to', async () => {
    const ids = await site.page.evaluate(`return [...document.querySelectorAll('[id]')].map((el) => el.id)`)

    assert.ok(ids.includes(VALUES_ANCHOR), `no element on the page carries id="${VALUES_ANCHOR}"`)
    assert.equal(new Set(ids).size, ids.length, `the page declares a duplicate id: ${ids.join(', ')}`)
  })

  it('points the "Values" tab at it, by the same mechanism every live tab uses', async () => {
    const nav = await site.page.evaluate(`
      const of = (label) => {
        const link = [...document.querySelectorAll('.masthead__links a')]
          .find((a) => a.textContent.trim() === label)
        const href = link.getAttribute('href')
        return { href, attributes: link.getAttributeNames(), target: href.length > 1 ? document.querySelector(href)?.id ?? null : null }
      }
      return { values: of('Values'), services: of('Services'), about: of('About') }
    `)

    assert.equal(nav.values.href, `#${VALUES_ANCHOR}`, `"Values" points at ${nav.values.href}`)
    assert.equal(nav.values.target, VALUES_ANCHOR, '"Values" points at no section on the page')
    assert.deepEqual(nav.values.attributes, nav.services.attributes)
    assert.deepEqual(nav.values.attributes, nav.about.attributes)
  })

  it('brings the band to the top of the viewport when clicked, as the other tabs do', async () => {
    await freshLoad(site)
    const values = await site.page.evaluate(clickTo('Values'))

    assert.equal(values.id, VALUES_ANCHOR, `clicking "Values" reached #${values.id}`)
    assert.equal(values.hash, `#${VALUES_ANCHOR}`)
    assert.ok(values.after > values.before, `clicking "Values" moved the page ${values.after - values.before}px`)
    assert.equal(values.top, 0, `the band landed ${values.top}px from the top of the viewport`)
  })

  it('needs no script to do it, and no smooth scroll the other bands do not have', async () => {
    const html = await read(HOMEPAGE)
    const css = await read(SERVICES_STYLESHEET)

    assert.ok(!html.includes('<script'), `${HOMEPAGE} carries a <script>`)
    assert.doesNotMatch(html, /\son[a-z]+="/i, `${HOMEPAGE} carries an inline event handler`)
    assert.doesNotMatch(css, /scroll-behavior/, `${SERVICES_STYLESHEET} now smooths the page's anchor jumps`)
  })
})

/** Every box in a band, with the classes it carries and the box the browser draws for it. */
const boxesIn = (anchor) => `
  const grid = document.querySelector('#${anchor} .services__grid')
  return {
    gridTag: grid.tagName.toLowerCase(),
    gridClasses: [...grid.classList],
    boxes: [...grid.children].map((card) => {
      const style = getComputedStyle(card)
      const title = card.querySelector('.card__title')
      const titleStyle = title && getComputedStyle(title)
      return {
        tag: card.tagName.toLowerCase(),
        classes: [...card.classList],
        titleTag: title?.tagName.toLowerCase() ?? null,
        titleClasses: title ? [...title.classList] : null,
        border: [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor],
        width: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
        style: [style.borderTopStyle, style.borderRightStyle, style.borderBottomStyle, style.borderLeftStyle],
        radius: style.borderTopLeftRadius,
        padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
        background: style.backgroundColor,
        shadow: style.boxShadow,
        display: style.display + ' ' + style.flexDirection,
        gap: style.rowGap,
        titleFont: titleStyle && [titleStyle.fontFamily, titleStyle.fontSize, titleStyle.fontWeight, titleStyle.letterSpacing, titleStyle.color].join(' | '),
      }
    }),
  }
`

describe('Values task 3: six boxes, on the services band\'s own component', () => {
  const site = servedInBrowser()

  it('lays them out in the same grid element and classes "WHAT WE OFFER" uses', async () => {
    const values = await site.page.evaluate(boxesIn(VALUES_ANCHOR))
    const offer = await site.page.evaluate(boxesIn('services'))

    assert.equal(values.gridTag, offer.gridTag)
    assert.deepEqual(values.gridClasses, offer.gridClasses)
    assert.deepEqual(values.gridClasses, ['services__grid'])
  })

  it('renders exactly six of them, each one a plain .card', async () => {
    const { boxes } = await site.page.evaluate(boxesIn(VALUES_ANCHOR))

    assert.equal(boxes.length, 6, `the band renders ${boxes.length} boxes`)
    for (const box of boxes) {
      assert.equal(box.tag, 'li')
      assert.deepEqual(box.classes, ['card'])
      assert.equal(box.titleTag, 'h3', `a box titles itself with a <${box.titleTag}>`)
      assert.deepEqual(box.titleClasses, ['card__title'])
    }
  })

  it('draws each box exactly as the box at the same position in "WHAT WE OFFER"', async () => {
    const values = await site.page.evaluate(boxesIn(VALUES_ANCHOR))
    const offer = await site.page.evaluate(boxesIn('services'))
    const drawn = ({ border, width, style, radius, padding, background, shadow, display, gap, titleFont }) =>
      ({ border, width, style, radius, padding, background, shadow, display, gap, titleFont })

    assert.equal(offer.boxes.length, 6, 'the services band no longer has six boxes to compare against')
    for (const [index, box] of values.boxes.entries()) {
      assert.deepEqual(drawn(box), drawn(offer.boxes[index]), `values box ${index + 1} is drawn differently`)
    }
  })

  it('carries the rotation through all six — papaya, lime, black, black, papaya, lime', async () => {
    const { boxes } = await site.page.evaluate(boxesIn(VALUES_ANCHOR))
    const css = await read(SERVICES_STYLESHEET)
    const shade = (name) => {
      const { r, g, b } = parseHex(declaredValue(css, [':root'], `--${name}`))
      return `rgb(${r}, ${g}, ${b})`
    }
    const fallback = shade('line')

    assert.deepEqual(BOX_BORDERS, ['papaya', 'lime', 'black', 'black', 'papaya', 'lime'])
    for (const [index, box] of boxes.entries()) {
      const expected = shade(BOX_BORDERS[index])
      assert.deepEqual(box.border, Array(4).fill(expected), `values box ${index + 1} is not ${BOX_BORDERS[index]}`)
      assert.notEqual(box.border[0], fallback, `values box ${index + 1} fell through to the default border`)
    }
  })

  it('takes that rotation from the rules already in the stylesheet, not new ones', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const rotation = rules(css).filter((rule) =>
      rule.selectors.some((selector) => /^\.services__grid > \.card:nth-child/.test(selector)))

    assert.ok(rotation.length > 0, 'the rotation rules are gone')
    for (const rule of rotation) {
      for (const selector of rule.selectors) {
        assert.match(selector, /nth-child\(6n(\s*\+\s*[1-5])?\)/, `${selector} is not keyed on the six-step cycle`)
      }
    }
    // Nothing in the band's own rule paints, sizes or spaces a box: the component does.
    const values = rules(css).filter((rule) => rule.selectors.some((selector) => selector.startsWith('.values')))
    assert.equal(values.length, 1, `${SERVICES_STYLESHEET} declares ${values.length} rules for the new band`)
    assert.deepEqual(Object.keys(values[0].declarations), ['padding'])
    assert.doesNotMatch(JSON.stringify(values[0].declarations), /#[0-9a-f]{3,8}/i, 'the band hardcodes a shade')
  })
})

/**
 * The copy as the request supplied it, read back out of the commit that added
 * the plan — the one place in the repository the verbatim text is recorded.
 * `null` when this checkout has no history to read, as on an exported tree.
 */
const supplied = () => {
  const log = (...args) => spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' })
  const added = log('log', '--diff-filter=A', '--format=%H', '--', VALUES_PLAN)
  if (added.status !== 0 || !added.stdout.trim()) return null
  const message = log('log', '-1', '--format=%B', added.stdout.trim().split('\n').at(-1)).stdout

  return {
    heading: message.match(/^Section heading: (.*)$/m)?.[1] ?? null,
    boxes: Array.from({ length: 6 }, (_, i) => ({
      title: message.match(new RegExp(`^Box ${i + 1} heading: (.*)$`, 'm'))?.[1] ?? null,
      lines: message.match(new RegExp(`^Box ${i + 1} body:\\n"([\\s\\S]*?)"\\n\\n`, 'm'))?.[1].split('\n') ?? null,
    })),
  }
}

/** A box's body flattened back to the line sequence the request wrote it as. */
const lines = (body) => body.flat()

describe('Values task 4: the six values, word for word', () => {
  const site = servedInBrowser()

  const COPY = `
    return [...document.querySelectorAll('#${VALUES_ANCHOR} .services__grid > .card')].map((card) => ({
      title: card.querySelector('.card__title').textContent.replace(/\\s+/g, ' ').trim(),
      lines: [...card.querySelectorAll('.card__copy')].map((el) => el.textContent.replace(/\\s+/g, ' ').trim()),
      bullets: [...card.querySelectorAll('ul > li')].map((el) => el.textContent.replace(/\\s+/g, ' ').trim()),
      lists: card.querySelectorAll('ul').length,
      blocks: [...card.children].map((el) => el.tagName.toLowerCase()),
    }))
  `

  // The constants the assertions below run on are only trustworthy if they are
  // the request's own words, so they are checked back against the request.
  it('takes its copy from the request unaltered — no rewording, no hyphen tidied', async () => {
    const request = supplied()

    if (request === null) return // No history in this checkout to read the request out of.
    assert.equal(request.heading, VALUES_HEADING)
    assert.deepEqual(
      VALUES_BOXES.map((box) => ({ title: box.title, lines: lines(box.body) })),
      request.boxes,
    )
    assert.match(VALUES_BOXES[0].body[0], / - we change it/, 'the supplied hyphen was turned into a dash')
    assert.match(VALUES_BOXES[2].title, /^SMALL TEAMS, BIG OWNERSHIP$/, "box 3's comma was dropped")
    assert.match(VALUES_BOXES[1].body[0], /an "aspiration\." It's/, "box 2's quoted full stop was moved out")
  })

  it('renders the six headings in the order the request listed them', async () => {
    const boxes = await site.page.evaluate(COPY)

    assert.deepEqual(boxes.map((box) => box.title), VALUES_BOXES.map((box) => box.title))
  })

  it('reproduces every line of every body character for character', async () => {
    const boxes = await site.page.evaluate(COPY)

    assert.deepEqual(boxes.map((box) => box.lines), VALUES_BOXES.map((box) => lines(box.body)))
  })

  it('keeps the line breaks as breaks rather than running the copy together', async () => {
    const boxes = await site.page.evaluate(COPY)

    for (const [index, box] of boxes.entries()) {
      assert.equal(
        box.lines.length,
        lines(VALUES_BOXES[index].body).length,
        `box ${index + 1} renders ${box.lines.length} lines, not ${lines(VALUES_BOXES[index].body).length}`,
      )
    }
  })

  it('sets box 4\'s three bullets as a list, and gives no other box one', async () => {
    const boxes = await site.page.evaluate(COPY)
    const [, , , growth] = boxes

    assert.deepEqual(growth.bullets, VALUES_BOXES[3].body[1])
    assert.deepEqual(growth.blocks, ['h3', 'p', 'ul', 'p'], 'the bullets do not sit between the two paragraphs')
    for (const [index, box] of boxes.entries()) {
      if (index === 3) continue
      assert.equal(box.lists, 0, `box ${index + 1} carries a list the request did not ask for`)
    }
  })

  it('adds no tag row, no icon and no image the "WHAT WE OFFER" boxes do not have', async () => {
    const extras = await site.page.evaluate(`
      const section = document.querySelector('#${VALUES_ANCHOR}')
      return {
        tags: section.querySelectorAll('.tag, .card__tags').length,
        media: section.querySelectorAll('img, svg, picture, video').length,
        classes: [...new Set([...section.querySelectorAll('*')].flatMap((el) => [...el.classList]))].sort(),
      }
    `)

    assert.equal(extras.tags, 0, 'the values boxes carry a tag row')
    assert.equal(extras.media, 0, 'the values band carries an image or icon')
    assert.deepEqual(extras.classes, ['card', 'card__copy', 'card__title', 'container', 'section__heading', 'services__grid'])
  })
})

/** A file as it stood in the commit that added the plan — this change's starting point. */
const baseline = (file) => {
  const git = (...args) => spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' })
  const added = git('log', '--diff-filter=A', '--format=%H', '--', VALUES_PLAN)
  if (added.status !== 0 || !added.stdout.trim()) return null
  const show = git('show', `${added.stdout.trim().split('\n').at(-1)}:${file}`)
  return show.status === 0 ? show.stdout : null
}

/**
 * The stylesheet without the contact page's block and the one shade it declares
 * — both added by specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/plan.md, and held
 * to their own checks in tests/contact-page.test.mjs.
 */
const withoutContactStyles = (css) =>
  css
    .replace(/\n\n {2}\/\* The one shade the contact form spends[\s\S]*?--error: [^;]+;/, '')
    .replace(/\/\* Contact page -+ \*\/\n[\s\S]*?\n(?=\/\* Footer)/, '')

/** The `<section class="…">…</section>` block with the given class, indentation and all. */
const sectionOf = (html, className) =>
  html.match(new RegExp(`<section class="${className}"[\\s\\S]*?\\n {6}</section>`))?.[0] ?? null

describe('Values task 5: the two bands above it, untouched', () => {
  const site = servedInBrowser()

  it('leaves "WHAT WE OFFER" and "WHERE WE\'VE COME FROM" byte for byte as they were', async () => {
    const was = baseline(HOMEPAGE)
    const now = await read(HOMEPAGE)

    if (was === null) return // No history in this checkout to diff against.
    for (const band of ['services', 'origin']) {
      assert.ok(sectionOf(now, band), `${HOMEPAGE} no longer holds the ${band} band`)
      assert.equal(sectionOf(now, band), sectionOf(was, band), `the ${band} band changed`)
    }
  })

  it('changes nothing else in the page either: one new band, one repointed href', async () => {
    const was = baseline(HOMEPAGE)
    const now = await read(HOMEPAGE)

    if (was === null) return
    // The three contact destinations are rewound alongside the values band, the
    // way tests/origin-image.test.mjs rewinds them: they belong to
    // specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/plan.md, not to this one.
    const withoutValues = beforeContactPage(now)
      .replace(/\n {6}<!-- The "Values" nav entry's target\.[\s\S]*?\n {6}<\/section>/, '')
      .replace('<li><a href="#values">Values</a></li>', '<li><a href="#">Values</a></li>')
    assert.equal(withoutValues, was, `${HOMEPAGE} carries a change beyond the new band and the "Values" href`)
  })

  it('adds one rule to the stylesheet and edits none of the ones already there', async () => {
    const was = baseline(SERVICES_STYLESHEET)
    const now = await read(SERVICES_STYLESHEET)

    if (was === null) return
    const withoutValues = withoutContactStyles(now).replace(
      /\/\* Values -+ \*\/\n[\s\S]*?\.values \{\n {2}padding: [^;]+;\n\}\n\n/,
      '',
    )
    assert.equal(withoutValues, was, `${SERVICES_STYLESHEET} carries a change beyond the new band's padding`)
  })

  it('still renders the six services boxes, in order, in their own shades', async () => {
    const { boxes } = await site.page.evaluate(boxesIn('services'))
    const css = await read(SERVICES_STYLESHEET)
    const titles = await site.page.evaluate(`
      return [...document.querySelectorAll('#services .card__title')].map((el) => el.textContent.trim())
    `)

    assert.equal(boxes.length, 6, `the services band renders ${boxes.length} boxes`)
    assert.deepEqual(titles, BOXES.map((box) => box.title))
    for (const [index, box] of boxes.entries()) {
      const { r, g, b } = parseHex(declaredValue(css, [':root'], `--${BOX_BORDERS[index]}`))
      assert.deepEqual(box.border, Array(4).fill(`rgb(${r}, ${g}, ${b})`), `services box ${index + 1} changed shade`)
    }
  })

  it('leaves every other nav entry, and the footer, exactly where they were', async () => {
    const nav = await site.page.evaluate(`
      return {
        links: [...document.querySelectorAll('.masthead__links a')].map((a) => ({
          label: a.textContent.trim(),
          href: a.getAttribute('href'),
        })),
        footer: [...document.querySelectorAll('.footer a')].map((a) => a.getAttribute('href')),
      }
    `)

    assert.deepEqual(nav.links, [
      { label: 'About', href: `#${ORIGIN_ANCHOR}` },
      { label: 'Services', href: '#services' },
      { label: 'Values', href: `#${VALUES_ANCHOR}` },
      { label: 'Team', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      // Repointed at the Contact Us page by
      // specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/plan.md; the tab's wording
      // and position are unchanged, and tests/contact-page.test.mjs holds the
      // three contact entry points to one destination.
      { label: 'Contact', href: CONTACT_PAGE },
    ])
    for (const href of nav.footer) {
      assert.ok(href === '#' || href.startsWith('mailto:'), `a footer link now points at ${href}`)
    }
  })
})

describe('Values task 6: the band at every breakpoint "WHAT WE OFFER" supports', () => {
  const site = servedInBrowser()

  /** Both grids side by side, plus every values box and the text inside it. */
  const GRIDS = `
    const of = (anchor) => {
      const grid = document.querySelector('#' + anchor + ' .services__grid')
      const style = getComputedStyle(grid)
      return {
        columns: style.gridTemplateColumns.split(' ').length,
        gap: [style.rowGap, style.columnGap],
        boxes: [...grid.children].map((card) => {
          const rect = card.getBoundingClientRect()
          return {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            bottom: Math.round(rect.bottom),
            width: Math.round(rect.width),
            clipped: card.scrollHeight > Math.ceil(rect.height) + 1,
          }
        }),
      }
    }
    return {
      viewport: window.innerWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      offer: of('services'),
      values: of('${VALUES_ANCHOR}'),
      copy: [...document.querySelectorAll('#${VALUES_ANCHOR} .card__copy')].map((el) => {
        const rect = el.getBoundingClientRect()
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          clipped: el.scrollWidth > Math.ceil(rect.width) + 1 || el.scrollHeight > Math.ceil(rect.height) + 1,
          overflow: getComputedStyle(el).textOverflow + ' ' + getComputedStyle(el).overflow,
        }
      }),
    }
  `

  const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

  const at = async (width) => {
    await freshLoad(site, width, 900)
    return site.page.evaluate(GRIDS)
  }

  for (const width of [375, 768, 1024, 1200, 1440]) {
    it(`lays the six boxes out exactly as the services grid at ${width}px`, async () => {
      const layout = await at(width)

      assert.equal(layout.values.columns, layout.offer.columns, `the two grids differ in columns at ${width}px`)
      assert.deepEqual(layout.values.gap, layout.offer.gap, `the two grids differ in gap at ${width}px`)
      assert.deepEqual(
        layout.values.boxes.map((box) => box.width),
        layout.offer.boxes.map((box) => box.width),
        `the boxes differ in width from the services boxes at ${width}px`,
      )
    })

    it(`keeps the band inside the viewport and its text unclipped at ${width}px`, async () => {
      const layout = await at(width)

      assert.equal(layout.overflow, 0, `the page overflows by ${layout.overflow}px at ${width}px`)
      for (const [index, box] of layout.values.boxes.entries()) {
        assert.ok(box.left >= 0, `box ${index + 1} starts at ${box.left}px at ${width}px, off the left edge`)
        assert.ok(box.right <= layout.viewport, `box ${index + 1} runs to ${box.right}px past ${width}px`)
        assert.equal(box.clipped, false, `box ${index + 1} clips its own content at ${width}px`)
      }
      for (const [index, line] of layout.copy.entries()) {
        assert.ok(line.left >= 0 && line.right <= layout.viewport, `a line runs off the screen at ${width}px`)
        assert.equal(line.clipped, false, `line ${index + 1} is clipped at ${width}px`)
        assert.equal(line.overflow, 'clip visible', `line ${index + 1} is set to ${line.overflow} at ${width}px`)
      }
    })

    it(`lets the boxes differ in height without overlapping each other at ${width}px`, async () => {
      const layout = await at(width)

      for (const [index, box] of layout.values.boxes.entries()) {
        for (const other of layout.values.boxes.slice(index + 1)) {
          assert.equal(overlaps(box, other), false, `box ${index + 1} overlaps a neighbour at ${width}px`)
        }
      }
    })
  }

  it('grows box 4 to fit its longer copy rather than spilling it', async () => {
    const box = await at(1440)
    const growth = box.values.boxes[3]
    const shortest = Math.min(...box.values.boxes.map((b) => b.bottom - b.top))

    assert.ok(growth.bottom - growth.top >= shortest, 'box 4 is shorter than the shortest box on the row')
    assert.equal(growth.clipped, false, 'box 4 clips its bullet list')
  })

  it('renders the whole page cleanly, console and network included', async () => {
    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })
})
