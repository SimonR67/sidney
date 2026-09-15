# Notes: Contact Us Page with Form and Unified Contact Navigation

Plan: specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/plan.md
Spec: specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/spec.md

## 1. Discovery

The plan's file map is written for a `src/` React tree. This repository is a
static site with no build step, so every path below is the shape that change
takes here. What was read, and what it said:

- `package.json` — "Static site … No build step". Its one script runs
  `node --test` over `tests/*.test.mjs`. There is no bundler, no framework and
  no server: whatever ships has to run from files a static host can serve.
- `index.html` — the Softpapaya Services home page, and the only page carrying
  the three elements this job unifies:
  - the "Contact" nav entry, `<a href="#contact">` in `.masthead__links`, one
    of eight tabs that otherwise point at `#services`, `#about`, `#values` and
    `#`;
  - the "TALK TO US" call to action, `<a class="button button--accent
    masthead__cta" href="mailto:hello@softpapaya.com">`, top right;
  - the "START A CONVERSATION" button, `<a class="button button--accent
    button--large" href="mailto:hello@softpapaya.com">`, in the `#contact`
    invitation band at the foot of `<main>`.
- `about.html` and `contact.html` — the legacy "Sid Meyers Alpha Centuri" pages.
  They are a different page set: their own `style.css`, their own three-link
  nav, their own header, and a "Coming soon." body. `tests/page.test.mjs` holds
  their markup to a fixed element skeleton and diffs them against `main`, and
  `tests/styling-update.test.mjs` asserts neither of them links
  `styles/main.css`. They are out of scope, so they are untouched.
- `styles/main.css` — the home page's stylesheet, mobile-first, palette in
  `:root`, breakpoints at 768px and 1024px at the foot.
- `tests/site.mjs`, `tests/browser.mjs` — the shared helpers: markup readers,
  a CSS parser, and a headless-Chrome driver with a static file server.

## 2. Decisions

**The route: `contact-us.html`.** The spec leaves the slug open (`/contact` or
`/contact-us`). `contact.html` is taken — it is the legacy Alpha Centuri page,
which this job may not edit or remove — so the Contact Us page is a new file at
`contact-us.html`, served from the repository root like every other page.

**The chrome: the home page's.** The page links `styles/main.css` and repeats
the `.masthead` and `.footer` markup `index.html` carries, so the form sits
inside the site it belongs to. That makes it the second page to link that
stylesheet; `tests/services-page.test.mjs` asserted no page but the home page
did, and that check now exempts this one — the assertion is there to catch a
duplicated home page, which this is not (it carries neither the Services title
nor the hero).

**The submission mechanism (spec open question).** The repository has no
backend, no build step and no form service. The submission layer,
`scripts/contact-api.js`, therefore reads its destination from one place — the
form's `data-endpoint` attribute — and:

- with an endpoint set, `POST`s the four fields as JSON and treats any
  non-2xx response, or a network failure, as a failed submission;
- with no endpoint set, which is how the page ships today, hands the enquiry to
  `mailto:hello@softpapaya.com` — the one contact route the site already has —
  with the four fields written into the subject and body, and confirms *that*
  to the visitor rather than claiming an enquiry was filed.

Wiring a real endpoint is a one-attribute change in `contact-us.html` and needs
no change to the form. See the flagged gap below.

**"Nature of Enquiry" is free text** (spec open question): a single-line input.
A dropdown would need a category list nobody has supplied.

**The entry points keep their wording, styling and position.** Only the three
`href`s change. The `#contact` invitation band keeps its id and its copy, so
the anchor other work depends on still resolves.

## 3. Superseded assertions

These tests asserted the behaviour the spec supersedes, and were updated rather
than worked around:

- `tests/services-page.test.mjs` — the header call to action and the invitation
  button pointed at `mailto:hello@softpapaya.com`; every link on the home page
  had to start with `#` or `mailto:`; no page but the home page linked
  `styles/main.css`.
- `tests/origin-section.test.mjs`, `tests/values-section.test.mjs` — the nav's
  "Contact" tab pointed at `#contact`.
- `tests/origin-image.test.mjs`, `tests/values-section.test.mjs` — the
  byte-exact "nothing else changed" diffs of `index.html` and
  `styles/main.css`. Each already blanks out what later jobs added; they now
  rewind this job's three hrefs (`beforeContactPage()` in `tests/site.mjs`) and
  its stylesheet block too. Both of those `values-section` diffs were already
  failing on `main` against their own stale baseline, and still are — the
  rewind was checked separately, by confirming it reproduces `index.html` and
  `styles/main.css` byte for byte as this branch found them.
- `tests/page.test.mjs` — the file inventories of the site, which now include
  `contact-us.html` and `scripts/`.
- `tests/site.mjs` — `legacySiteFiles()` excludes the files that arrived with
  the Softpapaya site, and the contact page and its scripts are three more.
- `tests/browser.mjs` — gained `page.type()`, which types into a field through
  the browser rather than assigning its value, so the form is exercised the way
  a visitor fills it in.

## 4. Flagged gaps

- **No submission endpoint is configured.** Until `data-endpoint` is set on the
  form, a submitted enquiry leaves as an email from the visitor's own mail
  client. Choosing the backend is the spec's first open question and is not
  answered here.
- **No confirmation email to the submitter**, and no internal notification
  beyond the message itself — out of scope, and both depend on the endpoint
  above.
- **No spam protection** — out of scope per the spec.
- **The footer's `hello@softpapaya.com` link is left as it is.** It is not one
  of the three elements named in the spec.
