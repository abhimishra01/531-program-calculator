# Fix summary (Steve, 2026-10-20)

## Fixed
- Citations (must): the page no longer says every rule is from the 2009 book. Notes and sources now names the two guides each rule was checked against (Lift Vault, Arvo), says the books were not opened, and labels the 85% TM, the 10% TM cut after a miss and the 50% BBB start as common variations. "Jim Wendler" appears once, as a series citation; removed from About.
- Jokers: now 2 sets at +5% and +10% of the TM (the cited "5% to 10%"), not in the 5s week unless the user ticks "Also allow jokers in the 5s week". Page text, FAQ and tests updated.
- BBB 70% removed (sources say 50 to 60%). Old saved 70 falls back to 50.
- Copy: privacy storage line, "531 calculator" FAQ, example-numbers note, input range message, supplemental title not repeated.
- Code: bump text reads BUMP, top set is the last set, print sheet has no second h1 and no "bar ?", apply button hidden with no lifts, dead CSS and .btn-brand removed, tsconfig excludes dist-* and tmp-*.
- Tests: 20 pass (new: jokers, BBB options, brute-force closest-loadable for 6 plate/bar/unit sets).
- Template items already in place and verified: README, US spelling, fixed Privacy/Terms date, no new-tool.sh, screenshots and .playwright-cli ignored, deploy runs npm test, no duplicate home links, Tailwind scan limited to src. CSS size is 29.4 KB (unchanged by this pass; scan was already limited).
- GitHub Pages: PAGES_BASE build checked in a browser (home, about, privacy, icons, manifest all under /531-program-calculator/), noindex present, canonical on the real domain, workflow kept.

## Rejected or deferred
- Split Tool.astro (479 lines) and type the `any`s: deferred, no behavior change, larger refactor.
- Sticky result strip on phones, copy as text, e1RM from reps, round-down option, multiple bars: new features, out of scope (single purpose). The "Jump to your cycle" button stays.
- No-JS min-height, week tab wrapping, sitemap lastmod, schema category: nice items, left.
- Placeholder email and owner name: owner must set before launch.

## Status
npm test 20/20, build ok (6 pages). Lighthouse not re-run; the last review run was 100 in all four.

## Phase 2 SEO pages
BBB calculator; FSL calculator; SSL calculator; 5s PRO calculator; 3/5/1 calculator; 5/3/1 for beginners; 5/3/1 deload week; 5/3/1 joker sets; 5/3/1 plate calculator; 5/3/1 squat calculator; 5/3/1 bench calculator; 5/3/1 deadlift calculator; 5/3/1 overhead press calculator; 5/3/1 kg calculator; 5/3/1 training max calculator; 5/3/1 spreadsheet alternative; 5/3/1 printable sheet; 5/3/1 for 4 days a week; 5/3/1 with a 35 lb bar; 531 calculator (no slashes).

## Left for the owner
Real contact mailbox and owner name; check the rules against the books before launch.
