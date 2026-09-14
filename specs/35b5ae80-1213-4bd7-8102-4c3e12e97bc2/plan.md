# Plan: Single Page Styling Update — Navigation Colors and "What We Offer" Box Borders

Status: draft
Job: 35b5ae80-1213-4bd7-8102-4c3e12e97bc2
Spec: https://github.com/SimonR67/sidney/blob/main/specs/35b5ae80-1213-4bd7-8102-4c3e12e97bc2/spec.md

## 1. Definition of done

- The "TALK TO US" button's default/base background color is #E56717 (no other property of that button changed).
- All other nav/menu items on the single page change their highlight color from blue to #E56717 on hover, and their text becomes bold on hover; default (non-hover) state is unchanged.
- The 8 "what we offer" boxes have border colors, in order: #E56717, #32CD32, #000000, #E56717, #32CD32, #000000, #E56717, #32CD32.
- Border width, style, and radius of the 8 boxes are unchanged; only color changed.
- No borders outside the 8 "what we offer" boxes were touched.
- No unrelated CSS (layout, spacing, fonts, other colors) changed as a side effect.
- Changes apply only to the single page named in the spec, verified across existing supported breakpoints.
- Any blockers found (image/gradient backgrounds instead of flat color, >8 boxes present, JS-driven hover, CSS variables shared across pages) are flagged to the reviewer per the spec's edge-case guidance rather than resolved unilaterally.

## 2. File map

| File | Change |
|---|---|
| (single page's HTML file, e.g. `index.html` or equivalent template — to be confirmed in Task 1) | No structural change expected; inspect markup for nav item and "what we offer" box structure/classes to confirm hooks for CSS selectors (e.g. presence of `nth-child`-able list vs. static repeated markup). |
| (single page's stylesheet, e.g. `style.css` / `css/style.css` / page-scoped `<style>` block — to be confirmed in Task 1) | Update "TALK TO US" button background-color rule; update other nav item `:hover` (and equivalent) rules for color + `font-weight: bold`; update "what we offer" box border-color rules (per-box or via `nth-child` pattern). |
| (any shared/global stylesheet or theme/variables file, if the current blue is defined via a shared variable — to be confirmed in Task 1) | Only touched if a narrowly-scoped override cannot otherwise be achieved; must not introduce changes visible on other pages. |

## 3. Tasks below assume repo investigation confirms exact file paths and selectors; Task 1 exists specifically to resolve this before other tasks proceed.

## 3. User journey

A visitor loads the single page. In the navigation area, they see the "TALK TO US" button rendered with a papaya-orange background. As they move the mouse over other nav items (e.g. "Home", "About", "Contact"), each item's highlight color changes to papaya orange and its text becomes bold while hovered; moving the mouse away restores the original state. Scrolling down to the "what we offer" section, the visitor sees 8 boxes whose borders alternate in the fixed orange → green → black → orange → green → black → orange → green pattern, while everything else about the boxes (layout, content, size) looks the same as before. No other part of the page's appearance has changed.

## 4. Tasks

- [ ] 1. Investigate repo structure to locate the single page's markup and stylesheet(s), identify the current "TALK TO US" button rule, the other nav items' hover rules (CSS `:hover` vs JS class toggling), the "what we offer" box markup (static vs. list-generated), and whether "blue" is a literal value or a shared CSS variable/theme token used elsewhere — files: (page HTML, page/global CSS) — test: written findings confirm exact selectors/files for tasks 2–5; if blockers are found (image/gradient background, JS-driven hover, shared variable affecting other pages, more/fewer than 8 boxes), flag to reviewer before proceeding with the affected task.
- [ ] 2. Change the "TALK TO US" button's background-color to #E56717 in its default/base state only — files: identified page stylesheet — test: automated/manual check (e.g. computed style snapshot or CSS assertion test) confirms button's base `background-color` resolves to `#E56717`, and confirms no other property (color, border, padding, size, hover rule) on that selector changed from its prior value.
- [ ] 3. Update the other nav/menu items' hover (and equivalent focus/active-for-hover-parity, per confirmed scope) rules so the highlight color changes from blue to #E56717 and `font-weight: bold` is applied on hover — files: identified page stylesheet (and JS file if hover is class-toggle driven, per Task 1 findings) — test: simulate `:hover` state (e.g. via CSS-in-test tooling or triggering the hover class) on each non-"TALK TO US" nav item and assert computed highlight color is `#E56717` and `font-weight` is `bold`; assert default (non-hover) state is unchanged from baseline snapshot.
- [ ] 4. Verify hover state reverts correctly when mouse leaves a nav item — files: same as Task 3 — test: after simulating hover then un-hover, assert the item's computed style matches its original pre-change default state (color/highlight and font-weight both reverted).
- [ ] 5. Apply the fixed repeating border-color pattern (#E56717, #32CD32, #000000 repeating) to the 8 "what we offer" boxes in position order 1–8, using a repeating pattern selector (e.g. `:nth-child`) if boxes are list-generated, or per-box rules if static, per Task 1 findings — files: identified page stylesheet (and markup file only if selectors/classes need adding, not restructuring) — test: for each of the 8 boxes in DOM order, assert computed `border-color` matches the expected value from the sequence [#E56717, #32CD32, #000000, #E56717, #32CD32, #000000, #E56717, #32CD32]; assert `border-width`, `border-style`, and `border-radius` are unchanged from baseline for each box.
- [ ] 6. Regression check that no unrelated styling changed — files: identified page stylesheet — test: diff computed styles (or visual snapshot) of the full single page before/after the change, confirming only the specified background-color, hover color/font-weight, and 8 box border-colors differ, and no other page on the site references the modified rules (i.e., changes are scoped to the single page/selectors named in the spec).

## 5. Test plan

- Run all per-task tests together against a build/preview of the single page to confirm the combined change set matches every acceptance criterion in the spec (button color, nav hover color+bold, box border sequence).
- Manually verify in a browser (or via automated visual regression tool if available in the repo) across the site's existing supported breakpoints/devices that: the "TALK TO US" button shows papaya orange by default; other nav items show papaya orange + bold text on hover and revert on mouse-out; the 8 "what we offer" boxes show the exact 8-color border sequence.
- Confirm via a site-wide search/grep (or existing test suite, if any) that no other page's rendering changed as a result of any shared stylesheet/variable edits made in Task 1's remediation, if applicable.
- Confirm any flagged edge cases from Task 1 (non-flat backgrounds, JS-driven hover, box count mismatch, shared variables) were either resolved per reviewer confirmation or explicitly left open and documented, not silently worked around.

## 6. Out of scope (carried from spec)

- Styling changes to any page other than the single page named in the spec.
- Any change to the "TALK TO US" button's text color, size, shape, border, padding, or hover/active state beyond its background color.
- Any change to the default/base state of other nav items beyond what's required to implement hover behavior.
- Any hover behavior/color change to the "TALK TO US" button itself.
- Any borders outside the 8 "what we offer" boxes.
- Any change to the boxes' border width, style, thickness, corner radius, or added shadows/effects — color only.
- Any change to content, layout, number, or order of the "what we offer" boxes.
- Any accessibility/contrast-ratio audit beyond applying the specified colors as given.
- Any change to shared color variables/theme files that would affect other pages/components, unless narrowly scoped without side effects.
- Any new responsive/mobile-specific behavior beyond applying the same changes consistently across existing breakpoints.