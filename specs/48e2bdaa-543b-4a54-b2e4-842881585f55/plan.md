# Plan: Simple HTML Home Page with Hero Section and Navigation Bar ("BetaMax")

Status: draft
Job: 48e2bdaa-543b-4a54-b2e4-842881585f55
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/48e2bdaa-543b-4a54-b2e4-842881585f55/spec.md

## 1. Definition of done

- `index.html` exists at repo root, contains valid, semantic HTML (`<header>`, `<nav>`, `<section>`), and loads with no console errors in a modern browser.
- A visible navigation bar renders at the top of the page containing the "BetaMax" site name/logo and a small set of nav links (placeholder `#`/same-page anchors).
- A hero section renders "BetaMax" as the largest, visually dominant heading on the page, with an optional short subtitle and optional CTA button.
- A single CSS file (`styles.css`) defines a dark green + orange color scheme applied consistently to the nav bar and hero section.
- Layout does not break (no overlap, no clipped/overflowing text) at ~1280px (desktop) and ~375px (mobile) widths; basic responsive CSS (e.g., a media query or flexible units) handles this without JS.
- Page is fully usable and correctly styled with JavaScript disabled — no JS files are required for core rendering.
- HTML passes basic validation (no unclosed tags, correct nesting, `<title>` and viewport meta tag present).
- Only the Home page is delivered — no other pages, backend, frameworks, or build tooling are introduced.

## 2. File map

| File | Change |
|---|---|
| index.html | New file. Contains the full Home page markup: `<head>` with title/viewport/meta, `<header>`/`<nav>` nav bar, `<section>` hero with "BetaMax" heading, optional subtitle and CTA button. Links to styles.css. |
| styles.css | New file. Defines dark green/orange color scheme (variables or literal hex values), base resets, nav bar layout/styles (including hover states), hero section layout/typography, and a mobile-width media query for responsive behavior. |
| README.md | New or updated (optional). Brief note on how to open/preview the static page locally (e.g., open index.html in a browser). |

## 3. User journey

A visitor opens `index.html` in a modern desktop or mobile browser (no server or build step required). They immediately see a top navigation bar in dark green with the "BetaMax" name/logo and a few orange-accented nav links (Home, About, Contact — placeholder anchors). Directly below, a hero section fills much of the viewport with "BetaMax" displayed as a large, bold, clearly dominant heading, a short supporting tagline, and (optionally) an orange call-to-action button. The visitor can resize their browser window or view the page on a phone-sized screen, and the nav bar and hero text remain readable, non-overlapping, and non-clipped throughout. No JavaScript runs, and no console errors appear. Clicking a nav link or the CTA button (if present) does nothing destructive — it's a placeholder anchor, consistent with only one page existing.

## 4. Tasks

- [ ] 1. Create base HTML skeleton with valid document structure — files: index.html — test: manually/automatically validate the file has `<!DOCTYPE html>`, `<html>`, `<head>` (with `<title>` and viewport meta), and `<body>`; run through an HTML validator (e.g., W3C validator or `html-validate` CLI) with zero errors.
- [ ] 2. Add semantic navigation bar markup — files: index.html — test: verify `<header>` contains a `<nav>` element with the "BetaMax" site name/logo text and at least 2–3 anchor (`<a href="#">`) links; confirm via validator that markup is well-formed and via visual check that the nav renders at the top of the page.
- [ ] 3. Add semantic hero section markup — files: index.html — test: verify a `<section>` element exists directly after the nav bar containing an `<h1>` with text "BetaMax", plus an optional subtitle paragraph and/or CTA `<a>`/`<button>`; confirm `<h1>` is unique on the page (one and only one top-level heading).
- [ ] 4. Apply dark green / orange color scheme via CSS — files: styles.css, index.html (link tag) — test: inspect computed styles (via browser devtools or a simple CSS-parsing test) confirming nav bar background and hero background/accents use the defined dark green value and buttons/links/hover states use the defined orange accent value.
- [ ] 5. Style hero heading typography for visual dominance — files: styles.css — test: confirm via computed styles that the hero `<h1>` font-size is significantly larger (e.g., ≥2x) than nav bar text and any subtitle text, and that it's bold; visually confirm "BetaMax" is the largest text on the page.
- [ ] 6. Add responsive/mobile handling — files: styles.css — test: render the page at ~375px viewport width (e.g., via browser devtools device toolbar or a headless screenshot test) and confirm no horizontal overflow, no overlapping nav/hero elements, and hero title remains fully visible/unclipped; repeat check at ~1280px width to confirm no regression.
- [ ] 7. Add hover/focus states for nav links and CTA button — files: styles.css — test: confirm via devtools that hovering/focusing a nav link or CTA button changes color/style using the orange accent, with no JavaScript involved.
- [ ] 8. Verify no-JS functionality — files: index.html, styles.css — test: disable JavaScript in the browser (or load the page with a JS-disabled test runner) and confirm nav bar, hero section, and styling all render identically and no functionality is missing.
- [ ] 9. Final semantic/validity pass — files: index.html — test: re-run HTML validator on the completed file confirming zero errors and correct use of `<header>`, `<nav>`, `<section>` landmarks.

## 5. Test plan

- Run an HTML validator (e.g., W3C Nu validator or `html-validate` CLI) against the final `index.html` and confirm zero errors/warnings.
- Open the page in Chrome, Firefox, Safari, and Edge (or emulate via devtools) and check the browser console shows no errors.
- Use browser devtools responsive mode to check rendering at ~320–480px (mobile) and ~1280px (desktop) widths, confirming no overlapping text, no clipped hero title, and no horizontal scroll/overflow.
- Visually confirm the color palette: dark green as the dominant background across nav bar and hero, orange as accent on at least one interactive element (link/button/hover state).
- Disable JavaScript in the browser and reload the page to confirm identical rendering/functionality (no missing content, no broken layout).
- Confirm "BetaMax" in the hero is the single largest, boldest text element on the page compared to nav bar text and any subtitle.
- Spot-check that no external frameworks, CDNs, or build artifacts were introduced (only `index.html` and `styles.css`, plain HTML/CSS).

## 6. Out of scope (carried from spec)

- Any additional pages (About, Contact, Services, Blog, etc.) — only the Home page is built.
- Backend functionality, data-submitting forms, databases, or server-side processing.
- JavaScript-driven interactivity beyond basic CSS hover/focus states (no hamburger menu toggle logic).
- CSS/JS frameworks or build tooling (Bootstrap, Tailwind, React, Webpack, etc.) — plain HTML/CSS only.
- Additional content sections beyond nav bar and hero (footer, testimonials, pricing, galleries, etc.).
- Custom logo/icon design or branded imagery — text-based title only.
- Full accessibility audit (WCAG compliance testing, deep ARIA work) beyond basic semantic HTML.
- SEO optimization, analytics integration, or meta-tag strategy beyond basic `<title>` and viewport tags.
- Hosting/deployment setup — this plan covers only the HTML/CSS files, not publishing them live.
- Cross-browser testing beyond modern evergreen browsers (Chrome, Firefox, Safari, Edge).