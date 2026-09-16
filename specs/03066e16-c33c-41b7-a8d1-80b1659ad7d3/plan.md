# Plan: Swap background watermark image from Wroclaw.jpg to Wroclaw1.jpg

Status: draft
Job: 03066e16-c33c-41b7-a8d1-80b1659ad7d3
Spec: https://github.com/SimonR67/sidney/blob/main/specs/03066e16-c33c-41b7-a8d1-80b1659ad7d3/spec.md

## 1. Definition of done

- Every reference to `Wroclaw.jpg` used as the site-wide background watermark is updated to `Wroclaw1.jpg`, with no instances missed across CSS files, templates, or inline styles.
- The watermark's opacity/faintness mechanism (opacity value, overlay/tint, blend mode, z-index/layering) is byte-for-byte unchanged except where the image filename itself changes.
- Only background-image sizing/positioning properties (`background-size`, `background-position`, `background-repeat`) are added/adjusted, and only if strictly necessary to avoid stretching/cropping given `Wroclaw1.jpg`'s dimensions.
- No unrelated CSS, layout, spacing, typography, or markup changes are introduced.
- Watermark renders without stretching/distortion at common desktop widths and without stretching/cropping/tiling artifacts at common mobile widths.
- Page content remains fully legible/contrast-compliant on all pages where the watermark appears.
- `Wroclaw.jpg` file remains in the repo (not deleted) unless a follow-up decision explicitly confirms removal.
- `Wroclaw1.jpg` is confirmed present at the correct path/name before any reference swap ships (no broken image risk).

## 2. File map

| File | Change |
|---|---|
| (CSS file(s) containing `Wroclaw.jpg` reference, e.g. `styles/main.css` or equivalent — to be confirmed by repo search) | Replace `url(...Wroclaw.jpg)` with `url(...Wroclaw1.jpg)`; adjust `background-size`/`background-position`/`background-repeat` only if needed for the new image's aspect ratio |
| (Template/partial file(s), e.g. layout template, if watermark is set via inline style or `<img>` tag rather than CSS) | Replace `Wroclaw.jpg` filename/path with `Wroclaw1.jpg`, preserving tag type (CSS background vs `<img>`) exactly as currently implemented |
| (Any mobile-specific CSS/media query block referencing `Wroclaw.jpg`, if one exists separately from desktop rule) | Replace filename reference consistently with desktop rule; do not introduce a new media query if one doesn't already exist |
| assets/images/Wroclaw1.jpg (or wherever the asset lives) | No change — confirm existence and correct path/casing only |

## 3. User journey

A visitor loads any page of the site on desktop or mobile. Previously, they would see a faint `Wroclaw.jpg` image behind the page content, subtle enough not to interfere with reading text or using the UI. After this change, the visitor loads the same page and instead sees `Wroclaw1.jpg` rendered at the same faintness/opacity, in the same position/layering, sized to avoid stretching or awkward cropping on their viewport. No other part of the page — layout, spacing, text, navigation — looks or behaves differently. The visitor should not consciously notice a change in "feel," only (if they compare closely) that the background image content is different.

## 4. Tasks

- [ ] 1. Search the codebase for every reference to `Wroclaw.jpg` (CSS, inline styles, templates, config) and document each location and the exact mechanism used (CSS `background-image` vs `<img>` tag, opacity/overlay technique, any media queries) — files: none changed yet, produces a findings note — test: a checklist/grep output listing all matches exists and each has been manually confirmed as watermark-related (not incidentally named similarly)
- [ ] 2. Confirm `Wroclaw1.jpg` exists in the repo at an accessible path with correct filename casing, and record its dimensions/aspect ratio — files: none (verification only) — test: asset resolves via direct path check (e.g. build/dev server serves it with 200 status, no 404/broken image)
- [ ] 3. Replace the primary CSS/template reference(s) to `Wroclaw.jpg` with `Wroclaw1.jpg` in the main watermark rule, without touching any other property — files: identified CSS/template file(s) from Task 1 — test: rendering a page locally shows the new image as the background watermark with the previous opacity/faintness value still present in the computed CSS (e.g. `opacity` or overlay rule unchanged in diff)
- [ ] 4. Replace any remaining/duplicate references to `Wroclaw.jpg` found in Task 1 (e.g. mobile-specific rule, secondary template, alternate stylesheet) so no instance is missed — files: remaining CSS/template file(s) from Task 1 — test: repo-wide search for `Wroclaw.jpg` returns zero matches in watermark-related contexts (only remains, if at all, as the unused source file itself, not referenced anywhere)
- [ ] 5. Adjust `background-size`/`background-position`/`background-repeat` on the watermark rule(s) only if `Wroclaw1.jpg`'s aspect ratio causes stretching or bad cropping compared to `Wroclaw.jpg` — files: same CSS file(s) as Task 3/4 — test: visual check at a representative desktop width (e.g. 1440px) and mobile width (e.g. 375px) shows the image filling/positioned appropriately with no visible stretching, distortion, or tiling
- [ ] 6. Diff the full changeset against the pre-change state to confirm no unrelated CSS/layout/markup lines were touched — files: all files changed in Tasks 3–5 — test: manual diff review shows only filename references and (if applicable) the specific sizing/positioning properties from Task 5 were modified; no other selectors/rules changed

## 5. Test plan

- Manual visual regression pass: load every page/template that previously showed the `Wroclaw.jpg` watermark, at both a common desktop width (e.g. 1440px/1920px) and a common mobile width (e.g. 375px/414px), and confirm `Wroclaw1.jpg` displays proportionately, unstretched, and without tiling or awkward cropping.
- Side-by-side faintness comparison: take a screenshot of a representative page before the swap (or use the recorded opacity/overlay CSS value) and after, confirming the watermark reads as equally subtle and does not draw visual attention or reduce text contrast/legibility.
- Full-site grep confirms zero remaining references to `Wroclaw.jpg` in any CSS, template, inline style, or config file used for the watermark (aside from the untouched, unreferenced source asset file itself, which stays in the repo per spec).
- Cross-check that `Wroclaw.jpg` file itself was not deleted or renamed (out of scope) and remains in the repo unchanged.
- Confirm via diff that the total set of changed lines is limited to filename swaps plus, at most, the sizing/positioning properties explicitly justified in Task 5 — no incidental layout/spacing/structure edits.

## 6. Out of scope (carried from spec)

- Changing the opacity, transparency, or faintness level of the watermark.
- Any redesign of page layout, spacing, margins, structure, or component styling unrelated to the background image itself.
- Adding new responsive breakpoints, new CSS frameworks, or new background techniques (parallax, animation, etc.) not already present.
- Cropping, resizing, compressing, or otherwise editing the `Wroclaw1.jpg` image file's pixel content — only CSS presentation properties may be adjusted.
- Applying the swap to only some pages while leaving others on the old image.
- Removing or renaming `Wroclaw.jpg` from the repo unless separately confirmed safe.
- Any accessibility, SEO, or performance optimization work beyond preserving current behavior (no new lazy-loading, alt-text changes, or image compression pipeline).