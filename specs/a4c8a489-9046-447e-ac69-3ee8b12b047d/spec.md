   # Spec: Replace background watermark image with Wroclaw1.jpg

Status: draft
Job: a4c8a489-9046-447e-ac69-3ee8b12b047d
Target repo: SimonR67/sidney
Supersedes (partially): The existing background watermark implementation that currently references Wroclaw.jpg (CSS/HTML wherever the background image is declared, e.g. stylesheet(s) or shared layout template)

## 1. What should change and why

The website currently displays a faint, low-opacity background watermark image (Wroclaw.jpg) behind every page. The request is to swap this image for Wroclaw1.jpg, which is already present in the repository, without changing anything else about how the watermark behaves or how the page looks otherwise.

Interpretation chosen: This is purely an asset swap plus responsiveness/appearance verification for the new image. No new feature, no new styling system, no change to opacity level, layout, spacing, or page structure. The only reason additional care is needed (beyond a one-line file reference change) is that Wroclaw1.jpg may have different dimensions, aspect ratio, or visual content/framing than Wroclaw.jpg, so the CSS controlling how the background image is sized/positioned/repeated may need minor adjustment (e.g. background-size, background-position) to ensure it still renders well and stays proportioned on both desktop and mobile — but this adjustment is scoped strictly to making the new image display correctly, not to redesigning the watermark treatment.

The problem this solves: keeps the site's existing subtle branding/decorative background consistent with an updated image asset, per user preference, while explicitly guarding against regressions in legibility, layout, or responsiveness.

## 2. Scope

- Replace all references to Wroclaw.jpg used as the page background watermark with Wroclaw1.jpg, across every page/template that currently uses it.
- Preserve the exact current opacity/faintness level of the watermark (no visual change in how subtle/transparent it appears).
- Preserve all existing CSS rules for layout, spacing, structure, fonts, colors of content, and any other unrelated styling — the diff should be limited to the image reference and, if strictly necessary, background sizing/positioning properties (e.g. background-size, background-position, background-repeat) required to make Wroclaw1.jpg display without stretching or awkward cropping.
- Verify and, if needed, adjust responsive behavior so the new background image looks proportioned correctly on both desktop/computer screen widths and mobile/narrow screen widths (e.g. via existing responsive breakpoints or media queries already used by the site).
- Confirm text and other content remain fully readable/legible against the new background image at the same contrast level as before.
- Remove or leave in place the old Wroclaw.jpg file as appropriate (leaving it in the repo unused is acceptable; deleting it is optional cleanup, not required).

## 3. Out of scope

- Any redesign of the watermark concept itself (e.g. adding new effects, changing from a background-image approach to something else, adding animations, parallax, etc.).
- Any change to the opacity/faintness level — it must remain visually as subtle as it currently is, not more or less prominent.
- Any change to page layout, spacing, margins, grid structure, navigation, or any non-background styling.
- Any change to other images, logos, or content assets on the site.
- Any change to how the site handles themes, dark mode, or per-page background variation, unless such variation already exists today (in which case it is preserved as-is, just pointing at the new image).
- Cropping, editing, or re-exporting the Wroclaw1.jpg image file itself (assumed to already be suitable and already present in the repo as delivered).
- Broader responsive design overhaul of the site beyond what's needed to make this one background image render well.

## 4. Edge cases and error behavior

- If Wroclaw1.jpg is missing or fails to load at build/runtime: the page should degrade gracefully the same way it currently would if Wroclaw.jpg were missing (e.g. plain background color, no broken-image icon affecting layout) — no new error-handling behavior needs to be invented beyond whatever the current fallback behavior is.
- If Wroclaw1.jpg has a very different aspect ratio or resolution than Wroclaw.jpg: background-size/position rules should be adjusted minimally so the image is not stretched, distorted, or awkwardly cropped on common desktop and mobile viewport sizes.
- If there are multiple places in the codebase referencing Wroclaw.jpg (e.g. multiple stylesheets, inline styles, per-page overrides): all of them must be found and updated consistently, not just the most obvious one.
- If the new image, at the same opacity as before, happens to reduce text contrast on some page due to differences in the image's tonal content: opacity or background positioning should be tuned (within the "keep it faint" constraint) as the minimum fix needed to restore adequate legibility — this is a narrow, content-legibility-only adjustment, not a general redesign.

## 5. Acceptance criteria

- [ ] Every page that previously displayed Wroclaw.jpg as a background watermark now displays Wroclaw1.jpg instead.
- [ ] The watermark's opacity/transparency level is visually the same as before the change (no perceptible increase or decrease in faintness).
- [ ] No layout, spacing, structural, or unrelated styling changes are present in the diff — changes are limited to the background image reference and, if needed, background-size/position/repeat properties.
- [ ] On common desktop viewport widths, the background image displays without stretching, tiling artifacts, or distortion.
- [ ] On common mobile viewport widths, the background image displays without stretching, distortion, or awkward/cut-off cropping that changes its recognizable appearance.
- [ ] Text and other page content remain fully legible against the new background on all pages and viewport sizes tested, with contrast at least as good as it was with Wroclaw.jpg.
- [ ] No console errors or broken image requests related to the background watermark.
- [ ] Wroclaw1.jpg is confirmed present in the repo and correctly referenced by path in all relevant stylesheets/templates.

## 6. Open questions

- Is Wroclaw1.jpg's aspect ratio/resolution significantly different from Wroclaw.jpg's, such that background-size or background-position values will need to change? (Cannot confirm without inspecting the actual image files.)
- Are there multiple stylesheets or templates across the site that independently reference Wroclaw.jpg (e.g. per-section overrides), or is there a single shared source of truth for the background watermark?
- Should the old Wroclaw.jpg file be deleted from the repo as part of this change, or left in place unused in case of rollback?
- Are there any existing dark-mode or alternate-theme variants of the background watermark that also need to be updated to Wroclaw1.jpg, or does the site not have such variants?