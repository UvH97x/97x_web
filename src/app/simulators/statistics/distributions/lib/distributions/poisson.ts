import { poissonSampler } from '../random';
import { logGamma, normalCdf, normalPdf, regularizedGammaP } from '../special';
import type { DistributionDef } from '../types';

export const poisson: DistributionDef = {
  id: 'poisson',
  name: 'Poisson 分布',
  kind: 'discrete',
  params: [
    { key: 'lambda', label: '強度 λ', sublabel: 'rate', min: 0.1, max: 100, step: 0.1, init: 4, digits: 1 },
  ],
  formula: String.raw`\mathrm{Po}(X = k;\, \lambda) = \frac{\lambda^k e^{-\lambda}}{k!} \quad (k = 0, 1, 2, \dots)`,
  moments: String.raw`E[X] = \lambda,\quad \mathrm{Var}[X] = \lambda`,
  note: 'λ が大きくなるほど正規近似に近づきます。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { lambda }) => {
    if (x < 0 || !Number.isInteger(x)) return 0;
    return Math.exp(x * Math.log(lambda) - lambda - logGamma(x + 1));
  },
  // P(X <= k) = Q(k + 1, λ) = 1 - P(k + 1, λ).
  cdf: (x, { lambda }) => (x < 0 ? 0 : 1 - regularizedGammaP(Math.floor(x) + 1, lambda)),
  sampler: ({ lambda }) => poissonSampler(lambda),
  mean: ({ lambda }) => lambda,
  variance: ({ lambda }) => lambda,
  reference: {
    label: '正規近似 N(λ, λ)',
    pdf: (x, { lambda }) => normalPdf((x - lambda) / Math.sqrt(lambda)) / Math.sqrt(lambda),
    cdf: (x, { lambda }) => normalCdf((x - lambda) / Math.sqrt(lambda)),
  },
};
