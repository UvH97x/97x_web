import type { DistributionDef } from '../types';

// Parametrized by the lower end and the width rather than by both ends:
// parameter ranges are static, so a < b could not be enforced between two sliders.
export const uniform: DistributionDef = {
  id: 'uniform',
  name: '一様分布',
  kind: 'continuous',
  params: [
    { key: 'a', label: '下端 a', sublabel: 'lower end', min: -10, max: 10, step: 0.1, init: 0, digits: 1 },
    { key: 'w', label: '幅 w', sublabel: 'width (b − a)', min: 0.1, max: 20, step: 0.1, init: 1, digits: 1 },
  ],
  formula: String.raw`U(X = x;\, a, b) = \frac{1}{b-a} \quad (a \le x \le b),\qquad b = a + w`,
  moments: String.raw`E[X] = \frac{a+b}{2},\quad \mathrm{Var}[X] = \frac{(b-a)^2}{12}`,
  note: '上端は b = a + w です。',
  support: ({ a, w }) => [a, a + w],
  pdf: (x, { a, w }) => (x < a || x > a + w ? 0 : 1 / w),
  cdf: (x, { a, w }) => Math.max(0, Math.min(1, (x - a) / w)),
  sampler: ({ a, w }) => rng => a + w * rng(),
  mean: ({ a, w }) => a + w / 2,
  variance: ({ w }) => (w * w) / 12,
  // A margin on both sides, so that the jumps at the ends of the support are visible.
  plotAnchor: ({ a, w }) => [a - w / 4, a + (5 * w) / 4],
};
