   # Spec: Case Studies page with sticky nav and enlarged logo

Status: draft
Job: 4bc05d6f-e783-43e8-a21e-807feef4dbc6
Target repo: SimonR67/sidney
Supersedes (partially): none — new capability (new page), plus modifications to the existing site-wide navigation component (currently non-sticky, with a smaller logo)

## 1. What should change and why

The site needs a new "Case Studies" page, linked from a new main menu item labelled "Case Studies", showcasing three case studies sourced from PDFs already stored in the repo's `case` folder (`ComixIT.pdf`, `Learning.pdf`, `Professional-Services.pdf`). The page should visually match the rest of the site (fonts, colours, spacing, section styling) and reuse the existing "three colour box" visual treatment from the "WHAT WE OFFER" section — but stretched to full page width, one box per case study, stacked vertically in the order: ComixIT, Learning, Professional-Services.

Content for each case study box must be the exact wording extracted from the corresponding PDF (no paraphrasing/rewriting), plus any graphics/images present in that PDF, recoloured/adapted to a papaya orange palette consistent with site branding while remaining recognisable versions of the originals.

Alongside this, two site-wide navigation improvements are requested and are to be delivered together with the new page since they affect the same component the new page links from:
1. The top nav becomes sticky/fixed so it stays visible on scroll, on every page of the site.
2. The SoftPapaya logo in the nav is enlarged by 60%, without breaking the nav layout or causing overlap with other nav items.

Interpretation choices made:
- "Same box/border/background/shadow treatment, just full width instead of three-across" is interpreted as: reuse the existing CSS/component styling for the offer boxes (border radius, border colour/width, background colour, box-shadow, padding, heading style) applied to a single-column, full-width container per case study, rather than building new box styling from scratch.
- "Exact wording" means text is copied verbatim from the PDFs, including headings/subheadings as they appear, only doing the minimum reformatting needed to render as HTML (e.g. converting PDF line breaks into paragraphs/lists sensibly) — not altering word choice, tone, or content.
- "Recolouring graphics to a papaya orange palette" means taking any diagrams/icons/photos embedded in the PDFs and producing edited/recoloured versions (e.g. hue-shifted or recoloured vector/raster assets) saved as new image files for the site — not simply tinting with a CSS overlay filter, unless a filter approach still results in a clean, recognisable, on-brand result. Either approach is acceptable as long as the result is recognisably derived from the original and uses papaya orange as the dominant accent colour.
- "Sticky nav on every page" means the fix is applied to the shared header/nav template/component so it applies site-wide, not just on the new Case Studies page.
- The 60% logo size increase is a size-only change (width/height or font-size if it's text-based), not a redesign of the logo mark itself.

## 2. Scope

- New page: "Case Studies" (new route/template, e.g. `/case-studies` or matching the site's existing URL/slug convention).
- New main navigation menu item labelled "Case Studies" linking to this new page, placed consistently with the styling/behaviour of existing menu items.
- Three full-width "boxes" on the Case Studies page, stacked vertically in this order:
  1. Case study from `case/ComixIT.pdf`
  2. Case study from `case/Learning.pdf`
  3. Case study from `case/Professional-Services.pdf`
- Each box:
  - Uses the same border, background colour, shadow, corner radius, internal padding/spacing, and heading/typography treatment as the existing three-column "WHAT WE OFFER" boxes, adapted to a full-width single-column layout.
  - Contains the verbatim text extracted from its source PDF (headings, body copy, any bullet points/lists as they appear in the PDF).
  - Contains recoloured (papaya orange palette) versions of any graphics/diagrams/images found in the source PDF, placed in a sensible position within the box (e.g. alongside or below the text, matching how images are handled elsewhere on the site).
  - If a given PDF contains no extractable images, that box simply contains text — no placeholder graphic is invented.
- Page-level styling (fonts, colours, section spacing/margins, overall page chrome) matches the rest of the site exactly, reusing existing shared CSS/design tokens rather than introducing new ones.
- Site-wide nav changes, applied via the shared header/nav component so they take effect on every page:
  - Nav bar becomes fixed/sticky to the top of the viewport on scroll, on all screen sizes the site currently supports.
  - Appropriate top-padding/margin added to page content site-wide so the now-fixed nav does not overlap/hide the top of page content on any existing page.
  - SoftPapaya logo image/element in the nav enlarged by 60% (dimensions scaled by 1.6x from current size).
  - Nav bar height/layout adjusted as needed so the larger logo does not overlap or push out other nav items (including the new "Case Studies" link) at existing supported breakpoints/screen widths.

## 3. Out of scope

- Any redesign of the overall site visual style, colour palette, typography, or the "WHAT WE OFFER" section itself beyond reusing its existing box styling.
- Editing, summarizing, correcting, or improving the wording extracted from the PDFs in any way — copy is used exactly as written, including any typos or awkward phrasing present in the source PDFs.
- Converting the case studies into interactive, filterable, or paginated content (e.g. tabs, carousels, "load more") — they are simply stacked statically on one page.
- Adding new case studies beyond the three named PDFs, or building a CMS/admin mechanism to add future case studies.
- Modifying the source PDFs themselves or the `case` folder structure.
- Redesigning the logo mark/artwork itself — only its displayed size changes.
- Making the nav collapse into a different mobile menu pattern (e.g. converting to a hamburger menu) unless one already exists and simply needs the sticky/logo changes applied to it as-is.
- General mobile-responsiveness overhaul of the site beyond what's needed to prevent the enlarged logo/sticky nav from breaking existing supported breakpoints.
- SEO, analytics, or metadata work for the new page beyond what the site already does automatically for other pages.
- Accessibility audit/remediation beyond not regressing current accessibility (e.g. not removing existing alt text conventions).

## 4. Edge cases and error behavior

- **PDF text extraction is imperfect (e.g. columns, tables, or unusual layout in the PDF garble on extraction):** the implementer should manually verify extracted text against the PDF visually and correct extraction artifacts (e.g. broken line wraps, misplaced characters) so the final on-page copy reads exactly as the human-readable PDF content — this is fixing extraction mechanics, not paraphrasing the wording itself.
- **A PDF contains no images, or images are decorative/low quality (e.g. a stock photo with no clear "recolour" target):** use judgement — recolour what can be meaningfully recoloured (icons, diagrams, illustrations); if an image is a photograph unsuitable for recolouring, it may be omitted from that box rather than forced into an unrecognisable edit.
- **A PDF fails to open/parse or is missing from the `case` folder:** the build should not silently publish a blank box — flag this back before the page ships, and that case study's box should not be marked "done" until content is available.
- **Existing pages with content close to the top of the viewport:** verify that after making the nav sticky, no page's heading or key content is hidden behind the fixed nav on load or on scroll.
- **Narrow/mobile viewports:** confirm the enlarged (1.6x) logo plus existing nav items still fit without wrapping awkwardly, overlapping, or triggering horizontal scroll; adjust nav bar height/spacing as needed rather than shrinking the logo back down.
- **Long case study text in one PDF vs. short text in another:** boxes are allowed to differ in height; no requirement to force equal heights across the three case study boxes.
- **Browsers without smooth `position: sticky`/`fixed` support:** not a concern for currently supported browsers targeted by the rest of the site; no special fallback is required beyond standard CSS sticky/fixed positioning.

## 5. Acceptance criteria

- [ ] A "Case Studies" link appears in the main menu on every page, styled consistently with other menu items, and navigates to the new Case Studies page.
- [ ] The Case Studies page displays three full-width boxes, stacked in the order: ComixIT, Learning, Professional Services.
- [ ] Each box visually matches the border/background/shadow/corner-radius/typography treatment of the existing "WHAT WE OFFER" boxes, scaled to full width.
- [ ] The text in each box matches the wording in the corresponding source PDF verbatim (spot-checked against the PDF by the reviewer).
- [ ] Each box includes recoloured (papaya-orange-dominant) versions of any extractable graphics from its source PDF, and these are recognisably derived from the originals.
- [ ] The Case Studies page's fonts, colours, and spacing are visually consistent with the rest of the site with no new one-off styles introduced.
- [ ] On every page of the site, the top navigation bar remains visible and fixed at the top of the viewport when scrolling down.
- [ ] Page content site-wide is not obscured by the now-fixed nav (adequate top spacing added).
- [ ] The SoftPapaya logo in the nav is visually ~60% larger than its current size.
- [ ] With the larger logo, no nav items overlap, get clipped, or wrap unexpectedly at the site's currently supported screen widths.
- [ ] No existing page's layout, styling, or functionality is broken by the nav changes.

## 6. Open questions

- What is the desired URL slug for the new page (e.g. `/case-studies`, `/case_studies`, `/casestudies`) — should it follow a specific existing convention on the site?
- Where exactly should the "Case Studies" menu item be positioned relative to existing menu items?
- Should each case study box include a heading/title (e.g. "ComixIT", "Learning", "Professional Services") above the extracted PDF content, or should the PDF's own title text (if present) serve as the heading?
- For image recolouring: is there an exact papaya orange hex value/brand palette reference to standardize on, or should the implementer pick a shade consistent with existing site accents?
- Should recoloured images be committed to the repo as new static assets (and if so, where), or generated/processed as part of a build step?
- Is a mobile hamburger/collapsed nav already in place elsewhere in the site that these nav changes need to account for, or is the current nav a simple horizontal bar at all screen sizes?
- Should the sticky nav have any visual change on scroll (e.g. added shadow/background opacity once scrolled), or should it look identical whether scrolled or not?