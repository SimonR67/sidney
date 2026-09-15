# Notes: the "VALUES" section, and the "Values" tab that reaches it

Job: e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce
Plan: specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/plan.md

Written before any markup changed, against commit `1419873`.

## 1. Discovery

The site is static: no build step, no templating, no component files. The home
page is one file, `index.html`, styled by one stylesheet, `styles/main.css`.
A new section is markup added to `index.html`, not a new template.

**The "Values" nav tab, as it stands.** `index.html:26` reads
`<li><a href="#">Values</a></li>`. It is an inert placeholder — the same
`href="#"` that Team, Case Studies, Careers and Blog carry. There is no
`#values` anchor on the page today, and no element with any id the tab could
already be said to expect. See "Nav mismatch" below.

**The anchor convention.** The id is the lower-cased nav label and sits on the
`<section>`, not on the heading: `#services` for "WHAT WE OFFER"
(`index.html:48`), `#about` for "WHERE WE'VE COME FROM" (`index.html:132`) and
`#contact` for the invitation band (`index.html:165`). The heading inside then
takes `id="<section>-heading"`, and the section points `aria-labelledby` at it.
So the new band is `<section class="values" id="values"
aria-labelledby="values-heading">`. Neither `values` nor `values-heading`
collides with the ids already on the page.

**The section heading.** Both referenced sections set it as
`<h2 class="section__heading" id="…-heading">`, styled entirely by the one
`.section__heading` rule at `styles/main.css:215`. The new heading reuses that
class verbatim rather than declaring a second rule.

**The box component.** "WHAT WE OFFER" is
`<ul class="services__grid">` (`index.html:51`) holding six
`<li class="card">`, each one:

```html
<li class="card">
  <h3 class="card__title">…</h3>
  <p class="card__copy">…</p>
  <ul class="card__tags"><li class="tag">…</li></ul>
</li>
```

- `.services__grid` (`styles/main.css:222`) is the grid *and* the thing the
  border rotation is keyed on. One column, `gap: 18px`, widening to two at
  768px and three at 1024px.
- `.card` (`styles/main.css:228`) is the box: a 12px-gap flex column, 1px
  border, 10px radius, `26px 24px` padding, white, with a hairline shadow.
- `.card__title` declares **no rule of its own** — its size, weight, colour and
  tracking all come from the global `h3` rule (`styles/main.css:57`). Anything
  other than an `<h3>` would not look the same, so the new boxes use `<h3>`.
- `.card__copy` (`styles/main.css:273`) is `color: var(--muted)` and
  `font-size: 15px`, and is element-agnostic — it styles a `<li>` as readily as
  a `<p>`.
- `.card__tags`/`.tag` are the pill row. The values boxes have no tags, and
  `.card__tags`' `margin-top: auto` is the only thing that depends on them, so
  omitting the row costs the boxes nothing.

Because the rotation is scoped to `.services__grid > .card`, the values list is
given that same class: it is the reuse of the actual component the spec asks
for, and it needs no new class and no stylesheet edit. Only `.values` — the
band's vertical padding, `24px 0 72px`, the same rhythm `.services` and
`.origin` carry — is added to `styles/main.css`.

## 2. Colour rotation

`styles/main.css:239-271` sets the borders by position, not per card:

```css
.services__grid > .card:nth-child(6n + 1),
.services__grid > .card:nth-child(6n + 5) { border-color: var(--papaya); }
.services__grid > .card:nth-child(6n + 2),
.services__grid > .card:nth-child(6n)     { border-color: var(--lime); }
.services__grid > .card:nth-child(6n + 3),
.services__grid > .card:nth-child(6n + 4) { border-color: var(--black); }
```

The sequence is **papaya, lime, black, black, papaya, lime**, repeating every
six. Its own comment says it is "set by position rather than per card, so the
sequence holds if the grid is reordered or grows past the six services written
today" — so it does not hard-code a count of three, and it needs no
generalising to take six boxes. The plan's task 3 guesses the rotation is a
three-step `1-2-3-1-2-3`; the source says otherwise, and the definition of done
("the exact same border colour-rotation logic as the WHAT WE OFFER boxes")
wins. The six values boxes therefore come out papaya, lime, black, black,
papaya, lime — box for box identical to "WHAT WE OFFER", which is the point.

No new shade, class or variant is introduced.

## 3. Nav mismatch

**Flagged, per the spec's "Nav link/anchor mismatch" edge case.** The spec asks
that the new section's `id` be set to whatever the nav link already expects.
The "Values" tab expects nothing: its href is the bare `href="#"`, which is the
top of the document, and no `id` can be written that a bare `#` will resolve
to. So the acceptance criterion "clicking that nav tab navigates to this new
section" cannot be met by choosing an id — the href has to name one.

The change made is the minimum that satisfies it: the single attribute
`href="#"` → `href="#values"` on `index.html:26`. Nothing else in the nav moves
— no label, no order, no attribute, no other link.

This is the precedent the "About" tab already set: job
6cbe8670-bc69-497e-838f-81bd88499f36 found `<a href="#">About</a>` in the same
placeholder state and repointed that one attribute at the section it added
(`specs/6cbe8670-bc69-497e-838f-81bd88499f36/notes.md`, "Placement"). Nothing
is orphaned either way: a bare `#` has no target to lose.

The footer's own "Values" link (`index.html:206`) is a different link in a
different block, covered by a test that holds every footer column to `href="#"`.
It is left exactly as it was.

## 4. Flagged for the reviewer

- **The values grid is `class="services__grid"`.** Read as a name it is odd in
  a band about values, but it is the honest consequence of "reuse the actual
  existing CSS classes, not a visual approximation": the grid, the gaps, the
  breakpoints and the border rotation are all declared on that one selector.
  The alternative — adding a `.values__grid` to each of the seven rules — edits
  the services styles, invents a class the plan rules out ("no new
  colours/classes") and lets the two grids drift. `#values` is what the tests
  scope by, so nothing needs a second class to be addressable.
- **Box 4's bullets are `<li class="card__copy">` inside a bare `<ul>`.** The
  supplied copy carries its own `•` characters, and the global `ul` reset
  (`styles/main.css:85`) already strips list markers, so the glyphs render as
  written with no second bullet beside them and no new CSS. `.card__copy` on
  each `<li>` gives the items the same 15px muted body the paragraphs take.
- **Four assertions in earlier jobs' tests had to be updated**, all of them
  statements that were true only until this section existed: the page's section
  order and the band that follows `#about` (`tests/origin-section.test.mjs`),
  the `Values` nav href (same file), and a page-wide `<h3>` count that is now
  scoped to `#services` (`tests/services-page.test.mjs`). No assertion about
  "WHAT WE OFFER" or "WHERE WE'VE COME FROM" itself was weakened.
- **Two tests in `tests/page.test.mjs` fail on `main` already** — the
  `git diff` rebrand check on `about.html`/`contact.html`. They are unrelated to
  this change and fail identically before and after it.
