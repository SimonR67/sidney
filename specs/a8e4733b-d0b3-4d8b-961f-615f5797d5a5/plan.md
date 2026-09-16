# Plan: Highlight "STUDIES" in orange/papaya on the Case Studies page title

Status: draft
Job: a8e4733b-d0b3-4d8b-961f-615f5797d5a5
Spec: https://github.com/SimonR67/sidney/blob/main/specs/a8e4733b-d0b3-4d8b-961f-615f5797d5a5/spec.md

## 1. Definition of done

- The word "STUDIES" in the Case Studies page title renders in the exact same orange/papaya color/class/style used for "REALLY WELL" on the home page.
- The styling mechanism (CSS class name, inline style, or CSS variable) is identical/reused, not re-implemented or approximated.
- "CASE" and any other surrounding text in the Case Studies title remains in default/unchanged styling.
- The home page title and its "REALLY WELL" styling are untouched.
- The change renders correctly at all breakpoints the home page treatment already supports.
- No layout, spacing, or line-height regressions on the Case Studies page from the new span/element.
- If the home page styling mechanism cannot be located, or the Case Studies title cannot be cleanly isolated to wrap "STUDIES" (e.g. it's fully dynamic/CMS-driven), this is flagged as a blocker rather than worked around.

## 2. File map

| File | Change |
|---|---|
| components/HomeTitle.(jsx/tsx) or equivalent home page title component | Inspect only — identify the class/inline-style mechanism used on "REALLY WELL"; no functional change |
| styles/*.css or *.module.css (wherever `.highlight`/`.accent`/`.papaya` or equivalent lives) | Inspect only — confirm the exact class/selector and its properties; no changes if a shared class already exists |
| components/CaseStudiesTitle.(jsx/tsx) or equivalent Case Studies page title component | Wrap "STUDIES" in the same class/element used for "REALLY WELL"; leave "CASE" untouched |
| tests/CaseStudiesTitle.test.(jsx/tsx) (or existing test file for this component) | Add/extend test asserting "STUDIES" carries the reused class/style and "CASE" does not |
| tests/HomeTitle.test.(jsx/tsx) (if it exists) | Add/confirm regression test that home page title markup/class is unchanged |

## 3. User journey

A visitor navigates from the home page (where they see "REALLY WELL" rendered in the site's orange/papaya accent color as part of the hero title) to the Case Studies page. On arrival, they see the page title (e.g. "CASE STUDIES") where "CASE" appears in the default title styling and "STUDIES" appears in the same orange/papaya accent color they just saw on the home page — reinforcing the same visual emphasis pattern. Resizing the browser or viewing on mobile, the colored word continues to render correctly, matching however the home page's accent text behaves responsively. No other part of the page layout shifts or looks different aside from this color treatment.

## 4. Tasks

- [ ] 1. Identify and document the exact styling mechanism used for "REALLY WELL" on the home page (class name, inline style, CSS variable, or styled-component) — files: components/HomeTitle.(jsx/tsx), styles/*.css — test: a written note/comment or short spike confirming the mechanism (e.g. `.highlight` class with `color: var(--papaya)`); no test framework assertion needed, but capture the finding as a code comment or PR description referenced by task 3's test.
- [ ] 2. Locate the Case Studies title component/markup and confirm the title text ("CASE STUDIES") is static/hardcoded and can be split into "CASE" and "STUDIES" segments without breaking dynamic rendering — files: components/CaseStudiesTitle.(jsx/tsx) — test: existing render test (or a new snapshot/DOM query test) confirms the title renders "CASE STUDIES" as two isolable text nodes/segments before any styling change is applied; if not isolable, fail the test intentionally and flag as blocker per spec §4.
- [ ] 3. Wrap "STUDIES" in the Case Studies title with the same class/element/inline style identified in task 1, leaving "CASE" untouched — files: components/CaseStudiesTitle.(jsx/tsx), tests/CaseStudiesTitle.test.(jsx/tsx) — test: new test asserts the rendered "STUDIES" node has the exact class name (or matching inline style/color value) used on the home page's "REALLY WELL", and that "CASE" does not have that class/style.
- [ ] 4. Add a regression test confirming the home page title and its "REALLY WELL" styling are unchanged after the Case Studies edit — files: tests/HomeTitle.test.(jsx/tsx) — test: snapshot or DOM assertion showing home page markup/class for "REALLY WELL" is identical before and after the change.
- [ ] 5. Verify no layout/spacing/line-height regression on the Case Studies page caused by the new wrapping element — files: components/CaseStudiesTitle.(jsx/tsx), any associated CSS module — test: visual/DOM test (e.g. computed style or existing layout snapshot) confirming title container dimensions/line-height match pre-change baseline.
- [ ] 6. Verify responsive behavior at the breakpoints the home page's accent text supports — files: components/CaseStudiesTitle.(jsx/tsx), styles/*.css — test: responsive test (e.g. via testing-library + matchMedia mock, or manual viewport snapshot) confirming "STUDIES" retains correct styling at each supported breakpoint, matching home page behavior.

## 5. Test plan

After all tasks pass individually, run the full component/unit test suite to confirm no unrelated regressions. Manually load both the home page and Case Studies page in a browser at each supported breakpoint (mobile, tablet, desktop) and visually confirm: (a) "REALLY WELL" on the home page is unchanged, (b) "STUDIES" on the Case Studies page matches its color exactly (via browser inspector, compare computed `color` and class name against the home page instance), (c) "CASE" remains default-styled, and (d) no spacing/layout shift is visible around the Case Studies title. Run any existing visual regression/snapshot tooling for the Case Studies page if present in the repo.

## 6. Out of scope (carried from spec)

- Redesigning the Case Studies page layout, typography, or title copy beyond this single color change.
- Introducing a new color value that merely looks similar instead of reusing the exact existing mechanism.
- Changing the styling of "REALLY WELL" on the home page itself.
- Applying this styling to any other words, pages, or titles (e.g. "STUDIES" in navigation or footer links).
- Any accessibility audit or contrast-ratio work beyond what already exists for the home page's styled text.
- Any changes to the underlying design system, color tokens, or theming architecture.