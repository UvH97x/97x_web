import { gammaSample } from '../random';
import { logBeta, regularizedBeta } from '../special';
import type { DistributionDef } from '../types';

export const fisherF: DistributionDef = {
  id: 'f',
  name: 'F 分布',
  kind: 'continuous',
  params: [
    { key: 'd1', label: '分子の自由度 d₁', sublabel: 'numerator d.f.', min: 1, max: 50, step: 1, init: 5, digits: 0 },
    { key: 'd2', label: '分母の自由度 d₂', sublabel: 'denominator d.f.', min: 1, max: 100, step: 1, init: 10, digits: 0 },
  ],
  formula: String.raw`F(X = x;\, d_1, d_2) = \frac{1}{x\, B\!\left(\frac{d_1}{2}, \frac{d_2}{2}\right)} \sqrt{\frac{(d_1 x)^{d_1}\, d_2^{\,d_2}}{(d_1 x + d_2)^{d_1+d_2}}} \quad (x > 0)`,
  moments: String.raw`E[X] = \frac{d_2}{d_2-2} \ (d_2 > 2),\quad \mathrm{Var}[X] = \frac{2 d_2^2 (d_1+d_2-2)}{d_1 (d_2-2)^2 (d_2-4)} \ (d_2 > 4)`,
  note: '独立な χ² 変数をそれぞれの自由度で割った比 (U₁/d₁) / (U₂/d₂) の分布です。t(ν) に従う変数の 2 乗は F(1, ν) に従います。d₂ ≤ 4 で分散が、d₂ ≤ 2 で平均が無限大になります。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { d1, d2 }) => {
    if (x < 0) return 0;
    if (x === 0) {
      if (d1 < 2) return Number.POSITIVE_INFINITY;
      return d1 === 2 ? 1 : 0;
    }
    return Math.exp(
      0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2))
      - Math.log(x) - logBeta(d1 / 2, d2 / 2),
    );
  },
  cdf: (x, { d1, d2 }) => (x <= 0 ? 0 : regularizedBeta((d1 * x) / (d1 * x + d2), d1 / 2, d2 / 2)),
  // Ratio of chi-square variates over their degrees of freedom; the factors of 2 cancel.
  sampler: ({ d1, d2 }) => rng => (gammaSample(d1 / 2, rng) / d1) / (gammaSample(d2 / 2, rng) / d2),
  mean: ({ d2 }) => (d2 > 2 ? d2 / (d2 - 2) : Number.POSITIVE_INFINITY),
  variance: ({ d1, d2 }) => {
    if (d2 <= 2) return null;
    if (d2 <= 4) return Number.POSITIVE_INFINITY;
    return (2 * d2 * d2 * (d1 + d2 - 2)) / (d1 * (d2 - 2) ** 2 * (d2 - 4));
  },
  plotAnchor: () => [0, 0],
};
