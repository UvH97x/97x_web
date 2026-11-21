import { bracket, solveMonotone } from '../solve';
import type { FlowDef, FlowFn, FlowParams } from '../types';
import { fmt } from './knots';

/** 既定の係数 a_{r,j}（r = 1..3, j = 0..3）。 */
const A0 = [
  [0.8, 0.5, 0, 0],
  [-0.3, 0.6, 0, 0],
  [0, 0, 0.2, 0],
];
const A_LIMIT = 2;

/** a は R × (m + 1) を行優先で並べたもの。a[r·(m+1) + j] = a_{r+1,j}。 */
function initA(R: number, m: number): number[] {
  return Array.from({ length: R * (m + 1) }, (_, i) => A0[Math.floor(i / (m + 1))]?.[i % (m + 1)] ?? 0);
}

/** 係数列の積（多項式の畳み込み）。 */
function multiply(p: number[], q: number[]): number[] {
  const out = new Array<number>(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) for (let j = 0; j < q.length; j++) out[i + j] += p[i] * q[j];
  return out;
}

function horner(a: number[], x: number): number {
  let value = 0;
  for (let k = a.length - 1; k >= 0; k--) value = value * x + a[k];
  return value;
}

/**
 * q(t) = ε + Σ_r p_r(t)² の係数（次数 2m）と、その原始関数に c を足した
 * g(x) = c + ∫₀ˣ q(t) dt の係数（次数 2m + 1）を前計算する。
 */
function polynomials({ s: { R, m, c, eps }, v: { a } }: FlowParams): { q: number[]; g: number[] } {
  const q = new Array<number>(2 * m + 1).fill(0);
  q[0] = eps;
  for (let r = 0; r < R; r++) {
    const p = a.slice(r * (m + 1), (r + 1) * (m + 1));
    multiply(p, p).forEach((value, k) => { q[k] += value; });
  }
  return { q, g: [c, ...q.map((value, k) => value / (k + 1))] };
}

function build(params: FlowParams): FlowFn {
  const { q, g } = polynomials(params);
  const forward = (x: number) => horner(g, x);
  const derivative = (x: number) => horner(q, x);
  return {
    forward,
    derivative,
    inverse(y) {
      const [lo, hi] = bracket(forward, y);
      return solveMonotone(forward, derivative, y, lo, hi);
    },
  };
}

export const sos: FlowDef = {
  id: 'sos',
  name: '平方和多項式フロー（SOS）',
  group: 'spline',
  scalars: [
    { key: 'R', label: '多項式の個数 R', sublabel: 'p_1, …, p_R', min: 1, max: 3, step: 1, init: 2, digits: 0 },
    { key: 'm', label: '次数 m', sublabel: 'g は 2m + 1 次', min: 0, max: 3, step: 1, init: 1, digits: 0 },
    { key: 'c', label: '定数 c', sublabel: 'g(0) = c', min: -3, max: 3, step: 0.05, init: 0, digits: 2 },
    { key: 'eps', label: 'ε', sublabel: "g′ ≥ ε > 0", min: 0.01, max: 2, step: 0.01, init: 0.1, digits: 2 },
  ],
  vectors: [{
    key: 'a', title: '係数 a_{r,j}', min: -A_LIMIT, max: A_LIMIT, step: 0.05, digits: 2,
    itemLabel: (i, p) => `a_${Math.floor(i / (p.s.m + 1)) + 1},${i % (p.s.m + 1)}`,
  }],
  init: ({ R, m }) => ({ a: initA(R, m) }),
  normalize(next, prev) {
    const { R, m } = next.s;
    let { a } = next.v;
    const length = R * (m + 1);
    if (!(Array.isArray(a) && a.length === length && a.every(Number.isFinite))) {
      // R や m が変わったときは、両方にある (r, j) の係数を引き継ぎ、新しい係数は 0 にする（g の形が変わらない）。
      const prevA = prev?.v.a;
      if (prev && Array.isArray(prevA) && prevA.length === prev.s.R * (prev.s.m + 1)) {
        a = Array.from({ length }, (_, i) => {
          const r = Math.floor(i / (m + 1));
          const j = i % (m + 1);
          return r < prev.s.R && j <= prev.s.m ? prevA[r * (prev.s.m + 1) + j] : 0;
        });
      } else {
        a = initA(R, m);
      }
    }
    return { s: next.s, v: { ...next.v, a: a.map(value => Math.min(A_LIMIT, Math.max(-A_LIMIT, value))) } };
  },
  build,
  domain: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  image: () => [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
  view: () => [-3, 3],
  formulas: {
    forward: String.raw`g(x) = c + \int_0^x\Bigl\{\varepsilon + \sum_{r=1}^{R} p_r(t)^2\Bigr\}dt,\quad p_r(t) = \sum_{j=0}^{m} a_{r,j}t^j`,
    inverse: String.raw`g(x) = y\ \text{を数値的に解く（Newton 法 + 二分法）}`,
    derivative: String.raw`g'(x) = \varepsilon + \sum_{r=1}^{R} p_r(x)^2 \ \ge\ \varepsilon > 0`,
  },
  defaultBase: 'normal',
  note: 'Jaini, Selby & Yu (2019)。導関数が二乗和に ε を足した形なので単調性が保証される。導関数の評価は O(Rm)、'
    + '積分後の係数を前計算しておけば順変換は O(m)（係数の構築は単純には O(Rm²)）。逆変換は数値解法に依存する。'
    + '次数を上げるほど複雑な形を表せるが、値や勾配が急に大きくなり数値的に不安定になりやすい。',
  coefficients(params) {
    const { g } = polynomials(params);
    return {
      title: '展開した g(x) = Σ b_k x^k の係数',
      header: ['k', 'b_k'],
      rows: g.map((value, k) => [String(k), fmt(value, 4)]),
    };
  },
};
