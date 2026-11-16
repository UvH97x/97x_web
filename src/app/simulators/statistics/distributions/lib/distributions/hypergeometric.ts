import { logGamma } from '../special';
import type { DistributionDef, Params } from '../types';
import { binomialCdf, binomialPmf } from './binomial';

const logChoose = (n: number, k: number) => logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);

/** Smallest and largest possible number of successes among the draws. */
function bounds({ total, success, draws }: Params): [number, number] {
  return [Math.max(0, draws + success - total), Math.min(draws, success)];
}

function pmf(k: number, params: Params): number {
  const [lo, hi] = bounds(params);
  if (k < lo || k > hi || !Number.isInteger(k)) return 0;
  const { total, success, draws } = params;
  return Math.exp(logChoose(success, k) + logChoose(total - success, draws - k) - logChoose(total, draws));
}

/** Mass function over the whole support, by the recurrence f(k + 1) / f(k) from its lower end. */
function masses(params: Params): { lo: number; values: Float64Array } {
  const [lo, hi] = bounds(params);
  const { total, success, draws } = params;
  const values = new Float64Array(hi - lo + 1);
  values[0] = pmf(lo, params);
  for (let k = lo; k < hi; k++) {
    values[k - lo + 1] = values[k - lo] * ((success - k) * (draws - k)) / ((k + 1) * (total - success - draws + k + 1));
  }
  return { lo, values };
}

// URL keys are spelled out: N and n would differ by case only.
export const hypergeometric: DistributionDef = {
  id: 'hypergeometric',
  name: '超幾何分布',
  kind: 'discrete',
  params: [
    { key: 'total', label: '母集団の大きさ N', sublabel: 'population size', min: 1, max: 500, step: 1, init: 50, digits: 0 },
    { key: 'success', label: '当たりの数 K', sublabel: 'successes in population', min: 0, max: ({ total }) => total, step: 1, init: 20, digits: 0 },
    { key: 'draws', label: '抽出数 n', sublabel: 'draws', min: 1, max: ({ total }) => total, step: 1, init: 10, digits: 0 },
  ],
  formula: String.raw`\mathrm{HG}(X = k;\, N, K, n) = \frac{\binom{K}{k} \binom{N-K}{n-k}}{\binom{N}{n}} \quad (\max(0,\, n+K-N) \le k \le \min(n, K))`,
  moments: String.raw`E[X] = \frac{nK}{N},\quad \mathrm{Var}[X] = \frac{nK}{N} \cdot \frac{N-K}{N} \cdot \frac{N-n}{N-1}`,
  note: 'N 個中 K 個が当たりの母集団から、n 個を戻さずに抽出したときの当たりの数です。戻して抽出すると二項分布になり、N が n に比べて大きいほど両者は近づきます。',
  support: params => bounds(params),
  pdf: (x, params) => pmf(x, params),
  cdf: (x, params) => {
    const { lo, values } = masses(params);
    if (x < lo) return 0;
    const last = Math.min(Math.floor(x) - lo, values.length - 1);
    if (last === values.length - 1) return 1;
    let sum = 0;
    for (let i = 0; i <= last; i++) sum += values[i];
    return Math.min(1, sum);
  },
  // Inversion by binary search in the tabulated CDF.
  sampler: params => {
    const { lo, values } = masses(params);
    const cumulative = new Float64Array(values.length);
    let sum = 0;
    for (let i = 0; i < values.length; i++) { sum += values[i]; cumulative[i] = sum; }
    const last = values.length - 1;
    return rng => {
      const u = rng();
      let low = 0;
      let high = last;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (cumulative[mid] > u) high = mid; else low = mid + 1;
      }
      return lo + low;
    };
  },
  mean: ({ total, success, draws }) => (draws * success) / total,
  variance: ({ total, success, draws }) => (total === 1 ? 0
    : (draws * success * (total - success) * (total - draws)) / (total * total * (total - 1))),
  reference: {
    label: '二項分布 Bin(n, K/N)（復元抽出）',
    kind: 'discrete',
    pdf: (x, { total, success, draws }) => binomialPmf(x, draws, success / total),
    cdf: (x, { total, success, draws }) => binomialCdf(x, draws, success / total),
  },
};
