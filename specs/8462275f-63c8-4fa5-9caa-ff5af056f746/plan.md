# Plan: Gondor Home Page (Hero + Navigation, Black/Orange Theme)

Status: draft
Job: 8462275f-63c8-4fa5-9caa-ff5af056f746
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/8462275f-63c8-4fa5-9caa-ff5af056f746/spec.md

## 1. Definition of done

- `index.html` exists at repo root, opens in a browser with no console errors.
- `style.css` exists, is linked from `index.html`, and contains all styling (no heavy inline styles).
- `index.html` includes a `<nav>` element near the top with at least two/three placeholder links (Home, About, Contact) pointing to `#`.
- `index.html` includes a hero section (e.g. `<header>` or `<section class="hero">`) directly below the nav, containing an `<h1>` with the text "Gondor" styled prominently.
- Black (or near-black) is the dominant background colour and orange is the accent colour, applied consistently to both the nav bar and hero section (verifiable in `style.css`).
- No JavaScript files, script tags, or JS frameworks are present anywhere in the repo change.
- No CSS frameworks/preprocessors (Bootstrap, Sass, Tailwind, etc.) are referenced or used — `style.css` is hand-written plain CSS.
- Semantic HTML5 elements (`<nav>`, `<header>`/`<section>`, `<h1>`) are used appropriately.
- Layout does not visibly break (no overlap/overflow) at common desktop widths.

## 2. File map

| File | Change |
|---|---|
| index.html | New file — semantic HTML5 page with `<nav>` (placeholder links) and hero section (`<h1>Gondor</h1>`), linking to style.css |
| style.css | New file — all page styling: black/orange colour scheme, nav bar layout, hero band styling, basic responsive-safe layout rules |

## 3. User journey

A visitor opens `index.html` in a browser (locally or via any static host). They immediately see a black-and-orange themed page. At the top is a horizontal navigation bar with a few placeholder links (Home, About, Contact) styled in the site's colour scheme, with a visible hover effect. Directly below the nav, a full-width hero band displays the large heading "Gondor" prominently, set against the black/orange theme, optionally with a short tagline. The visitor can resize the browser window and the page continues to look intact (no overlapping nav/hero, no broken text overflow) at typical desktop widths. Clicking a nav link does nothing beyond staying on/jumping within the same page, which is expected since no other pages exist yet.

## 4. Tasks

- [ ] 1. Create base `index.html` skeleton with semantic structure (`<html>`, `<head>` with `<link>` to `style.css`, `<body>` containing empty `<nav>` and hero `<section>`/`<header>` placeholders) — files: index.html — test: manually open file in browser, verify no console errors and CSS file loads (network tab shows 200 for style.css)
- [ ] 2. Add navigation bar markup with placeholder links (Home, About, Contact) inside `<nav>` — files: index.html — test: inspect rendered page, confirm `<nav>` contains at least 2–3 `<a href="#">` links with visible text, positioned at top of page
- [ ] 3. Add hero section markup with `<h1>Gondor</h1>` (optional minimal tagline) inside a hero container below the nav — files: index.html — test: inspect rendered page, confirm `<h1>` with text "Gondor" is present and visually distinct/large compared to body text
- [ ] 4. Add base colour scheme CSS (black/near-black background, orange accent variables or repeated values) applied to `body`, `nav`, and hero container — files: style.css — test: inspect computed styles in devtools; background-color of nav and hero use black/near-black, with orange used for text/accents/borders
- [ ] 5. Style nav bar layout and link hover states (horizontal flex/inline layout, orange link colour, hover state change) — files: style.css — test: visually confirm nav is horizontal at top of page; hovering a link changes its colour/style
- [ ] 6. Style hero section as a visually distinct band (padding/height, background/accent colour, large heading typography) — files: style.css — test: visually confirm hero is a full-width or clearly bounded band with large, legible "Gondor" heading using the colour scheme
- [ ] 7. Verify no JS/frameworks and no inline style bloat; clean up any inline styles into CSS classes — files: index.html, style.css — test: grep repo for `<script`, `.js`, Bootstrap/Tailwind/Sass references — none found; visually confirm markup uses classes not `style="..."` attributes for layout/colour
- [ ] 8. Resize/responsive sanity check across common desktop widths (e.g. 1920px, 1366px, 1024px) and adjust CSS if nav/hero overlap or text overflows — files: style.css — test: manually resize browser window at listed widths, confirm no visual breakage (overlap, overflow, unreadable wrapping)

## 5. Test plan

Manual end-to-end verification once all tasks are complete: open `index.html` directly in an evergreen browser (Chrome/Firefox/Edge) and confirm:
1. Page loads with zero console errors/warnings.
2. `style.css` is fetched successfully and is the sole source of styling (view-source shows no `<script>` tags, minimal/no inline `style=` attributes).
3. Nav bar is visible at the top with placeholder links, each showing a hover effect.
4. Hero section directly below the nav displays "Gondor" as a large, prominent `<h1>`.
5. Black/near-black and orange are visually and programmatically (via devtools computed styles) the dominant colours across both nav and hero.
6. Resizing the browser window across common desktop widths does not cause overlap, overflow, or broken layout.
7. Search repo diff for any JS files, `<script>` tags, or CSS framework/preprocessor artifacts — confirm none exist.
8. Validate `index.html` against basic semantic HTML expectations (nav, heading hierarchy) using browser devtools or an HTML validator as a sanity check (not a full audit).

## 6. Out of scope (carried from spec)

- Additional pages (About, Contact, etc.) beyond the single home page.
- Any JavaScript functionality (menus, animations, mobile hamburger toggle, interactivity).
- CSS frameworks, component libraries, or build tooling (Bootstrap, Tailwind, Sass, Less, webpack, etc.).
- Backend/server logic, routing, or CMS integration.
- SEO optimization, extended meta tags, analytics, or favicon design work.
- Custom/web font loading — system/default fonts only.
- Additional content/sections beyond hero + nav (footer, "About Gondor" content, galleries, forms) unless trivially needed for completeness.
- Full accessibility (WCAG) audit — basic semantic HTML only.
- Cross-browser testing beyond modern evergreen browsers.
- Deployment/hosting setup.