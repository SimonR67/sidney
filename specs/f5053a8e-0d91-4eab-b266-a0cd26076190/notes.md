# Notes: Team page — two new members, and the band's responsiveness

Plan: specs/f5053a8e-0d91-4eab-b266-a0cd26076190/plan.md
Spec: specs/f5053a8e-0d91-4eab-b266-a0cd26076190/spec.md

## 1. Discovery

What the repository actually holds, read before anything was written:

- `team.html` — the Team page, static markup, no build step and no CMS. The
  spec's fourth open question is settled by the file itself: the ten members are
  written into the page, one `<li class="card">` each, so the content change is
  an edit to that markup and nothing else.
- `styles/main.css` — the one stylesheet the Softpapaya pages are styled from,
  written mobile-first with its two media queries (`768px`, `1024px`) collected
  at the foot. The Team band's own rules sit under `/* Team page --- */`.
- `team/placeholder-*.png` — ten placeholder avatars, one per member. All ten
  are **byte-identical** (`0fe5228…`, a 480×480 grey silhouette); only the
  filename tells them apart.
- `tests/team-page.test.mjs` — the suite the page was built against, asserting
  the grid, the captions, the border rotation and the page at seven widths from
  320px up. `tests/site.mjs` holds `TEAM_MEMBERS`, from which the page's expected
  captions, its avatar filenames and the repository's file manifest are derived.

## 2. The two entries chosen, and why those two

The spec asks for "two of the placeholder team member entries" to be replaced,
and its edge-case rule is to take "the two most clearly generic/placeholder-
labeled" ones. On this page **all ten entries are placeholders** in the sense the
spec means — every one carries a placeholder avatar and alt text that says so —
and none carries a generic label like "Team Member" or "TBD". So the rule was
applied to the captions, which are the only thing that distinguishes them: the
two chosen are the two that identify a person least.

| Position | Replaced | By | Why this one |
|---|---|---|---|
| 8 | Oskar S — Lead Engineer | Paula S — Agile Delivery Lead | The only entry that is *both* an initial-for-a-surname name and a role naming no discipline. "Lead Engineer" is also the one role title the page uses twice. |
| 9 | Slaw — Lead Engineer and AI Lead | Nino A — Power BI and Data Analyst | The least identifying caption on the page: a single name, no surname and no initial. `specs/755b1c19-a364-4f06-bf29-a35998f8da76/notes.md` §6.1 already flagged it as supplied-as-is and unconfirmed. |

The eight entries left standing — Simon Raitt, Jason Hill, Pete Callaghan, Ania
Balicka, Slawek Panic, Grygorii L, Marcin S and Marcin B — keep their captions,
their images and their positions untouched. Choosing positions 8 and 9 also
keeps every named discipline on the page (front end, back end, mobile) and puts
the two additions next to each other, in the order the request lists them.

**The artwork stays a placeholder.** No photograph was sourced for either
person, which the spec puts out of scope. Each new entry keeps the same 480×480
silhouette its predecessor carried — the same bytes, since all ten files are
identical — renamed to the person standing in it:

| Was | Is |
|---|---|
| `team/placeholder-oskar-s.png` | `team/placeholder-paula-s.png` |
| `team/placeholder-slaw.png` | `team/placeholder-nino-a.png` |

The rename is not new artwork: it is the site's own convention, which
`tests/team-page.test.mjs` asserts ("names each one for the person it stands in
for, lowercase and hyphenated"), and it keeps the `alt` text — which has to name
the person the box is for — honest against the file it describes.

## 3. The responsiveness audit: what was already there

The spec describes the Team page's layout as "fixed/desktop-only". It is not.
The band was built on the site's own mobile-first grid, and measuring it before
changing anything (headless Chrome, `.team .services__grid`) gives:

| Width | Columns | Track | Avatar drawn at | Caption | Sideways scroll |
|---|---|---|---|---|---|
| 320px | 1 | 280px | 230px | wraps to 2 lines | none |
| 375px | 1 | 335px | 285px | wraps to 2 lines | none |
| 414px | 1 | 374px | 324px | wraps to 2 lines | none |
| 768px | 2 | 355px | 305px | wraps to 2 lines | none |
| 1024px | 3 | 316px | 266px | wraps to 2 lines | none |
| 1280px | 3 | 375px | 325px | wraps to 2 lines | none |

The reason is two rules that already existed: `.services__grid`, which is
`display: grid` at `1fr` and steps to two and three columns in the sheet's
`768px` and `1024px` media queries, and `.team__avatar`, which is
`width: 100%; max-width: 100%; height: auto` — so the avatars are never drawn at
the 480px their files are saved at. The `width="480" height="480"` on each
`<img>` are intrinsic-size *attributes*, not pixel styling: they reserve the
box's aspect ratio before the file arrives, and the CSS above overrides both.

So tasks 5, 6, 8 and 9 needed **no CSS change**. Their tests were written
anyway, in `tests/team-update.test.mjs`, and they now hold the behaviour down:
fluid avatar sizing declared in the sheet and no pixel sizing in the band; one,
two and three columns at the site's two breakpoints and none of its own; the
desktop boxes still the size the home page's own `.services__grid` draws; and no
overflow, clipping or overlap at 320, 375, 414, 768 and 1280px.

## 4. The one gap: a caption with nowhere to break

Task 7 is the one that found something. The captions wrap on their spaces, which
is enough for the ten written today — but a name or role with no space in it had
nowhere to break, so it would have run out of its box **and** pushed the page
sideways: the boxes sit in `1fr` grid tracks, and a track's floor is the widest
unbreakable thing inside it. Injecting `Nino A — PowerBIandDataAnalyticsEngineering`
into box 9 at 320px overflowed the document by 102px. One declaration, scoped to
the band:

```css
.team .card__title {
  overflow-wrap: anywhere;
}
```

`anywhere` rather than `break-word` on purpose: only `anywhere` lowers the
min-content width the grid track is floored by, so the column can still narrow
to the screen. `break-word` breaks the line but leaves the track wide, and the
page still scrolled sideways with it in place.

**It changes nothing that is drawn today.** Every card, caption and image
rectangle on the page was measured at 320, 375, 414, 768, 1024, 1280 and 1440px
with the declaration on and with it removed through the CSSOM: identical to the
pixel at all seven widths. The desktop layout is the one it always was.

## 5. Verification

- Automated, in `tests/team-update.test.mjs` (36 tests, one describe per plan
  task): the two captions, their files and their alt text; the eight untouched
  entries; the ten boxes still built identically to each other; fluid avatar
  sizing; the column counts at six widths; captions inside their boxes at 375px
  and unbreakable ones at 320px; the desktop boxes against the home page's own
  grid; and a no-overflow/no-clipping/no-overlap pass at five widths.
- By eye, at 375px, 768px and 1280px: single column, two columns and three, with
  the two new boxes reading "Paula S — Agile Delivery Lead" and "Nino A — Power
  BI and Data Analyst", the second wrapping onto a second line inside its box.
  Their borders are the lime and the black their positions give them, so the
  band's three-step rotation is undisturbed.
- Sub-375px spot check at 320px, in the same tests: one column, avatars at
  230px, no sideways scroll.

## 6. Effect on the existing test suite

`TEAM_MEMBERS` in `tests/site.mjs` carries the two new entries, which is what the
page, the avatar filenames and the repository's file manifest are all checked
against; `TEAM_REPLACED` and `TEAM_ADDITIONS` beside it record what was swapped
for what. One test in `tests/team-page.test.mjs` asserted the single-name "Slaw"
entry had a single-name file rather than a guessed surname; that entry is gone,
so the assertion is retargeted at what it was guarding — every member has a file
of their own, and "Slawek Panic" still has theirs. `package.json` runs the new
file alongside the rest.

Five tests fail in this checkout for a reason this job does not touch: they diff
a file against the commit that added an earlier plan, and this checkout's
history does not go back that far, so the "baseline" they read is the current
file. They fail identically before and after this change.

## 7. Flagged for the reviewer

1. **Which two entries** — all ten were placeholders and none was labelled
   generically, so the two in section 2 are a judgement call against the spec's
   own rule, not a fact read off the page. Redirecting it at a different pair is
   a caption, an `alt` and a filename each.
2. **The page is one entry shorter on AI** — "Slaw — Lead Engineer and AI Lead"
   was the only caption naming AI. Every other discipline on the page (front
   end, back end, mobile) is still named by someone.
3. **The placeholder silhouettes stay** for Paula S and Nino A, as for the other
   eight. Swapping in a real photograph is a file replacement; no HTML or CSS
   has to change.
