import { gammaSample } from '../random';
import { logGamma, normalCdf, normalPdf, regularizedGammaP } from '../special';
import type { DistributionDef } from '../types';

export const gamma: DistributionDef = {
  id: 'gamma',
  name: 'Gamma 分布',
  kind: 'continuous',
  params: [
    { key: 'k', label: '形状 k', sublabel: 'shape', min: 0.5, max: 20, step: 0.1, init: 2, digits: 1 },
    { key: 'theta', label: '尺度 θ', sublabel: 'scale', min: 0.1, max: 5, step: 0.1, init: 1, digits: 1 },
  ],
  formula: String.raw`\mathrm{Gamma}(X = x;\, k, \theta) = \frac{x^{k-1} e^{-x/\theta}}{\Gamma(k)\, \theta^k} \quad (x > 0)`,
  moments: String.raw`E[X] = k\theta,\quad \mathrm{Var}[X] = k\theta^2`,
  note: 'k = 1 で指数分布、k = ν/2, θ = 2 で χ² 分布に一致します。k が大きいほど正規近似に近づきます。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { k, theta }) => {
    if (x < 0) return 0;
    if (x === 0) {
      if (k < 1) return Number.POSITIVE_INFINITY;
      return k === 1 ? 1 / theta : 0;
    }
    return Math.exp((k - 1) * Math.log(x) - x / theta - k * Math.log(theta) - logGamma(k));
  },
  cdf: (x, { k, theta }) => (x <= 0 ? 0 : regularizedGammaP(k, x / theta)),
  sampler: ({ k, theta }) => rng => theta * gammaSample(k, rng),
  mean: ({ k, theta }) => k * theta,
  variance: ({ k, theta }) => k * theta * theta,
  plotAnchor: () => [0, 0],
  reference: {
    label: '正規近似 N(kθ, kθ²)',
    pdf: (x, { k, theta }) => {
      const sd = Math.sqrt(k) * theta;
      return normalPdf((x - k * theta) / sd) / sd;
    },
    cdf: (x, { k, theta }) => normalCdf((x - k * theta) / (Math.sqrt(k) * theta)),
  },
};
