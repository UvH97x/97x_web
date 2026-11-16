import { standardNormal } from '../random';
import { normalCdf, normalPdf } from '../special';
import type { DistributionDef } from '../types';

export const normal: DistributionDef = {
  id: 'normal',
  name: '正規分布',
  kind: 'continuous',
  params: [
    { key: 'mu', label: '平均 μ', sublabel: 'mean', min: -10, max: 10, step: 0.1, init: 0, digits: 1 },
    { key: 'sigma', label: '標準偏差 σ', sublabel: 'std. dev.', min: 0.1, max: 5, step: 0.1, init: 1, digits: 1 },
  ],
  formula: String.raw`N(X = x;\, \mu, \sigma^2) = \frac{1}{\sqrt{2\pi}\,\sigma} \exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)`,
  moments: String.raw`E[X] = \mu,\quad \mathrm{Var}[X] = \sigma^2`,
  support: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  pdf: (x, { mu, sigma }) => normalPdf((x - mu) / sigma) / sigma,
  cdf: (x, { mu, sigma }) => normalCdf((x - mu) / sigma),
  sampler: ({ mu, sigma }) => rng => mu + sigma * standardNormal(rng),
  mean: ({ mu }) => mu,
  variance: ({ sigma }) => sigma * sigma,
  // Keep the standard normal's range in view: changing μ moves the curve, not the axis.
  plotAnchor: () => [-3.6, 3.6],
  reference: {
    label: '標準正規 N(0, 1)',
    pdf: x => normalPdf(x),
    cdf: x => normalCdf(x),
  },
};
