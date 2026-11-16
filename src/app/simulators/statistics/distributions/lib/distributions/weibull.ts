import { logGamma } from '../special';
import type { DistributionDef } from '../types';

/** Γ(1 + m / k): the m-th raw moment of the standard Weibull. */
const moment = (m: number, k: number) => Math.exp(logGamma(1 + m / k));

export const weibull: DistributionDef = {
  id: 'weibull',
  name: 'Weibull 分布',
  kind: 'continuous',
  params: [
    { key: 'k', label: '形状 k', sublabel: 'shape', min: 0.5, max: 10, step: 0.1, init: 1.5, digits: 1 },
    { key: 'lambda', label: '尺度 λ', sublabel: 'scale', min: 0.1, max: 5, step: 0.1, init: 1, digits: 1 },
  ],
  formula: String.raw`\mathrm{Weibull}(X = x;\, k, \lambda) = \frac{k}{\lambda} \left(\frac{x}{\lambda}\right)^{k-1} e^{-(x/\lambda)^k} \quad (x \ge 0)`,
  moments: String.raw`E[X] = \lambda\, \Gamma\!\left(1 + \tfrac{1}{k}\right),\quad \mathrm{Var}[X] = \lambda^2 \left[\Gamma\!\left(1 + \tfrac{2}{k}\right) - \Gamma\!\left(1 + \tfrac{1}{k}\right)^2\right]`,
  note: 'k = 1 で指数分布に一致します。k < 1 では故障率が減少、k > 1 では増加します。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { k, lambda }) => {
    if (x < 0) return 0;
    if (x === 0) {
      if (k < 1) return Number.POSITIVE_INFINITY;
      return k === 1 ? 1 / lambda : 0;
    }
    const z = x / lambda;
    return (k / lambda) * Math.pow(z, k - 1) * Math.exp(-Math.pow(z, k));
  },
  cdf: (x, { k, lambda }) => (x <= 0 ? 0 : 1 - Math.exp(-Math.pow(x / lambda, k))),
  // Inversion; 1 - U lies in (0, 1], so the logarithm stays finite.
  sampler: ({ k, lambda }) => rng => lambda * Math.pow(-Math.log(1 - rng()), 1 / k),
  mean: ({ k, lambda }) => lambda * moment(1, k),
  variance: ({ k, lambda }) => lambda * lambda * (moment(2, k) - moment(1, k) ** 2),
  plotAnchor: () => [0, 0],
};
