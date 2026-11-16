import type { DistributionDef } from '../types';

export const pareto: DistributionDef = {
  id: 'pareto',
  name: 'Pareto 分布',
  kind: 'continuous',
  params: [
    { key: 'xm', label: '最小値 xₘ', sublabel: 'scale', min: 0.5, max: 5, step: 0.1, init: 1, digits: 1 },
    { key: 'alpha', label: '形状 α', sublabel: 'shape (tail index)', min: 1, max: 10, step: 0.1, init: 3, digits: 1 },
  ],
  formula: String.raw`\mathrm{Pareto}(X = x;\, x_m, \alpha) = \frac{\alpha\, x_m^{\alpha}}{x^{\alpha+1}} \quad (x \ge x_m)`,
  moments: String.raw`E[X] = \frac{\alpha x_m}{\alpha-1} \ (\alpha > 1),\quad \mathrm{Var}[X] = \frac{\alpha x_m^2}{(\alpha-1)^2 (\alpha-2)} \ (\alpha > 2)`,
  note: 'α が小さいほど裾が重く、α ≤ 2 で分散が、α ≤ 1 で平均が無限大になります。図は裾を切って表示しています。',
  support: ({ xm }) => [xm, Number.POSITIVE_INFINITY],
  pdf: (x, { xm, alpha }) => (x < xm ? 0 : (alpha / x) * Math.pow(xm / x, alpha)),
  cdf: (x, { xm, alpha }) => (x <= xm ? 0 : 1 - Math.pow(xm / x, alpha)),
  // Inversion; 1 - U lies in (0, 1], so the power stays finite.
  sampler: ({ xm, alpha }) => rng => xm * Math.pow(1 - rng(), -1 / alpha),
  mean: ({ xm, alpha }) => (alpha > 1 ? (alpha * xm) / (alpha - 1) : Number.POSITIVE_INFINITY),
  variance: ({ xm, alpha }) => {
    if (alpha <= 1) return null;
    if (alpha <= 2) return Number.POSITIVE_INFINITY;
    return (alpha * xm * xm) / ((alpha - 1) ** 2 * (alpha - 2));
  },
  // The axis starts at the origin, so that the jump at xₘ is visible.
  plotAnchor: () => [0, 0],
};
