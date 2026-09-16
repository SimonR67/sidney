# Notes: the site-wide Wrocław watermark

Plan: specs/aea7c6d4-8f64-4957-8f2d-8392a0fce7cb/plan.md

## 1. Discovery

Tasks 1 and 2 of the plan are a spike: find the shared layout/base template and
the global stylesheet that every page actually loads, and confirm where
`Wroclaw.jpg` sits. What the repository holds, traced page by page before
anything was written:

- **There is no shared layout or base template.** No `layout.html`, no
  `_layout.ejs`, no `base.html`, no include mechanism, no template engine and
  **no build step** — `package.json` declares no dependencies and a single
  `test` script. Every page is a complete, hand-written `.html` file at the
  repository root, each with its own copy of the header. The plan's file-map row
  for "shared layout/base template" therefore lands on no file: the watermark is
  hung off `body::before` in the stylesheets instead, so nothing has to be
  pasted into seven pages by hand.
- **There are two stylesheets, and between them they reach every page.** Traced
  from the `<link rel="stylesheet">` of each page:

  | Page | Stylesheet |
  |---|---|
  | `index.html` | `styles/main.css` |
  | `careers.html` | `styles/main.css` |
  | `case-studies.html` | `styles/main.css` |
  | `contact-us.html` | `styles/main.css` |
  | `team.html` | `styles/main.css` |
  | `about.html` | `style.css` |
  | `contact.html` | `style.css` |

  `styles/main.css` is the Softpapaya site; `style.css` is the legacy "Sid
  Meyers Alpha Centuri" page set behind it. Seven pages, two sheets, no third
  sheet and no page that links both. "Every page of the site" therefore means
  the same block written into both sheets — which is why this job touches two
  files rather than one. `tests/watermark.test.mjs` re-traces the mapping rather
  than trusting this table.
- **`Wroclaw.jpg` is at the repository root**, 272,057 bytes, 1488 × 1188,
  alongside `Sofia.jpg` and `SoftPapaya-logo.png` — the same place every other
  image the site ships sits. It is referenced and nothing else: not copied, not
  moved, not re-encoded, not resized.
- Neither stylesheet had a `url()` in it before this job, so there was no
  convention to follow for the path. Both now use a path relative to the sheet,
  which is what every `<img src>` on the site already does: `../Wroclaw.jpg`
  from `styles/main.css`, `Wroclaw.jpg` from `style.css`. Both resolve to the
  same file, and neither depends on the site being served from a domain root.
- **No print stylesheet exists** — neither sheet had an `@media print` block,
  and there is no `<link media="print">` on any page. Plan task 8's "if one
  exists" branch therefore had nothing to confirm; see section 3.

## 2. The hook, and the one declaration it needs

The watermark is `body::before`: `position: fixed`, inset to `0` on all four
sides, `z-index: -1`, `background-size: cover`, `background-position: center`,
`opacity: 0.05`, `pointer-events: none`. A pseudo-element rather than the
`<div class="watermark-bg">` the plan's file map allows, because with no shared
template that div would have to be pasted into all seven pages and kept in step
by hand.

The block also declares `isolation: isolate` on `body`, which is not decoration:

- Both sheets give `body` an opaque `background-color` (`--page` on the
  Softpapaya pages, `--dark-grey` on the legacy ones).
- In the painting order, a `z-index: -1` descendant of the root paints *before*
  the backgrounds of non-positioned block descendants — so without a stacking
  context on `body`, the watermark paints **under** the body's own opaque
  background and is invisible. The rule looks right and shows nothing.
- `isolation: isolate` makes `body` a stacking context, so its background paints
  first and the `-1` layer paints over it, still below every piece of content.
  It creates a stacking context and nothing else — no containing block — so the
  sticky masthead and the fixed watermark both still measure the viewport, and
  no box on any page moves. `tests/watermark.test.mjs` checks the geometry of
  every element on every page, at 1440px and at 375px, with the layer and
  without it.

Faintness is `opacity` on that layer, and not an edit to the file: on a flat
area of a page the watermark moves a pixel by at most `opacity` × 255, which is
measured rather than asserted.

It is set at **0.05**, the faint end of the spec's 5–10% band, rather than the
0.07 it was first written at. Task 7 asks for both a light and a dark page to be
looked at, and the dark one is why: the photograph is a bright daylight square,
so against the legacy pages' `#2b2b2b` every one of its pixels is *lighter* than
the surface it sits on, and the same opacity that reads as a whisper on the
white Softpapaya pages reads much louder there. 0.05 is as faint as the spec's
own range allows. Text stays well clear of AA on both: worst case — the
photograph running pure black or pure white behind the copy — gold on the dark
grey holds 8.67:1, the legacy orange 5.22:1 and the Softpapaya ink 15.58:1. The
orange is the one worth noting: at 0.1 it would fall to 4.44:1, just under AA,
which is the other reason the layer is set at the bottom of the range and why
the check reads the opacity the sheet declares rather than the range's ceiling.

## 3. Print

No print stylesheet existed, so there was none to leave untouched. Rather than
add one, the whole watermark block is wrapped in `@media screen` in both sheets.
That keeps print output exactly as it was — the layer does not exist at all when
the page is printed, which the test checks by printing the page (`Emulation.
setEmulatedMedia`) rather than by reading the CSS — and it adds no `@media
print` block to either sheet.

## 4. Flagged for the reviewer

- **Sub-pixel text anti-aliasing changes.** A translucent layer under the page
  costs Chrome its LCD sub-pixel anti-aliasing: glyph *edges* come out greyscale
  rather than colour-fringed, whether or not the image itself loads. Nothing
  moves and no text colour changes — it is the edge pixels only, and it is
  inherent to painting anything behind the content, not to this particular
  image or opacity. It is why the pixel checks in `tests/watermark.test.mjs`
  measure flat areas of the page and leave glyph edges out.
- **The watermark shows only where the page is transparent.** Cards, tags, the
  masthead, form controls, the call-to-action band and the footer all carry
  their own opaque backgrounds, and the watermark is behind them by design. On
  every page there is enough open page around them for it to read; the test
  requires it on more than 5% of each page's flat pixels.
- **Two sheets, one block, written twice.** There is no shared stylesheet to put
  it in once and no build step to import it with, so the same rule is written
  into `styles/main.css` and `style.css`. If the two page sets are ever merged
  onto one sheet, this is one of the duplications to collapse.
- **`background-attachment` is a formality here.** The plan asks for `fixed` on
  the desktop and `scroll` below the breakpoint, and both are declared, at the
  site's own 768px step. The layer is itself `position: fixed`, so neither value
  moves it; `scroll` is there because `fixed` is the attachment mobile Safari
  has historically repainted expensively.
- **Pre-existing test failures, untouched.** Twelve checks in the older suites
  (`page.test.mjs`, `team-restore.test.mjs`, `values-section.test.mjs`) already
  failed before this job, on the commit it branched from — three of them because
  `Wroclaw.jpg` landed in the repository root without their file inventories
  being updated, the rest for reasons of their own. This job neither fixes nor
  adds to them; they are out of its scope.
