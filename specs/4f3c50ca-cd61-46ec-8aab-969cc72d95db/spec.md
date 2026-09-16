   # Spec: New CAREERS Page

Status: draft
Job: 4f3c50ca-cd61-46ec-8aab-969cc72d95db
Target repo: SimonR67/sidney
Supersedes (partially): none — new capability (adds a new page and wires up an existing nav item that currently has no destination, or currently points elsewhere)

## 1. What should change and why

The site needs a new CAREERS page that explains what it's like to work at the company, using the exact copy supplied by the requester. The existing "CAREERS" item in the main navigation menu should link to this new page instead of wherever it currently points (or nowhere, if it's currently a dead link/placeholder).

The page should reuse the site's existing visual design system — the rounded-box outline style already used elsewhere on the site, cycling through the three established outline colors (orange, lime, black) — so the new page feels native rather than bolted on. https://softpapaya.com/en/careers/ is supplied only as a structural/tonal reference (section order, general "no corporate nonsense" tone); it must NOT be scraped, copied, or used as a source of copy — all content is specified verbatim below and must be used as-is.

Interpretation notes (ambiguity resolved):
- "Rounded box" styling is assumed to be an existing, reusable component/pattern already present in the codebase (used on the homepage or elsewhere). This spec assumes that component exists and can be reused/extended with a color prop (orange/lime/black), rather than requiring a brand-new component system to be invented from scratch. If no such reusable component exists, this needs to be flagged before implementation (see Open Questions).
- "Alternating/using the three outline colors to maintain visual variety" is interpreted as: assign colors across the boxes such that no two adjacent boxes in a row share the same outline color, but there is no strict repeating pattern mandated (e.g. it does not have to be strictly orange-lime-black-orange).
- The "How it Works" full-width section uses an orange (papaya) filled background (not just an orange outline), distinguishing it visually from the outlined content boxes above it. Text on this section is white and black as specified, in a "balanced layout" — interpreted as a clean, centered/structured layout consistent with the rest of the site's spacing conventions, left to normal design judgment within that constraint.
- The LinkedIn link is explicitly a placeholder/future link — it should point to the SoftPapaya company LinkedIn page (best available current URL), understanding that the actual "current vacancies" URL may need to be updated later when real job postings exist.

## 2. Scope

In scope:

1. **New page**: A new CAREERS page/route added to the site, built with the site's existing page/layout conventions (header, footer, global nav, etc. all present as on other pages).

2. **Navigation wiring**: The existing "CAREERS" main menu item updated to link to this new page.

3. **Page title block** (top of page):
   - Text: "CAREERS, GRAB A TICKET"
   - "CAREERS" styled in orange (site's existing orange), "GRAB A TICKET" styled in black.

4. **Sub heading** (below title):
   - Text: "WHAT YOU GET. WHAT YOU DON'T"
   - "WHAT YOU GET." in orange, "WHAT YOU DON'T" in black.

5. **Content boxes section** using the existing rounded-box outline component, colors cycling through orange/lime/black for visual variety:
   - Row A — four boxes, each ~1/4 desktop width, stacking to full width (likely 1 or 2 per row) on mobile:
     - "OVERTIME NOT HERE" — "You stay late only when you want to. No "urgent" tasks at 6pm. No weekend emails. Your time off is your time off."
     - "HYBRID" — "Office-based team with remote flexibility. Our office is in central Wrocław - come in for the energy, work from home when you need focus. We are also in the UK and Sofia, Bulgaria."
     - "SALARY RANGES UPFRONT" — "We don't play the "we'll share after the first meeting" game. Ranges are in the listing. We respect your time and ours."
     - "B2B AND UOP" — "Both options, fair rates, no tricks. You pick the form."
   - Row B — two boxes, each ~1/2 desktop width, stacking to full width on mobile:
     - "MENTORING" — "Senior engineers mentor - it's not optional, it's how we work. If you're a junior or mid, you'll have someone to learn from. If you're a senior, we expect you'll share what you know."
     - "COLLEGIATE TEAMS" — "Direct client contact. Decisions are made by you and your team."

6. **Full-width "How it Works" section**:
   - Heading: "How it Works HIRED IN ONE WEEK"
   - Orange (papaya) full-bleed/full-width background, white and black text.
   - Opening statement: "We respect your time. The entire process usually takes 5-7 business days."
   - Vertical stack of full-width row boxes:
     - "01 INTRO CALL (30 MIN)" — "We get to know each other. We tell you about the company, you tell us about yourself. No trick questions, no whiteboard, no "where do you see yourself in 5 years.""
     - "02 TECHNICAL CONVERSATION (60 MIN)" — "We discuss architecture, trade-offs, your experience. It's a conversation, not an interrogation."
     - "03 OFFER" — "Good fit? Offer within 2 business days. No "we'll get back to you next month.""
   - Closing statement, at the end of the section: "We give feedback to every candidate, no matter what. If you didn't get through, you'll know why."

7. **"CURRENT OPENINGS" section**:
   - Sub text: "Nothing catch your eye? Send us your CV anyway."
   - A link with the visible text "current vacancies here on LinkedIn", pointing to the SoftPapaya company LinkedIn page (placeholder/best-known URL, opens in a new tab).

8. Responsive behavior: all box rows must reflow/stack sensibly on mobile (single column or reduced columns), consistent with how existing box sections on the site already respond to smaller viewports.

9. Reuse of existing typography scale, spacing units, and color tokens (orange, lime, black) already defined in the site's design system/CSS — no new colors or fonts introduced.

## 3. Out of scope

- Scraping, copying, or adapting any text, imagery, or layout markup directly from softpapaya.com/en/careers/. It is reference-only for tone/structure; all copy is fixed and provided above.
- Building an actual job listings / applicant tracking system, application form, or CV upload functionality. The only interactive element is a link out to LinkedIn.
- Creating or sourcing a real, verified LinkedIn URL with confirmed current vacancies — this is explicitly a placeholder link to the company LinkedIn page, not a guarantee of live job postings.
- Localization/translation of the new page into other languages (even though the reference site is in "/en/").
- Any changes to other pages' content or the rest of the main navigation menu beyond re-pointing the single "CAREERS" item.
- Building a new design system/component library from scratch — this spec assumes the rounded-box outline component and orange/lime/black tokens already exist and are reused, not reinvented.
- SEO metadata strategy, analytics event tracking, or A/B testing for this page.
- CMS/editable-content tooling — copy is hardcoded per this spec unless the site already has a CMS pattern in place for other pages, in which case this page should follow that same pattern for consistency (not introduce a new one).

## 4. Edge cases and error behavior

- **LinkedIn link unavailable / 404**: If the placeholder LinkedIn URL is wrong or the page is removed, the link should still render as normal text/link (no broken-link styling requirement beyond standard browser behavior); this is acceptable since it's explicitly marked as a placeholder to be revisited.
- **Very long content on narrow screens**: Box copy (e.g., the longer "HYBRID" or "SALARY RANGES UPFRONT" text) must wrap normally within the rounded box on mobile widths without overflowing or breaking the box border/shape.
- **Missing rounded-box component variant**: If the existing box component does not currently support a "lime" outline variant (only orange/black used elsewhere, for example), this must be surfaced as a blocker/question before implementation rather than silently approximated.
- **Nav link currently pointing elsewhere**: If "CAREERS" in the main menu currently links to an external URL or an existing placeholder page, that destination is deliberately overwritten to point to this new internal page; no redirect needs to be preserved for the old destination.
- **JS/CSS disabled or slow-loading assets**: Page must degrade gracefully (content still readable, boxes still legible) even if any decorative styling fails to load, consistent with how the rest of the site handles this.

## 5. Acceptance criteria

- [ ] A new CAREERS page exists at a sensible route within the site and is reachable via direct navigation.
- [ ] The "CAREERS" item in the main menu links to this new page.
- [ ] Page title renders "CAREERS, GRAB A TICKET" with "CAREERS" in orange and "GRAB A TICKET" in black.
- [ ] Sub heading renders "WHAT YOU GET. WHAT YOU DON'T" with "WHAT YOU GET." in orange and "WHAT YOU DON'T" in black.
- [ ] The four-box row and two-box row are present with the exact titles and body copy specified, using the site's existing rounded-box outline style, with colors varied across orange/lime/black (no two adjacent boxes in the same row share a color).
- [ ] Box rows are 1/4-width x4 and 1/2-width x2 respectively on desktop, and stack responsively (full width or reduced columns) on mobile without visual breakage.
- [ ] The "How it Works HIRED IN ONE WEEK" section is full-width, has an orange (papaya) background, and displays both white and black text as specified.
- [ ] The opening statement, the three numbered step boxes (01/02/03, with exact titles and copy), and the closing statement all appear in the correct order within that section.
- [ ] The "CURRENT OPENINGS" section appears with the specified sub text and a working link labeled exactly "current vacancies here on LinkedIn" pointing to a SoftPapaya LinkedIn URL.
- [ ] All text matches the copy provided in this spec verbatim (including punctuation/quotation marks as given).
- [ ] Page typography, spacing, and box styling are visually consistent with existing pages (uses existing design tokens/components, no new one-off styles introduced without cause).
- [ ] Page is responsive and usable on common mobile viewport widths.

## 6. Open questions

- Does the existing rounded-box component already support a "lime" outline variant, or does it need to be added? If it needs adding, is that in scope here or a separate small task?
- What is the correct/current internal route naming convention for new pages on this site (e.g., `/careers`, `/en/careers`), given the reference site uses locale-prefixed URLs — does this site use locale prefixes at all?
- What is the actual, correct SoftPapaya LinkedIn company page URL to use for the placeholder link (requester did not supply one)?
- Where does the "CAREERS" nav item currently point, and is there any existing content on that destination that needs to be preserved, archived, or redirected?
- Is there an existing CMS or content layer used for page copy on this site, or is content typically hardcoded directly in templates/components? This affects how the copy should be wired in.
- Should the "How it Works" section's numbered boxes (01/02/03) use the same rounded-box component as the content boxes above (just full-width and re-themed for the orange background), or is a visually distinct component expected there?