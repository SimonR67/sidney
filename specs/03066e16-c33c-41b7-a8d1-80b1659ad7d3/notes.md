# Notes: swapping the watermark photograph for `Wroclaw1.jpg`

Plan: specs/03066e16-c33c-41b7-a8d1-80b1659ad7d3/plan.md

## 1. Discovery

Task 1 of the plan is a spike: find every reference to `Wroclaw.jpg` and record
the mechanism each one uses, before a single character is swapped. The search
was `Wroclaw` — the bare stem, not the filename — so that an `<img>`, an inline
`style`, a JSON config key or a half-written path would all have surfaced. Every
match in the repository as it stood at the plan commit, and what it is:

| File | Line | What it is |
|---|---|---|
| `styles/main.css` | 943 | The watermark block's own comment, naming the photograph it draws |
| `styles/main.css` | 966 | `background-image: url('../Wroclaw.jpg')` — the Softpapaya sheet's reference |
| `style.css` | 185 | The same comment in the legacy sheet |
| `style.css` | 204 | `background-image: url('Wroclaw.jpg')` — the legacy sheet's reference |
| `tests/site.mjs` | 965 | `WATERMARK_IMAGE`, the constant `tests/watermark.test.mjs` holds the layer to |
| `index.html` | 143 | Prose: "modern offices in Exeter, Dublin, Wroclaw and …" — the **city**, not the image |
| `specs/**` | — | Job paperwork: the earlier watermark spec/plan/notes, and this job's own |

Two of those are references to the image: one `url()` per stylesheet. The rest
are a comment each beside them, the test constant, one sentence of body copy
that happens to name the city, and paperwork. `index.html:143` is the only match
that needed a judgement call, and it is not a reference — it names no file, no
extension and no path, and the pages carry the watermark in CSS alone.

The mechanism, identical in both sheets and confirmed by reading both blocks:

- The layer is `body::before` — a pseudo-element, not a `<div>` and not an
  `<img>`. **No HTML file names the photograph at all**, so there is no markup,
  no inline `style` attribute and no template to change. There is no build step
  and no template engine either, so nothing generates a third reference.
- Faintness is `opacity: 0.05` on the pseudo-element, with no overlay, tint or
  blend mode involved: the photograph itself is what fades.
- Layering is `position: fixed`, inset `0` on all four sides, `z-index: -1`,
  `pointer-events: none`, over `isolation: isolate` on `body`.
- Sizing is `background-size: cover`, `background-position: center center`,
  `background-repeat: no-repeat`, `background-attachment: fixed`.
- The whole block sits inside `@media screen`, so print output is untouched.
- One media query follows it, `@media screen and (max-width: 767px)`, and it
  declares `background-attachment: scroll` and nothing else — it does **not**
  re-declare the image. So there is no mobile-specific reference to swap, and
  the plan's third file-map row lands on no file.

Both sheets between them reach all seven pages (`styles/main.css` for the
Softpapaya pages, `style.css` for the two legacy ones), which is why this job
touches two files rather than one. See
specs/aea7c6d4-8f64-4957-8f2d-8392a0fce7cb/notes.md for the page-to-sheet
tracing, which has not changed.

## 2. The two files

Task 2 is the other half of the spike: confirm the new photograph is really
there, under that exact name, before anything points at it.

- **`Wroclaw1.jpg` is at the repository root**, tracked by git, 602,887 bytes,
  **2900 × 2263** — an aspect ratio of 1.2815:1, landscape. Its first two bytes
  are `FFD8`, so it is a JPEG, and headless Chrome decodes it at that natural
  size when served from the root. The name is exactly `Wroclaw1.jpg`: capital
  W, lower-case `.jpg`, no space, no `_`, and it sits beside `Sofia.jpg` and
  `SoftPapaya-logo.png` where every other image the site ships already sits. So
  the paths both sheets need are `../Wroclaw1.jpg` from `styles/main.css` and
  `Wroclaw1.jpg` from `style.css` — the same shape as the paths they already
  had, each resolved relative to its own sheet.
- **`Wroclaw.jpg` is not in this repository.** It is in neither the working
  tree nor any commit: the repository has a single commit, and that commit
  carries `Wroclaw1.jpg` and no `Wroclaw.jpg`. Both stylesheets pointed at a
  file that was never there, so **before this change every page requested
  `/Wroclaw.jpg`, got a 404 and painted no watermark at all**, and the
  `Wroclaw.jpg` assertions in `tests/watermark.test.mjs` could not pass. The
  swap is therefore also the fix for that. Two consequences worth stating
  plainly:
  - The plan's "leave `Wroclaw.jpg` in the repo, do not delete it" line has
    nothing to act on. No file was removed, renamed or edited by this job; the
    old name simply does not exist here. Nothing is needed to honour it.
  - The spec's "flag it if the new photograph reads as less faint than the old
    one" cannot be a before/after comparison, because there is no "before"
    image to render. It is answered by measurement instead, in section 4.

## 3. Sizing: nothing to adjust

Plan task 5 is conditional — adjust `background-size`/`background-position`/
`background-repeat` *only if* the new photograph's aspect ratio would stretch or
crop badly where the old one did not. It does not, so none of the three moved:

- `cover` scales an image proportionally by construction. It cannot stretch or
  distort whatever it is given; the only question it leaves open is how hard the
  image is cropped.
- The two photographs are almost the same shape — 1.2815:1 against the old
  1.2525:1 (1488 × 1188, recorded in the earlier job's notes), 2.3% apart. So
  `cover` crops the new one within a whisker of how it cropped the old one. At
  1440 × 900 the drawn image is 1440 × 1124, 1.249× the viewport height against
  the old 1.278×; at 375 × 667 it is 855 × 667, 2.279× the viewport width
  against the old 2.228×. Both are centred crops of a landscape photograph in a
  portrait viewport, which is what the site already asked for.
- The new file is much larger in pixels (2900 × 2263 against 1488 × 1188), so
  it is only ever scaled *down* on the viewports tested — it cannot be
  upsampled into softness at any common width.

Keeping the three declarations untouched is also what the plan's definition of
done prefers: the diff stays at the filename.

## 4. The visual pass

Both page sets were rendered in headless Chrome at 1440 × 900 and at 375 × 667,
and the layer was also rendered on its own at `opacity: 1` at both widths so the
framing could be read rather than guessed at:

- At both widths the photograph is the market square, upright and in proportion:
  no stretching, no squashing, no tiling, and a centred crop that keeps the
  gables and the fountain in frame. On the phone the crop is tighter — a
  landscape photograph in a portrait viewport — and lands on the middle of the
  square, which is the same behaviour `cover` gave the old image.
- On the Softpapaya pages (`index.html` and the four beside it) the layer reads
  as a very faint texture behind the hero and between the cards; every heading,
  paragraph, pill and card keeps its own surface and its own contrast.
- On the two legacy pages the layer is more noticeable than it is on the light
  ones — see section 6 — but the gold and orange text over the dark grey stays
  clearly legible at both widths.

## 5. What the suite says

`tests/watermark-swap.test.mjs` is new — one `describe` per numbered task in the
plan, 23 tests, all passing. Each was written before the change it covers and
watched to fail for the right reason first: tasks 1 and 2 are the spike and
passed on the unchanged tree by design, tasks 3–6 failed on the old filename
(`about.html draws url("…/Wroclaw.jpg")`, `style.css still names Wroclaw.jpg`,
`the watermark is invisible at 375px`) and pass on the new one.

`npm test` was also run on `main` and on this branch, from a clean worktree
each time, and compared subtest by subtest:

- **Nothing that passed on `main` fails here.**
- **22 subtests that failed on `main` pass here** — every one of them a
  consequence of the 404 described in section 2: the watermark suite's "is
  fetched once per page, and served", "is actually visible", "shifts no flat
  pixel", and every "logs nothing to the console and drops no request" and
  "renders cleanly, console and network included" check across the crawl,
  contact, services, team and case-study suites.
- **12 subtests fail identically before and after.** They belong to earlier
  jobs and are unrelated to this one: audits and byte-for-byte diffs that expect
  a commit history this checkout does not have (it has a single commit), plus
  the file inventory in `tests/page.test.mjs`, which wants the rebrand notes to
  account for `Wroclaw1.jpg` — a file that landed after those notes were
  written. Untouched here, as out of scope.

## 6. Flagged for the reviewer

- **The watermark is visible on the site for the first time.** Not a regression,
  but reviewers comparing against a deployed build should expect the faint
  photograph to appear where there was none, for the reason in section 2.
- **Faintness is unchanged and measured.** `opacity: 0.05` is byte-for-byte what
  it was in both sheets, and `tests/watermark.test.mjs` re-runs its own
  faintness checks against the new photograph: no flat pixel of `index.html` or
  `about.html` shifts by more than the layer's allowance, and every body-text
  colour the two page sets use still clears AA contrast when blended against a
  pure-black *and* a pure-white pixel at that opacity — the worst case any
  photograph could put behind the text. So the new image cannot reduce
  legibility whatever it contains.
- **The layer reads more strongly on the two dark legacy pages than on the five
  light ones.** A daylight photograph at 5% lifts a `#2b2b2b` surface by nearly
  the whole 13/255 it is allowed, and against a dark surface that shift is far
  easier to see than the same shift against white — so on `about.html` and
  `contact.html` the buildings are discernible rather than merely textural.
  This is a property of the 5%-over-dark layer the earlier job shipped, not of
  the swap: the photograph being replaced was a daylight shot of the same square
  and would have lifted those pages by the same amount. Nothing here changes the
  opacity, which the spec puts out of scope; if the effect is unwanted on the
  dark pages it is a separate decision about the layer, and worth raising as
  one.
- **`tests/site.mjs` now points at the new file** (`WATERMARK_IMAGE`, and the
  byte count and pixel size in `WATERMARK_IMAGE_FILE`), with the old name kept
  beside it as `WATERMARK_IMAGE_WAS` for the two places that are about the
  history rather than the site: this job's "no reference left" check, and the
  earlier job's discovery notes, which recorded the name that was true when they
  were written.
