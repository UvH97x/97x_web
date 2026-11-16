import type { DistributionDef } from '../types';

// Counts the failures before the first success (support from 0), which makes it
// the r = 1 case of the negative binomial distribution defined alongside.
export const geometric: DistributionDef = {
  id: 'geometric',
  name: '幾何分布',
  kind: 'discrete',
  params: [
    { key: 'p', label: '成功確率 p', sublabel: 'success prob.', min: 0.05, max: 0.99, step: 0.01, init: 0.3, digits: 2 },
  ],
  formula: String.raw`\mathrm{Geom}(X = k;\, p) = (1-p)^k\, p \quad (k = 0, 1, 2, \dots)`,
  moments: String.raw`E[X] = \frac{1-p}{p},\quad \mathrm{Var}[X] = \frac{1-p}{p^2}`,
  note: '初めて成功するまでの失敗回数です（試行回数で数える定義では k が 1 ずれます）。無記憶性をもつ唯一の離散分布です。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { p }) => (x < 0 || !Number.isInteger(x) ? 0 : Math.pow(1 - p, x) * p),
  cdf: (x, { p }) => (x < 0 ? 0 : 1 - Math.pow(1 - p, Math.floor(x) + 1)),
  // Inversion; 1 - U lies in (0, 1], so the logarithm stays finite.
  sampler: ({ p }) => {
    const logQ = Math.log(1 - p);
    return rng => Math.floor(Math.log(1 - rng()) / logQ);
  },
  mean: ({ p }) => (1 - p) / p,
  variance: ({ p }) => (1 - p) / (p * p),
};
