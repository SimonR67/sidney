# Plan: Add "VALUES" section to site, linked to existing "Values" nav tab

Status: draft
Job: e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce
Spec: https://github.com/SimonR67/sidney/blob/main/specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/spec.md

## 1. Definition of done

- A "VALUES" section exists in the page markup, positioned immediately after "WHERE WE'VE COME FROM" and before whatever section currently follows it.
- The section's `id`/anchor exactly matches the existing "Values" nav tab's `href`, confirmed against actual source (not assumed).
- The section contains exactly six boxes, in order: PEOPLE OVER PROCESS, NO OVERTIME CULTURE, SMALL TEAMS BIG OWNERSHIP, GROWTH ON YOUR TERMS, TRANSPARENCY, RESPECT FOR TIME.
- Each box reuses the exact same HTML/CSS classes, border colour-rotation logic, and fonts as "WHAT WE OFFER" boxes, extended cleanly to 6 items with no new colours or variants.
- All heading/body text (including Box 4's bullet list and line breaks) is verbatim, unaltered.
- "WHAT WE OFFER" and "WHERE WE'VE COME FROM" sections remain byte-for-byte unchanged.
- Clicking the "Values" nav tab scrolls to/navigates to the new section correctly.
- Page renders without visible breakage at all breakpoints the "WHAT WE OFFER" section already supports.

## 2. File map

| File | Change |
|---|---|
| (page template/HTML file containing "WHERE WE'VE COME FROM" / "WHAT WE OFFER", e.g. index.html or equivalent template) | Insert new "VALUES" section immediately after "WHERE WE'VE COME FROM", reusing the "WHAT WE OFFER" box markup pattern with 6 populated boxes and correct `id`. |
| (nav/menu markup file, if separate from page template) | No changes — read-only inspection to confirm existing "Values" `href` value and naming convention. |
| (CSS/stylesheet file backing the box component, if class names need no changes but must be verified) | No changes — read-only inspection to confirm box/colour-rotation classes support 6 items. |

## 3. User journey

A visitor lands on the site and clicks the "Values" tab in the nav menu. The browser scrolls/navigates to a section titled "VALUES", positioned right after "WHERE WE'VE COME FROM" and before whatever section came next. The visitor sees six boxes — styled identically to the "WHAT WE OFFER" boxes (same borders, colour rotation, fonts, layout) — each with one of the six value headings and its verbatim body text, including the bulleted list under "GROWTH ON YOUR TERMS". Nothing else on the page (nav, "WHAT WE OFFER", "WHERE WE'VE COME FROM") looks or behaves differently than before.

## 4. Tasks

- [ ] 1. Inspect current source to confirm the "Values" nav tab's exact `href`, the `id`/anchor naming convention used by "WHERE WE'VE COME FROM" and "WHAT WE OFFER", and the exact box component markup/CSS classes and colour-rotation logic (including whether it supports >3 items). — files: page template, nav markup, stylesheet (read-only) — test: written confirmation note in PR/commit of the exact `href`/id values and class names found, to be referenced by later tasks (blocks tasks 2–4 if mismatch found, per spec's edge case).
- [ ] 2. Add empty "VALUES" section skeleton (heading + correct `id`, no boxes yet) immediately after "WHERE WE'VE COME FROM", using the same section-heading markup/classes as the other two sections. — files: page template — test: automated/manual check that a section with the confirmed `id` exists in DOM order directly after "WHERE WE'VE COME FROM" and before the next existing section; nav "Values" link click scrolls to it.
- [ ] 3. Extend/reuse the "WHAT WE OFFER" box component to render 6 boxes with correct 3-colour rotation (1-2-3-1-2-3), verifying it doesn't hardcode a fixed count of 3. — files: page template (box instances), stylesheet only if rotation logic needs generalizing (no new colours/classes) — test: rendered "VALUES" section has exactly 6 boxes, each with one of the three existing border colour classes cycling correctly, matching "WHAT WE OFFER"'s CSS class names exactly.
- [ ] 4. Populate the 6 boxes with verbatim heading/body text for PEOPLE OVER PROCESS, NO OVERTIME CULTURE, SMALL TEAMS BIG OWNERSHIP, GROWTH ON YOUR TERMS (with 3 bullets), TRANSPARENCY, RESPECT FOR TIME, in that exact order. — files: page template — test: string-match/diff test comparing rendered box text against the verbatim spec text (headings, body copy, line breaks, and Box 4's bullet list) with no rewording or truncation.
- [ ] 5. Regression check that "WHAT WE OFFER" and "WHERE WE'VE COME FROM" sections are unchanged (markup, class names, box count/order/content). — files: page template (verification only) — test: diff of those two sections against pre-change version shows zero differences.
- [ ] 6. Cross-breakpoint visual check of the new "VALUES" section at the same breakpoints "WHAT WE OFFER" supports. — files: none (manual/browser verification, plus template if a fix is needed) — test: manual screenshot/inspection at each existing breakpoint shows no visual breakage (overflow, clipped text, broken grid) in the new section, especially around Box 4's longer content.

## 5. Test plan

- Full-page manual/automated render check confirming section order top-to-bottom: ... → "WHERE WE'VE COME FROM" → "VALUES" → (original next section) → ..., with no other sections reordered.
- Nav-link end-to-end check: click "Values" tab in a browser (or automated click test) and confirm it lands on/scrolls to the new "VALUES" section's exact `id`.
- Content verbatim check: automated text comparison of all six box headings/bodies (including bullet list and line breaks) against the spec's supplied text, run once all six are in place.
- Style parity check: compare computed CSS (border colours, fonts, padding, grid layout) of "VALUES" boxes against "WHAT WE OFFER" boxes to confirm identical class usage, not visual approximation.
- No-regression check: confirm "WHAT WE OFFER" (box count/order/content/style) and "WHERE WE'VE COME FROM" are byte-identical to their pre-change state.
- Cross-breakpoint smoke test across whatever breakpoints "WHAT WE OFFER" currently supports, confirming no new responsive work was needed and nothing visibly breaks.

## 6. Out of scope (carried from spec)

- Any change to wording, phrasing, punctuation, or line breaks of the six value texts or their headings.
- Any redesign/restyling of the box component (colours, fonts, spacing) — must be a straight reuse, not a new variant.
- Any change to the number, order, styling, or content of "WHAT WE OFFER" boxes.
- Any change to site navigation/menu markup itself, beyond confirming the existing "Values" link's href matches the new section's id.
- Reordering of any other existing sections besides inserting "VALUES" directly after "WHERE WE'VE COME FROM".
- Responsive/mobile-specific redesign work beyond what the reused box component already handles.
- Adding icons, images, animations, or other visual embellishment not already present in "WHAT WE OFFER" boxes.
- Localization/translation of the new content.