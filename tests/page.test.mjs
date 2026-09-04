import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { contrastRatio, isNearBlack, isOrange, openPage, parseColor, serveStatic } from './browser.mjs'

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

describe('Task 1: semantic scaffold', () => {
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

  it('has the title "Mordor"', async () => {
    assert.equal(await page.evaluate('return document.title'), 'Mordor')
  })

  it('contains a <nav> and a hero <header>', async () => {
    const structure = await page.evaluate(`
      return {
        navs: document.querySelectorAll('nav').length,
        heroes: document.querySelectorAll('header.hero').length,
      }
    `)
    assert.equal(structure.navs, 1)
    assert.equal(structure.heroes, 1)
  })
})

describe('Task 2: navigation bar', () => {
  it('puts the <nav> first inside <body>', async () => {
    const first = await page.evaluate('return document.body.firstElementChild.tagName')
    assert.equal(first, 'NAV')
  })

  it('shows the site name "Mordor" in the nav', async () => {
    const navText = await page.evaluate("return document.querySelector('nav').textContent")
    assert.match(navText, /Mordor/)
  })

  it('has placeholder links that all point at an in-page fragment', async () => {
    const links = await page.evaluate(`
      return [...document.querySelectorAll('nav a')].map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute('href'),
      }))
    `)
    assert.ok(links.length > 0, 'nav should contain at least one link')
    for (const link of links) {
      assert.ok(link.href.startsWith('#'), `${link.text} should be a placeholder link, got ${link.href}`)
    }
  })

  it('clicking every nav link keeps the page on index.html and throws nothing', async () => {
    await page.reload()
    const result = await page.evaluate(`
      const before = location.pathname;
      for (const a of document.querySelectorAll('nav a')) a.click();
      return { before, after: location.pathname, title: document.title };
    `)
    assert.equal(result.after, result.before)
    assert.equal(result.title, 'Mordor')
    assert.deepEqual(page.pageErrors, [])
    assert.deepEqual(page.consoleMessages.filter((m) => m.type === 'error'), [])
  })
})

describe('Task 3: hero section', () => {
  it('places the hero immediately after the nav in DOM order', async () => {
    const order = await page.evaluate(`
      const nav = document.querySelector('nav');
      return {
        next: nav.nextElementSibling?.tagName ?? null,
        nextClass: nav.nextElementSibling?.className ?? null,
      }
    `)
    assert.equal(order.next, 'HEADER')
    assert.match(order.nextClass, /hero/)
  })

  it('has a single <h1> reading "Mordor" inside the hero', async () => {
    const heading = await page.evaluate(`
      const h1s = document.querySelectorAll('h1');
      return {
        count: h1s.length,
        text: h1s[0]?.textContent.trim() ?? null,
        insideHero: !!h1s[0]?.closest('header.hero'),
      }
    `)
    assert.equal(heading.count, 1)
    assert.equal(heading.text, 'Mordor')
    assert.equal(heading.insideHero, true)
  })

  it('has a tagline paragraph in the hero', async () => {
    const tagline = await page.evaluate("return document.querySelector('header.hero p')?.textContent.trim() ?? null")
    assert.ok(tagline && tagline.length > 0, 'hero should carry a short tagline')
  })
})

describe('Task 4: black and orange colour scheme', () => {
  it('paints the page background black', async () => {
    const { 'background-color': body } = await page.evaluate(computed('body', ['background-color']))
    assert.ok(isNearBlack(parseColor(body)), `body background should be near-black, got ${body}`)
  })

  it('paints the nav black with orange branding', async () => {
    const nav = await page.evaluate(computed('nav', ['background-color']))
    const brand = await page.evaluate(computed('.site-nav__brand', ['color']))
    assert.ok(isNearBlack(parseColor(nav['background-color'])), `nav background should be near-black, got ${nav['background-color']}`)
    assert.ok(isOrange(parseColor(brand.color)), `nav brand should be orange, got ${brand.color}`)
  })

  it('paints the hero black with an orange title', async () => {
    const hero = await page.evaluate(computed('header.hero', ['background-color']))
    const title = await page.evaluate(computed('h1', ['color']))
    assert.ok(isNearBlack(parseColor(hero['background-color'])), `hero background should be near-black, got ${hero['background-color']}`)
    assert.ok(isOrange(parseColor(title.color)), `h1 should be orange, got ${title.color}`)
  })

  it('keeps every nav and hero text colour legible against the background', async () => {
    const samples = await page.evaluate(`
      const bg = getComputedStyle(document.body).backgroundColor;
      const targets = ['.site-nav__brand', 'nav a', 'h1', '.hero__tagline'];
      return targets.map((sel) => ({
        sel,
        color: getComputedStyle(document.querySelector(sel)).color,
        bg,
      }));
    `)
    for (const sample of samples) {
      const ratio = contrastRatio(parseColor(sample.color), parseColor(sample.bg))
      assert.ok(ratio >= 4.5, `${sample.sel} contrast ${ratio.toFixed(2)}:1 is below 4.5:1`)
    }
  })

  it('uses no dominant colour outside the black/orange scheme', async () => {
    const offPalette = await page.evaluate(`
      const seen = new Set();
      for (const el of document.querySelectorAll('body, body *')) {
        const style = getComputedStyle(el);
        seen.add(style.color);
        const bg = style.backgroundColor;
        if (!bg.startsWith('rgba(0, 0, 0, 0')) seen.add(bg);
      }
      return [...seen];
    `)
    const allowed = offPalette.filter((value) => {
      const color = parseColor(value)
      if (color.a === 0) return true
      // Greys/blacks/whites are neutral; anything else must read as orange.
      const neutral = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b) < 24
      return neutral || isOrange(color)
    })
    assert.deepEqual(
      offPalette.filter((v) => !allowed.includes(v)),
      [],
      'only black/grey/white neutrals and oranges should appear',
    )
  })
})

describe('Task 5: responsive layout', () => {
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

      it('stacks the nav above the hero without overlap', async () => {
        const boxes = await page.evaluate(`
          const nav = document.querySelector('nav').getBoundingClientRect();
          const hero = document.querySelector('header.hero').getBoundingClientRect();
          return { navBottom: nav.bottom, heroTop: hero.top, navHeight: nav.height, heroHeight: hero.height };
        `)
        assert.ok(boxes.navHeight > 0 && boxes.heroHeight > 0)
        assert.ok(
          boxes.navBottom <= boxes.heroTop + 0.5,
          `nav (bottom ${boxes.navBottom}) overlaps hero (top ${boxes.heroTop})`,
        )
      })

      it('keeps the whole <h1> inside the viewport', async () => {
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
    })
  }
})

describe('Task 6: graceful fallback for external assets', () => {
  it('references no third-party or network-hosted assets', async () => {
    // data:/blob: URLs fetch nothing, so they are exempt from the remote-asset ban.
    const external = await page.evaluate(`
      const urls = [...document.querySelectorAll('[src], [href]')].map((el) => el.getAttribute('src') || el.getAttribute('href'));
      const cssUrls = [...document.styleSheets].flatMap((sheet) => {
        try { return [...sheet.cssRules].map((r) => r.cssText) } catch { return [] }
      });
      return [...urls, ...cssUrls]
        .filter((v) => !/^\\s*(data|blob):/.test(v))
        .filter((v) => /(^|["'(\\s])(https?:)?\\/\\//.test(v));
    `)
    assert.deepEqual(external, [], 'page should not depend on remote fonts, CSS or scripts')
  })

  it('makes no off-origin network requests when served statically', async () => {
    const server = await serveStatic(repoRoot)
    const served = await openPage(`${server.origin}/index.html`)
    try {
      const offOrigin = served.requests.filter((url) => !url.startsWith(server.origin))
      assert.deepEqual(offOrigin, [])
    } finally {
      await served.close()
      await server.close()
    }
  })

  it('falls back to a generic system font family', async () => {
    const fonts = await page.evaluate(`
      return ['body', 'h1', 'nav a'].map((sel) => getComputedStyle(document.querySelector(sel)).fontFamily);
    `)
    for (const stack of fonts) {
      assert.match(stack, /(sans-serif|serif|monospace|system-ui)\s*$/, `font stack "${stack}" needs a generic fallback`)
    }
    const faces = await page.evaluate(`
      return [...document.styleSheets].flatMap((sheet) => {
        try { return [...sheet.cssRules].filter((r) => r.constructor.name === 'CSSFontFaceRule').map((r) => r.cssText) } catch { return [] }
      });
    `)
    assert.deepEqual(faces, [], 'no @font-face downloads should be required')
  })

  it('stays legible when the stylesheet fails to load', async () => {
    const server = await serveStatic(repoRoot)
    const blocked = await openPage(`${server.origin}/index.html`)
    try {
      await blocked.blockUrls(['*styles.css'])
      await blocked.reload()
      const state = await blocked.evaluate(`
        const h1 = document.querySelector('h1');
        const sizes = [...document.querySelectorAll('body, body *')]
          .filter((el) => el.textContent.trim())
          .map((el) => parseFloat(getComputedStyle(el).fontSize));
        return {
          stylesheetApplied: getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)',
          headingText: h1.textContent.trim(),
          headingVisible: h1.getBoundingClientRect().height > 0,
          headingSize: parseFloat(getComputedStyle(h1).fontSize),
          largestSize: Math.max(...sizes),
          navText: document.querySelector('nav').textContent.trim(),
          overflow: document.documentElement.scrollWidth > window.innerWidth,
        }
      `)
      assert.equal(state.stylesheetApplied, false, 'stylesheet should actually be blocked for this check')
      assert.equal(state.headingText, 'Mordor')
      assert.equal(state.headingVisible, true)
      assert.equal(state.headingSize, state.largestSize, 'unstyled page should still lead with "Mordor"')
      assert.match(state.navText, /Mordor/)
      assert.equal(state.overflow, false)
      assert.deepEqual(blocked.pageErrors, [])
    } finally {
      await blocked.close()
      await server.close()
    }
  })
})

describe('Task 7: no JavaScript, no console noise', () => {
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

  it('loads with an empty console and no failed requests', async () => {
    const server = await serveStatic(repoRoot)
    const fresh = await openPage(`${server.origin}/index.html`)
    try {
      assert.deepEqual(fresh.pageErrors, [])
      assert.deepEqual(fresh.consoleMessages, [])
      assert.deepEqual(fresh.failedRequests, [])

      // Click each nav link in turn and re-check after every click.
      const linkCount = await fresh.evaluate("return document.querySelectorAll('nav a').length")
      for (let i = 0; i < linkCount; i++) {
        await fresh.evaluate(`document.querySelectorAll('nav a')[${i}].click(); return null;`)
        assert.deepEqual(fresh.pageErrors, [], `error after clicking nav link ${i}`)
        assert.deepEqual(fresh.consoleMessages, [], `console output after clicking nav link ${i}`)
      }
      assert.equal(await fresh.evaluate('return document.title'), 'Mordor')
    } finally {
      await fresh.close()
      await server.close()
    }
  })
})

describe('Test plan: end-to-end walkthrough', () => {
  after(async () => {
    await page.setViewport(1280, 800)
  })

  for (const width of [1280, 375]) {
    it(`renders the full page correctly at ${width}px`, async () => {
      await page.setViewport(width, 900)
      await page.reload()
      const state = await page.evaluate(`
        const nav = document.querySelector('nav');
        const hero = document.querySelector('header.hero');
        const h1 = document.querySelector('h1');
        const textSizes = [...document.querySelectorAll('body, body *')]
          .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
          .map((el) => ({ text: el.textContent.trim().slice(0, 20), size: parseFloat(getComputedStyle(el).fontSize) }))
          .sort((a, b) => b.size - a.size);
        return {
          navTop: nav.getBoundingClientRect().top,
          navBeforeHero: nav.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING ? true : false,
          biggest: textSizes[0],
          h1Size: parseFloat(getComputedStyle(h1).fontSize),
          runnerUpSize: textSizes[1]?.size ?? 0,
          bodyBg: getComputedStyle(document.body).backgroundColor,
          h1Color: getComputedStyle(h1).color,
          overflow: document.documentElement.scrollWidth > window.innerWidth,
          title: document.title,
        }
      `)
      assert.ok(state.navTop <= 0.5, 'nav should sit at the very top of the page')
      assert.equal(state.navBeforeHero, true)
      assert.equal(state.biggest.text, 'Mordor', '"Mordor" should be the largest text on the page')
      assert.ok(state.h1Size > state.runnerUpSize * 1.5, `h1 (${state.h1Size}px) should dominate the next largest text (${state.runnerUpSize}px)`)
      assert.ok(isNearBlack(parseColor(state.bodyBg)))
      assert.ok(isOrange(parseColor(state.h1Color)))
      assert.ok(contrastRatio(parseColor(state.h1Color), parseColor(state.bodyBg)) >= 4.5)
      assert.equal(state.overflow, false)
      assert.equal(state.title, 'Mordor')
      assert.deepEqual(page.pageErrors, [])
    })
  }
})
