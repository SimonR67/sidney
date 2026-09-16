   # Spec: Swap background watermark image from Wroclaw.jpg to Wroclaw1.jpg

Status: draft
Job: 03066e16-c33c-41b7-a8d1-80b1659ad7d3
Target repo: SimonR67/sidney
Supersedes (partially): The existing CSS/template rule(s) that reference `Wroclaw.jpg` as the site-wide faint background watermark

## 1. What should change and why

The website currently displays a faint, subtle background watermark image (`Wroclaw.jpg`) behind the content on every page. The request is to replace this image with a different image, `Wroclaw1.jpg`, which is already present in the repository.

This is purely an asset swap plus any minimal, necessary adjustment to background-image CSS properties (e.g. `background-size`, `background-position`, `background-repeat`) so the new image displays proportionately and without cropping/stretching issues on both desktop and mobile. No other visual or structural change is intended.

Interpretation chosen: since the request explicitly says "do not alter any existing page styles, layout, spacing, or structure," the only styling changes permitted are those strictly necessary to make the new image render well (sizing/positioning/responsiveness of the background image itself), not to change opacity, layering, page structure, or any other visual treatment. The current opacity/faintness level must be preserved exactly as-is — if the existing implementation achieves faintness via a CSS `opacity` value, an overlay/tint, or the image's own low-contrast content, that same mechanism should be reused unchanged.

## 2. Scope

- Locate every place in the codebase where `Wroclaw.jpg` is referenced as the background/watermark image (CSS files, inline styles, templates, or config).
- Replace those references with `Wroclaw1.jpg`.
- Preserve the exact current opacity/faintness value(s), blend mode, z-index/layering, and any overlay technique currently used to make the watermark subtle.
- Preserve all existing layout, spacing, typography, and page structure — no unrelated CSS rules should be touched.
- Adjust only background-image sizing/positioning properties (e.g., `background-size: cover`, `background-position: center`, `background-repeat: no-repeat`) as needed so `Wroclaw1.jpg` is not stretched, distorted, or awkwardly cropped.
- Verify the new background renders correctly and proportionately across common desktop widths and common mobile widths (responsive check), reusing any existing responsive/media-query patterns already in place for the watermark rather than introducing a new responsive system.
- Verify text and content readability/contrast is unaffected after the swap (i.e., the new image at the same opacity does not visually clash with content in a way `Wroclaw.jpg` did not).
- Leave `Wroclaw.jpg` file in the repo (removal not requested) unless it is clearly dead/unused after the swap — see Open Questions.

## 3. Out of scope

- Changing the opacity, transparency, or faintness level of the watermark (must remain visually as subtle as before).
- Any redesign of page layout, spacing, margins, structure, or component styling unrelated to the background image itself.
- Adding new responsive breakpoints, new CSS frameworks, or new background techniques (e.g., parallax, animation) not already present.
- Cropping, resizing, compressing, or otherwise editing the `Wroclaw1.jpg` image file's pixel content — only CSS presentation properties may be adjusted, not the image asset itself.
- Changing the watermark on only some pages while leaving others on the old image — the swap applies uniformly wherever the watermark currently appears.
- Removing or renaming `Wroclaw.jpg` from the repo unless confirmed safe to do so.
- Any accessibility, SEO, or performance optimization work beyond what's needed to preserve the current behavior (e.g., no new lazy-loading, no alt-text changes, no image compression pipeline).

## 4. Edge cases and error behavior

- If `Wroclaw1.jpg` has different dimensions or aspect ratio than `Wroclaw.jpg`, the sizing/positioning rules must be adjusted so it still displays without stretching or unwanted cropping — this is explicitly permitted as it's necessary for "renders well and looks proportioned correctly," per Scope.
- If the watermark is referenced in multiple places (e.g., separate mobile vs. desktop CSS, or multiple template files), all instances must be updated consistently; if only some are updated, that is a defect.
- If `Wroclaw1.jpg` is missing, misnamed, or has a broken path in the repo, the swap should not proceed until the asset path is confirmed correct — the page should not silently fall back to no background or a broken image icon.
- If the current implementation uses an `<img>` tag rather than a CSS `background-image` for the watermark, the same mechanism (tag vs. CSS) should be preserved, just pointing at the new file.
- If applying the new image at the existing opacity setting results in a visibly less faint or more visually intrusive watermark (e.g., due to different color/contrast in `Wroclaw1.jpg`), this should be flagged rather than silently shipped, since it would violate the "unobtrusive / readability" requirement even though the opacity CSS value itself is unchanged.

## 5. Acceptance criteria

- [ ] All references to `Wroclaw.jpg` used for the page background watermark are replaced with `Wroclaw1.jpg`.
- [ ] The watermark's opacity/faintness (measured by the same CSS opacity value or equivalent visual faintness) is unchanged from before the swap.
- [ ] No other CSS rules, layout, spacing, or page structure/markup are modified beyond what is strictly required for correct background image sizing/positioning.
- [ ] On desktop-width viewports, the background image displays without visible stretching or distortion.
- [ ] On mobile-width viewports, the background image displays without visible stretching, awkward cropping, or tiling artifacts, and remains recognizable/appropriately framed.
- [ ] Text and other page content remain fully legible with sufficient contrast against the new background on all pages where the watermark appears.
- [ ] The watermark remains visually subtle/unobtrusive and does not draw attention away from page content.
- [ ] No pages are missed — the swap is applied everywhere the old watermark previously appeared.

## 6. Open questions

- Should `Wroclaw.jpg` be deleted from the repo after the swap, or kept in case of rollback/future reuse? (Default assumption in this spec: keep it, since deletion wasn't requested.)
- Does the current watermark implementation use a single shared CSS rule/template partial (ideal, low risk) or is it duplicated per-page/per-stylesheet (higher risk of inconsistent replacement)? This should be confirmed during implementation but may affect effort/risk.
- Are there already distinct mobile vs. desktop background rules (e.g., media queries) for the current watermark, or is one rule used everywhere? This affects whether "responsive, no stretching" can be achieved with zero new CSS or requires adding a media query (which would be a minor deviation from "don't alter existing styles" and should be confirmed as acceptable).
- Is there a specific/canonical list of "faint/legible" reference screenshots or an existing opacity value the reviewer wants used as the ground truth for "same faintness," or is visual judgment sufficient?