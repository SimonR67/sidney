   # Spec: Site-wide faint background watermark (Wroclaw.jpg)

Status: draft
Job: aea7c6d4-8f64-4957-8f2d-8392a0fce7cb
Target repo: SimonR67/sidney
Supersedes (partially): none — new capability

## 1. What should change and why

The user wants a subtle, low-opacity background watermark image applied across every page of the site, using the existing `Wroclaw.jpg` image already present in the repository. The goal is a purely decorative, additive visual touch — the watermark should be visible enough to notice on close inspection but faint enough that it never interferes with reading text or interacting with the site.

Interpretation chosen: this is implemented as a CSS-only change (background-image on `body` or a shared layout/main wrapper, or a low-opacity overlay element positioned behind content), applied globally so it appears consistently on every page without needing to touch individual page templates beyond whatever shared layout/partial/base template already wraps all pages. No new build tooling, image processing pipeline, or JS is assumed to be necessary — this should be achievable with existing static assets and CSS.

If the site does not currently have a single shared layout/base template that wraps all pages, the fallback interpretation is to add the CSS rule to a global stylesheet that is already included on every page, and reference `Wroclaw.jpg` from its existing location in the repo (adjusting the relative path as needed) — not to duplicate the image or move it.

## 2. Scope

- Add a CSS rule (in the site's existing global/shared stylesheet, or a new small stylesheet block if none exists) that applies `Wroclaw.jpg` as a background image on the `body` element or the main page wrapper/container used across all pages.
- Set the image opacity to a low value in the ~5-10% range, using one of:
  - `opacity` on a dedicated background layer/pseudo-element positioned behind all content, or
  - a background-image combined with a CSS technique (e.g. `background-blend-mode`, a semi-transparent overlay `::before`/`::after` pseudo-element) that achieves an equivalently faint visual result without touching the actual image file or affecting foreground content opacity.
- Ensure the background image is positioned/sized responsively (e.g. `background-size: cover` or `contain` with `background-position: center`, and `background-attachment: fixed` where supported, with a sensible fallback for mobile where `fixed` attachment can be unreliable/costly).
- Ensure the watermark layer has the lowest stacking context (`z-index`) relative to all existing content so it never sits on top of or obscures text, images, or interactive elements.
- Verify no layout shift, no new horizontal scrollbars, and no visible distortion/stretching of the image on both common desktop widths and common mobile viewport widths.
- Reference the image via its existing path in the repo — no duplication, renaming, resizing, or recompression of `Wroclaw.jpg`.

## 3. Out of scope

- Replacing, cropping, resizing, compressing, or otherwise editing `Wroclaw.jpg` itself.
- Using a different image, adding new image assets, or letting the watermark be user/page configurable.
- Any changes to existing layout, spacing, colors, typography, component structure, navigation, or content on any page.
- Adding a settings/toggle to turn the watermark on or off (no admin UI, no per-page override).
- Making the watermark interactive, clickable, or animated.
- Any JavaScript-based image loading, lazy-loading, or dynamic watermark positioning — this is intended to be a static CSS-only effect.
- SEO, accessibility labeling, or alt-text considerations for the watermark (it is a pure CSS background, not an `<img>` tag, so no alt text applies).
- Print stylesheet handling (unless the existing site already has one, in which case leave it untouched — don't add the watermark to print output).
- Performance optimization of the image file itself (e.g. converting to WebP) — only its usage as a CSS background is in scope.

## 4. Edge cases and error behavior

- **Image fails to load / path incorrect:** The site must continue to render normally with no watermark shown; this must not break layout, throw console errors that affect functionality, or cause any visible broken-image icon (background-image failures are silent by default, which is the desired behavior).
- **Very small mobile viewports:** Confirm `background-size: cover`/`contain` prevents distortion and that no horizontal scrollbar is introduced regardless of image aspect ratio vs. viewport aspect ratio.
- **`background-attachment: fixed` on mobile Safari/older mobile browsers:** Since this property is known to behave inconsistently or perform poorly on some mobile browsers, use a fallback (e.g. `scroll` attachment on mobile via a media query) rather than forcing `fixed` everywhere, to avoid jank or unexpected rendering.
- **Pages with dark or light background colors / varying content density:** The watermark opacity must remain low enough (~5-10%) that it doesn't reduce text contrast or readability on any existing page, regardless of that page's background color.
- **Pages with existing background images or colors set on `body`:** If any page or component already sets its own background, the watermark must not conflict with or hide that background — layering approach (e.g. pseudo-element behind content) should be chosen if a direct `body` background would collide with existing styles.
- **High-DPI / retina screens:** No special retina asset is required since this is a large, low-opacity background image; visual softness at high zoom levels is acceptable and not treated as a bug.

## 5. Acceptance criteria

- [ ] `Wroclaw.jpg` (unmodified, existing file) appears as a faint background on every page of the site.
- [ ] Watermark opacity is in the ~5-10% range (or visually equivalent faintness via an overlay technique) on all pages.
- [ ] No existing text, images, links, buttons, or other content is visually obscured, discolored, or made harder to read because of the watermark.
- [ ] No changes to existing layout, spacing, fonts, or colors elsewhere on the site — a visual diff of any page (minus the new watermark) shows no regressions.
- [ ] Watermark renders correctly (no stretching/distortion, no cropping artifacts, no horizontal scroll) on at least one common desktop resolution and at least one common mobile viewport width.
- [ ] Watermark sits behind all page content in stacking order (lowest z-index / background layer) on every tested page.
- [ ] No new JavaScript, external dependencies, or build steps were introduced to achieve this.
- [ ] If the image fails to load for any reason, the rest of the page renders normally with no errors surfaced to the user.

## 6. Open questions

- Does the repo currently have a single shared base layout/template (e.g. a common header/footer include) that all pages already extend, or will the CSS need to be added to a stylesheet that's separately linked from each page? This affects whether "every page" can be guaranteed via one change or requires verifying each page template includes the shared stylesheet.
- Is there an existing global/shared CSS file to add this rule to, or should a new small CSS file be created and linked?
- Should the watermark scale/position be "centered and fixed" (like a classic watermark) or "cover the full page and scroll with content"? The request mentions both "fixed" and "centered" as example options — defaulting to a centered, cover-sized, mostly-fixed-on-desktop/scroll-on-mobile approach unless the reviewer prefers a specific behavior.
- Are there any existing pages with non-standard/dark backgrounds where a watermark might look visually off even at low opacity, that the reviewer wants explicitly checked before implementation?