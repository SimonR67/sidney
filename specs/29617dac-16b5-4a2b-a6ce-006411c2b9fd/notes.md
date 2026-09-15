# Notes: Sofia.jpg, its one usage, and the frame it is held to

Job: 29617dac-16b5-4a2b-a6ce-006411c2b9fd
Plan: specs/29617dac-16b5-4a2b-a6ce-006411c2b9fd/plan.md

Written against commit `cec205a`, the tip of `main`, before anything changed.

## 0. What this job found standing

**The layout this plan describes is already on `main`.** It was built under job
`1416c200-4729-4c71-8e75-e674bd0519d5`, whose spec asked for the same three
things — the photograph beside the copy, the "WHAT WE OFFER" radius, the
"C-Suite Advisory" papaya — and whose notes are at
`specs/1416c200-4729-4c71-8e75-e674bd0519d5/notes.md`.

Every bullet of this plan's definition of done was therefore already satisfied
when the job opened. Sections 1 and 2 below are this job's own discovery, done
from scratch against the checkout rather than taken from those notes; section 3
records what each of the plan's eight tasks was verified against. Tasks 3–8
changed no markup and no styling, because changing any of it would have moved
the page away from what the plan asks for. What this job adds is
`tests/sofia-frame.test.mjs`, which pins this plan's own definition of done —
including the one thing nothing pinned before, the scoping the plan's task 8
asks for.

## 1. The photograph

`Sofia.jpg` sits in the **repository root**, alongside `index.html`,
`SoftPapaya-logo.png` and `style.css`. It is a 153 KB JPEG, **1080×719**
intrinsic — a 1.502 landscape ratio — of the Alexander Nevsky Cathedral in
Sofia, one of the four cities the band's own copy names.

It is referenced **exactly once across the whole site**:

| Where | Markup |
|---|---|
| `index.html:154` | `<img class="origin__photo" src="Sofia.jpg" alt="…" width="1080" height="719">` |

That is the `.origin__image` column of the `#about` band, whose heading is
"WHERE WE'VE COME FROM". Nothing else names the file: `about.html`,
`contact.html`, `styles/main.css` and the legacy `style.css` do not mention it,
and no CSS rule anywhere reaches it by `src` or by element. The one place it
appears is the place this plan wants it.

So the plan's task 8 — "if `Sofia.jpg` is used elsewhere on the page, verify the
new class/selector is scoped" — has no second usage to protect. The scoping is
real all the same and is now pinned rather than assumed: the frame hangs off the
**`.origin__photo` class**, so a second `<img src="Sofia.jpg">` dropped anywhere
else on the page picks up no border and no rounding.
`tests/sofia-frame.test.mjs` asserts that twice over — once by reading the
stylesheet's selectors, and once by appending exactly such an image to the
services band in the browser and measuring what it computes to.

The `width`/`height` attributes carry the intrinsic size for the same reason the
masthead's mark does: the browser reserves the space before the image arrives,
and nothing below it shifts on load.

## 2. The frame

The "C-Suite Advisory" box is the **first** `<li class="card">` of
`<ul class="services__grid">` in the "WHAT WE OFFER" band (`index.html:52`).
Nothing on the page is styled inline — there is no `style="` attribute in
`index.html` at all — so its frame is assembled from two rules in
`styles/main.css`:

| Property | Value | Declared on | At |
|---|---|---|---|
| `border-radius` | `10px` | `.card` | `styles/main.css:228` |
| `border` width/style | `1px solid` | `.card` | `styles/main.css:228` |
| `border-color` | `var(--papaya)` = `#e56717` | `.services__grid > .card:nth-child(6n + 1), …:nth-child(6n + 5)` | `styles/main.css:243`, the shade itself at `:root`, `styles/main.css:21` |

Two ambiguities the spec asked to have resolved explicitly:

- **One canonical radius, not several.** All six boxes take `border-radius`
  from the single `.card` rule; no later rule and no `@media` block overrides
  it, so the value is `10px` at every breakpoint and on every box. The spec's
  "pick the most common value and note it" fallback was not needed. A test
  reads the computed radius off all six rendered boxes and asserts they are one
  value.
- **The default state, not a hover state.** `.card` has no `:hover`, `:focus`
  or `:active` rule anywhere in the stylesheet — the only hover rules on the
  page are on `.button--accent`, `.masthead__links a` and `.footer a` — so the
  box's default border *is* its only border, and there is no second state to
  choose between.

**The colour is shared; the radius and the width/style are duplicated.** The
papaya is a custom property, so `.origin__photo` takes it straight from
`var(--papaya)` and `#e56717` is written exactly once in the stylesheet. The
other two are literals inside `.card`'s own rule. Sharing them would mean either
putting the photograph in a `.card` — it is not a service box — or lifting
`10px` and `1px` out of `.card` into new custom properties, and both mean
editing the "WHAT WE OFFER" styles, which this plan's out-of-scope list forbids.
So they stay duplicated, exactly as the plan's task 5 allows, and
`tests/sofia-frame.test.mjs` compares the photograph's computed frame against
the box's own, side by side, so the copy cannot drift from the original without
a test failing.

## 3. What each task was verified against

`tests/sofia-frame.test.mjs`, one `describe` per numbered task:

| Task | Held to |
|---|---|
| 1 | This file's section 1, plus a count of `src="Sofia.jpg"` across every page — exactly one. |
| 2 | This file's section 2, plus the computed radius of all six boxes and the computed border of the reference box. |
| 3 | The two columns measured in the browser at 1440/1280/1024/768px: copy's right edge at or left of the image column's left edge, both tops level, both hanging off one grid parent of two equal tracks. The two paragraphs' rendered text is compared against `ORIGIN_PARAGRAPHS` in `tests/site.mjs` — the copy as the original request supplied it — so any edit to the wording fails. |
| 4 | `height: auto` plus a width read out of the stylesheet, and the rendered ratio measured against the intrinsic 1080×719 at all eight widths, with the page's own horizontal overflow asserted at zero. |
| 5 | Computed radius equal to the box's, side by side, and `.card`'s own declaration still `10px`. |
| 6 | Computed border width, style and colour equal to the box's, side by side; the photograph's papaya read from `var(--papaya)`; `#e56717` written once; `.card`'s own `1px solid var(--line)` and the grid's `nth-child` papaya both still where they were. |
| 7 | Stacking at 767/414/375/320px — copy clear above the photograph, columns equal width, nothing clipped at either edge, no sideways scroll — and the turnover pinned to 768px, the breakpoint the service boxes already pair up on. |
| 8 | Section 1's scoping: no frame rule selects on `[src]` or on `img`; a second `Sofia.jpg` appended to the services band computes to no border and no radius; the framed `<img>` carries the `origin__photo` class, its `alt`, and no inline style. |

## 4. Flagged for the reviewer

- **This job duplicates `1416c200`.** No markup or styling changed, because the
  page already matched the plan. If the intent was a *different* treatment from
  the one standing — a different split than 50/50, say — that was not in the
  plan or the spec, and this is the point to say so.
- The `10px` radius and `1px solid` border remain duplicated from `.card`, for
  the reason in section 2. This is the duplication the spec asked to have
  flagged if the existing styling could not be shared.
- Three assertions in `tests/page.test.mjs` were failing on `main` before this
  branch and still are: two "Alpha rebrand task 9" checks diff `about.html` and
  `contact.html` against the `main` ref, and this checkout's history is a single
  squashed commit, so the diff is empty and the test reads that as "never
  rebranded". Unrelated to this change, and left alone.
