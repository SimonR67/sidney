# Notes: Team page — Oskar S and Slaw put back, and the roster taken to twelve

Plan: specs/282a4e1c-1c11-4ac6-bb3c-31ade6a0bbde/plan.md
Spec: specs/282a4e1c-1c11-4ac6-bb3c-31ade6a0bbde/spec.md

## 1. Discovery: where the list lives, and the ten as they stood

The plan's file map leaves the source "to be confirmed by inspection". What the
repository actually holds, read before anything was written:

- `team.html` — the Team page. Static markup at the repository root, **no build
  step, no CMS and no data file**: the team list is written into the page, one
  `<li class="card">` per member inside a single `<ul class="services__grid">`.
  The spec's third open question is settled by the file itself — the change is an
  edit to that markup and nothing else. The site ships no JSON or YAML the list
  could be driven from, and no other file in it carries the list — the
  stylesheet quotes the longest caption in one comment, to explain a wrap, and
  that is the whole of it.
- There is no per-member component or partial to change: the "card" is the home
  page's own `.card` written out inline, so a new entry is a copy of an existing
  block with the name, the role and the filename swapped.
- `styles/main.css` — the one stylesheet the Softpapaya pages are styled from.
  The band's rules sit under `/* Team page --- */`, and the border rotation is
  `:nth-child(3n + 1/2/3)` scoped to the band, so it renumbers itself over
  however many boxes the grid holds. No CSS change was needed for this job, and
  none was made.
- `team/placeholder-*.png` — one placeholder avatar per member, all of them
  **byte-identical** (`0fe5228…`, a 480×480 grey silhouette); only the filename
  tells them apart.
- `tests/site.mjs` holds `TEAM_MEMBERS`, from which the page's expected
  captions, its avatar filenames and the repository's file manifest are all
  derived; `tests/team-page.test.mjs` and `tests/team-update.test.mjs` are the
  suites the band was built and last edited against.

The baseline — the ten entries as the grid drew them before this job, in the
order it drew them, captured from the page in headless Chrome:

| # | Caption |
|---|---|
| 1 | Simon Raitt — CEO |
| 2 | Jason Hill — COO |
| 3 | Pete Callaghan — CTO |
| 4 | Ania Balicka — Director |
| 5 | Slawek Panic — Principle Engineer |
| 6 | Grygorii L — Front End Lead |
| 7 | Marcin S — Back End Lead |
| 8 | Paula S — Agile Delivery Lead |
| 9 | Nino A — Power BI and Data Analyst |
| 10 | Marcin B — Mobile iOS and Android Lead Engineer |

## 2. The "existing placeholders", and what was actually there

The request asks to "fill the existing placeholders". Taken literally that means
empty cards, commented-out entries or unused list items left behind when the two
members were dropped. There were **no literal placeholder slots** in the page:

- Every one of the ten `<li class="card">` blocks carried an image and a caption
  naming a person. None was empty, and none was labelled generically.
- The page's HTML comments name neither "Oskar S" nor "Slaw", and no entry was
  commented out.
- The two were not left as gaps when job f5053a8e dropped them: that job
  *replaced* them in place, so positions 8 and 9 were taken over by "Paula S"
  and "Nino A" and their two avatar files were renamed. Nothing was left vacant.

So the spec's fallback applies — "insert two new entries in the appropriate
position(s)" — and "placeholder" is read the way the rest of the page uses the
word: the two get the same 480×480 silhouette every other member carries, in a
file named for them, as no photograph was sourced for either. Oskar S takes slot
8 and Slaw slot 9, which is where the spec's twelve-person roster puts them.

## 3. The two entries put back

| Position | Caption | Avatar |
|---|---|---|
| 8 | Oskar S — Lead Engineer | `team/placeholder-oskar-s.png` |
| 9 | Slaw — Lead Engineer and AI Lead | `team/placeholder-slaw.png` |

Both blocks are a copy of the block beside them with the name, the role and the
filename swapped: same `<li class="card">`, same `<img class="team__avatar">`
with the `width="480" height="480"` the band reserves space with, same
`<h3 class="card__title">` caption, same "Placeholder portrait of …" alt text.
`tests/team-restore.test.mjs` asserts that parity structurally — each new block,
with its person written out, is identical to every other block written out the
same way — rather than by eye.

The two avatar files are the same bytes as the other ten, restored under the
names job f5053a8e renamed away. No new artwork was drawn and no photograph was
sourced; both are out of scope for this spec.

## 4. The order the spec asks for, and the one conflict it creates

The spec's roster (§1, and again in its acceptance criteria) and the plan's user
journey both give the same twelve, in this order:

> Simon Raitt, Jason Hill, Pete Callaghan, Ania Balicka, Slawek Panic,
> Grygorii L, Marcin S, Oskar S, Slaw, Marcin B, Paula S, Nino A

The page had Paula S and Nino A at 8 and 9 and Marcin B at 10. Inserting the two
at 8 and 9 and leaving the rest strictly alone would give
`… Marcin S, Oskar S, Slaw, Paula S, Nino A, Marcin B` — which is **not** the
list the spec asks for. Matching the roster means Marcin B moves ahead of Paula
S and Nino A.

Two lines of the plan are in conflict here, and the flagged decision is to
follow the explicit ordered list:

- "The TEAM page renders exactly 12 team members, in the exact order specified
  in the spec" (definition of done), and the enumerated journey in §3.
- "Reordering or renumbering any of the other 10 team members" (out of scope),
  which reads as boilerplate written on the assumption that the existing ten
  were already in roster order. They were not.

The explicit, thrice-repeated list wins: it is the only acceptance criterion
that can actually be checked, and task 5 of the plan itself allows for
"position renumbering caused by insertion". **Nothing about any of the ten
changes but its position** — every caption, alt text and filename is the one it
had, and the three blocks that move are byte-for-byte the blocks that were
there, which `tests/team-restore.test.mjs` asserts against the page as it stood
in the commit that added this plan. This is flagged below.

## 5. Verification

- Automated, in `tests/team-restore.test.mjs` (28 tests, one describe per plan
  task): the source located and the ten captured as the baseline; no literal
  placeholder slot in the page before or after; each new entry's caption,
  position, file, alt text and structural parity with every other box; the
  twelve in the roster's order with the ten unchanged and their markup
  byte-identical to the baseline commit; a repository-wide diff limited to
  `team.html`, the two avatar files and `package.json`; and the band drawn at
  320, 375, 414, 768, 1024, 1280 and 1440px with no sideways scroll, no clipped
  or overlapping caption, no failed request and nothing logged.
- The grid reflows into whole rows at every width because twelve divides by one,
  two and three: 12 rows at mobile widths, 6 at 768px, 4 at 1024px and up. Ten
  left a short last row; twelve does not.
- Read off the rendered page at 375px, 768px and 1280px: twelve boxes in one,
  two and three columns, no sideways scroll, nothing logged and no failed
  request, and the captions in the roster's own order. The two new boxes read
  "Oskar S — Lead Engineer" and "Slaw — Lead Engineer and AI Lead", drawn in the
  lime and the black their positions give them, with the three-step rotation
  running unbroken over all twelve and ending on black.
- The shared stylesheet is byte-identical to the baseline commit; the band
  needed no rule of its own, which the same suite asserts.

## 6. Effect on the existing test suite

`TEAM_MEMBERS` in `tests/site.mjs` is the twelve, in roster order, and
`TEAM_RESTORED` and `TEAM_ROSTER_BEFORE` beside it record what was put back and
what the ten looked like before. Everything derived from `TEAM_MEMBERS` — the
expected captions, the avatar filenames, the repository's file manifest and the
border rotation — follows from that. Four assertions in the two earlier Team
suites were written against facts this job supersedes and are retargeted, each
with a comment saying so:

- `tests/team-update.test.mjs`, twice: that the entry each replacement took over
  was gone from the page, and that its avatar file no longer shipped. Both are
  back. What those were guarding — that a replacement took over its box rather
  than being added beside it, and that each box carries a file named for the
  person in it — is asserted instead.
- `tests/team-update.test.mjs`, in the count of entries that job left standing:
  eight, which now means the twelve less its own two and this job's two.
- `tests/team-page.test.mjs`, twice: that ten boxes on a three-step rotation end
  on papaya (twelve end on black), and that exactly one file is named
  `placeholder-slaw…` — the single-name "Slaw" has their own file again
  alongside "Slawek Panic", so the guard is written as the two distinct files it
  was always about. The "longest caption" check is retargeted at Marcin B's box
  by index, since Marcin B is no longer the last entry on the page.

Three tests fail in this checkout for a reason this job does not touch: they
diff a file against the commit that added an earlier plan, and this checkout's
history does not go back that far, so the "baseline" they read is the current
file. They fail identically before and after this change.

## 7. Flagged for the reviewer

1. **Marcin B, Paula S and Nino A move.** The spec's ordered roster cannot be
   satisfied without it — see §4. If the intent was instead to leave the ten
   strictly in place and simply insert two, the final order is
   `… Marcin S, Oskar S, Slaw, Paula S, Nino A, Marcin B` and the fix is moving
   one `<li class="card">` block back down. No other change would be needed.
2. **"Slaw" is still a single name**, as supplied, and its caption still names
   the same "Lead Engineer" role that "Oskar S" carries — both were flagged when
   the page was first built
   (`specs/755b1c19-a364-4f06-bf29-a35998f8da76/notes.md` §6.1) and neither was
   confirmed since.
3. **The placeholder silhouettes stay**, for these two as for the other ten.
   Swapping in a real photograph is a file replacement; no HTML or CSS has to
   change.
4. **`package.json` is modified**, which the plan's "no other file" rule does
   not cover: it is the list of test files `npm test` runs, and this job's suite
   is added to it.
