# Notes: new CAREERS page

Plan: specs/4f3c50ca-cd61-46ec-8aab-969cc72d95db/plan.md
Spec: specs/4f3c50ca-cd61-46ec-8aab-969cc72d95db/spec.md

## 1. Discovery

Task 1 of the plan is a spike: find the rounded-box component, the current
"Careers" nav destination, the route convention and any content layer. What the
repository actually holds, read before anything was written:

- `index.html` — the Softpapaya Services home page. Its `.masthead` nav writes
  eight tabs, sixth of which is `<li><a href="#">Careers</a></li>`: **inert**,
  pointing nowhere, since the header was written. Nothing is served behind it,
  so there is no destination to preserve, archive or redirect.
- `team.html`, `case-studies.html`, `contact-us.html` — the three Softpapaya
  subpages. Each carries a byte-identical copy of that header with the in-page
  anchors qualified by `index.html`, and each carries the same inert "Careers"
  tab. `team.html` is the newest of them and is the shell this page starts from.
- `about.html`, `contact.html`, `style.css` — the legacy "Sid Meyers Alpha
  Centuri" page set: a different site, a different stylesheet, a different
  header (three links, no "Careers"). Not the navigation this job touches.
- `styles/main.css` — the one stylesheet every Softpapaya page is styled from,
  written mobile-first with its `768px` and `1024px` media queries at the foot.
  It declares `--papaya: #e56717`, `--lime: #32cd32` and `--black: #000000`.
- **No content layer.** There is no CMS, no build step (`package.json` has a
  `test` script and nothing else) and no data file behind any page: every page's
  copy is written inline in its own `.html`. So this page's copy is hardcoded
  too, per the spec's "follow the existing pattern" rule.
- `tests/` — `node --test`, no npm dependencies, with a headless-Chrome driver
  in `tests/browser.mjs` and the site's shared constants in `tests/site.mjs`.

## 2. Open questions from the spec, settled

Each of the spec's six open questions, and what it was settled as. Nothing below
was invented: each answer is what the repository or an earlier job had already
decided.

| Question | Settled as |
|---|---|
| Does the rounded-box component already support a "lime" outline variant, or does it need adding? | **It already exists.** The rounded box is `.card` inside `.services__grid`, and `styles/main.css` already paints a card lime: `.services__grid > .card:nth-child(6n + 2), .services__grid > .card:nth-child(6n) { border-color: var(--lime); }`, off the `--lime: #32cd32` token. The Team page's own rotation takes lime the same way. So the plan's task 2 — "add a lime variant, if missing" — had nothing to add; see section 4. |
| What is the route naming convention for a new page — `/careers`, `/en/careers`, a locale prefix? | **`careers.html`, flat at the repository root.** No locale prefixes anywhere: the site is served as static files with `contact-us.html`, `case-studies.html` and `team.html` all sitting at the root. That is the site's only convention, and this page follows it. |
| What is the correct SoftPapaya LinkedIn company page URL for the placeholder link? | **`https://www.linkedin.com/company/softpapaya/`** — the URL the Contact Us page already links, held in `tests/site.mjs` as `LINKEDIN_URL`. Reused rather than a second address being guessed at. Still a placeholder: it is the company page, not a vacancies listing. |
| Where does the "Careers" nav item currently point, and is there content to preserve? | **Nowhere — `href="#"` on all four Softpapaya pages, no page behind it.** Nothing to preserve or redirect; the tab is repointed in place rather than a ninth tab being appended, which is the move the "Case Studies" and "Team" tabs already took. |
| Is there a CMS or content layer for page copy? | **No.** Copy is hardcoded in each page's HTML; see section 1. The spec rules out introducing one. |
| Should the `01`/`02`/`03` boxes use the same rounded-box component, or a distinct one? | **The same one** — `.services__grid` + `.card`, full-width, as the plan's definition of done asks ("including the numbered steps"). No second box component is introduced; the only thing declared for them is the single-column count of their row. |

## 3. File map, as the plan names it and as it exists

The plan's file map is written for a `src/`-and-components site. This one is
static HTML with one shared stylesheet and no components, so each row lands on
the file that plays that part here. Nothing in the map was skipped.

| Plan | Here |
|---|---|
| `src/pages/careers.*` | `careers.html` (new) |
| `src/components/RoundedBox.*` (lime variant) | `styles/main.css` — the variant already exists; nothing added. See section 4. |
| `src/components/nav/MainNav.*` | The nav markup inlined in `index.html`, `team.html`, `case-studies.html` and `contact-us.html` — there is no include mechanism, so the "Careers" tab is repointed in each of the four. |
| `src/content/careers.*` | Not created: there is no CMS/content-data pattern to follow, so the copy is inline in `careers.html`, as every other page's is. |
| `src/styles/careers.*` | `styles/main.css`, "Careers page" block — the site has one stylesheet, and every page's band styles live in it. |
| `tests/careers.spec.*` | `tests/careers-page.test.mjs` (new), one `describe` per numbered task, registered in `package.json`'s `test` script. |

## 4. Plan task 2: the lime variant was already there

The spec asks for this to be surfaced rather than approximated, so: **no change
was needed.** `styles/main.css` has painted a rounded box lime since the
services grid was written —

```css
.services__grid > .card:nth-child(6n + 2),
.services__grid > .card:nth-child(6n) {
  border-color: var(--lime);
}
```

— and `.team .services__grid > .card:nth-child(3n + 2)` takes the same token.
The site sets a box's outline by its position in its row, deliberately, "so the
sequence holds if the grid is reordered or grows", rather than by a per-box
colour class. So there is no `color="lime"` prop to add and no variant missing;
the colour assignment this page needs is a rotation of its own, section 5.

## 5. The rows, and the one thing declared for them

The spec's rule is that no two adjacent boxes in a row share an outline. The
services grid's own rotation is six steps — papaya, lime, black, **black**,
papaya, lime — so four boxes on it would come out papaya, lime, black, black:
two adjacent blacks, the third and fourth. A three-step rotation scoped to this
page's bands, exactly as the Team page scopes its own, fixes it:

```css
.careers__row > .card:nth-child(3n + 1) { border-color: var(--papaya); }
.careers__row > .card:nth-child(3n + 2) { border-color: var(--lime); }
.careers__row > .card:nth-child(3n)     { border-color: var(--black); }
```

Each row is its own `<ul>`, so the count restarts per row: Row A runs papaya,
lime, black, papaya; Row B papaya, lime; the three steps papaya, lime, black.
No two adjacent boxes in any row share a shade, three existing tokens, no new
one, and the six-step sequence the services and values cards keep is untouched.

The column counts are the only other thing the page declares, and they are
written as overrides of the shared grid rather than a grid of its own:

| Row | < 768px | 768–1023px | ≥ 1024px |
|---|---|---|---|
| Row A (four boxes) | 1 | 2 | 4 |
| Row B (two boxes) | 1 | 2 (the shared grid's own) | 2 |
| `01`/`02`/`03` steps | 1 | 1 | 1 |

## 6. The page shell, and its four bands

`careers.html` is `team.html`'s shell — `<head>` (title changed), header, nav
and footer byte for byte, with the "Careers" tab repointed — because that page
is already `index.html`'s shell with the anchors qualified for a subpage, which
is what a new subpage needs. `tests/careers-page.test.mjs` diffs all four
regions against it rather than trusting the copy.

Its `<main>` is four bands:

- `.hero` — the home page's band, reused whole: `h1.hero__heading` reading
  "CAREERS, GRAB A TICKET", with "CAREERS" in the `span.hero__papaya` the home
  page paints "REALLY WELL" with.
- `.careers` — the sub heading ("WHAT YOU GET." in that same papaya span) and
  the two rows of rounded boxes, on the 24px/72px rhythm the `.services` band
  takes after the hero.
- `.careers-process` — the full-bleed papaya band: "How it Works HIRED IN ONE
  WEEK", the opening statement, the three numbered boxes and the closing
  statement, in that document order.
- `.careers-openings` — "CURRENT OPENINGS" in the shared `.section__heading`,
  the sub text, and the LinkedIn link in a new tab.

## 7. Flagged for the reviewer

1. **"Black" is the site's heading ink, `--deep` (#111111), not `--black`
   (#000000).** Every headline on the site is set in `--deep`; `--black` is a
   box-outline token. "GRAB A TICKET" and "WHAT YOU DON'T" therefore take the
   ink the rest of the site's headings take rather than a pure black that
   appears nowhere else in type. The papaya band's own statements are the one
   exception — see the next point.
2. **On the papaya band, the body copy is `--black` and only the heading is
   white.** White on `#e56717` is 3.34:1 — it clears WCAG AA for large text
   (the heading, at 26px/700) but not the 4.5:1 body copy needs. Black on
   papaya is 6.29:1. So the band shows both colours the spec asks for, with the
   white on the text that can carry it.
3. **"Wrocław" is spelled as the spec supplied it**, with the ł. `index.html`
   writes "Wroclaw" without it in the origin band. Left as supplied; a one-word
   edit either way.
4. **The LinkedIn link is a placeholder**, the company page rather than a
   vacancies listing, per the spec. `target="_blank"` with
   `rel="noopener noreferrer"`, the way the Contact Us page's own LinkedIn link
   is written.
5. **The footer's "Careers" column** ("Open Roles", "Life at SoftPapaya",
   "Internships") is still three inert `href="#"` links on every page. The
   spec's scope is the *top* navigation, and the suite asserts every footer
   link is inert, so the column was left alone.
6. **The "Blog" tab is still inert** — the last tab with no destination. Out of
   scope here, noted so the gap is not mistaken for this job's.
7. **The banner artwork on the Team page draws a "SEE OPEN ROLES" button** that
   is part of the image, flagged in that job's notes as needing a Careers
   destination. That destination now exists, but making the artwork clickable
   would mean editing the Team page, which this job's scope rules out.

## 8. Effect on the existing test suite

Three file-manifest audits in `tests/page.test.mjs` — the page list, the site
file list and the repository-root list — enumerate the site exactly, and now
name `careers.html`; `legacySiteFiles()` excludes it the way it already excludes
everything that arrived after the legacy pages' audits were written.

Four nav audits — in `tests/values-section.test.mjs`,
`tests/origin-section.test.mjs` and `tests/team-page.test.mjs` — assert the home
page's tabs link by link; their "Careers" entry now expects `careers.html`, with
a comment naming the job that repointed it, exactly as the "Case Studies",
"Team" and "Contact" entries above it already do.

`beforeCareersPage` and `beforeCareersStyles` in `tests/site.mjs` rewind this
job out of the byte-for-byte diffs earlier jobs wrote, as `beforeTeamPage` and
`beforeTeamStyles` rewind theirs. `beforeCareersStyles` is composed into the two
places that diff the whole stylesheet against an earlier commit
(`tests/values-section.test.mjs`, `tests/team-restore.test.mjs`); the "Careers
page" block sits between the "Team page" block and the footer's, so
`beforeTeamStyles` — whose match already runs to the footer comment — takes it
out of the rest on its own.

Eight tests fail in this checkout for a reason this job does not touch: they
diff a file against the commit that added an earlier plan, and this checkout's
history begins after those commits, so there is no such commit to read. They
fail identically before and after this change.
