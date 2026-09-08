# Implementation notes

Plan: [plan.md](plan.md)

These notes are the audit the plan's task 1 asks for, plus the palette task 2
settles on and the gaps flagged for the reviewer. They supersede
[the previous rebrand's notes](../201be276-bbdc-4548-b65d-b0f2c227227f/notes.md).

## 1. Discovery

The site is **three static pages at the repository root** — `index.html`,
`about.html`, `contact.html` — each linking the single shared stylesheet
`style.css`. There is no build step, no framework, no template engine, no SCSS
or Tailwind config, no JavaScript and no light/dark toggle: one fixed scheme,
one source of truth. `package.json` declares no dependencies and only a `test`
script. The tests live in `tests/site.mjs`, `tests/browser.mjs` and
`tests/page.test.mjs`.

Every line reference below is against the state of the files **before** this
rebrand (commit `0bb56ae`).

### Site title occurrences

The outgoing name is `Beta Centuri`. A repo-wide, case-insensitive search for
`beta centuri` / `beta-centuri` outside `.git/` and `specs/` found eleven
occurrences in seven files:

| Occurrence | Reference | Category |
|---|---|---|
| Home `<title>` | `index.html:6` | user-visible |
| Home `<h1 class="site-title">` | `index.html:16` | user-visible |
| Home body copy — "Welcome to Beta Centuri." | `index.html:27` | user-visible |
| About Us `<title>` | `about.html:6` | user-visible |
| About Us `<h1 class="site-title">` | `about.html:16` | user-visible |
| Contact `<title>` | `contact.html:6` | user-visible |
| Contact `<h1 class="site-title">` | `contact.html:16` | user-visible |
| Stylesheet header comment | `style.css:1` | internal-only |
| `description` field | `package.json:4` | internal-only (prose naming the site) |
| Header comment and `SITE_NAME` constant | `tests/site.mjs:1` | internal-only |
| Header comment | `tests/page.test.mjs:1` | internal-only |

`tests/browser.mjs` never names the site. The one internal identifier that
carries an older name still, `package.json`'s `name` field, is out of scope —
see [Flagged gaps](#4-flagged-gaps).

There is **no header/nav or footer branding beyond the `<h1 class="site-title">`**
on each page: no `<footer>`, no copyright line, no logo image, no wordmark.

### Background colour declarations

All of them are in `style.css`, and every one of them reads its value from a
`:root` custom property declared in the palette block at `style.css:3`:

| Surface | Declaration | Reference |
|---|---|---|
| Root element | `background-color: var(--dark-grey)` | `style.css:17` |
| Page body | `background-color: var(--dark-grey)` | `style.css:23` |
| Header band | `background-color: var(--raised-grey)` | `style.css:70` |
| Nav band | `background-color: var(--raised-grey)` | `style.css:76` |

There are two further background paints, both on buttons, listed below. The
only colour outside the stylesheet is the inline SVG favicon data URI repeated
at `index.html:10`, `about.html:10` and `contact.html:10`, whose backing rect is
painted `%231f1f1f` — the page's dark grey, spelled out because a data URI
cannot reach a custom property.

### Button colour declarations

No page ships a button, so these styles are the ones the first button to appear
would inherit. All in `style.css`:

| Rule | Declaration | Reference |
|---|---|---|
| `.btn, button` | `border: 1px solid var(--orange)` | `style.css:121` |
| `.btn, button` | `background-color: var(--orange)` | `style.css:122` |
| `.btn, button` | `color: var(--dark-grey)` (the label) | `style.css:123` |
| `.btn:hover, button:hover, …:focus` | `border-color: var(--orange-bright)` | `style.css:131` |
| `.btn:hover, button:hover, …:focus` | `background-color: var(--orange-bright)` | `style.css:132` |
| `.btn:active, button:active` | `border-color: var(--orange-deep)` | `style.css:137` |
| `.btn:active, button:active` | `background-color: var(--orange-deep)` | `style.css:138` |
| `.btn--secondary` | `background-color: transparent` | `style.css:143` |
| `.btn--secondary` | `color: var(--orange)` | `style.css:144` |
| `.btn--secondary:hover/:focus` | `color: var(--orange-bright)` | `style.css:150` |
| `.btn--secondary:active` | `color: var(--orange-deep)` | `style.css:155` |

Only one of these is wrong for a blue page: the primary button's label at
`style.css:123`, which is the page surface colour and so has to follow it.

### Link and text-accent colour declarations

All in `style.css`, all already orange:

| Accent | Declaration | Reference |
|---|---|---|
| `h1` (the site title) | `color: var(--orange)` | `style.css:33` |
| `h2` (the page heading) | `color: var(--orange)` | `style.css:39` |
| `a` | `color: var(--orange)` | `style.css:47` |
| `a:hover, a:focus` | `color: var(--orange-bright)` | `style.css:52` |
| `a:active` | `color: var(--orange-deep)` | `style.css:56` |
| `:focus-visible` | `outline: 2px solid var(--orange)` | `style.css:61` |
| `.site-header` | `border-bottom: 1px solid var(--orange)` | `style.css:71` |
| `.site-nav__links a` | `color: var(--orange)` | `style.css:89` |
| `.site-nav__links a:hover/:focus` | `color: var(--orange-bright)` | `style.css:95` |
| `.site-nav__links a:active` | `color: var(--orange-deep)` | `style.css:100` |
| `.site-nav__links a[aria-current="page"]` | `color: var(--orange-bright)` | `style.css:105` |
| `.badge, .tag` | `border: 1px solid var(--orange)` | `style.css:162` |
| `.badge, .tag` | `color: var(--orange)` | `style.css:164` |

The body copy is deliberately *not* an accent: `body` sets
`color: var(--light-grey)` at `style.css:24`.

### Home page content source

The home page's copy is written straight into `index.html` — there is no
data file, front matter or template behind it. The whole of its `<main>` is:

| Element | Reference |
|---|---|
| `<h2>Home</h2>` | `index.html:26` |
| `<p>Welcome to Beta Centuri.</p>` | `index.html:27` |

The new board-advisory paragraph goes in this `<main>`, directly after the
welcome line, as its own `<p>` — the markup convention every page already uses.
`about.html` and `contact.html` have the same shape and are not touched beyond
their title and branding.

## 2. Palette

Every value is declared once, in the `:root` block of `style.css`, and they are
the only colours the stylesheet mentions:

| Role | Custom property | Hex | Replaces |
|---|---|---|---|
| Page / base surface | `--dark-blue` | `#0c1c38` | `--dark-grey: #1f1f1f` |
| Raised surface (header, nav) | `--raised-blue` | `#16294d` | `--raised-grey: #2e2e2e` |
| Body copy | `--light-grey` | `#e6e6e6` | unchanged |
| Accents: headings, links, buttons, badges, focus ring | `--orange` | `#ff8c1a` | unchanged |
| Accent hover / focus | `--orange-bright` | `#ffa94d` | unchanged |
| Accent active (pressed) | `--orange-deep` | `#e8820f` | unchanged |

The dark blue is the dominant colour of every page: the root element and the
body sit on `#0c1c38`, and the header/nav band on the slightly lifted `#16294d`,
keeping the layering the previous scheme introduced. `#0c1c38` is deliberately
not the `#0b1e3c` this site used two rebrands ago — that shade is still on the
superseded list.

Contrast against both surfaces, checked in the suite for every foreground and
both blues (the 4.5:1 WCAG AA floor for body copy):

| Foreground | on `#0c1c38` | on `#16294d` |
|---|---|---|
| `--light-grey` | 13.58:1 | 11.54:1 |
| `--orange` | 7.28:1 | 6.18:1 |
| `--orange-bright` | 8.91:1 | 7.57:1 |
| `--orange-deep` | 6.16:1 | 5.23:1 |

A button's label is `--dark-blue` on the orange fill, which clears the same
floor in all three of its states (7.28:1, 8.91:1, 6.16:1). Every rendered line
of text on every page is re-checked against the background it actually sits on.

## 3. The new home page paragraph

Inserted verbatim, as its own `<p>` inside `index.html`'s `<main>`:

> Our board advisory services ensure that your board is composed of the most
> qualified and diverse members, driving better decision-making and governance
> and support in building your businesses roadmap for growth.

It is the first page on the site to carry two paragraphs, and `p { margin: 0 }`
left the two running together with a 0px gap between them. A `p + p` rule now
takes a `0.75rem` top margin, which is the smallest change that reads as a
paragraph break; a lone `<p>` still sits flush, so `about.html` and
`contact.html` are pixel-for-pixel where they were.

## 4. Flagged gaps

For the reviewer. Nothing here was guessed at or silently left half-done.

- **`package.json`'s `name` is still `strange-new-worlds`.** The plan puts
  renaming the package, the repository and any internal identifier out of
  scope, so only the `description` field — prose that named the site — was
  reworded.
- **No page carries a button**, so nothing existing needed restyling. The
  orange button styles (`.btn`, `.btn--secondary`, bare `button`, with hover,
  focus and active shades) live in `style.css` and now take the new dark blue
  for the primary button's label, but no page uses them: adding a button would
  be new page structure, which the plan excludes. The suite verifies them by
  injecting a bare `<button>`, a `.btn`, a `.btn` on an `<a>` and a
  `.btn--secondary` into a rendered page and reading the computed colours in
  each state, and separately pins that the shipped pages stay button-free.
  Probing the anchor found a real defect: `a:hover`, `a:focus` and `a:active`
  outrank `.btn`, so a link styled as a button rendered its label orange on an
  orange fill. The three button state rules now restate
  `color: var(--dark-blue)`, which outranks them.
- **Same for badges/tags and the current-nav-item marker.** `.badge`/`.tag` and
  `.site-nav__links a[aria-current="page"]` are styled orange and covered by
  injected-element tests, but no page ships a badge and no page sets
  `aria-current`.
- **There are no meta tags to rename.** Each `<head>` holds only `charset` and
  `viewport`, plus the icon and stylesheet links — no `description`, no Open
  Graph or Twitter card, no JSON-LD, no RSS feed, no sitemap. The plan puts SEO
  metadata beyond `<title>` out of scope anyway; tests pin their absence, so any
  future addition has to carry the new name.
- **There is no web app manifest, no footer and no copyright line** to rename,
  so the footer half of plan task 7 had nothing to edit. Their absence is
  pinned by tests.
- **No light/dark toggle exists**, so there is no second variant to reconcile —
  the site has one fixed scheme and it is now the dark blue/orange one.
- **The favicon carries no text**, so it never spelled the old name. It is an
  inline SVG data URI (a rect and a circle) repeated in each page's
  `<link rel="icon">`; its rect was painted the superseded dark grey and now
  takes `#0c1c38`. No shapes were touched. There are no other image files in
  the repository at all — no `.svg`, `.png`, `.jpg`, `.ico` or `.webp` — so no
  graphical asset needed regenerating for the new colours.
- **No README exists**, so there was nothing to update there.
- **Layout, structure and navigation are untouched**, with the one exception
  above. Beyond the colour declarations, the site name, the new home page
  paragraph and the `p + p` gap it needs, no padding, font, size, route, nav
  item or element was altered. The suite diffs every page against the baseline
  commit and fails on any changed line that is not a name or favicon-colour
  swap, pins each page's element skeleton and the nav's links, labels and
  order, and still checks the absence of sideways overflow at 1280px and 375px.
- **Branding outside this repository is untouched**, per scope: the domain, the
  hosting and any third-party listing still say the old name.
