# Plan: New CAREERS Page

Status: draft
Job: 4f3c50ca-cd61-46ec-8aab-969cc72d95db
Spec: https://github.com/SimonR67/sidney/blob/main/specs/4f3c50ca-cd61-46ec-8aab-969cc72d95db/spec.md

## 1. Definition of done

- A CAREERS page exists at a sensible internal route, using the site's standard page layout (header/footer/nav).
- The main nav "CAREERS" item links to this new page (overwriting whatever it pointed to before).
- Title block, sub heading, four-box row, two-box row, "How it Works" section, and "CURRENT OPENINGS" section all render with the exact copy, colors, and structure specified.
- Rounded-box component is reused for all boxes (including the numbered steps), extended with a "lime" variant if it doesn't already exist.
- Box color assignment ensures no two adjacent boxes in a row share the same outline color.
- Layout is responsive: 4-box row and 2-box row reflow sensibly on mobile; "How it Works" boxes stack full-width.
- LinkedIn link renders with exact label text, points to a SoftPapaya company LinkedIn URL, opens in a new tab.
- No new colors, fonts, or one-off components introduced beyond what's needed to fill the lime-variant gap (if it exists).
- All acceptance criteria in the spec are satisfied.

## 2. File map

| File | Change |
|---|---|
| src/pages/careers.* (exact path/ext TBD per site's routing convention) | New CAREERS page component/route |
| src/components/RoundedBox.* (or equivalent existing component) | Extend with "lime" outline variant if not already supported |
| src/components/nav/MainNav.* (or equivalent) | Update "CAREERS" nav item href to point to new page route |
| src/content/careers.* (only if site has an existing CMS/content-data pattern for pages) | Hardcoded copy for the new page, following existing pattern |
| src/styles/careers.* (only if page-specific styling is needed beyond reused tokens) | Layout/spacing for the "How it Works" full-width orange section |
| tests/careers.spec.* | New test file(s) covering page rendering, nav link, and content |

## 3. User journey

A visitor clicks "CAREERS" in the main navigation menu from any page on the site. They land on the new CAREERS page, which opens with the header/footer/nav consistent with the rest of the site. They see the "CAREERS, GRAB A TICKET" title and "WHAT YOU GET. WHAT YOU DON'T" sub heading, then scroll through the four-box row (overtime, hybrid, salary ranges, B2B/UoP) and the two-box row (mentoring, collegiate teams), each in the site's familiar rounded-box outline style with varied orange/lime/black colors. Continuing down, they hit the full-width orange "How it Works HIRED IN ONE WEEK" section, reading the opening statement, the three numbered step boxes, and the closing feedback statement. Finally they reach "CURRENT OPENINGS," read the "send us your CV anyway" prompt, and can click "current vacancies here on LinkedIn" to open the SoftPapaya LinkedIn page in a new tab. On a mobile device, the same journey works with boxes stacking to single/reduced columns without overflow or broken box shapes.

## 4. Tasks

- [ ] 1. Investigate existing rounded-box component and current CAREERS nav destination — files: none (investigation only, findings recorded in task notes/PR description) — test: N/A (spike task); output is a short note confirming (a) whether a "lime" outline variant exists, (b) current CAREERS nav href, (c) site's route naming convention, (d) whether a CMS/content-data pattern exists for page copy.
- [ ] 2. Add "lime" outline variant to the rounded-box component, if missing — files: src/components/RoundedBox.* — test: unit/snapshot test rendering RoundedBox with `color="lime"` prop confirms correct outline color class/style applied.
- [ ] 3. Scaffold new CAREERS page route with standard layout (header/footer/nav) and empty body — files: src/pages/careers.* — test: route test/integration test asserting page is reachable via direct navigation and renders header, footer, and nav.
- [ ] 4. Update main nav "CAREERS" item to point to new route — files: src/components/nav/MainNav.* — test: test asserting the nav's "CAREERS" link element has `href` equal to the new page's route.
- [ ] 5. Implement title block and sub heading with correct copy and color split — files: src/pages/careers.* — test: test asserting rendered text "CAREERS, GRAB A TICKET" with "CAREERS" in orange class/style and "GRAB A TICKET" in black; same assertion pattern for sub heading.
- [ ] 6. Implement four-box row (Row A) with exact titles/copy and color-cycling rule — files: src/pages/careers.*, (uses RoundedBox) — test: test asserting all four boxes render with exact title/body text, correct 1/4-width desktop layout class, and no two adjacent boxes share an outline color.
- [ ] 7. Implement two-box row (Row B) with exact titles/copy and color-cycling rule — files: src/pages/careers.* — test: test asserting both boxes render with exact title/body text, 1/2-width desktop layout class, and differing outline colors from each other.
- [ ] 8. Implement responsive stacking behavior for Row A and Row B on mobile viewports — files: src/pages/careers.*, src/styles/careers.* (if needed) — test: viewport/responsive test (e.g. via CSS class assertions or visual regression) confirming boxes stack to full width / reduced columns below breakpoint without overflow.
- [ ] 9. Implement full-width "How it Works" section shell with orange background and heading — files: src/pages/careers.*, src/styles/careers.* — test: test asserting section has full-width/orange-background styling and heading text "How it Works HIRED IN ONE WEEK" renders.
- [ ] 10. Implement opening statement, three numbered step boxes (01/02/03), and closing statement inside "How it Works" section, in correct order — files: src/pages/careers.* — test: test asserting DOM order of opening statement → box 01 → box 02 → box 03 → closing statement, each with exact copy, and white/black text applied per spec.
- [ ] 11. Implement "CURRENT OPENINGS" section with sub text and LinkedIn link — files: src/pages/careers.* — test: test asserting sub text renders verbatim and a link with exact label "current vacancies here on LinkedIn" exists, has `target="_blank"`, and `href` points to a SoftPapaya LinkedIn URL.
- [ ] 12. Verbatim copy audit across the whole page (punctuation, quotation marks) — files: src/pages/careers.* — test: snapshot test comparing full rendered text content against the spec's copy blocks for exact string matches.
- [ ] 13. Cross-page consistency check: confirm no new colors/fonts/components introduced beyond the lime variant — files: n/a (review task, may touch src/pages/careers.* to remove any stray one-off styles) — test: manual/code review checklist item plus lint/style rule check if the codebase has a design-token lint rule.

## 5. Test plan

Beyond the per-task unit/component tests above:

- An end-to-end (or integration) test navigating from the homepage, clicking the main nav "CAREERS" item, and asserting the browser lands on the new CAREERS page with all major sections present (title, sub heading, Row A, Row B, How it Works, Current Openings).
- A full-page snapshot test of the CAREERS page at desktop width to catch structural/visual regressions in layout order and box color assignment.
- A responsive/viewport test suite run at a common mobile width (e.g. 375px) asserting all box rows stack correctly, text wraps without overflow, and the "How it Works" section remains full-width and legible.
- A manual/automated check with CSS disabled (or a graceful-degradation test) confirming all text content is still present and readable, per the edge-case requirement.
- A final manual QA pass comparing every string on the page against the spec's copy blocks, and confirming the LinkedIn link opens in a new tab to a real SoftPapaya URL.

## 6. Out of scope (carried from spec)

- Scraping, copying, or adapting any text, imagery, or layout markup directly from softpapaya.com/en/careers/ — reference-only for tone/structure.
- Building a job listings/applicant tracking system, application form, or CV upload functionality.
- Creating or verifying a real, confirmed-current LinkedIn URL with live vacancies — placeholder link only.
- Localization/translation of the new page into other languages.
- Any changes to other pages' content or other main navigation items beyond re-pointing "CAREERS".
- Building a new design system/component library from scratch (only the lime variant gap, if found, is addressed).
- SEO metadata strategy, analytics event tracking, or A/B testing for this page.
- Introducing a new CMS/content-authoring layer if one doesn't already exist — copy stays hardcoded per site convention.