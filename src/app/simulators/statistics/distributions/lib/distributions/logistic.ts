import { normalCdf, normalPdf } from '../special';
import type { DistributionDef } from '../types';

/** Standard deviation of the logistic distribution with scale s. */
const sd = (s: number) => (s * Math.PI) / Math.sqrt(3);

export const logistic: DistributionDef = {
  id: 'logistic',
  name: 'ロジスティック分布',
  kind: 'continuous',
  params: [
    { key: 'mu', label: '位置 μ', sublabel: 'location', min: -10, max: 10, step: 0.1, init: 0, digits: 1 },
    { key: 's', label: '尺度 s', sublabel: 'scale', min: 0.1, max: 5, step: 0.1, init: 1, digits: 1 },
  ],
  formula: String.raw`\mathrm{Logistic}(X = x;\, \mu, s) = \frac{e^{-(x-\mu)/s}}{s \left(1 + e^{-(x-\mu)/s}\right)^2}`,
  moments: String.raw`E[X] = \mu,\quad \mathrm{Var}[X] = \frac{\pi^2 s^2}{3}`,
  note: '累積分布関数がシグモイド関数 1 / (1 + e^{−(x−μ)/s}) になります。',
  support: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  // The density is symmetric, so evaluate it on e^{-|z|} to avoid overflow.
  pdf: (x, { mu, s }) => {
    const e = Math.exp(-Math.abs(x - mu) / s);
    return e / (s * (1 + e) ** 2);
  },
  cdf: (x, { mu, s }) => 1 / (1 + Math.exp(-(x - mu) / s)),
  // Inversion (the logit); the clamp keeps the logarithm finite at U = 0.
  sampler: ({ mu, s }) => rng => {
    const u = Math.max(rng(), Number.EPSILON);
    return mu + s * Math.log(u / (1 - u));
  },
  mean: ({ mu }) => mu,
  variance: ({ s }) => sd(s) ** 2,
  // Keep the standard logistic's range in view: changing μ moves the curve, not the axis.
  plotAnchor: () => [-8, 8],
  reference: {
    label: '同分散の正規 N(μ, π²s²/3)',
    pdf: (x, { mu, s }) => normalPdf((x - mu) / sd(s)) / sd(s),
    cdf: (x, { mu, s }) => normalCdf((x - mu) / sd(s)),
  },
};
