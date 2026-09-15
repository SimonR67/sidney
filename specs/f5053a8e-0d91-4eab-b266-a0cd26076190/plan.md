# Plan: Update TEAM page member entries and improve responsive layout

Status: draft
Job: f5053a8e-0d91-4eab-b266-a0cd26076190
Spec: https://github.com/SimonR67/sidney/blob/main/specs/f5053a8e-0d91-4eab-b266-a0cd26076190/spec.md

## 1. Definition of done

- The TEAM page shows "Paula S — Agile Delivery Lead" and "Nino A — Power BI and Data Analyst" in place of two identified placeholder entries, with all other entries, images, positions, and markup structure unchanged.
- The two placeholder entries chosen for replacement (and their positions) are confirmed/documented before implementation, resolving the open question in the spec.
- Team member card images use fluid sizing (no fixed pixel widths/heights that overflow small viewports).
- The team card container uses flexbox/grid with wrapping and/or media queries so cards reflow at mobile (~375–428px) and tablet (~768px) widths.
- Name/role text wraps correctly and is never clipped or overlapping at any tested viewport width.
- Desktop layout is visually unchanged (no regression) after the CSS updates.
- No JavaScript-based layout logic or fixed inline pixel dimensions are introduced.
- Manual visual verification has been performed at ~375px, ~414px, ~768px, and a standard desktop width (and a sub-375px width as a graceful-degradation spot check).

## 2. File map

| File | Change |
|---|---|
| TEAM page HTML/template (e.g. team.html or equivalent) | Update name/role text for the two identified placeholder entries; adjust markup only if required to support responsive CSS (e.g. wrapping classes) |
| TEAM page CSS (page-specific or shared stylesheet section for team cards) | Replace fixed-dimension image/card rules with fluid sizing; add flexbox/grid wrapping and media queries for mobile/tablet breakpoints; ensure text wrapping rules for name/role |
| Notes/decision log (spec open questions) | Record which two placeholder entries were chosen and confirmed, and the decision to keep existing placeholder images for Paula S and Nino A |

## 3. User journey

A visitor opens the TEAM page on a desktop browser and sees the existing grid of team member cards, now including "Paula S — Agile Delivery Lead" and "Nino A — Power BI and Data Analyst" alongside the unchanged existing members, each with their current placeholder/avatar image. The visitor then opens the same page on an iPhone-width browser (or resizes the browser to ~375–414px): instead of a clipped or horizontally-scrolling multi-column layout, the cards stack into a single column (or reduced columns), images resize to fit within their card without overflowing, and all name/role text remains fully visible and legible. Resizing to tablet width (~768px) shows an intermediate reflow (e.g. two columns) that still looks correct, and resizing back to desktop width confirms the original layout appearance is preserved.

## 4. Tasks

- [ ] 1. Identify and document the two placeholder entries to replace, per spec's edge-case guidance (most clearly generic/placeholder-labeled entries) — files: TEAM page HTML/template, notes/decision log — test: manual review confirms exactly two entries are flagged as placeholders and documented with their current position/order before any edit is made.
- [ ] 2. Update the first placeholder entry's name/role text to "Paula S — Agile Delivery Lead", keeping existing image and markup structure — files: TEAM page HTML/template — test: rendered page shows "Paula S" and "Agile Delivery Lead" text in the correct card position, with the same image asset as before and no other entries changed.
- [ ] 3. Update the second placeholder entry's name/role text to "Nino A — Power BI and Data Analyst", keeping existing image and markup structure — files: TEAM page HTML/template — test: rendered page shows "Nino A" and "Power BI and Data Analyst" text in the correct card position, with the same image asset as before and no other entries changed.
- [ ] 4. Verify no other team entries were altered — files: TEAM page HTML/template — test: diff of the TEAM page markup shows changes limited to the two targeted entries' name/role text (and any shared responsive-support markup from task 6), with all other entries byte-identical.
- [ ] 5. Update team member image CSS to use fluid sizing instead of fixed pixel dimensions — files: TEAM page CSS — test: at ~375px and ~414px viewport widths, images render within their card bounds with no overflow or horizontal scrollbar (manual browser devtools check).
- [ ] 6. Update the team card container CSS to use flexbox/grid with wrapping and add media queries for mobile (~375–428px) and tablet (~768px) breakpoints — files: TEAM page CSS, TEAM page HTML/template (only if wrapper classes are needed) — test: at ~375px/~414px cards stack to a single column (or reduced columns) and reflow without fixed multi-column desktop layout; at ~768px an intermediate layout renders correctly.
- [ ] 7. Add/adjust CSS rules for name and role text to wrap correctly within cards at small widths — files: TEAM page CSS — test: at ~375px, the "Power BI and Data Analyst" role text (and other long text) wraps within the card with no clipping, cutoff, or overlap.
- [ ] 8. Verify desktop layout is unchanged (no regression) after CSS updates — files: TEAM page CSS — test: at standard desktop width, take before/after comparison of the team section layout and confirm columns, spacing, and card appearance match the original design.
- [ ] 9. Manual cross-width verification pass — files: none (verification only) — test: visually check the TEAM page at ~375px, ~414px, ~768px, standard desktop width, and one sub-375px width, confirming all acceptance criteria (no overflow, correct reflow, legible text, no regression) are met at each.

## 5. Test plan

- Manual visual/browser-devtools review of the TEAM page at five representative widths (sub-375px, ~375px, ~414px, ~768px, standard desktop, e.g. 1280px+), confirming: no horizontal scroll, images scale within cards, cards reflow appropriately per breakpoint, and text is fully visible without clipping or overlap.
- Manual content check confirming "Paula S — Agile Delivery Lead" and "Nino A — Power BI and Data Analyst" appear correctly and that a full diff of the TEAM page shows no unintended changes to other team entries' names, roles, images, or ordering.
- Manual check that no JavaScript was introduced for layout/reflow and no fixed inline pixel dimensions remain on team images/cards.
- Side-by-side before/after screenshot comparison at desktop width to confirm no visual regression from the CSS changes.

## 6. Out of scope (carried from spec)

- Adding, removing, or reordering any other team member entries beyond the two specified replacements.
- Sourcing, uploading, or designing new profile photos for Paula S or Nino A.
- Any redesign of the TEAM page unrelated to responsiveness (e.g. new color scheme, new bios, social links, filtering/sorting).
- Responsive fixes to other pages of the site outside the TEAM page.
- Backend/CMS changes — assumes team member data is static content in page markup.
- Setting up an automated cross-browser/device visual-regression test suite.
- A full accessibility/WCAG compliance audit beyond what naturally results from the layout/scaling fix.