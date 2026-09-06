# Site structure notes

Findings from the investigation that opened the three-page navigation job
(`specs/345a69b5-afea-42a7-b259-af8828d51056/plan.md`, task 1). They fix the
paths the rest of that plan builds on.

## Architecture

The site is a **static multi-page site with no build step**: hand-written HTML
served straight from the repository root, one external stylesheet, no
templating engine, no framework, no JavaScript, no dependencies. `package.json`
declares a single `test` script and no `dependencies`/`devDependencies`, and the
test harness renders the pages both from `file://` and from a plain static
server.

Consequences for routing:

- A page is a file. The framework equivalent of the plan's `/`, `/about` and
  `/contact` routes is `index.html`, `about.html` and `contact.html` at the
  repository root — each independently reachable, bookmarkable and 404-free over
  both `file://` and http, with no rewrite rules required.
- There is no routing configuration to register (no `routes.js`, no
  `next.config.js`, no `.htaccess`), so plan task 7 reduces to verifying that
  every nav `href` resolves to a served page.
- There is no layout/partial mechanism, so the nav markup is duplicated verbatim
  in each of the three pages. Keep the three copies in sync.

## Page and nav files

| Path | Role |
|---|---|
| `index.html` | Home page (`/`). Header + nav + hero. |
| `about.html` | About page (`/about`). Added by this job. |
| `contact.html` | Contact page (`/contact`). Added by this job. |
| `styles.css` | The only stylesheet; linked by all three pages. |
| `images/` | Static image assets. Added by this job. |
| `docs/palette-notes.md` | Colour-scheme audit from the green → orange/blue job. |
| `docs/theme-notes.md` | The current black/gold/aqua theme: styling inventory, variables and sign-off list. |
| `tests/page.test.mjs` | Whole-site test suite (`npm test`). |

The nav lives inline in each page as `header.site-header > nav.site-nav`, with
the links in `ul.site-nav__links`.

Before this job, `index.html` was the only page: its nav already carried the
labels "Home", "About" and "Contact", but all three pointed at placeholder
fragments (`#top`, `#`, `#`) rather than at pages.

## Duplicate pages

**None found.** The repository contained exactly one HTML file (`index.html`)
before this job, so there were no duplicate or conflicting Home/About/Contact
pages to consolidate — plan task 10 is not applicable.

## Active nav styling

**No pre-existing pattern.** Neither `index.html` nor `styles.css` carried an
active/current nav state (no `.is-active`/`.active` class, no `aria-current`)
before this job, so plan task 9 — "extend the existing active-nav pattern" — is
not applicable and no such pattern was introduced.

## Existing tests this job had to update

Adding pages and page imagery invalidated assumptions a few earlier tests made
about a single, image-free, link-free page:

- `Task 2: navigation bar` — the nav links are pages now, not fragments, so the
  href assertion checks the real targets and the click test only clicks the
  links that stay on the page.
- `Task 8: works with JavaScript disabled` — same: it clicks the on-page links
  only; the cross-page walk is covered end to end.
- `Test plan: end-to-end walkthrough` — the root-directory listing now expects
  the two new pages and `images/`.
- `Palette task 9: before/after spot-check` — its two layout-diff tests compare
  the current `index.html` against the base commit's, which only means anything
  while the markup is unchanged. They now skip with an explicit reason once the
  markup has moved on, rather than reporting a layout shift this job made on
  purpose. (Its third test, "does repaint the page", already failed on `main`
  before this job: the base commit it compares against *is* the palette commit,
  so there is no pre-palette render left to differ from.)

## Image assets

The three images this job displays are **not in the repository**: they could not
be downloaded. See `images/README.md` for the blocker and exactly what has to be
dropped in to finish the job.
