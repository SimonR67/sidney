   # Spec: Highlight "STUDIES" in orange/papaya on the Case Studies page title

Status: draft
Job: a8e4733b-d0b3-4d8b-961f-615f5797d5a5
Target repo: SimonR67/sidney
Supersedes (partially): none — new capability (a targeted styling tweak to an existing title element)

## 1. What should change and why

On the Case Studies page, the title currently renders as plain text (e.g. "CASE STUDIES") without any special color styling on part of the phrase. Elsewhere on the site — specifically in the home page title — a portion of the text ("REALLY WELL") is styled in the site's signature orange/papaya accent color, presumably via a dedicated CSS class or inline style used for emphasis.

The request is to apply that same visual treatment to the word "STUDIES" in the Case Studies page title, so it visually matches the home page's use of the accent color for emphasis text.

Interpretation chosen: Rather than introducing a new color or new styling mechanism, this spec assumes we should reuse whatever existing class/style/component already produces the orange/papaya color on "REALLY WELL" on the home page (e.g. a shared CSS class like `.highlight`, `.accent`, `.papaya`, or an inline style with a specific hex/color variable), and apply that exact same mechanism to "STUDIES" on the Case Studies title. If the home page uses a reusable class, this feature should reuse that class as-is rather than duplicating styles.

## 2. Scope

- Locate the markup/component responsible for the home page title where "REALLY WELL" is styled in orange/papaya, and identify the exact styling approach used (CSS class name, inline style, styled-component, CSS variable, etc.).
- Locate the markup/component responsible for the Case Studies page title.
- Modify the Case Studies title so that only the word "STUDIES" is wrapped/styled using that same mechanism (same class name, same color value/variable, same font-weight or other properties if they are part of that style — i.e., a faithful match, not just a similar-looking color).
- The rest of the Case Studies title (e.g. "CASE") remains in its current default styling, unchanged.
- Ensure the change works across the same breakpoints/responsive states that the home page's styled text already supports (if the home page style is responsive-aware, the Case Studies instance should inherit that behavior for free by reusing the same class).

## 3. Out of scope

- Redesigning the Case Studies page layout, typography, or title copy beyond this single color change.
- Introducing a new color value that merely "looks similar" — the goal is to reuse the exact existing orange/papaya styling mechanism, not approximate it.
- Changing the styling of "REALLY WELL" on the home page itself.
- Applying this styling to any other words, pages, or titles not explicitly mentioned in this request (e.g. not touching other instances of "STUDIES" elsewhere on the site, such as in navigation or footer links).
- Any accessibility audit or contrast-ratio changes beyond what already exists for the home page's styled text (if the existing home page treatment is deemed accessible, this reuse inherits that; no new accessibility work is being commissioned here).
- Any changes to the underlying design system, color tokens, or theming architecture — this is a targeted reuse, not a refactor.

## 4. Edge cases and error behavior

- If the home page styling is implemented as an inline style tied to specific text rather than a reusable class, the same inline style values (color hex/variable) should be copied precisely rather than approximated by eye.
- If the Case Studies title is generated dynamically (e.g. from a CMS field or template string) rather than hardcoded JSX/HTML, confirm whether "STUDIES" can be isolated and wrapped without breaking the dynamic rendering; if it cannot be cleanly isolated, flag this as a blocker rather than hardcoding a workaround that breaks CMS-driven content.
- If the title text ever changes (e.g. localization) such that "STUDIES" is not a standalone word/substring, the styling should not silently apply to the wrong text — this feature assumes the current, static English title text.
- No dependency on external services is involved; this is a static styling change with no runtime failure modes expected.

## 5. Acceptance criteria

- [ ] On the Case Studies page, the word "STUDIES" in the title renders in the same orange/papaya color as "REALLY WELL" does on the home page.
- [ ] The styling mechanism used for "STUDIES" is the same class/approach used for "REALLY WELL" on the home page (verified by inspecting the rendered class name or style attribute, not just visual comparison).
- [ ] No other words in the Case Studies title are affected by this change.
- [ ] The home page title and its "REALLY WELL" styling remain unchanged.
- [ ] The change renders correctly across the site's existing supported breakpoints/devices, consistent with how the home page's styled text already behaves.
- [ ] No visual regressions introduced elsewhere on the Case Studies page (spacing, line-height, layout unaffected by the new inline span/element if one is introduced).

## 6. Open questions

- Is the home page's orange/papaya styling implemented via a reusable CSS class (e.g. `.highlight`) or as one-off inline styling specific to that title component? This affects whether we can do a clean reuse or need to extract a shared class first.
- Is the Case Studies page title hardcoded text/JSX, or pulled from a CMS/content source? If the latter, can it be split into segments for styling, or does this require a content-model change (which would be out of scope as currently written)?
- Should the exact word "STUDIES" be wrapped, or does the request intend the whole phrase "CASE STUDIES" minus "CASE" (i.e., confirming "STUDIES" is the only word to color, matching how "REALLY WELL" — a two-word phrase — was chosen on the home page)?