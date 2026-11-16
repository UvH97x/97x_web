import type { DistributionDef } from '../types';

// Parametrized by the smallest value and the number of values rather than by both
// ends: parameter ranges are static, so a <= b could not be enforced between two sliders.
export const discreteUniform: DistributionDef = {
  id: 'discrete-uniform',
  name: '離散一様分布',
  kind: 'discrete',
  params: [
    { key: 'a', label: '最小値 a', sublabel: 'smallest value', min: -10, max: 10, step: 1, init: 1, digits: 0 },
    { key: 'n', label: '値の個数 n', sublabel: 'number of values', min: 2, max: 50, step: 1, init: 6, digits: 0 },
  ],
  formula: String.raw`\mathrm{DU}(X = k;\, a, n) = \frac{1}{n} \quad (k = a, a+1, \dots, a+n-1)`,
  moments: String.raw`E[X] = a + \frac{n-1}{2},\quad \mathrm{Var}[X] = \frac{n^2-1}{12}`,
  note: '初期値 a = 1, n = 6 はサイコロの出目です。',
  support: ({ a, n }) => [a, a + n - 1],
  pdf: (x, { a, n }) => (x < a || x > a + n - 1 || !Number.isInteger(x) ? 0 : 1 / n),
  cdf: (x, { a, n }) => Math.max(0, Math.min(1, (Math.floor(x) - a + 1) / n)),
  sampler: ({ a, n }) => rng => a + Math.floor(rng() * n),
  mean: ({ a, n }) => a + (n - 1) / 2,
  variance: ({ n }) => (n * n - 1) / 12,
};
