# Plan: Simple Home Page with Navigation Bar and Hero Section for "Minas Tirus"

Status: draft
Job: 25200b19-e4a5-4750-b45c-d76c164cdc23
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/25200b19-e4a5-4750-b45c-d76c164cdc23/spec.md

## 1. Definition of done

- `index.html` exists at repo root, is valid HTML5, and opens correctly in a browser with no build step.
- A separate `styles.css` file is linked from `index.html` and provides all major layout/visual styling (no reliance on inline styles for layout).
- A `<nav>` element at the top of the page contains the site name/brand and at least one placeholder nav link.
- A hero section (`<header>` or `<section>`) sits directly below the nav bar and displays "Minas Tirus" as a large, dominant `<h1>` heading.
- The entire page (nav, hero, body) uses only a black and orange color palette, with white/light neutral used only where needed for text legibility.
- Layout remains intact (no overflow, no broken elements) at common desktop widths (~1440px, ~1024px) and mobile widths (~375px, ~320px).
- No JavaScript framework, CSS framework, or build/bundling tool is required — the site works by opening `index.html` directly.
- No console errors appear when the page is loaded in a modern browser.
- Heading hierarchy is semantic and valid (single `<h1>` in hero, no skipped levels), and any images (if added) have alt text placeholders.

## 2. File map

| File | Change |
|---|---|
| index.html | New file: full HTML5 document with `<nav>` (brand + placeholder links) and a hero `<section>`/`<header>` containing the "Minas Tirus" `<h1>`, linked to `styles.css`. |
| styles.css | New file: defines black/orange color scheme, base page styles, nav bar styles, hero section styles, and responsive breakpoints (media queries / flexbox) for mobile and desktop widths. |

## 3. User journey

A visitor opens `index.html` directly in a browser (double-click or via a local file server — no build step required). They immediately see a black-and-orange navigation bar at the top of the page showing the site brand and a small set of placeholder links (e.g., "Home", "About", "Contact"), styled with clear contrast. Directly below the nav bar, a full-width hero section displays "Minas Tirus" as a large, bold heading against a black/orange background, optionally with a short subtitle. The visitor can resize the browser window or view the page on a mobile device, and the nav bar and hero section adapt gracefully — text wraps instead of overflowing, and elements remain legible and centered at both small and large widths. Nothing on the page depends on JavaScript; disabling JS in the browser has no effect on content visibility. Opening the browser dev console shows no errors.

## 4. Tasks

- [ ] 1. Create base `index.html` skeleton with valid HTML5 doctype, `<head>` (title, meta charset/viewport), and empty `<body>`, linked to `styles.css` — files: index.html — test: HTML validates via W3C validator (or `html-validate` CLI) with zero errors; page loads in browser with no console errors.
- [ ] 2. Create `styles.css` with base black/orange color variables (e.g., CSS custom properties) and global reset/body styles — files: styles.css — test: opening index.html shows a black or orange page background and default text color matching the defined palette (manual visual check + inspecting computed styles).
- [ ] 3. Add `<nav>` markup with site name/brand and placeholder links ("Home", "About", "Contact" as `#` anchors) — files: index.html — test: DOM query confirms a `<nav>` element exists containing a brand element and at least one `<a>` link.
- [ ] 4. Style the nav bar with black/orange scheme (e.g., black background, orange text/links, hover states) and basic flexbox layout — files: styles.css — test: computed styles show nav background/text colors from the defined palette; nav items display in a horizontal row at desktop width via visual/layout check.
- [ ] 5. Add hero section markup directly below nav, containing `<h1>Minas Tirus</h1>` and optional subtitle placeholder text/paragraph — files: index.html — test: DOM query confirms hero section immediately follows `<nav>` and contains an `<h1>` with text "Minas Tirus".
- [ ] 6. Style hero section with black/orange scheme, large heading typography, and centered layout with max-width constraint — files: styles.css — test: computed styles confirm hero background/text colors match palette; `<h1>` font-size is visibly large (e.g., >2rem) via computed style check.
- [ ] 7. Add responsive breakpoints (media queries) so nav and hero adapt at mobile widths (e.g., stack nav links or shrink hero heading) — files: styles.css — test: manually resize viewport to 320px/375px and confirm no horizontal overflow/scroll and text remains fully visible (checked via browser dev tools device toolbar or automated viewport screenshot diff).
- [ ] 8. Verify accessibility basics: heading hierarchy (single h1, no skipped levels), sufficient color contrast between orange/black/text elements — files: index.html, styles.css — test: run an accessibility check (e.g., axe-core browser extension or Lighthouse) confirming no heading-order violations and contrast ratios pass for hero/nav text against their backgrounds (or documented as visibly legible if exact WCAG not required).
- [ ] 9. Final cross-check with JavaScript disabled to confirm full content visibility and no dependency on JS — files: index.html, styles.css — test: load page with browser JS disabled; confirm nav, hero title, and styling all render identically to JS-enabled state.

## 5. Test plan

- Open `index.html` directly in each modern evergreen browser (Chrome, Firefox, Safari, Edge) and visually confirm: nav bar renders at top with brand + links, hero section renders directly below with "Minas Tirus" as the dominant heading, and colors are consistently black/orange throughout.
- Resize the browser (or use device toolbar emulation) across a range of widths — 320px, 375px, 768px, 1024px, 1440px, and ultra-wide (>1920px) — confirming no horizontal scroll, no clipped/overflowing text, and content remains centered/constrained at large widths.
- Open the browser dev console at each viewport width and confirm zero errors/warnings.
- Disable JavaScript in the browser and reload the page, confirming nav and hero content remain fully visible and unchanged.
- Run an HTML5 validator against `index.html` and confirm no errors.
- Run a quick accessibility scan (e.g., axe or Lighthouse accessibility audit) confirming reasonable color contrast for nav and hero text and correct heading hierarchy (single `<h1>`).
- Manually confirm no JavaScript framework, CSS framework, or build tool is referenced anywhere in `index.html` or `styles.css` (e.g., no `<script src="react...">`, no `node_modules`, no bundler config files present).

## 6. Out of scope (carried from spec)

- Additional pages (About, Contact, Services, etc.) beyond the single home page; nav links may remain placeholder `#` anchors.
- Any backend, server-side logic, database, or CMS integration.
- Any JavaScript frameworks, CSS frameworks, or build/bundling tooling (React, Vue, Bootstrap, Tailwind, Sass compilation, webpack, etc.).
- Interactive functionality beyond basic nav display (no working forms, search, dynamic content loading, or animations beyond simple CSS transitions).
- Custom logo design, branded imagery, or professional photography — placeholder text/graphics only.
- SEO optimization, analytics integration, or third-party script embeds.
- Cross-browser testing beyond modern evergreen browsers.
- Deployment/hosting setup — source files only.
- Domain-specific "Minas Tirus" lore/story content beyond using the title as branding text.