import { gammaSample, standardNormal } from '../random';
import { logGamma, normalCdf, normalPdf, regularizedBeta } from '../special';
import type { DistributionDef } from '../types';

export const studentT: DistributionDef = {
  id: 'student-t',
  name: 't 分布',
  kind: 'continuous',
  params: [
    { key: 'df', label: '自由度 ν', sublabel: 'degrees of freedom', min: 1, max: 50, step: 1, init: 5, digits: 0 },
  ],
  formula: String.raw`t(X = x;\, \nu) = \frac{\Gamma\!\left(\frac{\nu+1}{2}\right)}{\sqrt{\nu\pi}\, \Gamma\!\left(\frac{\nu}{2}\right)} \left(1 + \frac{x^2}{\nu}\right)^{-\frac{\nu+1}{2}}`,
  moments: String.raw`E[X] = 0 \ (\nu > 1),\quad \mathrm{Var}[X] = \frac{\nu}{\nu-2} \ (\nu > 2)`,
  note: '標準正規より裾が重く、ν → ∞ で標準正規に近づきます。ν = 1 は Cauchy 分布で平均が存在せず、ν = 2 では分散が無限大です。',
  support: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  pdf: (x, { df }) => Math.exp(
    logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log1p((x * x) / df),
  ),
  // P(|X| > |x|) = I_{ν / (ν + x²)}(ν/2, 1/2).
  cdf: (x, { df }) => {
    const tail = 0.5 * regularizedBeta(df / (df + x * x), df / 2, 0.5);
    return x < 0 ? tail : 1 - tail;
  },
  // X = Z / sqrt(V / ν), V ~ chi-square(ν) = 2·Gamma(ν/2).
  sampler: ({ df }) => rng => standardNormal(rng) / Math.sqrt((2 * gammaSample(df / 2, rng)) / df),
  mean: ({ df }) => (df > 1 ? 0 : null),
  variance: ({ df }) => (df > 2 ? df / (df - 2) : df > 1 ? Number.POSITIVE_INFINITY : null),
  reference: {
    label: '標準正規 N(0, 1)',
    pdf: x => normalPdf(x),
    cdf: x => normalCdf(x),
  },
};
