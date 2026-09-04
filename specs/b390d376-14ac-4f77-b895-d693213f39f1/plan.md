# Plan: Update site color scheme from green to orange/blue palette

Status: draft
Job: b390d376-14ac-4f77-b895-d693213f39f1
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/b390d376-14ac-4f77-b895-d693213f39f1/spec.md

## 1. Definition of done

- A documented orange-and-blue palette (specific hex/RGB values, with named roles like primary-blue, primary-orange, accent shades/tints) exists in the repo.
- All CSS/SCSS/LESS/theme-config/inline-style green values (named colors, hex, rgb/rgba, hsl) in the repo's own source styling are replaced with palette values, preserving structural role (accent stays accent, background stays background, etc.).
- All theme variables whose names reference "green" (e.g., `$brand-green`, `--primary-color` if it held a green value) are renamed/repurposed and all usages updated — no dangling references to old names.
- If the repo has a build step, the site is rebuilt so generated/output files reflect the new palette; if there's a checked-in static output directory that isn't regenerated from source, that output is edited directly too.
- A written list of green instances intentionally left unchanged (semantic/status colors, third-party embeds, image/SVG fills not controlled by CSS) exists with justification, ready for reviewer sign-off.
- Spot-checking key pages shows only color differences — no layout, typography, spacing, content, or structural regressions.

## 2. File map

| File | Change |
|---|---|
| docs/palette-notes.md (new) | Document the chosen orange/blue palette (hex values, named roles) and the audit list of skipped green instances with justification |
| src/styles/_variables.scss (or equivalent theme variables file, exact path TBD after audit) | Rename green-referencing variables to orange/blue names; update hex/rgb/hsl values |
| src/styles/**/*.scss, *.css, *.less (all stylesheets found in audit) | Replace green color values with palette values, preserving structural role |
| templates/**/*.html, layouts/**/* (any files with inline `style="..."` attributes containing green) | Replace inline green color values with palette values |
| theme.config.json / _config.yml / equivalent theme config (if present) | Update any green-named theme keys/values |
| Built/output directory (e.g., `_site/`, `dist/`, `build/`) if checked into repo | Regenerate via build step, or hand-edit if no build pipeline exists |

## 3. User journey

A visitor loads the site as before — same pages, same navigation, same content and layout. The only difference they notice is visual: headers, links, buttons, borders, highlights, and backgrounds that used to appear green now appear in shades of orange or blue, applied consistently so the same visual hierarchy (e.g., "this is the primary accent," "this is a subtle background tint") is preserved. Nothing they can click or navigate has changed; no text or images have changed. A reviewer opens the built site side-by-side with the previous version and confirms the only diffs are color-related, then reviews the sign-off list of any green instances deliberately left untouched (e.g., a "success" status badge or a third-party widget).

## 4. Tasks

- [ ] 1. Audit the repo for all green color usages (named colors, hex, rgb/rgba, hsl) across CSS/SCSS/LESS files, theme config files, and inline styles in templates/HTML — produce a checklist/inventory file listing each occurrence, its file/line, and its structural role (accent, background, border, semantic/status, etc.) — files: docs/palette-notes.md (new, audit section) — test: inventory file exists and running a repo-wide grep for common green patterns (`green`, `#0?[0-9a-f]*80[0-9a-f]*`, `rgb(0,128,0)`-style, etc.) turns up no items missing from the inventory
- [ ] 2. Define and document the orange/blue palette (primary blue, primary orange, plus complementary shades/tints for accents/backgrounds/borders) with specific hex values, mapped role-by-role to the greens identified in task 1 — files: docs/palette-notes.md — test: palette document lists a hex value for every structural role identified in the audit, reviewable and complete before any code changes
- [ ] 3. Flag and document edge-case greens (semantic/status indicators, third-party embeds, non-CSS-controlled images/SVG fills) as intentionally left unchanged, with justification, in the same audit doc — files: docs/palette-notes.md — test: every green instance from task 1 is accounted for as either "to be replaced" or "flagged/skipped with reason" — no unaddressed items remain
- [ ] 4. Rename and update theme variables whose names reference "green" (e.g., `$brand-green`, `--brand-green`) to new orange/blue-named variables with new values, updating all references — files: theme variables file (e.g., `_variables.scss`), any file consuming those variables — test: repo-wide search for old variable names returns zero results; a diff shows all consuming rules now reference the new variable names and the site still compiles/lints without undefined-variable errors
- [ ] 5. Replace remaining hard-coded green values in stylesheets (CSS/SCSS/LESS) that aren't tied to a renamed variable, using the palette from task 2, preserving structural role — files: all stylesheet files identified in task 1 audit — test: repo-wide search for green named colors/hex/rgb/hsl patterns in stylesheet files returns zero matches outside the flagged/skipped list from task 3
- [ ] 6. Replace green values found in inline `style` attributes within templates/HTML — files: template/HTML files identified in task 1 audit — test: repo-wide search for green patterns in inline style attributes returns zero matches outside the flagged/skipped list
- [ ] 7. Update any theme/config files (JSON/YAML) with green-referencing keys or values — files: theme config file(s) identified in audit — test: config file(s) no longer contain green values/key names (aside from flagged exceptions); config validates/parses correctly and site theme loads without errors
- [ ] 8. Rebuild the static site (if a build step exists) so generated output reflects the new palette; if a checked-in output directory exists without a build step, hand-edit the corresponding built files to match source changes — files: build output directory (e.g., `_site/`, `dist/`, `build/`) — test: build command runs successfully and produces output; a diff of built CSS/HTML shows green values replaced with palette values, matching source changes
- [ ] 9. Visual spot-check of key pages (home, and any pages identified as using the green theme) comparing before/after renders — files: none (verification task, may produce screenshots in docs/) — test: side-by-side screenshot/manual review confirms only color differences (no layout, spacing, typography, or content shifts) and that text remains readable against new backgrounds

## 5. Test plan

After all tasks are complete, run a full repo-wide search (grep/regex) for green patterns (named colors, hex ranges typical of green, `rgb`/`hsl` green ranges) across all styling files, templates, and any built output, confirming the only remaining matches are those explicitly documented in the sign-off list from task 3. Rebuild the site end-to-end (if applicable) and do a manual visual walkthrough of every primary page/template to confirm headers, links, buttons, borders, highlights, and backgrounds now show the orange/blue palette consistently, with no layout or content regressions (a structural/DOM diff between before and after builds should show no changes outside `style`/`class` color attributes or CSS files). Finally, review the palette-notes.md sign-off list with the reviewer to confirm all flagged exceptions (semantic colors, third-party embeds, non-CSS assets) are acceptable as-is.

## 6. Out of scope (carried from spec)

- Any changes to site layout, typography, spacing, or component structure — this is a color-only change.
- Any changes to content, copy, images, or logos, even if a logo or image contains green (unless it is a simple CSS-colored SVG/icon trivially recolorable via existing style rules).
- Introducing a full theming/dark-mode system or making colors user-configurable — a single new fixed palette replaces the old one.
- Redesigning the visual identity beyond a color swap (no new fonts, icons, layout changes, or component redesigns).
- A full accessibility/WCAG contrast audit — only basic readability sanity-checking is required.
- Updating external assets (favicons, social preview images, README badges) unless they are generated directly from the site's CSS/theme.