   # Spec: Add "VALUES" section to site, linked to existing "Values" nav tab

Status: draft
Job: e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce
Target repo: SimonR67/sidney
Supersedes (partially): none — new capability

## 1. What should change and why

The site's menu/navigation already contains a "Values" tab, but there is currently no corresponding "VALUES" section on the page for that tab to link to. This request adds that missing section so the nav link resolves to real content instead of a dead or unimplemented anchor.

The section must:
- Be titled "VALUES".
- Be placed immediately after the "WHERE WE'VE COME FROM" section in page order (i.e., directly below it, above whatever currently follows it).
- Contain six boxes, one per company value, using the exact verbatim heading/body text supplied in the request.
- Visually and structurally match the existing "WHAT WE OFFER" section's box component: same three-colour-scheme border treatment, same fonts, same box layout/markup pattern (grid/list structure, spacing, class naming conventions, etc.), just populated with new content.

Interpretation notes / ambiguity resolved:
- "Reuse the exact same box styling/component pattern" is interpreted as: reuse the actual existing CSS classes / component (not a visual approximation) so the boxes render identically in style to "WHAT WE OFFER" boxes, differing only in heading/body text and count (6 vs. whatever "WHAT WE OFFER" currently has).
- "Linked to the existing Values tab" is interpreted as: the new section's HTML id/anchor must exactly match whatever the "Values" nav tab already links to (e.g. `href="#values"` → `id="values"`), following the same naming convention used by the existing `id`s for "WHERE WE'VE COME FROM" and "WHAT WE OFFER" (this needs confirming against the actual markup — see Open Questions).

## 2. Scope

- Add a new section element to the relevant page template/HTML file, positioned immediately after the "WHERE WE'VE COME FROM" section and before whatever section currently follows it.
- Section heading: "VALUES" (styled consistently with the "WHERE WE'VE COME FROM" / "WHAT WE OFFER" section headings).
- Section id/anchor: set to whatever value the existing "Values" nav menu item already points to, matching the same id/anchor naming pattern used for the other two referenced sections.
- Six boxes inside the section, using the exact same box component/markup/CSS classes as used in "WHAT WE OFFER" (same border colour scheme rotation across the three colours, same fonts, same padding/layout structure).
- Box content (verbatim, no rewording, no truncation, preserve line breaks and bullet list in Box 4):

  1. **PEOPLE OVER PROCESS** — full body text as given.
  2. **NO OVERTIME CULTURE** — full body text as given.
  3. **SMALL TEAMS, BIG OWNERSHIP** — full body text as given.
  4. **GROWTH ON YOUR TERMS** — full body text as given, including the three bullet points exactly as listed.
  5. **TRANSPARENCY** — full body text as given.
  6. **RESPECT FOR TIME** — full body text as given.

- Verify that clicking the "Values" nav tab scrolls to / navigates to this new section correctly (i.e., the link already works once the anchor exists — no nav markup change should be needed beyond confirming the href matches).

## 3. Out of scope

- Any change to the wording, phrasing, punctuation, or line breaks of the six value texts or their headings — content must be inserted verbatim as supplied.
- Any redesign or restyling of the box component itself (colours, fonts, spacing) — must be a straight reuse of the existing "WHAT WE OFFER" box styling, not a new variant.
- Any change to the number, order, styling, or content of "WHAT WE OFFER" boxes.
- Any change to the site navigation/menu markup itself, beyond confirming the existing "Values" link's href matches the new section's id (if the href doesn't already exist or doesn't match, that's flagged as an open question, not silently changed).
- Reordering of any other existing sections besides inserting the new one directly after "WHERE WE'VE COME FROM".
- Responsive/mobile-specific redesign work beyond whatever the reused box component already handles.
- Adding icons, images, animations, or any other visual embellishment not already present in the "WHAT WE OFFER" boxes.
- Localization/translation of the new content.

## 4. Edge cases and error behavior

- **Nav link/anchor mismatch:** If the existing "Values" tab's href does not follow the same anchor-naming convention as "WHERE WE'VE COME FROM" / "WHAT WE OFFER" (e.g., it's already pointing somewhere unexpected, or doesn't exist yet), the new section's `id` must be set to match whatever the nav link actually expects — this should be confirmed against the current source, not assumed blindly from convention.
- **Box component reuse limits:** If the "WHAT WE OFFER" box component hard-codes a fixed number of boxes (e.g., 3) or a specific 1:1:1 colour assignment, the same colour-rotation logic must be extended/reused cleanly for 6 boxes rather than introducing new colours or breaking the rotation pattern.
- **Long body text overflow:** Box 4's body is noticeably longer than a typical "WHAT WE OFFER" box entry (includes a bulleted list). If the existing box component assumes short text and would visually break with longer content, this should be surfaced during implementation rather than silently truncating or restyling.
- **Missing dependency:** If "WHAT WE OFFER" itself does not currently exist in the codebase in the form described (i.e., no reusable box component/pattern is found), implementation should stop and flag this rather than inventing a new pattern that only superficially resembles it.

## 5. Acceptance criteria

- [ ] A "VALUES" section exists on the page, positioned immediately after "WHERE WE'VE COME FROM" and before the next existing section.
- [ ] The section's id/anchor matches exactly what the "Values" nav tab links to; clicking that nav tab navigates to this new section.
- [ ] The section contains exactly six boxes, in the order: PEOPLE OVER PROCESS, NO OVERTIME CULTURE, SMALL TEAMS BIG OWNERSHIP, GROWTH ON YOUR TERMS, TRANSPARENCY, RESPECT FOR TIME.
- [ ] Each box uses the exact same HTML/CSS class structure, border colour scheme, and fonts as the "WHAT WE OFFER" boxes.
- [ ] All heading and body text matches the verbatim text supplied in this spec, with no rewording, correction, or omission (including the bullet list in Box 4 and line breaks in the body copy).
- [ ] No existing content, styling, or markup in the "WHAT WE OFFER" or "WHERE WE'VE COME FROM" sections is altered.
- [ ] Page renders correctly with the new section on both desktop and whatever breakpoints the existing "WHAT WE OFFER" section already supports (no new responsive work required, but nothing should visibly break).

## 6. Open questions

1. What is the exact current `href` value of the "Values" nav tab, and does an anchor/id with that exact value already exist anywhere on the page? Please confirm before implementation so the new section's `id` is set correctly on the first pass.
2. What is the exact anchor/id naming convention used for "WHERE WE'VE COME FROM" and "WHAT WE OFFER" (e.g., kebab-case, camelCase, contains word "section")? This spec assumes the "Values" anchor should follow the same pattern — please confirm the actual strings.
3. Does the "WHAT WE OFFER" box component support an arbitrary number of boxes (6, not just its current count), and if it has a fixed 3-colour rotation, should that rotation simply repeat (1-2-3-1-2-3) across the six new boxes, or is there a preferred assignment?
4. Is there a specific column/grid layout expectation for six boxes (e.g., 3x2, 2x3, or a single column stack), or should it simply follow whatever the "WHAT WE OFFER" grid does natively when given more items?