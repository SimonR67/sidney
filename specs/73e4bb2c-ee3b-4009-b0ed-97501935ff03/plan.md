# Plan: Rebrand and restyle site as "Alpha Centauri" (dark blue theme, orange accents)

Status: draft
Job: 73e4bb2c-ee3b-4009-b0ed-97501935ff03
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/73e4bb2c-ee3b-4009-b0ed-97501935ff03/spec.md

## 1. Definition of done

- A single dark blue color (specific hex, defined once where possible) is the dominant background across every page/layout in the site.
- A single orange color (specific hex, defined once where possible) is applied consistently to all buttons, links, hover/active/focus states, and other previously-accent-colored elements across every page.
- Every page's `<title>` reads "Alpha Centauri" (or "Alpha Centauri — [Page Name]" if a suffix pattern already exists).
- The header/navbar branding text reads "Alpha Centauri" on every page.
- All `<meta>` tags (description, og:title, og:site_name, twitter:card), manifest `name`/`short_name` fields, and footer/copyright text reference "Alpha Centauri" instead of the old name.
- A repo-wide search for the old site name turns up no remaining user-facing/metadata references (excluding explicitly out-of-scope items like package/repo name).
- No functional regressions: all existing pages, links, routes, and features behave identically to before the change.
- Text remains legible (reasonable contrast) against the new dark blue background everywhere.
- Any ambiguities (baked-in-image branding, existing light/dark toggle, unclear "old name" occurrences) are flagged to the reviewer rather than guessed at.

## 2. File map

| File | Change |
|---|---|
| (discovery step, no file yet) | Identify the current site name and current theme/branding source of truth (e.g. global stylesheet, theme config, layout/template files, manifest) before editing |
| src/styles/*.css or equivalent global stylesheet/theme file | Update primary background color variable(s) to dark blue; update accent/button/link color variable(s) to orange |
| src/**/components/**Header**, Navbar, Layout templates | Replace old site name text with "Alpha Centauri" in branding/logo text |
| **/*.html, **/layout*, **/_document* or framework-equivalent root template | Update `<title>` tag(s) and `<meta>` tags (description, og:title, og:site_name, twitter:card) to reference "Alpha Centauri" |
| public/manifest.json or site.webmanifest (if present) | Update `name` and `short_name` fields to "Alpha Centauri" |
| Footer component/template | Update copyright/footer text to reference "Alpha Centauri" |
| README.md | Update user-facing references to the old site name to "Alpha Centauri" (if user-facing rather than purely internal) |
| Any additional files found via repo-wide search (JSON-LD, RSS, sitemap, error pages, email templates, config) | Update remaining old-name occurrences flagged as user/crawler-visible |

## 3. User journey

A visitor loads any page of the site: the browser tab now shows "Alpha Centauri" (with page suffix if applicable), the page background is a consistent dark blue across the homepage and all subpages, and the header/navbar clearly displays "Alpha Centauri" as the site's name. As the visitor navigates the site, links, buttons, and hover/active states all appear in orange, in place of the previous accent color, while all existing navigation, content, and functionality behave exactly as before. If the visitor views the page source or shares the page (social preview), the metadata (title, description, og:site_name, twitter:card) all reflect "Alpha Centauri" rather than the old name. No page is left with the old name, old background color, or old accent color.

## 4. Tasks

- [ ] 1. Discover current site name, existing theme/color source(s) of truth (CSS variables vs. scattered hardcoded colors), presence of a light/dark toggle, and any image-based logo with baked-in text — record findings and flag ambiguities/open questions to reviewer — files: none (research only, documented in job notes) — test: a written summary exists confirming old site name string(s), theme file locations, and whether a toggle/image-logo exists.
- [ ] 2. Choose and document specific hex values for "dark blue" (background) and "orange" (accent) to be used consistently — files: theme/config file or new documented constant — test: the two hex values are recorded and referenced by subsequent tasks (no ambiguity in later diffs).
- [ ] 3. Update global background color to the chosen dark blue in the central stylesheet/theme variable(s) — files: global stylesheet/theme file — test: a rendered/computed-style check (e.g. snapshot or CSS assertion) confirms the primary background of the homepage and at least one other page equals the chosen dark blue hex.
- [ ] 4. Update button styling (all button variants: primary, secondary, CTA, form submit, nav) to the chosen orange, including hover/active states — files: global stylesheet/component button styles — test: a rendered/computed-style check confirms button background/border color equals the chosen orange in default and hover/active states.
- [ ] 5. Update accent/link/highlight styling (links, active nav indicators, accent headings, icons) to the chosen orange — files: global stylesheet/theme variables, any component-level overrides found in task 1 — test: a computed-style check on a sample link and an active nav indicator confirms orange is applied; visual diff shows no remaining old accent color on a full-page render.
- [ ] 6. If task 1 found hardcoded colors scattered outside the central theme file, sweep and update each remaining instance for background/button/accent purposes — files: any component files identified — test: repo-wide grep for the old background/accent hex values returns zero matches (except explicitly out-of-scope files).
- [ ] 7. Update `<title>` tag(s) across all pages/templates to "Alpha Centauri" (preserving existing per-page suffix pattern if present) — files: root layout/template, per-page templates if titles aren't centralized — test: rendering each page shows the expected title string; automated check confirms no page title contains the old name.
- [ ] 8. Update header/navbar branding/logo text to "Alpha Centauri" — files: Header/Navbar component/template — test: rendering any page shows "Alpha Centauri" in the header on every route.
- [ ] 9. Update `<meta>` tags (description, og:title, og:site_name, twitter:card) referencing the old name to "Alpha Centauri" — files: root layout/head template — test: rendered HTML `<head>` contains "Alpha Centauri" in each relevant meta tag and no occurrence of the old name.
- [ ] 10. Update web app manifest `name`/`short_name` fields (if a manifest file exists) — files: manifest.json/site.webmanifest — test: manifest file parses and its `name`/`short_name` equal "Alpha Centauri" (or an appropriate short form).
- [ ] 11. Update footer/copyright text and any other template-level user-facing string referencing the old name — files: Footer component/template — test: rendered footer text on any page reads "© Alpha Centauri" (or equivalent) with no old-name reference.
- [ ] 12. Perform a full repo-wide search-and-fix pass for any remaining occurrences of the old site name in user-facing or crawler-visible files (JSON-LD, RSS/sitemap, error pages, README, email templates, config comments) not already covered — files: as identified — test: repo-wide grep for the old name string returns zero matches outside explicitly out-of-scope files (package name, repo name), with any ambiguous matches listed and flagged rather than changed.
- [ ] 13. Flag any known gaps to the reviewer that are explicitly out of scope but discovered during implementation (e.g., old name baked into a logo image, favicon not updated, existing light/dark toggle needing reconciliation) — files: none (written note) — test: a note listing each flagged gap exists alongside the PR/plan.

## 5. Test plan

- Manual/automated visual check of every page/route in the site confirming: dark blue background, orange buttons/accents, "Alpha Centauri" title and header branding.
- Automated (or scripted) repo-wide grep for the old site name string, confirming zero remaining matches outside explicitly out-of-scope files (package.json name, repo identifier), with any ambiguous common-word matches reviewed manually.
- Automated (or scripted) repo-wide grep for the old primary/accent hex color values, confirming zero remaining matches.
- Full click-through regression pass over existing navigation/links/features to confirm no functional or structural regressions were introduced (routes, forms, existing behavior unchanged).
- Contrast spot-check (manual, non-formal) of body text and button text against the new dark blue and orange colors on each page template to confirm legibility.
- If a light/dark toggle or image-based logo with baked-in old name is discovered, confirm it has been explicitly flagged in the PR description/reviewer notes rather than silently left unaddressed.

## 6. Out of scope (carried from spec)

- No changes to site content, copy (other than site name/title references), page structure, navigation structure, routing, or URLs.
- No changes to site functionality, features, business logic, backend behavior, or data models.
- No framework, language, or tech-stack migration.
- No redesign of layout/UX beyond color changes (no repositioning, no typography/font changes, no spacing/grid changes) unless strictly required for legibility.
- No new logo artwork/graphic design — only adjacent/embedded text labels are updated, not image pixels.
- No changes to domain name, hosting, repo name, or package/project name unless separately approved by the reviewer.
- No SEO strategy work beyond literal name-string swaps in existing metadata fields.
- No new dark-mode/light-mode toggle feature; if one already exists, both variants are updated to the new palette rather than adding new UI.
- No accessibility audit or formal WCAG compliance certification — only reasonable, common-sense legibility effort.
- No changes to third-party integrations displaying the old name (outside the repo/codebase).