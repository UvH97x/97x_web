import { gammaSample, poissonSampler } from '../random';
import { logGamma, normalCdf, normalPdf } from '../special';
import type { DistributionDef } from '../types';

const mean = (r: number, p: number) => (r * (1 - p)) / p;
const sd = (r: number, p: number) => Math.sqrt(r * (1 - p)) / p;

// Counts the failures before the r-th success. Written with the gamma function,
// so r need not be an integer.
export const negativeBinomial: DistributionDef = {
  id: 'negative-binomial',
  name: '負の二項分布',
  kind: 'discrete',
  params: [
    { key: 'r', label: '成功回数 r', sublabel: 'successes', min: 0.5, max: 30, step: 0.5, init: 5, digits: 1 },
    { key: 'p', label: '成功確率 p', sublabel: 'success prob.', min: 0.1, max: 0.95, step: 0.01, init: 0.4, digits: 2 },
  ],
  formula: String.raw`\mathrm{NB}(X = k;\, r, p) = \frac{\Gamma(k+r)}{k!\, \Gamma(r)}\, p^r (1-p)^k \quad (k = 0, 1, 2, \dots)`,
  moments: String.raw`E[X] = \frac{r(1-p)}{p},\quad \mathrm{Var}[X] = \frac{r(1-p)}{p^2}`,
  note: 'r 回成功するまでの失敗回数です。r = 1 で幾何分布に一致し、r は整数でなくても定義できます。',
  support: () => [0, Number.POSITIVE_INFINITY],
  pdf: (x, { r, p }) => {
    if (x < 0 || !Number.isInteger(x)) return 0;
    return Math.exp(logGamma(x + r) - logGamma(x + 1) - logGamma(r) + r * Math.log(p) + x * Math.log(1 - p));
  },
  // Sums the mass function through the recurrence f(k + 1) = f(k) · (k + r) / (k + 1) · (1 - p).
  cdf: (x, { r, p }) => {
    if (x < 0) return 0;
    const n = Math.floor(x);
    let term = Math.pow(p, r);
    let sum = term;
    for (let k = 0; k < n; k++) {
      term *= ((k + r) / (k + 1)) * (1 - p);
      sum += term;
    }
    return Math.min(1, sum);
  },
  // Gamma–Poisson mixture: X ~ Poisson(Λ), Λ ~ Gamma(r, (1 - p) / p).
  sampler: ({ r, p }) => {
    const scale = (1 - p) / p;
    return rng => poissonSampler(scale * gammaSample(r, rng))(rng);
  },
  mean: ({ r, p }) => mean(r, p),
  variance: ({ r, p }) => sd(r, p) ** 2,
  reference: {
    label: '正規近似 N(r(1−p)/p, r(1−p)/p²)',
    pdf: (x, { r, p }) => normalPdf((x - mean(r, p)) / sd(r, p)) / sd(r, p),
    cdf: (x, { r, p }) => normalCdf((x - mean(r, p)) / sd(r, p)),
  },
};
