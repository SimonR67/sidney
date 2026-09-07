# Plan: Rebuild website as "Strange New Worlds"

Status: draft
Job: 8393b537-ac67-46f5-b4e0-0b0d2e416f06
Spec: https://github.com/SimonR67/dev-manager-pilot/blob/main/specs/8393b537-ac67-46f5-b4e0-0b0d2e416f06/spec.md

## 1. Definition of done

- Site title "Strange New Worlds" appears in the browser tab (`<title>`) and visibly on every page/section.
- A three-item nav menu (Home, About Us, Contact) is present and functional on every page.
- Home shows a simple welcome/intro message.
- About Us shows placeholder text (e.g. "Coming soon").
- Contact shows placeholder text (e.g. "Coming soon").
- Every page/section has a dark green background and gold-coloured text, including the nav, with legible contrast.
- No pages/features exist beyond Home, About Us, Contact (no forms, no extra content).
- Layout is simple: no grids, sliders, animations, or multi-column layouts.
- No links are broken; About Us and Contact always resolve to their placeholder content, never a 404.

## 2. File map

| File | Change |
|---|---|
| index.html | Rebuilt as the Home page: site title, nav menu (Home/About Us/Contact), welcome content, dark green/gold styling hook |
| about.html | New page: nav menu, "About Us" heading, placeholder "Coming soon" text |
| contact.html | New page: nav menu, "Contact" heading, placeholder "Coming soon" text |
| style.css | New/rebuilt shared stylesheet: dark green background, gold text, nav styling, simple layout rules used by all three pages |
| (any pre-existing site files not matching the above, e.g. old index/assets) | Removed or replaced as part of the wholesale rebuild, per spec's "supersedes: none — rebuilds wholesale" note |

## 3. User journey

A visitor lands on `index.html` (Home). They see the page title "Strange New Worlds" in the browser tab and as a heading on the page, a dark green background with gold text throughout, and a nav bar with three links: Home, About Us, Contact. The Home page shows a short welcome message. Clicking "About Us" takes them to `about.html`, which keeps the same nav, colours, and title, but shows only placeholder text like "Coming soon." Clicking "Contact" takes them to `contact.html`, same styling, same nav, placeholder "Coming soon" text. Clicking "Home" from either page returns them to the welcome content. At no point does a nav link lead to a missing/broken page, and no forms, extra pages, or interactive elements are present anywhere.

## 4. Tasks

- [ ] 1. Create shared stylesheet with dark green background + gold text base rules — files: style.css — test: grep style.css confirms `background-color` set to a dark green value and `color` set to a gold value on `body` (or equivalent global selector)
- [ ] 2. Build Home page (index.html) with title, nav, and welcome content, linked to style.css — files: index.html, style.css — test: index.html contains `<title>Strange New Worlds</title>`, a heading with "Strange New Worlds", a nav with links to index.html/about.html/contact.html, and a welcome sentence
- [ ] 3. Build About Us page (about.html) with nav and placeholder content — files: about.html — test: about.html contains the same nav (3 links) and placeholder text (e.g. "Coming soon") with no other content beyond heading/nav
- [ ] 4. Build Contact page (contact.html) with nav and placeholder content — files: contact.html — test: contact.html contains the same nav (3 links) and placeholder text (e.g. "Coming soon"), no form elements present
- [ ] 5. Style the nav menu consistently across all pages (dark green/gold, simple layout, no extras) — files: style.css, index.html, about.html, contact.html — test: nav markup/classes identical across all three files; visually/CSS-inspected background/text colours match spec on nav specifically (not just body)
- [ ] 6. Verify legibility/contrast of chosen gold-on-dark-green shades — files: style.css — test: manual check (or contrast-ratio tool) confirms chosen hex values meet a reasonable readability threshold (e.g. WCAG AA-ish, not a hard requirement but sanity-checked)
- [ ] 7. Remove/replace any pre-existing site files not part of the new three-page structure — files: (old site files identified in repo) — test: repo listing shows only index.html, about.html, contact.html, style.css (plus any unrelated repo files like README/config) — no leftover old pages/assets
- [ ] 8. Cross-check all nav links resolve correctly (no 404s) — files: index.html, about.html, contact.html — test: manually follow every nav link from every page and confirm it loads the correct corresponding page with no missing-file errors

## 5. Test plan

After all tasks are complete, do a full manual walkthrough matching the user journey in section 3: open index.html in a browser, confirm title/tab text, confirm dark green/gold styling on Home, click through to About Us and Contact and back to Home via nav, confirming each page keeps consistent styling, nav presence, and correct placeholder/intro content. Diff the final file set against the repo's prior contents to confirm no unrelated pages, forms, or features remain (satisfying the "wholesale rebuild" and "no unrelated features" acceptance criteria). Optionally run an HTML validator against all three pages to catch structural errors, and spot-check contrast of the final gold/green hex values.

## 6. Out of scope (carried from spec)

- Real/final content for About Us and Contact — placeholder text only.
- Any contact form, email integration, or working contact functionality.
- User accounts, authentication, or dynamic/backend functionality.
- Blog, gallery, e-commerce, search, or any pages/features beyond Home, About Us, Contact.
- Responsive/mobile-specific design work beyond basic non-broken behavior.
- SEO optimization, analytics integration, or performance tuning.
- Custom fonts, icons, imagery, or branding assets beyond the specified colour scheme, unless trivial.
- Animations, transitions, or interactive UI flourishes.
- Formal accessibility audit/compliance work (sensible semantic HTML only, not a hard requirement).
- Deployment/hosting setup, unless an existing pipeline is already in place to slot into.