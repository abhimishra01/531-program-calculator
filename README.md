# 5/3/1 program calculator

Free browser tool for 531programcalculator.com. Enter 1RMs or training maxes for four lifts and get the 4-week 5/3/1 cycle (5/3/1 or 3/5/1 order, 5s PRO, BBB, FSL, SSL, joker sets, warm-ups, deload). Every weight is rounded to a load the bar and plates can make, with plates per side. It shows next-cycle training maxes and prints a sheet for all four lifts. Unofficial tool. No backend.

Built with Astro (static) and Tailwind 4. Skin: Retro print.

## Where things live

- `src/lib/program.js`: the cycle (percents, reps, supplemental, jokers, next TM). Pure functions.
- `src/lib/plates.js`: plate rounding and helpers.
- `tests/program.test.mjs`: known-answer tests (`npm test`).
- `src/components/Tool.astro`: UI and print sheet. `src/styles/skin-retro.css`: skin and print CSS.
- `src/components/Article.astro`, `src/data/faq.ts`: page text and FAQ (also FAQPage JSON-LD).
- `src/site.config.ts`: name, domain, brand color, analytics and ads IDs.

## Commands

`npm run dev`, `npm test`, `npm run build`. GitHub Pages build: `PAGES_BASE=/531-program-calculator/ PAGES_SITE=https://abhimishra01.github.io npm run build`.
