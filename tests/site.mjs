// Helpers for the "Alpha Centauri" site: the three pages, the shared
// stylesheet, and just enough CSS parsing to assert on declared colours.
import { readdir, readFile } from 'node:fs/promises'
import { join, sep } from 'node:path'

export const repoRoot = join(import.meta.dirname, '..')

export const SITE_NAME = 'Alpha Centauri'

/** The names this rebuild supersedes; they should survive nowhere on the site. */
export const OLD_SITE_NAME = /sid meyer|brave new worlds|strange new worlds/i

export const STYLESHEET = 'style.css'

/** The colour scheme: dark blue page, orange writing. */
export const COLOURS = {
  darkBlue: '#0b1e3c',
  orange: '#ff8c1a',
}

/**
 * The custom property each scheme colour is declared under, so the palette is
 * defined in exactly one place.
 */
export const COLOUR_VARS = {
  darkBlue: '--dark-blue',
  orange: '--orange',
}

/**
 * The shades this rebrand supersedes, as bare hex digits so the check catches
 * them however they are written (`#ffd700`, `%23ffd700` inside a data URI, …).
 */
export const OLD_COLOURS = ['0b2e1a', 'ffd700']

/** Where the palette choice and the flagged out-of-scope gaps are written down. */
export const PALETTE_NOTES = 'specs/73e4bb2c-ee3b-4009-b0ed-97501935ff03/notes.md'

/** Readability floor for orange-on-blue text: WCAG AA for body copy. */
export const MIN_CONTRAST = 4.5

/** The nav menu, in the order it is written. */
export const NAV_LINKS = [
  { label: 'Home', href: 'index.html' },
  { label: 'About Us', href: 'about.html' },
  { label: 'Contact', href: 'contact.html' },
]

/** The whole site: one page per nav item, plus the heading each one shows. */
export const PAGES = [
  { file: 'index.html', label: 'Home', heading: 'Home' },
  { file: 'about.html', label: 'About Us', heading: 'About Us' },
  { file: 'contact.html', label: 'Contact', heading: 'Contact' },
]

export const read = (file) => readFile(join(repoRoot, file), 'utf8')

/** Every HTML page served from the repository root, alphabetically. */
export const htmlFiles = async () =>
  (await readdir(repoRoot)).filter((name) => name.endsWith('.html')).sort()

/** Everything in the repository root, alphabetically, minus git's own directory. */
export const rootEntries = async () =>
  (await readdir(repoRoot)).filter((name) => name !== '.git' && name !== 'node_modules').sort()

/** Directories holding job paperwork and test plumbing rather than the site itself. */
const NOT_THE_SITE = ['.git', '.github', 'node_modules', 'specs', 'tests']

/** Every file that makes up the site, relative to the repository root. */
export async function siteFiles() {
  const names = await readdir(repoRoot, { recursive: true, withFileTypes: true })
  return names
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(repoRoot.length + 1).split(sep).join('/'))
    .filter((name) => !NOT_THE_SITE.some((dir) => name.startsWith(`${dir}/`)))
    .sort()
}

/**
 * The stylesheet's rules as `{ selectors, declarations }`. Declarations inside
 * `@media` blocks come through as plain rules; the wrapper itself is ignored,
 * which is all these tests need.
 */
export function rules(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  return [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selectors: selector.split(',').map((s) => s.trim()).filter(Boolean),
    declarations: Object.fromEntries(
      body
        .split(';')
        .map((decl) => decl.split(':'))
        .filter((parts) => parts.length === 2)
        .map(([prop, value]) => [prop.trim(), value.trim()]),
    ),
  }))
}

/** Substitutes any `var(--x)` in `value` with the `:root` custom properties. */
export function resolveVars(css, value) {
  const vars = Object.assign({}, ...rules(css).filter((r) => r.selectors.includes(':root')).map((r) => r.declarations))
  let resolved = value
  for (let i = 0; i < 10 && resolved.includes('var('); i++) {
    resolved = resolved.replace(/var\(\s*(--[\w-]+)\s*(?:,[^()]*)?\)/g, (match, name) => vars[name] ?? match)
  }
  return resolved.trim()
}

/**
 * The value `property` ends up with on any of `selectors`, later rules winning,
 * with custom properties resolved. `null` when none of them declare it.
 */
export function declaredValue(css, selectors, property) {
  const wanted = new Set(selectors)
  const matches = rules(css)
    .filter((rule) => rule.selectors.some((selector) => wanted.has(selector)))
    .map((rule) => rule.declarations[property])
    .filter(Boolean)
  return matches.length ? resolveVars(css, matches.at(-1)) : null
}

export const titleOf = (html) => html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null

/** The page's `<nav>` element, markup and all. */
export const navBlock = (html) => html.match(/<nav\b[\s\S]*?<\/nav>/i)?.[0] ?? null

/** The `{ href, label }` of every link inside a chunk of markup, in document order. */
export const linksIn = (markup) =>
  [...markup.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)].map(([, href, label]) => ({
    href,
    label: label.replace(/<[^>]*>/g, '').trim(),
  }))

/** The `{ level, text }` of every heading on the page, in document order. */
export const headingsIn = (html) =>
  [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(([, level, text]) => ({
    level: Number(level),
    text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
  }))

/** The page's `<main>` content, or the empty string when it has none. */
export const mainOf = (html) => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? ''

/** The tag name of every element opened in a chunk of markup, in document order. */
export const tagsIn = (markup) => [...markup.matchAll(/<([a-z][\w-]*)\b/gi)].map((m) => m[1].toLowerCase())

/** The visible text of a chunk of markup, whitespace collapsed. */
export const textOf = (markup) => markup.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

/** Parses `#rgb`/`#rrggbb` into the `{r,g,b,a}` shape the colour predicates take. */
export function parseHex(hex) {
  const digits = hex.trim().replace('#', '')
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
    a: 1,
  }
}

/** Every hex colour literal the stylesheet mentions. */
export const hexColours = (css) => [...css.matchAll(/#[0-9a-f]{3,8}\b/gi)].map((m) => m[0].toLowerCase())
