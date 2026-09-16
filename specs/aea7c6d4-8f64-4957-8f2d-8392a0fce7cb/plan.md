# Plan: Site-wide faint background watermark (Wroclaw.jpg)

Status: draft
Job: aea7c6d4-8f64-4957-8f2d-8392a0fce7cb
Spec: https://github.com/SimonR67/sidney/blob/main/specs/aea7c6d4-8f64-4957-8f2d-8392a0fce7cb/spec.md

## 1. Definition of done

- `Wroclaw.jpg` (unmodified, at its existing repo path) renders as a faint background watermark on every page of the site.
- Watermark opacity/visual faintness is in the ~5-10% range, achieved via `opacity` on a dedicated background element/pseudo-element (not by altering the image file).
- Watermark sits behind all content in stacking order on every page (no `z-index` conflicts, nothing obscured).
- No layout shift, no new horizontal scrollbars, no distortion/cropping artifacts on desktop and mobile viewport widths.
- No changes to existing layout, spacing, typography, colors, or content elsewhere on the site.
- `background-attachment: fixed` used on desktop where supported, with a `scroll` fallback on mobile via media query.
- If the image fails to load, the rest of the page renders normally with no visible errors or broken-image artifacts.
- No JS, new dependencies, or build steps introduced.
- Print styles (if any exist) remain untouched — watermark not applied to print output.

## 2. File map

| File | Change |
|---|---|
| (shared layout/base template — to be identified during Task 1, e.g. `layout.html` / `_layout.ejs` / `base.html` / equivalent) | Add a watermark container element (e.g. `<div class="watermark-bg" aria-hidden="true"></div>`) immediately inside the body, before main content, if a pseudo-element approach on `body` is not viable due to existing body background styles. |
| (existing global/shared stylesheet, e.g. `styles.css` / `main.css` / equivalent — path confirmed during Task 1) | Add `.watermark-bg` (or `body::before`) rule: background-image referencing `Wroclaw.jpg` at its existing path, low opacity, `background-size: cover`, `background-position: center`, `background-attachment: fixed` on desktop, `scroll` on mobile via media query, `z-index: -1` / lowest stacking context, `position: fixed`, full viewport coverage, `pointer-events: none`. |
| existing `Wroclaw.jpg` (no change) | Referenced only, path unchanged, not duplicated/edited. |

## 3. User journey

A visitor loads any page of the site (home page, an inner content page, a page with a dark background, and a page on mobile). In every case they see the normal page content and layout exactly as before, with a very faint, barely-noticeable image of Wroclaw visible behind the content when they look closely — it doesn't shift any text, doesn't sit on top of buttons/links, doesn't create a scrollbar, and doesn't change contrast or readability. Navigating between pages, the watermark is consistently present without needing to be re-triggered by JS. If someone temporarily breaks the image path, the site keeps working exactly as before, just without the watermark, with no errors visible to the user.

## 4. Tasks

- [ ] 1. Identify the site's shared layout/base template(s) and existing global stylesheet(s) actually included on every page (confirm answer to spec's open question #1/#2) — files: repo template/layout files, stylesheet files (read-only investigation) — test: manually trace at least 2-3 distinct pages and confirm they all resolve to the same shared template or the same linked global stylesheet; document the confirmed target file(s) in a short note/commit description.
- [ ] 2. Confirm exact existing path of `Wroclaw.jpg` in the repo and that it is reachable via a relative/root-relative URL from the chosen stylesheet/template location — files: none changed, verification only — test: a simple `<img>` or CSS test rule referencing the resolved path renders the image correctly in a local preview, then is removed/replaced by the real implementation.
- [ ] 3. Add the watermark background rule (dedicated layer/pseudo-element, `position: fixed`, full-viewport, `z-index` below all content, `opacity` ~5-10%, `background-size: cover`, `background-position: center`, `pointer-events: none`) to the identified shared stylesheet/template — files: shared stylesheet, shared layout template (if a markup hook is needed) — test: load two different pages locally/in a diff-preview and visually confirm the watermark appears identically on both, sits behind content, and does not intercept clicks (test click-through on an element positioned over the watermark area).
- [ ] 4. Add `background-attachment: fixed` for desktop and a `scroll` fallback for mobile via a max-width media query — files: shared stylesheet — test: resize/inspect at a common desktop width (e.g. 1440px) and a common mobile width (e.g. 375px) and confirm `background-attachment` computed value switches from `fixed` to `scroll` at the breakpoint, with no visual jank on scroll in either mode.
- [ ] 5. Verify no layout regression, no horizontal scrollbar, and no image distortion across desktop and mobile widths — files: none (verification-only, may touch stylesheet if a fix is needed, e.g. `overflow-x: hidden` guard confirmation) — test: visually compare a page before/after the change at desktop and mobile widths (screenshot or manual diff) confirming identical layout aside from the added watermark, and confirm `document.documentElement.scrollWidth` does not exceed viewport width at either size.
- [ ] 6. Verify graceful failure when the image path is broken — files: none (temporary local test only, not committed) — test: temporarily point the background-image URL at a nonexistent path in a local/dev build, reload the page, and confirm the page renders normally with no visible broken-image icon and no console errors that affect functionality; then revert to the correct path.
- [ ] 7. Verify watermark faintness and non-interference with readability on at least one light-background page and one dark/varied-background page (per spec edge case) — files: none, or a small stylesheet opacity adjustment if a page fails this check — test: visually inspect contrast of body text against the watermark on both page types and confirm no readability regression; adjust opacity within the 5-10% range if needed and re-check.
- [ ] 8. Confirm print stylesheet (if one exists) is unaffected — files: existing print stylesheet, if any (read-only check) — test: if a print stylesheet/media query exists, confirm the watermark rule is scoped out of it (e.g. via `@media screen` wrapping or explicit `@media print { .watermark-bg { display: none } }`); if no print stylesheet exists, note this and skip.

## 5. Test plan

- Cross-page consistency check: load a representative sample of all distinct page types in the site (home, at least one inner/content page, any page with a non-default background) and confirm the watermark is present, faint, and identically positioned/behaved on each.
- Responsive check: test at one common desktop resolution (e.g. 1440x900) and one common mobile viewport (e.g. 375x667) confirming no distortion, no cropping artifacts, no horizontal scrollbar, and correct `background-attachment` behavior at each.
- Stacking/interaction check: confirm no interactive element (links, buttons, forms) is visually or functionally obstructed by the watermark on any tested page — click-through and visual inspection.
- Regression check: diff each tested page's layout/spacing/colors before and after the change (screenshot comparison or manual review) to confirm the only visible difference is the added watermark.
- Failure-mode check: confirm broken image path degrades silently with no console errors affecting functionality and no broken-image icon.
- No-JS/no-new-deps check: confirm the diff introduces only CSS (and, if necessary, a minimal markup hook for a pseudo-element/div) with zero new JS files, script tags, or package dependencies.
- Print check: if a print stylesheet exists, confirm printed output has no watermark; if none exists, confirm nothing was added.

## 6. Out of scope (carried from spec)

- Replacing, cropping, resizing, compressing, or otherwise editing `Wroclaw.jpg` itself.
- Using a different image, adding new image assets, or making the watermark user/page configurable.
- Any changes to existing layout, spacing, colors, typography, component structure, navigation, or content on any page.
- Adding a settings/toggle (no admin UI, no per-page override) to turn the watermark on or off.
- Making the watermark interactive, clickable, or animated.
- Any JavaScript-based image loading, lazy-loading, or dynamic watermark positioning.
- SEO, accessibility labeling, or alt-text considerations for the watermark.
- Print stylesheet handling beyond leaving any existing one untouched — no watermark added to print output.
- Performance optimization of the image file itself (e.g. WebP conversion) — only its usage as a CSS background is in scope.