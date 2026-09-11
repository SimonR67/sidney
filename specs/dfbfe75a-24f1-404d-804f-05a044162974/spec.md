# Spec: Update site title and site-wide colour scheme

Status: draft
Job: dfbfe75a-24f1-404d-804f-05a044162974
Target repo: SimonR67/sidney
Supersedes (partially): existing site title and existing site-wide stylesheet/theme (whatever currently sets page title and global background/text colours)

## 1. What should change and why

The request asks for two changes:

1. Change the website's site title (the title shown in the browser tab / `<title>` tag, and any place the site name is rendered as a heading/branding element) to "Sid Meyers Alpha Centuri" — using this exact spelling as given in the request, not the "Sid Meier's Alpha Centauri" spelling of the original game.
2. Update the site's global styling so the background colour is dark grey and all text/lettering is a distinct, legible colour, applied consistently across the site.

**Revision note (addressing reviewer feedback on the prior draft):** An earlier draft of this spec specified the text/lettering colour as "bright green," per the literal wording of the feature request. The reviewer declined that draft and requested the text/lettering colour be **Gold** instead. This revision changes the text/lettering colour requirement from bright green to **Gold** everywhere in this spec. The background colour requirement (dark grey) is unchanged. Anywhere "text/lettering" is referenced below, it now means Gold, not green.

If the original requester still wants bright green specifically, that is a conflict with the reviewer's instruction and should be raised as an open question (see Section 6) rather than silently resolved either way.

## 2. Scope

- Update the site title string wherever it is defined as a single source of truth (e.g., site config, `<title>` tag template, header/branding component) to read exactly: `Sid Meyers Alpha Centuri`.
- Update global/site-wide CSS (or equivalent theming mechanism used by the repo) so that:
  - The page/body background colour is dark grey (a specific hex value, e.g. `#2b2b2b` or similar, to be finalized during implementation/review — see Open Questions).
  - All text/lettering colour across the site is Gold (a specific hex value, e.g. `#FFD700` or a close variant, to be finalized during implementation/review).
- Changes should apply site-wide (all pages/templates that inherit from the global stylesheet/layout), not just the homepage.
- Ensure sufficient contrast between the Gold text and dark grey background for basic readability.

## 3. Out of scope

- No changes to site structure, layout, navigation, or content beyond the title string and colour values.
- No changes to fonts, font sizes, spacing, or other non-colour styling attributes.
- No per-page or per-section colour overrides (e.g., special styling for buttons, links, code blocks) unless they currently inherit directly from the global text/background colours being changed — no new themed components will be introduced.
- No dark-mode/light-mode toggle or multiple theme support — this is a single, direct replacement of the current colours.
- No changes to images, logos, or icons, even if they visually clash with the new colour scheme.
- No accessibility audit beyond basic contrast sanity-checking; a full WCAG compliance pass is not part of this work.
- No renaming of the repo, domain, or any internal identifiers/config keys beyond the user-facing title string.

## 4. Edge cases and error behavior

- If the site title is defined in multiple places (e.g., hardcoded in several templates instead of one config value), all occurrences intended to represent the site title should be updated consistently; any occurrence deliberately left as the original game name (if used in unrelated content/copy) should not be changed — only branding/title occurrences are in scope.
- If some page templates use inline styles or component-level colour overrides that don't inherit from the global stylesheet, those will not automatically pick up the new colours; such cases should be flagged during implementation rather than silently left inconsistent.
- If dark grey background and Gold text are already close to other existing UI elements (e.g., existing gold-ish accent colours, warning states), verify there's no unintended visual collision — but resolving such collisions beyond the two colours specified is out of scope.
- No external dependency is required for this change (pure title/config + CSS edit), so "dependency unavailable" scenarios do not apply here.

## 5. Acceptance criteria

- The browser tab title and any rendered site-title/branding text reads exactly "Sid Meyers Alpha Centuri" on all pages.
- The site-wide background colour is a dark grey across all pages using the shared layout/stylesheet.
- All body/lettering text across the site renders in Gold, replacing the previous text colour, across all pages using the shared layout/stylesheet.
- No other visual elements (fonts, layout, images) are altered as part of this change.
- The change does not reintroduce or reference bright green anywhere in the final styling.

## 6. Open questions

- The original feature request explicitly asked for "bright green" text; the reviewer's feedback asked for Gold instead. This spec now assumes Gold is the correct, final intended colour. Please confirm this is the desired resolution (i.e., Gold overrides the original "bright green" request) before planning begins.
- Should "Gold" map to a specific hex/RGB value (e.g., standard web `gold` = `#FFD700`), or is there a specific brand shade of gold intended?
- Should "dark grey" map to a specific hex/RGB value, or is any reasonably dark grey acceptable?
- Are links, buttons, and other interactive elements expected to also become Gold, or should they retain a distinct colour for usability (e.g., a different shade to indicate interactivity)?
- Is the misspelling "Sid Meyers Alpha Centuri" intentional and to be preserved exactly as given, or was it meant to reference the actual game title "Sid Meier's Alpha Centauri"?