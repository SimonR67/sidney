// Tests for the Team page and the one nav tab that now reaches it.
// Plan: specs/755b1c19-a364-4f06-bf29-a35998f8da76/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { openPage, parseColor, serveStatic } from './browser.mjs'
import {
  BREAKPOINTS,
  CASE_STUDIES_PAGE,
  CONTACT_PAGE,
  HOMEPAGE,
  SERVICES_STYLESHEET,
  TEAM_ACCENT,
  TEAM_ASSETS,
  TEAM_AVATAR_SIZE,
  TEAM_BORDERS,
  TEAM_HEADING,
  TEAM_IMAGES,
  TEAM_LEDE,
  TEAM_MEMBERS,
  TEAM_NOTES,
  TEAM_PAGE,
  TEAM_TITLE,
  beforeTeamPage,
  declaredValue,
  linksIn,
  navBlock,
  parseHex,
  read,
  repoRoot,
  teamCaption,
  titleOf,
} from './site.mjs'

/** The section of the notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(TEAM_NOTES)
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

/**
 * Serves the repo and opens one headless-Chrome page for the enclosing suite,
 * on the Team page unless another is named. `page`/`origin` are filled in by the
 * time the tests run.
 */
const servedInBrowser = (file = TEAM_PAGE) => {
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

/** The `<head>`, header, nav and footer of a page, each as its own chunk of markup. */
const shellOf = (html) => ({
  head: html.match(/<head>[\s\S]*?<\/head>/)?.[0] ?? null,
  header: html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? null,
  nav: navBlock(html),
  footer: html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? null,
  includes: [...html.matchAll(/<(?:link|script)\b[^>]*>/g)].map(([tag]) => tag),
})

/** The two bands of the page, and everything the browser draws in the second one. */
const BANDS = `
  const hero = document.querySelector('main .hero')
  const band = document.querySelector('main .team')
  const stack = band && band.querySelector('.team__stack')
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, right: r.right, bottom: r.bottom, left: r.left, width: r.width, height: r.height }
  }
  // A block element's own getClientRects() is one rect however many lines it
  // sets, so the line boxes are read off a range over its contents instead.
  const lineTops = (el) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    return [...new Set([...range.getClientRects()].map((r) => Math.round(r.top)))].sort((a, b) => a - b)
  }
  const frame = (el) => {
    const style = getComputedStyle(el)
    return {
      tag: el.tagName.toLowerCase(),
      classes: [...el.classList],
      radius: style.borderTopLeftRadius,
      widths: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
      border: [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor],
      display: style.display,
      rect: box(el),
    }
  }
  const image = (el) => Object.assign(frame(el), {
    src: el.getAttribute('src'),
    alt: el.getAttribute('alt'),
    width: el.getAttribute('width'),
    height: el.getAttribute('height'),
    natural: el.naturalWidth,
  })
  const heading = hero && hero.querySelector('h1')
  const accent = heading && heading.querySelector('span')
  const lede = hero && hero.querySelector('p')
  const grid = band && band.querySelector('.services__grid')
  return {
    heading: heading && {
      classes: [...heading.classList],
      text: heading.textContent.replace(/\\s+/g, ' ').trim(),
      lines: lineTops(heading),
      color: getComputedStyle(heading).color,
      fontSize: parseFloat(getComputedStyle(heading).fontSize),
      fontWeight: getComputedStyle(heading).fontWeight,
      breaks: heading.querySelectorAll('br').length,
      rect: box(heading),
    },
    accent: accent && {
      classes: [...accent.classList],
      text: accent.textContent.replace(/\\s+/g, ' ').trim(),
      color: getComputedStyle(accent).color,
      rect: box(accent),
    },
    lede: lede && {
      classes: [...lede.classList],
      text: lede.textContent.replace(/\\s+/g, ' ').trim(),
      rect: box(lede),
    },
    stack: stack && {
      classes: [...stack.classList],
      children: [...stack.children].map((el) => el.tagName.toLowerCase() + '.' + [...el.classList].join('.')),
      rect: box(stack),
    },
    images: [...band.querySelectorAll(':scope > .container > img')].map(image),
    grid: grid && {
      tag: grid.tagName.toLowerCase(),
      classes: [...grid.classList],
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      rect: box(grid),
    },
    cards: [...(grid ? grid.children : [])].map((card) => Object.assign(frame(card), {
      caption: card.querySelector('.card__title')?.textContent.replace(/\\s+/g, ' ').trim() ?? null,
      text: card.textContent.replace(/\\s+/g, ' ').trim(),
      img: card.querySelector('img') && image(card.querySelector('img')),
    })),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewport: window.innerWidth,
    container: (() => {
      const el = document.querySelector('main .team > .container')
      const style = getComputedStyle(el)
      // The measure the band lays its content out on: the container's box less
      // the gutter it pads itself with.
      return Object.assign(box(el), {
        content: el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      })
    })(),
  }
`

/** The shade a `--x` token resolves to, as Chrome reports colours. */
const shade = (css, name) => {
  const { r, g, b } = parseHex(declaredValue(css, [':root'], `--${name}`))
  return `rgb(${r}, ${g}, ${b})`
}

describe('Team task 1: the spec\'s open questions, settled before the code', () => {
  /** Each open question, and a phrase the settled answer has to contain. */
  const SETTLED = [
    { about: 'the three image files', evidence: [TEAM_IMAGES.top.src, TEAM_IMAGES.second.src, TEAM_IMAGES.banner.src] },
    { about: 'the "sofia" image class', evidence: ['origin__photo'] },
    { about: 'the nav being shared or duplicated', evidence: ['Duplicated', HOMEPAGE, TEAM_PAGE] },
    { about: "team2's border colour", evidence: ['Papaya'] },
    { about: "the nav link's position", evidence: ['href="#">Team</a>'] },
    { about: 'the grid system', evidence: ['services__grid', 'card'] },
    { about: 'the single-name "Slaw"', evidence: ['Slaw', 'placeholder-slaw.png'] },
  ]

  it('has a written record of every open question the spec left open', async () => {
    const settled = await notesSection('Open questions from the spec, settled')

    assert.ok(settled, `${TEAM_NOTES} has no "Open questions from the spec, settled" section`)
    for (const { about, evidence } of SETTLED) {
      for (const phrase of evidence) {
        assert.ok(settled.includes(phrase), `the answer on ${about} never mentions ${phrase}`)
      }
    }
  })

  it('flags the assumptions it had to make rather than deciding them silently', async () => {
    const flagged = await notesSection('Flagged for the reviewer')

    assert.ok(flagged, `${TEAM_NOTES} has no "Flagged for the reviewer" section`)
    assert.match(flagged, /Principle Engineer/, 'the spec\'s "Principle Engineer" is not flagged')
    assert.match(flagged, /Slaw\b/, 'the single-name "Slaw" is not flagged')
    assert.ok(flagged.includes(CASE_STUDIES_PAGE), `the inert "Team" tab on ${CASE_STUDIES_PAGE} is not flagged`)
    assert.ok(flagged.includes(CONTACT_PAGE), `the inert "Team" tab on ${CONTACT_PAGE} is not flagged`)
    assert.match(flagged, /placeholder/i, 'the notes do not say the ten avatars are placeholders')
  })

  it('says where the images are, given the plan writes a folder the repo does not have', async () => {
    const map = await notesSection('File map, as the plan names it and as it exists')

    assert.ok(map, `${TEAM_NOTES} has no "File map" section`)
    assert.ok(map.includes('images/team/'), 'the notes do not name the folder the plan writes')
    for (const asset of TEAM_ASSETS) {
      if (asset.endsWith('.gitkeep')) continue
      assert.ok(map.includes('team/'), `the notes do not say where ${asset} sits`)
    }
  })
})

describe('Team task 2: the "Team" tab on the home page', () => {
  const site = servedInBrowser(HOMEPAGE)

  it('points the tab at the new page, in the markup its siblings are written in', async () => {
    const nav = navBlock(await read(HOMEPAGE))
    const entries = [...nav.matchAll(/<li><a href="([^"]*)">([^<]*)<\/a><\/li>/g)]

    assert.equal(entries.length, 8, `the nav no longer holds its eight tabs`)
    const team = entries.filter(([, , label]) => label === 'Team')
    assert.equal(team.length, 1, `${HOMEPAGE} carries ${team.length} "Team" tabs`)
    assert.equal(team[0][1], TEAM_PAGE)
  })

  it('carries no class of its own, so it is styled by the same rule as the rest', async () => {
    const tab = navBlock(await read(HOMEPAGE)).match(/<li><a href="[^"]*">Team<\/a><\/li>/)

    assert.ok(tab, `the "Team" tab is no longer a plain <li><a> like its siblings`)
  })

  it('leaves every other tab, and the tab order, exactly as it was', async () => {
    const was = beforeTeamPage(await read(HOMEPAGE))

    assert.deepEqual(linksIn(navBlock(was)), [
      { href: '#about', label: 'About' },
      { href: '#services', label: 'Services' },
      { href: '#values', label: 'Values' },
      { href: '#', label: 'Team' },
      { href: CASE_STUDIES_PAGE, label: 'Case Studies' },
      { href: '#', label: 'Careers' },
      { href: '#', label: 'Blog' },
      { href: CONTACT_PAGE, label: 'Contact' },
    ])
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
    const team = links.find((link) => link.label === 'Team')
    const others = links.filter((link) => link.label !== 'Team')

    assert.ok(team, 'the home page renders no "Team" tab')
    assert.equal(team.href, TEAM_PAGE)
    assert.deepEqual(team.classes, [])
    for (const property of ['color', 'fontSize', 'fontWeight', 'textDecoration']) {
      assert.equal(
        team[property],
        others[0][property],
        `the "Team" tab's ${property} is ${team[property]}, not the ${others[0][property]} its siblings take`,
      )
    }
  })

  it('reaches the page when clicked, from the home page and from the page itself', async () => {
    const { page } = site

    for (const from of [HOMEPAGE, TEAM_PAGE]) {
      await page.goto(`${site.origin}/${from}`)
      const reached = await page.evaluate(`
        const tab = [...document.querySelectorAll('.masthead__links a')].find((a) => a.textContent.trim() === 'Team')
        return tab ? new URL(tab.href, location.href).pathname : null
      `)

      assert.equal(reached, `/${TEAM_PAGE}`, `the "Team" tab on ${from} does not point at the page`)
    }
  })
})

describe('Team task 3: the page shell, copied rather than rewritten', () => {
  const site = servedInBrowser()

  it('exists, and is served as HTML at the slug the tab points at', async () => {
    const response = await fetch(`${site.origin}/${TEAM_PAGE}`)

    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/html/)
  })

  it('takes its head, header, nav and footer from an existing page, byte for byte', async () => {
    const mine = shellOf(await read(TEAM_PAGE))
    const theirs = shellOf(await read(CASE_STUDIES_PAGE))

    assert.equal(
      mine.head.replace(/<title>[^<]*<\/title>/, ''),
      theirs.head.replace(/<title>[^<]*<\/title>/, ''),
      'the head differs from the page it was copied from by more than its title',
    )
    assert.equal(beforeTeamPage(mine.header), theirs.header, 'the header differs by more than the "Team" tab')
    assert.equal(beforeTeamPage(mine.nav), theirs.nav, 'the nav differs by more than the "Team" tab')
    assert.equal(mine.footer, theirs.footer, 'the footer differs from the page it was copied from')
    assert.deepEqual(mine.includes, theirs.includes, 'the page loads a different set of files')
  })

  it('links the one stylesheet the rest of the site is styled from, and no script', async () => {
    const html = await read(TEAM_PAGE)

    assert.ok(html.includes(`<link rel="stylesheet" href="${SERVICES_STYLESHEET}" />`), 'the stylesheet is not linked')
    assert.equal(/<style\b/.test(html), false, 'the page carries a <style> block')
    assert.equal(/<script\b/.test(html), false, 'the page carries a script the rest of the site does not')
    assert.deepEqual([...html.matchAll(/\sstyle="/g)], [], 'the page carries inline styles')
  })

  it('titles itself for the page it is, and carries the "Team" tab in its own nav', async () => {
    const html = await read(TEAM_PAGE)

    assert.equal(titleOf(html), TEAM_TITLE)
    assert.ok(
      linksIn(navBlock(html)).some((link) => link.label === 'Team' && link.href === TEAM_PAGE),
      `${TEAM_PAGE} does not carry its own "Team" tab`,
    )
  })

  it('renders the same chrome the rest of the site does, with nothing logged or missing', async () => {
    const chrome = await site.page.evaluate(`
      return {
        masthead: !!document.querySelector('.masthead .masthead__links'),
        mark: document.querySelector('.masthead__mark')?.naturalWidth ?? 0,
        footer: !!document.querySelector('.footer .footer__bottom'),
        font: getComputedStyle(document.body).fontFamily,
        background: getComputedStyle(document.body).backgroundColor,
      }
    `)

    assert.ok(chrome.masthead, 'the page has no masthead')
    assert.ok(chrome.mark > 0, 'the masthead mark never decoded')
    assert.ok(chrome.footer, 'the page has no footer')
    assert.equal(chrome.font, 'Inter, "Helvetica Neue", Arial, sans-serif')
    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })
})

describe('Team task 4: "MEET" over "THE TEAM", in the home page\'s own headline', () => {
  const site = servedInBrowser()

  it('sets it in the class the home page sets its headline in', async () => {
    const home = (await read(HOMEPAGE)).match(/<h1 class="([^"]*)"/)[1]
    const { heading } = await site.page.evaluate(BANDS)

    assert.ok(heading, 'the page has no <h1>')
    assert.deepEqual(heading.classes, home.split(' '), `the headline is a ${heading.classes} rather than a ${home}`)
    assert.equal(heading.text, TEAM_HEADING.join(' '))
  })

  it('breaks it over two lines, "MEET" above "THE TEAM"', async () => {
    const { heading, accent } = await site.page.evaluate(BANDS)

    assert.equal(heading.breaks, 1, `the headline carries ${heading.breaks} line breaks`)
    assert.equal(heading.lines.length, 2, `the headline renders on ${heading.lines.length} lines`)
    assert.ok(heading.lines[0] < heading.lines[1], 'the two lines are not stacked')
    assert.ok(accent.rect.top >= heading.lines[1] - 1, '"THE TEAM" is not the second line')
  })

  it('paints "THE TEAM" in the papaya the hero\'s own accent span takes, and "MEET" in the ink', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const home = (await read(HOMEPAGE)).match(/<span class="([^"]*)">REALLY WELL<\/span>/)[1]
    const { heading, accent } = await site.page.evaluate(BANDS)

    assert.deepEqual(accent.classes, home.split(' '), `"${TEAM_ACCENT}" is a ${accent.classes} rather than a ${home}`)
    assert.equal(accent.text, TEAM_ACCENT)
    assert.equal(accent.color, shade(css, 'papaya'))
    assert.equal(heading.color, shade(css, 'deep'), '"MEET" is not the ink the rest of the headings take')
  })

  it('declares no headline style of its own, the home page\'s rules being enough', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const team = css.split(/\/\* Team page -+ \*\//).at(1)?.split(/\/\* [A-Z]/).at(0) ?? ''

    assert.equal(/hero__heading|hero__papaya|font-size|letter-spacing/.test(team), false, `the team block restyles the headline:\n${team}`)
  })
})

describe('Team task 5: the subtext, directly under the headline', () => {
  const site = servedInBrowser()

  it('reproduces the paragraph the spec supplied, word for word', async () => {
    const { lede } = await site.page.evaluate(BANDS)

    assert.ok(lede, 'the page has no paragraph under its headline')
    assert.equal(lede.text, TEAM_LEDE)
  })

  it('sets it in the class the home page sets the paragraph under its headline in', async () => {
    const home = (await read(HOMEPAGE)).match(/<p class="([^"]*)">\s*We are a senior technology partner/)[1]
    const { lede } = await site.page.evaluate(BANDS)

    assert.deepEqual(lede.classes, home.split(' '), `the subtext is a ${lede.classes} rather than a ${home}`)
  })

  it('puts it directly under the headline, above everything else on the page', async () => {
    const { heading, lede, images, grid } = await site.page.evaluate(BANDS)

    assert.ok(lede.rect.top >= heading.rect.bottom, 'the subtext is not below the headline')
    assert.ok(lede.rect.top - heading.rect.bottom < 40, 'something sits between the headline and the subtext')
    assert.ok(lede.rect.bottom <= images[0].rect.top, 'the subtext is not above the first photograph')
    assert.ok(lede.rect.bottom <= grid.rect.top, 'the subtext is not above the avatar grid')
  })
})

describe('Team task 6: the first photograph, in the frame the origin band uses', () => {
  const site = servedInBrowser()

  it('ships the file, at the path the page asks for', async () => {
    const info = await stat(join(repoRoot, TEAM_IMAGES.top.src))

    assert.ok(info.size > 0, `${TEAM_IMAGES.top.src} is empty`)
  })

  it('carries the class the home page frames its own photograph with, and nothing else', async () => {
    const sofia = (await read(HOMEPAGE)).match(/<img\s+class="([^"]*)"\s+src="Sofia\.jpg"/)[1]
    const { images } = await site.page.evaluate(BANDS)

    assert.deepEqual(images[0].classes, sofia.split(' '), `the photograph is a ${images[0].classes} rather than a ${sofia}`)
    assert.equal(images[0].src, TEAM_IMAGES.top.src)
    assert.ok(images[0].natural > 0, `${TEAM_IMAGES.top.src} never decoded`)
  })

  it('draws the same 1px papaya frame and 10px radius that photograph is drawn in', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { images } = await site.page.evaluate(BANDS)

    assert.equal(images[0].radius, '10px')
    assert.deepEqual(images[0].widths, Array(4).fill('1px'))
    assert.deepEqual(images[0].border, Array(4).fill(shade(css, 'papaya')))
  })

  it('fills the band and keeps the ratio the file was saved at', async () => {
    const { images, container } = await site.page.evaluate(BANDS)
    const { width, height } = TEAM_IMAGES.top

    assert.ok(Math.abs(images[0].rect.width - container.content) < 1, 'the photograph does not fill the band')
    const ratio = (images[0].rect.width - 2) / (images[0].rect.height - 2)
    assert.ok(Math.abs(ratio - width / height) < 0.02, `the photograph is drawn at ${ratio.toFixed(3)}, not ${(width / height).toFixed(3)}`)
    assert.equal(images[0].width, String(width))
    assert.equal(images[0].height, String(height))
  })
})

describe('Team task 7: ten placeholder avatars, one file per person', () => {
  it('ships a file for every member, named after them, none of them empty', async () => {
    for (const member of TEAM_MEMBERS) {
      const info = await stat(join(repoRoot, member.image))

      assert.ok(info.size > 0, `${member.image} is empty`)
    }
  })

  it('names each one for the person it stands in for, lowercase and hyphenated', async () => {
    for (const member of TEAM_MEMBERS) {
      const expected = `team/placeholder-${member.name.toLowerCase().replace(/\s+/g, '-')}.png`

      assert.equal(member.image, expected)
      assert.match(member.image, /^team\/placeholder-[a-z]+(-[a-z]+)?\.png$/)
    }
  })

  // This stood as "gives the single-name entry a single-name file, not a guessed
  // surname", on the "Slaw" entry job f5053a8e replaced with Nino A. What it was
  // guarding — that two members whose names run together are not collapsed onto
  // one file — is asserted of the ten as they stand now.
  it('gives every member a file of their own, never two members one file', async () => {
    const files = TEAM_MEMBERS.map((member) => member.image)

    assert.equal(new Set(files).size, TEAM_MEMBERS.length, 'two members share a placeholder file')
    assert.equal(
      files.filter((file) => file.startsWith('team/placeholder-slaw')).length,
      1,
      '"Slawek Panic" no longer has a file of their own',
    )
  })

  it('writes each one as a PNG the size the page reserves for it', async () => {
    for (const member of TEAM_MEMBERS) {
      const bytes = await readFile(join(repoRoot, member.image))

      assert.deepEqual([...bytes.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], `${member.image} is not a PNG`)
      assert.equal(bytes.readUInt32BE(16), TEAM_AVATAR_SIZE.width, `${member.image} is not ${TEAM_AVATAR_SIZE.width}px wide`)
      assert.equal(bytes.readUInt32BE(20), TEAM_AVATAR_SIZE.height, `${member.image} is not ${TEAM_AVATAR_SIZE.height}px tall`)
    }
  })
})

describe('Team task 8: the ten avatar boxes, in order and in their own shades', () => {
  const site = servedInBrowser()

  it('builds them from the grid and the box the rest of the site is built from', async () => {
    const { grid, cards } = await site.page.evaluate(BANDS)

    assert.ok(grid, 'the page has no avatar grid')
    assert.equal(grid.tag, 'ul')
    assert.deepEqual(grid.classes, ['services__grid'])
    assert.equal(cards.length, TEAM_MEMBERS.length, `the grid holds ${cards.length} boxes`)
    for (const [index, card] of cards.entries()) {
      assert.equal(card.tag, 'li', `box ${index + 1} is a <${card.tag}>`)
      assert.deepEqual(card.classes, ['card'], `box ${index + 1} carries ${card.classes}`)
    }
  })

  it('writes the ten members in the order the spec lists them, one caption each', async () => {
    const { cards } = await site.page.evaluate(BANDS)

    assert.deepEqual(cards.map((card) => card.caption), TEAM_MEMBERS.map(teamCaption))
    for (const [index, card] of cards.entries()) {
      assert.equal(card.text, teamCaption(TEAM_MEMBERS[index]), `box ${index + 1} carries copy beyond its caption`)
    }
  })

  it('stands each member in behind their own placeholder', async () => {
    const { cards } = await site.page.evaluate(BANDS)

    for (const [index, card] of cards.entries()) {
      assert.ok(card.img, `box ${index + 1} carries no image`)
      assert.equal(card.img.src, TEAM_MEMBERS[index].image)
      assert.ok(card.img.natural > 0, `${card.img.src} never decoded`)
    }
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })

  it('rounds and outlines each box, running papaya, lime, black and round again', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { cards } = await site.page.evaluate(BANDS)

    assert.deepEqual(TEAM_BORDERS.slice(0, 4), ['papaya', 'lime', 'black', 'papaya'])
    assert.equal(TEAM_BORDERS.at(-1), 'papaya', 'ten boxes on a three-step rotation end on papaya')
    for (const [index, card] of cards.entries()) {
      assert.equal(card.radius, '10px', `box ${index + 1} is not rounded`)
      assert.deepEqual(card.widths, Array(4).fill('1px'), `box ${index + 1} is not outlined`)
      assert.deepEqual(
        card.border,
        Array(4).fill(shade(css, TEAM_BORDERS[index])),
        `box ${index + 1} is not ${TEAM_BORDERS[index]}`,
      )
    }
  })

  it('leaves the six-step rotation the services and values boxes run untouched', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const team = css.split(/\/\* Team page -+ \*\//).at(1) ?? ''

    assert.match(team, /\.team \.services__grid > \.card:nth-child\(3n \+ 1\)/, 'the rotation is not scoped to the band')
    for (const rule of ['6n + 1', '6n + 5', '6n + 2', '6n + 3', '6n + 4']) {
      assert.equal(team.includes(rule), false, `the team block edits the services grid's own ${rule} rule`)
    }
    assert.equal(/--papaya:|--lime:|--black:/.test(team), false, 'the team block declares a shade of its own')
  })

  it('renders the services boxes on the home page in their own six shades still', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { page } = site
    await page.goto(`${site.origin}/${HOMEPAGE}`)
    const borders = await page.evaluate(`
      return [...document.querySelectorAll('#services .services__grid > .card')]
        .map((card) => getComputedStyle(card).borderTopColor)
    `)

    assert.deepEqual(
      borders,
      ['papaya', 'lime', 'black', 'black', 'papaya', 'lime'].map((name) => shade(css, name)),
    )
  })
})

describe('Team task 9: the second photograph, below the grid', () => {
  const site = servedInBrowser()

  it('ships the file, and draws it below the last avatar box', async () => {
    const info = await stat(join(repoRoot, TEAM_IMAGES.second.src))
    const { images, grid } = await site.page.evaluate(BANDS)
    const second = images[1]

    assert.ok(info.size > 0, `${TEAM_IMAGES.second.src} is empty`)
    assert.equal(second.src, TEAM_IMAGES.second.src)
    assert.ok(second.rect.top >= grid.rect.bottom, 'the second photograph is not below the grid')
    assert.ok(second.natural > 0, `${TEAM_IMAGES.second.src} never decoded`)
  })

  it('rounds it and outlines it in the one brand shade the spec asks for', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const { images } = await site.page.evaluate(BANDS)

    assert.equal(images[1].radius, '10px')
    assert.deepEqual(images[1].widths, Array(4).fill('1px'))
    assert.deepEqual(images[1].border, Array(4).fill(shade(css, 'papaya')))
  })

  it('reuses the first photograph\'s frame rather than declaring a second one', async () => {
    const { images } = await site.page.evaluate(BANDS)

    assert.deepEqual(images[1].classes, images[0].classes)
    assert.equal(images[1].width, String(TEAM_IMAGES.second.width))
    assert.equal(images[1].height, String(TEAM_IMAGES.second.height))
  })
})

describe('Team task 10: the banner, at the foot of the page', () => {
  const site = servedInBrowser()

  it('ships the file, and draws it last of everything in the band', async () => {
    const info = await stat(join(repoRoot, TEAM_IMAGES.banner.src))
    const { images, stack } = await site.page.evaluate(BANDS)
    const banner = images.at(-1)

    assert.ok(info.size > 0, `${TEAM_IMAGES.banner.src} is empty`)
    assert.equal(images.length, 3, `the band holds ${images.length} photographs of its own`)
    assert.equal(banner.src, TEAM_IMAGES.banner.src)
    assert.equal(stack.children.at(-1), `img.${banner.classes.join('.')}`, 'the banner is not the last thing in the band')
    assert.ok(banner.rect.top >= images[1].rect.bottom, 'the banner is not below the second photograph')
    assert.ok(banner.natural > 0, `${TEAM_IMAGES.banner.src} never decoded`)
  })

  it('leaves it unframed: no border, no radius, just the width of the band', async () => {
    const { images, container } = await site.page.evaluate(BANDS)
    const banner = images.at(-1)

    assert.equal(banner.radius, '0px', 'the banner is rounded')
    assert.deepEqual(banner.widths, Array(4).fill('0px'), 'the banner is outlined')
    assert.notDeepEqual(banner.classes, images[0].classes, 'the banner carries the framed photographs\' class')
    assert.ok(Math.abs(banner.rect.width - container.content) < 1, 'the banner does not fill the band')
  })

  it('sits above the footer, so the page ends where the rest of the site does', async () => {
    const position = await site.page.evaluate(`
      const banner = [...document.querySelectorAll('main img')].at(-1)
      const footer = document.querySelector('.footer')
      return {
        insideMain: !!banner.closest('main'),
        aboveFooter: banner.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top,
      }
    `)

    assert.ok(position.insideMain, 'the banner is not part of the page content')
    assert.ok(position.aboveFooter, 'the banner overlaps the footer')
  })
})

describe('Team task 11: alt text on every image the page adds', () => {
  const site = servedInBrowser()

  it('describes all thirteen, and never leaves one empty', async () => {
    const { images, cards } = await site.page.evaluate(BANDS)
    const added = [...images, ...cards.map((card) => card.img)]

    assert.equal(added.length, 3 + TEAM_MEMBERS.length)
    for (const image of added) {
      assert.ok(image.alt?.trim().length > 0, `${image.src} ships without alt text`)
    }
  })

  it('names the person each placeholder stands in for', async () => {
    const { cards } = await site.page.evaluate(BANDS)

    for (const [index, card] of cards.entries()) {
      assert.ok(
        card.img.alt.includes(TEAM_MEMBERS[index].name),
        `${card.img.src} is described as "${card.img.alt}", which does not name ${TEAM_MEMBERS[index].name}`,
      )
    }
  })

  it('carries the wording the banner draws, since a reader cannot read the artwork', async () => {
    const { images } = await site.page.evaluate(BANDS)

    assert.match(images.at(-1).alt, /want in/i, 'the banner\'s own headline is not in its alt text')
    assert.match(images.at(-1).alt, /open roles/i, 'the banner\'s own call to action is not in its alt text')
  })
})

describe('Team task 12: the page at every width the site supports', () => {
  const site = servedInBrowser()

  for (const width of BREAKPOINTS) {
    it(`reflows at ${width}px without overflowing or overlapping`, async () => {
      await freshLoad(site, width)
      const bands = await site.page.evaluate(BANDS)

      assert.equal(bands.overflow, 0, `the page scrolls sideways at ${width}px`)
      for (const image of bands.images) {
        assert.ok(image.rect.width <= bands.container.content + 1, `a photograph is wider than the band at ${width}px`)
        assert.ok(image.rect.left >= bands.container.left - 1, `a photograph starts left of the band at ${width}px`)
      }
      for (const [index, card] of bands.cards.entries()) {
        assert.ok(card.rect.width > 0 && card.rect.height > 0, `box ${index + 1} is not drawn at ${width}px`)
        assert.ok(card.img.rect.width <= card.rect.width, `box ${index + 1}'s avatar overflows it at ${width}px`)
      }
      assert.ok(bands.heading.rect.bottom <= bands.lede.rect.top, `the headline and the subtext collide at ${width}px`)
    })
  }

  for (const width of BREAKPOINTS) {
    it(`lays the grid out in the columns the home page's own boxes take at ${width}px`, async () => {
      await freshLoad(site, width)
      const { grid } = await site.page.evaluate(BANDS)
      const expected = width >= 1024 ? 3 : width >= 768 ? 2 : 1

      assert.equal(grid.columns, expected, `the grid runs ${grid.columns} columns at ${width}px`)
    })
  }

  it('keeps every caption inside its box rather than letting the longest overflow', async () => {
    await freshLoad(site, 375)
    const { cards } = await site.page.evaluate(BANDS)
    const longest = cards[TEAM_MEMBERS.findIndex((member) => member.name === 'Marcin B')]
    const wrapped = await site.page.evaluate(`
      const caption = [...document.querySelectorAll('.team .card__title')].at(-1)
      const range = document.createRange()
      range.selectNodeContents(caption)
      return {
        scrollWidth: caption.scrollWidth,
        clientWidth: caption.clientWidth,
        lines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
      }
    `)

    assert.ok(wrapped.scrollWidth <= wrapped.clientWidth + 1, 'the longest caption overflows its box')
    assert.ok(wrapped.lines > 1, 'the longest caption is not wrapping at 375px')
    assert.ok(longest.rect.height > 0, 'the last box is not drawn')
  })

  it('declares nothing outside the site\'s own two breakpoints', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const widths = [...css.matchAll(/@media \(min-width: (\d+)px\)/g)].map(([, px]) => Number(px))

    assert.deepEqual([...new Set(widths)].sort((a, b) => a - b), [768, 1024])
  })
})
