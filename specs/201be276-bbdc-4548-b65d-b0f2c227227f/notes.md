# Implementation notes

Plan: [plan.md](plan.md)

## 1. Discovery

Tasks 1 and 2 of the plan are read-only discovery. This is what they turned up.

**The old site name is `Alpha Centauri`.** A repo-wide, case-insensitive search
(`alpha centauri`, `alpha-centauri`, `alphacentauri`, outside `.git/` and
`specs/`) found twelve occurrences in seven files:

| Occurrence | Category |
|---|---|
| `index.html` `<title>` | user-visible |
| `index.html` `<h1 class="site-title">` | user-visible |
| `index.html` `<main>` body copy — "Welcome to Alpha Centauri." | user-visible |
| `about.html` `<title>` | user-visible |
| `about.html` `<h1 class="site-title">` | user-visible |
| `contact.html` `<title>` | user-visible |
| `contact.html` `<h1 class="site-title">` | user-visible |
| `style.css` header comment | internal-only |
| `package.json` `description` | internal-only (prose that names the site) |
| `tests/site.mjs` header comment and `SITE_NAME` constant | internal-only |
| `tests/page.test.mjs` header comment | internal-only |

Every user-visible occurrence is a `<title>`, the site-title `<h1>`, or the one
line of home-page copy. All seven files were updated anyway — the internal-only
ones because they are prose or a test constant that names the site, not
identifiers other code depends on. The one internal identifier that still
carries an older name, `package.json` `name`, is left alone (see
[Flagged gaps](#3-flagged-gaps)).

**The theme has a single source of truth: `style.css`.** All three pages link
that one stylesheet and nothing else. Its colours are declared once as `:root`
CSS custom properties and referenced with `var()` everywhere else, so retheming
means editing that one `:root` block; the tests pin each shade to exactly one
literal in the file. There is no build step, no framework, no Tailwind or SCSS
config, no JavaScript, and no light/dark toggle to reconcile — one fixed scheme.

**The site is three static pages** at the repository root — `index.html`,
`about.html`, `contact.html` — each with a `<header>` (site title plus nav) and a
`<main>` (heading plus one paragraph). The nav markup is byte-identical across
the three.

## 2. Palette

Every value is declared once, in the `:root` block of `style.css`, and they are
the only colours the stylesheet mentions:

| Role | Custom property | Hex | Replaces |
|---|---|---|---|
| Page / base surface | `--dark-grey` | `#1f1f1f` | `--dark-blue: #0b1e3c` |
| Raised surface (header, nav) | `--raised-grey` | `#2e2e2e` | — (new, for layering) |
| Body copy | `--light-grey` | `#e6e6e6` | — (body copy used to be orange) |
| Accents: headings, links, buttons, badges, focus ring | `--orange` | `#ff8c1a` | unchanged |
| Accent hover / focus | `--orange-bright` | `#ffa94d` | — (new state shade) |
| Accent active (pressed) | `--orange-deep` | `#e8820f` | — (new state shade) |

The two greys are the layering the plan asks for: the page sits on `#1f1f1f`
and the header/nav band on the lighter `#2e2e2e`.

Contrast against both surfaces, checked in the suite for every foreground and
both greys (the 4.5:1 WCAG AA floor for body copy):

| Foreground | on `#1f1f1f` | on `#2e2e2e` |
|---|---|---|
| `--light-grey` | 13.20:1 | 10.88:1 |
| `--orange` | 7.08:1 | 5.83:1 |
| `--orange-bright` | 8.66:1 | 7.14:1 |
| `--orange-deep` | 5.99:1 | 4.94:1 |

A button's label is `--dark-grey` on the orange fill, which clears the same
floor in all three of its states (7.08:1, 8.66:1, 5.99:1). Every rendered line
of text on every page is re-checked against the background it actually sits on.

## 3. Flagged gaps

For the reviewer. Nothing here was guessed at or silently left half-done.

- **No old site name survives as an image asset** — plan task 11's specific
  worry. The repository contains no image files at all (no `.svg`, `.png`,
  `.jpg`, `.ico`, `.webp`). The only graphic on the site is the inline SVG
  favicon in each page's `<link rel="icon">` data URI: a rect and a circle, no
  text, so it never carried the old name. It did paint itself with the
  superseded dark blue, so its `fill` now uses `--dark-grey`'s value; no shapes
  were touched. There is nothing left for a follow-up here.
- **`package.json` `name` is still `strange-new-worlds`.** The plan puts
  internal, non-user-facing identifiers (package name, repo name) out of scope,
  so only the `description` field — prose that named the site — was reworded.
- **No page carries a button, so nothing existing needed restyling.** The
  orange button styles (`.btn`, `.btn--secondary`, bare `button`, with hover,
  focus and active shades) are now defined in `style.css`, but no page uses
  them: adding a button would be new page structure, which the plan puts out of
  scope. The suite verifies them by injecting a primary and a secondary button
  into a rendered page and reading the computed colours in each state, and
  separately pins that the shipped pages stay button-free.
- **Same for badges/tags and the current-nav-item marker.** `.badge`/`.tag` and
  `.site-nav__links a[aria-current="page"]` are styled orange and covered by
  injected-element tests, but no page ships a badge, and no page sets
  `aria-current` — the nav markup is byte-identical across the three pages and
  changing that is a markup change the plan excludes.
- **There are no meta tags to rename.** Each page's `<head>` holds only
  `charset` and `viewport`, plus the icon and stylesheet links. There is no
  `description`, no Open Graph or Twitter card, no JSON-LD, no RSS feed and no
  sitemap, so plan task 5 had nothing to edit; tests pin their absence, so any
  future addition has to carry the new name. The Open Graph half of the plan's
  user journey (a shared link previewing as "Beta Centuri") therefore cannot be
  satisfied without adding tags — out of scope, and flagged here.
- **There is no footer, copyright line, email template or web app manifest**
  either, so the rest of plan task 6 had nothing to rename beyond the home
  page's one line of copy. Their absence is pinned by tests too.
- **No light/dark toggle exists**, so there is no second variant to reconcile —
  the site has one fixed scheme and it is now the dark grey/orange one.
- **No README exists**, so there was nothing to update there.
- **Layout and structure are untouched.** Only colour declarations and the site
  name changed; no padding, margin, font, size or element was altered, and the
  suite still checks page structure, nav markup equality and the absence of
  sideways overflow at 1280px and 375px.
- **Branding outside this repository is untouched**, per scope: the domain, the
  hosting and any third-party listing still say the old name.
