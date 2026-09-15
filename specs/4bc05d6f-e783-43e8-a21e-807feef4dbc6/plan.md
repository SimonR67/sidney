# Plan: Case Studies page with sticky nav and enlarged logo

Status: draft
Job: 4bc05d6f-e783-43e8-a21e-807feef4dbc6
Spec: https://github.com/SimonR67/sidney/blob/main/specs/4bc05d6f-e783-43e8-a21e-807feef4dbc6/spec.md

## 1. Definition of done

- A "Case Studies" link appears in the shared nav on every page and routes to a new Case Studies page.
- The Case Studies page renders three full-width boxes, in order ComixIT → Learning → Professional Services, each reusing the existing "WHAT WE OFFER" box styling stretched to one column.
- Each box contains the verbatim text extracted (and manually verified) from its source PDF, plus recoloured papaya-orange versions of any extractable graphics from that PDF (text-only box if no suitable image exists).
- Page fonts/colours/spacing match the rest of the site using existing shared CSS — no new one-off styles.
- The shared nav/header component is sticky/fixed on every page, with site-wide top padding/margin added so no page content is hidden behind it.
- The nav logo is enlarged 60% (1.6x) without causing overlap, clipping, or wrapping of nav items at any currently supported breakpoint, including with the new "Case Studies" link present.
- No existing page's layout or functionality regresses as a result of the nav changes.

## 2. File map

| File | Change |
|---|---|
| `case/ComixIT.pdf`, `case/Learning.pdf`, `case/Professional-Services.pdf` | Read-only source content — text/images extracted from these, files themselves untouched |
| `templates/partials/nav.html` (or equivalent shared header/nav include) | Add "Case Studies" menu item; make nav sticky/fixed; enlarge logo 1.6x; adjust nav height/spacing to prevent overlap |
| `css/style.css` (or site's main/shared stylesheet) | Add `position: sticky`/`fixed` + z-index rule for nav; add/adjust logo size rule; add global top-padding rule for page content; reuse (not duplicate) existing "WHAT WE OFFER" box classes for full-width variant |
| `templates/pages/case-studies.html` (new, slug per site convention e.g. `/case-studies`) | New page template rendering the three case study boxes in order |
| `content/case-studies/comixit.html` / `.md` (new) | Extracted verbatim text + markup for ComixIT box |
| `content/case-studies/learning.html` / `.md` (new) | Extracted verbatim text + markup for Learning box |
| `content/case-studies/professional-services.html` / `.md` (new) | Extracted verbatim text + markup for Professional Services box |
| `assets/img/case-studies/comixit/*.png|svg` (new) | Recoloured (papaya orange) versions of extractable ComixIT graphics |
| `assets/img/case-studies/learning/*.png|svg` (new) | Recoloured (papaya orange) versions of extractable Learning graphics |
| `assets/img/case-studies/professional-services/*.png|svg` (new) | Recoloured (papaya orange) versions of extractable Professional Services graphics |
| Router/pages config (e.g. `routes.js`, `_config.yml`, or equivalent site navigation manifest) | Register new `/case-studies` route and menu entry |
| Existing page templates (e.g. `templates/pages/*.html`) | Verify/adjust top-of-page spacing if a shared layout wrapper isn't already used |

## 3. User journey

A visitor lands on any page of the site (e.g. the home page) and sees the SoftPapaya logo noticeably larger in the nav, which stays pinned to the top as they scroll down through the page's content — no page content is ever hidden behind it. In the main menu they see a new "Case Studies" item alongside the existing links. Clicking it takes them to `/case-studies`, a page styled identically to the rest of the site (same fonts, colours, section spacing), where they see three full-width boxes stacked vertically — ComixIT, then Learning, then Professional Services — each using the same rounded/bordered/shadowed box look as the "WHAT WE OFFER" boxes elsewhere on the site, but spanning the full page width. Each box shows the real case study copy exactly as written in the source PDF, along with any diagrams/icons from that PDF recoloured into papaya orange tones so they still look like the original but match the site's branding. The visitor can scroll the whole page with the sticky nav (including the "Case Studies" link) always accessible, and on a narrow/mobile screen the enlarged logo and nav items still fit cleanly without overlapping or wrapping oddly.

## 4. Tasks

- [ ] 1. Extract and manually verify verbatim text from `case/ComixIT.pdf`, `case/Learning.pdf`, `case/Professional-Services.pdf`, saving each as content files — files: `content/case-studies/comixit.html`, `content/case-studies/learning.html`, `content/case-studies/professional-services.html` — test: manual spot-check diff of each content file against its source PDF confirms wording matches verbatim (headings, body, lists) with no paraphrasing.
- [ ] 2. Extract, recolour (papaya orange palette), and save any usable graphics from the three PDFs, or confirm none exist for a given PDF — files: `assets/img/case-studies/comixit/*`, `assets/img/case-studies/learning/*`, `assets/img/case-studies/professional-services/*` — test: visual review confirms each saved image is recognisably derived from its PDF source and papaya orange is the dominant accent colour; boxes with no extractable images have no placeholder files.
- [ ] 3. Identify and isolate the existing "WHAT WE OFFER" box CSS/component so it can be reused as a full-width single-column variant — files: `css/style.css` — test: a small demo/snapshot render (or existing box) confirms the extracted class(es) still render the three-column boxes identically on the existing "WHAT WE OFFER" section (no regression).
- [ ] 4. Build the new Case Studies page template that renders the three content files as full-width boxes in ComixIT → Learning → Professional Services order using the reused box styling — files: `templates/pages/case-studies.html` — test: rendering the page shows exactly three boxes in the correct order, each using the shared box class(es), verified via a snapshot/DOM test asserting box count, order, and class names.
- [ ] 5. Register the new page route/slug in the site's routing/page config — files: router/pages config file — test: request to `/case-studies` (or chosen slug) returns 200 and renders the case-studies template, verified by an integration/route test.
- [ ] 6. Add the "Case Studies" menu item to the shared nav component, positioned consistently with other items — files: `templates/partials/nav.html` — test: a test loads any two arbitrary pages (e.g. home and an inner page) and asserts a "Case Studies" link is present in the nav on both, pointing to the correct route.
- [ ] 7. Make the shared nav sticky/fixed via CSS and add corresponding site-wide top padding/margin to page content — files: `templates/partials/nav.html`, `css/style.css` — test: automated style check (or visual regression) confirms nav element has `position: sticky`/`fixed` with a defined top offset, and that a sampled page's main content wrapper has top spacing ≥ nav height so headings aren't covered on load.
- [ ] 8. Enlarge the nav logo by 1.6x and adjust nav height/spacing so no items overlap or clip at existing supported breakpoints — files: `css/style.css`, `templates/partials/nav.html` — test: computed style/dimension test confirms logo width/height (or font-size) is 1.6x the prior value, plus a layout check at each supported breakpoint (e.g. via viewport-resized screenshot or DOM bounding-box assertions) confirming no overlap between logo and nav items including "Case Studies".
- [ ] 9. Verify sticky-nav + top-padding changes don't break any existing page (headings not hidden, no layout shift) — files: any existing page templates needing spacing fixes — test: for each existing top-level page, an automated or manual check confirms the page's topmost heading/content is fully visible on initial load and while scrolled, with the nav overlapping nothing.

## 5. Test plan

- Run the full existing site test/build suite to confirm no regressions from the shared nav/CSS changes across all existing pages.
- Manual reviewer spot-check: open each of the three case study boxes side-by-side with its source PDF and confirm text is verbatim (including any typos/awkward phrasing preserved) and that any images are recognisably derived and papaya-orange-dominant.
- Cross-page check: load home page plus at least two other existing pages, scroll each, and confirm (a) nav stays fixed/visible, (b) no content is hidden under the nav on load or after scrolling, (c) the "Case Studies" link is present and functional on all of them.
- Responsive check: resize/viewport-test at the site's currently supported breakpoints (including narrowest supported mobile width) to confirm the 1.6x logo plus all nav items (including "Case Studies") fit without overlap, clipping, or unexpected wrapping, and no horizontal scroll is introduced.
- Full click-through: from a page other than Case Studies, click the new nav link, land on `/case-studies`, and visually confirm page chrome (fonts/colours/spacing) matches the rest of the site with three correctly ordered, correctly styled boxes.

## 6. Out of scope (carried from spec)

- Redesigning overall site visual style, colour palette, typography, or the "WHAT WE OFFER" section itself beyond reusing its box styling.
- Editing, summarizing, correcting, or improving PDF-extracted wording — copy used exactly as written, typos included.
- Interactive/filterable/paginated case study presentation (tabs, carousels, "load more").
- Adding case studies beyond the three named PDFs, or building a CMS/admin mechanism for future case studies.
- Modifying the source PDFs or the `case` folder structure.
- Redesigning the logo mark/artwork itself — size-only change.
- Converting the nav to a hamburger/mobile menu pattern unless one already exists.
- General mobile-responsiveness overhaul beyond preventing the logo/sticky-nav changes from breaking existing breakpoints.
- SEO, analytics, or metadata work for the new page beyond existing site defaults.
- Accessibility audit/remediation beyond not regressing current accessibility conventions (e.g. alt text).