   # Spec: Resize and Style Sofia.jpg in "Where We've Come From" Section

Status: draft
Job: TBD
Target repo: SimonR67/sidney
Supersedes (partially): none — new capability (styling/layout change to existing image, not a new feature)

## 1. What should change and why

The website currently displays an image called `Sofia.jpg` somewhere on the page in or near the "WHERE WE'VE COME FROM" section. The request asks for three related visual changes to this image so it better integrates with the surrounding paragraph text and matches the site's existing visual language:

1. **Resize/reposition** `Sofia.jpg` so it sits to the right of the paragraph text in the "WHERE WE'VE COME FROM" section (the paragraph beginning "We are a technology services business based in the UK, Poland, Ireland and Bulgaria..." and ending "...advisory, skills and people."), forming a text-left / image-right layout.
2. **Round the corners** of `Sofia.jpg` using the same `border-radius` value(s) currently applied to the boxes in the "WHAT WE OFFER" section.
3. **Add a border** around `Sofia.jpg` in the papaya orange color/style currently used on the "C-Suite advisory" box (matching border width, color, and style — e.g. solid vs. other style).

The problem this solves: the image is presumably currently either unstyled, mis-sized, or not visually consistent with the "boxed" design language established elsewhere on the site (rounded, orange-bordered boxes). This change brings visual consistency and improves the layout of the "Where We've Come From" section.

**Interpretation chosen:** The request assumes `Sofia.jpg` already exists on the page and is associated with (or intended to be placed alongside) this specific paragraph. If `Sofia.jpg` is not currently placed in or near this section, this spec covers moving/placing it there as part of the layout change, since the request explicitly ties the image to this paragraph's layout. The border-radius and border values are to be copied/matched exactly from the existing "WHAT WE OFFER" boxes and the "C-Suite advisory" box respectively — no new radius or color values should be invented.

## 2. Scope

- Locate `Sofia.jpg` in the codebase (HTML/template and associated CSS/stylesheet).
- Update markup/layout so the paragraph text under "WHERE WE'VE COME FROM" is on the left and `Sofia.jpg` is on the right, using a responsive layout approach consistent with existing site patterns (e.g. flexbox/grid, matching breakpoints already used elsewhere in the site).
- Resize `Sofia.jpg` (via CSS, e.g. `max-width`, `width`, `height: auto`) so it fits neatly alongside the paragraph without overflowing, cropping awkwardly, or distorting aspect ratio.
- Apply the exact `border-radius` value(s) used on the "WHAT WE OFFER" boxes to `Sofia.jpg`.
- Apply a border to `Sofia.jpg` matching the papaya orange border style (color, width, and border-style) used on the "C-Suite advisory" box.
- Ensure the new layout is responsive: on smaller/mobile viewports, the image should stack sensibly relative to the text (e.g. below the text, full-width or appropriately scaled) consistent with how other two-column sections on the site already behave responsively.
- Reuse existing CSS classes/variables where possible (e.g. shared `.box`-style classes for radius/border) rather than duplicating values, if that is consistent with the existing codebase's styling conventions.

## 3. Out of scope

- Changing the actual image file `Sofia.jpg` itself (cropping, re-compressing, replacing the photo, editing its content).
- Changing the paragraph text/copy under "WHERE WE'VE COME FROM" (the text is provided as-is and should not be altered).
- Redesigning the "WHAT WE OFFER" boxes or the "C-Suite advisory" box — these are only referenced as the source of styling values to copy, not to be modified themselves.
- Adding new border-radius or border-color values not already used elsewhere on the site (no new design tokens should be introduced).
- Changing the layout, styling, or content of any other section of the page not mentioned in this request.
- Adding animations, hover effects, lightbox/click-to-enlarge behavior, or captions to the image (not requested).
- Accessibility improvements beyond what already exists (e.g. no new `alt` text work is requested, though existing `alt` attributes should not be broken).
- SEO or performance optimization of the image (e.g. lazy loading, format conversion to WebP) unless already standard practice elsewhere in the site's image handling.

## 4. Edge cases and error behavior

- **`Sofia.jpg` not found in the repo:** If the file does not exist at the expected path, this is a blocking issue — the developer should flag it rather than silently skipping the image or substituting another asset.
- **`Sofia.jpg` already used elsewhere on the page:** If the image is reused in another section, changes here should be scoped via a specific class/selector so other usages are not unintentionally affected.
- **Boxes under "WHAT WE OFFER" have inconsistent border-radius values across breakpoints or box types:** If there is no single consistent radius value, the developer should flag this ambiguity rather than guessing; default to the most commonly used value if a decision must be made, and note the choice.
- **"C-Suite advisory" box border style varies (e.g. different width/color in hover vs. default state):** Use the default (non-hover, non-active) state's border styling as the reference.
- **Very small viewport widths:** The image and text must not overlap, get clipped, or break the page layout; the responsive stacking behavior should degrade gracefully.
- **Aspect ratio distortion:** Resizing must preserve the original aspect ratio of `Sofia.jpg` — no stretching/squashing.
- **Long text overflow:** If the paragraph text is long enough to make the text column very tall relative to the image, layout should still look intentional (e.g. image doesn't awkwardly float mid-paragraph) — vertical alignment should default to top-aligned with the text unless existing site conventions dictate otherwise.

## 5. Acceptance criteria

- [ ] `Sofia.jpg` is displayed to the right of the "WHERE WE'VE COME FROM" paragraph text on desktop/wide viewports, with the text on the left.
- [ ] The image is resized appropriately (via CSS) so it fits neatly within the section without overflowing its container or distorting the page layout.
- [ ] The image's aspect ratio is preserved (not stretched or squashed).
- [ ] The image has rounded corners using the exact same `border-radius` value(s) as the "WHAT WE OFFER" boxes.
- [ ] The image has a border matching the papaya orange color, width, and style used on the "C-Suite advisory" box.
- [ ] On smaller/mobile viewport widths, the layout responsively adjusts (e.g. image stacks below or above text) without breaking or overlapping content, consistent with how similar responsive sections behave elsewhere on the site.
- [ ] No other sections of the page (including "WHAT WE OFFER" and "C-Suite advisory" boxes themselves) are visually altered by this change.
- [ ] The paragraph text content remains unchanged.

## 6. Open questions

- Where in the codebase does `Sofia.jpg` currently appear — is it already placed near this paragraph, or does it need to be moved from elsewhere on the page?
- Is there a single canonical `border-radius` value used consistently across all "WHAT WE OFFER" boxes, or does it vary (e.g. by box type or breakpoint)? Please confirm which value to use if there's more than one.
- Is there a single canonical border color/width/style for the "C-Suite advisory" box, or does it change on hover/focus/active states? Please confirm the reference (default) state to copy.
- Is there a preferred fixed width or percentage split between the text column and the image column (e.g. 60/40, 2/3–1/3), or should this be left to visual judgment during implementation?
- What is the desired stacking order and image width on mobile (e.g. full-width above the text, or below the text)?