   # Spec: Update TEAM page member entries and improve responsive layout

Status: draft
Job: f5053a8e-0d91-4eab-b266-a0cd26076190
Target repo: SimonR67/Sidney
Supersedes (partially): TEAM page — existing placeholder team member entries and their associated layout/CSS

## 1. What should change and why

The TEAM page currently contains placeholder team member entries and a layout that appears to be fixed/desktop-only. This request has two parts:

1. Content update: Replace two placeholder team member entries with real team members:
   - Paula S — Agile Delivery Lead
   - Nino A — Power BI and Data Analyst

2. Responsiveness fix: The placeholder images and team member "boxes"/cards on the TEAM page do not render well on smaller screens (e.g. iPhone-width viewports). The layout should be updated to use responsive CSS (flexbox/grid with media queries, or intrinsically responsive sizing) so that images scale correctly and cards stack or resize appropriately on narrow viewports, rather than overflowing, clipping, or requiring horizontal scrolling.

Interpretation notes:
- "Replace two of the placeholder team member entries" is interpreted as: identify two existing placeholder entries on the TEAM page (name/role/image placeholders not yet tied to a real person) and swap in the name + role text given. No other placeholder entries should be modified as part of this change.
- No photos were supplied for Paula S or Nino A, so the existing placeholder image asset/styling for those two entries will be retained — only the name and role text change. If real photos exist and should be used, that's an open question (see Section 6).
- "Improve responsiveness" is interpreted as a CSS/layout-only change to the existing TEAM page markup — not a full visual redesign of the team section.

## 2. Scope

- Update the text content of two existing placeholder team member entries on the TEAM page:
  - Name: Paula S, Role: Agile Delivery Lead
  - Name: Nino A, Role: Power BI and Data Analyst
- These two entries keep their existing placeholder image (or generic avatar), position in the layout order, and existing markup structure unless changes are needed to support responsiveness.
- Audit and update the CSS for the TEAM page's member cards/images so that:
  - Images scale fluidly (e.g. `max-width: 100%; height: auto;` or similar) instead of using fixed pixel dimensions that overflow small viewports.
  - The card/grid container uses flexbox or CSS grid with wrapping, and/or media queries, so that cards reflow (e.g. from a multi-column row to a single column, or fewer columns) at common mobile breakpoints (e.g. ~375–428px width for iPhone-class devices, and standard tablet breakpoints as a reasonable middle ground).
  - Text (name/role) within each card remains legible and doesn't overflow or get cut off at small widths.
- Verify the fix visually/manually at a small number of representative viewport widths (e.g. ~375px, ~414px, ~768px, and standard desktop width).
- Changes are confined to the TEAM page's HTML/CSS (and any shared stylesheet rules it depends on for the team section).

## 3. Out of scope

- Adding, removing, or reordering any other team member entries beyond the two specified replacements.
- Sourcing, uploading, or designing new profile photos for Paula S or Nino A.
- Any redesign of the TEAM page unrelated to responsiveness (e.g. new color scheme, new bios, social links, filtering/sorting of team members).
- Responsive fixes to other pages of the site outside the TEAM page, even if they share similar layout patterns.
- Backend/CMS changes — this assumes team member data is currently static content in the page markup, not pulled from a database or CMS. If it turns out team data is dynamically sourced, that changes the implementation approach (see Open Questions).
- Automated cross-browser/device test suite setup — verification here is manual/visual, not a new automated visual-regression testing pipeline.
- Accessibility audit beyond what naturally falls out of fixing layout/scaling (e.g. this is not a full WCAG compliance pass).

## 4. Edge cases and error behavior

- If there are more or fewer than two obvious "placeholder" entries currently on the page (e.g. all entries are placeholders, or only one clearly reads as a placeholder), the two entries to replace should be chosen as the two most clearly generic/placeholder-labeled ones (e.g. "Team Member", "Placeholder Name", "TBD"); if it's ambiguous which two to pick, this should be flagged before implementation rather than guessed.
- If the placeholder image asset for the two replaced entries is missing or broken, use the existing site-wide fallback/default avatar rather than introducing a new image.
- On very narrow viewports (e.g. <375px, older/small phones), the layout should still degrade gracefully (single-column stacking) rather than breaking — this should be included in manual checks even though it's not the primary target width.
- On very wide viewports (large desktop), the responsive changes must not regress the existing desktop layout appearance.
- If long names or role titles cause text overflow at small widths (e.g. "Power BI and Data Analyst" wrapping awkwardly), text should wrap within the card rather than overflow or be clipped.
- If the TEAM page uses a CSS framework/grid system already, the fix should work within that system rather than introducing a conflicting new layout approach, where reasonably possible.

## 5. Acceptance criteria

- [ ] The TEAM page displays an entry "Paula S — Agile Delivery Lead" in place of one former placeholder entry.
- [ ] The TEAM page displays an entry "Nino A — Power BI and Data Analyst" in place of another former placeholder entry.
- [ ] No other existing team member entries' names, roles, or ordering are altered.
- [ ] At mobile viewport widths (e.g. ~375px and ~414px, representative of common iPhone sizes), team member images scale within their container without overflowing, clipping, or causing horizontal page scroll.
- [ ] At the same mobile widths, team member cards reflow (e.g. stack vertically or reduce column count) rather than remaining in a fixed multi-column desktop layout.
- [ ] At tablet width (e.g. ~768px) and standard desktop width, the layout still renders correctly (no regression from the responsive change).
- [ ] Name and role text remain fully visible and readable (no cutoff/overlap) at all tested widths.
- [ ] Responsive behavior is implemented via CSS (media queries and/or flexible grid/flexbox), not via JavaScript-based layout hacks or fixed inline pixel dimensions.

## 6. Open questions

- Which two specific placeholder entries on the current TEAM page should be replaced by Paula S and Nino A? Is there a preferred order/position for these two on the page?
- Should real profile photos be sourced for Paula S and Nino A, or is it acceptable to keep the current placeholder/default avatar image for these two entries indefinitely?
- Are there specific breakpoint widths the reviewer wants targeted explicitly (e.g. exact iPhone SE/13/Pro Max widths), or is a general mobile/tablet/desktop breakpoint set acceptable?
- Is team member data currently hardcoded in the TEAM page markup, or sourced from some data file/CMS? This affects how the content update should be implemented.