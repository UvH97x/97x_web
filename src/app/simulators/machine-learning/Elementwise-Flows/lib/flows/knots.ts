import type { FlowFn, FlowParams, Handle, ParamSpec, VectorSpec } from '../types';

/**
 * ノット系フロー（区分多項式・RQS）の共通部品。
 * [−L, L] を K 区間に分け、ノット (x_j, y_j)（j = 0..K）を置く。両端は (±L, ±L) に固定し、
 * 外側は恒等写像の裾とする（Durkan et al. 2019 の配置）。
 */

export const D_MIN = 0.05;
export const D_MAX = 20;

export const KNOT_SCALARS: ParamSpec[] = [
  { key: 'K', label: '区間数 K', sublabel: 'bins', min: 2, max: 12, step: 1, init: 5, digits: 0 },
  { key: 'L', label: '範囲 L', sublabel: '[−L, L] の外は恒等写像', min: 1, max: 6, step: 0.5, init: 3, digits: 1 },
];

export function linspace(a: number, b: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => (count === 1 ? a : a + ((b - a) * i) / (count - 1)));
}

/** 昇順の knots について knots[j] ≤ v となる最大の j を [0, knots.length − 2] の範囲で返す。 */
export function findBin(knots: number[], v: number): number {
  let lo = 0;
  let hi = knots.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (knots[mid] <= v) lo = mid; else hi = mid - 1;
  }
  return lo;
}

/**
 * 既定の形。u = (x + L)/(2L) ∈ [0, 1] として φ(u) = u − 0.12 sin 2πu + 0.06 sin πu を使い、
 * g₀(x) = −L + 2L φ(u) とする。中央が急な S 字なので、正規分布を移すと二峰になる。
 */
function shape(x: number, L: number): { y: number; d: number } {
  const u = (x + L) / (2 * L);
  const phi = u - 0.12 * Math.sin(2 * Math.PI * u) + 0.06 * Math.sin(Math.PI * u);
  const dphi = 1 - 0.24 * Math.PI * Math.cos(2 * Math.PI * u) + 0.06 * Math.PI * Math.cos(Math.PI * u);
  return { y: -L + 2 * L * phi, d: dphi };
}

export function initKnots(s: Record<string, number>): Record<string, number[]> {
  const { K, L } = s;
  const kx = linspace(-L, L, K + 1);
  return {
    kx,
    ky: kx.map(x => shape(x, L).y),
    d: kx.map((x, j) => (j === 0 || j === K ? 1 : shape(x, L).d)),
    c: Array.from({ length: K }, (_, j) => (j % 2 === 0 ? 0.4 : -0.4)),
  };
}

/** 隣り合うノットの最小間隔。 */
export const knotGap = (K: number, L: number) => (0.05 * 2 * L) / K;

/** 両端を ±L に固定し、内側を狭義単調増加（間隔 gap 以上）に直す。 */
function orderKnots(values: number[], L: number, gap: number): number[] {
  const K = values.length - 1;
  const out = values.slice();
  out[0] = -L;
  out[K] = L;
  for (let j = 1; j < K; j++) out[j] = Math.max(out[j], out[j - 1] + gap);
  for (let j = K - 1; j >= 1; j--) out[j] = Math.min(out[j], out[j + 1] - gap);
  return out;
}

const valid = (a: number[] | undefined, length: number): a is number[] =>
  Array.isArray(a) && a.length === length && a.every(Number.isFinite);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * ノット系パラメータの整合性を回復する。
 * - K が変わったときは、変更前の曲線を新しい等間隔ノットで取り直す（y = g(x), d = g′(x)）。
 * - L だけが変わったときは、ノットを L に比例して拡大縮小する（形を保つ）。
 * - URL 由来などで長さや値が不正なベクトルは既定値に置き換える。
 */
export function normalizeKnots(next: FlowParams, prev: FlowParams | undefined, build: (p: FlowParams) => FlowFn): FlowParams {
  const { K, L } = next.s;
  const init = initKnots(next.s);
  let { kx, ky, d, c } = next.v;

  if (prev && valid(prev.v.kx, prev.s.K + 1) && valid(prev.v.ky, prev.s.K + 1) && (prev.s.K !== K || prev.s.L !== L)) {
    if (prev.s.K === K) {
      const scale = L / prev.s.L;
      kx = prev.v.kx.map(x => x * scale);
      ky = prev.v.ky.map(y => y * scale);
    } else {
      const fn = build(prev);
      kx = linspace(-L, L, K + 1);
      ky = kx.map(x => fn.forward(x));
      d = kx.map(x => fn.derivative(x));
      c = init.c.map(() => 0);
    }
  }

  const gap = knotGap(K, L);
  kx = orderKnots(valid(kx, K + 1) ? kx : init.kx, L, gap);
  ky = orderKnots(valid(ky, K + 1) ? ky : init.ky, L, gap);
  d = (valid(d, K + 1) ? d : init.d).map((value, j) => (j === 0 || j === K ? 1 : clamp(value, D_MIN, D_MAX)));
  c = (valid(c, K) ? c : init.c).map(value => clamp(value, -0.95, 0.95));
  return { s: next.s, v: { ...next.v, kx, ky, d, c } };
}

/** 内側のノット（j = 1..K−1）がドラッグ対象。 */
export function knotHandles({ v: { kx, ky } }: FlowParams): Handle[] {
  return kx.slice(1, -1).map((x, i) => ({ x, y: ky[i + 1], axes: 'xy' }));
}

/** ハンドル index（内側ノット j = index + 1）を、両隣のノットの間にクランプして動かす。 */
export function dragKnot(params: FlowParams, index: number, x: number, y: number): FlowParams {
  const { K, L } = params.s;
  const gap = knotGap(K, L);
  const j = index + 1;
  const kx = params.v.kx.slice();
  const ky = params.v.ky.slice();
  kx[j] = clamp(x, kx[j - 1] + gap, kx[j + 1] - gap);
  ky[j] = clamp(y, ky[j - 1] + gap, ky[j + 1] - gap);
  return { s: params.s, v: { ...params.v, kx, ky } };
}

/** ノット座標は URL 保存のためだけのベクトル（スライダーは出さず、ドラッグで操作する）。 */
export const KNOT_POSITION_SPECS: VectorSpec[] = [
  { key: 'kx', title: 'ノット x_j', min: -6, max: 6, step: 0.01, digits: 2, itemLabel: j => `x_${j}`, editable: () => false },
  { key: 'ky', title: 'ノット y_j', min: -6, max: 6, step: 0.01, digits: 2, itemLabel: j => `y_${j}`, editable: () => false },
];

export const DERIVATIVE_SPEC: VectorSpec = {
  key: 'd', title: 'ノットでの微係数 d_j', min: D_MIN, max: D_MAX, step: 0.01, digits: 2, log: true,
  itemLabel: j => `d_${j}`,
  // 両端は恒等写像の裾と C¹ でつながるよう 1 に固定する。
  editable: (j, p) => j > 0 && j < p.s.K,
};

export const knotRegion = ({ s: { L } }: FlowParams): [number, number, number, number] => [-L, L, -L, L];
export const knotView = ({ s: { L } }: FlowParams): [number, number] => [-L - 1.5, L + 1.5];

export const fmt = (value: number, digits = 3) => (Math.abs(value) < 5e-13 ? 0 : value).toFixed(digits);
