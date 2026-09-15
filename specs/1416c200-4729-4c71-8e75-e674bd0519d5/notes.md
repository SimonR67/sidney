# Notes: the origin band split 50/50 between its copy and Sofia.jpg

Job: 1416c200-4729-4c71-8e75-e674bd0519d5
Plan: specs/1416c200-4729-4c71-8e75-e674bd0519d5/plan.md

Written before any markup changed, against commit `cc8ce20`.

## 1. The frame

The "C-Suite Advisory" box is the first `<li class="card">` of
`<ul class="services__grid">` in the "WHAT WE OFFER" band (`index.html:52`). Its
frame comes from **classes rather than inline styles** — there is no `style="`
attribute anywhere in `index.html`, and `tests/page.test.mjs` holds the page to
that — and it is assembled from two rules in `styles/main.css`:

- `.card` (`styles/main.css:228`) declares `border: 1px solid var(--line)` and
  `border-radius: 10px`.
- `.services__grid > .card:nth-child(6n + 1), .services__grid > .card:nth-child(6n + 5)`
  (`styles/main.css:243`) then overrides `border-color: var(--papaya)`. The box
  is the first card, so `6n + 1` matches it and it is papaya rather than the
  default `--line` grey.

So the three values the photograph has to match are:

| | Value | Declared at |
|---|---|---|
| border-radius | `10px` | `.card` |
| border width/style | `1px solid` | `.card` |
| border colour | `var(--papaya)` = `#e56717` | `:root` (`styles/main.css:21`), applied by the `nth-child` rule |

**The colour is shared; the radius and the width/style are duplicated.** The
papaya is a custom property, so `.origin__photo` takes it straight from
`var(--papaya)` and there is one source for the shade. The other two are
literals inside `.card`'s own rule, and the only ways to share them would be to
put the photograph in a `.card` (it is not a service box) or to lift `10px` and
`1px` out of `.card` into new custom properties — both of which mean editing the
"WHAT WE OFFER" styles, which this job's spec puts out of scope. As the spec's
edge case anticipated, the two values are therefore **duplicated** into
`.origin__photo`, and `tests/origin-image.test.mjs` compares the photograph's
computed border against the box's own, side by side, so the copy cannot drift
from the original without a test failing.

## 2. The photograph

`Sofia.jpg` already sits in the **repository root**, alongside `index.html` and
`SoftPapaya-logo.png` — nothing has to be added, moved or re-exported, and the
markup references it as a plain root-relative `src="Sofia.jpg"`, exactly as the
masthead references `SoftPapaya-logo.png`.

It is a 153 KB JPEG, **1080×719** intrinsic (a 1.502 landscape ratio), showing
the Alexander Nevsky Cathedral in Sofia at dusk — one of the four cities the
band's own copy names, which is what the `alt` text says. Those intrinsic
dimensions go on the `<img>` as `width`/`height` attributes, for the same reason
the logo carries them (`index.html:20`): the browser reserves the space before
the image arrives and nothing below it shifts on load.

The test server in `tests/browser.mjs` served only `.html`, `.css`, `.js` and
`.png`, so a request for the photograph came back as
`application/octet-stream`; `.jpg`/`.jpeg` were added to its content-type map so
the page under test is served the same bytes with the same type a real host
would send.

## 3. The layout

The band is written mobile-first, like the rest of `styles/main.css`:
`.origin__split` is a one-column grid with a `32px` gap — the gap the footer's
columns already use — so the copy stacks above the photograph on a narrow
screen, in document order. The existing `@media (min-width: 768px)` block, which
is where the page already pairs the service cards up, turns it into
`repeat(2, 1fr)`: two tracks of exactly equal width, so the split is 50/50 by
construction rather than by a pair of percentages that have to agree.

`align-items: start` holds the photograph at the top of its track rather than
stretching it, and `.origin__photo` is `width: 100%; height: auto`, so it fills
whatever its column is and keeps its own aspect ratio at every width. At 1440px
that puts it at roughly 566×377 against about 450px of copy — comparable weight,
with neither column dominating. Because the height is derived rather than fixed,
a long or short copy column cannot distort it or push it out of its track.

`.origin__copy` keeps its `max-width: 62ch`, which at a 566px column is wider
than the column itself and so no longer binds; the copy fills its half.

## 4. Flagged for the reviewer

- The `10px` radius and `1px solid` border are duplicated from `.card`, as
  recorded in section 1. This is the duplication the spec asked to have flagged
  if the existing styling could not be shared.
- Three assertions in `tests/page.test.mjs` enumerate the repository's contents
  exhaustively and were failing on `main` already, because `Sofia.jpg` had been
  committed without being referenced anywhere. Two of them now list the
  photograph as part of the site. The third checks that every *legacy* site file
  is named in an older job's discovery notes; `legacySiteFiles()` now excludes
  the photograph **and `SoftPapaya-logo.png`**, alongside `index.html` and
  `styles/main.css`, since all four postdate those notes — the logo was omitted
  when it was added, which is why that assertion was failing on `main` too.
- `tests/styling-update.test.mjs` asserted that papaya, lime and black appear on
  no border outside the service boxes and their tags. The photograph is now a
  third deliberate exception, so it is exempted there the same way the tags
  already were, with the reason and this plan recorded next to it. Its border is
  still pinned — `tests/origin-image.test.mjs` compares it against the
  "C-Suite Advisory" box's own computed border, side by side.
- Two assertions in `tests/page.test.mjs` ("Alpha rebrand task 9") were also
  failing on `main` and still are: they diff `about.html` and `contact.html`
  against the `main` ref, and this checkout's history is a single squashed
  commit, so the diff is empty and the test reads that as "never rebranded".
  That is unrelated to this change and was left alone.
