# Palette notes — green → orange/blue

BetaMax originally shipped a dark-green-and-orange scheme. This document records the
green audit, the orange-and-blue palette that replaces it, and the green instances
deliberately left alone.

The site is two hand-written files (`index.html`, `styles.css`) with no build step, so
"source" and "built output" are the same files.

## Audit inventory

Every green occurrence found across the repo's own styling sources — named colours,
hex literals (including the URL-encoded hex inside the inline favicon data URI),
`rgb()`/`hsl()` values and green-flavoured token names. Line numbers are those of the
pre-change files.

| File | Line | Original value | Role | Disposition | New value |
|---|---|---|---|---|---|
| styles.css | 1 | `green` | Scheme named in the file header comment | Replaced | `blue` |
| styles.css | 4 | `#071c0e` | Dominant page background | Replaced | `#071c2e` |
| styles.css | 4 | `forest` | Token name `--forest` | Renamed | `--navy` |
| styles.css | 5 | `#0d2e18` | Nav band background, raised above the page | Replaced | `#0d2e4a` |
| styles.css | 5 | `forest` | Token name `--forest-raised` | Renamed | `--navy-raised` |
| styles.css | 8 | `#cfe6d5` | Neutral body and tagline text | Replaced | `#cfe0f2` |
| styles.css | 8 | `leaf` | Token name `--leaf` | Renamed | `--mist` |
| styles.css | 8 | `green` | "faintly green" in the token's comment | Replaced | `blue` |
| styles.css | 9 | `#1c5733` | Hairline borders (`--edge`) | Replaced | `#1c4a73` |
| styles.css | 17 | `forest` | `html` background-color reference | Renamed | `--navy` |
| styles.css | 26 | `forest` | `body` background-color reference | Renamed | `--navy` |
| styles.css | 27 | `leaf` | `body` text colour reference | Renamed | `--mist` |
| styles.css | 40 | `forest` | `.site-header` background reference | Renamed | `--navy-raised` |
| styles.css | 96 | `forest` | `.hero` background reference | Renamed | `--navy` |
| styles.css | 120 | `leaf` | `.hero__tagline` text colour reference | Renamed | `--mist` |
| styles.css | 130 | `forest` | `.hero__cta` label colour reference | Renamed | `--navy` |
| index.html | 10 | `%23071c0e` | Inline favicon SVG background rect fill | Replaced | `%23071c2e` |

## Palette

Deep blue takes over every structural role green used to hold; the two oranges carry
across unchanged, so the accent hierarchy the page already had is preserved. Blue hues
sit around 205–210°, which keeps them cleanly complementary to the 25–30° oranges.

| Token | Hex | Family | Role |
|---|---|---|---|
| `--navy` | `#071c2e` | blue | Dominant page background (was `--forest`) |
| `--navy-raised` | `#0d2e4a` | blue | Nav band — a raised surface above the page (was `--forest-raised`) |
| `--ember` | `#ff7a18` | orange | Primary orange accent: brand, nav links, CTA fill (unchanged) |
| `--ember-bright` | `#ffa34d` | orange | Brightest orange: hero title and hover/focus states (unchanged) |
| `--mist` | `#cfe0f2` | blue | Neutral body text, faintly blue (was `--leaf`) |
| `--edge` | `#1c4a73` | blue | Hairline borders |

Contrast, measured against the background each colour actually sits on:

| Foreground | Background | Ratio |
|---|---|---|
| `--mist` body text | `--navy` | 12.8:1 |
| `--ember-bright` hero title | `--navy` | 8.7:1 |
| `--ember` nav links and brand | `--navy-raised` | 5.3:1 |
| `--navy` CTA label | `--ember` fill | 6.6:1 |

Files checked and found to hold no colour values at all: `package.json` (no theme keys),
`.github/workflows/claude-code-build.yml`, `tests/*`. There is no SCSS/LESS, no theme
config file (`theme.config.json`, `_config.yml` or equivalent) and no checked-in build
output directory.

## Flagged — left unchanged, for reviewer sign-off

Every edge-case category the audit looked for. Nothing in the site's rendered output is
still green; the rows below record what was checked and why each is a non-issue.

| Item | Location | Status | Reason |
|---|---|---|---|
| Semantic / status colours | `styles.css` | None present | The page has no success/warning/error indicators — its only components are the nav bar and the hero, so no green carries meaning that a colour swap would destroy. |
| Third-party embeds and widgets | `index.html` | None present | The page loads nothing off-origin (the existing suite asserts zero off-origin requests), so there is no vendor CSS outside our control. |
| Raster images, logos and binary assets | repo-wide | None present | The site ships no image files at all. Its only icon is the inline SVG favicon in `index.html`, which is a trivially recolourable data URI and so was recoloured with everything else. |
| Prose mentions of the word "green" | `specs/*/plan.md`, `docs/palette-notes.md` | Left unchanged | Historical planning records and this audit document itself. Neither is styling, and rewriting them would erase the record of what the change actually did. |
| External assets (README badges, social preview images) | repo-wide | None present | The repo has no README, no badges and no social preview image, so nothing needed regenerating from the theme. |
