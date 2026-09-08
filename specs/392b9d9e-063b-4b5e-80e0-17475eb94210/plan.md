# Plan: Rebrand website to "Alpha Centuri" with dark blue/orange theme and updated home page copy

Status: draft
Job: 392b9d9e-063b-4b5e-80e0-17475eb94210
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/392b9d9e-063b-4b5e-80e0-17475eb94210/spec.md

## 1. Definition of done

- Every page of the site renders a dark blue primary background/theme color as the dominant visual color.
- Every button on the site uses orange as its primary color (background, border, or text).
- Every link and other designated text accent renders in orange.
- The `<title>` tag on every page reads "Alpha Centuri", generated from a single source where the site uses shared templates/config.
- All visible header/nav and footer branding text showing the old site name now shows "Alpha Centuri".
- The home page contains the exact new paragraph about board advisory services, inserted without breaking layout.
- No page other than the home page has content changes beyond the title/branding swap; no layout/navigation/route changes anywhere.
- The site still builds/renders without errors after all changes.

## 2. File map

| File | Change |
|---|---|
| (to be identified in Task 1 audit) main stylesheet(s) / theme config (e.g. `css/style.css`, `_sass/*.scss`, or theme variables file) | Replace/introduce dark blue background/primary theme variables and orange button/accent/link colors |
| (to be identified in Task 1 audit) shared layout/template (e.g. `_layouts/default.html`, `templates/base.html`, `index.html` `<head>`) | Update `<title>` tag / title-generating value |
| (to be identified in Task 1 audit) site config (e.g. `_config.yml`, `package.json`, `site.json`) | Update `site.title` (or equivalent) config field to "Alpha Centuri" |
| (to be identified in Task 1 audit) header/nav partial and footer partial | Update visible branding text (logo/site name, footer copyright line) to "Alpha Centuri" |
| (to be identified in Task 1 audit) home page content source (e.g. `index.html`, `home.md`, home page data/template) | Insert new paragraph with the exact board advisory services copy |
| `docs/rebrand-audit.md` (new, scratch/working doc, optional) | Record inventory of found title occurrences, color declarations, and home page content location for traceability during implementation |

## 3. User journey

A visitor navigates to the site's home page and immediately sees a dark blue-themed page with the browser tab and header reading "Alpha Centuri" instead of the old name. Scanning the home page, they see a new paragraph describing the board advisory services, sitting alongside existing home page content without disrupting the layout. They notice links and buttons throughout the page (and as they click through to other pages, throughout the whole site) rendered in orange, standing out clearly against the dark blue background. Visiting any other page (e.g. About, Contact, Services), the visitor sees the same dark blue/orange theme and "Alpha Centuri" branding in the header/footer/tab title, but the actual content of those other pages is unchanged from before.

## 4. Tasks

- [ ] 1. Audit the repo to inventory every occurrence of the current site title (title tag, header/nav, footer, config), every place theme/background/button/link colors are declared (CSS files, inline styles, theme config/variables), and the current home page content source file(s) — files: `docs/rebrand-audit.md` (new) — test: audit doc lists concrete file paths and line references for at least: title occurrences, background color declarations, button color declarations, link/accent color declarations, and home page content source; reviewer can grep repo and confirm nothing found is missing from the list.
- [ ] 2. Introduce/centralize dark blue and orange theme values (e.g. CSS custom properties or a theme config block) without yet changing visual output — files: main stylesheet(s)/theme config identified in Task 1 — test: a new automated check (e.g. a small script or CSS lint rule) confirms the dark blue and orange values exist as named variables/config with the intended hex values.
- [ ] 3. Apply dark blue as the primary background/theme color across the main layout (body/page background, nav bar, header, footer, section backgrounds as applicable) — files: main stylesheet(s)/theme config, shared layout — test: rendering any page (home + at least one other page) and inspecting computed background-color of `body`/main containers shows the dark blue value; snapshot or DOM-based test asserts computed style equals the chosen dark blue hex.
- [ ] 4. Update all button elements/classes to use orange as their primary color (background, border, or text per existing button style) — files: main stylesheet(s)/button component styles — test: for every distinct button style/class found in Task 1 audit, a test (visual snapshot or computed-style assertion) confirms orange is applied.
- [ ] 5. Update link and other designated text-accent styles (default link color, hover state, highlighted text/headings using an accent color) to orange — files: main stylesheet(s) — test: computed-style assertion on an anchor tag (default and `:hover`) and any accent-styled heading/text element confirms orange is applied.
- [ ] 6. Update the site title source of truth (config field and/or templated `<title>` value) to "Alpha Centuri" — files: site config file and/or shared layout `<head>` template identified in Task 1 — test: rendering the home page and at least two other pages shows `<title>Alpha Centuri</title>` (or equivalent generated value) in the rendered HTML output; a repo-wide grep for the old site name in title-generating sources returns no matches.
- [ ] 7. Update visible header/nav branding text and footer text (including copyright line if it contains the site name) to "Alpha Centuri" — files: header/nav partial, footer partial — test: rendered HTML/DOM of the home page and at least one other page shows "Alpha Centuri" in the header/nav element and in the footer text; a repo-wide grep for the old site name in these partials returns no matches.
- [ ] 8. Insert the exact new paragraph into the home page content source, in a visible location near existing intro/hero/about content (or as a new top section if no such block exists), following existing home page markup/styling conventions — files: home page content source file — test: rendered home page HTML contains the exact string "Our board advisory services ensure that your board is composed of the most qualified and diverse members, driving better decision-making and governance and support in building your businesses roadmap for growth." as visible text within its own paragraph/section element; a layout smoke check confirms no overlapping/overflow elements introduced immediately around the insertion point.
- [ ] 9. Confirm no unintended changes to non-home-page content and no layout/navigation structural changes — files: all page templates/content files touched in Tasks 6–7 — test: diff review shows only title/branding string changes on non-home pages (no content, layout, or nav-structure edits); automated check (e.g. DOM structure diff or nav link count/order comparison) confirms navigation structure is unchanged on all pages.
- [ ] 10. Full site build/render verification — files: none (verification only), or build config if a build step exists — test: running the site's existing build/serve command completes with no errors/warnings, and a crawl of all site pages confirms each has: dark blue background, orange buttons/links, "Alpha Centuri" title/branding, and the home page paragraph present exactly once.

## 5. Test plan

- Run the full inventory produced in Task 1 against the final codebase to confirm every listed occurrence of the old title and old theme colors has been updated — a final grep for the old site name across the whole repo (excluding this plan/spec and audit doc) should return zero matches in rendered/output files.
- Build or serve the site locally and crawl every page reachable from the main navigation, asserting for each page: `<title>` equals "Alpha Centuri", header/footer branding text equals "Alpha Centuri", primary background computed style is the chosen dark blue, and any buttons/links present render orange.
- Load the home page specifically and assert the exact new paragraph text is present, visible (not hidden via CSS), and does not break the layout (no overflow/clipping of adjacent elements, verified via a basic viewport/scroll check or visual snapshot).
- Compare a snapshot/diff of every non-home page's content and navigation structure against a pre-change baseline to confirm only title/branding strings changed, nothing else.
- Confirm the site's build/deploy step (if any) completes without new errors or warnings introduced by the CSS/config/content changes.

## 6. Out of scope (carried from spec)

- Redesigning the site's layout, structure, navigation, or information architecture — only color/theme changes are made.
- Changing fonts, imagery, logos, icons, or adding new graphical assets (unless strictly required for legibility of new colors).
- Changing content on any page other than the home page beyond what the title update requires.
- Renaming the GitHub repository, package name, domain name, or any internal/code-level identifiers.
- Rewriting or restructuring the rest of the home page copy beyond inserting the new paragraph.
- Full WCAG accessibility/contrast compliance audit — only a basic legibility sanity check is included.
- Adding a theme toggle, light/dark mode switch, or configurable color scheme.
- SEO metadata changes beyond the `<title>` tag, unless they directly break due to containing the old site name.
- Any backend/server-side logic changes — this is a front-end styling and content change only.