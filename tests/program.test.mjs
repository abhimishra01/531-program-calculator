import test from 'node:test';
import assert from 'node:assert/strict';
import { makeLoader, describe, parseNumber, convertRounded, buildTable, DEFAULT_PLATES } from '../src/lib/plates.js';
import { buildCycle, trainingMax, LIFTS, WEEK_TYPES, ORDERS } from '../src/lib/program.js';

const lbLoader = (plates = DEFAULT_PLATES.lb, bar = 45) => makeLoader({ bar, plates, unit: 'lb' });
const kgLoader = (plates = DEFAULT_PLATES.kg, bar = 20) => makeLoader({ bar, plates, unit: 'kg' });
const base = (over = {}) => ({
  unit: 'lb', mode: 'tm', values: { squat: 300, bench: 200, deadlift: 400, press: 120 }, loader: lbLoader(), ...over,
});
const week = (c, n) => c.weeks[n - 1];
const lift = (c, n, id) => week(c, n).lifts.find((l) => l.id === id);
const work = (l) => l.sections.find((s) => s.kind === 'work').sets;

test('training max is 90 percent of 1RM, rounded to 5 lb', () => {
  assert.equal(trainingMax(315, 'rm', 90, 'lb'), 285); // 283.5 rounds to 285
  assert.equal(trainingMax(300, 'rm', 90, 'lb'), 270);
  assert.equal(trainingMax(300, 'rm', 85, 'lb'), 255);
  assert.equal(trainingMax(140, 'rm', 90, 'kg'), 125); // 126 rounds to 125
  assert.equal(trainingMax(300, 'tm', 90, 'lb'), 300); // a typed TM is used as is
  assert.ok(Number.isNaN(trainingMax(0, 'rm', 90, 'lb')));
  assert.ok(Number.isNaN(trainingMax(NaN, 'tm', 90, 'lb')));
});

test('week percentages and reps (5/3/1 order)', () => {
  const c = buildCycle(base({ warm: false }));
  const w = (n) => work(lift(c, n, 'squat')).map((s) => [s.pct, s.reps, !!s.amrap]);
  assert.deepEqual(w(1), [[65, 5, false], [75, 5, false], [85, 5, true]]);
  assert.deepEqual(w(2), [[70, 3, false], [80, 3, false], [90, 3, true]]);
  assert.deepEqual(w(3), [[75, 5, false], [85, 3, false], [95, 1, true]]);
  assert.deepEqual(w(4), [[40, 5, false], [50, 5, false], [60, 5, false]]);
  assert.deepEqual(c.weeks.map((x) => x.label), ['5s week', '3s week', '5/3/1 week', 'Deload']);
});

test('3/5/1 order swaps the first two weeks', () => {
  const c = buildCycle(base({ order: '351' }));
  assert.deepEqual(c.weeks.map((x) => x.key), ['threes', 'fives', 'ones', 'deload']);
  assert.equal(work(lift(c, 1, 'squat'))[2].pct, 90);
  assert.equal(work(lift(c, 2, 'squat'))[2].pct, 85);
});

test('known weights: TM 300 lb, 45 lb bar, plates 45 25 10 5 2.5', () => {
  const c = buildCycle(base());
  const sq = work(lift(c, 1, 'squat'));
  assert.deepEqual(sq.map((s) => s.weight), [195, 225, 255]);
  assert.deepEqual(work(lift(c, 3, 'squat')).map((s) => s.weight), [225, 255, 285]);
  assert.deepEqual(sq[1].list, [{ w: 45, n: 2 }]); // 225 = two 45s a side
  assert.equal(sq[1].side, 90);
  // bench TM 200: 65% = 130 rounds to 130 (side 42.5 = 25 + 10 + 5 + 2.5)
  assert.equal(work(lift(c, 1, 'bench'))[0].weight, 130);
  assert.deepEqual(work(lift(c, 1, 'bench'))[0].list, [{ w: 25, n: 1 }, { w: 10, n: 1 }, { w: 5, n: 1 }, { w: 2.5, n: 1 }]);
});

test('rounding goes to the closest loadable weight, ties up', () => {
  const L = lbLoader();
  assert.equal(L.round(146.25).total, 145);
  assert.equal(L.round(147.5).total, 150); // tie goes up
  assert.equal(L.round(148).total, 150);
  assert.equal(L.round(226).total, 225);
  assert.equal(L.round(30).total, 45);     // under the bar: empty bar
  assert.deepEqual(L.round(45).list, []);
  assert.equal(describe([]), 'Bar only');
  assert.equal(describe([{ w: 45, n: 2 }, { w: 10, n: 1 }]), '45×2 + 10');
});

test('without small plates the step gets coarser', () => {
  const L = lbLoader([45, 25, 10]);          // smallest plate 10: steps of 20 lb
  assert.equal(L.round(135).total, 135);     // side 45
  assert.equal(L.round(130).total, 135);     // side 42.5: 35 and 45 are loadable, 45 is closer
  const K = kgLoader([25, 20, 15, 10, 5]);   // smallest 5: steps of 10 kg
  assert.equal(K.round(62.5).total, 60);
  assert.equal(K.round(65).total, 70);       // 65 is a tie between 60 and 70, up
});

test('no plates on: rounds to the unit step and lists nothing', () => {
  const L = makeLoader({ bar: 45, plates: [], unit: 'lb' });
  assert.equal(L.noPlates, true);
  assert.equal(L.round(147).total, 145);
  assert.deepEqual(L.round(147).list, []);
});

test('kilogram cycle with a 20 kg bar', () => {
  const c = buildCycle({ unit: 'kg', mode: 'rm', tmPct: 90, values: { squat: 140, bench: 100, deadlift: 180, press: 60 }, loader: kgLoader() });
  assert.equal(c.tms.squat, 125);
  assert.deepEqual(work(lift(c, 1, 'squat')).map((s) => s.weight), [82.5, 95, 107.5]); // 81.25, 93.75, 106.25
  assert.deepEqual(c.next.map((n) => [n.id, n.bump, n.next]), [['squat', 5, 130], ['bench', 2.5, 92.5], ['deadlift', 5, 167.5], ['press', 2.5, 57.5]]);
});

test('warm-up sets: 40 x5, 50 x5, 60 x3 and none in the deload week', () => {
  const c = buildCycle(base());
  const wu = lift(c, 1, 'deadlift').sections[0];
  assert.equal(wu.kind, 'warmup');
  assert.deepEqual(wu.sets.map((s) => [s.pct, s.reps, s.weight]), [[40, 5, 160], [50, 5, 200], [60, 3, 240]]);
  assert.ok(!lift(c, 4, 'squat').sections.some((s) => s.kind === 'warmup'));
  const off = buildCycle(base({ warm: false }));
  assert.ok(!lift(off, 1, 'squat').sections.some((s) => s.kind === 'warmup'));
});

test('5s PRO: every set is 5 reps and none is an AMRAP', () => {
  const c = buildCycle(base({ main: 'pro', warm: false }));
  for (const n of [1, 2, 3, 4]) {
    for (const s of work(lift(c, n, 'squat'))) { assert.equal(s.reps, 5); assert.ok(!s.amrap); }
  }
  assert.deepEqual(work(lift(c, 2, 'squat')).map((s) => s.pct), [70, 80, 90]);
  assert.deepEqual(work(lift(c, 3, 'squat')).map((s) => s.pct), [75, 85, 95]);
});

test('supplemental: BBB 5x10 at the chosen percent, FSL and SSL 5x5, none in deload', () => {
  const sec = (c, n) => lift(c, n, 'squat').sections.find((s) => s.kind === 'supp');
  const bbb = buildCycle(base({ supp: 'bbb', bbbPct: 60 }));
  assert.deepEqual([sec(bbb, 1).sets[0].pct, sec(bbb, 1).sets[0].reps, sec(bbb, 1).sets[0].count, sec(bbb, 1).sets[0].weight], [60, 10, 5, 180]);
  const fsl = buildCycle(base({ supp: 'fsl' }));
  assert.deepEqual([1, 2, 3].map((n) => sec(fsl, n).sets[0].pct), [65, 70, 75]);
  assert.equal(sec(fsl, 1).sets[0].reps, 5);
  const ssl = buildCycle(base({ supp: 'ssl' }));
  assert.deepEqual([1, 2, 3].map((n) => sec(ssl, n).sets[0].pct), [75, 80, 85]);
  assert.equal(sec(ssl, 4), undefined);
  assert.equal(sec(buildCycle(base()), 1), undefined);
});

test('joker sets: three sets, 5 percent steps above the top set, none in deload', () => {
  const c = buildCycle(base({ joker: true }));
  const jk = (n) => lift(c, n, 'squat').sections.find((s) => s.kind === 'joker');
  assert.deepEqual(jk(1).sets.map((s) => [s.pct, s.reps, s.weight]), [[90, 3, 270], [95, 3, 285], [100, 3, 300]]);
  assert.deepEqual(jk(3).sets.map((s) => [s.pct, s.reps]), [[100, 1], [105, 1], [110, 1]]);
  assert.equal(jk(4), undefined);
  assert.equal(lift(buildCycle(base()), 1, 'squat').sections.find((s) => s.kind === 'joker'), undefined);
});

test('deload week can be left out', () => {
  const c = buildCycle(base({ deload: false }));
  assert.equal(c.weeks.length, 3);
  assert.deepEqual(c.weeks.map((w) => w.number), [1, 2, 3]);
});

test('next cycle: +5 lb upper, +10 lb lower from the TM', () => {
  const c = buildCycle(base());
  assert.deepEqual(c.next.map((n) => n.next), [310, 205, 410, 125]);
});

test('empty or invalid lift gives no sets and does not break the others', () => {
  const c = buildCycle(base({ values: { squat: NaN, bench: 200, deadlift: 0, press: 120 } }));
  assert.deepEqual(lift(c, 1, 'squat').sections, []);
  assert.deepEqual(lift(c, 1, 'deadlift').sections, []);
  assert.ok(lift(c, 1, 'bench').sections.length > 0);
  assert.ok(Number.isNaN(c.next[0].next));
});

test('every set weight is exactly loadable (brute force over the plates)', () => {
  const plates = DEFAULT_PLATES.lb;
  const L = lbLoader(plates);
  const table = buildTable(plates.map((p) => Math.round(p * 100)), 40000);
  for (let w = 45; w <= 700; w += 0.5) {
    const r = L.round(w);
    const sum = r.list.reduce((a, p) => a + p.w * p.n, 0);
    assert.equal(45 + 2 * sum, r.total, `plates add up at ${w}`);
    assert.ok(table.count[Math.round(r.side * 100)] >= 0, `reachable at ${w}`);
    // the pick is no farther than any other loadable weight
    const lo = r.total - 5, hi = r.total + 5;
    assert.ok(Math.abs(r.total - w) <= Math.abs(lo - w) + 1e-9 && Math.abs(r.total - w) <= Math.abs(hi - w) + 1e-9, `closest at ${w}`);
  }
});

test('large lifts and a custom bar work', () => {
  const L = lbLoader(DEFAULT_PLATES.lb, 25);
  assert.equal(L.round(1000).total, 1000);
  assert.equal(L.round(25).total, 25);
  const big = lbLoader().round(1900);
  assert.equal(big.total, 1900);
});

test('number parsing and unit conversion', () => {
  assert.equal(parseNumber('62,5'), 62.5);
  assert.equal(parseNumber('1,225'), 1225);
  assert.ok(Number.isNaN(parseNumber('abc')));
  assert.ok(Number.isNaN(parseNumber('')));
  assert.equal(convertRounded(225, 'lb', 'kg'), 102.5);
  assert.equal(convertRounded(100, 'kg', 'lb'), 220);
  assert.ok(Number.isNaN(convertRounded(NaN, 'lb', 'kg')));
  assert.equal(LIFTS.length, 4);
  assert.equal(Object.keys(WEEK_TYPES).length, 4);
  assert.equal(ORDERS['351'][0], 'threes');
});
