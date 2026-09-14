# Plan: Homepage content, styling, and "What We Offer" section overhaul

Status: draft
Job: 7931a152-83fe-4f91-8093-e167e642681a
Spec: https://github.com/SimonR67/sidney/blob/main/specs/7931a152-83fe-4f91-8093-e167e642681a/spec.md

## 1. Definition of done

- "REALLY WELL" in the hero headline renders in #E56717 (Papaya); the rest of the headline stays black.
- The paragraph under the headline is replaced in full with the new provided copy.
- The top-left "Softpapaya" text title is replaced with an `<img>` referencing the existing `Softpapaya-logo.png` asset (no new file added), with appropriate alt text and, if the old text was a home link, equivalent link behavior preserved.
- The "WHAT WE OFFER" section shows exactly 6 boxes, in the specified order, with the specified titles/body copy, and zero leftover DOM/CSS/copy from the old 8-box version.
- Box outlines follow the exact sequence Papaya, Lime, Black, Black, Papaya, Lime.
- Each box's tag/skill mini-buttons are colored to match that box's own outline color and are topically relevant to its content.
- The 6-box layout reuses the existing grid/card component/classes (no new grid system), preserving responsive breakpoints and spacing.
- Page renders without layout breakage or console errors on one desktop and one mobile viewport.

## 2. File map

| File | Change |
|---|---|
| components/Hero.* (or homepage hero component, path TBC on inspection) | Wrap "REALLY WELL" in a `<span>`/equivalent with Papaya (#E56717) color; leave rest of headline untouched |
| components/Hero.* (same file, paragraph block) | Replace existing paragraph text with new provided copy |
| components/Header.* (or Nav/Logo component, path TBC on inspection) | Remove plain-text "Softpapaya" title; render `<img src=".../Softpapaya-logo.png" alt="Softpapaya">` in its place, preserving header layout/link behavior |
| components/WhatWeOffer.* (or equivalent section component, path TBC on inspection) | Remove all 8 existing box entries/markup; add 6 new box entries with specified titles/content, outline colors, and tag lists, reusing existing card/grid markup and classes |
| styles/*.css or Tailwind config (path TBC — check for existing color tokens) | Add/confirm Papaya/Lime/Black color values (hex or reused token) used for outlines and tag backgrounds; remove any CSS rules solely tied to the old 8 boxes |
| public/ or assets/ (path TBC) | No file changes — confirm existing path of `Softpapaya-logo.png` for the `<img src>` reference only |

## 3. User journey

A visitor lands on the homepage. They see the headline "WHAT WE DO. AND WE DO IT REALLY WELL." with "REALLY WELL" standing out in orange (Papaya) against the rest of the black text. Below it, they read the new, more accurate paragraph describing the business's locations, service model, and team offering. In the top-left corner, instead of plain text, they see the Softpapaya logo image, which (if it was previously a link) still takes them home when clicked. Scrolling to "WHAT WE OFFER," they see 6 clearly outlined boxes — C-Suite Advisory, Software Development, Subject Matter Expertise, Data AI & Automation, UI/UX Design and Rapid POC, and Technology Teams & Resourcing — each with a distinct colored border (Papaya, Lime, Black, Black, Papaya, Lime) and small colored tag pills relevant to that service (e.g., TypeScript, Java, Python, React under Software Development, colored Lime to match its box). The layout responds cleanly on both desktop and mobile, with no broken images, no overflow, and no leftover content from the old 8-box section.

## 4. Tasks

- [ ] 1. Locate and confirm exact file paths for the hero headline/paragraph component, the header/logo component, the "WHAT WE OFFER" section component, and the `Softpapaya-logo.png` asset path in the repo — files: (investigation only, update this plan's file map with confirmed paths) — test: build succeeds and manual grep confirms each element's current source location before any edits.
- [ ] 2. Recolor "REALLY WELL" in the hero headline to #E56717 while leaving the rest of the headline black — files: hero headline component/CSS — test: rendered DOM shows a wrapping element around "REALLY WELL" with computed color #E56717, and a snapshot/DOM test confirms surrounding text remains the original black color.
- [ ] 3. Replace the paragraph beneath the headline with the new provided copy — files: hero paragraph component — test: DOM/text-content test asserts the paragraph's rendered text exactly matches the new copy and no longer contains the old text.
- [ ] 4. Replace the "Softpapaya" text title with an `<img>` referencing the existing `Softpapaya-logo.png`, preserving prior link behavior and appropriate sizing/alt text — files: header/logo component — test: DOM test asserts no visible text node "Softpapaya" is rendered, an `<img>` with `alt="Softpapaya"` and `src` pointing to the existing asset path is present, and (if applicable) it's wrapped in the same home link as before; build fails/errors if the image path is invalid.
- [ ] 5. Remove all 8 existing boxes and their dead CSS/copy from the "WHAT WE OFFER" section, replacing with an empty/placeholder 6-box scaffold using the existing card/grid component — files: "WHAT WE OFFER" section component, related CSS — test: DOM test asserts zero elements matching the old 8-box markup/classes remain, and exactly 6 placeholder card elements exist using the existing grid classes.
- [ ] 6. Populate the 6 boxes with exact titles and body copy in the specified order (C-Suite Advisory, Software Development, Subject Matter Expertise, Data AI & Automation, UI/UX Design and Rapid POC, Technology Teams & Resourcing) — files: "WHAT WE OFFER" section component — test: DOM test asserts the 6 box titles appear in that exact order with body text matching the spec's provided copy verbatim.
- [ ] 7. Apply outline/border colors to each box following the sequence Papaya, Lime, Black, Black, Papaya, Lime — files: "WHAT WE OFFER" section component/CSS — test: computed-style test asserts each box's border/outline color matches the expected hex (#E56717, #A6CE39, #000000, #000000, #E56717, #A6CE39) in order.
- [ ] 8. Add topically relevant tag/skill mini-buttons to each box (e.g., Software Development → TypeScript, Java, Python, React; C-Suite Advisory → Roadmap, Governance, CTO Advisory; etc.) — files: "WHAT WE OFFER" section component — test: DOM test asserts each box contains the expected tag labels and that no box has irrelevant/leftover tags from the old 8-box version.
- [ ] 9. Recolor each box's tag/mini-button elements to match that box's own outline color instead of the previous grey styling — files: "WHAT WE OFFER" section CSS — test: computed-style test asserts each tag element's background/border color matches its parent box's outline color exactly.
- [ ] 10. Verify and adjust (if needed) the grid's column/row balance for 6 boxes using only existing grid behavior (no custom fixes) — files: "WHAT WE OFFER" section CSS — test: visual/DOM layout test at the site's existing breakpoints confirms no visually broken trailing row and preserved column counts/spacing matching the prior 8-box grid's conventions.
- [ ] 11. Cross-viewport smoke check for layout breakage/console errors across all changed sections — files: none (verification only, may touch e2e/test config) — test: automated or manual check on one desktop width and one mobile width shows no layout overflow, no broken image, and no console errors on the homepage.

## 5. Test plan

After all tasks are complete, run a full homepage regression pass covering: (a) the hero headline renders with correct partial coloring and updated paragraph text; (b) the header renders the logo image with no visible "Softpapaya" text and correct link/alt behavior; (c) the "WHAT WE OFFER" section renders exactly 6 boxes in the correct order, titles, copy, outline colors, and correctly colored tags with no remnants of the old 8-box markup or CSS; (d) the page loads cleanly with no console errors and no layout breakage at one desktop viewport (e.g. 1440px) and one mobile viewport (e.g. 375px); (e) a final grep/DOM audit confirms no orphaned CSS classes or copy tied only to the removed 8-box section remain in the codebase.

## 6. Out of scope (carried from spec)

- No changes to any other page/section beyond the headline, the paragraph beneath it, the top-left site title, and the "WHAT WE OFFER" boxes.
- No changes to navigation, footer, other CTAs, or unrelated homepage copy.
- No redesign of the overall grid/layout system — existing grid/card conventions must be reused, not replaced.
- No changes to the `Softpapaya-logo.png` file itself (no re-export, resize, recolor, or re-upload) — used as-is from its existing repo location.
- No introduction of a formal design-token/theme system unless one already exists — colors applied directly via hex unless an existing token is found, in which case it's reused.
- No SEO, accessibility audit, or performance optimization work beyond reasonable `alt` text for the new logo image.
- No changes to mobile menu, header sticky behavior, or other header functionality — only the title text→image swap.
- No copy changes to box tags/skills beyond what's needed for the 6 new boxes — old tags are not preserved unless still topically relevant.