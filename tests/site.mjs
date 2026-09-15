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

/** Where the "WHERE WE'VE COME FROM" section is specified, and its discovery written down. */
export const ORIGIN_PLAN = 'specs/6cbe8670-bc69-497e-838f-81bd88499f36/plan.md'
export const ORIGIN_NOTES = 'specs/6cbe8670-bc69-497e-838f-81bd88499f36/notes.md'

/** The new section's heading, and the anchor the "About" nav link now points at. */
export const ORIGIN_HEADING = "WHERE WE'VE COME FROM"
export const ORIGIN_ANCHOR = 'about'

/** Its two paragraphs, word for word as the request supplied them. */
export const ORIGIN_PARAGRAPHS = [
  'We are a technology services business based in the UK, Poland, Ireland and Bulgaria with Software ' +
    'Development teams providing, Enterprise to SME CIO/CTO support, roadmap planning, architecture and ' +
    'development through C-Suite advisory to development engineering skills and resources.',
  'We are a UK and European based business working out of modern offices in Exeter, Dublin, Wroclaw and ' +
    "Sofia. Launched as a new company and a single brand 'Softpapaya' in March 2026, we are the coming " +
    'together of groups of professionals from various technology companies that have been working together ' +
    'for over 11 years. Our expertise covers helping business leaders accomplish digital product build at ' +
    'pace, from International Enterprise scale to Startup. Softpapaya delivers from boardroom to development ' +
    'team, advisory, skills and people.',
]

/** Where the "VALUES" section is specified, and this job's discovery written down. */
export const VALUES_PLAN = 'specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/plan.md'
export const VALUES_NOTES = 'specs/e9bbd504-8f82-4e38-83fa-3eecbfd1d7ce/notes.md'

/** Its heading, and the anchor the "Values" nav link now points at. */
export const VALUES_HEADING = 'VALUES'
export const VALUES_ANCHOR = 'values'

/**
 * The six value boxes, in the order the grid writes them. Each `body` is the
 * lines of the supplied copy in order — a string for a paragraph, an array for
 * a run of bullets. `tests/values-section.test.mjs` checks every one of them
 * back against the request itself, which is recorded in the commit that added
 * `VALUES_PLAN`.
 */
export const VALUES_BOXES = [
  {
    title: 'PEOPLE OVER PROCESS',
    body: [
      "Processes exist to help. When a process gets in the way - we change it. When a meeting is pointless - " +
        "we cancel it. We're not attached to rituals.",
      "We trust the people we hire to organize their own work. We don't track desk time, monitor screens, or " +
        'count commits. What matters is what you deliver - not what your calendar looks like.',
    ],
  },
  {
    title: 'NO OVERTIME CULTURE',
    body: [
      'This isn\'t an "aspiration." It\'s a hard rule.',
      'Nobody will expect you to stay late. You won\'t get an "urgent" Slack at 7pm. Your team lead won\'t ' +
        'send weekend emails with a silent expectation that you\'ll respond.',
      "Want to stay longer because something's got you hooked? By all means. But that's your choice, not a " +
        'default expectation.',
    ],
  },
  {
    title: 'SMALL TEAMS, BIG OWNERSHIP',
    body: [
      "We work in collegiate teams of small agile squads. You know everyone's context. You can still make " +
        'decisions fast without endless meetings.',
    ],
  },
  {
    title: 'GROWTH ON YOUR TERMS',
    body: [
      'We don\'t push "career paths." Not everyone needs to become a manager. Not everyone needs to give ' +
        'conference talks.',
      [
        '• Learning time during work hours',
        '• Mentoring from senior engineers (not a "mentoring program" - just people you can talk to)',
        '• Space to experiment with new technologies',
      ],
      "Want to grow toward architecture? We'll help. Prefer to stay a specialist? That's fine too. It's your career.",
    ],
  },
  {
    title: 'TRANSPARENCY',
    body: [
      "We're open about where the company is heading. What we're planning, where we are, what's not working. " +
        "You don't learn about changes through hallway gossip (especially since there's no hallway).",
    ],
  },
  {
    title: 'RESPECT FOR TIME',
    body: [
      'Meetings have agendas and last as long as they need to. We don\'t do meetings that "could have been an ' +
        'email." We don\'t do standups where 8 people take turns saying they\'re "working on the same thing as ' +
        'yesterday."',
      'We protect your time - from clients and from ourselves.',
    ],
  },
]

/** Where the origin band's 50/50 text-and-photograph layout is specified, and its discovery written down. */
export const ORIGIN_IMAGE_PLAN = 'specs/1416c200-4729-4c71-8e75-e674bd0519d5/plan.md'
export const ORIGIN_IMAGE_NOTES = 'specs/1416c200-4729-4c71-8e75-e674bd0519d5/notes.md'

/**
 * Where the same band's photograph was re-specified — the frame and the split
 * asked for a second time, against the layout already standing — and this job's
 * own discovery written down.
 */
export const SOFIA_FRAME_PLAN = 'specs/29617dac-16b5-4a2b-a6ce-006411c2b9fd/plan.md'
export const SOFIA_FRAME_NOTES = 'specs/29617dac-16b5-4a2b-a6ce-006411c2b9fd/notes.md'

/** The photograph the origin band now sets beside its copy, at the path it already sits on. */
export const ORIGIN_IMAGE = 'Sofia.jpg'

/** The class the photograph's frame and sizing are scoped to, and the column it sits in. */
export const ORIGIN_PHOTO_CLASS = 'origin__photo'

/** Its intrinsic size, which the rendered photograph's aspect ratio is held to. */
export const ORIGIN_IMAGE_SIZE = { width: 1080, height: 719 }

/**
 * The frame the "C-Suite Advisory" box carries — `.card`'s `border-radius` and
 * `1px solid`, with the papaya its position in the grid gives it — which the
 * photograph reuses value for value. See `ORIGIN_IMAGE_NOTES`.
 */
export const CARD_FRAME = { radius: '10px', width: '1px', style: 'solid', colour: '#e56717' }

/** The box the frame above is read off, and the section it sits in. */
export const FRAME_SOURCE = { box: 'C-Suite Advisory', section: 'WHAT WE OFFER' }

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
 * Where the Contact Us page is specified, and this job's discovery written down.
 */
export const CONTACT_PLAN = 'specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/plan.md'
export const CONTACT_NOTES = 'specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/notes.md'

/**
 * The one page the three contact entry points now share. `contact.html` is
 * already taken by the legacy page set, which this job may not touch, hence the
 * second slug; see `CONTACT_NOTES`.
 */
export const CONTACT_PAGE = 'contact-us.html'

/** Its `<title>`, and the heading it shows. */
export const CONTACT_TITLE = 'Contact Us — Softpapaya'
export const CONTACT_HEADING = 'CONTACT US'

/**
 * The four fields the form asks for, in the order it writes them: the label it
 * is introduced by, the control it is built from and the name it submits under.
 */
export const CONTACT_FIELDS = [
  { name: 'fullName', label: 'Full Name', control: 'input', type: 'text' },
  { name: 'email', label: 'Email Address', control: 'input', type: 'email' },
  { name: 'enquiry', label: 'Nature of Enquiry', control: 'input', type: 'text' },
  { name: 'details', label: 'Details about the type of work you need help with', control: 'textarea', type: null },
]

/** The company page the link under the form opens, in a tab of its own. */
export const LINKEDIN_URL = 'https://www.linkedin.com/company/softpapaya/'

/** The form's behaviour, and the swappable submission layer behind it. */
export const CONTACT_SCRIPTS = ['scripts/contact-api.js', 'scripts/contact-form.js']

/**
 * The three elements the spec unifies, each with the selector that finds it on
 * the home page and the label it has to keep.
 */
export const CONTACT_ENTRY_POINTS = [
  { what: 'the "Contact" nav link', selector: '.masthead__links li:last-child a', label: 'Contact' },
  { what: 'the "Talk to us" button', selector: '.masthead__cta', label: 'TALK TO US' },
  { what: 'the "Start a conversation" button', selector: '.invitation .button--large', label: 'START A CONVERSATION' },
]

/** The address the site contacted before this page, and still falls back to. */
export const CONTACT_EMAIL = 'hello@softpapaya.com'

/**
 * The home page with this job's three repointed hrefs put back the way they
 * were, so that the byte-exact "nothing else changed" audits earlier jobs wrote
 * still read the page they were written against. Only the destinations are
 * rewound — anything else that moved still shows up in those diffs.
 */
export const beforeContactPage = (markup) =>
  markup
    .replace(`<li><a href="${CONTACT_PAGE}">Contact</a></li>`, '<li><a href="#contact">Contact</a></li>')
    .replace(
      `<a class="button button--accent masthead__cta" href="${CONTACT_PAGE}">`,
      `<a class="button button--accent masthead__cta" href="mailto:${CONTACT_EMAIL}">`,
    )
    .replace(
      `<a class="button button--accent button--large" href="${CONTACT_PAGE}">`,
      `<a class="button button--accent button--large" href="mailto:${CONTACT_EMAIL}">`,
    )

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

/**
 * Every site file except the Softpapaya Services page, its stylesheet, the two
 * images it carries, and the Contact Us page and scripts that arrived with it —
 * all of them landed after the audits the legacy pages are held to were
 * written, so none of them appears in those.
 */
export async function legacySiteFiles() {
  const replaced = new Set([HOMEPAGE, SERVICES_STYLESHEET, LOGO_ASSET, ORIGIN_IMAGE, CONTACT_PAGE, ...CONTACT_SCRIPTS])
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
