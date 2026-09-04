# Plan: Build "Mordor" Home Page with Hero Section and Navigation Bar

Status: draft
Job: 9c4e272a-3518-4028-9ad6-c1b549ead19e
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/9c4e272a-3518-4028-9ad6-c1b549ead19e/spec.md

## 1. Definition of done

- `index.html` exists at the repo root, renders in a browser with no JS errors, and has no dependency on any backend/build step.
- Page contains a `<nav>` element at the top of the page showing the site name "Mordor" (and optionally placeholder links to `#`).
- Page contains a hero section (e.g. `<header class="hero">`) positioned immediately below/including the nav, visually distinct (full-width band, generous padding).
- Hero section contains an `<h1>` with the text "Mordor" that is clearly the largest, most visually dominant text on the page.
- Colour scheme is black (dominant background) and orange (dominant accents/text) throughout nav and hero, with no other dominant colours, and sufficient contrast for legibility.
- Layout is usable and non-overlapping at both ~1280px (desktop) and ~375px (mobile) widths.
- No third-party JS is used; if any external font/CSS is referenced, the page still renders legibly with system-font/colour fallback if it fails to load.
- Clicking placeholder nav links does not throw errors or break the page.

## 2. File map

| File | Change |
|---|---|
| index.html | New file — semantic HTML for nav bar + hero section, "Mordor" as `<h1>`, links to stylesheet (or inline `<style>`), `<title>` tag |
| styles.css | New file — black/orange colour scheme, responsive layout rules for nav and hero (only created if styling is kept external rather than inline) |

## 3. User journey

A visitor opens `index.html` in a browser (locally or via a static file server). They immediately see a black-and-orange page: a navigation bar across the top showing the "Mordor" site name (and possibly placeholder links like "Home", "About", "Contact" that don't navigate anywhere meaningful). Directly below, a full-width hero band dominates the top of the page, with "Mordor" rendered as a large heading — the clear visual focal point — optionally accompanied by a short thematic tagline. The visitor can resize the browser window or view the page on a mobile device width, and the nav bar and hero text reflow cleanly without overlapping or overflowing. Clicking any nav placeholder link does nothing harmful (stays on page or jumps to an anchor) and produces no console errors.

## 4. Tasks

- [ ] 1. Scaffold `index.html` with basic semantic structure (`<!DOCTYPE html>`, `<head>` with `<title>Mordor</title>`, empty `<nav>` and `<header class="hero">` placeholders, `<body>`) — files: index.html — test: open file in browser / run an HTML validator (e.g. `tidy` or W3C validator) and confirm it parses with no errors and the `<title>` tag reads "Mordor"
- [ ] 2. Build the navigation bar markup with site name "Mordor" and placeholder links (`#`) — files: index.html — test: inspect rendered DOM (manual or headless browser check) confirming a `<nav>` element exists at the top of `<body>`, contains text "Mordor", and any `<a>` tags point to `#` without throwing on click
- [ ] 3. Build the hero section markup with `<h1>Mordor</h1>` and optional tagline `<p>` — files: index.html — test: confirm hero section appears immediately after/including the nav in DOM order, and `<h1>` text equals "Mordor"
- [ ] 4. Add black/orange colour scheme styling (background black, text/accents orange, sufficient contrast) — files: index.html or styles.css — test: manual visual check plus computed-style check (e.g. via browser devtools or a simple script) confirming background-color is black/near-black and primary text/accent color is orange across nav and hero
- [ ] 5. Add responsive/fluid layout rules (fluid widths, font scaling, no fixed pixel overflow) — files: index.html or styles.css — test: resize viewport to 1280px and 375px (manually or via headless browser screenshot) and confirm no horizontal scrollbar, no text/element overlap, and `<h1>` remains fully visible at both widths
- [ ] 6. Add graceful fallback for any external font/asset (if used) so page remains legible without it — files: index.html or styles.css — test: simulate blocked network request for the external resource (e.g. disable it in devtools) and confirm layout/colours/readability are unaffected
- [ ] 7. Verify no JavaScript is present/required and no console errors occur on load or nav-link click — files: index.html — test: load page in browser devtools console, click each nav link, confirm zero console errors/warnings

## 5. Test plan

After all tasks are complete, perform an end-to-end manual/browser check: open `index.html` directly in a browser (file:// or simple static server) at both a desktop width (≥1280px) and a mobile width (375px), confirm:
- Nav bar and hero render at the top of the page in the expected order.
- "Mordor" is unmistakably the largest, most prominent text on the page.
- Black/orange colour scheme is consistent across nav and hero with legible contrast.
- No layout breakage (overlap, overflow, unreadable text) at either width.
- Browser devtools console shows zero errors on load and after clicking each nav link.
- Page has a proper `<title>` and no external dependency blocks rendering if unavailable.
This full walkthrough directly re-verifies every acceptance criterion in the spec's section 5.

## 6. Out of scope (carried from spec)

- Building any additional pages (About, Contact, Blog, etc.) — nav links remain placeholders only.
- Any backend, server-side logic, database, or CMS.
- JavaScript-driven interactivity (animations, sliders, mobile menu toggles) beyond trivial nav usability.
- Footer content, image/media assets, or custom logo design beyond a text-based "Mordor" title.
- SEO optimization, analytics integration, or performance tuning.
- Cross-browser/device testing beyond a basic visual sanity check.
- Deployment or hosting setup.
- Building a reusable design system, component library, or theming framework.
- Custom fonts or icon libraries beyond web-safe/system fonts, unless trivially included.