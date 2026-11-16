import type { DistributionDef } from '../types';

export const exponential: DistributionDef = {
  id: 'exponential',
  name: '指数分布',
  kind: 'continuous',
  params: [
    { key: 'lambda', label: 'レート λ', sublabel: 'rate', min: 0.1, max: 5, step: 0.1, init: 1, digits: 1 },
  ],
  formula: String.raw`\mathrm{Exp}(X = x;\, \lambda) = \lambda e^{-\lambda x} \quad (x \ge 0)`,
  moments: String.raw`E[X] = \frac{1}{\lambda},\quad \mathrm{Var}[X] = \frac{1}{\lambda^2}`,
  note: '無記憶性 P(X > s + t | X > s) = P(X > t) をもつ唯一の連続分布です。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { lambda }) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x)),
  cdf: (x, { lambda }) => (x <= 0 ? 0 : 1 - Math.exp(-lambda * x)),
  // Inversion; 1 - U lies in (0, 1], so the logarithm stays finite.
  sampler: ({ lambda }) => rng => -Math.log(1 - rng()) / lambda,
  mean: ({ lambda }) => 1 / lambda,
  variance: ({ lambda }) => 1 / (lambda * lambda),
  plotAnchor: () => [0, 0],
};
