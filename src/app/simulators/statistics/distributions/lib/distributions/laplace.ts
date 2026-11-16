import { normalCdf, normalPdf } from '../special';
import type { DistributionDef } from '../types';

export const laplace: DistributionDef = {
  id: 'laplace',
  name: 'Laplace 分布',
  kind: 'continuous',
  params: [
    { key: 'mu', label: '位置 μ', sublabel: 'location', min: -10, max: 10, step: 0.1, init: 0, digits: 1 },
    { key: 'b', label: '尺度 b', sublabel: 'scale', min: 0.1, max: 5, step: 0.1, init: 1, digits: 1 },
  ],
  formula: String.raw`\mathrm{Laplace}(X = x;\, \mu, b) = \frac{1}{2b} \exp\!\left(-\frac{|x-\mu|}{b}\right)`,
  moments: String.raw`E[X] = \mu,\quad \mathrm{Var}[X] = 2b^2`,
  note: '同じ分散の正規分布と比べて、中心が尖り裾が重くなります。',
  support: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  pdf: (x, { mu, b }) => Math.exp(-Math.abs(x - mu) / b) / (2 * b),
  cdf: (x, { mu, b }) => {
    const tail = 0.5 * Math.exp(-Math.abs(x - mu) / b);
    return x < mu ? tail : 1 - tail;
  },
  // Inversion on the two halves; the clamp keeps the logarithm finite at U = 0.
  sampler: ({ mu, b }) => rng => {
    const u = rng() - 0.5;
    const magnitude = -b * Math.log(Math.max(1 - 2 * Math.abs(u), Number.EPSILON));
    return u < 0 ? mu - magnitude : mu + magnitude;
  },
  mean: ({ mu }) => mu,
  variance: ({ b }) => 2 * b * b,
  // Keep the standard Laplace's range in view: changing μ moves the curve, not the axis.
  plotAnchor: () => [-7.5, 7.5],
  reference: {
    label: '同分散の正規 N(μ, 2b²)',
    pdf: (x, { mu, b }) => normalPdf((x - mu) / (Math.SQRT2 * b)) / (Math.SQRT2 * b),
    cdf: (x, { mu, b }) => normalCdf((x - mu) / (Math.SQRT2 * b)),
  },
};
