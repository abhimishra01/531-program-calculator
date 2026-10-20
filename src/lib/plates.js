// Plate loading helpers. Pure functions, no DOM. All math runs in hundredths so 1.25 and 2.5 stay exact.
export const PLATES = {
  lb: [45, 35, 25, 10, 5, 2.5, 1.25],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};
// Plates that start switched on. Few gyms own 35 lb or 1.25 lb plates, so those start off.
export const DEFAULT_PLATES = {
  lb: [45, 25, 10, 5, 2.5],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};
// Preset bar weights. The bar id in the UI is the weight as a string, or 'custom'.
export const BARS = { lb: [45, 35], kg: [20, 15] };
// Smallest practical jump: used to round training maxes and as the fallback when no plate is on.
export const STEP = { lb: 5, kg: 2.5 };
export const MAX_WEIGHT = 1999;

export const toHundredths = (w) => Math.round(w * 100);
export const fromHundredths = (h) => h / 100;
export const fmt = (n) => String(+Number(n).toFixed(2));

export function convertWeight(w, from, to) {
  if (from === to) return w;
  return from === 'lb' ? w * 0.45359237 : w / 0.45359237;
}

// Convert a weight to the other unit and round it to that unit's step. Invalid input stays invalid.
export function convertRounded(w, from, to) {
  if (!(w > 0) || from === to) return w;
  return Math.max(STEP[to], Math.round(convertWeight(w, from, to) / STEP[to]) * STEP[to]);
}

// Read a typed number. Accepts "62,5" (decimal comma) and "1,225" (thousands comma). Returns NaN if not a number.
export function parseNumber(text) {
  let t = String(text).trim();
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '');
  else t = t.replace(',', '.');
  if (!/^\d*\.?\d*$/.test(t) || t === '' || t === '.') return NaN;
  return Number(t);
}

// Fewest plates for every reachable one-side sum from 0 to limit (hundredths). Larger plate wins ties.
export function buildTable(plateHundredths, limit) {
  const coins = [...plateHundredths].sort((a, b) => b - a);
  const count = new Int32Array(limit + 1).fill(-1);
  const last = new Int32Array(limit + 1);
  count[0] = 0;
  for (let s = 1; s <= limit; s++) {
    for (const c of coins) {
      if (c > s || count[s - c] < 0) continue;
      const n = count[s - c] + 1;
      if (count[s] < 0 || n < count[s]) { count[s] = n; last[s] = c; }
    }
  }
  return { count, last };
}

function listFor(table, sum) {
  const map = new Map();
  let s = sum;
  while (s > 0) { const c = table.last[s]; map.set(c, (map.get(c) || 0) + 1); s -= c; }
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([u, n]) => ({ w: fromHundredths(u), n }));
}

// "45 + 25 + 5" or "45x2 + 10" for one side. An empty list means the bar alone.
export function describe(list) {
  return list.length ? list.map((p) => `${fmt(p.w)}${p.n > 1 ? `×${p.n}` : ''}`).join(' + ') : 'Bar only';
}

// A loader rounds any weight to the closest total the bar and plates can make.
// Ties go up. Anything under the bar becomes the empty bar. With no plates on, it rounds to the unit step.
export function makeLoader({ bar, plates, unit }) {
  const ph = [...new Set(plates.map(toHundredths))].filter((u) => u > 0);
  const barH = toHundredths(bar);
  const maxPlate = ph.length ? Math.max(...ph) : 0;
  let table = null;
  let cap = -1;
  const ensure = (needSide) => {
    if (table && needSide <= cap) return;
    cap = Math.max(needSide, 20000) * 1.5;
    table = buildTable(ph, Math.ceil(cap) + maxPlate);
  };
  return {
    noPlates: ph.length === 0,
    round(weight) {
      const wantH = toHundredths(weight);
      if (wantH <= barH) return { total: fromHundredths(barH), side: 0, list: [] };
      if (!ph.length) {
        const step = STEP[unit] ?? 5;
        const t = Math.max(fromHundredths(barH), Math.round(weight / step) * step);
        return { total: t, side: (t - fromHundredths(barH)) / 2, list: [] };
      }
      const wantSide = Math.round((wantH - barH) / 2);
      ensure(wantSide);
      let lo = wantSide;
      while (lo > 0 && table.count[lo] < 0) lo--;
      let hi = wantSide;
      while (table.count[hi] < 0) hi++;
      const useHi = hi - wantSide <= wantSide - lo;
      const side = useHi ? hi : lo;
      return { total: fromHundredths(barH + 2 * side), side: fromHundredths(side), list: listFor(table, side) };
    },
  };
}
