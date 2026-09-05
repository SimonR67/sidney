# Branding notes — BetaMax → Sid Meyer - Brave New Worlds

The site is renamed to **Sid Meyer - Brave New Worlds**. This document records the
repo-wide search for the old name, what each occurrence does, and the occurrences
deliberately left alone.

The rename is text only: no markup structure, stylesheet rule, route or asset
changes with it.

The search was a case-insensitive `betamax` sweep over every text file git tracks.
Line numbers are those of the pre-change files. Two files are excluded from the
sweep because they quote the old name by design — this document and
`tests/branding.mjs`, the scanner that reads it.

## Audit inventory

| File | Line | Occurrence | Role | Disposition |
|---|---|---|---|---|
| index.html | 6 | `<title>BetaMax</title>` | Browser tab title, Home | Updated |
| index.html | 17 | `<a class="site-nav__brand" ...>BetaMax</a>` | Header/nav brand text | Updated |
| index.html | 28 | `<h1 class="hero__title">BetaMax</h1>` | Hero heading — the site name as the page's focal point | Updated |
| index.html | 36 | `alt="Featured photograph from the BetaMax collection"` | Alt text naming the site | Updated |
| about.html | 6 | `<title>About — BetaMax</title>` | Browser tab title, About | Updated |
| about.html | 17 | `<a class="site-nav__brand" ...>BetaMax</a>` | Header/nav brand text | Updated |
| contact.html | 6 | `<title>Contact — BetaMax</title>` | Browser tab title, Contact | Updated |
| contact.html | 17 | `<a class="site-nav__brand" ...>BetaMax</a>` | Header/nav brand text | Updated |
| styles.css | 1 | `/* BetaMax — dark blue and orange. */` | Stylesheet header comment naming the site | Updated |
| package.json | 2 | `"name": "betamax"` | Package slug. Private package, never published, never imported | Updated |
| package.json | 4 | `"description": "Static BetaMax home page ..."` | Human-readable package description | Updated |
| docs/palette-notes.md | 3 | `BetaMax originally shipped a dark-green-and-orange scheme.` | Prose naming the site in the palette audit | Updated |
| tests/page.test.mjs | 62, 72, 110, 116, 171, 193, 203, 314, 318, 641, 668, 1246, 1255, 1581-1583 | `assert.equal(head.title, 'BetaMax')` and the other title/brand/heading expectations | Test expectations of the old branding | Updated |
| tests/page.test.mjs | 1124 | `mkdtemp(join(tmpdir(), 'betamax-before-'))` | Temp-directory prefix for the before/after render — an internal identifier, invisible to visitors | Flagged |
| tests/browser.mjs | 104 | `mkdtemp(join(tmpdir(), 'betamax-chrome-'))` | Temp-directory prefix for the headless Chrome profile — an internal identifier, invisible to visitors | Flagged |

## Branding surfaces checked and found empty

Surfaces the rename was asked to cover that this site does not have. None was
skipped silently; each was searched for and found absent, and the test suite now
guards each one so that adding it later with the old name fails.

| Surface | Status | Detail |
|---|---|---|
| `<meta>` tags carrying the site name | None present | All three pages declare exactly two meta tags, `charset` and `viewport`. There is no `description`, `og:title`, `og:site_name` or `twitter:*` tag to update, and adding one would be new SEO content rather than a name change. |
| Footer | None present | No page has a `<footer>`, copyright line or "powered by" text. The pages are `header` + `main` only. |
| Root `README.md` | None present | The repository has no README. `images/README.md` is an asset note and never names the site. |
| Logo or wordmark image | None present | The only icon is the inline SVG favicon data URI in each page's `<head>`; it is two plain rectangles with no text baked in. `images/` holds no logo. |
| Central title/branding constant | None present | The site is hand-written HTML with no build step, templating engine or config file, so the name is spelled out once per page. The three copies are kept in sync, as the nav markup already is. |

## Flagged — left unchanged, for reviewer sign-off

| Item | Location | Status | Reason |
|---|---|---|---|
| Headless-Chrome temp-directory prefix `betamax-chrome-` | `tests/browser.mjs:104` | Left unchanged | An internal identifier in the test harness, never rendered and never seen by a visitor. Renaming internal identifiers is out of scope for this text-only branding pass. |
| Before/after temp-directory prefix `betamax-before-` | `tests/page.test.mjs:1124` | Left unchanged | Same: an internal identifier in the test harness. |
| Historical planning records | `specs/*/plan.md` | Left unchanged | The job records that describe what earlier changes were asked to do. Rewriting them would erase the record of what those changes actually did, exactly as the green audit left its own prose mentions alone. Not part of the site's output. |
| Hero tagline, "Analogue warmth, recorded once and played back for as long as the tape holds." | `index.html:30` | Left unchanged | It never names the site, so the sweep does not hit it, but it is written around the old name's videotape theme. Page copy is out of scope for this rename — raised here so the wording is a deliberate follow-up rather than an oversight. |
| Repository name (`SimonR67/sidney`) | GitHub | Left unchanged | Explicitly out of scope. |
| Domain, URLs and external listings | outside this repo | Left unchanged | Explicitly out of scope: no redirect, DNS or third-party profile is touched. |
