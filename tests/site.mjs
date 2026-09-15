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

/* Case Studies ---------------------------------------------------------- */

/** Where the Case Studies page is specified, and this job's discovery written down. */
export const CASE_STUDIES_PLAN = 'specs/4bc05d6f-e783-43e8-a21e-807feef4dbc6/plan.md'
export const CASE_STUDIES_NOTES = 'specs/4bc05d6f-e783-43e8-a21e-807feef4dbc6/notes.md'

/**
 * The page the "Case Studies" nav entry — inert since the header was written —
 * now reaches. The slug is `contact-us.html`'s: a flat, hyphenated `.html` at
 * the repository root, which is the only convention this site has.
 */
export const CASE_STUDIES_PAGE = 'case-studies.html'

/** Its `<title>`, and the band heading above the three boxes. */
export const CASE_STUDIES_TITLE = 'Case Studies — Softpapaya'
export const CASE_STUDIES_HEADING = 'CASE STUDIES'

/** The folder the three source PDFs sit in, and the files themselves, in page order. */
export const CASE_SOURCES = ['cases/ComixIT.pdf', 'cases/Learning.pdf', 'cases/Professional-Services.pdf']

/**
 * The three case studies, in the order the page stacks them, each one's copy
 * transcribed from `source` and checked back against it by eye. `title`,
 * `subtitle` and `meta` are the PDF's own first three lines; `sections` are its
 * Challenge / Solution / Effects, each a list of paragraphs, or of bullets where
 * the PDF sets bullets; `stack` is its closing line. Nothing here is paraphrased,
 * reordered or tidied — see `CASE_STUDIES_NOTES`.
 *
 * `graphic` is the SVG the PDF's panel was rebuilt as, in the papaya palette
 * those notes set out, and `panel` is the wording inside that panel — which is
 * part of the artwork in the PDF and stays part of it here.
 */
export const CASE_STUDIES = [
  {
    slug: 'comixit',
    source: 'cases/ComixIT.pdf',
    eyebrow: 'CASE STUDY',
    title: 'Building Comixit',
    subtitle: "a Children's Reading App",
    meta: 'Sector: Media and Publishing · Client: Comixit',
    sections: [
      {
        heading: 'Challenge',
        paragraphs: [
          "Comixit's founder, a scriptwriter and publisher from the film and book world, wanted to tackle a " +
            'problem he kept seeing firsthand: children spending hours watching videos on their parents\' phones ' +
            "instead of reading. It's a bigger issue than it sounds — a significant number of children in the UK " +
            'leave primary school without the basic literacy skills they need for secondary education, and this ' +
            'was happening in the same year the government was actively promoting reading in schools. The founder ' +
            "had an initial idea and an early proof of concept for a children's comics app, but it needed real " +
            'product thinking and engineering behind it to become something investors and major publishers would ' +
            'take seriously.',
        ],
      },
      {
        heading: 'Solution',
        paragraphs: [
          'We built a fully functioning Android and iOS app with free and subscription tiers, giving parents the ' +
            "ability to monitor and control their children's access while letting kids read comics from major " +
            'publishers including exclusive content from Disney and the Beano. Behind the app sits an extensive ' +
            'backend for onboarding new publishers and a system that lets children safely create and upload their ' +
            'own comics and characters. One of the harder technical problems was using AI to take a publisher\'s ' +
            'source files and turn them into a format that works on a phone screen, without the constant pinching ' +
            'and zooming that ruins the experience — an engine that reformats comics into a vertical scrolling, ' +
            'frame-by-frame layout, while leaving the original artwork untouched to respect publisher copyright. ' +
            'Our involvement went beyond code: we helped shape the business case and investor deck, provided ' +
            'fractional CTO support, and brought in product ownership and project management to keep a ' +
            'fast-moving, bootstrapped startup on track.',
        ],
      },
      {
        heading: 'Effects',
        paragraphs: [
          'Once the app was live, Comixit secured exclusive UK licensing agreements with both Disney and the ' +
            'publisher of the Beano — deals that depended on having a working product to show. The app is still ' +
            'live and still growing today.',
        ],
      },
    ],
    stack: 'Stack: React Native, Expo, C#, ASP.NET, AWS, Terraform',
    graphic: 'assets/img/case-studies/comixit/reading-app.svg',
    panel: [
      'Comixit Reading App',
      'Live · iOS & Android · UK',
      'Disney & Beano',
      'Exclusive UK Content',
      'Free & Paid',
      'Subscription Tiers',
      'Kids Create',
      'Their Own Comics',
      'How It Works: Comic Reformatting Engine',
      'Publisher',
      'Reformatting',
      'Engine',
      'Vertical',
      'Scroll',
      'Artwork left untouched — respects publisher copyright',
      'RESULT',
      'Disney & Beano UK licensing secured',
    ],
  },
  {
    slug: 'learning',
    source: 'cases/Learning.pdf',
    eyebrow: 'CASE STUDY',
    title: 'Rescuing and Scaling',
    subtitle: 'a Learning Management Platform',
    meta: 'Sector: Education / EdTech · Client: UK-based Learning Platform',
    sections: [
      {
        heading: 'Challenge',
        paragraphs: [
          'The Client runs a platform that helps UK employers manage apprenticeships, including the reporting ' +
            'needed to claim government funding and the structure needed to get apprentices through to ' +
            'completion. That matters because national apprenticeship completion rates sit below 50%, while our ' +
            "Client's platform was already achieving close to 85%. The problem was how the platform had been " +
            'built: it had grown over time through a single freelance developer who eventually became ' +
            "uncooperative and held the company's own IP to ransom. The system was live but needed significant " +
            'manual intervention every month just to keep running, and our Client had no internal technical ' +
            'capability of its own to fall back on.',
        ],
      },
      {
        heading: 'Solution',
        paragraphs: [
          "We brought in a fractional CTO with over 15 years' experience running learning platforms in the UK, " +
            'who reviewed the existing codebase and AWS setup and identified where things needed to change. ' +
            'Working alongside an engineering manager and two dedicated engineers, the team made short-term fixes ' +
            'to stabilise the platform, then moved into iterative improvements to cut down the manual work ' +
            'involved in keeping it running month to month. What started as an emergency fix has since grown into ' +
            'a long-term development partnership, with ongoing refactoring, new features and additional products ' +
            'now on the roadmap.',
        ],
      },
      {
        heading: 'Effects',
        bullets: [
          'AWS infrastructure costs halved',
          'Management overhead for the business owner cut by around 25%',
          'Monthly manual intervention significantly reduced',
          'Client secured additional investment on the back of the improved platform',
          'Relationship has grown from an emergency fix into a long-term development partnership',
        ],
      },
    ],
    stack: 'Stack: .NET, AWS, React',
    graphic: 'assets/img/case-studies/learning/platform-health.svg',
    panel: [
      'Apprenticeship Platform Health',
      'Live · Employer & Funding Reporting',
      '85%',
      'Completion Rate',
      '−50%',
      'AWS Infra. Cost',
      '−25%',
      'Mgmt. Overhead',
      'Completion Rate: Client vs National Avg.',
      '47%',
      'Client Platform',
      'National Average',
      'AWS Infrastructure Cost',
      '50%',
      'Halved after platform stabilisation',
      'Costs down, reliability up.',
    ],
  },
  {
    slug: 'professional-services',
    source: 'cases/Professional-Services.pdf',
    eyebrow: 'CASE STUDY',
    title: 'Centralising Group Management Reporting',
    subtitle: 'for Consulting & Professional Services',
    meta:
      'Sector: Consulting and Professional Services · Client: Confidential, International — offices across EU, ' +
      'USA, UK and Asia',
    sections: [
      {
        heading: 'Challenge',
        paragraphs: [
          'This client group holds various consulting businesses, alongside several other propositions in ' +
            'professional services related operations under the same ownership. Despite operating as one group, ' +
            'they had no reliable, shared view of how the group as a whole was performing. Financial reporting, ' +
            'sales forecasting, resource utilisation, productivity and product delivery status all lived in ' +
            'separate, inconsistent formats across the different businesses. There was no single place anyone ' +
            'could look to see group revenue, profit, forecasts or history. Dashboards also only updated once a ' +
            'day, so leadership teams across multiple jurisdictions were often looking at figures that were ' +
            "already hours out of date compared to each other — and the reports themselves weren't giving " +
            'leadership what they needed.',
        ],
      },
      {
        heading: 'Solution',
        paragraphs: [
          'We designed and built a unified management dashboard that pulled financial reporting, forecasting, ' +
            'resource utilisation, productivity and product status into one group-wide view. The system had to ' +
            'work across multiple legal entities and jurisdictions, not just a single office, so it was built ' +
            'with that complexity in mind from the start. We worked closely with the Group CFO and in-country ' +
            'Finance Directors to understand what the existing reports were meant to achieve, checked the ' +
            'integrity of the underlying data, and rebuilt the reporting so every business unit internationally ' +
            'could see live figures rather than a single daily snapshot.',
        ],
      },
      {
        heading: 'Effects',
        paragraphs: [
          'The group now has one source of truth for revenue, profit, forecasts, actuals and historical ' +
            'performance across all its businesses. Reporting is consistent across jurisdictions instead of ' +
            'varying office by office, and the dashboard was built to hold up against the layered regulatory and ' +
            'compliance requirements of running an international professional services group. Feedback from ' +
            'business leads has been consistently positive, and the engagement surfaced a bigger strategic ' +
            'opportunity — an active board-level conversation on enterprise and data architecture, with the ' +
            'relationship moving toward an ongoing advisory arrangement.',
        ],
      },
    ],
    stack: 'Stack: Microsoft',
    graphic: 'assets/img/case-studies/professional-services/group-dashboard.svg',
    panel: [
      'Group Performance Dashboard',
      'Live · All Regions · Updated 09:41',
      '£48.2M',
      'Group Revenue',
      '22.4%',
      'Profit Margin',
      '87%',
      'Utilisation',
      'Revenue vs Forecast, by Quarter',
      'Q1',
      'Q2',
      'Q3',
      'Q4',
      'Actual (£M)',
      'Forecast (£M)',
      'Utilisation by Region',
      'EU',
      'USA',
      'UK',
      'Asia',
    ],
  },
]

/* Team page ------------------------------------------------------------- */

/** Where the Team page is specified, and this job's discovery written down. */
export const TEAM_PLAN = 'specs/755b1c19-a364-4f06-bf29-a35998f8da76/plan.md'
export const TEAM_NOTES = 'specs/755b1c19-a364-4f06-bf29-a35998f8da76/notes.md'

/**
 * The page the "Team" nav entry — inert since the header was written — now
 * reaches. The slug is the site's only convention: a flat `.html` at the root.
 */
export const TEAM_PAGE = 'team.html'

/** Its `<title>`, and the two lines its headline is broken over. */
export const TEAM_TITLE = 'Team — Softpapaya'
export const TEAM_HEADING = ['MEET', 'THE TEAM']

/** The second of those lines is the one painted papaya, as the hero's is. */
export const TEAM_ACCENT = 'THE TEAM'

/** The paragraph under the headline, word for word as the spec supplied it. */
export const TEAM_LEDE =
  'Engineers who know the context, talk to the client, and make decisions. No middlemen.'

/**
 * The three images the spec names, at the paths they already sit on, with the
 * intrinsic size each file was saved at. The plan writes the folder as
 * `images/team/`; it is `team/` on disk, where all three were committed
 * alongside the plan. See `TEAM_NOTES`.
 */
export const TEAM_IMAGES = {
  top: { src: 'team/team1.jpg', width: 2048, height: 1365 },
  second: { src: 'team/team2.png', width: 512, height: 288 },
  banner: { src: 'team/banner.png', width: 1384, height: 418 },
}

/** The size every placeholder avatar is drawn at, until a real photograph replaces it. */
export const TEAM_AVATAR_SIZE = { width: 480, height: 480 }

/**
 * The ten team members, in the order the spec lists them: the name and the role
 * its caption reads, and the placeholder file standing in for the photograph.
 * "Principle Engineer" is the spec's own word, kept as supplied and flagged in
 * `TEAM_NOTES` rather than tidied. The eighth and ninth entries — "Oskar S" and
 * the single-name "Slaw" — were replaced by the two real people in
 * `TEAM_ADDITIONS`; `TEAM_REPLACED` holds what stood there before.
 */
export const TEAM_MEMBERS = [
  { name: 'Simon Raitt', role: 'CEO', image: 'team/placeholder-simon-raitt.png' },
  { name: 'Jason Hill', role: 'COO', image: 'team/placeholder-jason-hill.png' },
  { name: 'Pete Callaghan', role: 'CTO', image: 'team/placeholder-pete-callaghan.png' },
  { name: 'Ania Balicka', role: 'Director', image: 'team/placeholder-ania-balicka.png' },
  { name: 'Slawek Panic', role: 'Principle Engineer', image: 'team/placeholder-slawek-panic.png' },
  { name: 'Grygorii L', role: 'Front End Lead', image: 'team/placeholder-grygorii-l.png' },
  { name: 'Marcin S', role: 'Back End Lead', image: 'team/placeholder-marcin-s.png' },
  // Replaced by job f5053a8e; see TEAM_REPLACED and TEAM_UPDATE_NOTES.
  { name: 'Paula S', role: 'Agile Delivery Lead', image: 'team/placeholder-paula-s.png' },
  { name: 'Nino A', role: 'Power BI and Data Analyst', image: 'team/placeholder-nino-a.png' },
  { name: 'Marcin B', role: 'Mobile iOS and Android Lead Engineer', image: 'team/placeholder-marcin-b.png' },
]

/* Team page: the two entries replaced by real people --------------------- */

/** Where this job — the two new members, and the responsive audit — is written down. */
export const TEAM_UPDATE_PLAN = 'specs/f5053a8e-0d91-4eab-b266-a0cd26076190/plan.md'
export const TEAM_UPDATE_NOTES = 'specs/f5053a8e-0d91-4eab-b266-a0cd26076190/notes.md'

/**
 * The two entries this job supersedes, with the 1-based position each held in
 * the grid. Every one of the ten was a placeholder, so the two were chosen by
 * the spec's own rule — the least identifying captions on the page — and the
 * reasoning is written out in `TEAM_UPDATE_NOTES`.
 */
export const TEAM_REPLACED = [
  { position: 8, name: 'Oskar S', role: 'Lead Engineer', image: 'team/placeholder-oskar-s.png' },
  { position: 9, name: 'Slaw', role: 'Lead Engineer and AI Lead', image: 'team/placeholder-slaw.png' },
]

/**
 * The two entries put in their place, each keeping the position, the markup and
 * the placeholder artwork of the entry it replaces — the file is the same 480×480
 * silhouette every other box carries, renamed to the person standing in it, which
 * is the naming convention the rest of the grid holds to.
 */
export const TEAM_ADDITIONS = [
  { position: 8, name: 'Paula S', role: 'Agile Delivery Lead', image: 'team/placeholder-paula-s.png' },
  { position: 9, name: 'Nino A', role: 'Power BI and Data Analyst', image: 'team/placeholder-nino-a.png' },
]

/**
 * Everything the page ships out of `team/`, in the order `siteFiles()` returns
 * it. `.gitkeep` is the marker the folder was created with, kept where it is.
 */
export const TEAM_ASSETS = [
  'team/.gitkeep',
  ...Object.values(TEAM_IMAGES).map((image) => image.src),
  ...TEAM_MEMBERS.map((member) => member.image),
].sort()

/** The caption a member's box carries: the name and the role, one em dash between them. */
export const teamCaption = ({ name, role }) => `${name} — ${role}`

/**
 * Which shade outlines each avatar box, in order. The spec asks for papaya,
 * lime, black and round again, so the tenth box is papaya — 10 mod 3 = 1.
 */
export const TEAM_BORDERS = TEAM_MEMBERS.map(
  (_, index) => ['papaya', 'lime', 'black'][index % 3],
)

/**
 * The home page with this job's one repointed href put back the way it was, for
 * the same reason `beforeCaseStudies` exists. The nav's "Team" tab — inert since
 * the header was written — is the whole of what this job changed on a page that
 * already existed.
 */
export const beforeTeamPage = (markup) =>
  markup.replace(`<li><a href="${TEAM_PAGE}">Team</a></li>`, '<li><a href="#">Team</a></li>')

/**
 * The shared stylesheet with the Team page's block taken back out. Same purpose
 * as `beforeCaseStudiesStyles`: the audits earlier jobs wrote diff the sheet
 * byte for byte, so each later job rewinds itself out of them.
 */
export const beforeTeamStyles = (css) => css.replace(/\/\* Team page -+ \*\/\n[\s\S]*?\n(?=\/\* Footer)/, '')

/* The sticky masthead, and the mark inside it --------------------------- */

/**
 * The height `.masthead__mark` was capped at, and the factor this job scales it
 * by — 60% larger, as the spec asks. The stylesheet multiplies the two rather
 * than writing the product, so the 1.6 stays readable in the CSS.
 */
export const LOGO_BASE_HEIGHT = 28
export const LOGO_SCALE = 1.6
export const LOGO_HEIGHT = LOGO_BASE_HEIGHT * LOGO_SCALE

/**
 * The custom property the masthead's own height is published under, so an anchor
 * jump can be offset by it, and the widths it is stepped at — the site's own two
 * breakpoints. Each value is the tallest the masthead gets at that width, which
 * `tests/case-studies.test.mjs` measures rather than trusts.
 */
export const MASTHEAD_CLEARANCE_VAR = '--masthead-clearance'
export const MASTHEAD_CLEARANCE = [
  { from: 0, value: '151px' },
  { from: 768, value: '121px' },
  { from: 1024, value: '84px' },
]

/** The widths the masthead and the three boxes are measured at. */
export const BREAKPOINTS = [320, 375, 414, 768, 1024, 1280, 1440]

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
 * Any page of the Softpapaya site with this job's one repointed href put back
 * the way it was, for the same reason `beforeContactPage` exists. The nav's
 * "Case Studies" tab — inert since the header was written — is the whole of what
 * this job changed on a page that already existed.
 */
export const beforeCaseStudies = (markup) =>
  markup.replace(`<li><a href="${CASE_STUDIES_PAGE}">Case Studies</a></li>`, '<li><a href="#">Case Studies</a></li>')

/**
 * The shared stylesheet with this job's work taken back out: the tokens and the
 * `html` rule at its head, the masthead's sticky positioning and its taller
 * mark, the Case Studies block, and the two clearance steps in the breakpoints.
 * Same purpose as `beforeCaseStudies` — the audits earlier jobs wrote diff the
 * sheet byte for byte, so each later job rewinds itself out of them.
 */
export const beforeCaseStudiesStyles = (css) =>
  css
    .replace(/\n\n {2}\/\* The mark's old cap[\s\S]*?scroll-padding-top: var\(--masthead-clearance\);\n/, '\n')
    .replace(/\/\* Pinned to the top of the viewport[\s\S]*?\*\/\n(?=\.masthead \{)/, '')
    .replace('  position: sticky;\n  top: 0;\n  z-index: 10;\n  background-color: var(--page);\n', '')
    .replace(
      /\/\* 60% taller than the 28px[\s\S]*?\*\/\n(?=\.masthead__mark \{)/,
      '/* Capped to the height the 20px text title sat at, and left to find its own\n' +
        "   width from the file's 655×198 aspect ratio. */\n",
    )
    .replace('  height: calc(var(--logo-height) * var(--logo-scale));\n', '  height: 28px;\n')
    // Stops at the Team page block as well as at the footer: that block was
    // written after this helper and now sits between the two, and each `before…`
    // helper takes out its own job's styles and no one else's.
    .replace(/\/\* Case Studies page -+ \*\/\n[\s\S]*?\n(?=\/\* (?:Team page|Footer))/, '')
    .replace(/ {2}\/\* The nav still sits on a row[\s\S]*?--masthead-clearance: 121px;\n {2}\}\n\n/, '')
    .replace(/ {2}\/\* The nav rejoins the logo's row[\s\S]*?--masthead-clearance: 84px;\n {2}\}\n\n/, '')
    .replace(/ {2}\/\* The copy takes half again[\s\S]*?\n {2}\}\n\n(?= {2}\.masthead__nav)/, '')

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
 * images it carries, the Contact Us page and scripts that arrived with it, the
 * Case Studies page with its sources and graphics, and the Team page with its
 * photographs and placeholder avatars — all of them landed after the audits the
 * legacy pages are held to were written, so none of them appears in those.
 */
export async function legacySiteFiles() {
  const replaced = new Set([
    HOMEPAGE,
    SERVICES_STYLESHEET,
    LOGO_ASSET,
    ORIGIN_IMAGE,
    CONTACT_PAGE,
    ...CONTACT_SCRIPTS,
    CASE_STUDIES_PAGE,
    ...CASE_SOURCES,
    ...CASE_STUDIES.map((study) => study.graphic),
    TEAM_PAGE,
    ...TEAM_ASSETS,
  ])
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
