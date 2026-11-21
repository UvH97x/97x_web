import { solveMonotone } from '../solve';
import type { FlowDef, FlowFn, FlowParams } from '../types';
import { fmt } from './knots';

const BETA_LIMIT = 4;
const GAP = 0.01;

/** 既定の係数。単調増加の直線にゆるい波を重ねたもの。 */
function initBeta(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, j) => 2.5 * (j / n - 0.5) + 0.35 * Math.sin((2 * Math.PI * j) / n));
}

/** β₀ < β₁ < … < β_n（間隔 GAP 以上）かつ [−4, 4] に収める。 */
function orderBeta(beta: number[]): number[] {
  const out = beta.map(value => Math.min(BETA_LIMIT, Math.max(-BETA_LIMIT, value)));
  for (let j = 1; j < out.length; j++) out[j] = Math.max(out[j], out[j - 1] + GAP);
  out[out.length - 1] = Math.min(out[out.length - 1], BETA_LIMIT);
  for (let j = out.length - 2; j >= 0; j--) out[j] = Math.min(out[j], out[j + 1] - GAP);
  return out;
}

/** de Casteljau のアルゴリズムで Σ β_j B_{j,n}(t) を評価する（O(n²) だが数値的に安定）。 */
function deCasteljau(beta: number[], t: number): number {
  const b = beta.slice();
  for (let k = b.length - 1; k > 0; k--) for (let j = 0; j < k; j++) b[j] = b[j] * (1 - t) + b[j + 1] * t;
  return b[0];
}

function build({ v: { beta } }: FlowParams): FlowFn {
  const n = beta.length - 1;
  const diffs = beta.slice(1).map((value, j) => n * (value - beta[j]));
  const forward = (t: number) => (t >= 0 && t <= 1 ? deCasteljau(beta, t) : Number.NaN);
  const derivative = (t: number) => (t >= 0 && t <= 1 ? deCasteljau(diffs, t) : Number.NaN);
  return {
    forward,
    derivative,
    inverse(y) {
      if (!(y >= beta[0] && y <= beta[n])) return Number.NaN;
      return solveMonotone(forward, derivative, y, 0, 1);
    },
  };
}

export const bernstein: FlowDef = {
  id: 'bernstein',
  name: 'Bernstein 多項式フロー',
  group: 'spline',
  scalars: [
    { key: 'n', label: '次数 n', sublabel: '係数 β_0, …, β_n', min: 2, max: 10, step: 1, init: 5, digits: 0 },
  ],
  vectors: [{
    key: 'beta', title: '係数 β_j（β_0 < β_1 < … < β_n）', min: -BETA_LIMIT, max: BETA_LIMIT, step: 0.01, digits: 2,
    itemLabel: j => `β_${j}`,
  }],
  init: ({ n }) => ({ beta: initBeta(n) }),
  normalize(next, prev) {
    const { n } = next.s;
    let { beta } = next.v;
    if (!(Array.isArray(beta) && beta.length === n + 1 && beta.every(Number.isFinite))) {
      // n が変わったときは、変更前の曲線を t = j/n で標本化して新しい係数にする（形がおおむね保たれる）。
      const prevBeta = prev?.v.beta;
      if (prev && Array.isArray(prevBeta) && prevBeta.length === prev.s.n + 1) {
        const fn = build(prev);
        beta = Array.from({ length: n + 1 }, (_, j) => fn.forward(j / n));
      } else {
        beta = initBeta(n);
      }
    }
    return { s: next.s, v: { ...next.v, beta: orderBeta(beta) } };
  },
  build,
  domain: () => [0, 1],
  image: ({ v: { beta } }) => [beta[0], beta[beta.length - 1]],
  view: () => [0, 1],
  handles: ({ v: { beta } }) => beta.map((value, j) => ({ x: j / (beta.length - 1), y: value, axes: 'y' })),
  drag(params, index, _x, y) {
    const beta = params.v.beta.slice();
    const lo = index > 0 ? beta[index - 1] + GAP : -BETA_LIMIT;
    const hi = index < beta.length - 1 ? beta[index + 1] - GAP : BETA_LIMIT;
    beta[index] = Math.min(hi, Math.max(lo, y));
    return { s: params.s, v: { ...params.v, beta } };
  },
  polygon: true,
  formulas: {
    forward: String.raw`g(t) = \sum_{j=0}^{n}\beta_j B_{j,n}(t),\quad B_{j,n}(t) = \binom{n}{j}t^j(1-t)^{n-j},\ t\in[0,1]`,
    inverse: String.raw`\sum_{j=0}^{n}\beta_j B_{j,n}(t) = y\ \text{を数値的に解く}`,
    derivative: String.raw`g'(t) = n\sum_{j=0}^{n-1}(\beta_{j+1}-\beta_j)\,B_{j,n-1}(t)`,
  },
  defaultBase: 'uniform',
  note: '係数を β_0 < β_1 < … < β_n とすれば狭義単調増加が保証され、g(0) = β_0, g(1) = β_n より値域は [β_0, β_n] になる。'
    + '定義域が [0, 1] なので基底は U(0, 1) とした（ℝ 上で使うにはシグモイドなどと合成する）。'
    + '点線は制御多角形 (j/n, β_j) で、曲線は両端で制御多角形に接する。逆変換は数値的に求める。',
  coefficients({ v: { beta } }) {
    return {
      title: '係数 β_j と差分',
      header: ['j', 'β_j', 'β_{j+1} − β_j'],
      rows: beta.map((value, j) => [String(j), fmt(value), j < beta.length - 1 ? fmt(beta[j + 1] - value) : '']),
    };
  },
};
