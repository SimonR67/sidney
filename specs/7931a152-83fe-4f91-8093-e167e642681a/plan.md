# Plan: Homepage content, styling, and "What We Offer" section overhaul

Status: draft
Job: 7931a152-83fe-4f91-8093-e167e642681a
Spec: https://github.com/SimonR67/sidney/blob/main/specs/7931a152-83fe-4f91-8093-e167e642681a/spec.md

## 1. Definition of done

- "REALLY WELL" in the hero headline renders in #E56717 (Papaya); the rest of the headline stays black.
- The paragraph under the headline is replaced in full with the new provided copy.
- The top-left "Softpapaya" text title is replaced with an `<img>` referencing the existing `Softpapaya-logo.png` asset (no new file added), with appropriate alt text and, if the old text was a home link, equivalent link behavior preserved.
- The "WHAT WE OFFER" section shows exactly 6 boxes, in the specified order, with the specified titles/body copy, and zero leftover DOM/CSS/copy from the old 8-box version.
- Box outlines follow the exact sequence Papaya, Lime, Black, Black, Papaya, Lime.
- Each box's tag/skill mini-buttons are colored to match that box's own outline color and are topically relevant to its content.
- The 6-box layout reuses the existing grid/card component/classes (no new grid system), preserving responsive breakpoints and spacing.
- Page renders without layout breakage or console errors on one desktop and one mobile viewport.

## 2. File map

Confirmed on inspection: the site is a static, no-build-step page. There are no
components — the whole homepage is one file, `index.html`, styled by one
stylesheet, `styles/main.css`. The logo asset is committed at the repository
root as `SoftPapaya-logo.png` (capital P, not `Softpapaya-logo.png` as the spec
writes it).

| File | Change |
|---|---|
| `index.html` — `h1.hero__heading` | Wrap "REALLY WELL" in `<span class="hero__papaya">`; the closing full stop and the rest of the headline stay `--deep` |
| `index.html` — `p.hero__lede` | Replace the paragraph text in full with the new copy |
| `index.html` — `a.masthead__logo` | Remove the plain-text "SoftPapaya" title; render `<img src="SoftPapaya-logo.png" alt="SoftPapaya">` inside the same `href="#"` link, so the home link and the header layout are unchanged |
| `index.html` — `ul.services__grid` | Remove all 8 `li.card` entries; add 6 with the specified titles, copy and tags, reusing the same `card` / `card__title` / `card__copy` / `card__tags` / `tag` markup and classes |
| `styles/main.css` — `:root`, `.hero__papaya`, `.services__grid > .card`, `.tag` | Existing tokens are reused, not re-declared: `--papaya: #e56717`, `--lime: #32cd32`, `--black: #000000`. The border cycle moves from `:nth-child(3n…)` to `:nth-child(6n…)` for the papaya, lime, black, black, papaya, lime sequence, and the same positions colour each card's tags. The now-unspent `--chip` grey is dropped |
| `SoftPapaya-logo.png` (repository root) | No file changes — referenced as-is by the header `<img src>` |
| `tests/browser.mjs` | Test plumbing only: the static test server learns the `image/png` content type so the logo loads in the headless-browser tests |

## 3. User journey

A visitor lands on the homepage. They see the headline "WHAT WE DO. AND WE DO IT REALLY WELL." with "REALLY WELL" standing out in orange (Papaya) against the rest of the black text. Below it, they read the new, more accurate paragraph describing the business's locations, service model, and team offering. In the top-left corner, instead of plain text, they see the Softpapaya logo image, which (if it was previously a link) still takes them home when clicked. Scrolling to "WHAT WE OFFER," they see 6 clearly outlined boxes — C-Suite Advisory, Software Development, Subject Matter Expertise, Data AI & Automation, UI/UX Design and Rapid POC, and Technology Teams & Resourcing — each with a distinct colored border (Papaya, Lime, Black, Black, Papaya, Lime) and small colored tag pills relevant to that service (e.g., TypeScript, Java, Python, React under Software Development, colored Lime to match its box). The layout responds cleanly on both desktop and mobile, with no broken images, no overflow, and no leftover content from the old 8-box section.

## 4. Tasks

- [x] 1. Locate and confirm exact file paths for the hero headline/paragraph component, the header/logo component, the "WHAT WE OFFER" section component, and the `Softpapaya-logo.png` asset path in the repo — files: (investigation only, update this plan's file map with confirmed paths) — test: build succeeds and manual grep confirms each element's current source location before any edits.
- [x] 2. Recolor "REALLY WELL" in the hero headline to #E56717 while leaving the rest of the headline black — files: hero headline component/CSS — test: rendered DOM shows a wrapping element around "REALLY WELL" with computed color #E56717, and a snapshot/DOM test confirms surrounding text remains the original black color.
- [x] 3. Replace the paragraph beneath the headline with the new provided copy — files: hero paragraph component — test: DOM/text-content test asserts the paragraph's rendered text exactly matches the new copy and no longer contains the old text.
- [x] 4. Replace the "Softpapaya" text title with an `<img>` referencing the existing `Softpapaya-logo.png`, preserving prior link behavior and appropriate sizing/alt text — files: header/logo component — test: DOM test asserts no visible text node "Softpapaya" is rendered, an `<img>` with `alt="Softpapaya"` and `src` pointing to the existing asset path is present, and (if applicable) it's wrapped in the same home link as before; build fails/errors if the image path is invalid.
- [x] 5. Remove all 8 existing boxes and their dead CSS/copy from the "WHAT WE OFFER" section, replacing with an empty/placeholder 6-box scaffold using the existing card/grid component — files: "WHAT WE OFFER" section component, related CSS — test: DOM test asserts zero elements matching the old 8-box markup/classes remain, and exactly 6 placeholder card elements exist using the existing grid classes.
- [x] 6. Populate the 6 boxes with exact titles and body copy in the specified order (C-Suite Advisory, Software Development, Subject Matter Expertise, Data AI & Automation, UI/UX Design and Rapid POC, Technology Teams & Resourcing) — files: "WHAT WE OFFER" section component — test: DOM test asserts the 6 box titles appear in that exact order with body text matching the spec's provided copy verbatim.
- [x] 7. Apply outline/border colors to each box following the sequence Papaya, Lime, Black, Black, Papaya, Lime — files: "WHAT WE OFFER" section component/CSS — test: computed-style test asserts each box's border/outline color matches the expected hex (#E56717, #A6CE39, #000000, #000000, #E56717, #A6CE39) in order.
- [x] 8. Add topically relevant tag/skill mini-buttons to each box (e.g., Software Development → TypeScript, Java, Python, React; C-Suite Advisory → Roadmap, Governance, CTO Advisory; etc.) — files: "WHAT WE OFFER" section component — test: DOM test asserts each box contains the expected tag labels and that no box has irrelevant/leftover tags from the old 8-box version.
- [x] 9. Recolor each box's tag/mini-button elements to match that box's own outline color instead of the previous grey styling — files: "WHAT WE OFFER" section CSS — test: computed-style test asserts each tag element's background/border color matches its parent box's outline color exactly.
- [x] 10. Verify and adjust (if needed) the grid's column/row balance for 6 boxes using only existing grid behavior (no custom fixes) — files: "WHAT WE OFFER" section CSS — test: visual/DOM layout test at the site's existing breakpoints confirms no visually broken trailing row and preserved column counts/spacing matching the prior 8-box grid's conventions.
- [x] 11. Cross-viewport smoke check for layout breakage/console errors across all changed sections — files: none (verification only, may touch e2e/test config) — test: automated or manual check on one desktop width and one mobile width shows no layout overflow, no broken image, and no console errors on the homepage.

## 5. Test plan

After all tasks are complete, run a full homepage regression pass covering: (a) the hero headline renders with correct partial coloring and updated paragraph text; (b) the header renders the logo image with no visible "Softpapaya" text and correct link/alt behavior; (c) the "WHAT WE OFFER" section renders exactly 6 boxes in the correct order, titles, copy, outline colors, and correctly colored tags with no remnants of the old 8-box markup or CSS; (d) the page loads cleanly with no console errors and no layout breakage at one desktop viewport (e.g. 1440px) and one mobile viewport (e.g. 375px); (e) a final grep/DOM audit confirms no orphaned CSS classes or copy tied only to the removed 8-box section remain in the codebase.

## 6. Out of scope (carried from spec)

- No changes to any other page/section beyond the headline, the paragraph beneath it, the top-left site title, and the "WHAT WE OFFER" boxes.
- No changes to navigation, footer, other CTAs, or unrelated homepage copy.
- No redesign of the overall grid/layout system — existing grid/card conventions must be reused, not replaced.
- No changes to the `Softpapaya-logo.png` file itself (no re-export, resize, recolor, or re-upload) — used as-is from its existing repo location.
- No introduction of a formal design-token/theme system unless one already exists — colors applied directly via hex unless an existing token is found, in which case it's reused.
- No SEO, accessibility audit, or performance optimization work beyond reasonable `alt` text for the new logo image.
- No changes to mobile menu, header sticky behavior, or other header functionality — only the title text→image swap.
- No copy changes to box tags/skills beyond what's needed for the 6 new boxes — old tags are not preserved unless still topically relevant.

## 7. Implementation notes — decisions taken, and what still needs the owner

### Lime is the existing token, `#32cd32`, not `#A6CE39`

Spec §4 ("No existing lime token found") and §6 ask that an existing lime token
be preferred over the `#A6CE39` default if one is found during implementation.
One was: `styles/main.css` already declares `--papaya: #e56717`,
`--lime: #32cd32` and `--black: #000000` at `:root`, and the eight boxes this
job replaces were already outlined from them. All three are reused as-is, so
the six new boxes carry the same lime the section carried before. Nothing
hardcodes a shade; changing `--lime` to `#A6CE39` in that one declaration would
restyle the whole sequence if the owner prefers the spec's default.

### The tags carry their box's shade in the ring, not in the lettering

Spec §4 ("Colour contrast") asks that a legibility problem be flagged rather
than silently worked around. There is one. Tag labels are 12px, which WCAG AA
holds to 4.5:1. On the page's white surface, papaya is 3.34:1 and lime is
2.31:1 — as tag text or as a tag fill, both fail, and the suite's existing
page-wide contrast check fails with them.

So each tag takes its box's shade as a 1px border on a white fill, keeping the
label on the `--muted` grey it was already legible in. Every tag is visibly
colour-matched to its box, no tag is left on the old grey chip, and the page
still passes AA throughout. Filling the pills instead would need a darker
papaya and lime for the tags only, which the spec puts out of scope.

The hero's "REALLY WELL" is a different case: at 40–64px and weight 700 it is
"large text" to WCAG, whose floor is 3:1, so papaya clears AA there on its own.
The suite's contrast check was made size-aware to reflect that rather than
being relaxed.

### The body copy is written, not supplied

Spec §2 and §5 refer to "the new provided paragraph" and to box copy "matching
the content block given in the request verbatim", but neither `spec.md` nor
this plan carries that text. The hero lede and the six box paragraphs here were
therefore written to the voice of the existing page, from the titles and the
service list the spec does give.

The one thing that could not be written honestly is **locations**: spec §1 says
the new paragraph should describe the business's locations, and inventing
offices for a real business is not a judgement call an implementer should make.
The lede covers the service model and the team offering and says nothing about
where the business operates. **The owner's actual copy should replace this
before the page ships.**