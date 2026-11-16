import { gammaSample } from '../random';
import { logBeta, regularizedBeta } from '../special';
import type { DistributionDef } from '../types';

/** Density at an end of the support, where the exponent `shape - 1` decides the limit. */
function edgeDensity(shape: number, other: number): number {
  if (shape < 1) return Number.POSITIVE_INFINITY;
  return shape === 1 ? other : 0;
}

export const beta: DistributionDef = {
  id: 'beta',
  name: 'Beta 分布',
  kind: 'continuous',
  params: [
    { key: 'alpha', label: '形状 α', sublabel: 'shape', min: 0.5, max: 20, step: 0.1, init: 2, digits: 1 },
    { key: 'beta', label: '形状 β', sublabel: 'shape', min: 0.5, max: 20, step: 0.1, init: 5, digits: 1 },
  ],
  formula: String.raw`\mathrm{Beta}(X = x;\, \alpha, \beta) = \frac{x^{\alpha-1} (1-x)^{\beta-1}}{B(\alpha, \beta)} \quad (0 < x < 1)`,
  moments: String.raw`E[X] = \frac{\alpha}{\alpha+\beta},\quad \mathrm{Var}[X] = \frac{\alpha\beta}{(\alpha+\beta)^2 (\alpha+\beta+1)}`,
  note: 'α = β = 1 で一様分布 U(0, 1) に一致します。α, β < 1 では両端で密度が発散し、U 字形になります。',
  support: () => [0, 1],
  pdf: (x, { alpha, beta: b }) => {
    if (x < 0 || x > 1) return 0;
    if (x === 0) return edgeDensity(alpha, b);
    if (x === 1) return edgeDensity(b, alpha);
    return Math.exp((alpha - 1) * Math.log(x) + (b - 1) * Math.log1p(-x) - logBeta(alpha, b));
  },
  cdf: (x, { alpha, beta: b }) => regularizedBeta(x, alpha, b),
  // X = G_α / (G_α + G_β) for independent gamma variates.
  sampler: ({ alpha, beta: b }) => rng => {
    const g = gammaSample(alpha, rng);
    return g / (g + gammaSample(b, rng));
  },
  mean: ({ alpha, beta: b }) => alpha / (alpha + b),
  variance: ({ alpha, beta: b }) => (alpha * b) / ((alpha + b) ** 2 * (alpha + b + 1)),
  // The whole unit interval stays in view: the parameters move the curve, not the axis.
  plotAnchor: () => [0, 1],
};
