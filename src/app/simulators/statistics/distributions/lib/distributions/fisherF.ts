import { gammaSample, poissonSampler } from '../random';
import { logBeta, regularizedBeta } from '../special';
import type { DistributionDef } from '../types';

function centralPdf(x: number, d1: number, d2: number): number {
  if (x < 0 || x === Number.POSITIVE_INFINITY) return 0;
  if (x === 0) {
    if (d1 < 2) return Number.POSITIVE_INFINITY;
    return d1 === 2 ? 1 : 0;
  }
  return Math.exp(
    0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2))
    - Math.log(x) - logBeta(d1 / 2, d2 / 2),
  );
}

function centralCdf(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  if (x === Number.POSITIVE_INFINITY) return 1;
  return regularizedBeta((d1 * x) / (d1 * x + d2), d1 / 2, d2 / 2);
}

// As in noncentral chi-square, K ~ Poisson(lambda / 2). The UI bounds lambda at 50.
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

function noncentralPdf(x: number, d1: number, d2: number, lambda: number): number {
  if (lambda === 0) return centralPdf(x, d1, d2);
  if (x < 0 || x === Number.POSITIVE_INFINITY) return 0;
  if (x === 0) return Math.exp(-lambda / 2) * centralPdf(0, d1, d2);
  // Conditional on K=k, X = (d1 + 2k)/d1 * F(d1 + 2k, d2).
  // Both the argument and the density need the inverse scale (Jacobian).
  return poissonMixture(lambda, k => {
    const scale = d1 / (d1 + 2 * k);
    return scale * centralPdf(scale * x, d1 + 2 * k, d2);
  });
}

function noncentralCdf(x: number, d1: number, d2: number, lambda: number): number {
  if (lambda === 0) return centralCdf(x, d1, d2);
  if (x <= 0) return 0;
  if (x === Number.POSITIVE_INFINITY) return 1;
  // The scale cancels in z; only the first beta shape changes with k.
  const z = (d1 * x) / (d1 * x + d2);
  return Math.max(0, Math.min(1, poissonMixture(lambda, k => regularizedBeta(z, d1 / 2 + k, d2 / 2))));
}

export const fisherF: DistributionDef = {
  id: 'f',
  name: '（非心）F 分布',
  kind: 'continuous',
  params: [
    { key: 'd1', label: '分子の自由度 d₁', sublabel: 'numerator d.f.', min: 1, max: 50, step: 1, init: 5, digits: 0 },
    { key: 'd2', label: '分母の自由度 d₂', sublabel: 'denominator d.f.', min: 1, max: 100, step: 1, init: 10, digits: 0 },
    { key: 'lambda', label: '非心度 λ', sublabel: 'noncentrality', min: 0, max: 50, step: 0.5, init: 0, digits: 1 },
  ],
  formula: String.raw`F(X = x;\, d_1,d_2,\lambda) = \frac{d_1d_2}{(d_1x+d_2)^2}\sum_{k=0}^{\infty}\frac{e^{-\lambda/2}(\lambda/2)^k}{k!}\frac{z^{d_1/2+k-1}(1-z)^{d_2/2-1}}{B(d_1/2+k,d_2/2)},\quad z=\frac{d_1x}{d_1x+d_2}\quad(x>0)`,
  moments: String.raw`E[X] = \frac{d_2(d_1+\lambda)}{d_1(d_2-2)}\ (d_2>2),\quad \mathrm{Var}[X] = \frac{2d_2^2\bigl[(d_1+\lambda)^2+(d_1+2\lambda)(d_2-2)\bigr]}{d_1^2(d_2-2)^2(d_2-4)}\ (d_2>4)`,
  note: '独立な U₁ ∼ 非心χ²(d₁, λ)、U₂ ∼ 中心χ²(d₂) の比 (U₁/d₁) / (U₂/d₂) の分布です。λ = 0 で通常の中心F分布になり、比較曲線と一致します。このとき t(ν) の2乗は F(1, ν) に従います。d₂ ≤ 4 で分散が、d₂ ≤ 2 で平均が無限大になります。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { d1, d2, lambda }) => noncentralPdf(x, d1, d2, lambda),
  cdf: (x, { d1, d2, lambda }) => noncentralCdf(x, d1, d2, lambda),
  // The numerator's chi-square degrees change with K, but its divisor stays d1.
  sampler: ({ d1, d2, lambda }) => {
    const poisson = poissonSampler(lambda / 2);
    return rng => (gammaSample(d1 / 2 + poisson(rng), rng) / d1) / (gammaSample(d2 / 2, rng) / d2);
  },
  mean: ({ d1, d2, lambda }) => (d2 > 2 ? (d2 * (d1 + lambda)) / (d1 * (d2 - 2)) : Number.POSITIVE_INFINITY),
  variance: ({ d1, d2, lambda }) => {
    if (d2 <= 2) return null;
    if (d2 <= 4) return Number.POSITIVE_INFINITY;
    return (2 * d2 * d2 * ((d1 + lambda) ** 2 + (d1 + 2 * lambda) * (d2 - 2)))
      / (d1 * d1 * (d2 - 2) ** 2 * (d2 - 4));
  },
  plotAnchor: () => [0, 0],
  reference: {
    label: '中心 F(d₁, d₂)（λ = 0）',
    pdf: (x, { d1, d2 }) => centralPdf(x, d1, d2),
    cdf: (x, { d1, d2 }) => centralCdf(x, d1, d2),
  },
};
