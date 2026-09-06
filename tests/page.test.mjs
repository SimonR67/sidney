import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  contrastRatio,
  isAqua,
  isBlack,
  isBlueTinted,
  isDarkBlue,
  isGold,
  isOrange,
  openPage,
  parseColor,
  serveStatic,
} from './browser.mjs'
import {
  BRANDING_NOTES,
  FLAGGED,
  OLD_SITE_NAME,
  SITE_NAME,
  fileAtCommit,
  isFlagged,
  oldNameOccurrences,
  readBrandingNotes,
  scanRepo,
  scannableFiles,
  scannableFilesAtCommit,
} from './branding.mjs'
import {
  PALETTE_NOTES,
  STYLING_SOURCES,
  greenOccurrences,
  hexLiterals,
  hexToRgb,
  isGreenish,
  readNotes,
  readSource,
  tableUnder,
} from './palette.mjs'
import { THEME, THEME_NOTES, pageFiles, readThemeNotes, stylingSources } from './theme.mjs'

const computed = (selector, props) => `
  const el = document.querySelector(${JSON.stringify(selector)});
  const style = getComputedStyle(el);
  return Object.fromEntries(${JSON.stringify(props)}.map((p) => [p, style.getPropertyValue(p)]));
`

const repoRoot = join(import.meta.dirname, '..')
const pageUrl = pathToFileURL(join(repoRoot, 'index.html')).href

let page

before(async () => {
  page = await openPage(pageUrl)
})

after(async () => {
  await page?.close()
})

describe('Task 1: semantic skeleton', () => {
  it('parses as a standards-mode HTML document', async () => {
    const doc = await page.evaluate(`
      return {
        doctype: document.doctype?.name ?? null,
        compatMode: document.compatMode,
        lang: document.documentElement.lang,
        hasBody: !!document.body,
      }
    `)
    assert.equal(doc.doctype, 'html')
    assert.equal(doc.compatMode, 'CSS1Compat', 'page should render in standards mode')
    assert.ok(doc.lang, '<html> should declare a lang attribute')
    assert.ok(doc.hasBody)
  })

  it(`declares a charset, a responsive viewport and the title "${SITE_NAME}"`, async () => {
    const head = await page.evaluate(`
      return {
        charset: document.characterSet,
        viewport: document.querySelector('meta[name="viewport"]')?.content ?? null,
        title: document.title,
      }
    `)
    assert.equal(head.charset, 'UTF-8')
    assert.match(head.viewport, /width=device-width/)
    assert.equal(head.title, SITE_NAME)
  })

  it('has a <header> holding a <nav>, plus a hero <section>', async () => {
    const structure = await page.evaluate(`
      const nav = document.querySelector('nav');
      return {
        headers: document.querySelectorAll('header').length,
        navs: document.querySelectorAll('nav').length,
        navInsideHeader: !!nav?.closest('header'),
        heroes: document.querySelectorAll('section.hero').length,
      }
    `)
    assert.equal(structure.headers, 1)
    assert.equal(structure.navs, 1)
    assert.equal(structure.navInsideHeader, true, '<nav> should live inside the <header>')
    assert.equal(structure.heroes, 1)
  })

  it('links the external styles.css and no other stylesheet', async () => {
    const sheets = await page.evaluate(`
      return [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href'));
    `)
    assert.deepEqual(sheets, ['styles.css'])
  })

  it('loads without console errors or failed requests', async () => {
    assert.deepEqual(page.pageErrors, [])
    assert.deepEqual(page.consoleMessages, [])
  })
})

describe('Task 2: navigation bar', () => {
  it('puts the <header> first inside <body>', async () => {
    const first = await page.evaluate('return document.body.firstElementChild.tagName')
    assert.equal(first, 'HEADER')
  })

  it(`shows the site name "${SITE_NAME}" as the nav brand`, async () => {
    const brand = await page.evaluate(`
      const el = document.querySelector('.site-nav__brand');
      return el ? { text: el.textContent.trim(), href: el.getAttribute('href') } : null;
    `)
    assert.ok(brand, 'nav should carry a brand element')
    assert.equal(brand.text, SITE_NAME)
    assert.ok(brand.href.startsWith('#'), `brand link should be a placeholder, got ${brand.href}`)
  })

  it('offers Home / About / Contact links, each pointing at its own page', async () => {
    const links = await page.evaluate(`
      return [...document.querySelectorAll('.site-nav__links a')].map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute('href'),
      }))
    `)
    assert.deepEqual(links, [
      { text: 'Home', href: 'index.html' },
      { text: 'About', href: 'about.html' },
      { text: 'Contact', href: 'contact.html' },
    ])
  })

  it('lays the nav out horizontally with the brand left of the links', async () => {
    const boxes = await page.evaluate(`
      const brand = document.querySelector('.site-nav__brand').getBoundingClientRect();
      const links = [...document.querySelectorAll('.site-nav__links a')].map((a) => a.getBoundingClientRect());
      return {
        brandRight: brand.right,
        brandTop: brand.top,
        first: { left: links[0].left, top: links[0].top },
        last: { left: links.at(-1).left, top: links.at(-1).top },
        sameRow: links.every((r) => Math.abs(r.top - links[0].top) < 1),
      }
    `)
    assert.ok(boxes.brandRight <= boxes.first.left, 'brand should sit to the left of the nav links')
    assert.ok(boxes.last.left > boxes.first.left, 'nav links should run left-to-right')
    assert.equal(boxes.sameRow, true, 'nav links should share one row on desktop')
  })

  it('renders the nav bar at the very top of the page', async () => {
    const nav = await page.evaluate(`
      const header = document.querySelector('.site-header').getBoundingClientRect();
      return { top: header.top, left: header.left, width: header.width, innerWidth: window.innerWidth };
    `)
    assert.ok(nav.top <= 0.5, `nav bar should start at the top of the page, got ${nav.top}`)
    assert.ok(nav.left <= 0.5)
    assert.ok(nav.width >= nav.innerWidth - 0.5, 'nav bar should span the full page width')
  })

  // The nav links now lead to their own pages; that walk is covered end to end
  // below. Here: the links that stay on this page must not move it.
  it('clicking the on-page links keeps the page on index.html and throws nothing', async () => {
    await page.reload()
    const result = await page.evaluate(`
      const before = location.pathname;
      for (const a of document.querySelectorAll('nav a[href^="#"]')) a.click();
      return { before, after: location.pathname, title: document.title };
    `)
    assert.equal(result.after, result.before)
    assert.equal(result.title, SITE_NAME)
    assert.deepEqual(page.pageErrors, [])
    assert.deepEqual(page.consoleMessages.filter((m) => m.type === 'error'), [])
  })
})

describe('Task 3: hero section', () => {
  it('places the hero directly after the header in document order', async () => {
    const order = await page.evaluate(`
      const header = document.querySelector('header');
      const hero = document.querySelector('section.hero');
      return {
        headerBeforeHero: !!(header.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING),
        heroInsideHeader: !!hero.closest('header'),
        heroInsideMain: !!hero.closest('main'),
      }
    `)
    assert.equal(order.headerBeforeHero, true)
    assert.equal(order.heroInsideHeader, false, 'hero should be a sibling of the nav bar, not nested in it')
    assert.equal(order.heroInsideMain, true)
  })

  it(`has a single <h1> reading "${SITE_NAME}" inside the hero`, async () => {
    const heading = await page.evaluate(`
      const h1s = document.querySelectorAll('h1');
      return {
        count: h1s.length,
        text: h1s[0]?.textContent.trim() ?? null,
        insideHero: !!h1s[0]?.closest('section.hero'),
      }
    `)
    assert.equal(heading.count, 1, 'the page should have exactly one <h1>')
    assert.equal(heading.text, SITE_NAME)
    assert.equal(heading.insideHero, true)
  })

  it('carries a subtitle and a placeholder call to action in the hero', async () => {
    const hero = await page.evaluate(`
      const tagline = document.querySelector('section.hero p');
      const cta = document.querySelector('section.hero a');
      return {
        tagline: tagline?.textContent.trim() ?? null,
        cta: cta ? { text: cta.textContent.trim(), href: cta.getAttribute('href') } : null,
      }
    `)
    assert.ok(hero.tagline && hero.tagline.length > 0, 'hero should carry a short subtitle')
    assert.ok(hero.cta, 'hero should carry a call-to-action link')
    assert.ok(hero.cta.text.length > 0)
    assert.ok(hero.cta.href.startsWith('#'), `CTA should be a placeholder link, got ${hero.cta.href}`)
  })
})

// The nav bar and the CTA keep the blue/orange they were given: the theme job
// that painted the page black left both out of scope. See docs/theme-notes.md.
describe('Task 4: black, gold and aqua colour scheme', () => {
  it('paints the page background black', async () => {
    const { 'background-color': body } = await page.evaluate(computed('body', ['background-color']))
    assert.ok(isBlack(parseColor(body)), `body background should be black, got ${body}`)
  })

  it('paints the nav bar dark blue with orange branding', async () => {
    const header = await page.evaluate(computed('.site-header', ['background-color']))
    const brand = await page.evaluate(computed('.site-nav__brand', ['color']))
    assert.ok(
      isDarkBlue(parseColor(header['background-color'])),
      `nav bar background should be dark blue, got ${header['background-color']}`,
    )
    assert.ok(isOrange(parseColor(brand.color)), `nav brand should be orange, got ${brand.color}`)
  })

  it('paints the hero black with a gold title', async () => {
    const hero = await page.evaluate(computed('section.hero', ['background-color']))
    const title = await page.evaluate(computed('h1', ['color']))
    assert.ok(
      isBlack(parseColor(hero['background-color'])),
      `hero background should be black, got ${hero['background-color']}`,
    )
    assert.ok(isGold(parseColor(title.color)), `h1 should be gold, got ${title.color}`)
  })

  it('gives the call to action an orange fill with dark blue text', async () => {
    const cta = await page.evaluate(computed('.hero__cta', ['background-color', 'color']))
    assert.ok(isOrange(parseColor(cta['background-color'])), `CTA fill should be orange, got ${cta['background-color']}`)
    assert.ok(isDarkBlue(parseColor(cta.color)), `CTA label should be dark blue, got ${cta.color}`)
    assert.ok(
      contrastRatio(parseColor(cta.color), parseColor(cta['background-color'])) >= 4.5,
      'CTA label should stay legible on its orange fill',
    )
  })

  it('keeps every nav and hero text colour legible against its own background', async () => {
    const samples = await page.evaluate(`
      const targets = ['.site-nav__brand', '.site-nav__links a', 'h1', '.hero__tagline'];
      const backdrop = (el) => {
        for (let node = el; node; node = node.parentElement) {
          const bg = getComputedStyle(node).backgroundColor;
          if (!/^rgba\\(.*,\\s*0\\)$/.test(bg)) return bg;
        }
        return 'rgb(255, 255, 255)';
      };
      return targets.map((sel) => {
        const el = document.querySelector(sel);
        return { sel, color: getComputedStyle(el).color, bg: backdrop(el) };
      });
    `)
    for (const sample of samples) {
      const ratio = contrastRatio(parseColor(sample.color), parseColor(sample.bg))
      assert.ok(ratio >= 4.5, `${sample.sel} contrast ${ratio.toFixed(2)}:1 is below 4.5:1`)
    }
  })

  it('uses no dominant colour outside the theme and the out-of-scope nav/CTA accents', async () => {
    const used = await page.evaluate(`
      const seen = new Set();
      for (const el of document.querySelectorAll('body, body *')) {
        const style = getComputedStyle(el);
        seen.add(style.color);
        const bg = style.backgroundColor;
        if (!/^rgba\\(.*,\\s*0\\)$/.test(bg)) seen.add(bg);
        for (const side of ['top', 'right', 'bottom', 'left']) {
          if (parseFloat(style.getPropertyValue('border-' + side + '-width')) > 0) {
            seen.add(style.getPropertyValue('border-' + side + '-color'));
          }
        }
      }
      return [...seen];
    `)
    const offPalette = used.filter((value) => {
      const color = parseColor(value)
      if (color.a === 0) return false
      // Greys/blacks/whites are neutral supporting tones; anything tinted must read as
      // theme gold or aqua, or as one of the blues/oranges the nav bar and CTA kept.
      const neutral = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b) < 24
      return !(neutral || isGold(color) || isAqua(color) || isBlueTinted(color) || isOrange(color))
    })
    assert.deepEqual(offPalette, [], 'only gold, aqua, blues, oranges and neutral greys should appear')
  })
})

const textSizes = `
  return [...document.querySelectorAll('body, body *')]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .map((el) => ({ text: el.textContent.trim().slice(0, 40), size: parseFloat(getComputedStyle(el).fontSize) }))
    .sort((a, b) => b.size - a.size);
`

describe(`Task 5: "${SITE_NAME}" as the visual focal point`, () => {
  it('renders the h1 as the largest text on the page by a clear margin', async () => {
    const sizes = await page.evaluate(textSizes)
    const h1Size = await page.evaluate("return parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)")
    assert.equal(sizes[0].text, SITE_NAME, `largest text should be the title, got "${sizes[0].text}"`)
    assert.equal(sizes[0].size, h1Size)
    assert.ok(
      h1Size > sizes[1].size * 2,
      `h1 (${h1Size}px) should be at least twice the next largest text "${sizes[1].text}" (${sizes[1].size}px)`,
    )
  })

  it('outsizes the nav bar text and the hero subtitle at least twofold', async () => {
    const sizes = await page.evaluate(`
      const size = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
      return {
        h1: size('h1'),
        brand: size('.site-nav__brand'),
        link: size('.site-nav__links a'),
        tagline: size('.hero__tagline'),
      }
    `)
    for (const [name, size] of Object.entries(sizes).filter(([name]) => name !== 'h1')) {
      assert.ok(sizes.h1 >= size * 2, `h1 (${sizes.h1}px) should be >=2x ${name} (${size}px)`)
    }
  })

  it('gives the title the strongest contrast of any text on the page', async () => {
    const samples = await page.evaluate(`
      const backdrop = (el) => {
        for (let node = el; node; node = node.parentElement) {
          const bg = getComputedStyle(node).backgroundColor;
          if (!/^rgba\\(.*,\\s*0\\)$/.test(bg)) return bg;
        }
        return 'rgb(255, 255, 255)';
      };
      return ['h1', '.hero__tagline', '.site-nav__brand', '.site-nav__links a'].map((sel) => {
        const el = document.querySelector(sel);
        return { sel, color: getComputedStyle(el).color, bg: backdrop(el) };
      });
    `)
    const ratio = (s) => contrastRatio(parseColor(s.color), parseColor(s.bg))
    const title = samples.find((s) => s.sel === 'h1')
    assert.ok(ratio(title) >= 4.5, `h1 contrast ${ratio(title).toFixed(2)}:1 is below 4.5:1`)
    for (const other of samples.filter((s) => s.sel !== 'h1' && s.sel !== '.hero__tagline')) {
      assert.ok(
        ratio(title) >= ratio(other),
        `h1 (${ratio(title).toFixed(2)}:1) should be at least as prominent as ${other.sel} (${ratio(other).toFixed(2)}:1)`,
      )
    }
  })

  it('sets the title as heavy display type with a tight line height', async () => {
    const title = await page.evaluate(computed('h1', ['font-weight', 'line-height', 'font-size']))
    assert.ok(Number(title['font-weight']) >= 700, `title should be bold, got ${title['font-weight']}`)
    const lineHeight = parseFloat(title['line-height']) / parseFloat(title['font-size'])
    assert.ok(lineHeight < 1.3, `title line-height ratio ${lineHeight.toFixed(2)} should be tight`)
  })

  it('centres the hero content block within the viewport', async () => {
    const box = await page.evaluate(`
      const inner = document.querySelector('.hero__inner').getBoundingClientRect();
      return { left: inner.left, right: inner.right, innerWidth: window.innerWidth };
    `)
    const slack = Math.abs(box.left - (box.innerWidth - box.right))
    assert.ok(slack < 2, `hero content should be horizontally centred (left ${box.left}, right gap ${box.innerWidth - box.right})`)
  })
})

describe('Task 6: responsive layout', () => {
  after(async () => {
    await page.setViewport(1280, 800)
  })

  for (const width of [1280, 375]) {
    describe(`at ${width}px`, () => {
      before(async () => {
        await page.setViewport(width, 800)
      })

      it('does not overflow horizontally', async () => {
        const metrics = await page.evaluate(`
          return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            widest: [...document.querySelectorAll('body, body *')]
              .map((el) => ({ tag: el.tagName + '.' + el.className, right: el.getBoundingClientRect().right }))
              .sort((a, b) => b.right - a.right)[0],
          }
        `)
        assert.ok(
          metrics.scrollWidth <= metrics.innerWidth,
          `horizontal overflow: scrollWidth ${metrics.scrollWidth} > viewport ${metrics.innerWidth} (widest: ${metrics.widest.tag} @ ${metrics.widest.right})`,
        )
      })

      it('stacks the nav bar above the hero without overlap', async () => {
        const boxes = await page.evaluate(`
          const nav = document.querySelector('.site-header').getBoundingClientRect();
          const hero = document.querySelector('section.hero').getBoundingClientRect();
          return { navBottom: nav.bottom, heroTop: hero.top, navHeight: nav.height, heroHeight: hero.height };
        `)
        assert.ok(boxes.navHeight > 0 && boxes.heroHeight > 0)
        assert.ok(
          boxes.navBottom <= boxes.heroTop + 0.5,
          `nav (bottom ${boxes.navBottom}) overlaps hero (top ${boxes.heroTop})`,
        )
      })

      it('keeps the whole <h1> inside the viewport, unclipped', async () => {
        const h1 = await page.evaluate(`
          const el = document.querySelector('h1');
          const rect = el.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            innerWidth: window.innerWidth,
            clipped: el.scrollWidth > el.clientWidth + 1,
          }
        `)
        assert.ok(h1.left >= 0, `h1 starts off-screen at ${h1.left}`)
        assert.ok(h1.right <= h1.innerWidth + 0.5, `h1 extends past the viewport (${h1.right} > ${h1.innerWidth})`)
        assert.equal(h1.clipped, false, 'h1 text is clipped by its own box')
      })

      it('keeps nav items on screen and non-overlapping', async () => {
        const overlaps = await page.evaluate(`
          const items = [...document.querySelectorAll('.site-nav__brand, .site-nav__links a')]
            .map((el) => ({ text: el.textContent.trim(), ...el.getBoundingClientRect().toJSON() }));
          const problems = items.filter((i) => i.left < 0 || i.right > window.innerWidth + 0.5).map((i) => i.text + ' off-screen');
          for (let a = 0; a < items.length; a++) {
            for (let b = a + 1; b < items.length; b++) {
              const x = items[a].left < items[b].right && items[b].left < items[a].right;
              const y = items[a].top < items[b].bottom && items[b].top < items[a].bottom;
              if (x && y) problems.push(items[a].text + ' overlaps ' + items[b].text);
            }
          }
          return problems;
        `)
        assert.deepEqual(overlaps, [])
      })

      it('lets the hero fill the viewport below the nav bar', async () => {
        const fill = await page.evaluate(`
          const header = document.querySelector('.site-header').getBoundingClientRect();
          const hero = document.querySelector('section.hero').getBoundingClientRect();
          return { heroHeight: hero.height, available: window.innerHeight - header.height, heroBottom: hero.bottom, innerHeight: window.innerHeight };
        `)
        assert.ok(
          fill.heroHeight >= fill.available - 0.5,
          `hero (${fill.heroHeight}px) should fill the space below the nav (${fill.available}px)`,
        )
        assert.ok(
          fill.heroBottom >= fill.innerHeight - 0.5,
          `hero should reach the bottom of the viewport (${fill.heroBottom} vs ${fill.innerHeight})`,
        )
      })

      it('keeps the hero and its call to action fully visible', async () => {
        const cta = await page.evaluate(`
          const el = document.querySelector('.hero__cta');
          const rect = el.getBoundingClientRect();
          return { left: rect.left, right: rect.right, height: rect.height, innerWidth: window.innerWidth };
        `)
        assert.ok(cta.height > 0, 'CTA should be visible at every width')
        assert.ok(cta.left >= 0 && cta.right <= cta.innerWidth + 0.5, 'CTA should stay within the viewport')
      })
    })
  }

  it('declares explicit media queries for the narrow breakpoint', async () => {
    // Chrome blocks cssRules access on file:// stylesheets, so read the source.
    const css = await readFile(join(repoRoot, 'styles.css'), 'utf8')
    const queries = [...css.matchAll(/@media\s*\(([^)]*)\)/g)].map((m) => m[1])
    assert.ok(queries.length > 0, 'styles.css should carry at least one media query')
    assert.ok(
      queries.some((q) => /max-width/.test(q)),
      `expected a max-width breakpoint, got ${JSON.stringify(queries)}`,
    )
  })

  it('stacks and centres the nav on a narrow viewport', async () => {
    await page.setViewport(375, 800)
    const nav = await page.evaluate(`
      const bar = document.querySelector('.site-nav').getBoundingClientRect();
      const brand = document.querySelector('.site-nav__brand').getBoundingClientRect();
      const links = document.querySelector('.site-nav__links').getBoundingClientRect();
      return {
        brandBottom: brand.bottom,
        linksTop: links.top,
        brandOffset: Math.abs((brand.left - bar.left) - (bar.right - brand.right)),
        linksOffset: Math.abs((links.left - bar.left) - (bar.right - links.right)),
      };
    `)
    assert.ok(
      nav.brandBottom <= nav.linksTop + 0.5,
      `at 375px the nav links (top ${nav.linksTop}) should drop below the brand (bottom ${nav.brandBottom})`,
    )
    assert.ok(nav.brandOffset < 2, `brand should be centred at 375px (off by ${nav.brandOffset}px)`)
    assert.ok(nav.linksOffset < 2, `nav links should be centred at 375px (off by ${nav.linksOffset}px)`)
  })

  it('keeps the brand and links side by side on a wide viewport', async () => {
    await page.setViewport(1280, 800)
    const inline = await page.evaluate(`
      const brand = document.querySelector('.site-nav__brand').getBoundingClientRect();
      const links = document.querySelector('.site-nav__links').getBoundingClientRect();
      return { brandRight: brand.right, linksLeft: links.left, sameRow: Math.abs(brand.top - links.top) < brand.height };
    `)
    assert.ok(inline.brandRight <= inline.linksLeft, 'brand should stay left of the links at 1280px')
    assert.equal(inline.sameRow, true)
  })
})

describe('Task 7: hover and focus states', () => {
  /** Reads `props` off `selector` with the given pseudo-classes forced on, then clears them. */
  const underState = async (selector, states, props) => {
    await page.forcePseudoState(selector, states)
    try {
      return await page.evaluate(computed(selector, props))
    } finally {
      await page.forcePseudoState(selector, [])
    }
  }

  for (const state of ['hover', 'focus']) {
    it(`shifts nav links to the orange accent on ${state}`, async () => {
      const rest = await page.evaluate(computed('.site-nav__links a', ['color']))
      const active = await underState('.site-nav__links a', [state], ['color'])
      assert.notEqual(active.color, rest.color, `nav link should change colour on ${state}`)
      assert.ok(isOrange(parseColor(active.color)), `${state} colour should stay orange, got ${active.color}`)
      const bg = await page.evaluate(computed('.site-header', ['background-color']))
      assert.ok(
        contrastRatio(parseColor(active.color), parseColor(bg['background-color'])) >= 4.5,
        `nav link ${state} colour should stay legible on the nav bar`,
      )
    })

    it(`brightens the call to action on ${state}`, async () => {
      const rest = await page.evaluate(computed('.hero__cta', ['background-color', 'color']))
      const active = await underState('.hero__cta', [state], ['background-color', 'color'])
      assert.notEqual(
        active['background-color'],
        rest['background-color'],
        `CTA fill should change on ${state}`,
      )
      assert.ok(
        isOrange(parseColor(active['background-color'])),
        `CTA ${state} fill should stay orange, got ${active['background-color']}`,
      )
      assert.ok(
        contrastRatio(parseColor(active.color), parseColor(active['background-color'])) >= 4.5,
        `CTA label should stay legible on its ${state} fill`,
      )
    })

    it(`leaves the brand link readable on ${state}`, async () => {
      const active = await underState('.site-nav__brand', [state], ['color'])
      const bg = await page.evaluate(computed('.site-header', ['background-color']))
      assert.ok(isOrange(parseColor(active.color)), `brand ${state} colour should be orange, got ${active.color}`)
      assert.ok(
        contrastRatio(parseColor(active.color), parseColor(bg['background-color'])) >= 4.5,
        `brand ${state} colour should stay legible on the nav bar`,
      )
    })
  }

  it('restores the resting styles once the state is released', async () => {
    const before = await page.evaluate(computed('.site-nav__links a', ['color']))
    await page.forcePseudoState('.site-nav__links a', ['hover'])
    await page.forcePseudoState('.site-nav__links a', [])
    const after = await page.evaluate(computed('.site-nav__links a', ['color']))
    assert.deepEqual(after, before)
  })

  it('declares the states in plain CSS, with no JavaScript involved', async () => {
    const css = await readFile(join(repoRoot, 'styles.css'), 'utf8')
    const html = await readFile(join(repoRoot, 'index.html'), 'utf8')
    assert.match(css, /:hover/, 'styles.css should declare :hover rules')
    assert.match(css, /:focus/, 'styles.css should declare :focus rules')
    assert.ok(!/<script/i.test(html), 'index.html should ship no <script> tags')
  })
})

describe('Task 8: works with JavaScript disabled', () => {
  it('ships no script tags, inline handlers or javascript: urls', async () => {
    const js = await page.evaluate(`
      const scripts = [...document.querySelectorAll('script')].map((s) => s.src || 'inline');
      const handlers = [...document.querySelectorAll('body, body *')]
        .flatMap((el) => [...el.attributes].map((a) => a.name))
        .filter((name) => name.startsWith('on'));
      const jsHrefs = [...document.querySelectorAll('[href], [src]')]
        .map((el) => el.getAttribute('href') || el.getAttribute('src'))
        .filter((v) => v.trim().toLowerCase().startsWith('javascript:'));
      return { scripts, handlers, jsHrefs };
    `)
    assert.deepEqual(js.scripts, [])
    assert.deepEqual(js.handlers, [])
    assert.deepEqual(js.jsHrefs, [])
  })

  it('renders identically with script execution disabled', async () => {
    const snapshot = `
      const rect = (sel) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
      };
      return {
        title: document.querySelector('h1').textContent.trim(),
        titleSize: getComputedStyle(document.querySelector('h1')).fontSize,
        titleColor: getComputedStyle(document.querySelector('h1')).color,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        navText: document.querySelector('nav').textContent.replace(/\\s+/g, ' ').trim(),
        tagline: document.querySelector('.hero__tagline').textContent.trim(),
        header: rect('.site-header'),
        hero: rect('section.hero'),
        h1: rect('h1'),
        cta: rect('.hero__cta'),
      };
    `
    const withJs = await page.evaluate(snapshot)
    await page.setScriptExecution(false)
    await page.reload()
    const withoutJs = await page.evaluate(snapshot)
    await page.setScriptExecution(true)

    assert.deepEqual(withoutJs, withJs, 'page should look the same with JavaScript disabled')
    assert.equal(withoutJs.title, SITE_NAME)
    assert.ok(withoutJs.h1.h > 0 && withoutJs.cta.h > 0, 'title and CTA should still render without JS')
    assert.deepEqual(page.pageErrors, [])
  })

  it('serves cleanly over http with no console noise or failed requests', async () => {
    const server = await serveStatic(repoRoot)
    const fresh = await openPage(`${server.origin}/index.html`)
    try {
      assert.deepEqual(fresh.pageErrors, [])
      assert.deepEqual(fresh.consoleMessages, [])
      assert.deepEqual(fresh.failedRequests, [])
      assert.deepEqual(
        fresh.requests.filter((url) => !url.startsWith(server.origin)),
        [],
        'page should make no off-origin requests',
      )

      // Click every link that stays on this page in turn and re-check after
      // each one. The nav links lead to their own pages and are walked
      // end to end further down.
      const links = await fresh.evaluate(`return document.querySelectorAll('a[href^="#"]').length`)
      for (let i = 0; i < links; i++) {
        await fresh.evaluate(`document.querySelectorAll('a[href^="#"]')[${i}].click(); return null;`)
        assert.deepEqual(fresh.pageErrors, [], `error after clicking link ${i}`)
        assert.deepEqual(fresh.consoleMessages, [], `console output after clicking link ${i}`)
      }
      assert.equal(await fresh.evaluate('return document.title'), SITE_NAME)
      assert.equal(await fresh.evaluate('return location.pathname'), '/index.html')
    } finally {
      await fresh.close()
      await server.close()
    }
  })
})

describe('Task 9: semantic and validity pass', () => {
  it('keeps the semantic landmark structure intact', async () => {
    const landmarks = await page.evaluate(`
      return {
        header: !!document.querySelector('body > header'),
        nav: !!document.querySelector('body > header > nav'),
        navLabel: document.querySelector('nav').getAttribute('aria-label'),
        main: !!document.querySelector('body > main'),
        hero: !!document.querySelector('body > main > section.hero'),
        emptyLinks: [...document.querySelectorAll('a')].filter((a) => !a.textContent.trim()).length,
        unlabelledHeadings: [...document.querySelectorAll('h1, h2, h3')].filter((h) => !h.textContent.trim()).length,
      }
    `)
    assert.equal(landmarks.header, true)
    assert.equal(landmarks.nav, true)
    assert.ok(landmarks.navLabel, '<nav> should be labelled')
    assert.equal(landmarks.main, true)
    assert.equal(landmarks.hero, true)
    assert.equal(landmarks.emptyLinks, 0, 'every link should have discernible text')
    assert.equal(landmarks.unlabelledHeadings, 0)
  })

  it('closes every non-void tag in index.html', async () => {
    const html = await readFile(join(repoRoot, 'index.html'), 'utf8')
    const voids = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
    const stack = []
    for (const [, closing, name, tail] of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)) {
      const tag = name.toLowerCase()
      if (voids.has(tag) || tail.trimEnd().endsWith('/')) continue
      if (closing) {
        assert.equal(stack.pop(), tag, `</${tag}> does not close the innermost open element`)
      } else {
        stack.push(tag)
      }
    }
    assert.deepEqual(stack, [], 'every opened element should be closed')
  })

  it('parses without the browser having to repair the markup', async () => {
    // Chrome's parser silently fixes bad nesting; comparing the source tag order
    // with the rendered tree catches anything it had to move or drop.
    const html = await readFile(join(repoRoot, 'index.html'), 'utf8')
    const sourceTags = [...html.matchAll(/<([a-zA-Z][\w-]*)[^>]*>/g)]
      .map((m) => m[1].toLowerCase())
      .filter((tag) => tag !== 'meta' && tag !== 'link')
    const domTags = await page.evaluate(`
      return [...document.querySelectorAll('*')]
        .map((el) => el.tagName.toLowerCase())
        .filter((tag) => tag !== 'meta' && tag !== 'link');
    `)
    assert.deepEqual(domTags, sourceTags, 'the DOM should match the markup as written')
  })

  it('uses unique ids and well-formed fragment links', async () => {
    const doc = await page.evaluate(`
      const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
      const fragments = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href'));
      return {
        ids,
        duplicates: ids.filter((id, i) => ids.indexOf(id) !== i),
        dangling: fragments.filter((h) => h.length > 1 && !document.getElementById(h.slice(1))),
      }
    `)
    assert.deepEqual(doc.duplicates, [], 'ids should be unique')
    assert.deepEqual(doc.dangling, [], 'every non-empty fragment link should resolve to an element')
  })

  it('uses the document outline correctly: one h1 and no skipped levels', async () => {
    const outline = await page.evaluate(`
      return [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1]));
    `)
    assert.deepEqual(outline.filter((level) => level === 1).length, 1)
    assert.equal(outline[0], 1, 'the first heading on the page should be the h1')
    outline.reduce((previous, level) => {
      assert.ok(level <= previous + 1, `heading level jumped from h${previous} to h${level}`)
      return level
    }, 1)
  })
})

describe('Palette task 1: green audit inventory', () => {
  it('documents every green occurrence with its file, line and structural role', async () => {
    const notes = await readNotes(repoRoot)
    const rows = tableUnder(notes, 'Audit inventory')
    assert.ok(rows, `${PALETTE_NOTES} should carry an "## Audit inventory" table`)
    assert.ok(rows.length > 0, 'the audit inventory should list at least one green occurrence')

    for (const row of rows) {
      assert.ok(
        STYLING_SOURCES.includes(row.file),
        `audit row points at "${row.file}", which is not one of ${STYLING_SOURCES.join(', ')}`,
      )
      assert.match(row.line, /^\d+$/, `audit row for ${row.file} should record a line number`)
      assert.ok(row.role.length > 0, `audit row ${row.file}:${row.line} should record a structural role`)
      assert.ok(
        row['original value'].length > 0,
        `audit row ${row.file}:${row.line} should record the original green value`,
      )
    }
  })

  it('records a green original value for every inventoried occurrence', async () => {
    const notes = await readNotes(repoRoot)
    for (const row of tableUnder(notes, 'Audit inventory') ?? []) {
      const original = row['original value'].replace(/`/g, '')
      const green = greenOccurrences(original)
      assert.ok(
        green.length > 0,
        `audit row ${row.file}:${row.line} records "${original}", which no green pattern matches`,
      )
    }
  })

  it('leaves no green in the styling sources that the inventory has not accounted for', async () => {
    const notes = await readNotes(repoRoot)
    const inventoried = new Set(
      (tableUnder(notes, 'Audit inventory') ?? []).map((row) => `${row.file}:${row['original value'].replace(/`/g, '')}`),
    )
    for (const file of STYLING_SOURCES) {
      const remaining = greenOccurrences(await readSource(repoRoot, file))
        .filter((hit) => !inventoried.has(`${file}:${hit.value}`))
      assert.deepEqual(
        remaining,
        [],
        `${file} carries green not listed in ${PALETTE_NOTES}: ${JSON.stringify(remaining)}`,
      )
    }
  })
})

describe('Palette task 2: the orange/blue palette', () => {
  it('names a token, a hex value and a role for every palette entry', async () => {
    const rows = tableUnder(await readNotes(repoRoot), 'Palette')
    assert.ok(rows, `${PALETTE_NOTES} should carry a "## Palette" table`)
    for (const row of rows) {
      assert.match(row.token, /^`--[a-z-]+`$/, `palette token "${row.token}" should be a CSS custom property`)
      assert.match(row.hex, /^`#[0-9a-f]{6}`$/, `palette entry ${row.token} should give a 6-digit hex, got ${row.hex}`)
      assert.ok(row.role.length > 0, `palette entry ${row.token} should describe its structural role`)
    }
  })

  it('holds only oranges and blues — no green survives in the palette', async () => {
    const rows = tableUnder(await readNotes(repoRoot), 'Palette')
    for (const row of rows) {
      const rgb = hexToRgb(row.hex.replace(/`/g, ''))
      assert.equal(isGreenish(rgb), false, `palette entry ${row.token} (${row.hex}) is still green`)
      assert.ok(
        isBlueTinted(rgb) || isOrange(rgb),
        `palette entry ${row.token} (${row.hex}) is neither blue nor orange`,
      )
    }
    const families = rows.map((row) => row.family.toLowerCase())
    assert.ok(families.includes('blue'), 'the palette should define at least one blue')
    assert.ok(families.includes('orange'), 'the palette should define at least one orange')
  })

  it('maps a palette hex onto every green colour value found in the audit', async () => {
    const notes = await readNotes(repoRoot)
    const palette = new Set(tableUnder(notes, 'Palette').map((row) => row.hex.replace(/`/g, '')))
    const audited = tableUnder(notes, 'Audit inventory')
      .filter((row) => /^`(#|%23)/.test(row['original value']))
    assert.ok(audited.length > 0, 'the audit should have turned up green colour values')
    for (const row of audited) {
      const replacement = row['new value'].replace(/`/g, '').replace(/^%23/, '#').toLowerCase()
      assert.ok(
        palette.has(replacement),
        `${row.file}:${row.line} maps to ${replacement}, which the palette table does not define`,
      )
    }
  })
})

const DISPOSITIONS = ['Replaced', 'Renamed', 'Skipped']

describe('Palette task 3: sign-off list of greens left alone', () => {
  it('gives every audited green a disposition', async () => {
    for (const row of tableUnder(await readNotes(repoRoot), 'Audit inventory')) {
      assert.ok(
        DISPOSITIONS.includes(row.disposition),
        `${row.file}:${row.line} has disposition "${row.disposition}", expected one of ${DISPOSITIONS.join('/')}`,
      )
    }
  })

  it('justifies every flagged category, including the ones found to be empty', async () => {
    const rows = tableUnder(await readNotes(repoRoot), 'Flagged')
    assert.ok(rows, `${PALETTE_NOTES} should carry a "## Flagged" sign-off table`)
    assert.ok(rows.length > 0, 'the sign-off list should enumerate the edge-case categories that were checked')
    for (const row of rows) {
      assert.ok(row.item.length > 0, 'every flagged row should name what was checked')
      assert.ok(row.location.length > 0, `flagged row "${row.item}" should say where`)
      assert.ok(
        ['None present', 'Left unchanged'].includes(row.status),
        `flagged row "${row.item}" has status "${row.status}"`,
      )
      assert.ok(row.reason.length > 20, `flagged row "${row.item}" needs a real justification, got "${row.reason}"`)
    }
  })

  it('backs every skipped audit entry with a flagged-list justification', async () => {
    const notes = await readNotes(repoRoot)
    const flagged = tableUnder(notes, 'Flagged')
    for (const row of tableUnder(notes, 'Audit inventory').filter((r) => r.disposition === 'Skipped')) {
      assert.ok(
        flagged.some((f) => f.location.includes(row.file)),
        `${row.file}:${row.line} is skipped but the sign-off list does not cover ${row.file}`,
      )
    }
  })
})

/** Every JSON/YAML config in the repo — anywhere a theme key or colour value could hide. */
const configFiles = async () => {
  const { readdir } = await import('node:fs/promises')
  const skip = /^(\.git|node_modules|specs|docs)\//
  return (await readdir(repoRoot, { recursive: true }))
    .map((name) => name.split('\\').join('/'))
    .filter((name) => /\.(json|ya?ml|toml|ini)$/.test(name) && !skip.test(name))
    .sort()
}

/** The `--token: #hex` pairs declared in the stylesheet's `:root` block. */
const rootTokens = (css) => {
  const root = css.match(/:root\s*\{([^}]*)\}/)
  assert.ok(root, 'styles.css should declare its palette in a :root block')
  return new Map(
    [...root[1].matchAll(/(--[a-z-]+)\s*:\s*(#[0-9a-fA-F]{3,6})/g)].map((m) => [m[1], m[2].toLowerCase()]),
  )
}

/** The green-named custom properties the site used to ship, per the audit's Renamed rows. */
const legacyTokens = (notes) => [
  ...new Set(
    tableUnder(notes, 'Audit inventory')
      .filter((row) => row.disposition === 'Renamed')
      .flatMap((row) => [...row.role.matchAll(/`(--[a-z-]+)`/g)].map((m) => m[1])),
  ),
]

/** Everything that could still name one of them — docs and specs record history on purpose. */
const CODE_FILES = ['styles.css', 'index.html', 'package.json', 'tests/browser.mjs', 'tests/page.test.mjs', 'tests/palette.mjs', 'tests/theme.mjs']

describe('Palette task 4: theme variables renamed off green', () => {
  it('declares each renamed token with its palette value, or records where the theme retired it', async () => {
    const notes = await readNotes(repoRoot)
    const palette = new Map(
      tableUnder(notes, 'Palette').map((row) => [row.token.replace(/`/g, ''), row.hex.replace(/`/g, '')]),
    )
    const renamed = new Set(
      tableUnder(notes, 'Audit inventory')
        .filter((row) => row.disposition === 'Renamed')
        .map((row) => row['new value'].replace(/`/g, '')),
    )
    assert.ok(renamed.size > 0, 'the audit should have turned up green-named tokens to rename')
    const declared = rootTokens(await readSource(repoRoot, 'styles.css'))
    const themeNotes = await readThemeNotes(repoRoot)
    for (const token of renamed) {
      // The black/gold/aqua theme retired --mist; anything it dropped has to say so.
      if (!declared.has(token)) {
        assert.ok(themeNotes.includes(token), `${token} has left :root without ${THEME_NOTES} accounting for it`)
        continue
      }
      assert.equal(declared.get(token), palette.get(token), `:root should declare ${token} as ${palette.get(token)}`)
    }
  })

  it('has no reference to the old green token names anywhere in the code', async () => {
    const stale = legacyTokens(await readNotes(repoRoot))
    assert.ok(stale.length > 0, 'the audit should name the tokens that were renamed')
    for (const file of CODE_FILES) {
      const text = await readSource(repoRoot, file)
      for (const token of stale) {
        assert.ok(!text.includes(token), `${file} still references the old token ${token}`)
      }
    }
  })

  it('resolves every var() reference to a declared custom property', async () => {
    const css = await readSource(repoRoot, 'styles.css')
    const declared = new Set([...css.matchAll(/^\s*(--[a-z-]+)\s*:/gm)].map((m) => m[1]))
    const used = [...css.matchAll(/var\(\s*(--[a-z-]+)/g)].map((m) => m[1])
    const dangling = [...new Set(used)].filter((name) => !declared.has(name))
    assert.deepEqual(dangling, [], 'every var() should point at a token declared in :root')
    const unused = [...declared].filter((name) => !used.includes(name))
    assert.deepEqual(unused, [], 'every declared token should still be used by a rule')
  })
})

describe('Palette task 5: no green left in the stylesheet', () => {
  it('declares exactly the tokens the current theme table defines', async () => {
    const declared = [...rootTokens(await readSource(repoRoot, 'styles.css'))]
    const themed = tableUnder(await readThemeNotes(repoRoot), 'Theme variables')
      .map((row) => [row.token.replace(/`/g, ''), row.hex.replace(/`/g, '')])
    assert.deepEqual(
      declared.sort(),
      themed.sort(),
      `the :root tokens should match ${THEME_NOTES} exactly, name and value`,
    )
  })

  it('keeps every palette token the theme still uses at the value the palette gave it', async () => {
    const declared = rootTokens(await readSource(repoRoot, 'styles.css'))
    const survivors = tableUnder(await readNotes(repoRoot), 'Palette')
      .map((row) => [row.token.replace(/`/g, ''), row.hex.replace(/`/g, '')])
      .filter(([token]) => declared.has(token))
    assert.ok(survivors.length > 0, 'the theme should have carried some palette tokens across unchanged')
    for (const [token, hex] of survivors) {
      assert.equal(declared.get(token), hex, `${token} should still be ${hex}, as ${PALETTE_NOTES} documents it`)
    }
  })

  it('matches no green pattern at all', async () => {
    const hits = greenOccurrences(await readSource(repoRoot, 'styles.css'))
    assert.deepEqual(hits, [], `styles.css still carries green: ${JSON.stringify(hits)}`)
  })

  it('hard-codes no colour outside the theme variables', async () => {
    const css = await readSource(repoRoot, 'styles.css')
    const themed = new Set(
      tableUnder(await readThemeNotes(repoRoot), 'Theme variables').map((row) => row.hex.replace(/`/g, '')),
    )
    const strays = hexLiterals(css).filter((hex) => !themed.has(hex))
    assert.deepEqual(strays, [], `every hex in styles.css should come from the ${THEME_NOTES} table`)
    // And they should all sit in :root: every rule below it names a colour by token.
    const rules = css.slice(css.indexOf('}', css.indexOf(':root')))
    assert.deepEqual(hexLiterals(rules), [], 'no rule should hard-code a colour outside the :root block')
  })
})

describe('Palette task 6: no green left in the markup', () => {
  it('matches no green pattern at all', async () => {
    const hits = greenOccurrences(await readSource(repoRoot, 'index.html'))
    assert.deepEqual(hits, [], `index.html still carries green: ${JSON.stringify(hits)}`)
  })

  it('draws every colour in the markup, inline styles included, from the palette', async () => {
    const html = await readSource(repoRoot, 'index.html')
    const palette = new Set(
      tableUnder(await readNotes(repoRoot), 'Palette').map((row) => row.hex.replace(/`/g, '')),
    )
    const strays = hexLiterals(html).filter((hex) => !palette.has(hex))
    assert.deepEqual(strays, [], 'every hex in index.html should come from the documented palette')
    for (const [, declarations] of html.matchAll(/\sstyle="([^"]*)"/g)) {
      assert.deepEqual(greenOccurrences(declarations), [], `inline style "${declarations}" still carries green`)
    }
  })

  // The favicon used to be required to match the page background. The theme job
  // that painted the page black puts non-CSS assets, favicons included, out of
  // scope — so the clash is now asserted to exist, and to be signed off.
  it('keeps the favicon exactly as the palette job drew it, clash and all', async () => {
    const href = await page.evaluate(`return document.querySelector('link[rel="icon"]')?.getAttribute('href') ?? ''`)
    const icon = decodeURIComponent(href)
    assert.match(icon, /^data:image\/svg\+xml,/, 'the favicon should stay an inline SVG data URI')
    const bodyBg = await page.evaluate("return getComputedStyle(document.body).backgroundColor")
    const [background, accent] = hexLiterals(icon)
    assert.ok(isDarkBlue(hexToRgb(background)), `favicon background should still be dark blue, got ${background}`)
    assert.ok(isOrange(hexToRgb(accent)), `favicon accent should still be orange, got ${accent}`)
    assert.notDeepEqual(
      hexToRgb(background),
      parseColor(bodyBg),
      'if the favicon has been brought back in line with the page, drop it from the sign-off list',
    )
    const flagged = tableUnder(await readThemeNotes(repoRoot), 'Flagged — left unchanged, for reviewer sign-off')
      .find((row) => /favicon/i.test(row.item))
    assert.ok(flagged, `${THEME_NOTES} should sign off the favicon it deliberately left clashing`)
    assert.equal(flagged.status, 'Left unchanged')
  })
})

describe('Palette task 7: theme and config files', () => {
  it('carries no green key or value in any JSON/YAML config', async () => {
    const configs = await configFiles()
    assert.ok(configs.length > 0, 'the repo should have at least one config file to check')
    for (const file of configs) {
      const hits = greenOccurrences(await readSource(repoRoot, file))
      assert.deepEqual(hits, [], `${file} still carries green: ${JSON.stringify(hits)}`)
    }
  })

  it('leaves every JSON config parseable', async () => {
    for (const file of (await configFiles()).filter((name) => name.endsWith('.json'))) {
      const text = await readSource(repoRoot, file)
      assert.doesNotThrow(() => JSON.parse(text), `${file} should still be valid JSON`)
    }
  })
})

describe('Palette task 8: served output reflects the new palette', () => {
  it('has no build step and no checked-in output directory to regenerate', async () => {
    const { access } = await import('node:fs/promises')
    const manifest = JSON.parse(await readSource(repoRoot, 'package.json'))
    assert.deepEqual(Object.keys(manifest.scripts), ['test'], 'the site ships with no build script')
    assert.equal(manifest.dependencies, undefined)
    assert.equal(manifest.devDependencies, undefined)
    for (const dir of ['_site', 'dist', 'build', 'out', 'public']) {
      await assert.rejects(
        access(join(repoRoot, dir)),
        `${dir}/ exists — built output would need regenerating alongside the source`,
      )
    }
  })

  it('serves the two source files byte for byte, theme and all', async () => {
    const server = await serveStatic(repoRoot)
    try {
      for (const file of STYLING_SOURCES) {
        const served = await (await fetch(`${server.origin}/${file}`)).text()
        assert.equal(served, await readSource(repoRoot, file), `${file} should be served exactly as written`)
        assert.deepEqual(greenOccurrences(served), [], `the served ${file} still carries green`)
      }
      const css = await (await fetch(`${server.origin}/styles.css`)).text()
      for (const row of tableUnder(await readThemeNotes(repoRoot), 'Theme variables')) {
        assert.ok(css.includes(row.hex.replace(/`/g, '')), `served CSS should carry ${row.token}`)
      }
    } finally {
      await server.close()
    }
  })
})

/** Everything about an element except its colours: geometry, box model, type, content. */
const LAYOUT_SNAPSHOT = `
  const round = (n) => Math.round(n * 100) / 100;
  return {
    title: document.title,
    text: document.body.textContent.replace(/\\s+/g, ' ').trim(),
    elements: [...document.querySelectorAll('body, body *')].map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      const box = (prefix, sides) => sides.map((side) => s.getPropertyValue(prefix + side));
      return {
        tag: el.tagName,
        className: el.className,
        own: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim(),
        rect: [round(r.x), round(r.y), round(r.width), round(r.height)],
        layout: [s.display, s.position, s.flexDirection, s.flexWrap, s.justifyContent, s.alignItems, s.flex, s.gap],
        margin: box('margin-', ['top', 'right', 'bottom', 'left']),
        padding: box('padding-', ['top', 'right', 'bottom', 'left']),
        borderWidth: box('border-', ['top-width', 'right-width', 'bottom-width', 'left-width']),
        type: [s.fontFamily, s.fontSize, s.fontWeight, s.lineHeight, s.letterSpacing, s.textTransform, s.textDecorationLine],
        misc: [s.borderRadius, s.overflowWrap, s.textAlign, s.minHeight, s.maxWidth, s.boxSizing],
      };
    }),
  };
`

/** Just the colours, so the two renders can be shown to actually differ. */
const COLOUR_SNAPSHOT = `
  return [...document.querySelectorAll('body, body *')]
    .map((el) => { const s = getComputedStyle(el); return [s.color, s.backgroundColor, s.borderBottomColor].join('|') });
`

const git = async (...args) => {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const { stdout } = await promisify(execFile)('git', args, { cwd: repoRoot, maxBuffer: 1 << 22 })
  return stdout
}

/** The commit this branch forked from, or null when the base branch is not available locally. */
const baseCommit = async () => {
  for (const ref of ['main', 'origin/main']) {
    try {
      return (await git('merge-base', 'HEAD', ref)).trim()
    } catch {}
  }
  return null
}

/** Checks the pre-change site out into a temp directory and returns its file:// URL. */
const checkoutBase = async (commit) => {
  const { mkdtemp, writeFile } = await import('node:fs/promises')
  const { tmpdir } = await import('node:os')
  const dir = await mkdtemp(join(tmpdir(), 'betamax-before-'))
  for (const file of STYLING_SOURCES) {
    await writeFile(join(dir, file), await git('show', `${commit}:${file}`))
  }
  return { dir, url: pathToFileURL(join(dir, 'index.html')).href }
}

/**
 * True once a later change has edited the markup this spot-check was written
 * against — the layout comparison below only means anything while the two
 * renders share their markup.
 */
const markupChangedSinceBase = async () => {
  const commit = await baseCommit()
  if (!commit) return false
  return (await git('show', `${commit}:index.html`)) !== (await readSource(repoRoot, 'index.html'))
}

describe('Palette task 9: before/after spot-check', () => {
  let previous
  let baseDir

  before(async () => {
    const commit = await baseCommit()
    if (!commit) return
    const checkout = await checkoutBase(commit)
    baseDir = checkout.dir
    previous = await openPage(checkout.url)
  })

  after(async () => {
    await previous?.close()
    if (baseDir) {
      const { rm } = await import('node:fs/promises')
      await rm(baseDir, { recursive: true, force: true })
    }
  })

  for (const width of [1280, 375]) {
    it(`shows only colour differences at ${width}px — no layout, type or content shift`, async (t) => {
      if (!previous) return t.skip('base branch not available locally; cannot render the previous version')
      if (await markupChangedSinceBase()) {
        return t.skip('superseded: index.html has gained page imagery and page links since the palette swap')
      }
      await previous.setViewport(width, 800)
      await page.setViewport(width, 800)
      await page.reload()
      assert.deepEqual(await page.evaluate(LAYOUT_SNAPSHOT), await previous.evaluate(LAYOUT_SNAPSHOT))
      await page.setViewport(1280, 800)
    })
  }

  it('does repaint the page — the two renders differ in colour and only in colour', async (t) => {
    if (!previous) return t.skip('base branch not available locally; cannot render the previous version')
    const [now, then] = [await page.evaluate(COLOUR_SNAPSHOT), await previous.evaluate(COLOUR_SNAPSHOT)]
    assert.notDeepEqual(now, then, 'the palette swap should have changed the rendered colours')
    const greens = then.join('|').split('|').map(parseColor).filter(isGreenish)
    assert.ok(greens.length > 0, 'the previous version should have rendered green')
    assert.deepEqual(
      now.join('|').split('|').map(parseColor).filter(isGreenish),
      [],
      'nothing on the page should still render green',
    )
  })

  it('keeps every line of text readable on the colours it now sits on', async () => {
    const samples = await page.evaluate(`
      const backdrop = (el) => {
        for (let node = el; node; node = node.parentElement) {
          const bg = getComputedStyle(node).backgroundColor;
          if (!/^rgba\\(.*,\\s*0\\)$/.test(bg)) return bg;
        }
        return 'rgb(255, 255, 255)';
      };
      return [...document.querySelectorAll('body, body *')]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
        .map((el) => ({
          text: el.textContent.trim().slice(0, 24),
          color: getComputedStyle(el).color,
          bg: backdrop(el),
        }));
    `)
    assert.ok(samples.length > 0)
    for (const sample of samples) {
      const ratio = contrastRatio(parseColor(sample.color), parseColor(sample.bg))
      assert.ok(ratio >= 4.5, `"${sample.text}" reads at ${ratio.toFixed(2)}:1 against ${sample.bg}`)
    }
  })
})

describe('Test plan: end-to-end walkthrough', () => {
  after(async () => {
    await page.setViewport(1280, 800)
  })

  for (const width of [1280, 375]) {
    it(`renders the whole page correctly at ${width}px, straight from the filesystem`, async () => {
      await page.setViewport(width, 900)
      await page.reload()
      const state = await page.evaluate(`
        const header = document.querySelector('.site-header');
        const hero = document.querySelector('section.hero');
        const h1 = document.querySelector('h1');
        const sizes = [...document.querySelectorAll('body, body *')]
          .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
          .map((el) => ({ text: el.textContent.trim().slice(0, 40), size: parseFloat(getComputedStyle(el).fontSize) }))
          .sort((a, b) => b.size - a.size);
        return {
          protocol: location.protocol,
          navTop: header.getBoundingClientRect().top,
          navBeforeHero: !!(header.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING),
          biggest: sizes[0],
          runnerUp: sizes[1],
          bodyBg: getComputedStyle(document.body).backgroundColor,
          h1Color: getComputedStyle(h1).color,
          overflow: document.documentElement.scrollWidth > window.innerWidth,
          title: document.title,
        }
      `)
      assert.equal(state.protocol, 'file:', 'the page should work as a plain static file')
      assert.ok(state.navTop <= 0.5, 'nav bar should sit at the very top of the page')
      assert.equal(state.navBeforeHero, true)
      assert.equal(state.biggest.text, SITE_NAME, `"${SITE_NAME}" should be the largest text on the page`)
      assert.ok(
        state.biggest.size > state.runnerUp.size * 2,
        `h1 (${state.biggest.size}px) should be at least twice the next largest text (${state.runnerUp.size}px)`,
      )
      assert.ok(isBlack(parseColor(state.bodyBg)), `body background should be black, got ${state.bodyBg}`)
      assert.ok(isGold(parseColor(state.h1Color)), `h1 should be gold, got ${state.h1Color}`)
      assert.ok(contrastRatio(parseColor(state.h1Color), parseColor(state.bodyBg)) >= 4.5)
      assert.equal(state.overflow, false)
      assert.equal(state.title, SITE_NAME)
      assert.deepEqual(page.pageErrors, [])
    })
  }

  it('introduces no scripts or build tooling', async () => {
    const { readdir } = await import('node:fs/promises')
    const root = (await readdir(repoRoot)).filter((name) => !name.startsWith('.'))
    // The three pages, their images and the stylesheet, plus the test harness,
    // specs and docs. Nothing that has to be compiled or generated.
    assert.deepEqual(root.sort(), [
      'about.html',
      'contact.html',
      'docs',
      'images',
      'index.html',
      'package.json',
      'specs',
      'styles.css',
      'tests',
    ])
  })
})

const SITE_NOTES = join('docs', 'site-structure-notes.md')

/** The three pages this job adds, with the image each one shows. */
const PAGES = [
  {
    label: 'Home',
    file: 'index.html',
    image: 'File1767.jpg',
    driveId: '1oyhTHrmOxstMLB2effg1rHVcPlnWwWBh',
  },
  {
    label: 'About',
    file: 'about.html',
    image: 'City_Eclipse.jpeg',
    driveId: '1uHmN3zpaBs5KNzmMiyaHf-8qK_vjiAFU',
  },
  {
    label: 'Contact',
    file: 'contact.html',
    image: 'Orion18032022-for-lightroom.jpg',
    driveId: '1F1ZgT2L17IGYOh5ujqQWksdvQZdwNJXQ',
  },
]

describe('Pages task 1: site architecture findings', () => {
  it('records the architecture type, the page files and any duplicate sections found', async () => {
    const notes = await readSource(repoRoot, SITE_NOTES)
    assert.match(notes, /^## Architecture$/m, `${SITE_NOTES} should carry an "## Architecture" section`)
    assert.match(notes, /^## Page and nav files$/m, `${SITE_NOTES} should carry a "## Page and nav files" section`)
    assert.match(notes, /^## Duplicate pages$/m, `${SITE_NOTES} should carry a "## Duplicate pages" section`)
    assert.match(notes, /static multi-page/i, 'the architecture finding should name the site type')
    for (const file of ['index.html', 'about.html', 'contact.html', 'styles.css']) {
      assert.ok(notes.includes(file), `${SITE_NOTES} should record where ${file} lives`)
    }
  })
})

/** One static server for the multi-page tests below: the site as it is deployed. */
let site

before(async () => {
  site = await serveStatic(repoRoot)
})

after(async () => {
  await site?.close()
})

/** The attributes of the first `<img>` in `html` whose `src` is `src`, or null. */
const imgWithSrc = (html, src) => {
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    const attrs = Object.fromEntries(
      [...tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
    )
    if (attrs.src === src) return attrs
  }
  return null
}

describe('Pages task 2: image assets', () => {
  for (const { image, driveId } of PAGES) {
    it(`ships images/${image} as a real, non-empty JPEG`, async () => {
      let bytes
      try {
        bytes = await readFile(join(repoRoot, 'images', image))
      } catch {
        assert.fail(
          `images/${image} is missing: it could not be downloaded from Google Drive id ${driveId} ` +
            '(the file is not publicly shared and this environment has no Drive credentials). ' +
            'See images/README.md — no placeholder has been substituted.',
        )
      }
      assert.ok(bytes.length > 1024, `images/${image} is only ${bytes.length} bytes — the download did not produce an image`)
      assert.equal(
        bytes.subarray(0, 3).toString('hex'),
        'ffd8ff',
        `images/${image} is not JPEG data — a Drive sign-in/error page was saved instead of the image`,
      )
    })
  }
})

// Tasks 3-5: one page per nav item, each independently reachable and each
// carrying its own image. `/` is the Home route; the other two are files.
const ROUTES = { 'index.html': '/', 'about.html': '/about.html', 'contact.html': '/contact.html' }

PAGES.forEach(({ label, file, image }, index) => {
  describe(`Pages task ${index + 3}: ${label} page`, () => {
    it(`serves the ${label} page at ${ROUTES[file]} with a 200`, async () => {
      const response = await fetch(`${site.origin}${ROUTES[file]}`)
      assert.equal(response.status, 200, `${ROUTES[file]} should be reachable on its own`)
      const html = await response.text()
      assert.match(html, /<!DOCTYPE html>/i, `${file} should be a complete HTML document`)
    })

    it(`shows ${image} with descriptive alt text`, async () => {
      const html = await (await fetch(`${site.origin}${ROUTES[file]}`)).text()
      const img = imgWithSrc(html, `images/${image}`)
      assert.ok(img, `${file} should carry an <img src="images/${image}">`)
      assert.ok(img.alt?.trim().length >= 10, `the ${label} image needs a descriptive alt attribute, got "${img.alt}"`)
    })

    it(`shows only its own image, not another page's`, async () => {
      const html = await (await fetch(`${site.origin}${ROUTES[file]}`)).text()
      const others = PAGES.filter((p) => p.image !== image).map((p) => p.image)
      for (const other of others) {
        assert.equal(imgWithSrc(html, `images/${other}`), null, `${file} should not also show ${other}`)
      }
      assert.equal((html.match(/<img\b/g) ?? []).length, 1, `${file} should show exactly one image`)
    })
  })
})

const NAV_LINKS = [
  { text: 'Home', href: 'index.html' },
  { text: 'About', href: 'about.html' },
  { text: 'Contact', href: 'contact.html' },
]

describe('Pages task 6: navigation menu', () => {
  for (const { label, file } of PAGES) {
    it(`renders exactly the three menu links on the ${label} page`, async () => {
      const rendered = await openPage(`${site.origin}${ROUTES[file]}`)
      try {
        const nav = await rendered.evaluate(`
          return {
            links: [...document.querySelectorAll('.site-nav__links a')].map((a) => ({
              text: a.textContent.trim(),
              href: a.getAttribute('href'),
            })),
            anchorsInNav: document.querySelectorAll('nav a').length,
            navs: document.querySelectorAll('nav').length,
          }
        `)
        assert.deepEqual(nav.links, NAV_LINKS, `the ${label} nav should list Home, About and Contact once each`)
        assert.equal(nav.navs, 1, 'each page should carry a single nav')
        assert.equal(nav.anchorsInNav, NAV_LINKS.length + 1, 'the nav should hold the three links plus the brand')
      } finally {
        await rendered.close()
      }
    })
  }
})

describe('Pages task 7: routing', () => {
  it('resolves every nav link on every page to a served page, never a 404', async () => {
    for (const { label, file } of PAGES) {
      const base = `${site.origin}${ROUTES[file]}`
      const html = await (await fetch(base)).text()
      const hrefs = [...html.matchAll(/<a[^>]*href="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((href) => !href.startsWith('#'))
      assert.deepEqual(hrefs, NAV_LINKS.map((link) => link.href), `unexpected off-page links on ${label}`)
      for (const href of hrefs) {
        const response = await fetch(new URL(href, base))
        assert.equal(response.status, 200, `${label} → ${href} should resolve, not 404`)
        assert.match(response.headers.get('content-type'), /text\/html/, `${href} should be served as HTML`)
      }
    }
  })

  it('needs no routing configuration: every route is a file served from the repo root', async () => {
    const { access } = await import('node:fs/promises')
    for (const { file } of PAGES) {
      await access(join(repoRoot, file))
    }
    // A static site with no build step has nothing to register; anything below
    // would be a rewrite layer that could drift from the files on disk.
    for (const config of ['.htaccess', 'routes.js', 'next.config.js', 'vercel.json', 'netlify.toml']) {
      await assert.rejects(access(join(repoRoot, config)), `${config} exists — routing would need registering there too`)
    }
    assert.equal((await fetch(`${site.origin}/nope.html`)).status, 404, 'the server should still 404 on unknown paths')
  })
})

describe('Pages task 8: responsive page images', () => {
  it('declares the responsive rule in plain CSS', async () => {
    const css = await readSource(repoRoot, 'styles.css')
    const rule = css.match(/\.page-image\s*\{([^}]*)\}/)
    assert.ok(rule, 'styles.css should carry a .page-image rule')
    assert.match(rule[1], /max-width:\s*100%/, '.page-image should be capped at the width of its container')
    assert.match(rule[1], /height:\s*auto/, '.page-image should keep its aspect ratio')
  })

  for (const { label, file } of PAGES) {
    for (const width of [1280, 375]) {
      it(`keeps the ${label} image inside a ${width}px viewport`, async () => {
        const rendered = await openPage(`${site.origin}${ROUTES[file]}`, { width, height: 800 })
        try {
          const layout = await rendered.evaluate(`
            const img = document.querySelector('.page-image');
            const rect = img.getBoundingClientRect();
            const style = getComputedStyle(img);
            return {
              maxWidth: style.maxWidth,
              left: rect.left,
              right: rect.right,
              innerWidth: window.innerWidth,
              scrollWidth: document.documentElement.scrollWidth,
              parentWidth: img.parentElement.getBoundingClientRect().width,
            }
          `)
          assert.equal(layout.maxWidth, '100%', `the ${label} image should cap at its container's width`)
          assert.ok(layout.left >= 0, `the ${label} image starts off-screen at ${layout.left}`)
          assert.ok(
            layout.right <= layout.innerWidth + 0.5,
            `the ${label} image runs past the viewport (${layout.right} > ${layout.innerWidth})`,
          )
          assert.ok(
            layout.right - layout.left <= layout.parentWidth + 0.5,
            `the ${label} image is wider than its container`,
          )
          assert.ok(
            layout.scrollWidth <= layout.innerWidth,
            `the ${label} page overflows horizontally at ${width}px (${layout.scrollWidth} > ${layout.innerWidth})`,
          )
        } finally {
          await rendered.close()
        }
      })
    }
  }
})

const ACTIVE_NAV_PATTERN = /aria-current|is-active|nav__link--active|\.active\b/

describe('Pages task 9: active nav styling', () => {
  it('is not applicable — the site had no active-nav pattern to extend', async (t) => {
    const commit = await baseCommit()
    if (!commit) return t.skip('base branch not available locally; cannot read the pre-change site')
    for (const file of STYLING_SOURCES) {
      const before = await git('show', `${commit}:${file}`)
      assert.equal(
        ACTIVE_NAV_PATTERN.test(before),
        false,
        `${file} already marked the current nav item — the pattern should then have been extended, not skipped`,
      )
    }
    const notes = await readSource(repoRoot, SITE_NOTES)
    assert.match(notes, /^## Active nav styling$/m, `${SITE_NOTES} should record the finding`)
    assert.match(notes, /not applicable/i, 'the finding should say the task does not apply')
    t.skip('no pre-existing active-nav pattern to extend')
  })
})

describe('Pages task 10: one canonical page per section', () => {
  it('keeps exactly one page file per nav item, with no leftovers', async () => {
    const { readdir } = await import('node:fs/promises')
    const onDisk = (await readdir(repoRoot)).filter((name) => name.endsWith('.html')).sort()
    assert.deepEqual(onDisk, ['about.html', 'contact.html', 'index.html'])
  })

  it('had nothing to consolidate — the site was a single page before this change', async (t) => {
    const commit = await baseCommit()
    if (!commit) return t.skip('base branch not available locally; cannot list the pre-change pages')
    const tracked = (await git('ls-tree', '-r', '--name-only', commit))
      .split('\n')
      .filter((name) => name.endsWith('.html'))
    assert.deepEqual(tracked, ['index.html'], 'the pre-change site should have held a single page')
    const notes = await readSource(repoRoot, SITE_NOTES)
    assert.match(notes, /^## Duplicate pages$/m, `${SITE_NOTES} should record the finding`)
    assert.match(notes, /none found/i, 'the finding should say no duplicates existed')
  })
})

/** Everything a visitor should be able to tell about the page they are on. */
const VISITOR_STATE = `
  const img = document.querySelector('.page-image');
  return {
    path: location.pathname,
    title: document.title,
    heading: document.querySelector('h1').textContent.trim(),
    image: img?.getAttribute('src') ?? null,
    alt: img?.getAttribute('alt') ?? null,
    images: document.querySelectorAll('img').length,
    loaded: !!img && img.complete && img.naturalWidth > 0,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  };
`

/** Clicks the nav link labelled `label` and waits for `expectedPath` to finish loading. */
const clickNav = async (visitor, label, expectedPath) => {
  await visitor.evaluate(`
    const label = ${JSON.stringify(label)};
    const link = [...document.querySelectorAll('.site-nav__links a')].find((a) => a.textContent.trim() === label);
    if (!link) throw new Error('no nav link labelled ' + label);
    link.click();
    return null;
  `)
  for (let i = 0; i < 100; i++) {
    try {
      const state = await visitor.evaluate('return { path: location.pathname, ready: document.readyState }')
      if (state.path === expectedPath && state.ready === 'complete') return
    } catch {
      // The execution context goes away mid-navigation; try again.
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  assert.fail(`clicking "${label}" never landed on ${expectedPath}`)
}

const WALK = [
  { label: 'About', path: '/about.html', heading: 'About', title: `About — ${SITE_NAME}`, image: 'images/City_Eclipse.jpeg' },
  { label: 'Contact', path: '/contact.html', heading: 'Contact', title: `Contact — ${SITE_NAME}`, image: 'images/Orion18032022-for-lightroom.jpg' },
  { label: 'Home', path: '/index.html', heading: SITE_NAME, title: SITE_NAME, image: 'images/File1767.jpg' },
]

describe('Pages test plan: end-to-end walk of the three pages', () => {
  for (const width of [1280, 375]) {
    it(`walks Home → About → Contact → Home at ${width}px, one distinct page per click`, async () => {
      const visitor = await openPage(`${site.origin}/`, { width, height: 800 })
      try {
        const home = await visitor.evaluate(VISITOR_STATE)
        assert.equal(home.path, '/', 'the walk should start on the Home route')
        assert.equal(home.image, 'images/File1767.jpg')
        assert.equal(home.images, 1, 'Home should show its own image and no other')
        assert.equal(home.overflow, false, `Home overflows horizontally at ${width}px`)

        for (const step of WALK) {
          await clickNav(visitor, step.label, step.path)
          const state = await visitor.evaluate(VISITOR_STATE)
          assert.equal(state.path, step.path, `"${step.label}" should lead to its own URL`)
          assert.equal(state.title, step.title)
          assert.equal(state.heading, step.heading, `${step.label} should show only its own content`)
          assert.equal(state.image, step.image, `${step.label} should show only its own image`)
          assert.ok(state.alt.trim().length >= 10, `${step.label}'s image needs descriptive alt text`)
          assert.equal(state.images, 1, `${step.label} should show exactly one image`)
          assert.equal(state.overflow, false, `${step.label} overflows horizontally at ${width}px`)
        }
        assert.deepEqual(visitor.pageErrors, [], 'the walk should raise no page errors')
      } finally {
        await visitor.close()
      }
    })
  }

  it('loads all three images, with no broken image and no failed request', async () => {
    for (const { label, file, image } of PAGES) {
      const visitor = await openPage(`${site.origin}${ROUTES[file]}`)
      try {
        const state = await visitor.evaluate(VISITOR_STATE)
        assert.equal(state.image, `images/${image}`)
        assert.ok(state.loaded, `the ${label} image (images/${image}) did not load — see images/README.md`)
        assert.deepEqual(visitor.failedRequests, [], `${file} made a request that failed`)
        assert.deepEqual(visitor.consoleMessages, [], `${file} logged console output`)
      } finally {
        await visitor.close()
      }
    }
  })

  it('never 404s: every page and image the site references is served', async () => {
    for (const { file } of PAGES) {
      const base = `${site.origin}${ROUTES[file]}`
      const html = await (await fetch(base)).text()
      const targets = [...html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)]
        .map((m) => m[1])
        .filter((target) => !target.startsWith('data:'))
      assert.ok(targets.length > 0)
      for (const target of targets) {
        const response = await fetch(new URL(target, base))
        assert.equal(response.status, 200, `${file} references ${target}, which is not served`)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Branding: the site is renamed to "Sid Meyer - Brave New Worlds". Text only —
// every one of these tests guards a string, none of them a layout rule.
// ---------------------------------------------------------------------------

const BRANDING_DISPOSITIONS = new Set(['Updated', 'Flagged'])

describe('Branding task 1: rename inventory', () => {
  it('records every occurrence of the old name with its file, line and role', async () => {
    const notes = await readBrandingNotes(repoRoot)
    const rows = tableUnder(notes, 'Audit inventory')
    assert.ok(rows, `${BRANDING_NOTES} should carry an "## Audit inventory" table`)
    for (const row of rows) {
      assert.ok(row.file, 'every inventory row should name a file')
      assert.ok(row.line, `${row.file}: every inventory row should give a line`)
      assert.ok(row.occurrence, `${row.file}: every inventory row should quote the occurrence`)
      assert.ok(row.role, `${row.file}: every inventory row should say what the occurrence does`)
      assert.ok(
        BRANDING_DISPOSITIONS.has(row.disposition),
        `${row.file}:${row.line} has disposition "${row.disposition}", expected one of ${[...BRANDING_DISPOSITIONS].join('/')}`,
      )
    }
  })

  it('leaves no occurrence in the pre-change repo that the inventory has not accounted for', async (t) => {
    const commit = await baseCommit()
    if (!commit) return t.skip('base branch not available locally; cannot read the pre-change repo')
    const rows = tableUnder(await readBrandingNotes(repoRoot), 'Audit inventory')
    const inventoried = new Set(
      rows.flatMap((row) =>
        row.line
          .split(',')
          .flatMap((part) => {
            const [from, to] = part.trim().split('-').map(Number)
            return to ? Array.from({ length: to - from + 1 }, (_, i) => from + i) : [from]
          })
          .map((line) => `${row.file}:${line}`),
      ),
    )
    for (const file of await scannableFilesAtCommit(repoRoot, commit)) {
      const before = await fileAtCommit(repoRoot, commit, file)
      for (const occurrence of oldNameOccurrences(before)) {
        assert.ok(
          inventoried.has(`${file}:${occurrence.line}`),
          `${file}:${occurrence.line} carried "${occurrence.value}" before the rename but is not in the inventory`,
        )
      }
    }
  })

  it('categorises every flagged occurrence as an internal identifier, not branding', async () => {
    const rows = tableUnder(await readBrandingNotes(repoRoot), 'Audit inventory')
    const flagged = rows.filter((row) => row.disposition === 'Flagged')
    assert.ok(flagged.length > 0, 'the inventory should record what the rename deliberately left alone')
    for (const row of flagged) {
      assert.ok(
        FLAGGED.some((entry) => entry.file === row.file),
        `${row.file}:${row.line} is flagged but is not one of the exceptions the sweep allows`,
      )
    }
  })
})

/** Every page, with the exact title its tab should show. */
const BRANDED_PAGES = [
  { file: 'index.html', route: '/', title: SITE_NAME },
  { file: 'about.html', route: '/about.html', title: `About — ${SITE_NAME}` },
  { file: 'contact.html', route: '/contact.html', title: `Contact — ${SITE_NAME}` },
]

const titleOf = (html) => html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null

describe('Branding task 2: page titles', () => {
  for (const { file, route, title } of BRANDED_PAGES) {
    it(`serves ${file} with the title "${title}"`, async () => {
      const html = await (await fetch(`${site.origin}${route}`)).text()
      assert.equal(titleOf(html), title)
    })

    it(`renders that title in the browser on ${route}`, async () => {
      const visitor = await openPage(`${site.origin}${route}`)
      try {
        assert.equal(await visitor.evaluate('return document.title'), title)
      } finally {
        await visitor.close()
      }
    })
  }

  it('keeps the "{Page} — {site}" pattern the site already used', async () => {
    for (const { file, route } of BRANDED_PAGES) {
      const rendered = titleOf(await (await fetch(`${site.origin}${route}`)).text())
      const matches = rendered === SITE_NAME || rendered.endsWith(` — ${SITE_NAME}`)
      assert.ok(matches, `${file} titles the tab "${rendered}", which does not carry "${SITE_NAME}"`)
      assert.ok(!new RegExp(OLD_SITE_NAME, 'i').test(rendered), `${file} still titles the tab "${rendered}"`)
    }
  })
})

describe('Branding task 3: header and nav brand', () => {
  for (const { file, route } of BRANDED_PAGES) {
    it(`reads "${SITE_NAME}" in ${file}'s header`, async () => {
      const visitor = await openPage(`${site.origin}${route}`)
      try {
        const header = await visitor.evaluate(`
          const brand = document.querySelector('.site-nav__brand');
          return {
            brand: brand?.textContent.trim() ?? null,
            header: document.querySelector('.site-header').textContent.replace(/\\s+/g, ' ').trim(),
          };
        `)
        assert.equal(header.brand, SITE_NAME)
        assert.ok(
          !new RegExp(OLD_SITE_NAME, 'i').test(header.header),
          `${file}'s header still reads "${header.header}"`,
        )
      } finally {
        await visitor.close()
      }
    })
  }

  it('spells the brand identically on all three pages', async () => {
    const brands = []
    for (const { route } of BRANDED_PAGES) {
      const html = await (await fetch(`${site.origin}${route}`)).text()
      brands.push(html.match(/<a class="site-nav__brand"[^>]*>([^<]*)<\/a>/)?.[1] ?? null)
    }
    assert.deepEqual(brands, BRANDED_PAGES.map(() => SITE_NAME))
  })
})

/** The `## Branding surfaces checked and found empty` table, keyed by surface. */
const emptySurfaces = async () => {
  const rows = tableUnder(await readBrandingNotes(repoRoot), 'Branding surfaces checked and found empty')
  assert.ok(rows, `${BRANDING_NOTES} should carry a "## Branding surfaces checked and found empty" table`)
  return rows
}

const carriesOldName = (text) => new RegExp(OLD_SITE_NAME, 'i').test(text)

describe('Branding task 4: footer branding', () => {
  it('has no footer to rename, and records that finding', async () => {
    for (const { file, route } of BRANDED_PAGES) {
      const html = await (await fetch(`${site.origin}${route}`)).text()
      assert.equal(/<footer\b/i.test(html), false, `${file} has grown a footer this test has not been told about`)
    }
    const footer = (await emptySurfaces()).find((row) => /footer/i.test(row.surface))
    assert.ok(footer, `${BRANDING_NOTES} should record that the site has no footer`)
    assert.match(footer.status, /none present/i)
  })

  it('would catch an old-name footer on any page', async () => {
    for (const { file, route } of BRANDED_PAGES) {
      const html = await (await fetch(`${site.origin}${route}`)).text()
      const text = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1]
      if (!text) continue
      assert.ok(text.includes(SITE_NAME), `${file}'s footer should read "${SITE_NAME}"`)
      assert.equal(carriesOldName(text), false, `${file}'s footer still carries the old name`)
    }
  })
})

/** The meta tags that carry a site's name when a site declares them. */
const BRANDING_META = [
  'description',
  'application-name',
  'apple-mobile-web-app-title',
  'og:title',
  'og:site_name',
  'og:description',
  'twitter:title',
  'twitter:description',
]

/** Every `<meta>` in `html`, as `{ key, content }` — `key` is its name or property. */
const metaTags = (html) =>
  [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => {
    const attrs = Object.fromEntries(
      [...m[0].matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)].map((a) => [a[1].toLowerCase(), a[2]]),
    )
    return { key: attrs.name ?? attrs.property ?? attrs.charset ?? Object.keys(attrs)[0], content: attrs.content ?? '' }
  })

describe('Branding task 5: meta tags', () => {
  it('carries the new name in every branding-bearing meta tag it declares', async () => {
    for (const { file, route } of BRANDED_PAGES) {
      const html = await (await fetch(`${site.origin}${route}`)).text()
      for (const tag of metaTags(html)) {
        if (!BRANDING_META.includes(tag.key.toLowerCase())) continue
        assert.ok(
          tag.content.includes(SITE_NAME),
          `${file}'s <meta ${tag.key}> reads "${tag.content}", which does not name the site`,
        )
      }
    }
  })

  it('leaves the old name in no meta tag on any page', async () => {
    for (const { file, route } of BRANDED_PAGES) {
      const html = await (await fetch(`${site.origin}${route}`)).text()
      for (const tag of metaTags(html)) {
        assert.equal(carriesOldName(tag.content), false, `${file}'s <meta ${tag.key}> still reads "${tag.content}"`)
      }
    }
  })

  it('declares no branding-bearing meta tag today, and records that finding', async () => {
    for (const { file, route } of BRANDED_PAGES) {
      const html = await (await fetch(`${site.origin}${route}`)).text()
      const keys = metaTags(html).map((tag) => tag.key.toLowerCase())
      assert.deepEqual(keys, ['utf-8', 'viewport'], `${file} declares meta tags this audit has not covered`)
    }
    const meta = (await emptySurfaces()).find((row) => /meta/i.test(row.surface))
    assert.ok(meta, `${BRANDING_NOTES} should record that no meta tag carries the site name`)
    assert.match(meta.status, /none present/i)
  })
})

describe('Branding task 6: README', () => {
  it('has no README naming the site under its old name', async () => {
    const { readdir } = await import('node:fs/promises')
    for (const dir of ['.', 'docs', 'images']) {
      for (const name of await readdir(join(repoRoot, dir))) {
        if (!/^readme\.md$/i.test(name)) continue
        const text = await readSource(repoRoot, join(dir, name))
        assert.equal(carriesOldName(text), false, `${dir}/${name} still names the site "${OLD_SITE_NAME}"`)
        if (dir === '.') {
          assert.ok(text.includes(SITE_NAME), `${name} should introduce the site as "${SITE_NAME}"`)
        }
      }
    }
  })

  it('has no root README to retitle, and records that finding', async () => {
    const { readdir } = await import('node:fs/promises')
    const root = await readdir(repoRoot)
    assert.equal(root.some((name) => /^readme\.md$/i.test(name)), false)
    const readme = (await emptySurfaces()).find((row) => /readme/i.test(row.surface))
    assert.ok(readme, `${BRANDING_NOTES} should record that the repo has no README`)
    assert.match(readme.status, /none present/i)
  })
})

describe('Branding task 7: package.json', () => {
  it('describes the package by the new site name', async () => {
    const pkg = JSON.parse(await readSource(repoRoot, 'package.json'))
    assert.ok(pkg.description.includes(SITE_NAME), `package.json describes the site as "${pkg.description}"`)
    assert.equal(carriesOldName(pkg.description), false)
  })

  it('slugs the package name off the new site name', async () => {
    const pkg = JSON.parse(await readSource(repoRoot, 'package.json'))
    assert.equal(carriesOldName(pkg.name), false, `package.json is still named "${pkg.name}"`)
    assert.equal(pkg.name, SITE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  })

  it('renames nothing the tooling depends on', async () => {
    const pkg = JSON.parse(await readSource(repoRoot, 'package.json'))
    // The name is safe to change only because nothing resolves the package by it:
    // it is private, has no dependencies and is never imported or installed.
    assert.equal(pkg.private, true, 'the package is private — it is never published under its name')
    assert.equal(pkg.dependencies, undefined)
    assert.equal(pkg.devDependencies, undefined)
    assert.equal(pkg.scripts.test, 'node --test tests/page.test.mjs', 'the test script should still run the suite by path')
    for (const file of await scannableFiles(repoRoot)) {
      if (file === 'package.json') continue
      const text = await readSource(repoRoot, file)
      assert.equal(
        new RegExp(String.raw`(from|require\(|npx|npm (i|install|run) )\s*['"]?${pkg.name}\b`).test(text),
        false,
        `${file} resolves the package by name — renaming it would break that reference`,
      )
    }
  })
})

describe('Branding task 8: repo-wide sweep', () => {
  it('leaves the old name nowhere outside the flagged exceptions', async () => {
    const remaining = (await scanRepo(repoRoot)).filter((occurrence) => !isFlagged(occurrence.file, occurrence))
    assert.deepEqual(
      remaining.map((occurrence) => `${occurrence.file}:${occurrence.line} — ${occurrence.text}`),
      [],
    )
  })

  it('keeps every flagged exception real — none of them is stale', async () => {
    const found = await scanRepo(repoRoot)
    for (const entry of FLAGGED) {
      assert.ok(
        found.some((occurrence) => occurrence.file === entry.file && occurrence.text.includes(entry.snippet)),
        `${entry.file} no longer carries "${entry.snippet}" — drop it from the flagged list`,
      )
    }
  })

  it('names the site consistently everywhere it does appear', async () => {
    const misspelled = []
    for (const file of await scannableFiles(repoRoot)) {
      const text = await readSource(repoRoot, file)
      for (const [index, line] of text.split('\n').entries()) {
        // The one spelling that counts: same words, same spacing, same hyphen.
        for (const [near] of line.matchAll(/Sid\s+Meyer[^<"`|]*/g)) {
          if (near.startsWith(SITE_NAME)) continue
          misspelled.push(`${file}:${index + 1} — ${near.trim()}`)
        }
      }
    }
    assert.deepEqual(misspelled, [])
  })
})

describe('Branding task 9: branding baked into graphics', () => {
  it('ships no image asset that carries the site name in its filename', async () => {
    for (const file of (await scannableFiles(repoRoot)).concat(await (async () => {
      const { readdir } = await import('node:fs/promises')
      return (await readdir(join(repoRoot, 'images'))).map((name) => join('images', name))
    })())) {
      assert.equal(carriesOldName(file), false, `${file} is named after the old branding`)
    }
  })

  it('has no wordmark baked into the favicon — it is plain shapes, not text', async () => {
    for (const { file, route } of BRANDED_PAGES) {
      const html = await (await fetch(`${site.origin}${route}`)).text()
      const icon = decodeURIComponent(html.match(/<link\s+rel="icon"\s+href="([^"]*)"/s)?.[1] ?? '')
      assert.ok(icon.startsWith('data:image/svg+xml,'), `${file} should still declare its inline SVG favicon`)
      assert.equal(
        /<text|<tspan|<textPath/i.test(icon),
        false,
        `${file}'s favicon now has text baked in — flag it for redraw instead of renaming it here`,
      )
    }
  })

  it('signs off every occurrence it left alone, with a reason', async () => {
    const notes = await readBrandingNotes(repoRoot)
    const rows = tableUnder(notes, 'Flagged — left unchanged, for reviewer sign-off')
    assert.ok(rows, `${BRANDING_NOTES} should carry a "## Flagged — left unchanged, for reviewer sign-off" table`)
    for (const row of rows) {
      assert.ok(row.item, 'every flagged row should name the item')
      assert.ok(row.location, `${row.item}: every flagged row should give a location`)
      assert.match(row.status, /left unchanged/i)
      assert.ok(row.reason.length > 20, `${row.item}: every flagged row should say why it was left alone`)
    }
    for (const entry of FLAGGED) {
      assert.ok(
        rows.some((row) => row.location.includes(entry.file)),
        `${entry.file} is skipped by the sweep but not signed off in ${BRANDING_NOTES}`,
      )
    }
    const logo = (await emptySurfaces()).find((row) => /logo|wordmark/i.test(row.surface))
    assert.ok(logo, `${BRANDING_NOTES} should record whether any logo graphic carries the name`)
    assert.match(logo.status, /none present/i)
  })
})

// ---------------------------------------------------------------------------
// Theme: black page background, gold headings, aqua body text.
// (specs/dccfae81-4d05-4206-9959-224ae7058bcc/plan.md)
// ---------------------------------------------------------------------------

describe('Theme task 1: styling-source inventory', () => {
  it('lists every page in the repo, with the styling each one loads', async () => {
    const notes = await readThemeNotes(repoRoot)
    const rows = tableUnder(notes, 'Pages and their styling')
    assert.ok(rows, `${THEME_NOTES} should carry a "## Pages and their styling" table`)
    assert.deepEqual(
      rows.map((row) => row.page.replace(/`/g, '')).sort(),
      await pageFiles(repoRoot),
      'the inventory should account for every page in the repo, and no others',
    )
  })

  it('records, for each page, the stylesheet and inline styling it actually carries', async () => {
    const rows = tableUnder(await readThemeNotes(repoRoot), 'Pages and their styling')
    for (const row of rows) {
      const page = row.page.replace(/`/g, '')
      const actual = stylingSources(await readSource(repoRoot, page))
      assert.deepEqual(
        row.stylesheet.replace(/`/g, '').split(',').map((s) => s.trim()).filter(Boolean),
        actual.stylesheets,
        `${page} links ${JSON.stringify(actual.stylesheets)}, which is not what the inventory records`,
      )
      assert.equal(
        row['style blocks'],
        String(actual.styleBlocks.length),
        `${page} carries ${actual.styleBlocks.length} <style> blocks`,
      )
      assert.equal(
        row['style attributes'],
        String(actual.styleAttributes.length),
        `${page} carries ${actual.styleAttributes.length} style="" attributes`,
      )
    }
  })

  it('lists every stylesheet the pages load as a styling source, and no phantom ones', async () => {
    const notes = await readThemeNotes(repoRoot)
    const sources = tableUnder(notes, 'Styling sources')
    assert.ok(sources, `${THEME_NOTES} should carry a "## Styling sources" table`)
    for (const row of sources) {
      assert.ok(row.role.length > 0, `styling source ${row.file} should say what it does`)
    }
    const listed = new Set(sources.map((row) => row.file.replace(/`/g, '')))
    const loaded = new Set()
    for (const page of await pageFiles(repoRoot)) {
      for (const href of stylingSources(await readSource(repoRoot, page)).stylesheets) loaded.add(href)
    }
    assert.ok(loaded.size > 0, 'the site should load at least one stylesheet')
    for (const href of loaded) {
      assert.ok(listed.has(href), `${href} is loaded by a page but is not in the styling-source inventory`)
    }
  })

  it('renders each inventoried page in the browser, confirming styles.css applied', async () => {
    for (const page of await pageFiles(repoRoot)) {
      const rendered = await openPage(`${site.origin}/${page}`)
      try {
        const applied = await rendered.evaluate(`
          return {
            sheets: [...document.styleSheets].map((s) => (s.href ?? 'inline').split('/').pop()),
            styleBlocks: document.querySelectorAll('style').length,
            styled: [...document.querySelectorAll('[style]')].map((el) => el.getAttribute('style')),
          }
        `)
        assert.deepEqual(applied.sheets, ['styles.css'], `${page} should apply styles.css and nothing else`)
        assert.equal(applied.styleBlocks, 0, `${page} carries a <style> block the inventory has not been told about`)
        assert.deepEqual(applied.styled, [], `${page} carries an inline style attribute`)
      } finally {
        await rendered.close()
      }
    }
  })
})

describe('Theme task 2: black page background', () => {
  it('paints the body and the page wrapper behind it black', async () => {
    await page.reload()
    const surfaces = await page.evaluate(`
      const of = (sel) => getComputedStyle(document.querySelector(sel)).backgroundColor;
      return { html: of('html'), body: of('body'), section: of('main > section') };
    `)
    for (const [where, value] of Object.entries(surfaces)) {
      assert.ok(isBlack(parseColor(value)), `${where} background should be black, got ${value}`)
    }
  })

  it('declares the background once, from the shared stylesheet', async () => {
    const css = await readSource(repoRoot, 'styles.css')
    assert.match(css, /--black:\s*#000000/, 'styles.css should declare a black theme token')
    const body = css.match(/\bbody\s*\{([^}]*)\}/)
    assert.ok(body, 'styles.css should carry a body rule')
    assert.match(body[1], /background-color:\s*var\(--black\)/, 'body should take its background from the token')
  })

  it('leaves no pixel of the page painted in the old background colour', async () => {
    const backgrounds = await page.evaluate(`
      return [...document.querySelectorAll('html, body, main, main *')]
        .map((el) => ({ tag: el.tagName + '.' + el.className, bg: getComputedStyle(el).backgroundColor }))
        .filter((el) => !/^rgba\\(.*,\\s*0\\)$/.test(el.bg));
    `)
    assert.ok(backgrounds.length > 0, 'something on the page should paint a background')
    for (const { tag, bg } of backgrounds) {
      assert.ok(
        isBlack(parseColor(bg)) || isOrange(parseColor(bg)),
        `${tag} still paints ${bg} — only the black page and the out-of-scope orange CTA should paint inside <main>`,
      )
    }
  })
})

/** Computed colour of a probe element per heading level, rendered inside <main>. */
const HEADING_COLOURS = `
  const probe = document.createElement('div');
  probe.innerHTML = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((t) => '<' + t + '>Probe</' + t + '>').join('');
  document.querySelector('main').appendChild(probe);
  const colours = Object.fromEntries([...probe.children].map((el) => [el.tagName.toLowerCase(), getComputedStyle(el).color]));
  probe.remove();
  return colours;
`

describe('Theme task 3: gold headings', () => {
  it('renders every heading level h1-h6 in gold', async () => {
    await page.reload()
    const colours = await page.evaluate(HEADING_COLOURS)
    assert.deepEqual(Object.keys(colours), ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    for (const [level, colour] of Object.entries(colours)) {
      assert.ok(isGold(parseColor(colour)), `${level} should render gold, got ${colour}`)
    }
  })

  it('renders the visible page title in gold on the page that has one', async () => {
    const title = await page.evaluate(`
      const h1 = document.querySelector('h1');
      return { text: h1.textContent.trim(), colour: getComputedStyle(h1).color, className: h1.className };
    `)
    assert.equal(title.className, 'hero__title', 'the home page title should still be the hero title')
    assert.ok(isGold(parseColor(title.colour)), `"${title.text}" should render gold, got ${title.colour}`)
  })

  it('declares the heading colour in the shared stylesheet, from the gold token', async () => {
    const css = await readSource(repoRoot, 'styles.css')
    assert.match(css, /--gold:\s*#ffd700/, 'styles.css should declare a gold theme token')
    const rule = css.match(/\bh1,\s*\n?\s*h2,\s*\n?\s*h3,\s*\n?\s*h4,\s*\n?\s*h5,\s*\n?\s*h6\s*\{([^}]*)\}/)
    assert.ok(rule, 'styles.css should carry one rule covering h1 through h6')
    assert.match(rule[1], /color:\s*var\(--gold\)/, 'the heading rule should take its colour from the token')
    for (const selector of ['.hero__title', '.page__title']) {
      const title = css.match(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`))
      assert.ok(title, `styles.css should still carry a ${selector} rule`)
      assert.match(title[1], /color:\s*var\(--gold\)/, `${selector} should be gold too, not the old accent`)
    }
  })

  it('keeps gold legible on the black page', async () => {
    const { colour, bg } = await page.evaluate(`
      return {
        colour: getComputedStyle(document.querySelector('h1')).color,
        bg: getComputedStyle(document.body).backgroundColor,
      }
    `)
    const ratio = contrastRatio(parseColor(colour), parseColor(bg))
    assert.ok(ratio >= 4.5, `gold on black reads at ${ratio.toFixed(2)}:1`)
  })
})

/** Computed colour of a probe paragraph, list item, span and div inside <main>. */
const BODY_TEXT_COLOURS = `
  const probe = document.createElement('div');
  probe.innerHTML = '<p>p</p><ul><li>li</li></ul><span>span</span><div>div</div>';
  document.querySelector('main').appendChild(probe);
  const colours = Object.fromEntries(
    ['p', 'li', 'span', 'div'].map((tag) => [tag, getComputedStyle(probe.querySelector(tag)).color])
  );
  probe.remove();
  return colours;
`

describe('Theme task 4: aqua body text', () => {
  it('renders paragraphs, list items, spans and generic containers in aqua', async () => {
    await page.reload()
    const colours = await page.evaluate(BODY_TEXT_COLOURS)
    for (const [tag, colour] of Object.entries(colours)) {
      assert.ok(isAqua(parseColor(colour)), `<${tag}> should render aqua, got ${colour}`)
    }
  })

  it('renders the hero tagline — the page\'s real body copy — in aqua', async () => {
    const tagline = await page.evaluate(`
      const el = document.querySelector('.hero__tagline');
      return { tag: el.tagName, colour: getComputedStyle(el).color };
    `)
    assert.equal(tagline.tag, 'P')
    assert.ok(isAqua(parseColor(tagline.colour)), `the tagline should render aqua, got ${tagline.colour}`)
  })

  it('sets the colour once on body, from the aqua token, so everything inherits it', async () => {
    const css = await readSource(repoRoot, 'styles.css')
    assert.match(css, /--aqua:\s*#00ffff/, 'styles.css should declare an aqua theme token')
    const body = css.match(/\bbody\s*\{([^}]*)\}/)
    assert.match(body[1], /\bcolor:\s*var\(--aqua\)/, 'body text colour should come from the aqua token')
    assert.ok(!/--mist\b/.test(css), 'the old neutral body-text token should be gone')
  })

  it('leaves headings gold rather than sweeping them into the body colour', async () => {
    const both = await page.evaluate(`
      return {
        heading: getComputedStyle(document.querySelector('h1')).color,
        body: getComputedStyle(document.querySelector('.hero__tagline')).color,
      }
    `)
    assert.ok(isGold(parseColor(both.heading)), `h1 should stay gold, got ${both.heading}`)
    assert.notEqual(both.heading, both.body, 'headings and body copy should not share a colour')
  })

  it('keeps aqua legible on the black page', async () => {
    const { colour, bg } = await page.evaluate(`
      return {
        colour: getComputedStyle(document.querySelector('.hero__tagline')).color,
        bg: getComputedStyle(document.body).backgroundColor,
      }
    `)
    const ratio = contrastRatio(parseColor(colour), parseColor(bg))
    assert.ok(ratio >= 4.5, `aqua on black reads at ${ratio.toFixed(2)}:1`)
  })
})

describe('Theme task 5: the theme variables carry the new colours', () => {
  it('declares black, gold and aqua as custom properties in :root', async () => {
    const declared = rootTokens(await readSource(repoRoot, 'styles.css'))
    assert.equal(declared.get('--black'), THEME.black)
    assert.equal(declared.get('--gold'), THEME.gold)
    assert.equal(declared.get('--aqua'), THEME.aqua)
  })

  it('resolves those properties to the same values in the browser', async () => {
    await page.reload()
    const resolved = await page.evaluate(`
      const root = getComputedStyle(document.documentElement);
      return Object.fromEntries(['--black', '--gold', '--aqua'].map((n) => [n, root.getPropertyValue(n).trim()]));
    `)
    assert.deepEqual(resolved, { '--black': THEME.black, '--gold': THEME.gold, '--aqua': THEME.aqua })
  })

  // `Palette task 5` guards the other half of the variable system: that :root matches
  // the documented table exactly and that no rule hard-codes a colour of its own.

  it('makes the downstream rules inherit the tokens, not repeat their values', async () => {
    const css = await readSource(repoRoot, 'styles.css')
    for (const [token, uses] of [['--black', 4], ['--gold', 3], ['--aqua', 2]]) {
      const count = [...css.matchAll(new RegExp(`var\\(${token}\\)`, 'g'))].length
      assert.ok(count >= uses, `${token} should be referenced by at least ${uses} rules, found ${count}`)
    }
  })
})

describe('Theme task 6: per-page colour overrides', () => {
  it('finds no inline <style> block or style="" attribute on any page to bring in line', async () => {
    for (const file of await pageFiles(repoRoot)) {
      const found = stylingSources(await readSource(repoRoot, file))
      assert.deepEqual(found.styleBlocks, [], `${file} carries a <style> block that could override the theme`)
      assert.deepEqual(found.styleAttributes, [], `${file} carries a style="" attribute that could override the theme`)
    }
  })

  it('records that finding in the sign-off list, so the empty result is deliberate', async () => {
    const rows = tableUnder(await readThemeNotes(repoRoot), 'Flagged — left unchanged, for reviewer sign-off')
    assert.ok(rows, `${THEME_NOTES} should carry a "## Flagged — left unchanged, for reviewer sign-off" table`)
    for (const row of rows) {
      assert.ok(row.item.length > 0, 'every flagged row should name what was checked')
      assert.ok(row.location.length > 0, `flagged row "${row.item}" should say where`)
      assert.ok(
        ['None present', 'Left unchanged'].includes(row.status),
        `flagged row "${row.item}" has status "${row.status}"`,
      )
      assert.ok(row.reason.length > 20, `flagged row "${row.item}" needs a real justification, got "${row.reason}"`)
    }
    const inline = rows.find((row) => /inline/i.test(row.item) && /style/i.test(row.item))
    assert.ok(inline, `${THEME_NOTES} should record whether any page carries inline styling`)
    assert.equal(inline.status, 'None present')
  })

  it('would catch a stale override: an injected inline colour is the only thing that beats the theme', async () => {
    await page.reload()
    const outcome = await page.evaluate(`
      const el = document.querySelector('.hero__tagline');
      const themed = getComputedStyle(el).color;
      el.setAttribute('style', 'color: rgb(207, 224, 242)');
      const overridden = getComputedStyle(el).color;
      el.removeAttribute('style');
      return { themed, overridden, restored: getComputedStyle(el).color };
    `)
    assert.ok(isAqua(parseColor(outcome.themed)), 'the tagline should start out aqua')
    assert.equal(outcome.overridden, 'rgb(207, 224, 242)', 'an inline style would win over the shared stylesheet')
    assert.equal(outcome.restored, outcome.themed, 'removing it should hand the colour back to the stylesheet')
  })

  it('leaves no element on any page rendering an old-scheme colour it should not', async () => {
    for (const file of await pageFiles(repoRoot)) {
      const rendered = await openPage(`${site.origin}/${file}`)
      try {
        const stale = await rendered.evaluate(`
          const inScope = (el) => !el.closest('.site-header') && !el.classList.contains('hero__cta');
          return [...document.querySelectorAll('main, main *')].filter(inScope).map((el) => ({
            tag: el.tagName + '.' + el.className,
            heading: /^H[1-6]$/.test(el.tagName),
            color: getComputedStyle(el).color,
          }));
        `)
        assert.ok(stale.length > 0, `${file} should render something inside <main>`)
        for (const el of stale) {
          const ok = el.heading ? isGold(parseColor(el.color)) : isAqua(parseColor(el.color))
          assert.ok(ok, `${file}: ${el.tag} renders ${el.color}, not the ${el.heading ? 'gold' : 'aqua'} the theme sets`)
        }
      } finally {
        await rendered.close()
      }
    }
  })
})

describe('Theme task 7: every page and template carries the theme', () => {
  for (const width of [1280, 375]) {
    it(`renders black, gold and aqua on every inventoried page at ${width}px`, async () => {
      for (const file of await pageFiles(repoRoot)) {
        const rendered = await openPage(`${site.origin}/${file}`, { width, height: 800 })
        try {
          const state = await rendered.evaluate(`
            ${HEADING_COLOURS.replace('return colours;', '')}
            const bodyProbe = document.createElement('div');
            bodyProbe.innerHTML = '<p>p</p><ul><li>li</li></ul><span>span</span>';
            document.querySelector('main').appendChild(bodyProbe);
            const body = ['p', 'li', 'span'].map((tag) => getComputedStyle(bodyProbe.querySelector(tag)).color);
            bodyProbe.remove();
            return {
              background: getComputedStyle(document.body).backgroundColor,
              section: getComputedStyle(document.querySelector('main > section')).backgroundColor,
              headings: colours,
              title: getComputedStyle(document.querySelector('h1')).color,
              body,
            };
          `)
          assert.ok(isBlack(parseColor(state.background)), `${file}: body background is ${state.background}`)
          assert.ok(isBlack(parseColor(state.section)), `${file}: page section background is ${state.section}`)
          for (const [level, colour] of Object.entries(state.headings)) {
            assert.ok(isGold(parseColor(colour)), `${file}: ${level} renders ${colour}, not gold`)
          }
          assert.ok(isGold(parseColor(state.title)), `${file}: the page title renders ${state.title}, not gold`)
          for (const colour of state.body) {
            assert.ok(isAqua(parseColor(colour)), `${file}: body text renders ${colour}, not aqua`)
          }
        } finally {
          await rendered.close()
        }
      }
    })
  }

  it('keeps every line of real text legible against the colour it now sits on', async () => {
    for (const file of await pageFiles(repoRoot)) {
      const rendered = await openPage(`${site.origin}/${file}`)
      try {
        const samples = await rendered.evaluate(`
          const backdrop = (el) => {
            for (let node = el; node; node = node.parentElement) {
              const bg = getComputedStyle(node).backgroundColor;
              if (!/^rgba\\(.*,\\s*0\\)$/.test(bg)) return bg;
            }
            return 'rgb(255, 255, 255)';
          };
          return [...document.querySelectorAll('body, body *')]
            .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
            .map((el) => ({ text: el.textContent.trim().slice(0, 24), color: getComputedStyle(el).color, bg: backdrop(el) }));
        `)
        assert.ok(samples.length > 0)
        for (const sample of samples) {
          const ratio = contrastRatio(parseColor(sample.color), parseColor(sample.bg))
          assert.ok(ratio >= 4.5, `${file}: "${sample.text}" reads at ${ratio.toFixed(2)}:1 against ${sample.bg}`)
        }
      } finally {
        await rendered.close()
      }
    }
  })

  it('leaves the old dark-blue page background nowhere on the site', async () => {
    for (const file of await pageFiles(repoRoot)) {
      const rendered = await openPage(`${site.origin}/${file}`)
      try {
        const stale = await rendered.evaluate(`
          return [...document.querySelectorAll('main, main *')]
            .map((el) => ({ tag: el.tagName + '.' + el.className, bg: getComputedStyle(el).backgroundColor }))
            .filter((el) => !/^rgba\\(.*,\\s*0\\)$/.test(el.bg));
        `)
        for (const el of stale) {
          assert.equal(
            isDarkBlue(parseColor(el.bg)),
            false,
            `${file}: ${el.tag} still paints the old dark blue ${el.bg}`,
          )
        }
      } finally {
        await rendered.close()
      }
    }
  })
})
