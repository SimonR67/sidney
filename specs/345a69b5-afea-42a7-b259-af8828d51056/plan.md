# Plan: Three-Page Navigation (Home, About, Contact) with Page-Specific Images

Status: draft
Job: 345a69b5-afea-42a7-b259-af8828d51056
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/345a69b5-afea-42a7-b259-af8828d51056/spec.md

## 1. Definition of done

- The site's navigation menu shows exactly three items: "Home", "About", "Contact".
- Each nav item links to its own distinct, independently reachable route (`/`, `/about`, `/contact` or framework equivalent) — not an in-page anchor, unless the repo is confirmed single-page-only (flagged if so).
- Clicking each nav item navigates only to its corresponding page, with no 404s or broken routing.
- `File1767.jpg` is downloaded from the specified Google Drive ID, committed to the repo's asset directory, and displayed visibly on page load on the Home page with a descriptive `alt` attribute.
- `City_Eclipse.jpeg` is downloaded, committed, and displayed visibly on page load on the About page with a descriptive `alt` attribute.
- `Orion18032022-for-lightroom.jpg` is downloaded, committed, and displayed visibly on page load on the Contact page with a descriptive `alt` attribute.
- All three images render without broken links or layout breakage, and use responsive sizing (`max-width: 100%; height: auto` or equivalent) consistent with existing styling.
- No image is silently replaced with a placeholder — any download/access failure is flagged rather than worked around silently.
- Any pre-existing duplicate/conflicting Home/About/Contact pages are consolidated rather than duplicated.

## 2. File map

| File | Change |
|---|---|
| (investigation output — no file yet) | Confirm actual site framework/structure (static HTML, SPA, SSG, etc.) before finalizing paths below |
| /images/ (or /assets/, /static/ — per repo convention) | Add `File1767.jpg`, `City_Eclipse.jpeg`, `Orion18032022-for-lightroom.jpg` |
| Home page file (e.g. `index.html` / `pages/home.*`) | Add/confirm route, add `<img>` for `File1767.jpg` with alt text |
| About page file (e.g. `about.html` / `pages/about.*`) | Add/confirm route, add `<img>` for `City_Eclipse.jpeg` with alt text |
| Contact page file (e.g. `contact.html` / `pages/contact.*`) | Add/confirm route, add `<img>` for `Orion18032022-for-lightroom.jpg` with alt text |
| Nav/header partial (e.g. `components/nav.*`, `_includes/header.html`) | Add/fix three links pointing to Home, About, Contact routes |
| Routing config (if framework requires, e.g. `routes.js`, `next.config.js`, `.htaccess`) | Register new routes so links don't 404 |
| Stylesheet (e.g. `styles.css`, `style.scss`) | Add responsive image rules (`max-width: 100%; height: auto`) consistent with existing conventions |
| e2e/integration test file (e.g. `tests/nav.spec.js`) | Verify full nav + image flow end-to-end |

## 3. User journey

A visitor lands on the site's Home page and sees the nav menu with "Home", "About", "Contact" links, along with the `File1767.jpg` image visible without scrolling. They click "About" and are taken to a distinct `/about` URL showing `City_Eclipse.jpeg`. They click "Contact" and land on `/contact`, seeing `Orion18032022-for-lightroom.jpg`. At every step, the URL changes to reflect the current page (bookmarkable/shareable), the correct nav item is the only one that navigates them there, and images load correctly and responsively regardless of device width.

## 4. Tasks

- [ ] 1. Investigate current repo structure to confirm site framework (static multi-page, SSG, or SPA with anchors) and locate existing nav/page files or lack thereof — files: repo root, README, existing HTML/template files — test: written findings note confirming architecture type, existing page/nav file paths (or their absence), and any duplicate Home/About/Contact pages found; this determines exact paths used in tasks 2+.
- [ ] 2. Download the three specified images from Google Drive (IDs given in spec) and add them to the repo's asset directory per existing conventions — files: `/images/` (or equivalent) — test: each of the three files exists at the expected path, opens as a valid image, and file size/checksum is consistent with a successful download (not 0 bytes / not an HTML error page from Drive).
- [ ] 3. Create or fix the Home page as an independently routable page at `/` displaying `File1767.jpg` with a descriptive `alt` attribute — files: Home page template/file — test: requesting `/` returns 200 and the page HTML contains an `<img>` tag referencing `File1767.jpg` with a non-empty `alt` attribute.
- [ ] 4. Create or fix the About page as an independently routable page at `/about` displaying `City_Eclipse.jpeg` with a descriptive `alt` attribute — files: About page template/file — test: requesting `/about` returns 200 and the page HTML contains an `<img>` tag referencing `City_Eclipse.jpeg` with a non-empty `alt` attribute.
- [ ] 5. Create or fix the Contact page as an independently routable page at `/contact` displaying `Orion18032022-for-lightroom.jpg` with a descriptive `alt` attribute — files: Contact page template/file — test: requesting `/contact` returns 200 and the page HTML contains an `<img>` tag referencing `Orion18032022-for-lightroom.jpg` with a non-empty `alt` attribute.
- [ ] 6. Add or fix the navigation menu so it renders exactly three links labeled "Home", "About", "Contact" pointing to the correct routes — files: nav/header partial — test: rendered nav HTML contains three `<a>` elements with the correct labels and `href` values matching `/`, `/about`, `/contact` respectively, and no extra/duplicate nav items.
- [ ] 7. Register/verify any routing configuration the framework needs so navigating via the links never 404s — files: routing config (if applicable) — test: simulated navigation via each nav link returns 200 for its target page (not 404), for all three links.
- [ ] 8. Add responsive styling to the page images so they display without breaking layout on common viewport widths — files: stylesheet — test: computed style (or CSS rule inspection) shows `max-width: 100%` and `height: auto` (or equivalent) applied to the page images; manual/automated check at a narrow viewport shows no horizontal overflow.
- [ ] 9. If the existing site already has an active-nav-item styling pattern, extend it to Home/About/Contact for consistency — files: nav/header partial, stylesheet — test: when on a given page, that page's nav link carries the active class/state and the other two do not (skip/mark N/A if no such pattern pre-exists).
- [ ] 10. Consolidate any pre-existing duplicate/conflicting Home/About/Contact pages discovered during investigation (task 1) rather than leaving duplicates — files: as identified in task 1 — test: only one canonical page/route exists per section, and no orphaned duplicate page is still linked or reachable (skip/mark N/A if none found).

## 5. Test plan

Beyond the per-task tests, run a full end-to-end pass once all tasks are complete: starting from the Home page, click each nav link in turn (Home → About → Contact → Home) and verify (a) the URL changes to the correct distinct route each time, (b) only the intended page's content/image is shown at each step, (c) all three images load without broken-image icons or console errors, and (d) no navigation results in a 404 or unexpected redirect. Additionally spot-check on a narrow (mobile-width) viewport to confirm images remain responsive and nav links remain functional. Confirm no placeholder images remain silently substituted for any of the three specified assets.

## 6. Out of scope (carried from spec)

- Redesigning the overall site visual theme, layout, color scheme, or typography beyond what's needed to place the nav and images.
- Adding new page content/copy beyond what's needed for functional pages (no new About/Contact copy, contact forms, maps, or business info required).
- Image editing/retouching (cropping, compression optimization, resizing beyond basic responsive display) beyond format conversion strictly necessary for web display.
- Setting up a CMS, image hosting service, or dynamic image-loading pipeline — images are static assets only.
- Mobile app or non-web deliverables.
- SEO optimization, metadata, or social-sharing image tags for these pages.
- Contact form functionality (message sending/backend) — only the Contact page and its image are in scope.
- Any additional pages beyond Home, About, Contact.
- Changing the Google Drive images themselves, their names, or their source-of-truth location.