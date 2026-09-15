# Notes: "Team" page and top navigation link

Plan: specs/755b1c19-a364-4f06-bf29-a35998f8da76/plan.md
Spec: specs/755b1c19-a364-4f06-bf29-a35998f8da76/spec.md

## 1. Discovery

What the repository actually holds, read before anything was written:

- `index.html` — the Softpapaya Services home page, and the source of the page
  shell this job copies: `<head>` (inline favicon, `styles/main.css`), the
  `.masthead` header with `.masthead__links`, and the `.footer`.
- `case-studies.html`, `contact-us.html` — the two Softpapaya subpages. Each
  carries a byte-identical copy of that header with the in-page anchors
  qualified by `index.html`, which is the shell a new subpage starts from.
- `about.html`, `contact.html`, `style.css` — the legacy "Sid Meyers Alpha
  Centuri" page set: a different site, a different stylesheet, a different
  header (`.site-nav`). Not the navigation this job touches.
- `styles/main.css` — the one stylesheet the Softpapaya pages are styled from,
  written mobile-first with its `768px` and `1024px` media queries at the foot.
- `team/team1.jpg`, `team/team2.png`, `team/banner.png` — the three images the
  spec names, already in the repository, committed alongside the plan.
- `tests/` — `node --test`, no npm dependencies, with a headless-Chrome driver
  in `tests/browser.mjs` and the site's shared constants in `tests/site.mjs`.

## 2. Open questions from the spec, settled

Each of the spec's seven open questions, and what it was settled as. Nothing
below was invented: each answer is what the repository or an earlier job already
decided.

| Question | Settled as |
|---|---|
| Do `team1`, `team2` and `banner` already exist, and under what names? | **Yes** — `team/team1.jpg` (2048×1365), `team/team2.png` (512×288) and `team/banner.png` (1384×418), committed with the plan in `80b503a`. All three extensions differ, so each is referenced as it is on disk. |
| Is there an existing class for the "sofia" image's frame? | **Yes** — `.origin__photo` in `styles/main.css`: `1px solid var(--papaya)` and `border-radius: 10px`, on a block that fills its column. Reused verbatim for `team1` and `team2`, no second bordered-image class invented. |
| Is the nav a shared include, or duplicated per page? | **Duplicated.** There is no include mechanism — `index.html`, `case-studies.html` and `contact-us.html` each inline their own copy. Per the spec, only `index.html` and the new `team.html` are updated; see section 6. |
| What border colour should `team2` take? | **Papaya**, the spec's stated default. It comes with `.origin__photo` rather than being declared again. |
| Where in the nav does the "Team" link go? | **Where it already is.** Every Softpapaya page already carries an inert `<li><a href="#">Team</a></li>` fourth in the list; it is repointed in place rather than a ninth tab being appended. This is the same move an earlier job made for the "Case Studies" tab. |
| Is there a grid system the avatars should plug into? | **Yes** — `.services__grid` + `.card`, reused class for class the way the VALUES band and the Case Studies page reuse them. See section 4 for the one thing that had to be declared. |
| Is "Slaw" the intended display name? | **Kept as supplied.** It is written as its own single-name entry, separate from "Slawek Panic", so `team/placeholder-slaw.png` is the file. Flagged for the reviewer in section 6, along with the spec's "Principle Engineer". |

## 3. File map, as the plan names it and as it exists

The plan's file map writes the images under `images/team/`. They are under
`team/` on disk, where they were committed with the plan, so that is the path
used and the ten placeholders join them there rather than a second folder being
invented alongside the first. The map was otherwise followed file for file.

| Plan | Here |
|---|---|
| `images/team/team1.*` | `team/team1.jpg` (already present) |
| `images/team/team2.*` | `team/team2.png` (already present) |
| `images/team/banner.*` | `team/banner.png` (already present) |
| `images/team/placeholder-<name>.png` × 10 | `team/placeholder-<name>.png` × 10 (new) |
| `css/*.css` | `styles/main.css` — `style.css` at the root belongs to the legacy pages |

## 4. The one gap: a three-step border rotation

The spec asks the ten avatar boxes to run papaya → lime → black and round
again. `.services__grid > .card` already rotates its borders by position, but on
a **six**-step sequence — papaya, lime, black, black, papaya, lime — which is
the shades the "WHAT WE OFFER" band was specified with. Ten boxes on that
sequence come out papaya, lime, black, **black**, **papaya**, **lime**, papaya,
lime, black, **black**: four of the ten wrong.

No per-item border-colour class exists to reach for instead — the site sets the
shade by position, deliberately, "so the sequence holds if the grid is reordered
or grows". So the rotation is declared the same way, scoped to the team band:

```css
.team .services__grid > .card:nth-child(3n + 1) { border-color: var(--papaya); }
.team .services__grid > .card:nth-child(3n + 2) { border-color: var(--lime); }
.team .services__grid > .card:nth-child(3n)     { border-color: var(--black); }
```

Three existing tokens, no new shade, and the six-step sequence the services and
values cards keep is untouched — the same way `.case-studies .services__grid`
overrides that grid's column count without editing it. The band's own rules are
its vertical rhythm (`.team`), the 32px gap between the four things stacked in
it (`.team__stack`, the origin band's gap), and one sizing rule shared by the
avatars and the banner (`.team__avatar, .team__banner`), which is
`.case-study__graphic`'s declarations under a name the team band can use.

## 5. The page shell, and the two bands

`team.html` is `case-studies.html`'s shell — `<head>` (title changed), header,
nav and footer byte for byte, with the "Team" tab repointed — because that page
is already index.html's shell with the anchors qualified for a subpage, which is
what a new subpage needs. `tests/team-page.test.mjs` diffs all four regions
against it rather than trusting the copy.

Its `<main>` is two bands, both index.html's own:

- `.hero` — `h1.hero__heading` broken over two lines with a `<br>`, "THE TEAM"
  in the `span.hero__papaya` the home page paints "REALLY WELL" with, and the
  subtext in `p.hero__lede`. The band is reused whole, so its 64px/40px rhythm
  and the lede's measure, colour and 20px offset come with it.
- `.team` — `team1`, the ten avatars, `team2` and the banner, stacked in that
  order on the 24px/72px rhythm the `.services` band takes after the hero.

## 6. Flagged for the reviewer

1. **"Principle Engineer"** (Slawek Panic) and the single-name **"Slaw"** are
   written exactly as the spec supplied them. If "Principal" and "Slawek" were
   meant, both are one-word edits — the file `team/placeholder-slaw.png` would
   be renamed with the name.
2. **`case-studies.html` and `contact-us.html` still carry an inert "Team"
   tab** (`href="#"`). The spec scopes the nav change to `index.html` and
   `team.html` and asks for the rest to be flagged rather than folded in, so it
   is flagged here: two one-line edits, whenever wanted.
3. **The footer's "Team" link** (in its "About" column) is also still `href="#"`
   on every page. The spec's scope is the *top* navigation, and the test suite
   asserts every footer link is inert, so it was left alone.
4. **The banner artwork draws a "SEE OPEN ROLES" button** that is part of the
   image and therefore not clickable. Its wording is carried in the image's
   `alt` text. Making it a real link would need a Careers destination, which
   does not exist yet — the nav's "Careers" tab is inert too.
5. **The avatar grid runs the services grid's column counts** — one, two and
   three across at the site's existing breakpoints — so the last of the ten
   boxes sits alone on a fourth row at desktop width. The spec calls a partial
   final row acceptable and rules out a new grid system, so the breakpoints were
   reused as they are rather than retuned to divide ten evenly.
6. **The ten avatars are placeholders**, drawn here as a neutral 480×480 grey
   silhouette, one file per person. Swapping in a real photograph is a file
   replacement; no HTML or CSS has to change.

## 7. Effect on the existing test suite

Three file-manifest audits in `tests/page.test.mjs` — the page list, the site
file list and the repository-root list — enumerate the site exactly, and were
already failing on this branch's starting commit because `team/` landed with the
plan and was never registered. They now name `team.html` and the `team/` assets,
and `legacySiteFiles()` excludes them the way it already excludes everything that
arrived after the legacy pages' audits were written.

`tests/values-section.test.mjs` asserts the home page's nav link by link; its
"Team" entry now expects `team.html`, with a comment saying which job repointed
it, exactly as the "Case Studies" and "Contact" entries above it already do.
`beforeTeamPage` and `beforeTeamStyles` in `tests/site.mjs` rewind this job out
of the byte-for-byte diffs earlier jobs wrote, as `beforeCaseStudies` and
`beforeCaseStudiesStyles` rewind theirs.

Five tests in `tests/page.test.mjs` and `tests/values-section.test.mjs` fail in
this checkout for a reason this job does not touch: they diff a file against the
commit that added an earlier plan, and this checkout's history begins at
`80b503a`, so there is no such commit to read and the "baseline" they get back
is the current file. They fail identically before and after this change.
