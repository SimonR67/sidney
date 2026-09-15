// Tests for the two Team page entries replaced by real people, and for the
// responsive behaviour of the band that carries them.
// Plan: specs/f5053a8e-0d91-4eab-b266-a0cd26076190/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { openPage, serveStatic } from './browser.mjs'
import {
  HOMEPAGE,
  SERVICES_STYLESHEET,
  TEAM_ADDITIONS,
  TEAM_AVATAR_SIZE,
  TEAM_BORDERS,
  TEAM_MEMBERS,
  TEAM_PAGE,
  TEAM_REPLACED,
  TEAM_RESTORED,
  TEAM_UPDATE_NOTES,
  declaredValue,
  parseHex,
  read,
  repoRoot,
  siteFiles,
  teamCaption,
} from './site.mjs'

/** The section of this job's notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(TEAM_UPDATE_NOTES)
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

/**
 * Serves the repo and opens one headless-Chrome page on the Team page for the
 * enclosing suite. `page` is filled in by the time the tests run.
 */
const servedInBrowser = () => {
  const handle = {}
  before(async () => {
    handle.server = await serveStatic(repoRoot)
    handle.url = `${handle.server.origin}/${TEAM_PAGE}`
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
const freshLoad = async (site, width, height = 900) => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}`)
}

/** Every avatar box the band draws, in document order, with the box it is drawn in. */
const CARDS = `
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, right: r.right, bottom: r.bottom, left: r.left, width: r.width, height: r.height }
  }
  const grid = document.querySelector('.team .services__grid')
  return {
    viewport: window.innerWidth,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    display: getComputedStyle(grid).display,
    cards: [...grid.children].map((card) => {
      const title = card.querySelector('.card__title')
      const img = card.querySelector('img')
      const style = getComputedStyle(card)
      const inner = {
        left: box(card).left + parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth),
        right: box(card).right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth),
      }
      const range = document.createRange()
      range.selectNodeContents(title)
      return {
        caption: title.textContent.replace(/\\s+/g, ' ').trim(),
        rect: box(card),
        inner,
        title: Object.assign(box(title), {
          scrollWidth: title.scrollWidth,
          clientWidth: title.clientWidth,
          lines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
        }),
        img: {
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt'),
          width: img.getAttribute('width'),
          height: img.getAttribute('height'),
          natural: img.naturalWidth,
          rect: box(img),
          declared: (({ width, maxWidth, height }) => ({ width, maxWidth, height }))(getComputedStyle(img)),
        },
      }
    }),
  }
`

/** The `<li class="card">` blocks of the Team page's grid, in document order. */
const cardBlocks = async () =>
  [...(await read(TEAM_PAGE)).matchAll(/<li class="card">[\s\S]*?<\/li>/g)].map(([block]) => block)

/**
 * A card's markup with the person in it written out — name, role and the slug of
 * their file — so two boxes only differ where their structure does.
 */
const structureOf = (block, { name, role, image }) =>
  block
    .split(image).join('SLUG')
    .split(`${name} — ${role}`).join('CAPTION')
    .split(name).join('NAME')

describe('Team update task 1: the two entries to replace, settled before the edit', () => {
  it('writes down which two were chosen, and where each one sat in the grid', async () => {
    const chosen = await notesSection('The two entries chosen')

    assert.ok(chosen, `${TEAM_UPDATE_NOTES} has no "The two entries chosen" section`)
    for (const member of TEAM_REPLACED) {
      assert.ok(chosen.includes(teamCaption(member)), `the notes never name "${teamCaption(member)}" as one of the two`)
      assert.ok(
        new RegExp(`\\b${member.position}\\b`).test(chosen),
        `the notes never give ${member.name}'s position (${member.position}) in the grid`,
      )
    }
    for (const member of TEAM_ADDITIONS) {
      assert.ok(chosen.includes(teamCaption(member)), `the notes never name "${teamCaption(member)}" as a replacement`)
    }
  })

  it('names exactly two, and says why those two rather than any of the other eight', async () => {
    const chosen = await notesSection('The two entries chosen')
    // The roster is twelve since job 282a4e1c put the two replaced entries back;
    // the eight this job left standing are what is left of it once its own two
    // and those two are taken out.
    const touched = [...TEAM_ADDITIONS, ...TEAM_RESTORED]
    const kept = TEAM_MEMBERS.filter((member) => !touched.some((entry) => entry.name === member.name))

    assert.equal(kept.length, 8, `${kept.length} entries are left standing, not eight`)
    for (const member of kept) {
      assert.equal(
        chosen.includes(`${teamCaption(member)}`) && /replac/i.test(chosen.split(teamCaption(member)).at(1) ?? ''),
        false,
        `the notes read as though "${teamCaption(member)}" were also replaced`,
      )
    }
    assert.match(chosen, /generic|least identifying|placeholder/i, 'the notes give no reason for the two it picked')
  })

  it('records that the replacements keep the placeholder artwork rather than a new photograph', async () => {
    const chosen = await notesSection('The two entries chosen')

    for (const member of TEAM_ADDITIONS) {
      assert.ok(chosen.includes(member.image), `the notes never say which file stands in for ${member.name}`)
    }
    assert.match(chosen, /placeholder/i, 'the notes do not say the artwork is still a placeholder')
    assert.match(chosen, /no (new )?photograph|no photo/i, 'the notes do not say no photograph was sourced')
  })
})

/** The shared body of tasks 2 and 3: one replaced entry, in the position it took over. */
const replacement = (index) => {
  const added = TEAM_ADDITIONS[index]
  const was = TEAM_REPLACED[index]
  const site = servedInBrowser()

  it(`draws "${teamCaption(added)}" in box ${added.position}, where ${was.name} stood`, async () => {
    const { cards } = await site.page.evaluate(CARDS)

    assert.equal(cards.length, TEAM_MEMBERS.length, `the grid holds ${cards.length} boxes`)
    assert.equal(cards[added.position - 1].caption, teamCaption(added))
    // "Oskar S" and "Slaw" are back on the page — job 282a4e1c put them in slots
    // 8 and 9, where the twelve-person roster has them. What this guarded, that
    // the replacement took this box over rather than being added beside the
    // entry it replaced, is asserted of the box itself.
    assert.notEqual(
      cards[added.position - 1].caption,
      teamCaption(was),
      `"${teamCaption(was)}" is still the caption of box ${added.position}`,
    )
    assert.equal(
      cards[TEAM_RESTORED.find((member) => member.name === was.name).position - 1].caption,
      teamCaption(was),
      `"${teamCaption(was)}" is not in the slot it was restored to`,
    )
  })

  it('keeps the placeholder artwork it inherited — the same bytes, under the person\'s name', async () => {
    const { cards } = await site.page.evaluate(CARDS)
    const card = cards[added.position - 1]
    const [mine, theirs] = await Promise.all(
      [added.image, TEAM_MEMBERS[0].image].map((file) => readFile(join(repoRoot, file))),
    )

    assert.equal(card.img.src, added.image)
    assert.ok(card.img.natural > 0, `${added.image} never decoded`)
    assert.deepEqual(mine, theirs, `${added.image} is not the placeholder the rest of the grid carries`)
    assert.equal(card.img.width, String(TEAM_AVATAR_SIZE.width))
    assert.equal(card.img.height, String(TEAM_AVATAR_SIZE.height))
    // `was.image` ships again: job 282a4e1c put both entries back, each under
    // the filename it had. What this guarded — that the box carries a file named
    // for the person standing in it, not the one it took over — still holds.
    assert.notEqual(added.image, was.image, `${added.name}'s box is still named for ${was.name}`)
    assert.notEqual(card.img.src, was.image, `box ${added.position} still carries ${was.image}`)
  })

  it('names the person the box now stands in for, and still says the portrait is a placeholder', async () => {
    const { cards } = await site.page.evaluate(CARDS)
    const { alt } = cards[added.position - 1].img

    assert.ok(alt.includes(added.name), `the box is described as "${alt}", which does not name ${added.name}`)
    assert.equal(alt.includes(was.name), false, `the box is still described as ${was.name}'s`)
    assert.match(alt, /placeholder/i, 'the alt text no longer says the portrait is a placeholder')
  })

  it('changes the caption and the file, and nothing else about the box', async () => {
    const blocks = await cardBlocks()
    const mine = structureOf(blocks[added.position - 1], added)
    const untouched = TEAM_MEMBERS.map((member, i) => structureOf(blocks[i], member))
      .filter((_, i) => !TEAM_ADDITIONS.some((entry) => entry.position - 1 === i))

    for (const [i, other] of untouched.entries()) {
      assert.equal(mine, other, `box ${added.position} is built differently from untouched box ${i + 1}`)
    }
  })
}

describe('Team update task 2: Paula S, Agile Delivery Lead', () => replacement(0))

describe('Team update task 3: Nino A, Power BI and Data Analyst', () => replacement(1))

describe('Team update task 4: the eight entries this job did not touch', () => {
  const site = servedInBrowser()

  it('leaves every other caption, image and position exactly as it was', async () => {
    const { cards } = await site.page.evaluate(CARDS)

    for (const [index, member] of TEAM_MEMBERS.entries()) {
      if (TEAM_ADDITIONS.some((added) => added.position - 1 === index)) continue
      assert.equal(cards[index].caption, teamCaption(member), `box ${index + 1} no longer reads ${member.name}'s caption`)
      assert.equal(cards[index].img.src, member.image, `box ${index + 1} no longer carries ${member.image}`)
      assert.ok(cards[index].img.alt.includes(member.name), `box ${index + 1} is no longer described as ${member.name}'s`)
    }
  })

  it('adds and removes nothing: every box built the same way, in the same order', async () => {
    const blocks = await cardBlocks()
    const normalised = new Set(blocks.map((block, index) => structureOf(block, TEAM_MEMBERS[index])))
    const stacked = await site.page.evaluate(`
      const stack = document.querySelector('.team .team__stack')
      return [...stack.children].map((el) => el.tagName.toLowerCase() + '.' + [...el.classList].join('.'))
    `)

    assert.equal(blocks.length, TEAM_MEMBERS.length, `the grid is written with ${blocks.length} boxes`)
    assert.equal(normalised.size, 1, 'the ten boxes are no longer written the same way as each other')
    assert.deepEqual(stacked, [
      'img.origin__photo',
      'ul.services__grid',
      'img.origin__photo',
      'img.team__banner',
    ], 'the band no longer stacks the two photographs, the grid and the banner')
  })

  it('ships one placeholder per member and nothing that stands for nobody', async () => {
    const shipped = (await siteFiles()).filter((file) => file.startsWith('team/placeholder-'))

    assert.deepEqual(shipped, TEAM_MEMBERS.map((member) => member.image).sort())
    // The two files this job renamed away came back with job 282a4e1c, which put
    // the people they stand for back on the page. What this guarded — that no
    // file is left in the repository without a member to go with it — is the
    // manifest check above.
    for (const { image, name } of TEAM_REPLACED) {
      assert.equal(
        shipped.includes(image),
        TEAM_MEMBERS.some((member) => member.name === name),
        `${image} ships without a member to stand for`,
      )
    }
  })
})

describe('Team update task 5: the avatars sized fluidly, not in pixels', () => {
  const site = servedInBrowser()

  it('sizes them as a share of the box they sit in, with the height derived', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.equal(declaredValue(css, ['.team__avatar'], 'width'), '100%')
    assert.equal(declaredValue(css, ['.team__avatar'], 'max-width'), '100%')
    assert.equal(declaredValue(css, ['.team__avatar'], 'height'), 'auto')
  })

  it('declares no pixel width or height for them anywhere — in the sheet or inline', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const html = await read(TEAM_PAGE)
    const team = css.split(/\/\* Team page -+ \*\//).at(1).split(/\/\* [A-Z]/).at(0)

    assert.equal(/(?:^|[^-])(?:width|height):\s*\d+px/m.test(team), false, `the team block sizes in pixels:\n${team}`)
    assert.deepEqual([...html.matchAll(/\sstyle="/g)], [], 'the page carries inline styles')
  })

  it('scales them down inside their box at 375px and 414px, rather than overflowing it', async () => {
    for (const width of [375, 414]) {
      await freshLoad(site, width)
      const { cards, overflow } = await site.page.evaluate(CARDS)

      assert.equal(overflow, 0, `the page scrolls sideways at ${width}px`)
      for (const [index, card] of cards.entries()) {
        assert.ok(
          card.img.rect.width < TEAM_AVATAR_SIZE.width,
          `box ${index + 1}'s avatar is drawn at its full ${TEAM_AVATAR_SIZE.width}px at ${width}px`,
        )
        assert.ok(card.img.rect.left >= card.inner.left - 1, `box ${index + 1}'s avatar starts left of its box at ${width}px`)
        assert.ok(card.img.rect.right <= card.inner.right + 1, `box ${index + 1}'s avatar overflows its box at ${width}px`)
        assert.ok(
          Math.abs(card.img.rect.width - card.img.rect.height) < 1,
          `box ${index + 1}'s avatar is no longer square at ${width}px`,
        )
      }
    }
  })
})

describe('Team update task 6: the grid reflowing at the site\'s own breakpoints', () => {
  const site = servedInBrowser()

  /** The columns the grid runs at each width, and the wrapping that produces them. */
  const COLUMNS = [[320, 1], [375, 1], [414, 1], [768, 2], [1024, 3], [1280, 3]]

  for (const [width, columns] of COLUMNS) {
    it(`runs ${columns} column${columns === 1 ? '' : 's'} at ${width}px`, async () => {
      await freshLoad(site, width)
      const band = await site.page.evaluate(CARDS)

      assert.equal(band.display, 'grid', 'the avatar container is no longer a grid')
      assert.equal(band.columns, columns, `the grid runs ${band.columns} columns at ${width}px`)
      const rows = new Set(band.cards.map((card) => Math.round(card.rect.top)))
      assert.equal(rows.size, Math.ceil(band.cards.length / columns), `the boxes do not reflow into rows of ${columns}`)
    })
  }

  it('stacks the boxes one under the other at mobile widths, none beside another', async () => {
    await freshLoad(site, 375)
    const { cards } = await site.page.evaluate(CARDS)

    for (const [index, card] of cards.slice(1).entries()) {
      assert.ok(card.rect.top >= cards[index].rect.bottom, `box ${index + 2} sits beside box ${index + 1} at 375px`)
      assert.ok(Math.abs(card.rect.left - cards[index].rect.left) < 1, `box ${index + 2} is not aligned with the column`)
    }
  })

  it('reflows on the two breakpoints the rest of the site is built on, and adds none of its own', async () => {
    const css = await read(SERVICES_STYLESHEET)
    const widths = [...css.matchAll(/@media \(min-width: (\d+)px\)/g)].map(([, px]) => Number(px))
    const team = css.split(/\/\* Team page -+ \*\//).at(1).split(/\/\* [A-Z]/).at(0)

    assert.deepEqual([...new Set(widths)].sort((a, b) => a - b), [768, 1024])
    assert.equal(/@media/.test(team), false, `the team block declares a breakpoint of its own:\n${team}`)
    assert.equal(/grid-template-columns/.test(team), false, 'the team block overrides the shared grid\'s columns')
  })
})

describe('Team update task 7: the captions wrapping inside their boxes', () => {
  const site = servedInBrowser()

  it('wraps every caption inside its box at 375px, the two new ones included', async () => {
    await freshLoad(site, 375)
    const { cards } = await site.page.evaluate(CARDS)

    for (const [index, card] of cards.entries()) {
      assert.ok(
        card.title.scrollWidth <= card.title.clientWidth + 1,
        `box ${index + 1}'s caption overflows its box at 375px`,
      )
      assert.ok(card.title.left >= card.inner.left - 1, `box ${index + 1}'s caption starts left of its box at 375px`)
      assert.ok(card.title.right <= card.inner.right + 1, `box ${index + 1}'s caption runs past its box at 375px`)
    }
    const nino = cards[TEAM_ADDITIONS[1].position - 1]
    assert.equal(nino.caption, teamCaption(TEAM_ADDITIONS[1]))
    assert.ok(nino.title.lines > 1, '"Power BI and Data Analyst" is not wrapping at 375px')
  })

  it('breaks a caption too long to fit on one line rather than letting it out of the box', async () => {
    await freshLoad(site, 320)
    const measured = await site.page.evaluate(`
      const card = document.querySelectorAll('.team .services__grid > .card')[${TEAM_ADDITIONS[1].position - 1}]
      const title = card.querySelector('.card__title')
      const was = title.textContent
      // A caption with nowhere to break: the wrapping rules, not the spaces in
      // today's copy, are what has to keep it inside the box.
      title.textContent = 'Nino A — PowerBIandDataAnalyticsEngineering'
      const style = getComputedStyle(card)
      const inner = card.getBoundingClientRect().right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth)
      const result = {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        past: title.getBoundingClientRect().right - inner,
        scrollWidth: title.scrollWidth,
        clientWidth: title.clientWidth,
      }
      title.textContent = was
      return result
    `)

    assert.ok(measured.scrollWidth <= measured.clientWidth + 1, 'an unbreakable caption spills out of its box')
    assert.ok(measured.past <= 1, 'an unbreakable caption runs past the edge of its box')
    assert.equal(measured.overflow, 0, 'an unbreakable caption pushes the page sideways')
  })
})

describe('Team update task 8: the desktop layout, unchanged', () => {
  const site = servedInBrowser()

  it('draws the boxes at the same size and rhythm the home page\'s own grid draws them', async () => {
    await freshLoad(site, 1280)
    const team = await site.page.evaluate(CARDS)
    await site.page.goto(`${site.server.origin}/${HOMEPAGE}`)
    const home = await site.page.evaluate(`
      const grid = document.querySelector('#services .services__grid')
      const card = grid.children[0]
      const style = getComputedStyle(card)
      return {
        columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        gap: getComputedStyle(grid).rowGap,
        width: Math.round(card.getBoundingClientRect().width),
        padding: style.padding,
        radius: style.borderTopLeftRadius,
      }
    `)
    const card = team.cards[0]

    assert.equal(team.columns, home.columns, 'the team grid runs a different column count from the services grid')
    assert.equal(Math.round(card.rect.width), home.width, 'the team boxes are a different width from the services boxes')
  })

  it('leaves the shared grid and box rules exactly as they were', async () => {
    const css = await read(SERVICES_STYLESHEET)

    assert.equal(declaredValue(css, ['.services__grid'], 'display'), 'grid')
    assert.equal(declaredValue(css, ['.services__grid'], 'grid-template-columns'), 'repeat(3, 1fr)')
    assert.equal(declaredValue(css, ['.services__grid'], 'gap'), '18px')
    assert.equal(declaredValue(css, ['.card'], 'padding'), '26px 24px')
    assert.equal(declaredValue(css, ['.card'], 'border-radius'), '10px')
  })

  it('keeps the three-step border rotation the band was built with, the new boxes included', async () => {
    await freshLoad(site, 1280)
    const borders = await site.page.evaluate(`
      return [...document.querySelectorAll('.team .services__grid > .card')]
        .map((card) => getComputedStyle(card).borderTopColor)
    `)
    const css = await read(SERVICES_STYLESHEET)
    const shade = (name) => {
      const { r, g, b } = parseHex(declaredValue(css, [':root'], `--${name}`))
      return `rgb(${r}, ${g}, ${b})`
    }

    assert.deepEqual(borders, TEAM_BORDERS.map(shade))
  })
})

describe('Team update task 9: the page at every width, end to end', () => {
  const site = servedInBrowser()

  for (const width of [320, 375, 414, 768, 1280]) {
    it(`holds the band, the avatars and the captions inside the viewport at ${width}px`, async () => {
      await freshLoad(site, width)
      const band = await site.page.evaluate(CARDS)

      assert.equal(band.overflow, 0, `the page scrolls sideways at ${width}px`)
      for (const [index, card] of band.cards.entries()) {
        assert.ok(card.rect.width > 0 && card.rect.height > 0, `box ${index + 1} is not drawn at ${width}px`)
        assert.ok(card.rect.right <= band.viewport + 1, `box ${index + 1} runs past the viewport at ${width}px`)
        assert.ok(card.img.rect.right <= card.inner.right + 1, `box ${index + 1}'s avatar overflows it at ${width}px`)
        assert.ok(
          card.title.scrollWidth <= card.title.clientWidth + 1,
          `box ${index + 1}'s caption is clipped at ${width}px`,
        )
        assert.ok(
          card.title.top >= card.img.rect.bottom - 1,
          `box ${index + 1}'s caption overlaps its avatar at ${width}px`,
        )
        assert.ok(
          card.rect.bottom >= card.title.bottom - 1,
          `box ${index + 1}'s caption runs out of the bottom of it at ${width}px`,
        )
      }
      assert.deepEqual(site.page.failedRequests, [], `the page produced failed requests at ${width}px`)
      assert.deepEqual(site.page.pageErrors, [], `the page raised errors at ${width}px`)
    })
  }

  it('lays the band out in CSS alone: no script on the page, on any of the widths above', async () => {
    const html = await read(TEAM_PAGE)

    assert.equal(/<script\b/.test(html), false, 'the page carries a script')
    assert.equal(/<style\b/.test(html), false, 'the page carries a <style> block')
  })
})
