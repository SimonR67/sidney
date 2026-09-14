   # Spec: Softpapaya Services Page

Status: draft
Job: 24ad0907-f4a5-4d87-9555-0239522ef9df
Target repo: SimonR67/sidney
Supersedes (partially): the existing homepage/index page currently in the repo (whatever file(s) currently render the site's root page — to be identified and replaced during implementation)

## 1. What should change and why

The repo currently contains some existing webpage that serves as the homepage. The request is to fully replace that page's content with a new, self-contained marketing page titled "Softpapaya Services", rebuilt to closely match the design and content structure of https://softpapaya.com/en/services/.

The problem this solves: the current page content is being discarded/superseded in favor of a specific new design brief (header/nav, hero, services grid, CTA band, footer) styled with a clean, modern, minimal aesthetic and a defined visual system (colors, typography, spacing, responsive behavior).

Interpretation chosen: "Replace the existing webpage" means this new page becomes the site's homepage/index (e.g. `index.html`), and any existing homepage content/markup is removed/overwritten rather than kept alongside the new page. Static reference styling from softpapaya.com is used as visual/structural inspiration only — no copied assets, code, or proprietary content are pulled from that live site; all copy is written fresh per the spec below.

## 2. Scope

In scope:
- A single new homepage (`index.html` or equivalent existing root file in the repo) with page title "Softpapaya Services".
- Semantic HTML5 structure using `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- **Header**: logo text "SoftPapaya" linked to `#` (home), horizontal nav with links: About, Services, Values, Team, Case Studies, Careers, Blog, Contact (all as placeholder `#` or in-page anchors, since no other pages/routes exist yet). A "TALK TO US" CTA button/link on the far right, styled with the accent color.
- **Hero section**: Heading "WHAT WE DO. AND WE DO IT REALLY WELL." plus a subheading paragraph describing building solutions for clients (original copy, ~1–2 sentences).
- **Services section**: Responsive grid/card layout (3 columns desktop, collapsing to 1 column mobile) listing exactly these 8 services, each with an H3 title, a short descriptive paragraph, and a short list/line of relevant technology tags:
  1. Custom Software
  2. Team Augmentation
  3. Cloud & Infrastructure
  4. AI & Automation
  5. Data Engineering
  6. Project Governance
  7. Rapid Proof of Concept
  8. UI/UX Design
  Cards have padding, subtle border or shadow, and ~15–20px gap spacing.
- **CTA section**: Heading "HAVE A PROJECT TO DISCUSS?", an invitation paragraph, and a button linking to a contact form or `mailto:` email address. Visually separated band (light gray `#F7F7F7` or dark contrasting background).
- **Footer**: Link columns for Services, Work, About, Careers (placeholder `#` links); a Contact section with an email link; a short company blurb; bottom bar with copyright notice and Privacy / Terms of Service links (placeholder `#` links).
- CSS implementing the specified visual style: white main background, near-black body text (#1A1A1A/#222222), bold/uppercase or title-case headings with tracked-out letter-spacing in dark tones (#111111–#333333), single vibrant accent color (~#0A66FF) for CTA buttons/hover states, rounded buttons (border-radius ~6–8px, padding ~12px 24px, medium-bold weight), clean sans-serif typography (Inter/Helvetica Neue/Arial fallback stack), max-width ~1200px centered container with responsive horizontal padding, full responsiveness including nav collapse behavior and card stacking on mobile.
- CSS delivered either as a separate `.css` file linked from the page, or an embedded `<style>` block — either is acceptable.
- This page becomes the repo's homepage/index, replacing prior homepage content.

Out of scope items are listed explicitly in Section 3.

## 3. Out of scope

- Building out real destination pages/routes for About, Services, Values, Team, Case Studies, Careers, Blog, Contact, Privacy, Terms of Service, or footer link columns (Services/Work/About/Careers) — these remain placeholder links (`#`, in-page anchors, or `mailto:` for contact) unless explicitly requested later.
- A functioning mobile hamburger menu / JS-driven nav toggle beyond basic responsive CSS collapse/stacking, unless minimal CSS-only responsive behavior is sufficient (no JavaScript framework or interactivity library is in scope).
- A working, backend-connected contact form (form submission handling, validation, email sending, spam protection). The CTA/contact button will link to a `mailto:` address or a placeholder anchor, not a functioning form backend.
- Copying actual text, images, logos, or proprietary assets from softpapaya.com — only the structural/design pattern described in this spec is replicated, using original placeholder copy.
- SEO optimization work (meta tags beyond a basic `<title>`, structured data, sitemap, analytics integration).
- Any content management system, templating engine, or build pipeline — this is a static HTML/CSS page.
- Preserving or merging any content from the previous existing homepage; it is fully replaced, not appended to.
- Cross-browser testing beyond modern evergreen browsers (no legacy IE support).
- Accessibility audit beyond using semantic HTML and reasonable contrast per the given color spec (no full WCAG compliance certification).
- Multi-language/i18n support (the reference site has an `/en/` path but this feature is English-only, single locale).

## 4. Edge cases and error behavior

- **Missing/placeholder links (`#`)**: Clicking nav items, footer links, or CTA links that have no real destination should not cause a broken page — they should behave as inert anchors (e.g. `href="#"` or same-page anchors) and not throw JS errors, since no JavaScript routing is in scope.
- **Very small viewports**: Services grid must degrade to a single column without horizontal overflow or clipped text; nav must not overlap or clip the CTA button on narrow screens.
- **Long service descriptions or tag lists**: Cards should not break the grid layout if text wraps to multiple lines — card heights may vary but should not overlap columns.
- **No JavaScript dependency**: The page must render and be fully readable/usable with JavaScript disabled, since it is a static HTML/CSS deliverable.
- **Missing font**: If the specified webfont ('Inter') is not loaded (e.g. no internet/CDN access), the fallback stack (Helvetica Neue, Arial, sans-serif) must render legibly without layout breakage.
- **Existing repo file conflicts**: If the current homepage file has a different filename/location than expected (e.g. not `index.html`), the implementer must identify the actual served homepage file and replace/redirect it accordingly rather than leaving two competing homepages.

## 5. Acceptance criteria

- [ ] Repo's homepage (whatever file is served at the site root) renders a page with `<title>Softpapaya Services</title>` (or equivalent visible page title).
- [ ] Previous homepage content is no longer present/served; the new page fully replaces it.
- [ ] Header contains "SoftPapaya" logo linked to `#`, nav with all 8 specified links (About, Services, Values, Team, Case Studies, Careers, Blog, Contact), and a "TALK TO US" CTA styled with the accent color.
- [ ] Hero section displays the exact heading "WHAT WE DO. AND WE DO IT REALLY WELL." with a subheading paragraph.
- [ ] Services section renders all 8 named services (exact titles as listed), each with an H3, description paragraph, and a tag/tech list, in a responsive grid that is 3 columns on desktop and 1 column on narrow/mobile viewports, with visible card padding and border/shadow.
- [ ] CTA section displays heading "HAVE A PROJECT TO DISCUSS?", an invitation paragraph, and a working button/link (mailto or anchor) on a visually distinct background band.
- [ ] Footer includes four link columns (Services, Work, About, Careers), a Contact section with an email link, a short company blurb, and a bottom bar with copyright text plus Privacy and Terms of Service links.
- [ ] Page uses semantic HTML5 tags (`header`, `nav`, `main`, `section`, `footer`).
- [ ] Styling matches the specified visual system: white/light backgrounds, dark near-black body text, bold tracked headings, single accent color (~#0A66FF) used consistently on CTAs/hover, rounded buttons with specified padding, sans-serif typography, ~1200px max-width centered container.
- [ ] Page is responsive: verified at common breakpoints (e.g. ~375px mobile, ~768px tablet, ~1200px+ desktop) with no horizontal scroll/overflow and cards/nav behaving as specified.
- [ ] Page functions with JavaScript disabled (no broken layout or non-functional critical content).
- [ ] CSS is delivered as either a linked stylesheet file or an embedded `<style>` block — no external CSS framework dependency required unless the implementer chooses one and documents it.

## 6. Open questions

- What is the actual current homepage file/path in the repo (e.g. `index.html`, `index.php`, a templated view)? This needs to be confirmed so the "replace" instruction targets the correct file rather than creating a duplicate.
- Should the "TALK TO US" CTA and footer "Contact"/CTA-section button all point to the same destination (e.g. a single `mailto:` address), or should they differ? A specific contact email address was not provided — should a placeholder like `hello@softpapaya.com`-style address be used, or should these link to `#` pending real contact info?
- Should nav links (About, Services, Values, etc.) point to in-page anchor sections on this same single-page layout (e.g. `#services`, `#team`) where corresponding sections exist, and to plain `#` placeholders where no section exists (e.g. Team, Case Studies, Careers, Blog have no dedicated sections in this spec)? Confirming this affects whether we build extra placeholder sections or leave those as inert links.
- Is a mobile hamburger menu expected/desired, or is simple CSS wrapping/stacking of nav links on small screens acceptable? The spec says "nav collapses appropriately on mobile" but explicitly excludes JS interactivity from scope — want to confirm CSS-only collapse (e.g. wrapped/stacked links) is sufficient.
- Any specific logo image/favicon requirements, or is text-only "SoftPapaya" logo acceptable for this build?