# Plan: Restructure "WHERE WE'VE COME FROM" section with 50/50 text/image layout

Status: draft
Job: 1416c200-4729-4c71-8e75-e674bd0519d5
Spec: https://github.com/SimonR67/sidney/blob/main/specs/1416c200-4729-4c71-8e75-e674bd0519d5/spec.md

## 1. Definition of done

- The "WHERE WE'VE COME FROM" section renders as a two-column, roughly 50/50 layout on desktop/tablet: existing text on the left, Sofia.jpg on the right.
- Sofia.jpg is correctly referenced from its existing repo path and loads without adding/moving/editing the image file.
- The image is sized (responsively, `max-width: 100%`, `height: auto` or `object-fit`) so it carries comparable visual weight to the text block, not tiny or overwhelming.
- Consistent gap/padding exists between the two columns — no edge-to-edge touching.
- The image container has the same border-radius, border color (papaya), and border width/style as the C-Suite Advisory box, with those exact values identified and reused or duplicated (documented if duplication was required).
- On mobile/narrow viewports the columns stack vertically (text first, image second), with no clipping/overlap of the image's border or rounded corners.
- The image has a basic descriptive `alt` attribute and degrades gracefully if it fails to load.
- No text content changes in the section, and no changes to the "WHAT WE OFFER" section / C-Suite Advisory box.

## 2. File map

| File | Change |
|---|---|
| index.html (or the page/template containing the "WHERE WE'VE COME FROM" section) | Restructure section markup into two columns (`.wwcf-text` and `.wwcf-image`), add `<img>` tag referencing existing Sofia.jpg path with `alt` text |
| css/style.css (or equivalent existing stylesheet) | Add/extend styles for the new two-column grid/flex layout, gap/padding, responsive stacking at mobile breakpoint, and image border/radius rules matching the C-Suite Advisory box |
| N/A (verify only, no edit) | Locate and confirm existing C-Suite Advisory box styling (selector/class/inline styles) in the "WHAT WE OFFER" section to source exact border-radius, border-color, border-width/style values |
| N/A (verify only, no edit) | Confirm Sofia.jpg's existing path/location in the repo (e.g. `images/Sofia.jpg` or similar) for correct `src` reference |

## 3. User journey

A visitor scrolls to the "WHERE WE'VE COME FROM" section on the site. On a desktop or tablet screen, they see the existing text content on the left half of the section and a photo of Sofia on the right half, framed with rounded corners and a papaya-colored border matching the C-Suite Advisory box seen elsewhere on the page — giving the section a polished, intentional two-column feel with clear spacing between text and image. If they resize the browser or view the page on a mobile phone, the layout gracefully stacks: the text appears first, followed by the image below it, still styled with its rounded papaya border, with nothing clipped, overlapping, or cramped. If the image fails to load for any reason, the text content remains fully readable and the layout doesn't break, showing alt text in place of the image.

## 4. Tasks

- [ ] 1. Identify and document the exact C-Suite Advisory box border styling (border-radius, border-color/papaya value, border-width/style) from the "WHAT WE OFFER" section — files: css/style.css (read-only reference), notes added to task comments — test: manual/DOM inspection confirms the three values (radius, color, width/style) and their source (class vs inline), recorded for reuse in task 4.
- [ ] 2. Confirm Sofia.jpg's existing path in the repo and that it is accessible/renders when referenced with a plain `<img src>` — files: none (verification), or a temporary scratch reference — test: image renders correctly in a browser when pointed at the confirmed path with no 404.
- [ ] 3. Restructure the "WHERE WE'VE COME FROM" section markup into two column containers (text column unchanged content, new image column with `<img>` and `alt` attribute) — files: index.html — test: DOM/HTML test (or manual inspection) confirms both a `.wwcf-text` (or equivalent) element wrapping unchanged existing text and a `.wwcf-image` (or equivalent) element containing an `<img>` tag pointing at Sofia.jpg's confirmed path with a non-empty `alt` attribute.
- [ ] 4. Apply desktop/tablet 50/50 two-column layout styling with gap/padding between columns — files: css/style.css — test: at a desktop viewport width (e.g. 1024px+), the two columns render with widths approximately equal (roughly 50/50, e.g. within 10% of each other) and a visible non-zero gap between them (verified via computed styles or visual snapshot).
- [ ] 5. Style the image element/container with the border-radius, border-color (papaya), and border-width/style matching the C-Suite Advisory box values identified in task 1 — files: css/style.css — test: computed style check (e.g. via browser devtools or a style-comparison test) shows the image's border-radius, border-color, and border-width/style exactly match the C-Suite Advisory box's values.
- [ ] 6. Make the image responsive within its column (max-width: 100%, height: auto or object-fit) so it scales without distortion or overflow, and carries visually comparable weight to the text block — files: css/style.css — test: resizing the viewport between desktop and mobile widths shows the image scaling proportionally with no overflow outside its column and no visible distortion (aspect ratio preserved or intentionally cropped via object-fit).
- [ ] 7. Add mobile breakpoint behavior so columns stack vertically (text first, image second) with the image resized to mobile width while retaining its border/rounded-corner styling — files: css/style.css — test: at a mobile viewport width (e.g. below 768px), the text column appears above the image column in the rendered layout, the image spans close to full width, and its border/rounded corners remain fully visible (not clipped or overlapping adjacent content).
- [ ] 8. Verify graceful degradation when the image fails to load (broken path scenario) — files: none (test-only, using a temporarily broken src or automated check) — test: with a deliberately broken image src, the alt text displays, the layout of the text column is unaffected, and no layout breakage/overlap occurs.
- [ ] 9. Confirm no regressions to the section's text content or to the "WHAT WE OFFER" / C-Suite Advisory box — files: index.html, css/style.css (diff review only) — test: diff review shows the "WHERE WE'VE COME FROM" text content is byte-identical to before the change, and no lines within the "WHAT WE OFFER" section/C-Suite Advisory box markup or styles were modified.

## 5. Test plan

After all tasks are complete, perform an end-to-end manual/visual review across three viewport sizes (desktop ~1440px, tablet ~768–1024px, mobile ~375–414px) confirming: (1) the 50/50 split renders correctly on desktop/tablet with balanced visual weight between text and image, (2) the image displays with the exact border-radius/border-color/border-width matching the C-Suite Advisory box side-by-side comparison, (3) spacing between columns looks intentional and consistent with the rest of the site's spacing conventions, (4) the mobile stacked layout shows text-first/image-second with no clipping of the image's rounded border, (5) a full-page diff/review confirms no unintended changes outside the "WHERE WE'VE COME FROM" section, and (6) a broken-image simulation confirms graceful degradation. Cross-browser spot check (e.g. Chrome and Safari/Firefox) to ensure border/radius rendering is consistent.

## 6. Out of scope (carried from spec)

- Changing the wording/content of the "WHERE WE'VE COME FROM" text itself.
- Changing the "WHAT WE OFFER" section or the C-Suite Advisory box styling — referenced as a style source only, not modified.
- Adding new images beyond Sofia.jpg, or replacing/cropping/compressing/recoloring Sofia.jpg unless the raw file causes a technical problem.
- Redesigning other sections of the site for consistency with this layout pattern.
- Adding animations, hover effects, lightbox/zoom behavior, or captions on the image.
- Changing overall page navigation, section ordering, or section headings.
- Accessibility improvements beyond a basic `alt` attribute on the image (no broader audit).