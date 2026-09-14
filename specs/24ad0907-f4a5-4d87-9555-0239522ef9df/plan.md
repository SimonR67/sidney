# Plan: Softpapaya Services Page

Status: draft
Job: 24ad0907-f4a5-4d87-9555-0239522ef9df
Spec: https://github.com/SimonR67/sidney/blob/main/specs/24ad0907-f4a5-4d87-9555-0239522ef9df/spec.md

## 1. Definition of done

- The file served at the repo's root/homepage renders `<title>Softpapaya Services</title>` and contains no leftover content from the previous homepage.
- Page uses semantic HTML5 (`header`, `nav`, `main`, `section`, `footer`).
- Header has "SoftPapaya" logo linked to `#`, nav with all 8 links (About, Services, Values, Team, Case Studies, Careers, Blog, Contact), and a "TALK TO US" CTA styled with the accent color.
- Hero section shows exact heading "WHAT WE DO. AND WE DO IT REALLY WELL." plus an original subheading paragraph.
- Services section shows all 8 named services (Custom Software, Team Augmentation, Cloud & Infrastructure, AI & Automation, Data Engineering, Project Governance, Rapid Proof of Concept, UI/UX Design), each with H3, description, tag list, in a responsive grid (3 columns desktop, 1 column mobile), with card padding/border/shadow.
- CTA band shows "HAVE A PROJECT TO DISCUSS?" heading, invitation copy, and a working button (mailto or anchor) on a visually distinct background.
- Footer has 4 link columns (Services, Work, About, Careers), a Contact section with email link, a company blurb, and a bottom bar with copyright + Privacy/Terms links.
- CSS (linked file or embedded `<style>`) implements the specified visual system: white background, near-black text, bold tracked headings, single accent color (~#0A66FF), rounded buttons, sans-serif stack with fallback, ~1200px centered container.
- Page is responsive at ~375px/768px/1200px+ with no horizontal overflow, and fully usable with JavaScript disabled.
- No duplicate/competing homepage files remain in the repo.

## 2. File map

| File | Change |
|---|---|
| index.html (or whichever file is confirmed as the current served homepage) | Fully replaced with new semantic markup: header/nav, hero, services grid, CTA band, footer |
| styles/main.css (new, or embedded `<style>` in index.html if simpler) | New stylesheet implementing colors, typography, spacing, responsive grid/nav rules |
| any old homepage-only assets no longer referenced (e.g. old inline `<style>`, old images/partials unique to the previous homepage) | Removed if now orphaned, once confirmed unused elsewhere |

## 3. User journey

A visitor navigates to the site's root URL. They see a header with the "SoftPapaya" logo, a horizontal nav (About, Services, Values, Team, Case Studies, Careers, Blog, Contact), and a "TALK TO US" button in the accent color. Scrolling down, they see a bold hero statement ("WHAT WE DO. AND WE DO IT REALLY WELL.") with a short descriptive subheading. Below that, a 3-column grid (collapsing to 1 column on mobile) presents 8 service cards, each with a title, short description, and tech tags. Further down, a visually distinct CTA band invites them to discuss a project, with a button that opens their email client (`mailto:`) or an anchor link. At the bottom, a footer offers placeholder link columns (Services, Work, About, Careers), a contact email, a short company blurb, and copyright/legal links. All placeholder links (`#`) are inert but don't break the page or throw errors, and the whole experience works identically with JavaScript disabled.

## 4. Tasks

- [ ] 1. Identify the actual current homepage file/path served at the site root — files: repo root (read-only investigation) — test: a documented note/commit message confirms the exact file (e.g. `index.html`) that will be replaced, with no ambiguity about competing homepage candidates.
- [ ] 2. Remove/replace prior homepage content and scaffold new semantic HTML5 skeleton with correct `<title>Softpapaya Services</title>` — files: index.html (or confirmed target file) — test: viewing page source shows the new title tag and none of the old homepage's markup/text remains; `header`, `nav`, `main`, `footer` tags are present.
- [ ] 3. Build header/nav markup: "SoftPapaya" logo linked to `#`, all 8 nav links, "TALK TO US" CTA element — files: index.html — test: DOM query confirms logo anchor text and href, exactly 8 nav `<a>` elements with correct labels, and one CTA element with the correct label present.
- [ ] 4. Build hero section markup with exact heading text and original subheading paragraph — files: index.html — test: DOM query finds an `<h1>` (or equivalent) with exact text "WHAT WE DO. AND WE DO IT REALLY WELL." and a sibling paragraph with non-empty original copy.
- [ ] 5. Build services grid markup with all 8 service cards (H3, description, tag list) in correct order — files: index.html — test: DOM query counts exactly 8 `<h3>` elements matching the required titles in order, each followed by a description paragraph and a tag list element.
- [ ] 6. Build CTA band markup (heading, invitation paragraph, button linking to mailto/anchor) with distinct background container — files: index.html — test: DOM query finds heading text "HAVE A PROJECT TO DISCUSS?", a paragraph, and a link/button whose `href` starts with `mailto:` or `#`.
- [ ] 7. Build footer markup: 4 link columns (Services, Work, About, Careers), Contact section with email link, company blurb, bottom bar with copyright + Privacy/Terms links — files: index.html — test: DOM query finds 4 labeled link columns with placeholder `#` links, one `mailto:` link in Contact, and a bottom bar containing copyright text plus 2 legal links.
- [ ] 8. Author base CSS: colors, typography (Inter with fallback stack), max-width container, button styling (rounded, padding, accent color) — files: styles/main.css (or `<style>` block in index.html) — test: computed styles on sampled elements (body, h1/h2, `.cta-button`) match spec values (e.g. background #FFFFFF, text color in #1A1A1A–#222222 range, button border-radius 6–8px, accent color #0A66FF) verified via a manual/automated style check.
- [ ] 9. Implement responsive grid and nav collapse behavior across breakpoints (~375px, ~768px, ~1200px+) — files: styles/main.css — test: at ≤375px viewport, services grid renders as 1 column and nav does not overlap/clip the CTA button; at ≥1200px, grid renders as 3 columns; no horizontal scrollbar/overflow at any breakpoint (verified via browser devtools/responsive test harness).
- [ ] 10. Verify no-JS and missing-font fallback behavior — files: index.html, styles/main.css — test: with JavaScript disabled in browser, all sections render and links remain clickable/inert without console errors; with the CDN/font blocked, text still renders legibly using the fallback stack with no layout breakage.
- [ ] 11. Clean up orphaned old-homepage assets and confirm single homepage source of truth — files: any now-unused old homepage files/assets identified in Task 1 — test: repo search confirms no other file serves competing homepage content at the root, and site root loads only the new page.

## 5. Test plan

- Manual/browser-based walkthrough of the full page at three breakpoints (375px, 768px, 1200px+) confirming: no horizontal overflow, nav/CTA button don't clip or overlap, services grid stacks/expands correctly, and all sections render in the correct order (header → hero → services → CTA band → footer).
- Full-page DOM/content check against the acceptance criteria checklist in the spec: title tag, header/nav/CTA presence, exact hero heading text, all 8 service titles present with descriptions and tags, CTA band heading/copy/button, footer's 4 columns + contact + bottom bar links.
- JavaScript-disabled pass: load the page with JS disabled and confirm all content is visible and all links are inert-but-non-breaking (no console errors, no missing content).
- Font-fallback pass: block external font loading (e.g. via devtools network blocking) and confirm fallback sans-serif stack renders without layout breakage.
- Regression check: confirm the previously existing homepage content/file is fully gone (grep repo for old homepage-specific strings/markup) and no duplicate homepage file remains being served.
- Visual spot-check of the color/typography system against the spec's hex values and spacing/padding figures (accent #0A66FF, container max-width ~1200px, button padding ~12px 24px, card gap ~15–20px).

## 6. Out of scope (carried from spec)

- Building real destination pages/routes for About, Services, Values, Team, Case Studies, Careers, Blog, Contact, Privacy, Terms of Service, or footer link columns — all remain placeholder (`#`, in-page anchor, or `mailto:`) links.
- A functioning mobile hamburger menu or JS-driven nav toggle — only CSS-only responsive collapse/stacking is in scope; no JS framework/interactivity library.
- A working, backend-connected contact form (submission handling, validation, email sending, spam protection) — CTA/contact links use `mailto:` or placeholder anchors only.
- Copying actual text, images, logos, or proprietary assets from softpapaya.com — structural/design pattern only, with original placeholder copy.
- SEO optimization beyond a basic `<title>` tag (no meta tag suite, structured data, sitemap, or analytics integration).
- Any CMS, templating engine, or build pipeline — static HTML/CSS only.
- Preserving or merging any content from the previous homepage — it is fully replaced, not appended to.
- Cross-browser testing beyond modern evergreen browsers (no legacy IE support).
- Full WCAG accessibility audit/certification — semantic HTML and reasonable contrast only.
- Multi-language/i18n support — English-only, single locale.