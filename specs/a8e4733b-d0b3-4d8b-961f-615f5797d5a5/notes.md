# Notes: "STUDIES" in orange/papaya on the Case Studies page title

Plan: specs/a8e4733b-d0b3-4d8b-961f-615f5797d5a5/plan.md
Spec: specs/a8e4733b-d0b3-4d8b-961f-615f5797d5a5/spec.md

## 1. The mechanism

The spec's first open question — reusable class or one-off inline style — is
settled by the markup itself. `index.html` sets the home page headline as:

```html
<h1 class="hero__heading">WHAT WE DO. AND WE DO IT <span class="hero__papaya">REALLY WELL</span>.</h1>
```

So "REALLY WELL" is painted by one reusable class, `hero__papaya`, with no
inline style beside it. The class is declared once in `styles/main.css`:

```css
.hero__papaya {
  color: var(--papaya);
}
```

Colour and nothing else, taken from the `--papaya` token (`#e56717`) the
`:root` block declares — so reusing the class brings the exact shade with it
rather than a second copy of the hex. It is not a styled component, a CSS
module or a variable applied at the element: it is a plain class, and a class
already reused this way. `team.html` paints "THE TEAM" with the same
`<span class="hero__papaya">`, which is the precedent this job follows.

Nothing in section 1 was changed by this job; it is inspection only.

## 2. The title

`case-studies.html` is a hand-written static page — no CMS, no template
language, no build step (`package.json` has a `test` script and nothing else),
and the page loads no script at all. Its title is one line of markup:

```html
<h1 class="case-studies__heading" id="case-studies-heading">CASE STUDIES</h1>
```

One `<h1>`, one text node, the only `<h1>` on the page. "STUDIES" is the last
of its two words and appears exactly once, so wrapping it cannot catch any
other text, and the spec's second open question — dynamic content — does not
arise: there is nothing dynamic to break, and no blocker to flag.

The spec's third open question is settled as asked: only "STUDIES" is wrapped.
"CASE" keeps the `<h1>`'s own ink (`--deep`), which is what the rest of the
site's headings take.

## 3. Layout and breakpoints

The wrapping element is an inline `<span>`, and `.hero__papaya` declares
`color` only — no size, weight, tracking, display or box property. So the
title's line boxes are laid out exactly as they were with a single text node;
`tests/case-studies-title.test.mjs` measures this rather than asserting it,
taking the shipped title's box and then rewriting the `<h1>` back to plain
`CASE STUDIES` in the live document and measuring again, at all seven widths in
`BREAKPOINTS`.

No breakpoint work was needed, and none was done. `styles/main.css` is written
mobile-first with its `768px` and `1024px` `@media` blocks at the foot, and the
`.hero__papaya` rule sits above all of them and is declared exactly once — so
the Case Studies title takes the same papaya at every width the home page
headline does, for the same reason and from the same declaration.
