   # Spec: Homepage content, styling, and "What We Offer" section overhaul

Status: draft
Job: 7931a152-83fe-4f91-8093-e167e642681a
Target repo: SimonR67/sidney
Supersedes (partially): The existing homepage hero headline styling, the intro paragraph under the headline, the top-left "Softpapaya" text site title, and the existing 8-box "WHAT WE OFFER" section markup/content.

## 1. What should change and why

The site owner wants to refresh the homepage messaging and visual branding, and to consolidate the "WHAT WE OFFER" section from 8 boxes down to 6 boxes with clearer, more accurate service descriptions and consistent colour-coded styling. Specifically:

1. In the main headline "WHAT WE DO. AND WE DO IT REALLY WELL.", the substring "REALLY WELL" should be recoloured to Papaya (#E56717), with the rest of the headline remaining black. This is a partial-text-colour styling change within an existing headline element.
2. The paragraph beneath the headline should be replaced with new copy describing the business more accurately (locations, service model, team offering).
3. The top-left site title, currently rendered as the plain text "Softpapaya", should be replaced with an existing image asset already committed to the repo (`Softpapaya-logo.png`), referenced in place rather than re-uploaded as a new file.
4. The "WHAT WE OFFER" section's 8 existing boxes should be entirely removed and replaced with 6 new boxes, each with a coloured outline/border following a fixed rotating colour sequence (Papaya, Lime, Black, Black, Papaya, Lime), new titles/content as specified by the user, and small tag/skill mini-buttons recoloured to match each box's outline colour.

No interpretation ambiguity on the text/content changes — the user supplied exact copy. One interpretation was needed for Lime: since no existing "lime" design token was found described in the request, the standard lime green **#A6CE39** will be used as the source of truth, unless a project reviewer identifies an existing lime token in the codebase during implementation (see Open Questions).

## 2. Scope

- Change the CSS/inline styling (or introduce a `<span>`/equivalent) around "REALLY WELL" in the hero headline so only that text renders in Papaya (#E56717); the remainder of the headline stays black (existing colour, unchanged).
- Replace the full text of the paragraph currently under the headline with the new provided paragraph, exactly as written. No other paragraphs on the page are touched.
- Remove the plain-text site title "Softpapaya" from the top-left of the page/header and replace it with an `<img>` (or equivalent component) referencing the existing repo file `Softpapaya-logo.png`. The image should be sized/positioned appropriately to sit in place of the old text title, using existing header layout conventions (e.g. same container, comparable height to previous text, appropriate alt text such as "Softpapaya").
- Remove all 8 existing boxes in the "WHAT WE OFFER" section, along with their content, from the DOM/template/component source.
- Add exactly 6 new boxes in the same section, in the exact order and with the exact titles/content specified below, reusing the existing grid/card layout styling/classes/components used elsewhere on the site (i.e. don't invent a new grid system — extend the current one).
- Apply outline/border colours to each box in this exact rotating order:
  1. C-Suite Advisory — Papaya (#E56717)
  2. Software Development — Lime (#A6CE39, or existing lime token if confirmed to exist)
  3. Subject Matter Expertise — Black
  4. Data, AI & Automation — Black
  5. UI/UX Design and Rapid POC — Papaya (#E56717)
  6. Technology Teams & Resourcing — Lime (#A6CE39, or existing lime token if confirmed to exist)
- For each box, add small grey "skill/tag" mini-buttons only where sensible/relevant to that box's content (e.g. Software Development → TypeScript, Java, Python, React; C-Suite Advisory → Roadmap, Governance, CTO Advisory; Subject Matter Expertise → Code Review, Augmentation; Data, AI & Automation → LLMs, AI Agents, Data Architecture; UI/UX Design and Rapid POC → Figma, Design Systems, POC; Technology Teams & Resourcing → Staffing, Nearshore, Contract). Exact tag wording is at implementer's discretion where not explicitly given by the user, but must be topically relevant to each box's stated content.
- Recolour each box's mini-buttons/tags to match that box's own outline colour (not grey), replacing the current grey styling for these specific tag elements only.
- Preserve existing responsive/grid layout behavior (column counts, spacing, breakpoints) used by the current 8-box layout, just applied to 6 boxes instead of 8.

## 3. Out of scope

- No changes to any other page/section of the site beyond the headline, the paragraph directly beneath it, the top-left site title, and the "WHAT WE OFFER" boxes.
- No changes to navigation, footer, other CTAs, or unrelated copy elsewhere on the homepage.
- No redesign of the overall grid/layout system — the existing grid/card component conventions must be reused, not replaced.
- No changes to the `Softpapaya-logo.png` file itself (no re-export, resize, recolour, or re-upload) — it is used as-is from its existing location in the repo.
- No introduction of a formal design-token/theme system for colours unless one already exists — colours are applied directly (hex values) unless an existing lime/papaya/black token is discovered in the codebase, in which case that token should be reused for consistency.
- No SEO, accessibility audit, or performance optimization work beyond adding reasonable `alt` text for the new logo image.
- No changes to mobile menu, header sticky behavior, or other header functionality — only the title text→image swap.
- No copy changes to any box tags/skills beyond what's needed to reflect the 6 new boxes (i.e. not preserving old tags from the 8-box version unless they're still topically relevant).

## 4. Edge cases and error behavior

- **Missing/broken image asset**: If `Softpapaya-logo.png` is not found at the expected path at build time, this should be surfaced as a build/lint error rather than silently rendering a broken image icon; implementer should confirm the file's actual path in the repo before wiring the reference.
- **Long tag/box content on small screens**: Mini-buttons and box copy should wrap gracefully within the existing card/grid responsive behavior; no fixed-width overflow should be introduced by longer copy in the new boxes (some new paragraphs are noticeably longer than the old 8-box copy).
- **Colour contrast**: Papaya and Lime outline/tag colours on a white/light background must remain visually distinguishable and text within tags must remain legible (sufficient contrast) — if the exact lime hex given by the user creates a contrast/legibility problem, implementer should flag it rather than silently deviating from spec.
- **No existing lime token found**: If, during implementation, no existing lime design token is found in the codebase, default to `#A6CE39` as specified. If one IS found, prefer it and note the substitution in the PR description.
- **Odd box count in grid**: Moving from 8 to 6 boxes may change how the grid balances across rows depending on current column count (e.g. 4-column grid: 8 boxes = 2 full rows, 6 boxes = 1.5 rows). Implementer should confirm current grid column count and ensure 6 boxes render without an obviously unbalanced trailing row, using the existing grid's built-in behavior rather than custom fixes.

## 5. Acceptance criteria

- [ ] On the homepage hero, the text "REALLY WELL" within the main headline renders in colour #E56717 (Papaya); all other characters in that headline remain black.
- [ ] The paragraph beneath the headline exactly matches the new provided text, replacing the old paragraph in full.
- [ ] The top-left site title no longer renders the text string "Softpapaya" as visible text; it instead renders the `Softpapaya-logo.png` image, sourced from its existing path in the repo (not a newly added/duplicated file).
- [ ] The "WHAT WE OFFER" section contains exactly 6 boxes and zero remnants of the previous 8-box content (no leftover DOM nodes, dead CSS classes tied only to the old boxes, or orphaned copy).
- [ ] The 6 boxes appear in this exact order with these exact titles and body copy: C-Suite Advisory, Software Development, Subject Matter Expertise, Data, AI & Automation, UI/UX Design and Rapid POC, Technology Teams & Resourcing — each matching the content block given in the request verbatim.
- [ ] Box outline colours follow the exact sequence: Papaya, Lime, Black, Black, Papaya, Lime (boxes 1–6 respectively).
- [ ] Each box's mini tag/skill buttons (where present) are coloured to match that specific box's outline colour, not left grey.
- [ ] Tags shown per box are topically relevant to that box's stated content.
- [ ] The 6-box section reuses the existing grid/card layout styling conventions (spacing, responsive breakpoints, card shape) rather than introducing a new layout pattern.
- [ ] Page renders correctly (no layout breakage, no console errors) on at least one desktop and one mobile viewport size after all changes.

## 6. Open questions

- Does an existing "lime" or "papaya" colour design token/CSS variable already exist in the codebase (e.g. in a theme file, Tailwind config, or shared CSS)? If so, it should be reused instead of hardcoding `#A6CE39` — please confirm during implementation and update the spec/PR notes accordingly.
- What is the exact current file path of `Softpapaya-logo.png` in the repo, and does it need any wrapping (e.g. link back to homepage) to match the previous text title's behavior (was "Softpapaya" text a clickable home link)?
- Should the new logo image have a fixed max-height to match the vertical rhythm of the header, or should it scale fluidly? Any existing header height constraints to respect?
- For the mini tag/skill buttons — should exact tag wording per box be finalized by the reviewer/user before implementation, or is implementer's discretion (as listed in Scope) acceptable?
- Is "Black" outline meant to be pure `#000000`, or should it match a specific existing near-black token already used elsewhere on the site (e.g. a dark grey/charcoal used for borders elsewhere)?