# Implementation notes

Plan: [plan.md](plan.md)

## 1. Discovery

- **Old site name:** `Strange New Worlds`. It appears in each page's `<title>`, in
  each page's `<h1 class="site-title">`, in the `style.css` header comment, in the
  `package.json` `name` and `description` fields, and in the test suite's comments
  and `SITE_NAME` constant.
- **Theme source of truth:** `style.css` — a single stylesheet shared by all three
  pages, with both scheme colours declared once as `:root` custom properties
  (`--dark-green: #0b2e1a`, `--gold: #ffd700`) and referenced by `var()` everywhere
  else. No hardcoded colours anywhere outside that `:root` block.
- **The site is three static pages** at the repository root — `index.html`,
  `about.html`, `contact.html` — with no build step, no framework and no JavaScript.
- **Light/dark toggle:** none. The site has a single scheme, so there is no second
  variant to reconcile.
- **Image-based logo:** none. The branding is text (`<h1 class="site-title">`). The
  only image on the site is the inline SVG favicon in each page's
  `<link rel="icon">` data URI, which has no text in it but does paint itself with
  the two scheme colours — so it is recoloured with them.
- **Buttons:** none. No page carries a `<button>`, a form control or a
  button-styled link, and the existing suite asserts the pages stay free of them.
- **Metadata:** each page has only `<meta charset>` and `<meta name="viewport">`.
  There is no `description`, no Open Graph or Twitter card, no JSON-LD, no RSS feed,
  no sitemap, no web app manifest, no error page and no footer.

## 2. Palette

Both values are declared once, in the `:root` block of `style.css`, and are the
only two colours the stylesheet mentions:

| Role | Custom property | Hex | Replaces |
|---|---|---|---|
| Page background | `--dark-blue` | `#0b1e3c` | `--dark-green: #0b2e1a` |
| Text, links and accents | `--orange` | `#ff8c1a` | `--gold: #ffd700` |

`#ff8c1a` on `#0b1e3c` gives a contrast ratio of **7.13:1**, comfortably past the
4.5:1 WCAG AA floor for body copy that the suite enforces (and it is checked again
per rendered line of text on every page).
