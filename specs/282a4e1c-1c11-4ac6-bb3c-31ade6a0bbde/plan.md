# Plan: Restore two team members on the TEAM page (Oskar S and Slaw)

Status: draft
Job: 282a4e1c-1c11-4ac6-bb3c-31ade6a0bbde
Spec: https://github.com/SimonR67/sidney/blob/main/specs/282a4e1c-1c11-4ac6-bb3c-31ade6a0bbde/spec.md

## 1. Definition of done

- The TEAM page renders exactly 12 team members, in the exact order specified in the spec.
- "Oskar S — Lead Engineer" appears at position 8 and "Slaw — Lead Engineer and AI Lead" appears at position 9.
- The two new entries use identical markup/CSS classes/avatar-fallback pattern as the other 10 entries.
- None of the other 10 existing team members' names, titles, or ordering are changed.
- No other page, component, or styling is modified.
- The page renders without layout breakage or console errors at existing supported breakpoints.

## 2. File map

| File | Change |
|---|---|
| (TEAM page source — template/HTML file or data file, e.g. `templates/team.html`, `pages/team.*`, or `_data/team.yml`/`.json`, to be confirmed by inspection) | Insert two new team member entries ("Oskar S" / "Lead Engineer" and "Slaw" / "Lead Engineer and AI Lead") at positions 8 and 9, or fill in existing placeholder entries reserved for these two members, using the same structure/fields as existing entries. |
| (any shared partial/component that renders a single team member card, if the site uses one, e.g. `components/TeamMember.*`) | No change expected — confirm it needs no modification since it's driven purely by data. |

## 3. User journey

A visitor navigates to the TEAM page on the website. Previously they saw 10 team member cards/entries. After this change, the same visitor sees 12 entries rendered in the same visual style (name + title, same card/list layout, same avatar/placeholder treatment for members without photos). Scrolling through the list in order, they see: Simon Raitt, Jason Hill, Pete Callaghan, Ania Balicka, Slawek Panic, Grygorii L, Marcin S, Oskar S, Slaw, Marcin B, Paula S, Nino A — with Oskar S and Slaw now appearing between Marcin S and Marcin B, matching the styling of every other entry. No other part of their experience on the site changes.

## 4. Tasks

- [ ] 1. Locate the TEAM page source (template/component/data file) that currently renders the 10 team members and determine whether it is hardcoded markup or data-driven — files: TEAM page source (to be identified during this task) — test: manual/documented confirmation of the exact file(s) and format (HTML list vs. JSON/YAML/CMS data) that drive the current 10-entry list; a snapshot of the current rendered list (10 entries, in current order) is captured as the baseline.
- [ ] 2. Check for literal placeholder elements (empty cards, commented-out entries, unused list items) reserved for two members in the located source — files: same TEAM page source — test: documented finding of whether placeholders exist; if found, confirm their position corresponds to slots 8 and 9 in the roster order.
- [ ] 3. Add/populate the "Oskar S — Lead Engineer" entry at position 8 in the list, using the same markup structure/CSS classes/avatar fallback as an existing entry (reusing a placeholder element if one exists from task 2, otherwise inserting a new entry) — files: TEAM page source — test: rendering the TEAM page shows a new entry with name "Oskar S" and title "Lead Engineer" at position 8, styled identically to adjacent entries (verified via DOM/snapshot comparison of classes/structure against another entry).
- [ ] 4. Add/populate the "Slaw — Lead Engineer and AI Lead" entry at position 9 in the list, immediately after Oskar S and before Marcin B, using the same markup pattern — files: TEAM page source — test: rendering the TEAM page shows a new entry with name "Slaw" and title "Lead Engineer and AI Lead" at position 9, styled identically to adjacent entries.
- [ ] 5. Verify the full ordered list of all 12 entries matches the spec exactly and that no other existing entry's name, title, or position changed — files: TEAM page source (verification only, no further edits expected) — test: an automated or manual list-order assertion comparing rendered team member names/titles (in order) against the 12-item roster from the spec, plus a diff confirming the original 10 entries are byte-for-byte unchanged aside from position renumbering caused by insertion.
- [ ] 6. Visual/layout regression check across supported breakpoints/devices — files: none (verification only) — test: manually or via existing visual regression tooling, confirm the TEAM page renders without layout breakage, misaligned cards, broken avatar placeholders, or console errors at each breakpoint currently supported by the page.

## 5. Test plan

- Render the TEAM page after all tasks are complete and assert the full ordered list of 12 names/titles matches the spec's roster exactly (position-by-position check).
- Diff the TEAM page source file(s) before/after the change to confirm only the two new entries were added/populated and no other entry's data or order was altered, and no other file in the repo was touched.
- Inspect rendered DOM/markup for the two new entries and confirm structural/class parity with at least one pre-existing entry (same tag structure, CSS classes, avatar/placeholder handling).
- Load the TEAM page at each breakpoint/device the site currently supports and confirm no layout breakage or console errors.
- Confirm no other page of the site was modified (repo-wide diff limited to the TEAM page source and, if applicable, its data file).

## 6. Out of scope (carried from spec)

- Adding, editing, or removing any team member other than Oskar S and Slaw.
- Changing the title/role text of any of the other 10 existing team members.
- Redesigning, restyling, or changing the layout/CSS of the TEAM page or team member cards/entries.
- Sourcing, uploading, or designing new profile photos for Oskar S or Slaw — only text placeholders/fallback avatars consistent with existing patterns are in scope.
- Adding biography text, social links, contact details, or any other metadata beyond name and title, unless already a standard field populated with reasonable placeholder/blank values.
- Any backend/CMS changes beyond the minimum needed to add these two static entries (no new admin UI, no database schema changes) unless the existing team list already requires it.
- Changes to any other page of the website.
- Reordering or renumbering any of the other 10 team members.