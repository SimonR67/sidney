   # Spec: Add "WHERE WE'VE COME FROM" section and wire "About" nav link to it

Status: draft
Job: 6cbe8670-bc69-497e-838f-81bd88499f36
Target repo: SimonR67/sidney
Supersedes (partially): none — new capability (adds alongside existing "WHAT WE OFFER" section and existing nav link wiring; does not replace either)

## 1. What should change and why

The site currently has a "WHAT WE OFFER" section with a styled heading, and a top navigation menu whose "Services" link smooth-scrolls the page down to that section's anchor.

The request is to:
1. Add a new content section titled "WHERE WE'VE COME FROM", using the same heading style as "WHAT WE OFFER", containing the specific body copy supplied verbatim.
2. Place this new section directly after the "WHAT WE OFFER" section in normal page flow, unless inspection of the existing page shows a more logically fitting location (e.g. if there's an existing "About"-type section slot it should slide into instead).
3. Update the "About" link in the top nav so that clicking it smooth-scrolls to this new section, using the identical mechanism (anchor id + scroll behavior/click handler pattern) that "Services" currently uses to scroll to "WHAT WE OFFER".

Interpretation chosen: The request is unambiguous about content and heading style. The one judgment call is exact placement — default to "immediately after WHAT WE OFFER" as stated, only deviating if the existing page has an obvious better slot (e.g., a designated "About" placeholder section already sitting elsewhere that this content should populate instead of creating a duplicate section). This should be confirmed by whoever implements it, given they will actually see the current page structure and any existing "About" markup/nav intent.

## 2. Scope

- Add one new page section with:
  - Heading text: `WHERE WE'VE COME FROM`, using the exact same CSS class(es)/styling and markup pattern as the existing "WHAT WE OFFER" heading (same tag, same classes, same font/size/weight/color treatment).
  - Body copy, exactly as provided in the request (two paragraphs, no rewording, no truncation):
    - Paragraph 1: "We are a technology services business based in the UK, Poland, Ireland and Bulgaria with Software Development teams providing, Enterprise to SME CIO/CTO support, roadmap planning, architecture and development through C-Suite advisory to development engineering skills and resources."
    - Paragraph 2: "We are a UK and European based business working out of modern offices in Exeter, Dublin, Wroclaw and Sofia. Launched as a new company and a single brand 'Softpapaya' in March 2026, we are the coming together of groups of professionals from various technology companies that have been working together for over 11 years. Our expertise covers helping business leaders accomplish digital product build at pace, from International Enterprise scale to Startup. Softpapaya delivers from boardroom to development team, advisory, skills and people."
  - A section-level anchor id (e.g. `id="where-we-ve-come-from"` or whatever naming convention matches the existing "WHAT WE OFFER" section's id, e.g. if that section uses `id="services"`, this one should use an analogous id such as `id="about"` to match the nav semantics) so it can be scrolled to.
- Placement: inserted directly after the "WHAT WE OFFER" section in the page's DOM/template order, unless the implementer finds an existing more suitable slot in the current page flow (e.g. an existing empty/placeholder "About" section) — in that case, use that slot instead and note the deviation in the PR description.
- Section should follow the same general layout container/wrapper pattern used by "WHAT WE OFFER" (e.g. same container width, padding/margin conventions, section wrapper component) so it visually fits the rest of the page, even though only the heading style is explicitly required to match.
- Nav update: modify the "About" link in the top navigation so its `href`/`onClick` (whichever mechanism "Services" currently uses — e.g. `href="#services"` plain anchor, or a JS smooth-scroll click handler calling `scrollIntoView`/a scroll utility) is changed to target the new section's anchor id, using the same mechanism, not a different one (e.g. don't introduce a new scroll library or a full page navigation if "Services" uses in-page smooth scroll).
- Mobile/responsive nav: if the "Services" link's scroll behavior is also wired in a mobile menu / hamburger menu variant, the "About" link's equivalent update should be applied there too for consistency.

## 3. Out of scope

- Any changes to the "WHAT WE OFFER" section's own content, styling, or behavior beyond it now being immediately followed by the new section.
- Redesigning or restyling the navigation bar itself, beyond repointing the "About" link's target.
- Adding "WHERE WE'VE COME FROM" as a brand-new top-level nav item — the request specifically says the *existing* "About" link should point here, not that a new nav entry should be created.
- Any content management, CMS integration, or making the new section's copy editable via admin UI — content is static, hardcoded as specified.
- Translating, localizing, or adjusting the copy in any way (e.g. no fixing of the "providing," comma or grammar in paragraph 1) — content must be reproduced verbatim as supplied.
- Any changes to SEO metadata, page title, or meta descriptions referencing the new section.
- Any animation/visual embellishments beyond what "WHAT WE OFFER" already has (e.g. no new fade-ins, parallax, etc.) unless "WHAT WE OFFER" already has such effects and they're needed for consistency of the shared heading style.
- Removing or renaming the "Services" link or its current scroll-to-"WHAT WE OFFER" behavior.
- Any changes to other nav links (e.g. Contact, Home).

## 4. Edge cases and error behavior

- **Anchor id collision:** if an id matching the new section's chosen anchor already exists elsewhere on the page, a distinct, non-colliding id must be chosen and used consistently in both the section and the nav link.
- **Existing "About" href already pointing somewhere:** if the "About" link currently points to a different existing section (e.g. a real About page/section), that prior target's content is not to be deleted merely because the link is repointed — flag this to the reviewer if such a conflict exists, rather than silently overwriting/removing other content.
- **Missing smooth-scroll mechanism:** if, on inspection, "Services" does not use a JS/anchor smooth-scroll but instead does a hard page anchor jump (no smooth animation) or links to a different page entirely, the "About" link should be wired using that same actual mechanism — the spec's expectation is "identical to whatever Services actually does," not "smooth scroll" specifically, since the requester's stated intent is parity of mechanism, not a particular animation.
- **Long body text / mobile layout:** ensure paragraphs wrap normally on small viewports; no truncation or ellipsis logic should be introduced.
- **Heading style resolution ambiguity:** if "WHAT WE OFFER" heading styling is applied via a reusable component/class rather than inline/one-off styles, the new heading should reuse that same component/class rather than duplicating styles into a new rule — reduces drift risk.

## 5. Acceptance criteria

- [ ] A new section exists on the page with heading text "WHERE WE'VE COME FROM" rendered using the same markup/CSS class(es) as the "WHAT WE OFFER" heading (visually identical styling: font, size, weight, color, spacing).
- [ ] The new section contains the two body paragraphs exactly as specified, with no text alterations.
- [ ] The new section is positioned immediately after "WHAT WE OFFER" in the rendered page, unless a documented, reviewer-approved alternative placement was used instead.
- [ ] The new section has a unique anchor id usable for in-page scrolling.
- [ ] Clicking the "About" nav link scrolls the page to the new "WHERE WE'VE COME FROM" section, using the same scroll mechanism/behavior (e.g. smooth vs instant, JS handler vs plain anchor) as clicking "Services" uses to scroll to "WHAT WE OFFER".
- [ ] This behavior works consistently on both desktop and mobile nav (if the mobile nav has a separate/duplicated "About" link).
- [ ] No other existing sections, nav links, or their behaviors are altered or broken by this change.
- [ ] No content from the request has been reworded, abbreviated, or omitted in the shipped output.

## 6. Open questions

- Does the existing "About" nav link currently point anywhere (e.g. a different in-page section or an external/separate page)? If so, should that target be removed, repurposed, or left as dead content elsewhere on the page? The requester's instruction implies simple repointing, but this should be confirmed once the current "About" link target is inspected.
- Is there already an "About"-styled or "About"-titled section elsewhere in the page that this new content might logically replace/populate, rather than inserting a brand-new section after "WHAT WE OFFER"? Placement should default to "right after WHAT WE OFFER" unless the reviewer confirms otherwise.
- What is the exact current scroll mechanism used by "Services" (CSS `scroll-behavior: smooth` + plain `<a href="#id">`, vs. a JS `onClick` handler with `scrollIntoView`, vs. a scroll library/hook)? The implementer should mirror whatever is actually there — please confirm if there's a reason to introduce a different/updated mechanism instead of just copying the existing pattern.
- Should the new section have any distinguishing visual background/spacing to separate it from "WHAT WE OFFER," or should it flow seamlessly (same background, no divider)? Not specified in the request — defaulting to "same section styling conventions as other content sections on the page" unless reviewer specifies otherwise.