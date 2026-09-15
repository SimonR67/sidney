# Plan: Add "WHERE WE'VE COME FROM" section and wire "About" nav link to it

Status: draft
Job: 6cbe8670-bc69-497e-838f-81bd88499f36
Spec: https://github.com/SimonR67/sidney/blob/main/specs/6cbe8670-bc69-497e-838f-81bd88499f36/spec.md

## 1. Definition of done

- A new "WHERE WE'VE COME FROM" section exists in the page markup, using the exact same heading component/class(es) as "WHAT WE OFFER".
- The section contains both body paragraphs verbatim, unaltered.
- The section is positioned directly after "WHAT WE OFFER" in the DOM, unless an existing "About" placeholder slot is found and used instead (documented in PR).
- The section has a unique, non-colliding anchor id.
- The "About" nav link (desktop and mobile, if separate) is repointed to this new anchor using the identical scroll mechanism currently used by "Services" → "WHAT WE OFFER" (whatever that mechanism actually is on inspection).
- The "Services" link and "WHAT WE OFFER" section remain fully unchanged and functional.
- No other nav links, sections, or existing "About" target content are removed or broken; any conflicting prior "About" target is flagged, not deleted.

## 2. File map

| File | Change |
|---|---|
| (page/component file containing "WHAT WE OFFER" section, e.g. `src/pages/index.*` or `src/components/sections/WhatWeOffer.*`) | Read to identify heading component/class, section wrapper pattern, and anchor id convention used. |
| (new or adjacent section file, e.g. `src/components/sections/WhereWeveComeFrom.*`) | Add new section component with heading + two body paragraphs, reusing existing heading component/class and section wrapper pattern. |
| (page/layout file that composes sections, e.g. `src/pages/index.*` or `src/App.*`) | Insert new section immediately after "WHAT WE OFFER" in render order (or into existing "About" placeholder slot if found). |
| (nav component, e.g. `src/components/Nav.*` or `Header.*`) | Update "About" link's `href`/`onClick` to target new section's anchor id, using the same mechanism as "Services". |
| (mobile nav component, if separate, e.g. `src/components/MobileNav.*`) | Apply the same "About" link retargeting for mobile menu, if it duplicates desktop nav logic. |
| (styles file, if heading/section styles are defined separately, e.g. `*.css`/`*.module.css`) | No new rules expected; reuse existing classes. Only touch if a genuinely new shared class is required (should be avoided per spec). |

## 3. User journey

A visitor loads the homepage and scrolls (or clicks "Services" in the nav) to see the "WHAT WE OFFER" section as before. Immediately below it, they now see a new "WHERE WE'VE COME FROM" section with a matching heading style and two paragraphs describing the company's background, offices, and formation as "Softpapaya". From anywhere on the page, the visitor can click "About" in the top nav (desktop or mobile), and the page smooth-scrolls (or jumps, matching whatever "Services" does) down to this new section. Clicking "Services" still scrolls to "WHAT WE OFFER" exactly as before, unaffected by this change.

## 4. Tasks

- [ ] 1. Inspect existing "WHAT WE OFFER" section and "Services" nav link to document: heading markup/class(es), section wrapper/container pattern, anchor id convention, and exact scroll mechanism (CSS `scroll-behavior` + `<a href="#id">` vs JS `onClick` + `scrollIntoView` vs other) — files: none changed (research only, notes added to PR description) — test: PR description accurately states the mechanism found; reviewer can verify by reading current "Services" implementation alongside the note.
- [ ] 2. Check whether an existing "About"-titled/styled placeholder section already exists elsewhere in the page — files: none changed (research only) — test: PR description states either "no existing About slot found, inserting after WHAT WE OFFER" or "existing About slot found at X, using it instead" with justification.
- [ ] 3. Create the new "WHERE WE'VE COME FROM" section component/markup with the exact heading class(es)/markup pattern copied from "WHAT WE OFFER", the two body paragraphs reproduced verbatim, and a unique anchor id (checking for collisions) — files: new section file (or inline addition to existing page file) — test: render/snapshot test (or manual DOM inspection) confirms heading uses identical class list to "WHAT WE OFFER" heading, both paragraphs match the spec text character-for-character, and the section's id is unique on the page.
- [ ] 4. Insert the new section into the page in the correct position (immediately after "WHAT WE OFFER", or into the identified placeholder slot from task 2) — files: page/layout composition file — test: DOM order test asserts the new section's root element immediately follows "WHAT WE OFFER"'s root element in document order (or, if placeholder used, assert it occupies that slot and the deviation is documented).
- [ ] 5. Update desktop nav "About" link to target the new anchor id using the same mechanism identified in task 1 — files: nav component — test: click/interaction test simulates clicking "About" and asserts the page scrolls to (or window location targets) the new section's id, using the same event/handler type as "Services" (e.g. if "Services" calls `scrollIntoView`, assert "About" now calls it on the new section's ref/element).
- [ ] 6. Apply the equivalent update to the mobile/hamburger nav "About" link, if it has separate markup/handlers from desktop — files: mobile nav component — test: click/interaction test on mobile nav variant asserts "About" scrolls to the new section, mirroring the desktop test in task 5.
- [ ] 7. Regression check that "Services" link and "WHAT WE OFFER" section behavior are unchanged, and that any previous "About" target content (if one existed) is still present elsewhere and not deleted — files: none (verification only) — test: existing "Services" click test still passes unmodified; if a prior "About" target existed, assert its content/element is still present in the DOM.

## 5. Test plan

After all tasks are complete, run a full end-to-end pass on both desktop and mobile viewports: load the homepage, click "Services" and confirm scroll to "WHAT WE OFFER" is unaffected, then click "About" and confirm scroll to "WHERE WE'VE COME FROM" using the same mechanism. Visually diff the new section's heading against "WHAT WE OFFER"'s heading to confirm identical styling. Verify the two paragraphs render verbatim (byte-for-byte diff against spec text) with normal text wrapping on a narrow viewport (no truncation). Confirm no other nav links or sections were altered by running the existing full nav/section test suite (if present) and confirming all prior tests still pass unmodified.

## 6. Out of scope (carried from spec)

- Any changes to "WHAT WE OFFER" section's own content, styling, or behavior beyond ordering.
- Redesigning or restyling the nav bar itself beyond repointing "About".
- Adding "WHERE WE'VE COME FROM" as a new top-level nav item.
- Any CMS/admin editability of the new content — it is static/hardcoded.
- Any rewording, correction, or localization of the supplied copy (including the paragraph 1 comma).
- Any SEO metadata, page title, or meta description changes.
- Any new animations/visual embellishments beyond what "WHAT WE OFFER" already has.
- Removing or renaming the "Services" link or its existing scroll behavior.
- Any changes to other nav links (Contact, Home, etc.).