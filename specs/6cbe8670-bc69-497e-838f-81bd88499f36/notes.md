# Notes: "WHERE WE'VE COME FROM", and the "About" link that reaches it

Job: 6cbe8670-bc69-497e-838f-81bd88499f36
Plan: specs/6cbe8670-bc69-497e-838f-81bd88499f36/plan.md

Written before any markup changed, against commit `18a1387`.

## 1. Discovery

The site is static: no build step, no templating, no framework. The whole home
page is one file, `index.html`, styled by one stylesheet, `styles/main.css`.
There is nothing to compose sections from — a new section is markup added to
`index.html`, not a component file.

**The "WHAT WE OFFER" heading.** `index.html:50` sets it as
`<h2 class="section__heading" id="services-heading">WHAT WE OFFER</h2>`. All of
its styling comes from the one `.section__heading` rule at
`styles/main.css:215` — `margin-bottom: 24px`, `font-size: 14px`,
`letter-spacing: 0.18em`, `color: var(--muted)`. Nothing is inline and nothing
is one-off, so the new heading reuses `.section__heading` verbatim rather than
declaring a second rule; the two cannot drift.

**The section wrapper pattern.** Every band in `<main>` is
`<section class="…" id="…" aria-labelledby="…-heading">` wrapping a single
`<div class="container">`. `.container` is the one centred measure the page lays
everything out on (`max-width: 1200px`, `padding: 0 var(--gutter)`,
`styles/main.css:50`). The band's own class carries only its vertical padding —
`.services` is `padding: 24px 0 72px`.

**The anchor id convention.** Section ids are the lower-cased nav label:
`#services` for "WHAT WE OFFER" (`index.html:48`) and `#contact` for "HAVE A
PROJECT TO DISCUSS?" (`index.html:129`) — the id names the nav entry, not the
heading text. The heading inside then takes `id="<section>-heading"` and the
section points `aria-labelledby` at it.

So the new section takes `id="about"`, matching the "About" nav entry exactly as
`#services` matches "Services". The four ids already on the page are `services`,
`services-heading`, `contact` and `invitation-heading`; neither `about` nor
`origin-heading` collides with any of them.

## 2. Scroll mechanism

"Services" is a plain in-page anchor and nothing more:
`<li><a href="#services">Services</a></li>` at `index.html:25`, pointing at the
`id="services"` on the section. There is no JavaScript involved anywhere —
`index.html` carries no `<script>`, no inline `on…=` handler and no
`javascript:` href, and `tests/services-page.test.mjs` holds the page to that.
So there is no `scrollIntoView` call, no scroll library and no hook to copy.

`styles/main.css` declares no `scroll-behavior` either, so the browser does its
default **instant jump** to the anchor, not a smooth animation. The spec asks
for parity of mechanism rather than for smoothness, so "About" is wired the same
way — `href="#about"` — and no `scroll-behavior: smooth` is introduced. Adding
one would change how "Services" behaves too, which is out of scope.

**One nav, not two.** There is a single `<nav class="masthead__nav">`
(`index.html:22`), and `tests/services-page.test.mjs` asserts the page has
exactly one. Narrow screens do not get a separate mobile menu or hamburger: the
same `<ul class="masthead__links">` is dropped onto a row of its own by
`order: 3; flex: 1 1 100%` and put back on the logo's row from 1024px up
(`styles/main.css:162` and `styles/main.css:413`). So the desktop "About" link
*is* the mobile one — there is no second handler or second piece of markup to
retarget, and the change is verified at a 375px viewport as well as a wide one.

## 3. Placement

**No existing About slot found, so the new section is inserted directly after
"WHAT WE OFFER"**, as the plan's default. `<main>` holds exactly three bands —
the hero, `#services`, then the `#contact` invitation — and none of them is an
empty or placeholder "About" section this copy could populate instead. The new
section therefore sits between `#services` and `#contact`, which also keeps the
invitation band last, as `tests/services-page.test.mjs` requires.

"About" already appears in two places, and both are left standing:

- **The nav link**, `<li><a href="#">About</a></li>` at `index.html:24`. It
  pointed at `href="#"` — an inert placeholder with no target section behind it,
  in common with Values, Team, Case Studies, Careers and Blog. Nothing is
  therefore orphaned by repointing it: there is no prior target to lose.
- **The footer's "About" column** (`index.html:167`), heading "About" over
  `Our Story`, `Values` and `Team`. Those are placeholder links (`href="#"`)
  covered by `tests/services-page.test.mjs`, which asserts every footer column
  links nowhere but `#`. They are unrelated to the header nav and are left
  exactly as they were — not repointed, not removed.

## 4. Flagged for the reviewer

- The heading reuses `.section__heading` unchanged, but the band still needed a
  wrapper class of its own for its vertical padding and a class for its body
  paragraphs, since the page has no generic content-section or body-copy class
  to reuse — `.hero__lede`, `.invitation__copy` and `.card__copy` are each
  scoped to their own band. `.origin` and `.origin__copy` were added to
  `styles/main.css` for that, taking their padding from `.services`' rhythm and
  their measure, colour and size from `.hero__lede`'s, both via the existing
  tokens. No shade or size literal is introduced.
- The section's class is `origin` while its id is `about`. That follows the page
  as it stands, where `<section class="invitation" id="contact">` already names
  its class for the content and its id for the nav entry.
