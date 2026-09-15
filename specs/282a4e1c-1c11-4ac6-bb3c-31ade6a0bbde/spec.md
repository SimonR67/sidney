   # Spec: Restore two team members on the TEAM page (Oskar S and Slaw)

Status: draft
Job: 282a4e1c-1c11-4ac6-bb3c-31ade6a0bbde
Target repo: SimonR67/Sidney
Supersedes (partially): the current TEAM page team member list (existing team section markup/data on the site)

## 1. What should change and why

The TEAM page currently lists 10 team members, but two previously dropped members need to be added back so the page reflects the full, current 12-person roster. The request is to fill the two existing "placeholders" on the page with:

1. Oskar S — Lead Engineer
2. Slaw — Lead Engineer and AI Lead

Interpretation chosen: the request states the site should "fill the existing placeholders" — this is understood to mean there are two slots on the TEAM page (either empty/placeholder entries left from prior removal, or simply two missing entries that need to be inserted) that should be populated with these two people's name and title, using the same styling/markup pattern as the other 10 existing entries. If no literal placeholder elements exist in the current markup, the interpretation is to insert two new entries in the appropriate position(s) in the team list so the final rendered list matches the 12-person roster provided, in the order given:

1. Simon Raitt — CEO
2. Jason Hill — COO
3. Pete Callaghan — CTO
4. Ania Balicka — Director
5. Slawek Panic — Principle Engineer
6. Grygorii L — Front End Lead
7. Marcin S — Back End Lead
8. Oskar S — Lead Engineer
9. Slaw — Lead Engineer and AI Lead
10. Marcin B — Mobile iOS and Android Lead Engineer
11. Paula S — Agile Delivery Lead
12. Nino A — Power BI and Data Analyst

The problem this solves: the TEAM page is currently out of date / incomplete relative to the actual team roster, and this change brings it back in sync.

## 2. Scope

- Locate the existing TEAM page source (template, component, or data file that drives the team member list on the website).
- Add two new team member entries to that source:
  - Name: "Oskar S", Title: "Lead Engineer"
  - Name: "Slaw", Title: "Lead Engineer and AI Lead"
- Position these two entries in the list at positions 8 and 9 respectively, matching the order shown in the reference 12-person roster (i.e., after "Marcin S — Back End Lead" and before "Marcin B — Mobile iOS and Android Lead Engineer").
- Use the exact same HTML structure, CSS classes, image/avatar handling (if applicable — e.g., placeholder avatar or initials if no photo exists, matching how other members without unique photos are currently handled), and text formatting/markup pattern as the other 10 existing team member entries.
- If the site uses a photo/avatar per team member, use the same fallback/placeholder image mechanism already used elsewhere on the page for members without a dedicated photo (do not source or add new photos unless a mechanism already exists and is trivial to reuse).
- After the change, the TEAM page should render all 12 team members listed above, in that exact order.

## 3. Out of scope

- Adding, editing, or removing any team member other than Oskar S and Slaw.
- Changing the title/role text of any of the other 10 existing team members.
- Redesigning, restyling, or changing the layout/CSS of the TEAM page or team member cards/entries.
- Sourcing, uploading, or designing new profile photos for Oskar S or Slaw — only text placeholders/fallback avatars consistent with existing patterns are in scope.
- Adding biography text, social links, contact details, or any other metadata beyond name and title, unless that is already the standard field set shown for every other member (in which case those same fields should be populated with reasonable placeholder/blank values consistent with the rest of the list — see Open Questions).
- Any backend/CMS changes beyond the minimum needed to add these two static entries (e.g., no new admin UI, no database schema changes) unless the existing team list is already data-driven in a way that requires it.
- Changes to any other page of the website.
- Reordering or renumbering any of the other 10 team members.

## 4. Edge cases and error behavior

- If the TEAM page markup contains literal empty "placeholder" elements/slots (e.g., blank cards, commented-out entries, or unused list items) intended for exactly these two members, those should be reused/uncommented and populated rather than creating brand-new duplicate elements.
- If no such literal placeholders exist in the source, two new entries should be added following the exact same markup/data pattern as existing entries — this should not be treated as blocking; proceed with straightforward insertion.
- If the team list is data-driven (e.g., from a JSON/YAML/CMS data file) rather than hardcoded HTML, the two entries should be added to that data source in the correct order, not hardcoded separately in a template.
- If titles or names contain special characters/formatting inconsistent with other entries (none expected here — "Oskar S" and "Slaw" are plain text), no special escaping/handling beyond what's already used for other names is needed.
- No user input is involved in this feature (it's static content), so there is no invalid-input handling to define beyond correct data entry.
- No external dependency is required for this change; if the site pulls team data from an external API/CMS that is unavailable, that is a pre-existing site reliability concern and out of scope for this spec.

## 5. Acceptance criteria

- [ ] The TEAM page displays exactly 12 team members after the change.
- [ ] The list, in order, matches:
  1. Simon Raitt — CEO
  2. Jason Hill — COO
  3. Pete Callaghan — CTO
  4. Ania Balicka — Director
  5. Slawek Panic — Principle Engineer
  6. Grygorii L — Front End Lead
  7. Marcin S — Back End Lead
  8. Oskar S — Lead Engineer
  9. Slaw — Lead Engineer and AI Lead
  10. Marcin B — Mobile iOS and Android Lead Engineer
  11. Paula S — Agile Delivery Lead
  12. Nino A — Power BI and Data Analyst
- [ ] The new "Oskar S" and "Slaw" entries visually match the styling (font, spacing, card/list layout, avatar treatment) of the other 10 existing entries — no visual inconsistency or broken layout introduced.
- [ ] No existing team member's name, title, or position in the list is altered as a side effect of this change.
- [ ] No other part of the website is modified.
- [ ] The page renders correctly (no layout breakage, no console errors) on the same devices/breakpoints the TEAM page currently supports.

## 6. Open questions

- Does the TEAM page currently include a photo/avatar per team member? If so, what should be shown for Oskar S and Slaw (a generic placeholder avatar/initials, or should photos be sourced separately as a follow-up task)?
- Are there literal placeholder elements already in the TEAM page source/markup reserved for these two people (as implied by "fill the existing placeholders"), or is this list purely additive to a flat data source? Confirming this affects whether we're editing existing elements vs. inserting new ones.
- Is the team list hardcoded in a template/HTML file, or driven by a separate data file/CMS? This affects exactly where the change should be made.
- Should any additional fields beyond name/title (e.g., bio blurb, LinkedIn link, order/priority field) be populated for these two entries if the existing schema includes them, and if so, what content should be used (none was provided in the request)?