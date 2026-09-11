# Plan: Update site title and site-wide colour scheme

Status: draft
Job: dfbfe75a-24f1-404d-804f-05a044162974
Spec: https://github.com/SimonR67/sidney/blob/main/specs/dfbfe75a-24f1-404d-804f-05a044162974/spec.md

## 1. Definition of done

- The `<title>` tag and any rendered branding/heading text reads exactly `Sid Meyers Alpha Centuri` on every page.
- No leftover occurrences of the old site title remain in title/branding contexts (unrelated copy mentioning the real game name, if any, is left untouched).
- The site-wide/global stylesheet sets the page/body background to a dark grey hex value (e.g. `#2b2b2b`) applied across all pages that inherit the shared layout.
- The site-wide/global stylesheet sets body/lettering text colour to Gold (e.g. `#FFD700`) applied across all pages that inherit the shared layout.
- No occurrence of the previous text colour or of "bright green" remains anywhere in the shipped styling.
- Fonts, font sizes, spacing, layout, navigation, images, and logos are unchanged.
- Any inline styles or component-level colour overrides that don't inherit from the global stylesheet are identified and flagged (not silently left inconsistent).

## 2. File map

| File | Change |
|---|---|
| Site config / template defining `<title>` (e.g. `_config.yml`, `config.toml`, or layout template with hardcoded `<title>`) | Update site title value to `Sid Meyers Alpha Centuri` |
| Header/branding component/template (e.g. `layouts/partials/header.html`, `templates/base.html`, or equivalent) | Update rendered site-name/branding text to `Sid Meyers Alpha Centuri` |
| Global/site-wide stylesheet (e.g. `static/css/style.css`, `assets/css/main.css`, or equivalent) | Update `body`/global selector background colour to dark grey (e.g. `#2b2b2b`) and text colour to Gold (e.g. `#FFD700`) |
| Any page templates/components found using inline styles or hardcoded colours that bypass the global stylesheet | Flag in a code comment or issue note; update only if they directly inherit the global background/text colour being replaced |

## 3. User journey

A visitor opens any page of the site. The browser tab shows "Sid Meyers Alpha Centuri" as the title, and any on-page branding/heading element shows the same text. The page background renders as dark grey, and all body text renders in Gold with clearly legible contrast against the background. Navigating to any other page on the site (not just the homepage) shows the same title and colour scheme, since both are driven by the shared layout/stylesheet. No other visual aspects of the site (fonts, spacing, images, layout) have changed.

## 4. Tasks

- [ ] 1. Update the single source of truth for the site title (config value or `<title>` template) to `Sid Meyers Alpha Centuri` — files: site config / base layout template — test: render the `<title>` tag on the homepage and one other page, assert exact string match `Sid Meyers Alpha Centuri`
- [ ] 2. Update any header/branding component that separately renders the site name as a heading/logo text — files: header/branding partial or component — test: render a page, assert the branding element's text content equals `Sid Meyers Alpha Centuri`
- [ ] 3. Grep the codebase for other hardcoded occurrences of the old site title used specifically as branding/title (not unrelated copy) and update them — files: any templates found containing the old title string — test: repo-wide search confirms no remaining branding/title occurrences of the old string
- [ ] 4. Update global stylesheet body/background rule to dark grey (define and use one hex value, e.g. `#2b2b2b`) — files: global CSS file — test: computed/rendered background colour on homepage and one other page equals the chosen dark grey hex value
- [ ] 5. Update global stylesheet body/text colour rule to Gold (define and use one hex value, e.g. `#FFD700`) — files: global CSS file — test: computed/rendered text colour on homepage and one other page equals the chosen gold hex value
- [ ] 6. Search stylesheet and templates for any remaining reference to the previous text colour or to "green" and remove/replace — files: global CSS file, any component CSS inheriting global colours — test: search confirms zero occurrences of old colour values or "green" in shipped CSS
- [ ] 7. Identify any inline styles or component-level colour overrides that bypass the global stylesheet's background/text colour — files: any templates/components found with inline `style` attributes or scoped colour rules — test: manual/documented list of flagged locations, with confirmation each either inherits (and thus already updated) or is explicitly noted as out-of-scope override

## 5. Test plan

- Automated (or scripted manual) check that loads at least two distinct pages (homepage + one other) and asserts: `<title>` equals `Sid Meyers Alpha Centuri`, branding element text equals the same string, computed body background colour equals the chosen dark grey hex, and computed body text colour equals the chosen gold hex.
- Repo-wide text search confirming no remaining occurrences of the old site title in title/branding contexts, and no remaining occurrences of the old text colour value or "bright green" in CSS/styling files.
- Visual spot-check across all pages using the shared layout (not just homepage) to confirm consistent application of title and colours.
- Basic contrast sanity check (e.g. simple contrast ratio calculation) between the chosen Gold and dark grey values to confirm legibility, per acceptance criteria.
- Confirm no unrelated changes: diff review to ensure fonts, spacing, layout, navigation, and images are untouched.

## 6. Out of scope (carried from spec)

- No changes to site structure, layout, navigation, or content beyond the title string and colour values.
- No changes to fonts, font sizes, spacing, or other non-colour styling attributes.
- No per-page or per-section colour overrides (e.g. buttons, links, code blocks) unless they directly inherit from the global colours being changed — no new themed components.
- No dark-mode/light-mode toggle or multiple theme support.
- No changes to images, logos, or icons, even if they visually clash with the new colour scheme.
- No full WCAG accessibility audit — only basic contrast sanity-checking.
- No renaming of the repo, domain, or internal identifiers/config keys beyond the user-facing title string.