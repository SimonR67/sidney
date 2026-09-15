# Plan: Resize and Style Sofia.jpg in "Where We've Come From" Section

Status: draft
Job: TBD
Spec: https://github.com/SimonR67/sidney/blob/main/specs/29617dac-16b5-4a2b-a6ce-006411c2b9fd/spec.md

## 1. Definition of done

- `Sofia.jpg` is located in the codebase; its current path and existing usage(s) are documented.
- The "WHERE WE'VE COME FROM" paragraph and `Sofia.jpg` are wrapped in a responsive two-column layout: text left, image right on desktop/wide viewports.
- `Sofia.jpg` is resized via CSS (`max-width`/`width` + `height: auto`) so it fits its column without overflow, cropping, or distortion; aspect ratio is preserved.
- `Sofia.jpg` has the exact same `border-radius` value(s) currently used on the "WHAT WE OFFER" boxes (reusing the shared class/variable if one exists, rather than a duplicated hardcoded value).
- `Sofia.jpg` has a border matching the default (non-hover/non-active) papaya orange border color, width, and style used on the "C-Suite advisory" box.
- On mobile/small viewports, the image and text stack sensibly (no overlap, no clipping, no broken layout), consistent with existing responsive two-column sections on the site.
- No visual changes occur to the "WHAT WE OFFER" boxes, the "C-Suite advisory" box, or any other section/page.
- The paragraph text content is byte-for-byte unchanged.
- Any other existing usage of `Sofia.jpg` elsewhere on the page (if found) is unaffected by the new styling, via scoped selectors/classes.

## 2. File map

| File | Change |
|---|---|
| index.html (or the template/partial containing the "WHERE WE'VE COME FROM" section — path TBD after locating `Sofia.jpg`) | Wrap paragraph + `Sofia.jpg` in a two-column container (e.g. flex/grid wrapper); add a new class to the `<img>` tag (e.g. `sofia-photo`) for scoped styling; move/place `Sofia.jpg` here if not already located adjacent to this paragraph. |
| css/style.css (or equivalent existing stylesheet — path TBD) | Add layout rules for the new wrapper (flex/grid, responsive breakpoint matching existing patterns); add `.sofia-photo` rule for `max-width`, `height: auto`, `border-radius` (reusing the "WHAT WE OFFER" box radius value/variable), and `border` (reusing the "C-Suite advisory" default border color/width/style, ideally via a shared variable/class). |
| (reference only, not modified) CSS rules for "WHAT WE OFFER" boxes and "C-Suite advisory" box | Read to extract exact `border-radius` and `border` values to copy — no edits made here. |

## 3. User journey

A visitor loads the page and scrolls to the "WHERE WE'VE COME FROM" section. On a desktop-width browser, they see the paragraph text on the left and a rounded, orange-bordered photo of Sofia on the right, visually matching the "boxed" look used in the "WHAT WE OFFER" and "C-Suite advisory" sections elsewhere on the page. Resizing the browser window down to mobile width, the visitor sees the layout adapt: the text and image stack vertically (image below or above the text, full width or appropriately scaled) with no overlapping content, clipped text, or horizontal scrollbars. No other part of the page changes as a result of this update.

## 4. Tasks

- [ ] 1. Locate `Sofia.jpg` in the repo and document its current path, current markup context, and any other places it's referenced — files: (investigation only, no file changes) — test: a written note/commit message confirming the file's path and current usage(s); if the file is missing, flag as blocking per spec edge case and halt further tasks until resolved.
- [ ] 2. Extract the exact `border-radius` value(s) used on "WHAT WE OFFER" boxes and the exact default-state `border` (color/width/style) used on the "C-Suite advisory" box — files: css/style.css (read-only) — test: a documented pair of values (radius, border) with source selector names, confirming a single canonical value was found or, per spec edge case, the most common value was chosen and noted.
- [ ] 3. Add a two-column responsive wrapper (text left, image right) around the "WHERE WE'VE COME FROM" paragraph and `Sofia.jpg` in the markup, without altering the paragraph text — files: index.html (or relevant template), css/style.css — test: a snapshot/DOM test or manual browser check confirming the paragraph appears in a left column and the image in a right column at desktop width, and that the paragraph's text content is unchanged (string diff against original).
- [ ] 4. Add `max-width`/`width` + `height: auto` sizing rules to `Sofia.jpg` scoped via a dedicated class, ensuring no overflow and preserved aspect ratio — files: css/style.css, index.html (add class to `<img>`) — test: visual/browser check at desktop width showing image contained within its column with unchanged width:height ratio (compare rendered ratio to original file's intrinsic ratio).
- [ ] 5. Apply the extracted `border-radius` value(s) from Task 2 to the `Sofia.jpg` class (reusing shared class/variable if the codebase supports it) — files: css/style.css — test: computed style check (browser devtools or CSS test) showing `Sofia.jpg`'s `border-radius` exactly matches the "WHAT WE OFFER" box value, and that the "WHAT WE OFFER" boxes' own computed radius is unchanged.
- [ ] 6. Apply the extracted papaya orange border (color, width, style) from Task 2 to the `Sofia.jpg` class — files: css/style.css — test: computed style check showing `Sofia.jpg`'s border color/width/style exactly matches the "C-Suite advisory" box's default-state border, and that the "C-Suite advisory" box's own border is unchanged.
- [ ] 7. Add/adjust a responsive breakpoint so the two-column layout stacks on mobile widths, consistent with existing responsive two-column sections elsewhere on the site — files: css/style.css — test: browser check at a mobile viewport width (matching an existing site breakpoint) confirming text and image stack vertically with no overlap, clipping, or horizontal scroll.
- [ ] 8. If `Sofia.jpg` is used elsewhere on the page (per Task 1 findings), verify the new class/selector is scoped so other usages are unaffected — files: index.html, css/style.css — test: visual check confirming any other instance of `Sofia.jpg` on the page retains its original (unstyled) appearance.

## 5. Test plan

- Manual/browser-based visual regression check across three viewport widths (desktop, tablet, mobile) confirming: text-left/image-right layout on desktop, sensible stacking on mobile, no overlap/clipping/overflow at any width, and preserved image aspect ratio at all widths.
- Side-by-side visual diff (or computed-style comparison) of the "WHAT WE OFFER" boxes and "C-Suite advisory" box before and after the change, confirming zero visual difference (they must remain untouched).
- Text diff of the "WHERE WE'VE COME FROM" paragraph before and after the change, confirming zero content difference.
- Computed style comparison confirming `Sofia.jpg`'s `border-radius` and `border` properties exactly equal the reference values captured in Task 2.
- Full-page manual scroll-through to confirm no other section's layout, styling, or content was altered.

## 6. Out of scope (carried from spec)

- Changing the actual image file `Sofia.jpg` (cropping, re-compressing, replacing, or editing its content).
- Changing the paragraph text/copy under "WHERE WE'VE COME FROM".
- Redesigning or modifying the "WHAT WE OFFER" boxes or the "C-Suite advisory" box — these are reference-only sources for styling values.
- Introducing new border-radius or border-color values not already used elsewhere on the site.
- Changing the layout, styling, or content of any other section of the page.
- Adding animations, hover effects, lightbox/click-to-enlarge behavior, or captions to the image.
- Accessibility improvements beyond what already exists (no new `alt` text work), other than preserving existing `alt` attributes.
- SEO or performance optimization of the image (e.g. lazy loading, WebP conversion) unless already standard practice elsewhere in the site's image handling.