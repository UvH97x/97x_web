import type { DistributionDef } from '../types';

export const bernoulli: DistributionDef = {
  id: 'bernoulli',
  name: 'Bernoulli 分布',
  kind: 'discrete',
  params: [
    { key: 'p', label: '成功確率 p', sublabel: 'success prob.', min: 0.01, max: 0.99, step: 0.01, init: 0.3, digits: 2 },
  ],
  formula: String.raw`\mathrm{Bern}(X = k;\, p) = p^k (1-p)^{1-k} \quad (k = 0, 1)`,
  moments: String.raw`E[X] = p,\quad \mathrm{Var}[X] = p(1-p)`,
  note: '試行回数 n = 1 の二項分布です。',
  support: () => [0, 1],
  pdf: (x, { p }) => (x === 0 ? 1 - p : x === 1 ? p : 0),
  cdf: (x, { p }) => (x < 0 ? 0 : x < 1 ? 1 - p : 1),
  sampler: ({ p }) => rng => (rng() < p ? 1 : 0),
  mean: ({ p }) => p,
  variance: ({ p }) => p * (1 - p),
};
