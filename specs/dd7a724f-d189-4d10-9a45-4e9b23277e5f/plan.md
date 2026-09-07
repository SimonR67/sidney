# Plan: Update site color scheme to Dark Blue and Orange, and increase visual prominence of page/site title

Status: draft
Job: dd7a724f-d189-4d10-9a45-4e9b23277e5f
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/dd7a724f-d189-4d10-9a45-4e9b23277e5f/spec.md

## 1. Definition of done

- The site's stylesheet(s)/theme tokens use a dark blue base color for backgrounds/surfaces and orange as the consistent accent color (links, buttons, highlights).
- The color scheme is applied uniformly across every page the build generates — no page retains the old palette.
- The site/page title element has a visibly larger font size, heavier weight, and clear spacing/color separation from subheadings and body text, compared to its previous styling.
- No hardcoded inline colors are left mismatched with the new palette; any that can't be centrally updated are found and fixed (or explicitly noted if too numerous).
- Text remains legible against the new backgrounds on all pages (basic contrast sanity check, not a full WCAG audit).
- No content, navigation, structure, fonts/typefaces, images/logos, or build tooling changes are introduced beyond what's strictly needed for the color/title styling.
- If any open question from the spec (exact hex values, single vs. centralized stylesheet, etc.) blocks a specific decision, the implementer's chosen default is documented in the PR description rather than left ambiguous in code.

## 2. File map

| File | Change |
|---|---|
| (discovery target, e.g. `style.css` / `main.css` / `assets/css/*.css`) | Update/introduce color variables (background, text, link, border, button/accent) to dark blue + orange palette |
| (discovery target, e.g. `_config.yml` / theme config file, if present) | Update any centralized theme color tokens referenced by templates |
| (discovery target, e.g. `_layouts/default.html` / `templates/header.html` / equivalent header/title partial) | Add/adjust class on the site/page title element if needed to hook new styling; no structural change |
| (discovery target, e.g. `_includes/head.html` / meta tags file) | Optional: update `theme-color` meta tag to match new dark blue, if such a tag exists (flag as open question if ambiguous) |
| PR description / notes file (no repo file, documentation only) | Record chosen exact hex values and any open-question defaults made during implementation |

Note: exact file paths are not yet confirmed from the target repo; task 1 below is dedicated to identifying the real file(s) before any styling change is made, and this table should be corrected in the PR once confirmed.

## 3. User journey

A visitor loads any page of the site (homepage, an inner page, a blog/article page if present). They immediately see:
1. The page background/primary surface rendered in a dark navy blue rather than the previous scheme.
2. Interactive/accent elements (links, buttons, highlighted UI) rendered in orange, clearly distinguishable against the dark blue background.
3. The site or page title at the top of the page rendered noticeably larger and bolder than before, standing out clearly from any subheading or body copy beneath it — the visitor's eye is drawn to it first.
4. Navigating to a second, different page confirms the same color scheme and title treatment are applied there too, not just on one page.
5. All body text remains easily readable against the new background — no visitor needs to strain to read content.

No other behavior (navigation, links, content) changes from the visitor's perspective.

## 4. Tasks

- [ ] 1. Identify the site's build system and locate the actual stylesheet(s)/theme config and header/title template(s) that control color and title markup — files: repo-wide search (no code change yet) — test: a short findings note (in PR/commit message) lists the exact file path(s) that will be edited in tasks 2–4, confirming a centralized styling mechanism exists (or documenting that it doesn't, per spec's edge case)
- [ ] 2. Define the dark blue + orange color values (as variables/tokens if the stylesheet supports them, or as direct values otherwise) and apply the dark blue as the base background/surface color across the identified stylesheet — files: identified stylesheet/theme config from task 1 — test: build the site locally and visually/DOM-inspect that the background/surface color on at least two different pages resolves to the new dark blue value (e.g. via computed style or rendered HTML/CSS snapshot)
- [ ] 3. Apply orange as the accent color for links, buttons, and other highlighted UI elements in the same stylesheet — files: identified stylesheet/theme config from task 1 — test: inspect rendered CSS/computed styles on a page with a link and a button/UI accent element and confirm both resolve to the new orange value on multiple pages
- [ ] 4. Increase visual prominence of the site/page title (font-size increase, font-weight increase to existing bold weight, added spacing/contrast) — files: identified stylesheet + title template/partial from task 1 (add a class only if none exists) — test: compare computed font-size/font-weight of the title element before vs. after the change (e.g. via a snapshot/computed-style test or manual measurement) confirming the new value is larger/bolder than the prior one, on both a homepage and an inner page if titles differ
- [ ] 5. Sweep for and fix hardcoded/inline colors that conflict with the new palette (e.g. old light-background or off-palette hex values embedded directly in HTML/templates rather than the stylesheet) — files: any templates/partials found containing inline color styles — test: repo-wide search confirms no remaining hardcoded color values matching the old palette; spot-check rendered pages show consistent new palette
- [ ] 6. Add fallback styling for any component where the strict dark-blue/orange pairing produces poor contrast (e.g. form fields, code blocks) — files: identified stylesheet — test: manually verify (or via a simple contrast-ratio check) that text in the flagged component(s) is legible against its background, using a readable variant instead of the strict two-color pairing
- [ ] 7. Full-site visual pass across all page templates/types produced by the build (home, inner page, any post/article template) to confirm consistent palette and title styling — files: none (verification only, fixes routed back into stylesheet/template files above if gaps found) — test: build the full site and check at least one page of each distinct template type for correct background, accent, and title styling

## 5. Test plan

- Run the site's build process end-to-end and generate the full set of output pages.
- For each distinct page template type in the build (e.g. homepage, standard page, post/article if applicable), verify: dark blue base background/surface, orange accent on links/buttons, and the enlarged/bolder title styling — confirming consistency across the whole site, not just one page.
- Do a basic contrast check (visual inspection or a simple contrast-ratio tool) on body text against backgrounds and on any orange-on-dark-blue or dark-blue-on-orange combinations to confirm legibility per the spec's readability requirement.
- Diff the rendered HTML structure before/after the change to confirm no content, navigation, or structural elements were altered — only styling (and, where necessary, a minimal added class) changed.
- Confirm the browser tab `<title>` tag was left untouched (per spec's edge case, it's not a styling target).
- Manually click through a couple of pages to confirm no regressions to links/navigation functionality.

## 6. Out of scope (carried from spec)

- No changes to site content, structure, navigation, or information architecture.
- No page layout redesign beyond what's needed for title prominence (no grid/column changes, no new sections).
- No introduction of a full design system, theming engine, or dark/light mode toggle.
- No font/typeface changes unless strictly necessary for "bolder" — prefer existing font family's bold weight.
- No recoloring or changes to images, logos, or icons.
- No full WCAG accessibility audit — only basic contrast sanity-checking.
- No changes to build tooling/pipeline (e.g. no static site generator or CSS framework migration), unless the build has no styling mechanism at all — in which case this is flagged as an open question rather than assumed.