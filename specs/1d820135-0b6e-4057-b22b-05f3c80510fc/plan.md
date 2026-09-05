# Plan: Rename site branding to "Sid Meyer - Brave New Worlds"

Status: draft
Job: 1d820135-0b6e-4057-b22b-05f3c80510fc
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/1d820135-0b6e-4057-b22b-05f3c80510fc/spec.md

## 1. Definition of done

- A repo-wide, case-insensitive search for the current/old site branding string returns no remaining occurrences intended as branding (except items explicitly flagged as out-of-scope, e.g. baked-in logo images).
- Every page's `<title>` tag renders "Sid Meyer - Brave New Worlds" or a pattern that includes this exact string (e.g. "{Page} | Sid Meyer - Brave New Worlds").
- Header/nav and footer text branding reads exactly "Sid Meyer - Brave New Worlds".
- All relevant `<meta>` tags (`description`, `og:title`, `og:site_name`, `twitter:title`, etc.) referencing site name use the new string.
- README.md title/description reflects the new name.
- `package.json` `name`/`description` updated only where they represent human-facing branding and only if doing so doesn't break build/tooling.
- If a central constant/config drives the title, it is updated at the source rather than patched per-usage.
- Any occurrence embedded in an image/logo graphic is flagged, not silently skipped, and not silently changed.
- Site builds and runs successfully after the change — no broken references.
- No functional, layout, styling, or routing changes anywhere in the diff.

## 2. File map

| File | Change |
|---|---|
| (discovery output — TBD once repo searched) index/layout/template files with `<title>` tags | Replace old branding string with "Sid Meyer - Brave New Worlds" (preserving any "{Page} \| X" pattern) |
| Header/nav component/template (e.g. `Header.*`, `Nav.*`, layout partial) | Replace logo/site-name text with new string |
| Footer component/template (e.g. `Footer.*`) | Replace copyright/"Powered by" text referencing site name with new string |
| HTML `<head>` / meta tag source (e.g. `index.html`, `_document.*`, `layout.*`, SEO/meta component) | Update `description`, `og:title`, `og:site_name`, `twitter:title` values |
| `README.md` | Update title heading and descriptive text referencing site name |
| `package.json` | Update `name`/`description` only if human-facing branding and not used as build/import identifier |
| Central config/constant file if one exists (e.g. `siteConfig.*`, `constants.*`, `.env`, CMS config) | Update the single source-of-truth branding string |
| Any other file surfaced by full-repo text search containing the old branding string | Update to new string, or flag in PR notes if it's an image/logo asset |

## 3. User journey

A visitor loads any page of the site: the browser tab shows "Sid Meyer - Brave New Worlds" (optionally prefixed by the page name). The header/nav displays the same new name as the site logo/brand text. Scrolling to the footer, any copyright or "powered by" line also reads the new name. If the visitor shares the page link on social media, the link preview (driven by `og:title`/`og:site_name`/`twitter:title` meta tags) shows the new branding. A developer cloning the repo sees the new name in `README.md` and, if applicable, in `package.json`'s human-readable fields. No page layout, navigation behavior, or functionality has changed — only the text strings are different, and the site still builds and runs exactly as before.

## 4. Tasks

- [ ] 1. Perform a full-repo, case-insensitive text search for the current site branding string and compile a definitive list of every file/line occurrence (including HTML/templates, config/constants, README, package.json, and any image/SVG filenames with embedded text) — files: none changed, produces an inventory — test: search command output is captured and reviewed; every occurrence is categorized as (a) to-update, (b) out-of-scope image/logo, or (c) unrelated internal identifier (per spec exclusions)
- [ ] 2. Update all `<title>` tags / title-generating logic (or central title constant/config if one exists) to render "Sid Meyer - Brave New Worlds", preserving any existing "{Page} | X" pattern — files: layout/template files or central title source identified in task 1 — test: for each route/page, assert rendered `document.title` (or server-rendered `<title>` content) equals the new string or matches the "{Page} | Sid Meyer - Brave New Worlds" pattern
- [ ] 3. Update header/nav logo or site-name text to the new branding string — files: header/nav component(s) — test: snapshot/DOM test asserting header element's text content equals "Sid Meyer - Brave New Worlds"
- [ ] 4. Update footer branding/copyright text (if present) to the new branding string — files: footer component(s) — test: DOM test asserting footer text contains "Sid Meyer - Brave New Worlds" and no longer contains the old name
- [ ] 5. Update meta tags (`description`, `og:title`, `og:site_name`, `twitter:title`, and any other branding-bearing meta tags) to the new string — files: head/meta template or SEO component — test: parse rendered HTML `<head>` and assert each targeted meta tag's `content` attribute equals or includes the new string
- [ ] 6. Update `README.md` title heading and descriptive text referencing the old site name — files: `README.md` — test: text assertion/grep confirms README contains "Sid Meyer - Brave New Worlds" and no longer contains the old name in branding context
- [ ] 7. Review and conditionally update `package.json` `name`/`description` — files: `package.json` — test: if changed, run the project's install/build script to confirm no broken references to the package name; if left unchanged (machine slug), add a code comment/PR note explaining why, and assert `description` (if it was human-facing) now contains the new string
- [ ] 8. Sweep any remaining occurrences surfaced in task 1 that don't fall under tasks 2–7 (e.g. env vars, CMS config, other constants files) — files: as identified — test: re-run the repo-wide search from task 1 and confirm zero remaining old-name occurrences outside explicitly flagged exceptions
- [ ] 9. Flag any branding occurrence embedded in an image/logo graphic as out-of-scope/needs-follow-up rather than silently leaving or altering it — files: PR description / plan notes (no code change) — test: manual review confirms the flagged item is documented, not silently skipped

## 5. Test plan

- Run the full test suite (unit/DOM/snapshot tests from tasks 2–6) together to confirm no regressions between them.
- Re-run the repo-wide case-insensitive search for the old branding string after all tasks are complete; confirm the only remaining hits are the explicitly flagged out-of-scope items (e.g. image/logo files) documented in task 9.
- Run the project's build/start command (whatever the repo uses — e.g. `npm run build && npm start` or static site generator build) to confirm the site builds and serves without errors after all renames.
- Manually load each distinct page/route in a browser (or via a rendered HTML snapshot) and visually confirm: tab title, header, footer, and view-source meta tags all show "Sid Meyer - Brave New Worlds".
- Diff the full changeset against the spec's out-of-scope list to confirm no layout, styling, functionality, routing, or unrelated content changed — only branding text.

## 6. Out of scope (carried from spec)

- Any redesign of header, footer, or navigation layout/styling/positioning — text content only.
- Any changes to site functionality, routing, page content, or data beyond the literal name/title strings.
- Renaming the GitHub repository (`SimonR67/sidney`) itself.
- Renaming internal code identifiers, variable/class names, or file names unrelated to user-facing branding (e.g. do not rename a `SidneyApp` class or `sidney.js` file), unless required to keep a config value consistent and trivial/low-risk.
- Domain name changes, URL changes, or redirects.
- Logo image/graphic redesign — if the "logo" is an image/SVG with text baked in, that is out of scope for this text-only pass; flag it instead of altering or silently skipping it.
- Updating third-party integrations, external listings, or social media profile names outside this codebase.
- SEO strategy changes beyond the literal text swap.