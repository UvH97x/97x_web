import { standardNormal } from '../random';
import { normalCdf, normalPdf } from '../special';
import type { DistributionDef } from '../types';

export const logNormal: DistributionDef = {
  id: 'log-normal',
  name: '対数正規分布',
  kind: 'continuous',
  // σ is capped at 1: beyond that the upper tail stretches the axis until the mode is a sliver.
  params: [
    { key: 'mu', label: '対数平均 μ', sublabel: 'mean of ln X', min: -1, max: 2, step: 0.1, init: 0, digits: 1 },
    { key: 'sigma', label: '対数標準偏差 σ', sublabel: 'std. dev. of ln X', min: 0.1, max: 1, step: 0.05, init: 0.5, digits: 2 },
  ],
  formula: String.raw`\mathrm{LogN}(X = x;\, \mu, \sigma^2) = \frac{1}{\sqrt{2\pi}\,\sigma x} \exp\!\left(-\frac{(\ln x-\mu)^2}{2\sigma^2}\right) \quad (x > 0)`,
  moments: String.raw`E[X] = e^{\mu + \sigma^2/2},\quad \mathrm{Var}[X] = \left(e^{\sigma^2} - 1\right) e^{2\mu + \sigma^2}`,
  note: 'ln X が正規分布 N(μ, σ²) に従います。μ, σ は X 自身の平均・標準偏差ではありません。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { mu, sigma }) => (x <= 0 ? 0 : normalPdf((Math.log(x) - mu) / sigma) / (sigma * x)),
  cdf: (x, { mu, sigma }) => (x <= 0 ? 0 : normalCdf((Math.log(x) - mu) / sigma)),
  sampler: ({ mu, sigma }) => rng => Math.exp(mu + sigma * standardNormal(rng)),
  mean: ({ mu, sigma }) => Math.exp(mu + (sigma * sigma) / 2),
  variance: ({ mu, sigma }) => Math.expm1(sigma * sigma) * Math.exp(2 * mu + sigma * sigma),
  plotAnchor: () => [0, 0],
};
