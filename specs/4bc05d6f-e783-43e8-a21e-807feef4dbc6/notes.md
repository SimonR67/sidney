# Notes: Case Studies page with sticky nav and enlarged logo

Plan: specs/4bc05d6f-e783-43e8-a21e-807feef4dbc6/plan.md
Spec: specs/4bc05d6f-e783-43e8-a21e-807feef4dbc6/spec.md

## 1. Discovery

What the repository actually holds, read before anything was written:

- `index.html` — the Softpapaya Services home page. Carries the header the plan
  calls the "shared nav": `.masthead` > `.masthead__inner` > `.masthead__logo`
  (an `<img class="masthead__mark">`), `.masthead__nav` > `.masthead__links`, and
  the `.masthead__cta` button. Eight nav entries, in order: About, Services,
  Values, Team, **Case Studies**, Careers, Blog, Contact.
- `contact-us.html` — the Contact Us page. Carries a byte-identical copy of that
  same header, with the in-page anchors qualified by `index.html`.
- `styles/main.css` — the one stylesheet both pages are styled from. Written
  mobile-first, with its media queries (`768px`, `1024px`) collected at the foot.
- `cases/ComixIT.pdf`, `cases/Learning.pdf`, `cases/Professional-Services.pdf` —
  the three sources. The plan writes the folder as `case/`; it is `cases/` on
  disk. All three open and parse; none is missing.
- `about.html`, `contact.html`, `style.css` — the legacy "Sid Meyers Alpha
  Centuri" page set. A different site, a different stylesheet, a different header
  (`.site-header` / `.site-nav`). `tests/page.test.mjs` audits them byte for byte
  and they are **not** the shared nav this job changes.
- `tests/` — `node --test`, no npm dependencies, with a headless-Chrome driver in
  `tests/browser.mjs` and the site's shared constants in `tests/site.mjs`.
- `package.json` — no build step and no dependencies. **The files served are the
  built site**, which `tests/page.test.mjs` asserts.

## 2. File map, as the plan names it and as it exists

The plan's file map describes a templated site (`templates/partials/nav.html`,
`templates/pages/case-studies.html`, `content/case-studies/*.html`, a router
config). This repository has none of those: it is a flat static site with no
build step. The map was followed to its intent, file for file:

| Plan | Here | Why |
|---|---|---|
| `templates/partials/nav.html` | `index.html`, `contact-us.html` | The nav is inlined on each page; there is no include mechanism. Both copies are edited together so the nav stays shared in fact. |
| `templates/pages/case-studies.html` | `case-studies.html` | The site's slug convention is a flat `.html` at the root — `contact-us.html` set it. |
| `content/case-studies/*.html` | the page itself, plus `CASE_STUDIES` in `tests/site.mjs` | A separate content directory would ship files no page loads, which the "no build step, the served files are the built site" audit forbids. The verbatim copy is held once in `tests/site.mjs` and diffed against the page, exactly as `VALUES_BOXES` and `BOXES` already are. |
| Router / pages config | none needed | A static host serves `case-studies.html` at `/case-studies.html`; there is no route table to register. |
| `css/style.css` | `styles/main.css` | `style.css` at the root belongs to the legacy pages. |
| `assets/img/case-studies/<slug>/*` | same path | Kept as the plan writes it rather than dropped at the root beside `Sofia.jpg`. |

## 3. The three sources, and what came out of them

Each PDF is a single landscape page: a text column on the left and one graphic
panel on the right. Nothing failed to open or parse, so no box shipped blank.

| PDF | Title | Graphic |
|---|---|---|
| `cases/ComixIT.pdf` | Building Comixit | "Comixit Reading App" panel: three stat cards, a three-step "Comic Reformatting Engine" flow, a result band |
| `cases/Learning.pdf` | Rescuing and Scaling | "Apprenticeship Platform Health" panel: three stat cards, a two-bar completion-rate chart, a 50% donut |
| `cases/Professional-Services.pdf` | Centralising Group Management Reporting | "Group Performance Dashboard" panel: three stat cards, a four-quarter grouped bar chart with a legend, a four-region donut with a legend |

All three panels are **vector** artwork drawn in the PDF — there is no embedded
raster image to extract and hue-shift. They were rebuilt as SVG, shape for shape
and word for word, in the papaya palette below. No PDF was modified.

The text in each panel (headings, stat figures, captions, legends) is part of the
graphic and stays in the graphic. The left-hand column — eyebrow, title,
subtitle, sector/client line, Challenge, Solution, Effects, Stack — is the copy
that goes into the box, verbatim, typos and phrasing untouched.

## 4. Papaya palette for the recoloured graphics

The originals are deep navy panels carrying pale cards, white lettering and one
orange accent. Each role was mapped onto a papaya of the same lightness, so the
panels stay recognisably the same artwork with papaya as the dominant colour.

| Role | Original | Recoloured |
|---|---|---|
| Panel ground | deep navy | `#3d1706` |
| Unfilled track on the panel | mid navy | `#52210a` |
| Card on panel | pale tint | `#fbdcc2` |
| Accent / series | mid orange | `#e56717` — the site's own `--papaya` |
| Second and third ring step | mid / deep | `#f2a05a`, `#d95a12` |
| Fourth ring step | darkest | `#7a3208` |
| Lettering | white / pale | `#ffffff` / `#f3d9c6` |
| Lettering on a card | deep navy | `#4a1e05` |

The four-region donut in `Professional-Services` needs four steps of one hue:
`#fbdcc2`, `#f2a05a`, `#d95a12`, `#7a3208`. Checked with the palette validator
against the `#3d1706` panel — every adjacent pair clears the normal-vision floor
(worst ΔE 16.2) and the CVD floor (worst ΔE 14.8, deutan). Two things the
validator flags are the source artwork's own and were kept rather than
redesigned: the palest step sits above its categorical lightness band, and the
darkest sits at 1.73:1 on the panel. The relief a contrast warning asks for is
visible labels, so the source's legend is kept and every segment is cut from the
next by 2px of the panel, which puts each one's extent beyond doubt. The
two-series quarterly chart uses `#fbdcc2` and `#e56717` — ΔE 28.6 normal, 26.1
deutan, both above 3:1 on the panel — and keeps its legend too.

## 5. The boxes: the "WHAT WE OFFER" component, one column wide

The boxes are `.services__grid` > `.card`, reused class for class, the way the
VALUES band already reuses them (see
`specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/notes.md`). That brings the border,
the `10px` radius, the `26px 24px` padding, the background and the shadow with
them rather than approximating any of it, and it brings the grid's papaya / lime
/ black border rotation too — with three boxes, ComixIT is papaya, Learning is
lime and Professional Services is black.

The only thing declared for the grid itself is the column count — `.case-studies
.services__grid { grid-template-columns: 1fr }`, plus the `32px` that sets it
below the page heading. Scoping the rule to the band gives it the specificity to
hold past the `768px` and `1024px` media queries that widen the services grid,
without editing either of those rules.

Inside the box, `.card__title` and `.card__copy` are the existing hooks. The
parts the offer boxes have no equivalent for — the eyebrow, the subtitle, the
sector/client line, the Challenge/Solution/Effects sub-headings, the stack line
and the graphic — take `.case-study__*` classes that set nothing but position and
draw every colour and size from the tokens already in `:root`.

## 6. Sticky nav: why `sticky` and not `fixed`

`position: sticky` keeps the masthead in the document flow. Nothing is hidden
behind it on load and nothing is hidden behind it while scrolling, because the
page's content begins where the masthead ends — which is what the plan's
"site-wide top padding/margin" is for. `position: fixed` would take the masthead
out of flow and need that padding restored by hand at each width, and the
masthead is **150.6px** tall below 600px, **120.2px** to 1023px and **83.8px**
above it, because the nav drops onto a row of its own on narrow screens. A fixed
header of that height would cover a fifth of a phone screen and the padding under
it would have to be re-guessed at every breakpoint. So: sticky.

The one place a sticky header does hide content is an anchor jump — the nav's
About / Services / Values links land their band at the top of the viewport, under
the header. `html { scroll-padding-top: var(--masthead-clearance) }` offsets
every such jump by the header's height, declared once and stepped at the site's
own two breakpoints. This supersedes the "lands 0px from the top" assertions in
`tests/origin-section.test.mjs` and `tests/values-section.test.mjs`, which now
assert the band lands clear of the masthead instead.

## 7. Logo: 1.6x, and what it does to the header

`.masthead__mark` was capped at `height: 28px`. It is now
`calc(28px * 1.6)` = `44.8px`, written as `calc(var(--logo-height) *
var(--logo-scale))` so the 60% is in the stylesheet rather than in a rounded
number. The width stays `auto`, so the 655×198 file keeps its ratio: 92.6px wide
becomes 148.2px.

The header does not get taller. The `TALK TO US` button is 47.8px tall, so it —
not the logo — sets the height of the header's first row at every width, both
before and after the change. Nothing overlaps and nothing wraps differently;
`tests/case-studies.test.mjs` measures the logo, the nav and the button at 320,
375, 414, 768, 1024, 1280 and 1440px to hold that.

`tests/homepage-refresh.test.mjs` capped the rendered logo at 40px tall — the
height the text title it replaced sat at. That cap is this job's to move, and it
now reads from `LOGO_HEIGHT` in `tests/site.mjs`.

## 8. Open questions from the spec, settled

- **Slug** — `case-studies.html`. `contact-us.html` set the convention: a flat,
  hyphenated `.html` at the repository root.
- **Menu position** — unchanged. A "Case Studies" entry is already the fifth of
  the eight, pointing at `#`. This job repoints it; it does not move or reword
  it, which is the same one-attribute change "About" and "Values" each took.
- **Box heading** — the PDF's own title is the heading (`Building Comixit`,
  `Rescuing and Scaling`, `Centralising Group Management Reporting`), with the
  PDF's second line under it as a subtitle. Nothing is invented, and the boxes
  are ordered ComixIT → Learning → Professional Services as the plan requires.
- **Papaya hex** — `--papaya: #e56717`, the token already in `:root`, with the
  supporting shades in section 4 derived from it.
- **Where the images live** — committed as static SVG under
  `assets/img/case-studies/<slug>/`. There is no build step to generate them in.
- **Mobile menu** — there is none. The nav is a horizontal list that wraps onto
  its own row below 1024px. Left exactly as it is; converting it to a hamburger
  is out of scope.
- **Scrolled state** — the masthead looks the same scrolled or not. It already
  carries a `1px` bottom rule and it gets an opaque `--page` background so the
  content passing under it does not show through; nothing else changes on scroll.

## 9. Out of scope, deliberately not touched

- `about.html`, `contact.html` and `style.css` — the legacy page set. They carry
  their own header, not the shared masthead, and `tests/page.test.mjs` audits
  them against the commit that created them.
- The "WHAT WE OFFER" section itself, its copy, its colours and its breakpoints.
- The wording taken from the PDFs, in any direction.
- The logo artwork, the nav's wording, its order and its mobile behaviour.
