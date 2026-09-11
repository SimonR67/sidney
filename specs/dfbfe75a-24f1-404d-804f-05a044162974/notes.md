# Implementation notes

Plan: `specs/dfbfe75a-24f1-404d-804f-05a044162974/plan.md`

What changed: the site is now called **Sid Meyers Alpha Centuri**, the page is a
dark grey and the lettering the body hands down is gold. Nothing else about the
site moved — no font, size, spacing, layout, nav item or image.

## 1. Discovery

Where the old name was written, and what each occurrence was:

| Occurrence | Kind |
|---|---|
| `index.html:6`, `about.html:6`, `contact.html:6` — `<title>` | user-visible |
| `index.html:16`, `about.html:16`, `contact.html:16` — `<h1 class="site-title">` | user-visible |
| `index.html:27` — the welcome line in `<main>` | user-visible |
| `style.css:1` — the stylesheet's header comment | internal-only |
| `package.json:4` — the `description` field | internal-only |
| `package.json:2` — the `name` field, `strange-new-worlds` | internal-only, left alone (see flagged gaps) |
| `tests/site.mjs`, `tests/page.test.mjs` — the expected name | internal-only |

Where the colours were written: all of them in `style.css`, each as a custom
property in the `:root` block, which is why the whole scheme is six lines of
declaration and every other rule refers to it by name. The favicon is the one
place outside the stylesheet that carries a shipped colour — an inline SVG data
URI repeated in each page's `<link rel="icon">`.

## 2. Palette

Every value is declared once, in the `:root` block of `style.css`, and they are
the only colours the stylesheet mentions:

| Role | Custom property | Hex | Replaces |
|---|---|---|---|
| Page / base surface | `--dark-grey` | `#2b2b2b` | `--dark-blue: #0c1c38` |
| Raised surface (header, nav) | `--raised-grey` | `#333333` | `--raised-blue: #16294d` |
| Body copy and lettering | `--gold` | `#ffd700` | `--light-grey: #e6e6e6` |
| Accents: headings, links, buttons, badges, focus ring | `--orange` | `#ff8c1a` | unchanged |
| Accent hover / focus | `--orange-bright` | `#ffa94d` | unchanged |
| Accent active (pressed) | `--orange-deep` | `#e8820f` | unchanged |

The dark grey is the dominant colour of every page: the root element and the
body sit on `#2b2b2b`, and the header/nav band on the slightly lifted `#333333`,
keeping the layering every scheme before this one has had. Neither shade is one
of the `#1f1f1f`/`#2e2e2e` pair the site used two rebrands ago — those are still
on the superseded list, along with `#0c1c38`, `#16294d`, `#0b1e3c`, `#0b2e1a`
and the `#e6e6e6` this rebrand retires.

Contrast against both surfaces, checked in the suite for every foreground and
both greys (the 4.5:1 WCAG AA floor for body copy):

| Foreground | on `#2b2b2b` | on `#333333` |
|---|---|---|
| `--gold` | 10.10:1 | 9.01:1 |
| `--orange` | 6.08:1 | 5.43:1 |
| `--orange-bright` | 7.44:1 | 6.64:1 |
| `--orange-deep` | 5.15:1 | 4.59:1 |

`--orange-deep` on the raised grey is the tightest pair at 4.59:1, which is what
kept the raised surface at `#333333` rather than anything lighter. A button's
label is `--dark-grey` on the orange fill and clears the same floor in all three
of its states (6.08:1, 7.44:1, 5.15:1). Every rendered line of text on every page
is re-checked against the background it actually sits on.

## 3. Flagged colour overrides

The rules that set a colour of their own instead of inheriting the body's gold.
Each one was looked at; none was silently left inconsistent.

- **`h1` and `h2` stay `--orange`.** Headings are the site's accent and have been
  since the original build. The plan puts per-section colour overrides out of
  scope unless they inherit the global colour being replaced, and these do not —
  they name the accent explicitly. Legible on both greys (6.08:1, 5.43:1).
- **`a`, `a:hover`, `a:active` stay `--orange`/`--orange-bright`/`--orange-deep`.**
  Same reasoning: links are accents, not body copy, and out of scope.
- **`.site-nav__links a` and its `:hover`, `:active` and `[aria-current="page"]`
  states stay orange**, for the same reason. They are the only text on the raised
  grey, and the tightest of them is 4.59:1.
- **`:focus-visible` keeps its orange outline** — an accent, and not text colour
  at all.
- **`.btn`, `button` and their `:hover`/`:focus`/`:active` states did change**,
  but only where they named the page colour: the label was `var(--dark-blue)`,
  the old global background, so it now reads `var(--dark-grey)`. The orange fill
  and border are untouched. No page ships a button (see below).
- **`.badge` and `.tag` stay orange**, border and label alike — accents again,
  and no page ships one.
- **`.btn--secondary` keeps `background-color: transparent`**, so it inherits the
  new page grey behind it with nothing to change.
- **The `.site-header` bottom border stays `1px solid var(--orange)`** — an accent
  rule, and a border rather than lettering.

Nothing else overrides a colour: there are no inline `style` attributes on any
page, no `<style>` block, and `style.css` is the only stylesheet the site ships.
The suite pins all three.

## 4. Flagged gaps

For the reviewer. Nothing here was guessed at or silently left half-done.

- **`package.json`'s `name` is still `strange-new-worlds`.** The plan puts
  renaming the repository, the domain and any internal identifier or config key
  out of scope beyond the user-facing title string, so only the `description`
  field — prose that named the site — was reworded.
- **The favicon's page colour follows the page.** It carries no text, so it never
  spelled a name, but its rect was painted the superseded `#0c1c38` and now takes
  `#2b2b2b`; the orange circle is untouched, and no shape changed. Repainting it
  is what keeps the superseded-shade check clean, and it is the same swap the two
  rebrands before this one made. There are no other image files in the repository
  — no `.svg`, `.png`, `.jpg`, `.ico` or `.webp` — so nothing else needed
  regenerating, and no logo or icon artwork was altered.
- **No page carries a button, badge, tag or `aria-current` marker**, so the
  restyled button label and the accent rules above have nothing on the shipped
  pages to apply to. The suite verifies them by injecting the elements into a
  rendered page and reading the computed colours in each state, and separately
  pins that the shipped pages stay button-free.
- **There are no meta tags, web app manifest, footer or copyright line** carrying
  a name or a colour: each `<head>` holds only `charset` and `viewport` plus the
  icon and stylesheet links. Tests pin their absence, so any future addition has
  to carry the new name.
- **No light/dark toggle exists**, so there is no second variant to reconcile —
  the site has one fixed scheme and it is now the dark grey/gold/orange one.
- **No README exists**, so there was nothing to update there.
- **Layout, structure and navigation are untouched.** Beyond the colour values,
  the custom-property names and the site name, no padding, font, size, route, nav
  item or element was altered. The suite diffs every page against the baseline
  commit and fails on any changed line that is not a name or favicon-colour swap,
  pins each page's element skeleton and the nav's links, labels and order, and
  still checks the absence of sideways overflow at 1280px and 375px.
- **Branding outside this repository is untouched**, per scope: the domain, the
  hosting and any third-party listing still say the old name.
