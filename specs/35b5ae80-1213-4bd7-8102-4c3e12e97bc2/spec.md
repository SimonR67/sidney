   # Spec: Single Page Styling Update — Navigation Colors and "What We Offer" Box Borders

Status: draft
Job: 35b5ae80-1213-4bd7-8102-4c3e12e97bc2
Target repo: SimonR67/sidney
Supersedes (partially): existing CSS/styling rules for the site's single-page navigation ("TALK TO US" button and other menu items) and the "what we offer" section box borders

## 1. What should change and why

The request asks for three visual styling changes on the site's single page:

1. The "TALK TO US" button's background color should change from its current blue to papaya orange (#E56717).
2. The other navigation/menu items (i.e., all nav items other than "TALK TO US") should change their hover highlight color from blue to papaya orange (#E56717), and the item's text should also become bold on hover.
3. The 8 "boxes" in the "what we offer" section currently have a light grey border. These borders should instead cycle through three colors in a fixed repeating order: papaya orange (#E56717), lime green (#32CD32), black (#000000) — applied to boxes 1–8 respectively as: orange, green, black, orange, green, black, orange, green.

This is a pure visual/CSS change — no functional, structural, or content changes are intended. The problem being solved is purely aesthetic/branding: replacing blue accents with papaya orange, adding a hover affordance (bold text) to nav items, and adding visual variety/distinction to the "what we offer" boxes via a repeating border color pattern.

No ambiguity was found in the color values (exact hex codes were given) or in the box-to-color mapping (explicitly enumerated 1–8 by the requester). One interpretation choice: "the other menu/navigation items" is understood to mean every navigation/menu item on the single page except "TALK TO US" (which is handled separately in item 1). If the site has navigation items that appear in multiple places (e.g., a header nav and a footer nav) on the single page, this spec applies to all of them unless the reviewer says otherwise (see Open Questions).

## 2. Scope

- Update the CSS background-color rule for the "TALK TO US" button (all states where it currently renders blue as background, e.g., default/base state) to #E56717.
- Update the CSS `:hover` (and equivalent focus/active states used for hover-equivalent highlighting, if applicable) rules for all other navigation/menu items on the single page so that:
  - The highlight/accent color currently blue changes to #E56717.
  - The text becomes bold (e.g., `font-weight: bold;` or equivalent) on hover.
- Update the border styling for the 8 boxes in the "what we offer" section on the single page so each box's border color follows this fixed, repeating pattern based on position in the section (1-indexed, in DOM/visual order):
  - Box 1: #E56717
  - Box 2: #32CD32
  - Box 3: #000000
  - Box 4: #E56717
  - Box 5: #32CD32
  - Box 6: #000000
  - Box 7: #E56717
  - Box 8: #32CD32
- Only the border color changes for these 8 boxes; border width, style (solid/dashed/etc.), and radius remain unchanged unless the current implementation makes color-only changes impossible (see Open Questions).
- Changes are scoped to the single page referenced in the request (not a global site-wide stylesheet change unless the relevant CSS is already scoped to that page only — see Out of Scope).

## 3. Out of scope

- Any styling changes to pages other than the single page named in the request.
- Any changes to the "TALK TO US" button's text color, size, shape, border, padding, or hover/active state styling beyond the background color specified.
- Any changes to non-hover (default/base) states of the other navigation/menu items beyond what's needed to implement the hover behavior (e.g., no change to their default color, font-weight, or size when not hovered).
- Changing hover behavior or colors for the "TALK TO US" button itself (only its background color per item 1 is in scope).
- Any borders elsewhere on the page (e.g., other sections, cards, buttons, images, dividers) — only the 8 "what we offer" boxes' borders are affected.
- Changing the box borders' width, style, thickness, corner radius, or adding shadows/effects — only color is in scope.
- Any changes to the content, layout, number of boxes, or order of boxes in the "what we offer" section.
- Any accessibility audit or contrast-ratio validation beyond ensuring the specified colors are applied as requested (see Open Questions for a flag on this).
- Any changes to color variables/theme files that would affect other pages or components not explicitly named here, unless those changes can be scoped narrowly to avoid unintended side effects.
- Mobile-specific or responsive-breakpoint-specific styling changes beyond what is needed to make the same color/weight changes apply consistently across existing breakpoints (no new responsive behavior is being introduced).

## 4. Edge cases and error behavior

- If the "TALK TO US" button or nav items use an image, gradient, or sprite for their background/highlight instead of a flat CSS color, a flat color cannot simply replace it — this should be flagged rather than silently approximated, and the implementer should confirm with the reviewer before proceeding.
- If nav item hover effects are currently implemented via JavaScript (e.g., class toggling) rather than pure CSS `:hover`, the same visual outcome (orange highlight + bold text on hover) should still be achieved, adapting the implementation approach as needed, without changing the underlying interaction mechanism unnecessarily.
- If the "what we offer" section has more or fewer than 8 boxes in the actual current markup (e.g., due to a template list that could grow), the color pattern should be applied by position for the first 8, and any additional boxes beyond 8 should be flagged to the reviewer rather than assigned a color unilaterally (since the request only specifies 8).
- If any of the "what we offer" boxes are dynamically generated (e.g., from a CMS list or data array), the coloring should be applied via a repeating pattern (e.g., `nth-child` with `:nth-child(3n+1)`, etc.) rather than hardcoded per-box, so the pattern holds if content order is unchanged.
- If touch devices are in scope for this page (no hover state on touch), the hover-only behavior (orange highlight + bold) will simply not trigger on touch, consistent with normal hover behavior elsewhere on the site — this is expected and not treated as an error.
- No user input, form submission, or data validation is involved in this change, so no invalid-input handling applies.
- No external dependencies (APIs, services) are involved in this purely visual CSS change, so no dependency-unavailability handling applies.

## 5. Acceptance criteria

- On the single page, the "TALK TO US" button's background color renders as #E56717 in its default/base state.
- No other visual property of the "TALK TO US" button (text color, border, size, hover state) has changed.
- On the single page, hovering over any other navigation/menu item (excluding "TALK TO US") changes its highlight color from blue to #E56717.
- On the single page, hovering over any other navigation/menu item (excluding "TALK TO US") also makes its text bold.
- When the mouse leaves a hovered nav item, it returns to its original (unchanged) default state.
- In the "what we offer" section, the 8 boxes have borders colored in this exact order: #E56717, #32CD32, #000000, #E56717, #32CD32, #000000, #E56717, #32CD32 (box 1 through box 8, respectively).
- No borders outside the "what we offer" section's 8 boxes have been altered.
- No other unrelated CSS properties (layout, spacing, fonts, colors elsewhere) have changed as a side effect.
- Changes are visually verifiable in a browser on the single page in question, across the site's currently supported breakpoints/devices.

## 6. Open questions

- "The other menu/navigation items" — does this include only the primary nav bar, or also any secondary/footer navigation present on the same single page? Please confirm the exact set of elements intended.
- Should the hover color/bold-text change also apply to focus state (e.g., keyboard navigation via Tab), for accessibility parity with mouse hover, or strictly mouse-hover only as literally requested?
- Are the exact 8 "what we offer" box elements static HTML (fixed order) or generated from a list/array? This affects whether the coloring should be hardcoded per box or implemented via a repeating CSS pattern (e.g., `nth-child`).
- Should any contrast/accessibility check be done for text-on-orange or black borders on the existing box background, or is visual color match to the given hex codes sufficient regardless of contrast?
- Is there an existing CSS variable/theme system in the codebase (e.g., a `$primary-color` or similar) currently used for "blue" that should be updated at the variable level (affecting all uses of that variable), or should these changes be scoped narrowly with new, separate CSS rules to avoid affecting other unnamed elements that might share the same "blue"?