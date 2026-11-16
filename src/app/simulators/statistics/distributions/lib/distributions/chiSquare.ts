import { gammaSample, poissonSampler } from '../random';
import { logGamma, regularizedGammaP } from '../special';
import type { DistributionDef } from '../types';

function centralPdf(x: number, df: number): number {
  if (x < 0) return 0;
  if (x === 0) {
    if (df < 2) return Number.POSITIVE_INFINITY;
    if (df === 2) return 0.5;
    return 0;
  }
  const a = df / 2;
  return Math.exp((a - 1) * Math.log(x) - x / 2 - a * Math.log(2) - logGamma(a));
}

function centralCdf(x: number, df: number): number {
  return x <= 0 ? 0 : regularizedGammaP(df / 2, x / 2);
}

/** Σ_k Poisson(k; λ/2) · term(ν + 2k): the Poisson-mixture form of the noncentral law. */
function poissonMixture(lambda: number, term: (k: number) => number): number {
  const mu = lambda / 2;
  let weight = Math.exp(-mu);
  let sum = 0;
  for (let k = 0; k < 512; k++) {
    sum += weight * term(k);
    weight *= mu / (k + 1);
    if (k > mu && weight < 1e-14) break;
  }
  return sum;
}

function noncentralPdf(x: number, df: number, lambda: number): number {
  if (lambda === 0) return centralPdf(x, df);
  if (x < 0) return 0;
  if (x === 0) {
    const base = centralPdf(0, df);
    return Number.isFinite(base) ? Math.exp(-lambda / 2) * base : base;
  }
  return poissonMixture(lambda, k => centralPdf(x, df + 2 * k));
}

function noncentralCdf(x: number, df: number, lambda: number): number {
  if (x <= 0) return 0;
  if (lambda === 0) return centralCdf(x, df);
  return Math.max(0, Math.min(1, poissonMixture(lambda, k => centralCdf(x, df + 2 * k))));
}

export const chiSquare: DistributionDef = {
  id: 'chi-square',
  name: '（非心）χ² 分布',
  kind: 'continuous',
  params: [
    { key: 'df', label: '自由度 ν', sublabel: 'degrees of freedom', min: 1, max: 50, step: 1, init: 5, digits: 0 },
    { key: 'lambda', label: '非心度 λ', sublabel: 'noncentrality', min: 0, max: 50, step: 0.5, init: 4, digits: 1 },
  ],
  formula: String.raw`\chi^2(X = x;\, \nu, \lambda) = \sum_{k=0}^{\infty} \frac{e^{-\lambda/2} (\lambda/2)^k}{k!} \cdot \frac{x^{\nu/2+k-1} e^{-x/2}}{2^{\nu/2+k}\, \Gamma(\nu/2+k)} \quad (x > 0)`,
  moments: String.raw`E[X] = \nu + \lambda,\quad \mathrm{Var}[X] = 2(\nu + 2\lambda)`,
  note: 'λ = 0 にすると通常の中心 χ² 分布になり、比較曲線と一致します。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { df, lambda }) => noncentralPdf(x, df, lambda),
  cdf: (x, { df, lambda }) => noncentralCdf(x, df, lambda),
  // X ~ chi-square(df + 2K), K ~ Poisson(lambda / 2).
  sampler: ({ df, lambda }) => {
    const poisson = poissonSampler(lambda / 2);
    return rng => 2 * gammaSample(df / 2 + poisson(rng), rng);
  },
  mean: ({ df, lambda }) => df + lambda,
  variance: ({ df, lambda }) => 2 * (df + 2 * lambda),
  // The axis always starts at the origin; only the upper end follows the parameters.
  plotAnchor: () => [0, 0],
  reference: {
    label: '中心 χ²(ν)（λ = 0）',
    pdf: (x, { df }) => centralPdf(x, df),
    cdf: (x, { df }) => centralCdf(x, df),
  },
};
