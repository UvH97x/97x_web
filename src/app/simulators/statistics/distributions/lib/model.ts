import { mulberry32 } from './random';
import type {
  DistributionDef, HistogramData, Interval, Params, PlotRange, QuantilePoint, SampleStats,
} from './types';

export function generate(def: DistributionDef, params: Params, count: number, seed: number): Float64Array {
  const rng = mulberry32(seed >>> 0);
  const draw = def.sampler(params);
  const out = new Float64Array(count);
  for (let i = 0; i < count; i++) out[i] = draw(rng);
  return out;
}

/** F(x) with the infinite endpoints handled, so definitions need not. */
export function cdfAt(def: DistributionDef, params: Params, x: number): number {
  if (x === Number.NEGATIVE_INFINITY) return 0;
  if (x === Number.POSITIVE_INFINITY) return 1;
  return def.cdf(x, params);
}

/**
 * Generic quantile by bisection on the CDF. For discrete distributions this is
 * the generalized inverse: the smallest integer k with F(k) >= q.
 */
export function quantile(def: DistributionDef, params: Params, q: number): number {
  const [sLo, sHi] = def.support(params);
  const cdf = (x: number) => def.cdf(x, params);

  // Bracket: cdf(lo) < q <= cdf(hi).
  let lo: number;
  if (Number.isFinite(sLo)) {
    lo = def.kind === 'discrete' ? sLo - 1 : sLo;
  } else {
    let step = 1;
    lo = -step;
    for (let i = 0; i < 200 && cdf(lo) >= q; i++) { step *= 2; lo = -step; }
  }
  const base = Number.isFinite(sLo) ? sLo : 0;
  let step = 1;
  let hi = Math.min(sHi, base + step);
  for (let i = 0; i < 200 && hi < sHi && cdf(hi) < q; i++) { step *= 2; hi = Math.min(sHi, base + step); }

  if (def.kind === 'discrete') {
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (cdf(mid) >= q) hi = mid; else lo = mid;
    }
    return hi;
  }

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (mid === lo || mid === hi) break;
    if (cdf(mid) < q) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export const QUANTILE_PROBABILITIES = [0.05, 0.25, 0.5, 0.75, 0.95] as const;

export function distributionQuantiles(def: DistributionDef, params: Params): QuantilePoint[] {
  return QUANTILE_PROBABILITIES.map(probability => ({ probability, value: quantile(def, params, probability) }));
}

/**
 * How far beyond the quartiles a continuous plot may reach, in interquartile
 * ranges. Light tails end well inside this fence (normal: 1.9, exponential: 5.7),
 * so it only cuts heavy ones (Cauchy: 318), whose extreme quantiles would
 * otherwise squeeze the bulk of the distribution into a sliver.
 */
const TAIL_FENCE = 6;

/**
 * Plot range from the 0.05% and 99.95% quantiles rather than mean ± k·sd,
 * so that it also works for distributions without moments. Heavy tails of
 * continuous distributions are cut at the fence above.
 */
export function plotRange(def: DistributionDef, params: Params): PlotRange {
  const [sLo, sHi] = def.support(params);
  let qLo = quantile(def, params, 0.0005);
  let qHi = quantile(def, params, 0.9995);
  const anchor = def.plotAnchor?.(params);

  if (def.kind === 'continuous') {
    const q25 = quantile(def, params, 0.25);
    const q75 = quantile(def, params, 0.75);
    qLo = Math.max(qLo, q25 - TAIL_FENCE * (q75 - q25));
    qHi = Math.min(qHi, q75 + TAIL_FENCE * (q75 - q25));
  }

  if (def.kind === 'discrete') {
    let lo = Math.max(sLo, qLo - 1);
    let hi = Math.min(sHi, Math.max(qHi + 1, lo + 5));
    // Show the whole support when its end is close anyway.
    if (lo - sLo <= 0.15 * (hi - lo)) lo = sLo;
    if (sHi - hi <= 0.15 * (hi - lo)) hi = sHi;
    if (anchor) { lo = Math.min(lo, Math.ceil(anchor[0])); hi = Math.max(hi, Math.floor(anchor[1])); }
    return { xMin: lo - 0.75, xMax: hi + 0.75, lo, hi };
  }

  const span = qHi - qLo;
  let lo = Math.max(sLo, qLo - 0.04 * span);
  let hi = Math.min(sHi, qHi + 0.04 * span);
  if (lo - sLo <= 0.25 * span) lo = sLo;
  if (sHi - hi <= 0.25 * span) hi = sHi;
  if (anchor) { lo = Math.min(lo, anchor[0]); hi = Math.max(hi, anchor[1]); }
  return { xMin: lo, xMax: hi, lo, hi };
}

/**
 * Continuous: density histogram with `bins` bars across the plot range.
 * Discrete: relative frequency per integer. Samples outside the range are
 * dropped but still counted in the normalization.
 */
export function histogram(samples: Float64Array, def: DistributionDef, range: PlotRange, bins: number): HistogramData {
  const discrete = def.kind === 'discrete';
  const x0 = discrete ? range.lo - 0.5 : range.xMin;
  const nb = discrete ? Math.round(range.hi - range.lo) + 1 : bins;
  const binW = discrete ? 1 : (range.xMax - range.xMin) / nb;
  const values = new Float64Array(nb);
  for (let i = 0; i < samples.length; i++) {
    const b = Math.floor((samples[i] - x0) / binW);
    if (b >= 0 && b < nb) values[b]++;
  }
  const norm = samples.length * binW;
  for (let b = 0; b < nb; b++) values[b] /= norm;
  return { values, x0, binW };
}

export function sampleStats(samples: Float64Array): SampleStats {
  let mean = 0;
  for (const x of samples) mean += x;
  mean /= samples.length;
  let variance = 0;
  for (const x of samples) variance += (x - mean) ** 2;
  variance /= samples.length;
  return { mean, variance };
}

/** Number of entries <= x in an ascending array; divide by length for the empirical CDF. */
export function countAtMost(sorted: Float64Array, x: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] <= x) lo = mid + 1; else hi = mid;
  }
  return lo;
}

/**
 * Resolves the stored endpoints into the interval actually used. Unset endpoints
 * follow the quartiles; an endpoint at the edge of the plot means "unbounded",
 * which is how one-sided probabilities P(X <= b) and P(X >= a) are expressed.
 */
export function resolveInterval(
  def: DistributionDef, range: PlotRange, quantiles: QuantilePoint[], a: number | null, b: number | null,
): Interval {
  const quartile = (p: number) => quantiles.find(point => point.probability === p)?.value ?? 0;
  let lo = a ?? quartile(0.25);
  let hi = b ?? quartile(0.75);
  if (def.kind === 'discrete') { lo = Math.round(lo); hi = Math.round(hi); }
  if (lo > hi) [lo, hi] = [hi, lo];
  return {
    a: lo <= range.lo ? Number.NEGATIVE_INFINITY : lo,
    b: hi >= range.hi ? Number.POSITIVE_INFINITY : hi,
  };
}

/** P(a <= X <= b). For discrete distributions both integer endpoints are included. */
export function intervalProbability(def: DistributionDef, params: Params, { a, b }: Interval): number {
  const lower = def.kind === 'discrete' ? a - 1 : a;
  return Math.max(0, cdfAt(def, params, b) - cdfAt(def, params, lower));
}

export function sampleIntervalProportion(samples: Float64Array, { a, b }: Interval): number {
  let inside = 0;
  for (let i = 0; i < samples.length; i++) if (samples[i] >= a && samples[i] <= b) inside++;
  return inside / samples.length;
}

/** Rounds a raw step up to 1, 2 or 5 times a power of ten. */
export function niceStep(raw: number): number {
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}

/** Prints with `digits` decimals, or with more (up to 6) when the value needs them. */
export function formatValue(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  return Number(fixed) === value ? fixed : String(Number(value.toFixed(6)));
}

/** Decimal places needed to print multiples of `step`. */
export function stepDigits(step: number): number {
  return Math.max(0, Math.min(6, -Math.floor(Math.log10(step) + 1e-9)));
}
