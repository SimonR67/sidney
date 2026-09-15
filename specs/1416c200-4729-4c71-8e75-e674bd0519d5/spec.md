   # Spec: Restructure "WHERE WE'VE COME FROM" section with 50/50 text/image layout

Status: draft
Job: 1416c200-4729-4c71-8e75-e674bd0519d5
Target repo: SimonR67/sidney
Supersedes (partially): The current "WHERE WE'VE COME FROM" section layout (single-column/text-only structure)

## 1. What should change and why

The "WHERE WE'VE COME FROM" section currently presents its content as a text-only (or non-split) block. The request is to restructure this section into a 50/50 two-column layout: existing text content on the left, and a new image (Sofia.jpg, already present in the repo) on the right.

The image should be sized so it carries roughly the same visual weight as the text block (i.e., neither column dominates the other), with balanced spacing/padding between the two columns. The image should be styled with rounded corners and a papaya-colored border, explicitly matching the border treatment (corner radius, border color, border width/style) already used on the "C-Suite Advisory" box in the "WHAT WE OFFER" section — this existing style should be reused/referenced rather than reinvented.

Ambiguity resolved: The request doesn't specify exact pixel dimensions or aspect ratio for Sofia.jpg. Interpretation chosen: the image will be scaled responsively to fill its 50% column width (with a max-width constraint) and a height that keeps it visually balanced against the text block's natural height, rather than forcing an exact pixel match. "Papaya-colored border" is interpreted as reusing the same border color value already defined/used for the C-Suite Advisory box (not introducing a new color).

## 2. Scope

- Modify the markup/styles for the "WHERE WE'VE COME FROM" section only.
- Introduce a two-column layout: left column = existing text content (unchanged in wording), right column = Sofia.jpg image.
- On desktop/tablet widths, columns split roughly 50/50.
- Add appropriate horizontal and/or vertical spacing (gap/padding) between the text column and the image column so the layout feels intentional and not cramped.
- Style the image container/element with:
  - The same corner radius (border-radius) as used on the C-Suite Advisory box.
  - The same border color (papaya) as used on the C-Suite Advisory box.
  - The same border width/style as used on the C-Suite Advisory box.
- Ensure the image scales proportionally within its column (responsive sizing, e.g. `max-width: 100%`, `height: auto`, or object-fit as needed) so it doesn't overflow or distort.
- Make the layout responsive: on smaller screen widths (mobile breakpoint), the two columns stack vertically (text above or below image — text first is the default assumption unless existing site conventions differ), with the image resized to fit the mobile viewport width while keeping its rounded-border styling.
- Verify Sofia.jpg is correctly referenced/linked from its existing repo location; no new image asset needs to be added since it already exists in the repo.

## 3. Out of scope

- Changing the wording/content of the "WHERE WE'VE COME FROM" text itself.
- Changing the "WHAT WE OFFER" section or the C-Suite Advisory box styling — that section is only referenced as a style source, not modified.
- Adding new images beyond Sofia.jpg, or replacing Sofia.jpg with a cropped/edited/optimized version — no image editing (cropping, compression, recoloring) is included unless the raw file causes a technical problem (see edge cases).
- Redesigning other sections of the site for consistency (e.g., applying this same layout pattern elsewhere).
- Adding animations, hover effects, lightbox/zoom behavior, or captions on the image.
- Changing the overall page navigation, section ordering, or section headings.
- Accessibility improvements beyond a basic `alt` text on the image (e.g., no broader audit is included).

## 4. Edge cases and error behavior

- **Sofia.jpg fails to load / path is broken**: The image element should still degrade gracefully (broken image with alt text) rather than breaking the layout; the text column layout should not depend on the image loading successfully.
- **Sofia.jpg has an unusual aspect ratio** (very tall/wide) that makes "same visual weight as text" hard to achieve: apply reasonable max-height/max-width constraints and object-fit (e.g., `cover` or `contain`) to keep the rounded-border box visually consistent, without needing to re-export the source image.
- **Text block is much longer/shorter than expected at different viewport widths**: layout should not break or leave excessive empty whitespace in the image column — vertical centering or top-alignment of the image within its column is acceptable to keep things visually tidy.
- **Very small mobile screens**: the border and rounded corners must remain visible and not get clipped or overlap other content when columns stack.
- **C-Suite Advisory box style is not easily reusable as a shared class/token**: if the existing styling is hardcoded/inline rather than a reusable class, this spec still requires matching the same values (radius, color, width/style) manually rather than skipping the requirement — flag this in implementation if it creates duplication.

## 5. Acceptance criteria

- [ ] The "WHERE WE'VE COME FROM" section displays a two-column layout on standard desktop widths: text on the left, image on the right, roughly 50/50 width split.
- [ ] Sofia.jpg is rendered on the right side, correctly referenced from its repo path.
- [ ] The image is scaled such that its rendered size is visually comparable in "weight" to the text block (no significant size imbalance where one column looks tiny or overwhelming next to the other).
- [ ] There is clear, aesthetically consistent spacing (gap/padding) between the text column and the image column — no elements touching edge-to-edge.
- [ ] The image has rounded corners with the same corner radius value used on the C-Suite Advisory box.
- [ ] The image has a border matching the C-Suite Advisory box's border color (papaya), width, and style exactly.
- [ ] On mobile/narrow viewport widths, the layout stacks vertically without breaking, overlapping, or clipping the image's border/rounded corners.
- [ ] No changes were made to the text content of the section or to the "WHAT WE OFFER" / C-Suite Advisory box itself.
- [ ] The image includes a basic descriptive `alt` attribute.

## 6. Open questions

- On mobile (stacked layout), should the image appear above or below the text? The spec assumes text-first, image-second as a reasonable default — please confirm or specify preferred order.
- Is there an existing shared CSS class/variable for the C-Suite Advisory box's border/radius styling that should be reused directly, or is it currently one-off/inline styling that needs to be duplicated for this image?
- Is there a target breakpoint (specific pixel width) already used elsewhere in the site for "mobile," or should this follow a standard breakpoint (e.g., 768px)?
- Should the image have a fixed max-height, or should it be allowed to grow/shrink purely based on column width and aspect ratio?