import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { contrastRatio, isDarkGreen, isGreenTinted, isOrange, openPage, parseColor, serveStatic } from './browser.mjs'

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

  it('declares a charset, a responsive viewport and the title "BetaMax"', async () => {
    const head = await page.evaluate(`
      return {
        charset: document.characterSet,
        viewport: document.querySelector('meta[name="viewport"]')?.content ?? null,
        title: document.title,
      }
    `)
    assert.equal(head.charset, 'UTF-8')
    assert.match(head.viewport, /width=device-width/)
    assert.equal(head.title, 'BetaMax')
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

  it('shows the site name "BetaMax" as the nav brand', async () => {
    const brand = await page.evaluate(`
      const el = document.querySelector('.site-nav__brand');
      return el ? { text: el.textContent.trim(), href: el.getAttribute('href') } : null;
    `)
    assert.ok(brand, 'nav should carry a brand element')
    assert.equal(brand.text, 'BetaMax')
    assert.ok(brand.href.startsWith('#'), `brand link should be a placeholder, got ${brand.href}`)
  })

  it('offers Home / About / Contact placeholder links that all target a fragment', async () => {
    const links = await page.evaluate(`
      return [...document.querySelectorAll('.site-nav__links a')].map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute('href'),
      }))
    `)
    assert.deepEqual(links.map((l) => l.text), ['Home', 'About', 'Contact'])
    for (const link of links) {
      assert.ok(link.href.startsWith('#'), `${link.text} should be a placeholder link, got ${link.href}`)
    }
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

  it('clicking every nav link keeps the page on index.html and throws nothing', async () => {
    await page.reload()
    const result = await page.evaluate(`
      const before = location.pathname;
      for (const a of document.querySelectorAll('nav a')) a.click();
      return { before, after: location.pathname, title: document.title };
    `)
    assert.equal(result.after, result.before)
    assert.equal(result.title, 'BetaMax')
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

  it('has a single <h1> reading "BetaMax" inside the hero', async () => {
    const heading = await page.evaluate(`
      const h1s = document.querySelectorAll('h1');
      return {
        count: h1s.length,
        text: h1s[0]?.textContent.trim() ?? null,
        insideHero: !!h1s[0]?.closest('section.hero'),
      }
    `)
    assert.equal(heading.count, 1, 'the page should have exactly one <h1>')
    assert.equal(heading.text, 'BetaMax')
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

describe('Task 4: dark green and orange colour scheme', () => {
  it('paints the page background dark green', async () => {
    const { 'background-color': body } = await page.evaluate(computed('body', ['background-color']))
    assert.ok(isDarkGreen(parseColor(body)), `body background should be dark green, got ${body}`)
  })

  it('paints the nav bar dark green with orange branding', async () => {
    const header = await page.evaluate(computed('.site-header', ['background-color']))
    const brand = await page.evaluate(computed('.site-nav__brand', ['color']))
    assert.ok(
      isDarkGreen(parseColor(header['background-color'])),
      `nav bar background should be dark green, got ${header['background-color']}`,
    )
    assert.ok(isOrange(parseColor(brand.color)), `nav brand should be orange, got ${brand.color}`)
  })

  it('paints the hero dark green with an orange title', async () => {
    const hero = await page.evaluate(computed('section.hero', ['background-color']))
    const title = await page.evaluate(computed('h1', ['color']))
    assert.ok(
      isDarkGreen(parseColor(hero['background-color'])),
      `hero background should be dark green, got ${hero['background-color']}`,
    )
    assert.ok(isOrange(parseColor(title.color)), `h1 should be orange, got ${title.color}`)
  })

  it('gives the call to action an orange fill with dark green text', async () => {
    const cta = await page.evaluate(computed('.hero__cta', ['background-color', 'color']))
    assert.ok(isOrange(parseColor(cta['background-color'])), `CTA fill should be orange, got ${cta['background-color']}`)
    assert.ok(isDarkGreen(parseColor(cta.color)), `CTA label should be dark green, got ${cta.color}`)
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

  it('uses no dominant colour outside the dark green / orange scheme', async () => {
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
      // Greys/blacks/whites are neutral supporting tones; anything tinted must read as green or orange.
      const neutral = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b) < 24
      return !(neutral || isGreenTinted(color) || isOrange(color))
    })
    assert.deepEqual(offPalette, [], 'only greens, oranges and neutral greys should appear')
  })
})

const textSizes = `
  return [...document.querySelectorAll('body, body *')]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .map((el) => ({ text: el.textContent.trim().slice(0, 24), size: parseFloat(getComputedStyle(el).fontSize) }))
    .sort((a, b) => b.size - a.size);
`

describe('Task 5: "BetaMax" as the visual focal point', () => {
  it('renders the h1 as the largest text on the page by a clear margin', async () => {
    const sizes = await page.evaluate(textSizes)
    const h1Size = await page.evaluate("return parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)")
    assert.equal(sizes[0].text, 'BetaMax', `largest text should be the title, got "${sizes[0].text}"`)
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
    assert.equal(withoutJs.title, 'BetaMax')
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

      // Click every placeholder link in turn and re-check after each one.
      const links = await fresh.evaluate("return document.querySelectorAll('a').length")
      for (let i = 0; i < links; i++) {
        await fresh.evaluate(`document.querySelectorAll('a')[${i}].click(); return null;`)
        assert.deepEqual(fresh.pageErrors, [], `error after clicking link ${i}`)
        assert.deepEqual(fresh.consoleMessages, [], `console output after clicking link ${i}`)
      }
      assert.equal(await fresh.evaluate('return document.title'), 'BetaMax')
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
          .map((el) => ({ text: el.textContent.trim().slice(0, 24), size: parseFloat(getComputedStyle(el).fontSize) }))
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
      assert.equal(state.biggest.text, 'BetaMax', '"BetaMax" should be the largest text on the page')
      assert.ok(
        state.biggest.size > state.runnerUp.size * 2,
        `h1 (${state.biggest.size}px) should be at least twice the next largest text (${state.runnerUp.size}px)`,
      )
      assert.ok(isDarkGreen(parseColor(state.bodyBg)))
      assert.ok(isOrange(parseColor(state.h1Color)))
      assert.ok(contrastRatio(parseColor(state.h1Color), parseColor(state.bodyBg)) >= 4.5)
      assert.equal(state.overflow, false)
      assert.equal(state.title, 'BetaMax')
      assert.deepEqual(page.pageErrors, [])
    })
  }

  it('introduces no extra pages, scripts or build tooling', async () => {
    const { readdir } = await import('node:fs/promises')
    const root = (await readdir(repoRoot)).filter((name) => !name.startsWith('.'))
    // Only the two site files plus the pre-existing test harness and specs.
    assert.deepEqual(root.sort(), ['index.html', 'package.json', 'specs', 'styles.css', 'tests'])
  })
})
