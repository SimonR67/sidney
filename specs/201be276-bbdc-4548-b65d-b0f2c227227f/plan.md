# Plan: Rebrand site to "Beta Centuri" with dark grey / orange theme

Status: draft
Job: 201be276-bbdc-4548-b65d-b0f2c227227f
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/201be276-bbdc-4548-b65d-b0f2c227227f/spec.md

## 1. Definition of done

- Site-wide stylesheet(s)/theme config use dark grey for backgrounds, panels, cards, and nav/base surfaces (with at least two distinct shades for layering).
- Buttons (primary and secondary) use orange as their base background/border color, with a visibly distinct hover/active state derived from that orange.
- Links, active nav items, badges/tags, and focus states use orange consistently.
- Base body text remains legible (light grey/white) against the new dark grey backgrounds.
- Every page's `<title>` reads "Beta Centuri" (preserving any existing page-specific suffix pattern).
- Header/navbar logo text visible to users reads "Beta Centuri".
- All `<meta>` tags referencing the old site name (description, og:title, og:site_name, twitter:title, etc.) now say "Beta Centuri".
- Footer and any other visible occurrence of the old name read "Beta Centuri".
- A repo-wide search for the old site name string returns no remaining user-visible occurrences (internal-only identifiers excluded).
- No layout/structural regressions on spot-checked main pages.
- Any old-name-as-image-asset findings are flagged rather than silently edited.

## 2. File map

| File | Change |
|---|---|
| (discovery) grep results for current site name | Identify every file/location referencing the old site name — informs tasks 2–6 below |
| (discovery) global/shared stylesheet or theme config (e.g. `src/styles/*.css`, `tailwind.config.*`, `_variables.scss`, or equivalent) | Identify whether a centralized color-variable mechanism exists; informs tasks 7–10 |
| shared layout/base template (e.g. `app/layout.*`, `views/layout.html`, `templates/base.html`) | Update `<title>` pattern, header/logo text, footer text |
| head/meta partial (e.g. `partials/head.html`, `components/Head.tsx`) | Update `<meta>` description, og:title, og:site_name, twitter:title/description |
| site name constant/config (e.g. `config/site.ts`, `constants.js`, `SITE_NAME` setting) | Update single source of truth for site name, if one exists |
| navbar/header component (e.g. `components/Header.*`, `views/partials/header.*`) | Update visible logo/site name text |
| footer component (e.g. `components/Footer.*`, `views/partials/footer.*`) | Update visible site name text |
| main/global stylesheet(s) (e.g. `styles/main.css`, `styles/theme.css`, framework theme config) | Update background, panel/card, nav bar colors to dark grey palette |
| button styles (e.g. `components/Button.*`, `.btn` classes in CSS) | Update to orange base/border with hover/active states |
| link/accent styles (nav active state, `a` tag styles, badge/tag components, focus-visible styles) | Update to orange |
| email templates referencing site name (if any, e.g. `templates/email/*.html`) | Update site name text |
| package/app display-name string (e.g. `package.json` "name" field only if user-displayed, `app.json`) | Update only if used to render a user-visible name |

## 3. User journey

A visitor loads the site's homepage: the browser tab shows "Beta Centuri" as the title, and the page renders on a dark grey background with a header/nav bar in a slightly different (layered) dark grey shade. The header logo text reads "Beta Centuri". Navigation links and the active nav item are shown in orange; primary buttons (e.g. "Sign up", "Submit") are orange with a clearly different orange shade on hover. The visitor clicks through to a few other pages (e.g. a form page, a listing page) and sees the same dark grey/orange theme and "Beta Centuri" branding consistently, including in the footer. If the visitor shares a link on social media, the link preview (via Open Graph tags) shows "Beta Centuri" as the site name rather than the old name. No page layout, navigation structure, or functionality has changed — only colors and the name.

## 4. Tasks

- [ ] 1. Grep the repo for the current/old site name string across code, templates, config, and email templates to produce a definitive occurrence list — files: none (read-only discovery) — test: a documented list of every match, categorized as user-visible/meta vs. internal-only, is produced and used to scope tasks 2–6.
- [ ] 2. Inspect the codebase for an existing centralized theme/color mechanism (CSS custom properties, Tailwind/theme config, SCSS variables) — files: none (read-only discovery) — test: confirm whether such a mechanism exists and note it in the plan/PR description; determines whether tasks 7–10 touch one file or many.
- [ ] 3. Update the site name source of truth (constant/config, e.g. `SITE_NAME`) to "Beta Centuri" if such a mechanism exists, otherwise identify the single template responsible for `<title>` — files: config/constants file or base layout template — test: rendering any page shows `<title>Beta Centuri...</title>` (with existing suffix pattern preserved if present).
- [ ] 4. Update header/navbar logo/site-name text component — files: header component/partial — test: rendered header HTML contains "Beta Centuri" and no longer contains the old name.
- [ ] 5. Update `<meta>` tags (description, og:title, og:site_name, twitter:title) across the shared head partial — files: head partial/component — test: rendered `<head>` HTML for the homepage and one other page shows "Beta Centuri" in all relevant meta tags.
- [ ] 6. Update footer text and any remaining visible occurrences (e.g. email templates) found in task 1 — files: footer component, email templates — test: rendered footer HTML and any email template render show "Beta Centuri"; a follow-up grep confirms no remaining user-visible old-name matches (internal identifiers excluded).
- [ ] 7. Define the dark grey background palette (page/base background + at least one lighter shade for panels/nav) in the appropriate theme location from task 2 — files: theme/variables file or main stylesheet — test: page background computed color and nav/panel background computed color differ and both fall in the intended dark grey range (visual/CSS snapshot check).
- [ ] 8. Apply the orange palette to buttons (primary/secondary) including hover/active states — files: button component/CSS — test: a rendered button's default background/border color is orange, and its hover/active state computed style differs visibly from the default state.
- [ ] 9. Apply orange to links, active nav item, badges/tags, and focus-visible states — files: global stylesheet, nav component styles — test: rendered link and active-nav-item computed color is orange; focus-visible outline/style on an interactive element is orange.
- [ ] 10. Verify base body text color/contrast against the new dark grey background — files: global stylesheet (typography rules) — test: computed body text color is light grey/white and a basic contrast check (e.g. manual or automated ratio check) confirms it's readable against the dark grey background.
- [ ] 11. Flag any old-site-name-as-image-asset findings (e.g. logo graphic) discovered during tasks 1–6 instead of editing them — files: none (documentation only, e.g. PR/plan notes) — test: a note is added listing any such asset, explicitly marked as out of scope/needs follow-up.

## 5. Test plan

- Run the repo-wide search for the old site name after all tasks are complete and confirm zero remaining user-visible/meta matches (internal identifiers excluded per spec Section 3).
- Manually spot-check the homepage and at least 2–3 other representative pages (e.g. a form page, a listing/detail page, an admin page if in scope) to confirm: dark grey background/panels, orange buttons/links/accents, "Beta Centuri" title/header/footer/meta tags on each.
- Verify no layout/structural regressions by comparing page structure (element presence/order) before and after the change on the same spot-checked pages — only colors/text should differ.
- Check that hover/active states on buttons and focus-visible states on interactive elements are visually distinct from their default state.
- Confirm the browser tab title reads correctly on each spot-checked page, including any page-specific suffix pattern.
- If a centralized theme mechanism was found in task 2, confirm the color values are defined in one place and consumed everywhere rather than duplicated ad hoc.

## 6. Out of scope (carried from spec)

- Any layout, structural, or navigation changes (page structure, component arrangement, adding/removing sections).
- Introducing a theme system (light/dark mode toggle, user-selectable themes) — this is a single fixed theme replacement.
- Changing fonts, iconography, imagery, or logo artwork (unless the logo is literally text-rendered old site name, in which case only the text updates, not styling).
- Renaming the GitHub repository, package name, database name, or other internal/non-user-facing identifiers.
- Changing the domain name, favicon, or app icon (unless they contain the old name as visible text — flagged, not resolved, per task 11).
- A full WCAG contrast audit (only a basic legibility sanity check is in scope).
- Updating external references to the old site name outside this repo (third-party listings, social bios).
- Any content/copy changes beyond the literal site name/title (taglines, marketing copy, feature descriptions untouched unless they contain the old name).