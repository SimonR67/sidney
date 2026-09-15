   # Spec: Add "Team" page and top navigation link

Status: draft
Job: 755b1c19-a364-4f06-bf29-a35998f8da76
Target repo: SimonR67/Sidney
Supersedes (partially): none — new capability

## 1. What should change and why

The site currently has no page introducing the team. This feature adds a new "Team" page (team.html) that showcases who works at the company, and adds a link to it in the top navigation so visitors can find it.

The request is fairly explicit, but a few interpretation calls were made:
- "Same style as existing nav links" means the new "Team" link reuses the existing nav link markup/CSS classes used by other top-menu items (e.g. Home, whatever links already exist), with no new nav styling.
- "Same overall page structure... as index.html" means team.html copies index.html's `<head>`, header, nav, footer, and general CSS includes/classes, rather than being a differently structured page.
- Since real team photos aren't available, placeholder image files are created and referenced now, named per-person, so they can be swapped later without touching HTML/CSS.
- Border color rotation for the avatar grid ("orange, lime, black... in rotation") is interpreted as cycling through the three existing brand border classes in that fixed order, repeating for all 10 team members (item 1=orange, 2=lime, 3=black, 4=orange, ...).

## 2. Scope

- **Navigation**: Add one new top nav link labeled "Team", using the existing nav link markup/class, pointing to `team.html`. Added in the same nav list as current links (position: appended, unless an existing convention dictates otherwise).
- **New file `team.html`**: Built by copying index.html's page shell — same `<head>` (title updated appropriately, e.g. "Team — Sidney"), same CSS/JS includes, same header/nav/footer markup so it renders visually consistent with the rest of the site.
- **Main title**: "MEET THE TEAM" using the exact same CSS class/structure as index.html's main title, split across two lines — "MEET" in default/black text, "THE TEAM" on the line below in the site's orange/papaya brand color (reusing the existing color class/style used for colored title text elsewhere on index.html).
- **Subtext**: A single paragraph directly under the title: "Engineers who know the context, talk to the client, and make decisions. No middlemen." Styled with whatever paragraph/subtext class is used under the main title on index.html (if one exists); otherwise plain paragraph text matching site body copy styling.
- **Top image (team1)**: Image at `/images/team/team1` (existing file, extension to match whatever is provided/added to the repo), styled with the same rounded-corner + border CSS class used for the "sofia" image in the "WHERE WE'VE COME FROM" section on index.html (reused, not duplicated).
- **Team avatar grid**: A responsive grid/row of 10 avatar boxes, one per team member, in the specified order (Simon Raitt–CEO, Jason Hill–COO, Pete Callaghan–CTO, Ania Balicka–Director, Slawek Panic–Principle Engineer, Grygorii L–Front End Lead, Marcin S–Back End Lead, Oskar S–Lead Engineer, Slaw–Lead Engineer and AI Lead, Marcin B–Mobile iOS and Android Lead Engineer).
  - Each box uses a placeholder image file, one per person, named `/images/team/placeholder-<firstname>-<lastname>.png` (lowercase, hyphenated, e.g. `placeholder-simon-raitt.png`, `placeholder-slawek-panic.png`, `placeholder-slaw.png` for the single-name entry, etc.).
  - Each avatar box has rounded corners and a border, cycling through the site's three existing brand border color classes (orange, lime, black) in that order across the 10 items, reusing existing CSS classes.
  - Each box has a caption underneath with the person's name and title/role (e.g. "Simon Raitt — CEO").
  - Grid is responsive (reuses existing site grid/row/column classes if present, e.g. a Bootstrap-style row/col structure already used elsewhere on the site).
- **Second image (team2)**: Image at `/images/team/team2`, placed below the avatar grid, styled with rounded corners and one of the three existing brand border color classes (any single one is acceptable — orange chosen as default unless reviewer prefers otherwise).
- **Banner image**: Image at `/images/team/banner`, placed at the very bottom of the page, below team2. No specific border/rounding requirement stated for this one — rendered as a plain full-width-style banner image consistent with how banner images (if any precedent exists on the site) are displayed; otherwise a plain `<img>` with no extra styling beyond basic responsive width.
- All new CSS needed (if any) is added minimally and only if no existing class covers a need; the default assumption is that title, subtext, image-border, and grid classes already exist in the site's stylesheet and will be reused as-is.

## 3. Out of scope

- Real photos/avatars for team members — placeholders only, actual images to be swapped in later without code changes.
- Any bio pages, individual profile links, modals, or click-through detail views for team members — names/titles as plain captions only.
- Any backend/CMS-driven team data — content is static HTML.
- Changes to the visual design system itself (no new title styles, no new border colors, no new grid system) — this feature only reuses what already exists.
- Reordering or restructuring the existing top navigation beyond adding the single "Team" link.
- Mobile-specific nav menu changes beyond whatever automatically happens by adding one more link into the existing responsive nav component.
- SEO metadata, analytics tagging, or accessibility audit work beyond carrying over whatever index.html already does by default (e.g. alt text will be added for images but no broader a11y pass is in scope).
- Image optimization/compression pipeline — provided images (team1, team2, banner, placeholders) are used as-is.
- Any animation, hover effects, or interactivity on the avatar grid beyond what the reused CSS classes already provide.

## 4. Edge cases and error behavior

- **Missing image files** (team1, team2, banner, or any placeholder): page should still render without breaking layout; broken image icon is acceptable at build time, but ideally all placeholder files are created as part of this work so this doesn't occur. Reviewer should confirm all image assets (team1, team2, banner, 10 placeholders) will be supplied/created before this ships.
- **Long names/titles**: captions should wrap gracefully within the avatar box rather than overflowing, using existing text/caption styling; no truncation logic is being added.
- **Uneven grid on last row** (10 items may not fill a full row depending on column count): acceptable to leave a partial/short final row — no special centering logic required unless the reused grid class already handles this.
- **CSS class doesn't actually exist for "sofia" image styling**: if inspection of index.html shows no clearly reusable class for that treatment, the closest existing bordered-image class on the site will be used instead, and this will be flagged back to the reviewer rather than a new class silently invented.
- **Nav link on pages other than index.html**: out of scope to verify/update nav on every other page in the site unless the nav is a shared include/partial; if nav is duplicated per-page (not a shared component), only index.html's nav and the new team.html's nav will be updated as part of this spec, and updating other pages' nav is flagged as a follow-up, not silently expanded into.

## 5. Acceptance criteria

- [ ] Top navigation on index.html (and team.html) shows a "Team" link styled identically to other nav links.
- [ ] Clicking the "Team" link navigates to `team.html`.
- [ ] team.html uses the same header, footer, nav, and CSS includes as index.html (visually consistent site chrome).
- [ ] team.html displays a two-line title: "MEET" (black) / "THE TEAM" (orange/papaya), using index.html's existing main-title CSS class.
- [ ] Subtext paragraph "Engineers who know the context, talk to the client, and make decisions. No middlemen." appears directly under the title.
- [ ] team1 image appears below the subtext, styled with the same rounded-corner/border class used for the "sofia" image on index.html.
- [ ] A grid of 10 avatar boxes appears below team1, in the exact specified order, each with a placeholder image, a name+title caption, and a rounded/bordered box styled with the site's brand colors cycling orange → lime → black → orange...
- [ ] All 10 placeholder image files exist at `/images/team/placeholder-<name>.png` (or agreed extension) and are correctly referenced.
- [ ] team2 image appears below the avatar grid with rounded corners and one brand border color.
- [ ] banner image appears at the very bottom of the page.
- [ ] No new CSS classes were introduced for title, subtext, or image-border styling where an existing equivalent class was available and reused.
- [ ] Page is responsive at common breakpoints (mobile/tablet/desktop) consistent with how index.html already behaves.

## 6. Open questions

- Do team1, team2, and banner image files already exist in the repo under `/images/team`, or do they need to be sourced/added as part of this work? Please confirm exact filenames/extensions.
- Is there a confirmed existing CSS class for the "sofia" image styling in the "WHERE WE'VE COME FROM" section that should be reused verbatim, or does this need to be identified during implementation?
- Is the nav a shared include/partial across all pages, or duplicated per HTML file? This affects whether adding the "Team" link needs to touch multiple files beyond index.html and team.html.
- What border color should team2 use specifically (orange/lime/black), or is any single one acceptable at implementer's discretion?
- Should the "Team" nav link be placed at the end of the existing nav list, or in a specific position (e.g. right after "About")?
- Is a Bootstrap-like grid/row/col system already in use on the site that the avatar grid should plug into, or does a new lightweight responsive grid need to be defined (while still reusing box/border/caption classes)?
- For the single-name team member "Slaw," is that the full display name intended (as opposed to a typo for "Slawek"), given "Slawek Panic" also appears separately in the list?