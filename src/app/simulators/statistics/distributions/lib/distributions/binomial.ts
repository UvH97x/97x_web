import { binomialSampler } from '../random';
import { logGamma, normalCdf, normalPdf } from '../special';
import type { DistributionDef } from '../types';

function pmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n || !Number.isInteger(k)) return 0;
  return Math.exp(
    logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log(1 - p),
  );
}

export const binomial: DistributionDef = {
  id: 'binomial',
  name: '二項分布',
  kind: 'discrete',
  params: [
    { key: 'n', label: '試行回数 n', sublabel: 'trials', min: 1, max: 200, step: 1, init: 20, digits: 0 },
    { key: 'p', label: '成功確率 p', sublabel: 'success prob.', min: 0.01, max: 0.99, step: 0.01, init: 0.3, digits: 2 },
  ],
  formula: String.raw`\mathrm{Bin}(X = k;\, n, p) = \binom{n}{k} p^k (1-p)^{n-k} \quad (k = 0, 1, \dots, n)`,
  moments: String.raw`E[X] = np,\quad \mathrm{Var}[X] = np(1-p)`,
  note: 'n が大きく p が極端でないとき、正規近似がよく合います。',
  support: ({ n }) => [0, n],
  pdf: (x, { n, p }) => pmf(x, n, p),
  cdf: (x, { n, p }) => {
    if (x < 0) return 0;
    if (x >= n) return 1;
    let sum = 0;
    for (let k = 0; k <= Math.floor(x); k++) sum += pmf(k, n, p);
    return Math.min(1, sum);
  },
  sampler: ({ n, p }) => binomialSampler(n, p),
  mean: ({ n, p }) => n * p,
  variance: ({ n, p }) => n * p * (1 - p),
  reference: {
    label: '正規近似 N(np, np(1−p))',
    pdf: (x, { n, p }) => {
      const sd = Math.sqrt(n * p * (1 - p));
      return normalPdf((x - n * p) / sd) / sd;
    },
    cdf: (x, { n, p }) => normalCdf((x - n * p) / Math.sqrt(n * p * (1 - p))),
  },
};
