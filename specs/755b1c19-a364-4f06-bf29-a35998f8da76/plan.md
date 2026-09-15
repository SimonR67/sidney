# Plan: Add "Team" page and top navigation link

Status: draft
Job: 755b1c19-a364-4f06-bf29-a35998f8da76
Spec: https://github.com/SimonR67/sidney/blob/main/specs/755b1c19-a364-4f06-bf29-a35998f8da76/spec.md

## 1. Definition of done

- Top nav on index.html and team.html shows a "Team" link, using the existing nav link markup/classes, pointing to `team.html`.
- `team.html` exists, reusing index.html's `<head>`, header, nav, footer, and CSS/JS includes verbatim (title updated to something like "Team — Sidney").
- Two-line main title renders: "MEET" (default/black) / "THE TEAM" (orange/papaya), using index.html's existing main-title class(es).
- Subtext paragraph "Engineers who know the context, talk to the client, and make decisions. No middlemen." appears directly under the title, using index.html's subtext class if one exists.
- `team1` image renders below the subtext using the same rounded-corner/border class as the "sofia" image from index.html's "WHERE WE'VE COME FROM" section.
- A 10-item avatar grid renders in the exact specified order, each item showing a placeholder image, a rounded/bordered box (border cycling orange → lime → black → orange...), and a name+title caption.
- All 10 placeholder image files exist under `/images/team/placeholder-<firstname>-<lastname>.png` and are correctly referenced (including the "Slaw" single-name case).
- `team2` image renders below the grid with rounded corners and one brand border color (orange, per spec default).
- `banner` image renders at the very bottom of the page with no special border/rounding, just responsive width.
- No new CSS classes introduced for title, subtext, image-border, or grid where an existing class already covers the need.
- Page is visually responsive consistent with index.html at existing breakpoints.
- Open questions from the spec (image assets provided, sofia class identity, nav shared/duplicated, team2 border color, nav link position, grid system, "Slaw" naming) are resolved/confirmed before or during implementation, and any assumption made is flagged in the PR description rather than silently decided.

## 2. File map

| File | Change |
|---|---|
| index.html | Add "Team" nav link (existing markup/class) to the nav list, appended at the end unless existing convention says otherwise |
| team.html | New file — copy of index.html's page shell (head/header/nav/footer/CSS-JS includes), with new title, subtext, team1 image, 10-item avatar grid, team2 image, and banner image |
| images/team/team1.\* | New/placeholder image file (extension confirmed with reviewer) |
| images/team/team2.\* | New/placeholder image file |
| images/team/banner.\* | New/placeholder image file |
| images/team/placeholder-simon-raitt.png | New placeholder avatar image |
| images/team/placeholder-jason-hill.png | New placeholder avatar image |
| images/team/placeholder-pete-callaghan.png | New placeholder avatar image |
| images/team/placeholder-ania-balicka.png | New placeholder avatar image |
| images/team/placeholder-slawek-panic.png | New placeholder avatar image |
| images/team/placeholder-grygorii-l.png | New placeholder avatar image |
| images/team/placeholder-marcin-s.png | New placeholder avatar image |
| images/team/placeholder-oskar-s.png | New placeholder avatar image |
| images/team/placeholder-slaw.png | New placeholder avatar image (single-name entry) |
| images/team/placeholder-marcin-b.png | New placeholder avatar image |
| css/*.css (only if a genuine gap is found) | Minimal addition only if no existing class covers a needed style (expected: none required) |

## 3. User journey

1. A visitor lands on `index.html` and sees the top navigation bar, which now includes a "Team" link styled the same as "Home" and other existing links.
2. The visitor clicks "Team" and is taken to `team.html`.
3. `team.html` loads with the same header, nav, and footer as the rest of the site, so it feels visually consistent.
4. The visitor sees the page title "MEET" in black and "THE TEAM" in orange underneath, followed by the subtext explaining the team's engineering-first philosophy.
5. Below that, the `team1` image appears, styled the same way as the "sofia" image elsewhere on the site.
6. The visitor scrolls down to see a grid of 10 team member avatar boxes, each with a placeholder photo, a colored border (cycling orange/lime/black), and a caption showing the person's name and role, in the specified order from CEO down to Mobile Lead Engineer.
7. Below the grid, the `team2` image appears with rounded corners and a brand border color.
8. At the very bottom of the page, the `banner` image appears full-width with no extra styling.
9. On a different viewport size (mobile/tablet), the visitor sees the same page reflow responsively, consistent with how index.html already behaves, including the nav collapsing/expanding as it currently does with the new "Team" link included.

## 4. Tasks

- [ ] 1. Confirm/resolve spec open questions with reviewer (image asset availability/extensions, "sofia" class identity, nav shared-vs-duplicated, team2 border color, nav link position, grid system in use, "Slaw" naming) before writing code — files: none (communication only) — test: written confirmation captured in PR description/spec addendum before task 2 begins
- [ ] 2. Add "Team" nav link to index.html — files: index.html — test: manual/DOM check that a new `<a>` with existing nav-link class and `href="team.html"` appears in the nav list alongside existing links, and existing links are unchanged
- [ ] 3. Scaffold `team.html` by copying index.html's `<head>`, header, nav, footer, and CSS/JS includes; update `<title>` — files: team.html — test: diff shows head/header/nav/footer/includes match index.html except for title text and page-specific body content; nav includes the new "Team" link
- [ ] 4. Add two-line main title "MEET" / "THE TEAM" using index.html's main-title class/structure, with "THE TEAM" using the existing orange/papaya color class — files: team.html — test: rendered HTML shows both lines with the same classes as index.html's main title, and "THE TEAM" carries the brand color class
- [ ] 5. Add subtext paragraph directly under the title — files: team.html — test: paragraph text matches spec exactly ("Engineers who know the context, talk to the client, and make decisions. No middlemen.") and uses index.html's subtext class if one exists, else plain body-copy class
- [ ] 6. Add `team1` image using the same class as the "sofia" image from index.html's "WHERE WE'VE COME FROM" section — files: team.html, images/team/team1.\* — test: image tag's class attribute matches sofia image's class exactly; image file exists at referenced path and loads without 404
- [ ] 7. Create 10 placeholder avatar image files with correct naming convention — files: images/team/placeholder-\*.png (10 files) — test: each filename matches spec's naming pattern (lowercase, hyphenated, matching each team member, including `placeholder-slaw.png`), and all 10 files exist in the repo
- [ ] 8. Build the 10-item avatar grid in team.html with correct order, per-item border class cycling orange→lime→black, name+title captions, and reused grid/row/col classes — files: team.html — test: rendered HTML has exactly 10 grid items in the exact specified order, each referencing the correct placeholder image, each with the correct border class per the 1-indexed rotation (item1=orange, item2=lime, item3=black, item4=orange, ...), and each caption text matches "Name — Title" format
- [ ] 9. Add `team2` image below the grid with rounded corners and orange (or reviewer-confirmed) border class — files: team.html, images/team/team2.\* — test: image tag has rounded-corner + one brand border class; image file exists and loads
- [ ] 10. Add `banner` image at the very bottom of the page with no border/rounding, plain responsive `<img>` — files: team.html, images/team/banner.\* — test: image appears after team2 in DOM order, has no border/rounded class, has basic responsive width styling consistent with site conventions; image file exists and loads
- [ ] 11. Add alt text to all new images (team1, team2, banner, 10 placeholders) — files: team.html — test: every `<img>` tag added in this feature has a non-empty, descriptive `alt` attribute
- [ ] 12. Visual/responsive review pass across mobile/tablet/desktop breakpoints — files: team.html (fixes only, no new classes) — test: manual check at common breakpoints confirms nav, title, images, and grid reflow the same way index.html's equivalent elements do, with no layout breakage

## 5. Test plan

- Manual visual review of `team.html` side-by-side with `index.html` at desktop, tablet, and mobile breakpoints to confirm shared header/nav/footer render identically and the new page content doesn't break site chrome.
- Click-through check: from index.html, click "Team" nav link and confirm navigation to `team.html`; confirm the same "Team" link exists and works from within `team.html` itself (nav present on both pages).
- DOM/asset audit: verify all 13 new image references (team1, team2, banner, 10 placeholders) resolve to existing files with no 404s, and no image is missing alt text.
- Class-reuse audit: grep team.html for any newly introduced CSS class names; confirm each class used for title, subtext, image borders, and grid/row/col also appears in index.html for the equivalent element (i.e., nothing new was invented).
- Order/content check: confirm the 10 avatar items appear in the exact order and with the exact name/title captions specified in section 2 of the spec, and border classes follow the orange/lime/black rotation exactly (item 1=orange ... item 10=orange, since 10 mod 3 = 1).
- Confirm no other HTML pages in the repo were modified unless the nav was found to be a shared include (per resolved open question in Task 1).

## 6. Out of scope (carried from spec)

- Real photos/avatars for team members — placeholders only.
- Bio pages, individual profile links, modals, or click-through detail views for team members.
- Backend/CMS-driven team data — content stays static HTML.
- Any new visual design system elements (new title styles, new border colors, new grid system) — only existing styles are reused.
- Reordering or restructuring the existing top navigation beyond appending the single "Team" link.
- Mobile-specific nav menu changes beyond what happens automatically from adding one more link into the existing responsive nav component.
- SEO metadata, analytics tagging, or accessibility audit work beyond carrying over index.html's existing defaults (only image alt text is added).
- Image optimization/compression pipeline — provided/placeholder images used as-is.
- Animation, hover effects, or interactivity on the avatar grid beyond what reused CSS classes already provide.
- Updating nav on any other pages beyond index.html and team.html, unless nav is confirmed to be a shared include/partial (flagged as follow-up otherwise).