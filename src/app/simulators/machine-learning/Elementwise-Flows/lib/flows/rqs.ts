import type { FlowDef, FlowFn, FlowParams } from '../types';
import {
  DERIVATIVE_SPEC, KNOT_POSITION_SPECS, KNOT_SCALARS, dragKnot, findBin, fmt, initKnots, knotHandles,
  knotRegion, knotView, normalizeKnots,
} from './knots';

/**
 * 単調有理二次スプライン（Durkan et al. 2019）。式は「0. Prince.pdf」pp.93–96 のとおり。
 * 区間 j で s_j = h_j / w_j, m_j = d_j + d_{j+1} − 2 s_j とおく。
 */
function build({ s: { L }, v: { kx, ky, d } }: FlowParams): FlowFn {
  const bin = (j: number) => {
    const w = kx[j + 1] - kx[j];
    const h = ky[j + 1] - ky[j];
    const s = h / w;
    return { w, h, s, m: d[j] + d[j + 1] - 2 * s };
  };
  return {
    forward(x) {
      if (x <= -L || x >= L) return x;
      const j = findBin(kx, x);
      const { w, h, s, m } = bin(j);
      const t = (x - kx[j]) / w;
      const tt = t * (1 - t);
      return ky[j] + (h * (s * t * t + d[j] * tt)) / (s + m * tt);
    },
    derivative(x) {
      if (x < -L || x > L) return 1;
      const j = findBin(kx, Math.min(x, L - 1e-12));
      const { w, s, m } = bin(j);
      const t = (x - kx[j]) / w;
      const tt = t * (1 - t);
      const denominator = s + m * tt;
      return (s * s * (d[j + 1] * t * t + d[j] * (t - 1) * (t - 1) + 2 * s * tt)) / (denominator * denominator);
    },
    inverse(y) {
      if (y <= -L || y >= L) return y;
      const j = findBin(ky, y);
      const { w, h, s, m } = bin(j);
      const v = y - ky[j];
      // A t² + B t + C = 0 の [0, 1] 内の根 t* = −2C / (B + √(B² − 4AC))。
      const A = v * m + h * (s - d[j]);
      const B = -v * m + h * d[j];
      const C = -v * s;
      const t = (-2 * C) / (B + Math.sqrt(Math.max(0, B * B - 4 * A * C)));
      return kx[j] + w * Math.min(1, Math.max(0, t));
    },
  };
}

export const rqs: FlowDef = {
  id: 'rqs',
  name: '単調有理二次スプライン（RQS）',
  group: 'spline',
  scalars: KNOT_SCALARS,
  vectors: [...KNOT_POSITION_SPECS, DERIVATIVE_SPEC],
  init: initKnots,
  normalize: (next, prev) => normalizeKnots(next, prev, build),
  build,
  domain: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  image: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  view: knotView,
  handles: knotHandles,
  drag: dragKnot,
  region: knotRegion,
  formulas: {
    forward: String.raw`g_j(x) = y_j + (y_{j+1}-y_j)\frac{s_j t^2 + d_j t(1-t)}{s_j + (d_j+d_{j+1}-2s_j)\,t(1-t)}`,
    inverse: String.raw`g_j^{-1}(y) = x_j + (x_{j+1}-x_j)\frac{-2C}{B+\sqrt{B^2-4AC}}`,
    derivative: String.raw`g_j'(x) = \frac{s_j^2\{d_{j+1}t^2 + d_j(t-1)^2 + 2s_j t(1-t)\}}{\bigl(s_j + m_j t(1-t)\bigr)^2}`,
  },
  defaultBase: 'normal',
  note: 'ノット (x_j, y_j) とそこでの微係数 d_j > 0 を直接パラメータ化でき、正のパラメータで単調性が保証される。'
    + '隣接区間で d_j を共有するので一階導関数まで連続（両端は d = 1 として恒等写像の裾と C¹ でつながる）。'
    + '区間探索が O(log K)、順・逆変換と導関数の評価は O(1)。逆変換は二次方程式の解として閉じた形で求まる。'
    + 'ここで A = v m_j + h_j(s_j − d_j), B = −v m_j + h_j d_j, C = −v s_j, v = y − y_j, h_j = y_{j+1} − y_j である。',
  coefficients({ v: { kx, ky, d } }) {
    return {
      title: 'ノットと区間の傾き',
      header: ['j', 'x_j', 'y_j', 'd_j', 's_j'],
      rows: kx.map((x, j) => [
        String(j), fmt(x), fmt(ky[j]), fmt(d[j]),
        j < kx.length - 1 ? fmt((ky[j + 1] - ky[j]) / (kx[j + 1] - x)) : '',
      ]),
    };
  },
};
