   # Spec: Update site title and global colour scheme

Status: draft
Job: dfbfe75a-24f1-404d-804f-05a044162974
Target repo: SimonR67/sidney
Supersedes (partially): existing site `<title>` value and existing global CSS colour rules — not a new capability

## 1. What should change and why

The site currently has some existing title text and default/existing colour styling. The request is to:

1. Change the site's title (the text shown in the browser tab / `<title>` element, and anywhere else the site title is rendered as a page heading or metadata, e.g. `<meta property="og:title">` if present) to the literal string **"Sid Meyers Alpha Centuri"**.
2. Update the global site styling so that:
   - The page background colour is **dark grey**.
   - All text/lettering on the site is **bright green**.

This is a cosmetic/branding change with no functional impact on site behavior. The problem it solves is purely presentational — rebranding the site's title and giving it a new visual theme.

**Interpretation notes (ambiguity in the request):**
- The requested title text "Sid Meyers Alpha Centuri" is used **verbatim** as given, including its non-standard spelling (it differs from the game title "Sid Meier's Alpha Centauri"). This spec assumes the misspelling is intentional. See Open Questions.
- "Dark grey" and "bright green" are not given as exact hex/RGB values. This spec assumes reasonable, commonly-understood values (e.g. dark grey ≈ `#2b2b2b`, bright green ≈ `#39ff14` or `#00ff00`-family) unless the reviewer specifies exact codes. See Open Questions.
- "All text/lettering" is interpreted as all body copy, headings, links, and navigation text rendered on the site's pages — i.e. the default text colour and any colour overrides currently in the stylesheet(s), not necessarily images, logos, or icon glyphs that are not text.

## 2. Scope

- Update the `<title>` tag (and equivalent site-title references, e.g. og:title, page header/banner text that currently duplicates the site name) across all pages/templates to read exactly "Sid Meyers Alpha Centuri".
- Update the site's CSS (global stylesheet or equivalent styling mechanism used by the repo) so that:
  - The `background-color` for the page/body (and any major structural containers that currently set a light/contrasting background) is set to a dark grey value.
  - The default text colour (`color` property) for body text, headings, and other textual elements is set to a bright green value.
- Apply changes consistently across all existing pages/templates in the site, not just the homepage.
- Adjust link colours only if leaving them unchanged would make them unreadable against the new dark grey background (minimum change needed for legibility); otherwise links may keep bright green like other text.

## 3. Out of scope

- Redesigning layout, structure, fonts, spacing, or any non-colour visual elements.
- Changing the site's actual name/branding anywhere other than the title text and site-name display (e.g. no changes to repo name, domain, favicon, logo image, README, or package metadata).
- Adding a theme switcher, dark/light mode toggle, or making the colours configurable/user-selectable.
- Accessibility/contrast auditing beyond basic legibility of links mentioned above (no WCAG compliance work, no colour-blind-safe palette selection).
- Any changes to functionality, content, routing, or data.
- Creating new pages or components.
- Editing the favicon or browser tab icon.

## 4. Edge cases and error behavior

- **Invalid input:** Not applicable — this is a static content/styling change with no user input to validate.
- **Dependency unavailable:** If the site uses an external CSS framework/theme (e.g. Bootstrap) with its own colour variables, the change should override those variables/rules rather than fighting them at the component level; if a build step or asset pipeline is unavailable, the change cannot be verified and should be flagged rather than silently skipped.
- **Inline/hardcoded colours:** If some pages/templates set text or background colours inline (not via the shared stylesheet), those will not be updated by a global CSS change and must be identified and changed individually, or explicitly called out as remaining exceptions.
- **Elements with colour tied to state or meaning:** If any existing styling uses colour to convey status (e.g. red for errors, green for success), care should be taken not to make error states indistinguishable from normal text now that default text is also green; this should be flagged if found.
- **Title truncation:** No special handling needed; browsers will truncate long tab titles automatically — "Sid Meyers Alpha Centuri" is short enough not to be an issue.

## 5. Acceptance criteria

- [ ] The browser tab title on every page of the site reads exactly "Sid Meyers Alpha Centuri".
- [ ] Any on-page rendering of the site name (header/banner, meta tags) also reads "Sid Meyers Alpha Centuri".
- [ ] The page background colour on every page is a dark grey shade.
- [ ] All standard body text, headings, and navigation text render in a bright green colour on every page.
- [ ] Links remain visibly legible against the dark grey background (either bright green matching other text, or another sufficiently contrasting variant, per reviewer preference).
- [ ] No functional behavior of the site (routing, data, forms, etc.) is altered by this change.
- [ ] No other branding elements (logo, favicon, domain, repo metadata) are altered.

## 6. Open questions

- Is the spelling "Sid Meyers Alpha Centuri" intentional, or should it actually be "Sid Meier's Alpha Centauri" (the real game title)? Please confirm the exact string to use.
- Do you want specific exact colour values (hex codes) for "dark grey" and "bright green", or is it acceptable to use reasonable defaults chosen by the implementer?
- Should link colour and any status/alert colours (errors, warnings, success messages) be left as-is, or also converted to fit the new dark grey/bright green theme, and if so, how should error/success states remain distinguishable from normal text?
- Are there multiple templates/pages (e.g. admin views, error pages, print styles) that should be included, or should this apply only to the main public-facing pages?