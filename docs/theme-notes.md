# Theme notes — black, gold and aqua

Findings and decisions for the colour-scheme job
(`specs/dccfae81-4d05-4206-9959-224ae7058bcc/plan.md`): black page background,
gold headings, aqua body text.

The site is four hand-written files served straight from the repository root
(three pages plus one stylesheet) with no build step, so "source" and "deployed
output" are the same files.

## Styling sources

Every place a colour can be declared. Task 1 of the plan asks for this
inventory; the test suite re-derives it from the files on each run, so a new
stylesheet, `<style>` block or `style=""` attribute appearing anywhere fails the
build until it is listed here.

| File | Kind | Role |
|---|---|---|
| `styles.css` | External stylesheet | The site's only stylesheet, and the only CSS source. Linked by all three pages. Holds the `:root` theme variables and every colour rule. |
| `index.html` | Inline `style=""` / `<style>` | None. Its only colour literals are the two hexes inside the inline SVG favicon data URI — a non-CSS asset, out of scope (see Flagged). |
| `about.html` | Inline `style=""` / `<style>` | None. Same favicon data URI as the other pages. |
| `contact.html` | Inline `style=""` / `<style>` | None. Same favicon data URI as the other pages. |

## Pages and their styling

Every page in the repository, and exactly what styling each one loads. All
three link the same single stylesheet and carry no inline styling at all, so
there is one place to change and no per-page override to chase.

| Page | Template variant | Stylesheet | Style blocks | Style attributes |
|---|---|---|---|---|
| `about.html` | Interior page (`section.page`) | `styles.css` | 0 | 0 |
| `contact.html` | Interior page (`section.page`) | `styles.css` | 0 | 0 |
| `index.html` | Home / hero (`section.hero`) | `styles.css` | 0 | 0 |

Two template variants exist: the home page's hero (`section.hero`,
`.hero__title`, `.hero__tagline`, `.hero__cta`) and the interior-page layout
(`section.page`, `.page__title`) shared by About and Contact. Both are styled
entirely from `styles.css`; neither introduces a colour of its own.

Heading usage was spot-checked for the "technically a heading tag, not really a
title" case the plan asks about: there is none. Each page carries exactly one
heading, an `h1` that *is* its visible page title (`.hero__title` on Home,
`.page__title` on About and Contact), and no `h2`–`h6` anywhere. The gold rule
covers all six levels regardless, so a heading added later is gold by default;
the test suite renders a probe of every level on every page to prove it.

## Theme variables

`styles.css` already declared its colours as CSS custom properties in a `:root`
block, so the theme is applied by pointing the structural rules at new tokens
rather than by hard-coding values at the point of use. Every colour in the
stylesheet still comes from this table.

| Token | Hex | Family | Role |
|---|---|---|---|
| `--black` | `#000000` | black | Page background: `html`, `body`, `.hero` and `.page` |
| `--gold` | `#ffd700` | gold | Every heading, `h1`–`h6`, including `.hero__title` and `.page__title` |
| `--aqua` | `#00ffff` | aqua | Body text: the `body` colour every paragraph, list item, span and generic container inherits |
| `--navy` | `#071c2e` | blue | CTA label, on the orange fill (out of scope — see Flagged) |
| `--navy-raised` | `#0d2e4a` | blue | Nav band background (out of scope — see Flagged) |
| `--ember` | `#ff7a18` | orange | Brand, nav links and CTA fill (out of scope — see Flagged) |
| `--ember-bright` | `#ffa34d` | orange | Hover and focus states (out of scope — see Flagged) |
| `--edge` | `#1c4a73` | blue | Hairline border under the nav bar (out of scope — see Flagged) |

The token `--mist` (`#cfe0f2`, the previous neutral body text) is gone: aqua
takes over its only role. `docs/palette-notes.md` records the palette as the
previous job left it and is not rewritten here.

Contrast, measured against the background each colour actually sits on:

| Foreground | Background | Ratio |
|---|---|---|
| `--gold` headings | `--black` | 15.1:1 |
| `--aqua` body text | `--black` | 16.7:1 |
| `--ember` nav links and brand | `--navy-raised` | 5.3:1 |
| `--navy` CTA label | `--ember` fill | 6.6:1 |

## Flagged — left unchanged, for reviewer sign-off

The plan's "out of scope" list keeps this change to the page background, the
headings and the body text. These are the surfaces that now sit alongside the
new theme without having been recoloured; each is listed as the plan requires
rather than fixed.

| Item | Location | Status | Reason |
|---|---|---|---|
| Nav bar background and its hairline border | `styles.css` `.site-header` | Left unchanged | The spec's out-of-scope list names nav bars and borders explicitly. The band stays `--navy-raised` above the now-black page, so it reads as a raised surface rather than disappearing into it. |
| Nav brand and nav link colour | `styles.css` `.site-nav__brand`, `.site-nav__links a` | Left unchanged | Link colour, and its hover/visited treatment, is called out in the spec as an open question rather than a requirement, so the existing orange is left for whoever answers it. |
| Call-to-action button fill and label | `styles.css` `.hero__cta` | Left unchanged | The out-of-scope list names buttons. Recolouring the label to aqua would also have dropped it below the 4.5:1 it currently holds against its orange fill. |
| Hover and focus states | `styles.css` `:hover` / `:focus` rules | Left unchanged | They belong to the link and button treatments above, which are themselves out of scope. |
| Inline SVG favicon | `index.html`, `about.html`, `contact.html` line 10 | Left unchanged | The out-of-scope list rules out changes to non-CSS assets including favicons, "even if they now clash visually". The favicon keeps its dark-blue field and orange bar, which no longer matches the black page — flagged here, deliberately not fixed. |
| Inline `<style>` blocks and `style=""` attributes | repo-wide | None present | Plan task 6 found nothing to update: no page carries either, so there is no stale per-page override to bring in line. The inventory test above fails if one ever appears. |
| Print stylesheet and email templates | repo-wide | None present | The site has no `@media print` block and no email templates, so nothing outside the shared stylesheet needed the same treatment. |
| Images | `images/` | Left unchanged | Photographs, not theme assets. The out-of-scope list excludes image assets from the recolour. |

## Existing tests this job had to update

The suite already asserted the previous dark-blue-and-orange scheme, so a
handful of tests contradicted the new theme by design. They were retargeted at
black/gold/aqua rather than deleted, and they still assert the same properties:

- `Task 4: dark blue and orange colour scheme` — renamed to
  `Task 4: black, gold and aqua colour scheme`. The page-background,
  hero-background and title-colour assertions now expect black and gold; the
  "no colour outside the scheme" sweep now admits gold and aqua alongside the
  out-of-scope orange and blue. The nav-bar, CTA and contrast tests are
  unchanged and still pass.
- `Palette task 4/5/8` — the tests that require `:root` to match a documented
  palette now read the `## Theme variables` table above, which is the current
  palette. `docs/palette-notes.md` keeps the historical table describing what
  the green → orange/blue job produced, and the tests reading it as history
  (the audit inventory, its dispositions and its sign-off list) are untouched.
- `Palette task 6: renders a favicon whose colours match the page it labels` —
  now asserts the favicon is left alone and that the clash is signed off in the
  Flagged table above, because this plan puts favicons out of scope.
- `Test plan: end-to-end walkthrough` — its background/title colour assertions
  now expect black and gold.

`Palette task 9: does repaint the page` still fails, exactly as it did on
`main` before this job: it requires the pre-change render to contain green, and
the commit it compares against has been the post-green one since the palette
job landed. It is not made worse here — the sibling layout-diff tests in the
same block now run for real (this job leaves the markup untouched) and confirm
the change is colour-only.
