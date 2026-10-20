// The 5/3/1 cycle. Pure functions, no DOM. Percentages are of the training max (TM).
// Sources (secondary guides; the books were not available to check, see the page notes):
//  - Main sets, warm-ups, deload, TM at 90% of 1RM, TM bumps, 3/5/1, 5s PRO, BBB 50-60%, FSL, SSL:
//    liftvault.com/resources/531-calculator/ and arvo.guru/resources/methods/wendler-531.
//  - Joker sets: liftvault.com joker page (5% to 10% above the top set, 1 to 3 reps, earned not expected).
// Unofficial implementation, not affiliated with the author or publisher.
import { STEP, fmt } from './plates.js';

export const LIFTS = [
  { id: 'squat', name: 'Squat', group: 'lower' },
  { id: 'bench', name: 'Bench press', group: 'upper' },
  { id: 'deadlift', name: 'Deadlift', group: 'lower' },
  { id: 'press', name: 'Overhead press', group: 'upper' },
];

// Main work per week type. The last set of weeks 1 to 3 is an "as many reps as possible" set (shown with +), unless 5s PRO is on.
export const WEEK_TYPES = {
  fives: { label: '5s week', pcts: [65, 75, 85], reps: [5, 5, 5], joker: { reps: 3 } },
  threes: { label: '3s week', pcts: [70, 80, 90], reps: [3, 3, 3], joker: { reps: 3 } },
  ones: { label: '5/3/1 week', pcts: [75, 85, 95], reps: [5, 3, 1], joker: { reps: 1 } },
  deload: { label: 'Deload', pcts: [40, 50, 60], reps: [5, 5, 5], joker: null },
};
// Week order. "3/5/1" swaps the first two weeks.
export const ORDERS = {
  '531': ['fives', 'threes', 'ones', 'deload'],
  '351': ['threes', 'fives', 'ones', 'deload'],
};
export const WARMUP = { pcts: [40, 50, 60], reps: [5, 5, 3] };
// Joker sets: two sets above the top set, +5 and +10 percentage points of the TM (the source says 5% to 10%).
// Not in the 5s week by default (the cited advice), unless the person turns that on.
export const JOKER_STEPS = [5, 10];
export const SUPP = {
  bbb: { label: 'Boring But Big', sets: 5, reps: 10 },
  fsl: { label: 'First Set Last', sets: 5, reps: 5 },
  ssl: { label: 'Second Set Last', sets: 5, reps: 5 },
};
export const BBB_PCTS = [50, 60]; // 50 to 60 percent of the TM, from the cited guides
// TM bump after a cycle: 5 lb for upper lifts and 10 lb for lower lifts (2.5 and 5 kg).
export const BUMP = { lb: { upper: 5, lower: 10 }, kg: { upper: 2.5, lower: 5 } };

const roundTo = (w, step) => Math.round(w / step) * step;

// Training max from what the person typed. A 1RM becomes pct percent of it, rounded to the unit step.
export function trainingMax(value, mode, pct, unit) {
  if (!(value > 0)) return NaN;
  return mode === 'tm' ? value : roundTo((value * pct) / 100, STEP[unit]);
}

// Build the whole cycle. loader.round(weight) gives the loadable total and plates.
export function buildCycle({ unit, mode, tmPct = 90, values, order = '531', main = 'std', supp = 'none', bbbPct = 50, warm = true, joker = false, jokerFives = false, deload = true, loader }) {
  const tms = {};
  for (const l of LIFTS) tms[l.id] = trainingMax(values[l.id], mode, tmPct, unit);
  const keys = ORDERS[order].filter((k) => deload || k !== 'deload');
  const set = (tm, pct, reps, extra = {}) => {
    const r = loader.round((tm * pct) / 100);
    return { pct, reps, weight: r.total, side: r.side, list: r.list, ...extra };
  };
  const weeks = keys.map((key, i) => {
    const wt = WEEK_TYPES[key];
    const lifts = LIFTS.map((l) => {
      const tm = tms[l.id];
      if (!(tm > 0)) return { id: l.id, name: l.name, tm: NaN, sections: [] };
      const sections = [];
      if (warm && key !== 'deload') {
        sections.push({ kind: 'warmup', title: 'Warm-up', sets: WARMUP.pcts.map((p, j) => set(tm, p, WARMUP.reps[j])) });
      }
      const amrapOn = main === 'std' && key !== 'deload';
      sections.push({
        kind: 'work', title: main === 'pro' ? 'Main sets (5s PRO)' : 'Main sets',
        sets: wt.pcts.map((p, j) => set(tm, p, main === 'pro' && key !== 'deload' ? 5 : wt.reps[j], { amrap: amrapOn && j === 2 })),
      });
      if (joker && wt.joker && (key !== 'fives' || jokerFives)) {
        const top = wt.pcts[2];
        const sets = [];
        for (const step of JOKER_STEPS) sets.push(set(tm, top + step, wt.joker.reps));
        sections.push({ kind: 'joker', title: 'Joker sets (optional)', sets });
      }
      if (supp !== 'none' && key !== 'deload') {
        const s = SUPP[supp];
        const pct = supp === 'bbb' ? bbbPct : supp === 'fsl' ? wt.pcts[0] : wt.pcts[1];
        sections.push({ kind: 'supp', title: s.label, sets: [set(tm, pct, s.reps, { count: s.sets })] });
      }
      return { id: l.id, name: l.name, tm, sections };
    });
    return { key, number: i + 1, label: wt.label, lifts };
  });
  const next = LIFTS.map((l) => {
    const tm = tms[l.id];
    const bump = BUMP[unit][l.group];
    return { id: l.id, name: l.name, tm, bump, next: tm > 0 ? tm + bump : NaN };
  });
  return { tms, weeks, next };
}

// "255 x 5+" style text for a set.
export function setText(s) {
  return `${fmt(s.weight)} × ${s.reps}${s.amrap ? '+' : ''}${s.count ? ` × ${s.count}` : ''}`;
}
