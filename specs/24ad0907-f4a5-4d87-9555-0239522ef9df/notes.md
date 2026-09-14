# Notes: Softpapaya Services Page

Job: 24ad0907-f4a5-4d87-9555-0239522ef9df
Plan: specs/24ad0907-f4a5-4d87-9555-0239522ef9df/plan.md

## 1. Discovery — which file is the homepage

The repository is a plain static site: no build step, no templating engine and no
server-side rendering. `package.json` declares no dependencies and a single
`test` script, so the files in the repository root are exactly the files a
visitor is served.

Homepage candidates looked at, and what was decided about each:

| Candidate | Decision |
|---|---|
| `index.html` | **This is the homepage.** It is the only file a static host maps `/` to, and the only `index.*` file anywhere in the repository. This is the file the plan replaces. |
| `about.html` | Not a homepage — served at `/about.html`. Left alone; the plan's file map does not cover it. |
| `contact.html` | Not a homepage — served at `/contact.html`. Left alone; the plan's file map does not cover it. |
| `index.php` | Does not exist. No `.php`, `.njk`, `.ejs` or `.hbs` file exists anywhere in the repository, so no templated view generates the root page. |
| `package.json` | Declares no build/start/deploy script, so nothing generates a homepage at build time. |
| `.github/workflows/` | Holds one `workflow_dispatch` job that runs the dev manager. Nothing deploys or rewrites the root page. |

Confirmed by `tests/browser.mjs`'s static server, which resolves `/` to
`index.html` — the same mapping GitHub Pages and every other static host uses.
There is no ambiguity and no competing homepage candidate.

## 2. Orphaned assets

What the replacement leaves behind, and whether it is orphaned:

- `style.css` — **not orphaned.** The new homepage ships its own stylesheet
  (`styles/main.css`), but `about.html` and `contact.html` still link
  `style.css`, so it is still in use and stays.
- `about.html`, `contact.html` — **not orphaned homepages.** They are separate
  routes, not the root page, and the plan replaces the homepage only. They are
  left byte-for-byte as they were.
- The previous homepage's inline favicon, header, nav and `<main>` copy — removed
  with the rewrite of `index.html`; none of it was referenced from anywhere else.
- No images, partials or other asset folders existed for the old homepage to
  orphan; the whole site was three HTML files and one stylesheet.

## 3. Decisions taken on the spec's open questions

- **Contact address**: the spec offered `hello@softpapaya.com`-style placeholder
  as an option. The header CTA, the CTA band button and the footer contact link
  all point at the same `mailto:hello@softpapaya.com`, so there is one address to
  change later.
- **Nav destinations**: nav items point at an in-page anchor where this page has
  a matching section (`Services` → `#services`, `Contact` → `#contact`) and at
  `#` everywhere else. No extra placeholder sections were built.
- **Mobile nav**: CSS-only. The header wraps the nav onto its own row below the
  logo and the CTA on narrow viewports — no hamburger, no JavaScript.
- **Logo**: text-only "SoftPapaya". The page keeps an inline SVG data-URI favicon
  so the browser does not request (and 404 on) `/favicon.ico`.
- **Webfont**: the Inter family is named first in the stack but no CDN font is
  loaded, so the page renders from `Helvetica Neue`/`Arial`/`sans-serif` when
  Inter is not installed. This keeps the page free of external requests and makes
  the spec's "missing font" edge case the default path rather than a fallback.

## 4. Effect on the existing test suite

`tests/page.test.mjs` describes the superseded "Sid Meyers Alpha Centuri" site.
Its home page assertions are superseded by this plan, so the suite was retargeted
at the two legacy pages it still describes (`about.html`, `contact.html`), and the
describes whose whole subject was the old home page were removed. The new page is
covered by `tests/services-page.test.mjs`, one describe per plan task.

Two assertions in that suite already failed on `main` before this branch and
still do — "changes nothing but the title and branding strings on about.html"
and the same for `contact.html`. They diff those files against the `BASELINE`
ref, which is `main`; `main` is now the rebranded state those tests were written
to check, so the diff is empty and the check is vacuous. Both are about an
earlier job's work, neither touches the home page, and both were left alone.
