import { normalCdf, normalPdf } from '../special';
import type { DistributionDef } from '../types';

/** Upper quartile of the standard normal: N(x₀, (γ / this)²) shares the Cauchy's quartiles x₀ ± γ. */
const NORMAL_QUARTILE = 0.6744897501960817;

export const cauchy: DistributionDef = {
  id: 'cauchy',
  name: 'Cauchy 分布',
  kind: 'continuous',
  params: [
    { key: 'x0', label: '位置 x₀', sublabel: 'location', min: -10, max: 10, step: 0.1, init: 0, digits: 1 },
    { key: 'gamma', label: '尺度 γ', sublabel: 'scale', min: 0.1, max: 5, step: 0.1, init: 1, digits: 1 },
  ],
  formula: String.raw`\mathrm{Cauchy}(X = x;\, x_0, \gamma) = \frac{1}{\pi\gamma \left[1 + \left(\frac{x-x_0}{\gamma}\right)^2\right]}`,
  moments: String.raw`E[X],\ \mathrm{Var}[X] \text{ は存在しない}\quad (\text{中央値 } x_0,\ \text{四分位点 } x_0 \pm \gamma)`,
  note: '裾が重く平均も分散も存在しません。標本平均・標本分散は M を増やしても収束せず、シードごとに大きく変わります。図は裾を切って表示しています。',
  support: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  pdf: (x, { x0, gamma }) => 1 / (Math.PI * gamma * (1 + ((x - x0) / gamma) ** 2)),
  cdf: (x, { x0, gamma }) => 0.5 + Math.atan((x - x0) / gamma) / Math.PI,
  // Inversion; tan stays finite in floating point even at U = 0.
  sampler: ({ x0, gamma }) => rng => x0 + gamma * Math.tan(Math.PI * (rng() - 0.5)),
  mean: () => null,
  variance: () => null,
  // Keep the standard Cauchy's range in view: changing x₀ moves the curve, not the axis.
  plotAnchor: () => [-14, 14],
  reference: {
    label: '四分位点が同じ正規 N(x₀, (γ/0.674)²)',
    pdf: (x, { x0, gamma }) => {
      const sd = gamma / NORMAL_QUARTILE;
      return normalPdf((x - x0) / sd) / sd;
    },
    cdf: (x, { x0, gamma }) => normalCdf(((x - x0) * NORMAL_QUARTILE) / gamma),
  },
};
