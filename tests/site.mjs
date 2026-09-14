// Helpers for the two sites this repository now holds: the "Softpapaya Services"
// home page served at the root, and the legacy pages behind it — their shared
// stylesheet, and just enough CSS parsing to assert on declared colours.
import { readdir, readFile } from 'node:fs/promises'
import { join, sep } from 'node:path'

export const repoRoot = join(import.meta.dirname, '..')

export const SITE_NAME = 'Sid Meyers Alpha Centuri'

/**
 * The names this rebuild supersedes; they should survive nowhere on the site.
 * The last alternative catches the bare name this one grew out of — it only
 * counts as superseded when it is not the tail of the current name.
 */
export const OLD_SITE_NAME = /brave new worlds|strange new worlds|alpha[- ]?centauri|beta[- ]?centuri|(?<!sid meyers )alpha[- ]?centuri/i

/** The board advisory paragraph the home page has to carry, word for word. */
export const HOME_PARAGRAPH =
  'Our board advisory services ensure that your board is composed of the most qualified and diverse ' +
  'members, driving better decision-making and governance and support in building your businesses ' +
  'roadmap for growth.'

/**
 * The files a legacy page's `<title>` is generated from — the pages themselves.
 * The home page is no longer one of them: it is now the Softpapaya Services
 * page, titled from `SERVICES_TITLE`.
 */
export const TITLE_SOURCES = ['about.html', 'contact.html']

export const STYLESHEET = 'style.css'

/** The file served at the site root — the "Softpapaya Services" page. */
export const HOMEPAGE = 'index.html'

/** Where the Softpapaya Services build's discovery and decisions are written down. */
export const SERVICES_NOTES = 'specs/24ad0907-f4a5-4d87-9555-0239522ef9df/notes.md'

/** The home page's `<title>`, and the stylesheet it is styled from. */
export const SERVICES_TITLE = 'Softpapaya Services'
export const SERVICES_STYLESHEET = 'styles/main.css'

/** Where the home page refresh — hero, logo and the six boxes — is specified. */
export const REFRESH_PLAN = 'specs/7931a152-83fe-4f91-8093-e167e642681a/plan.md'

/** The brand mark the header now renders in place of its text title. */
export const LOGO_ASSET = 'SoftPapaya-logo.png'

/** The one span of the hero headline painted papaya; the rest stays as it was. */
export const HERO_ACCENT = 'REALLY WELL'

/** The paragraph under the headline, word for word. */
export const HERO_LEDE =
  'We are a senior technology partner: advisers in the boardroom, engineers in the repository, and the ' +
  'people who stay until the thing is running. Take a single service, a whole delivery team, or the ' +
  'specialists your own team is missing.'

/**
 * The six "what we offer" boxes, in the order the grid writes them, each with
 * the copy it is described by. The border sequence and the tags are held
 * alongside in `BOX_BORDERS` and `BOX_TAGS`, one entry per box.
 */
export const BOXES = [
  {
    title: 'C-Suite Advisory',
    copy:
      'Board-level counsel on the technology decisions that carry real cost — what to build, what to buy and ' +
      'what to retire — with the roadmap and the governance that keep the answer honest quarter after quarter.',
  },
  {
    title: 'Software Development',
    copy:
      'Applications and services designed, built and shipped by the same senior people from the first commit ' +
      'to the release your customers rely on, in the stack your team already runs rather than the one we would pick.',
  },
  {
    title: 'Subject Matter Expertise',
    copy:
      'Deep specialists dropped into the problem your team is stuck on — an architecture call, a performance ' +
      'wall, a review queue nobody can clear — for as long as that problem lasts and no longer.',
  },
  {
    title: 'Data, AI & Automation',
    copy:
      'Models, agents and pipelines wired into the systems you already run, on a data architecture that holds ' +
      'them up and with measurement around them, so you can see what the automation is actually doing.',
  },
  {
    title: 'UI/UX Design and Rapid POC',
    copy:
      'Research, interface design and a clickable build in weeks, so an idea can be put in front of real users ' +
      'and then funded, reshaped or dropped on evidence rather than on argument.',
  },
  {
    title: 'Technology Teams & Resourcing',
    copy:
      'Whole teams or single hires — permanent, contract or nearshore — sourced against your standards rather ' +
      'than a keyword search, and set up to work inside your process from the first sprint.',
  },
]

/** Which shade outlines each box, in order: papaya, lime, black, black, papaya, lime. */
export const BOX_BORDERS = ['papaya', 'lime', 'black', 'black', 'papaya', 'lime']

/** The tags each box carries, in the order it writes them. */
export const BOX_TAGS = [
  ['Roadmap', 'Governance', 'CTO Advisory'],
  ['TypeScript', 'Java', 'Python', 'React'],
  ['Architecture Review', 'Code Review', 'Augmentation'],
  ['LLMs', 'AI Agents', 'Data Architecture'],
  ['Figma', 'Design Systems', 'Prototypes'],
  ['Staffing', 'Nearshore', 'Contract'],
]

/**
 * The eight boxes this refresh supersedes: each one's title, a phrase unique to
 * its copy, and one of its tags — enough to catch any of them surviving.
 */
export const OLD_BOXES = [
  { title: 'Custom Software', phrase: 'bent out of an off-the-shelf tool', tag: 'PostgreSQL' },
  { title: 'Team Augmentation', phrase: 'faster than they found it', tag: 'Embedded squads' },
  { title: 'Cloud &amp; Infrastructure', phrase: 'Environments described in code', tag: 'Kubernetes' },
  { title: 'AI &amp; Automation', phrase: 'Assistants, extraction and routing', tag: 'Retrieval' },
  { title: 'Data Engineering', phrase: 'Pipelines, warehouses and contracts', tag: 'Snowflake' },
  { title: 'Project Governance', phrase: 'Delivery oversight for work already underway', tag: 'Delivery reviews' },
  { title: 'Rapid Proof of Concept', phrase: 'throwaway-if-need-be build', tag: 'Spike work' },
  { title: 'UI/UX Design', phrase: 'shipped as a component library', tag: 'Accessibility' },
]

/**
 * The colour scheme: two dark greys for the surfaces, gold for the body text
 * and lettering, and three oranges — the accent plus the shades its hover and
 * active states brighten and deepen to.
 */
export const COLOURS = {
  darkGrey: '#2b2b2b',
  raisedGrey: '#333333',
  gold: '#ffd700',
  orange: '#ff8c1a',
  orangeBright: '#ffa94d',
  orangeDeep: '#e8820f',
}

/**
 * The custom property each scheme colour is declared under, so the palette is
 * defined in exactly one place.
 */
export const COLOUR_VARS = {
  darkGrey: '--dark-grey',
  raisedGrey: '--raised-grey',
  gold: '--gold',
  orange: '--orange',
  orangeBright: '--orange-bright',
  orangeDeep: '--orange-deep',
}

/**
 * The shades every rebrand so far supersedes — the old dark green, the two
 * older dark blues, the two dark greys of the grey scheme before this one, and
 * the light grey this rebrand replaces as the lettering colour — as bare hex
 * digits so the check catches them however they are written (`#0c1c38`,
 * `%230c1c38` inside a data URI, …).
 */
export const OLD_COLOURS = ['0b2e1a', '0b1e3c', '1f1f1f', '2e2e2e', '0c1c38', '16294d', 'e6e6e6']

/** Words for shades this rebrand rules out, in the stylesheet and the markup. */
export const OLD_COLOUR_WORDS = [/\bgreen\b/i, /\blight[- ]?grey\b/i, /\bblue\b/i]

/** Where the discovery, the palette choice and the flagged gaps are written down. */
export const NOTES = 'specs/392b9d9e-063b-4b5e-80e0-17475eb94210/notes.md'

/** Where this rebrand's palette and its flagged colour overrides are written down. */
export const GOLD_NOTES = 'specs/dfbfe75a-24f1-404d-804f-05a044162974/notes.md'

/** Readability floor for gold- and orange-on-grey text: WCAG AA for body copy. */
export const MIN_CONTRAST = 4.5

/**
 * WCAG AA's floor for large text — 24px and up, or 18.66px and up when bold.
 * The papaya "REALLY WELL" in the hero headline is set at 40–64px and weight
 * 700, so 3.34:1 on white clears it; at body size it would not.
 */
export const MIN_CONTRAST_LARGE = 3

/** True when text of this size and weight counts as "large" to WCAG. */
export const isLargeText = (fontSize, fontWeight) =>
  fontSize >= 24 || (fontSize >= 18.66 && Number(fontWeight) >= 700)

/** The legacy nav menu, in the order it is written. */
export const NAV_LINKS = [
  { label: 'Home', href: 'index.html' },
  { label: 'About Us', href: 'about.html' },
  { label: 'Contact', href: 'contact.html' },
]

/**
 * The legacy pages, plus the heading each one shows. The home page they were
 * built alongside has been replaced by the Softpapaya Services page, so it is
 * no longer one of them — `tests/services-page.test.mjs` covers that page.
 */
export const PAGES = [
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

/** Every site file except the Softpapaya Services page and its stylesheet. */
export async function legacySiteFiles() {
  const replaced = new Set([HOMEPAGE, SERVICES_STYLESHEET])
  return (await siteFiles()).filter((name) => !replaced.has(name))
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
