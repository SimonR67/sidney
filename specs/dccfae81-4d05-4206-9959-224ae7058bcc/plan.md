# Plan: Black, Gold, and Aqua Colour Theme

Status: draft
Job: dccfae81-4d05-4206-9959-224ae7058bcc
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/dccfae81-4d05-4206-9959-224ae7058bcc/spec.md

## 1. Definition of done

- Page background renders black on every page/template in the site.
- All h1–h6 elements (and any element functioning as the visible page title) render in gold text on every page/template.
- All non-heading body/paragraph text (p, li, span, div text, links unless separately clarified) renders in aqua on every page/template.
- All colour rules live in the site's shared/global CSS source (or theme variables if they exist) rather than one-off page overrides.
- No inline style or per-page `<style>` block still shows the old colour scheme.
- No layout, structure, markup, fonts, spacing, or non-colour visual properties changed.

## 2. File map

| File | Change |
|---|---|
| (discovery) repo root / assets / css directories | Locate all stylesheet(s), inline `<style>` blocks, and inline `style=` attributes used site-wide |
| main global stylesheet (e.g. `style.css` / `main.css` / `theme.css`, exact name confirmed during discovery) | Add/update `body` background-color to black; add/update heading (h1–h6) rule to gold; add/update base text rule to aqua |
| any existing theme/colour variable file (e.g. `:root` CSS custom properties, SCSS variables) if discovered | Update existing colour variables to black/gold/aqua instead of hard-coding, if a theme system already exists |
| any page templates or HTML files with inline `<style>` blocks or `style=` attributes overriding colour (list confirmed during discovery) | Update inline overrides to match the new theme so no page is left inconsistent |

## 3. User journey

A visitor loads any page of the site (home page, an inner content page, and any template variant such as a listing or detail page). They see a black page background immediately. Any page title/headline (h1–h6, or the element acting as the visible page title) is rendered in gold. All other visible text — paragraphs, list items, generic text — is rendered in aqua. Navigating to a different page or template shows the identical colour treatment; no page retains the old background/text colours, and no individual element (via inline style or leftover override) breaks the consistent look.

## 4. Tasks

- [ ] 1. Discover all CSS sources (external stylesheets, inline `<style>` blocks, inline `style=` attributes) used across the site and list every page/template that references them — files: repo-wide search (no code change) — test: a checklist/inventory exists confirming every page's styling source is accounted for; manually verified by loading each listed page and inspecting applied styles.
- [ ] 2. Set the body/page background colour to black in the shared/global stylesheet — files: main global stylesheet — test: computed `background-color` of `body` (or main page wrapper) is `#000000` (or equivalent) on a sample page, verified via a CSS/DOM assertion or visual snapshot.
- [ ] 3. Set text colour of h1–h6 (and any element acting as the visible page title) to gold in the shared/global stylesheet — files: main global stylesheet — test: computed `color` of each heading level on a sample page renders as `gold`/`#FFD700`.
- [ ] 4. Set text colour of non-heading body text (p, li, span, div text, generic containers) to aqua in the shared/global stylesheet — files: main global stylesheet — test: computed `color` of a sample paragraph/list item/span on a sample page renders as `aqua`/`#00FFFF`.
- [ ] 5. If an existing theme/variable system (CSS custom properties, SCSS variables, etc.) is found, update those variables instead of/in addition to raw values, ensuring downstream usages inherit the new colours — files: theme/variable file — test: variable values equal black/gold/aqua and a page using them renders the correct computed colours.
- [ ] 6. Identify and update any inline `style` attributes or per-page `<style>` blocks that override background/heading/body colours, so they match the new theme — files: affected page templates — test: for each previously identified override, computed style now matches black/gold/aqua as appropriate (no stale override remains).
- [ ] 7. Sweep all pages/templates identified in Task 1 and confirm none still show the old colour scheme (background, headings, body text) — files: any remaining stylesheet/template not covered by prior tasks — test: for every listed page, background is black, headings are gold, body text is aqua.

## 5. Test plan

After all tasks are complete, do a full site walkthrough: load every distinct page/template type identified in the discovery task and visually/programmatically confirm (a) black background, (b) gold h1–h6/page-title text, (c) aqua body/paragraph/list/span text, on each one. Confirm no layout shift, structural change, font change, or spacing change occurred (diff against pre-change DOM/layout snapshot if available). Confirm no residual inline style or per-page override still renders the old colour scheme. Spot-check any element that is technically a heading tag but used non-title purposes to confirm it now renders gold per the accepted literal interpretation, and flag (not fix) any case that looks clearly broken for reviewer sign-off.

## 6. Out of scope (carried from spec)

- Any change to page layout, structure, HTML markup, fonts, font sizes, spacing, or component structure.
- Styling of non-text elements (buttons, borders, icons, images, form fields, tables, nav bars) except where directly governed by the background/text-colour rules above.
- Link colour/hover/visited state treatment — not explicitly defined by the spec, left as an open question.
- Any dark-mode/light-mode toggle or multi-theme switching functionality.
- Accessibility/contrast auditing beyond the stated requirement.
- Any content or copy changes, or page restructuring.
- Any changes to non-CSS assets (images, logos, favicons), even if they now clash visually.
- Print stylesheets or email templates, unless already part of the same shared CSS file in scope.