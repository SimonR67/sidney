# Plan: Simple HTML Home Page with Nav Bar and Hero Section

Status: draft
Job: a89ab1d4-2e29-415e-9b5e-020d38094a6b
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/a89ab1d4-2e29-415e-9b5e-020d38094a6b/spec.md

## 1. Definition of done

- `index.html` exists at the repo root and opens directly in a browser with no build step.
- Page contains a semantic `<header>`/`<nav>` nav bar with a site name/logo placeholder and at least one placeholder nav link (`#` targets).
- Page contains a `<section>` hero area positioned at/near the top, below or including the nav bar.
- The text "Alpha Centuri" appears inside the hero section as the largest, highest-contrast, most visually prominent text on the page.
- A dark blue and orange color scheme (plus neutral white/gray/black for readability) is applied consistently to nav bar, hero, and any other visible elements — no other unrelated dominant colors.
- Layout remains readable and unbroken at ~1200px+ (desktop) and ~375px (mobile) widths.
- Page is fully functional and readable with JavaScript disabled (no JS required for core content/layout).
- No additional pages, backend logic, forms, build tooling, or frameworks are introduced.

## 2. File map

| File | Change |
|---|---|
| index.html | New file — semantic HTML5 structure with `<header>`/`<nav>` nav bar, `<section>` hero with "Alpha Centuri" title, optional subtitle/CTA, links to styles.css |
| styles.css | New file — dark blue/orange color scheme, nav bar styling, hero styling, basic responsive layout (media queries for ~375px and ~1200px+) |

## 3. User journey

A visitor opens `index.html` directly in a browser (double-click the file, or navigate to it via a static file server/GitHub Pages once deployed later). They immediately see a horizontal nav bar at the top with a text-based "Alpha Centuri" brand label and placeholder links (Home, About, Contact) that don't navigate anywhere real. Directly below, a hero section fills much of the visible viewport, dominated by the large, high-contrast "Alpha Centuri" title, optionally accompanied by a short tagline or CTA button. The whole page uses dark blue and orange as the dominant colors, with white/gray text where needed for legibility. Resizing the browser down to a phone-sized width keeps the nav bar and hero readable without horizontal scrolling or broken layout. Disabling JavaScript in the browser has no visible effect — the page looks and reads the same.

## 4. Tasks

- [ ] 1. Create base `index.html` with semantic skeleton (`<!DOCTYPE html>`, `<head>` with title/meta viewport, `<header>`, empty `<nav>`, empty hero `<section>`, link to `styles.css`) — files: index.html — test: opening the file in a browser shows a blank-but-structured page with no console errors; HTML validates as well-formed (no unclosed tags)
- [ ] 2. Build nav bar markup and content (site name/logo text placeholder + Home/About/Contact links pointing to `#`) inside `<header>`/`<nav>` — files: index.html — test: manual/browser check that nav bar renders horizontally with visible brand label and at least one clickable placeholder link that does not error or navigate away
- [ ] 3. Build hero section markup (prominent `<h1>Alpha Centuri</h1>`, optional subtitle `<p>` and CTA `<a>`/`<button>`) inside the hero `<section>` — files: index.html — test: "Alpha Centuri" text is present in the DOM inside the hero section and is the only `<h1>` on the page
- [ ] 4. Define dark blue and orange color variables/palette in `styles.css` (base colors, contrast neutrals) and apply to page background, nav bar, and hero background/text — files: styles.css — test: visual check confirms nav bar and hero use dark blue/orange as dominant colors with no unrelated dominant colors present; text remains legible (sufficient contrast) against backgrounds
- [ ] 5. Style the "Alpha Centuri" title as the clear visual focal point (largest font size on the page, high-contrast color, centered/prominent placement) — files: styles.css — test: browser inspection confirms the hero `<h1>` has the largest computed font-size on the page and passes a basic visual contrast check against its background
- [ ] 6. Add responsive layout rules (media queries) so nav bar and hero reflow/stack appropriately at ~375px width while remaining unchanged in intent at ~1200px+ — files: styles.css — test: resizing browser viewport (or DevTools device toolbar) to 375px and 1200px shows no horizontal overflow, overlapping text, or clipped content at either width
- [ ] 7. Verify no-JS behavior and finalize semantic structure/placeholder link safety (`#` links don't throw errors) — files: index.html, styles.css — test: disable JavaScript in browser settings, reload page, confirm nav bar, hero, and title still render fully and links remain clickable without console errors

## 5. Test plan

After all tasks are complete, perform a full manual pass in at least two evergreen browsers (e.g., Chrome and Firefox):
1. Open `index.html` directly from the filesystem (no server) to confirm it works as a pure static file.
2. Resize the viewport across desktop (~1200px+) and mobile (~375px) widths, checking for layout breakage, overflow, or unreadable text at each.
3. Disable JavaScript and reload to confirm identical rendering and full readability/functionality of nav bar and hero.
4. Visually scan the entire page to confirm dark blue and orange (plus neutral supporting tones) are the only dominant colors used, applied consistently across nav bar, hero, and any buttons/links.
5. Confirm "Alpha Centuri" is unmistakably the largest, most prominent text element on the page.
6. Click each placeholder nav link to confirm it does not throw a console error or navigate to a broken/external destination.
7. Run the file through an HTML validator (e.g., W3C validator) to confirm well-formed semantic markup.
8. Confirm no other files (backend code, extra pages, JS frameworks, build configs) were introduced beyond `index.html` and `styles.css`.

## 6. Out of scope (carried from spec)

- Additional pages (About, Contact, etc.) beyond the single home page.
- Working navigation/routing to other pages — nav links remain placeholders only.
- Backend functionality, forms, form submission handling, or server-side logic.
- JavaScript-driven interactivity (mobile menu toggles, animations, sliders) beyond the strict minimum, if any.
- CMS integration, templating engines, or build tooling/frameworks (React, Vue, static site generators).
- SEO optimization, analytics integration, or accessibility auditing beyond basic semantic HTML.
- Custom logo design or branded imagery/graphics — text-based branding only.
- Cross-browser testing beyond modern evergreen browsers (Chrome, Firefox, Safari, Edge).
- Deployment/hosting setup — this plan covers only creation of the site files within the repo.