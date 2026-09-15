// Tests for the two team members put back on the Team page — "Oskar S" and
// "Slaw" — and for the twelve-person roster the page carries with them.
// Plan: specs/282a4e1c-1c11-4ac6-bb3c-31ade6a0bbde/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { openPage, serveStatic } from './browser.mjs'
import {
  BREAKPOINTS,
  SERVICES_STYLESHEET,
  TEAM_AVATAR_SIZE,
  TEAM_MEMBERS,
  TEAM_PAGE,
  TEAM_RESTORE_NOTES,
  TEAM_RESTORE_PLAN,
  TEAM_RESTORED,
  TEAM_ROSTER_BEFORE,
  read,
  repoRoot,
  siteFiles,
  teamCaption,
} from './site.mjs'

/** The section of this job's notes under the given `## n. Heading`, up to the next heading. */
const notesSection = async (heading) => {
  const notes = await read(TEAM_RESTORE_NOTES)
  return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
}

const git = (...args) => spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' })

/** The commit that added this job's plan — the page as it stood before any of this. */
const baselineCommit = () => {
  const added = git('log', '--diff-filter=A', '--format=%H', '--', TEAM_RESTORE_PLAN)
  return added.status === 0 && added.stdout.trim() ? added.stdout.trim().split('\n').at(-1) : null
}

/** A file as it stood in that commit, as text, or `null` when the ref is missing. */
const baseline = (file) => {
  const commit = baselineCommit()
  if (!commit) return null
  const show = git('show', `${commit}:${file}`)
  return show.status === 0 ? show.stdout : null
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
    cards: [...grid.children].map((card) => {
      const title = card.querySelector('.card__title')
      const img = card.querySelector('img')
      const style = getComputedStyle(card)
      return {
        tag: card.tagName.toLowerCase(),
        classes: [...card.classList],
        caption: title.textContent.replace(/\\s+/g, ' ').trim(),
        text: card.textContent.replace(/\\s+/g, ' ').trim(),
        rect: box(card),
        inner: {
          left: box(card).left + parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth),
          right: box(card).right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth),
        },
        title: Object.assign(box(title), { scrollWidth: title.scrollWidth, clientWidth: title.clientWidth }),
        img: {
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt'),
          width: img.getAttribute('width'),
          height: img.getAttribute('height'),
          natural: img.naturalWidth,
          rect: box(img),
        },
      }
    }),
  }
`

/** The `<li class="card">` blocks of the Team page's grid, in document order. */
const blocksIn = (html) => [...html.matchAll(/<li class="card">[\s\S]*?<\/li>/g)].map(([block]) => block)

const cardBlocks = async () => blocksIn(await read(TEAM_PAGE))

/**
 * A card's markup with the person in it written out — name, role and the slug of
 * their file — so two boxes only differ where their structure does.
 */
const structureOf = (block, { name, role, image }) =>
  block
    .split(image).join('SLUG')
    .split(`${name} — ${role}`).join('CAPTION')
    .split(name).join('NAME')

describe('Team restore task 1: the source located, and the ten as they stood', () => {
  it('writes down the file the list is driven from, and that it is markup rather than data', async () => {
    const discovery = await notesSection('Discovery')

    assert.ok(discovery, `${TEAM_RESTORE_NOTES} has no "Discovery" section`)
    assert.ok(discovery.includes(TEAM_PAGE), `the notes never name ${TEAM_PAGE} as the file the list lives in`)
    assert.ok(discovery.includes('<li class="card">'), 'the notes never say what one entry is written as')
    assert.match(discovery, /no (data file|build step)|not data-driven|no CMS/i, 'the notes never settle markup vs. data')
  })

  it('records the ten captions as the baseline, in the order they stood in', async () => {
    const discovery = await notesSection('Discovery')
    const positions = TEAM_ROSTER_BEFORE.map((member) => discovery.indexOf(teamCaption(member)))

    for (const [index, at] of positions.entries()) {
      assert.notEqual(at, -1, `the baseline never names "${teamCaption(TEAM_ROSTER_BEFORE[index])}"`)
      if (index > 0) {
        assert.ok(at > positions[index - 1], `the baseline lists "${teamCaption(TEAM_ROSTER_BEFORE[index])}" out of order`)
      }
    }
  })

  it('finds the list written into that page and nowhere else in the site', async () => {
    const files = (await siteFiles()).filter((file) => /\.(html|css|js|json|ya?ml)$/.test(file))
    const carrying = []

    for (const file of files) {
      // Comments out: the stylesheet quotes the longest caption in one, to
      // explain the wrap it accounts for. Quoting the list is not carrying it.
      const text = (await read(file)).replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, '')
      if (TEAM_ROSTER_BEFORE.some((member) => text.includes(teamCaption(member)))) carrying.push(file)
    }

    assert.deepEqual(carrying, [TEAM_PAGE], 'the team list is carried by more than the Team page')
    assert.deepEqual(
      files.filter((file) => /\.(json|ya?ml)$/.test(file) && file !== 'package.json'),
      [],
      'the site ships a data file the list could be driven from instead',
    )
  })

  it('had ten entries in that file before this job, and has twelve after it', async () => {
    const was = baseline(TEAM_PAGE)

    assert.equal((await cardBlocks()).length, TEAM_MEMBERS.length)
    assert.equal(TEAM_MEMBERS.length, 12, 'the roster this job restores is not twelve people')
    if (was === null) return // No history in this checkout to read the baseline from.
    assert.equal(blocksIn(was).length, TEAM_ROSTER_BEFORE.length, 'the page did not stand at ten entries')
  })
})

describe('Team restore task 2: the "existing placeholders" the request refers to', () => {
  it('writes down whether literal placeholder slots were there to fill', async () => {
    const found = await notesSection('The "existing placeholders"')

    assert.ok(found, `${TEAM_RESTORE_NOTES} has no "The \\"existing placeholders\\"" section`)
    assert.match(found, /no literal placeholder/i, 'the notes never say what the search for placeholder slots found')
    for (const member of TEAM_RESTORED) {
      assert.ok(found.includes(member.name), `the notes never say which slot ${member.name} was put in`)
    }
  })

  it('had no empty card, no commented-out entry and no slot named for either member', async () => {
    const was = baseline(TEAM_PAGE)

    if (was === null) return
    const comments = [...was.matchAll(/<!--[\s\S]*?-->/g)].map(([comment]) => comment).join('\n')
    for (const member of TEAM_RESTORED) {
      assert.equal(comments.includes(member.name), false, `${TEAM_PAGE} held a commented-out slot for ${member.name}`)
    }
    for (const [index, block] of blocksIn(was).entries()) {
      assert.match(block, /<img\b/, `box ${index + 1} was an empty placeholder card`)
      assert.match(block, /<h3 class="card__title">[^<]+<\/h3>/, `box ${index + 1} carried no caption`)
    }
  })

  it('carries none in the page as it stands either: every box is a person', async () => {
    const html = await read(TEAM_PAGE)
    const comments = [...html.matchAll(/<!--[\s\S]*?-->/g)].map(([comment]) => comment).join('\n')

    assert.equal(/<li class="card">\s*<\/li>/.test(html), false, `${TEAM_PAGE} carries an empty card`)
    assert.equal(/<!--[\s\S]*?<li class="card">/.test(comments), false, `${TEAM_PAGE} carries a commented-out entry`)
  })
})

/** The shared body of tasks 3 and 4: one restored entry, in the slot the roster gives it. */
const restored = (index) => {
  const member = TEAM_RESTORED[index]
  const site = servedInBrowser()

  it(`draws "${teamCaption(member)}" in box ${member.position}, and only there`, async () => {
    const { cards } = await site.page.evaluate(CARDS)

    assert.equal(cards.length, TEAM_MEMBERS.length, `the grid holds ${cards.length} boxes`)
    assert.equal(cards[member.position - 1].caption, teamCaption(member))
    assert.equal(
      cards.filter((card) => card.caption === teamCaption(member)).length,
      1,
      `"${teamCaption(member)}" is on the page more than once`,
    )
    assert.equal(cards[member.position - 1].text, teamCaption(member), 'the box carries copy beyond its caption')
  })

  it('stands behind the same placeholder silhouette every other box carries, in a file of its own', async () => {
    const { cards } = await site.page.evaluate(CARDS)
    const card = cards[member.position - 1]
    const [mine, theirs] = await Promise.all(
      [member.image, TEAM_MEMBERS[0].image].map((file) => readFile(join(repoRoot, file))),
    )

    assert.equal(card.img.src, member.image)
    assert.ok(card.img.natural > 0, `${member.image} never decoded`)
    assert.deepEqual(mine, theirs, `${member.image} is not the placeholder the rest of the grid carries`)
    assert.equal(card.img.width, String(TEAM_AVATAR_SIZE.width))
    assert.equal(card.img.height, String(TEAM_AVATAR_SIZE.height))
    assert.ok((await siteFiles()).includes(member.image), `${member.image} is not part of the site`)
  })

  it('names the person the box stands in for, and says the portrait is a placeholder', async () => {
    const { cards } = await site.page.evaluate(CARDS)
    const { alt } = cards[member.position - 1].img

    assert.ok(alt.includes(member.name), `the box is described as "${alt}", which does not name ${member.name}`)
    assert.match(alt, /placeholder/i, 'the alt text does not say the portrait is a placeholder')
  })

  it('is built out of the markup and the classes every other box is built out of', async () => {
    const { cards } = await site.page.evaluate(CARDS)
    const blocks = await cardBlocks()
    const mine = structureOf(blocks[member.position - 1], member)

    assert.equal(cards[member.position - 1].tag, 'li')
    assert.deepEqual(cards[member.position - 1].classes, ['card'])
    for (const [i, other] of TEAM_MEMBERS.entries()) {
      assert.equal(mine, structureOf(blocks[i], other), `box ${member.position} is built differently from box ${i + 1}`)
    }
  })
}

describe('Team restore task 3: Oskar S, Lead Engineer, at position 8', () => restored(0))

describe('Team restore task 4: Slaw, Lead Engineer and AI Lead, at position 9', () => restored(1))

describe('Team restore task 5: twelve entries, in the order the spec lists them', () => {
  const site = servedInBrowser()

  it('writes the twelve members in the roster\'s own order, one caption each', async () => {
    const { cards } = await site.page.evaluate(CARDS)

    assert.deepEqual(cards.map((card) => card.caption), TEAM_MEMBERS.map(teamCaption))
    for (const [index, card] of cards.entries()) {
      assert.equal(card.img.src, TEAM_MEMBERS[index].image, `box ${index + 1} carries the wrong file`)
    }
  })

  it('leaves the ten already on the page with the name, the role and the file they had', async () => {
    const { cards } = await site.page.evaluate(CARDS)

    for (const member of TEAM_ROSTER_BEFORE) {
      const drawn = cards.filter((card) => card.caption === teamCaption(member))

      assert.equal(drawn.length, 1, `"${teamCaption(member)}" is drawn ${drawn.length} times`)
      assert.equal(drawn[0].img.src, member.image, `${member.name} no longer carries ${member.image}`)
      assert.ok(drawn[0].img.alt.includes(member.name), `${member.name}'s box is no longer described as theirs`)
    }
    assert.equal(
      cards.length - TEAM_ROSTER_BEFORE.length,
      TEAM_RESTORED.length,
      'the page gained something other than the two entries this job adds',
    )
  })

  it('leaves their markup byte for byte as it was — only the order of three of them moves', async () => {
    const was = baseline(TEAM_PAGE)

    if (was === null) return
    const before = new Map(blocksIn(was).map((block, index) => [teamCaption(TEAM_ROSTER_BEFORE[index]), block]))
    const now = new Map(blocksIn(await read(TEAM_PAGE)).map((block, index) => [teamCaption(TEAM_MEMBERS[index]), block]))

    for (const [caption, block] of before) {
      assert.equal(now.get(caption), block, `"${caption}"'s box is not the one it was`)
    }
  })

  it('touches the page, the two placeholder files and nothing else the site ships', async () => {
    const commit = baselineCommit()

    if (commit === null) return
    const changed = []
    for (const file of await siteFiles()) {
      const was = spawnSync('git', ['show', `${commit}:${file}`], { cwd: repoRoot, maxBuffer: 1 << 28 })
      const now = await readFile(join(repoRoot, file))
      if (was.status !== 0 || !now.equals(was.stdout)) changed.push(file)
    }
    const shipped = new Set(await siteFiles())
    const gone = git('ls-tree', '-r', '--name-only', commit).stdout
      .split('\n')
      .filter((file) => file && !/^(specs|tests|\.github)\//.test(file))
      .filter((file) => !shipped.has(file))

    assert.deepEqual(
      changed.sort(),
      // `package.json` runs this job's test file alongside the rest; it is the
      // test runner's list, not a page of the site.
      ['package.json', TEAM_PAGE, ...TEAM_RESTORED.map((member) => member.image)].sort(),
      'this job changed a file outside the Team page and its two avatars',
    )
    assert.deepEqual(gone, [], 'a file the site shipped before this job is no longer there')
  })
})

describe('Team restore task 6: the page at every width the site supports', () => {
  const site = servedInBrowser()

  for (const width of BREAKPOINTS) {
    it(`draws all twelve boxes inside the viewport, unclipped and unoverlapped, at ${width}px`, async () => {
      await freshLoad(site, width)
      const band = await site.page.evaluate(CARDS)
      const columns = width >= 1024 ? 3 : width >= 768 ? 2 : 1

      assert.equal(band.overflow, 0, `the page scrolls sideways at ${width}px`)
      assert.equal(band.cards.length, TEAM_MEMBERS.length, `the grid holds ${band.cards.length} boxes at ${width}px`)
      assert.equal(band.columns, columns, `the grid runs ${band.columns} columns at ${width}px`)
      const rows = new Set(band.cards.map((card) => Math.round(card.rect.top)))
      assert.equal(rows.size, Math.ceil(band.cards.length / columns), `twelve boxes do not fill rows of ${columns}`)
      for (const [index, card] of band.cards.entries()) {
        assert.ok(card.rect.width > 0 && card.rect.height > 0, `box ${index + 1} is not drawn at ${width}px`)
        assert.ok(card.rect.right <= band.viewport + 1, `box ${index + 1} runs past the viewport at ${width}px`)
        assert.ok(card.img.rect.right <= card.inner.right + 1, `box ${index + 1}'s avatar overflows it at ${width}px`)
        assert.ok(card.img.natural > 0, `box ${index + 1}'s avatar never decoded at ${width}px`)
        assert.ok(
          card.title.scrollWidth <= card.title.clientWidth + 1,
          `box ${index + 1}'s caption is clipped at ${width}px`,
        )
        assert.ok(card.title.top >= card.img.rect.bottom - 1, `box ${index + 1}'s caption overlaps its avatar at ${width}px`)
        assert.ok(card.rect.bottom >= card.title.bottom - 1, `box ${index + 1}'s caption runs out of it at ${width}px`)
      }
    })
  }

  it('logs nothing, raises nothing and fails no request across those widths', async () => {
    for (const width of BREAKPOINTS) {
      await freshLoad(site, width)
    }

    assert.deepEqual(site.page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(site.page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(site.page.failedRequests, [], 'the page produced failed requests')
  })

  it('needed no styling of its own: the stylesheet is the one that was already there', async () => {
    const was = baseline(SERVICES_STYLESHEET)

    if (was === null) return
    assert.equal(await read(SERVICES_STYLESHEET), was, 'this job changed the shared stylesheet')
  })
})
