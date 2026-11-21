import { solveMonotone } from '../solve';
import type { FlowDef, FlowFn, FlowParams } from '../types';
import {
  DERIVATIVE_SPEC, KNOT_POSITION_SPECS, KNOT_SCALARS, dragKnot, findBin, fmt, initKnots, knotHandles,
  knotRegion, knotView, normalizeKnots,
} from './knots';

/**
 * 3 次 Hermite 補間で単調性を保つための微係数の縮小（Fritsch–Carlson）。
 * 区間 j で α = d_j/s_j, β = d_{j+1}/s_j とし、α² + β² が上限を超えたら両方を同じ比で縮める。
 * 縮めるだけなので、先に処理した区間の条件は崩れない。
 */
function effectiveDerivatives(kx: number[], ky: number[], d: number[]): number[] {
  const out = d.slice();
  const limit = 2.9; // 3 ちょうどだと区間内で導関数が 0 に触れうるので、わずかに内側に取る。
  for (let j = 0; j < kx.length - 1; j++) {
    const s = (ky[j + 1] - ky[j]) / (kx[j + 1] - kx[j]);
    const alpha = out[j] / s;
    const beta = out[j + 1] / s;
    const r = Math.hypot(alpha, beta);
    if (r > limit) {
      out[j] = (limit / r) * alpha * s;
      out[j + 1] = (limit / r) * beta * s;
    }
  }
  return out;
}

/** 区間 j の t についてのべき基底係数 a_{j,0..n}。g_j = Σ a_{j,r} t^r。 */
function powerCoefficients({ s: { n }, v: { kx, ky, d, c } }: FlowParams): number[][] {
  const dEff = n === 3 ? effectiveDerivatives(kx, ky, d) : d;
  return kx.slice(0, -1).map((_, j) => {
    const w = kx[j + 1] - kx[j];
    const h = ky[j + 1] - ky[j];
    if (n === 1) return [ky[j], h];
    // y_j + h (t + c t(1 − t)) を展開。|c| < 1 なら導関数 h(1 + c(1 − 2t)) > 0。
    if (n === 2) return [ky[j], h * (1 + c[j]), -h * c[j]];
    const m0 = w * dEff[j];
    const m1 = w * dEff[j + 1];
    return [ky[j], m0, 3 * h - 2 * m0 - m1, -2 * h + m0 + m1];
  });
}

function horner(a: number[], t: number): number {
  let value = 0;
  for (let r = a.length - 1; r >= 0; r--) value = value * t + a[r];
  return value;
}

/** Σ r a_r t^{r−1}（t についての導関数）。 */
function hornerDerivative(a: number[], t: number): number {
  let value = 0;
  for (let r = a.length - 1; r >= 1; r--) value = value * t + r * a[r];
  return value;
}

function build(params: FlowParams): FlowFn {
  const { s: { n, L }, v: { kx, ky, c } } = params;
  const coeffs = powerCoefficients(params);
  return {
    forward(x) {
      if (x <= -L || x >= L) return x;
      const j = findBin(kx, x);
      return horner(coeffs[j], (x - kx[j]) / (kx[j + 1] - kx[j]));
    },
    derivative(x) {
      if (x < -L || x > L) return 1;
      const j = findBin(kx, Math.min(x, L - 1e-12));
      const w = kx[j + 1] - kx[j];
      return hornerDerivative(coeffs[j], (x - kx[j]) / w) / w;
    },
    inverse(y) {
      if (y <= -L || y >= L) return y;
      const j = findBin(ky, y);
      const w = kx[j + 1] - kx[j];
      const h = ky[j + 1] - ky[j];
      const q = (y - ky[j]) / h; // 区間内での相対的な高さ ∈ [0, 1]
      let t: number;
      if (n === 1) {
        t = q;
      } else if (n === 2) {
        // c t² − (1 + c) t + q = 0 の [0, 1] 内の根。桁落ちしない形に有理化してある（c = 0 でも可）。
        const b = 1 + c[j];
        t = (2 * q) / (b + Math.sqrt(Math.max(0, b * b - 4 * c[j] * q)));
      } else {
        const a = coeffs[j];
        t = solveMonotone(u => horner(a, u), u => hornerDerivative(a, u), y, 0, 1);
      }
      return kx[j] + w * Math.min(1, Math.max(0, t));
    },
  };
}

export const piecewisePoly: FlowDef = {
  id: 'piecewise-poly',
  name: '区分多項式',
  group: 'spline',
  scalars: [
    ...KNOT_SCALARS,
    { key: 'n', label: '次数 n', sublabel: '1: 線形, 2: 2 次, 3: 3 次 Hermite', min: 1, max: 3, step: 1, init: 2, digits: 0 },
  ],
  vectors: [
    ...KNOT_POSITION_SPECS,
    {
      key: 'c', title: '2 次の曲がり c_j', min: -0.95, max: 0.95, step: 0.01, digits: 2,
      itemLabel: j => `c_${j}`, visible: p => p.s.n === 2,
    },
    { ...DERIVATIVE_SPEC, visible: p => p.s.n === 3 },
  ],
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
    forward: String.raw`g_j(x) = \sum_{r=0}^{n} a_{j,r}\,t^r,\quad t = \frac{x-x_j}{x_{j+1}-x_j},\ x\in[x_j,x_{j+1}]`,
    inverse: String.raw`\sum_{r=0}^{n} a_{j,r}\,t^r - y = 0\ \text{を}\ t\in[0,1]\ \text{で解く}`,
    derivative: String.raw`g_j'(x) = \frac{1}{x_{j+1}-x_j}\sum_{r=1}^{n} r\,a_{j,r}\,t^{r-1}`,
  },
  defaultBase: 'normal',
  note: '単調性が保証されるように係数をパラメータ化している。n = 1 はノットを結ぶ折れ線、n = 2 は y_j + h_j(t + c_j t(1 − t))（|c_j| < 1）、'
    + 'n = 3 はノットでの値と微係数 d_j による 3 次 Hermite 補間で、α² + β² ≤ 9 を満たすよう d_j を自動で縮める（Fritsch–Carlson）。'
    + '区間の特定は二分探索で O(log K)、多項式の評価は Horner 法で O(n)。逆変換は n ≤ 2 で解析的に、n = 3 では Newton 法と二分法で求める。'
    + 'n = 1, 2 では境界で導関数が不連続になる。',
  coefficients(params) {
    const coeffs = powerCoefficients(params);
    const { n } = params.s;
    return {
      title: 'べき基底の係数 a_{j,r}',
      header: ['j', ...Array.from({ length: n + 1 }, (_, r) => `a_j,${r}`)],
      rows: coeffs.map((a, j) => [String(j), ...a.map(value => fmt(value))]),
    };
  },
};
