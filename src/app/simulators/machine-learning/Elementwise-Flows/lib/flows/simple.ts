import type { FlowDef, FlowParams } from '../types';

const REAL: [number, number] = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
const UNIT: [number, number] = [0, 1];
const keep = (next: FlowParams) => next;
const none = () => ({});

/** オーバーフローしない σ(x)。 */
export function sigmoidFn(x: number): number {
  if (x >= 0) return 1 / (1 + Math.exp(-x));
  const e = Math.exp(x);
  return e / (1 + e);
}

/** 開区間 (0, 1) の外では NaN。 */
export function logitFn(x: number): number {
  return x > 0 && x < 1 ? Math.log(x / (1 - x)) : Number.NaN;
}

export const affine: FlowDef = {
  id: 'affine',
  name: 'アフィン変換',
  group: 'parametric',
  scalars: [
    { key: 'a', label: '傾き a', sublabel: 'a > 0', min: 0.1, max: 4, step: 0.05, init: 1.5, digits: 2 },
    { key: 'b', label: '切片 b', sublabel: 'b ∈ ℝ', min: -3, max: 3, step: 0.05, init: 0.5, digits: 2 },
  ],
  init: none,
  normalize: keep,
  build: ({ s: { a, b } }) => ({
    forward: x => a * x + b,
    inverse: y => (y - b) / a,
    derivative: () => a,
  }),
  domain: () => REAL,
  image: () => REAL,
  formulas: {
    forward: String.raw`g(x;\,a,b) = ax + b,\quad a > 0,\ b\in\mathbb{R}`,
    inverse: String.raw`g^{-1}(y;\,a,b) = \frac{y-b}{a}`,
    derivative: String.raw`g'(x;\,a,b) = a`,
  },
  defaultBase: 'normal',
  note: '非線形ではないが比較のために置く。計算量は順変換・逆変換・導関数とも O(1)。平行移動とスケール変換しかできず、正規分布は正規分布に移る。',
};

export const sigmoid: FlowDef = {
  id: 'sigmoid',
  name: 'シグモイド σ',
  group: 'fixed',
  scalars: [],
  init: none,
  normalize: keep,
  build: () => ({
    forward: sigmoidFn,
    inverse: logitFn,
    derivative: x => { const s = sigmoidFn(x); return s * (1 - s); },
  }),
  domain: () => REAL,
  image: () => UNIT,
  view: () => [-6, 6],
  formulas: {
    forward: String.raw`\sigma(x) = \frac{1}{1+e^{-x}},\quad \sigma:\mathbb{R}\to(0,1)`,
    inverse: String.raw`\sigma^{-1}(y) = \log\frac{y}{1-y} = \mathrm{logit}(y)`,
    derivative: String.raw`\sigma'(x) = \sigma(x)\bigl(1-\sigma(x)\bigr)`,
  },
  defaultBase: 'normal',
  note: '計算量はすべて O(1)。関数形が固定されているので表現力は限られるが、ℝ を有限区間 (0, 1) に移せるため、他の変換と合成すると役に立つことがある。',
};

export const logit: FlowDef = {
  id: 'logit',
  name: 'ロジット logit',
  group: 'fixed',
  scalars: [],
  init: none,
  normalize: keep,
  build: () => ({
    forward: logitFn,
    inverse: sigmoidFn,
    derivative: x => (x > 0 && x < 1 ? 1 / (x * (1 - x)) : Number.NaN),
  }),
  domain: () => UNIT,
  image: () => REAL,
  formulas: {
    forward: String.raw`\mathrm{logit}(x) = \log\frac{x}{1-x},\quad \mathrm{logit}:(0,1)\to\mathbb{R}`,
    inverse: String.raw`\mathrm{logit}^{-1}(y) = \frac{1}{1+e^{-y}} = \sigma(y)`,
    derivative: String.raw`\mathrm{logit}'(x) = \frac{1}{x(1-x)}`,
  },
  defaultBase: 'uniform',
  note: '定義域が (0, 1) なので基底分布は一様分布 U(0, 1) に限る。U(0, 1) を logit で移すと標準ロジスティック分布（平均 0、分散 π²/3）になる。計算量はすべて O(1)。',
};

export const tanh: FlowDef = {
  id: 'tanh',
  name: 'tanh',
  group: 'fixed',
  scalars: [],
  init: none,
  normalize: keep,
  build: () => ({
    forward: Math.tanh,
    inverse: y => (y > -1 && y < 1 ? Math.atanh(y) : Number.NaN),
    derivative: x => { const t = Math.tanh(x); return 1 - t * t; },
  }),
  domain: () => REAL,
  image: () => [-1, 1],
  view: () => [-4, 4],
  formulas: {
    forward: String.raw`\tanh(x) = \frac{e^{x}-e^{-x}}{e^{x}+e^{-x}},\quad \tanh:\mathbb{R}\to(-1,1)`,
    inverse: String.raw`\tanh^{-1}(y) = \mathrm{artanh}(y)`,
    derivative: String.raw`\tanh'(x) = 1-\tanh^2(x)`,
  },
  defaultBase: 'normal',
  note: '計算量はすべて O(1)。tanh(x) = 2σ(2x) − 1 なので、シグモイドを値域 (−1, 1) へ伸ばしたものにあたる。形は固定されている。',
};

export const sinhArcsinh: FlowDef = {
  id: 'sinh-arcsinh',
  name: 'Sinh-Arcsinh 変換',
  group: 'parametric',
  scalars: [
    { key: 'delta', label: '裾 δ', sublabel: 'δ > 0', min: 0.1, max: 3, step: 0.05, init: 0.6, digits: 2 },
    { key: 'eps', label: '非対称性 ε', sublabel: 'ε ∈ ℝ', min: -3, max: 3, step: 0.05, init: 0.5, digits: 2 },
  ],
  init: none,
  normalize: keep,
  build: ({ s: { delta, eps } }) => ({
    forward: x => Math.sinh(delta * Math.asinh(x) + eps),
    inverse: y => Math.sinh((Math.asinh(y) - eps) / delta),
    derivative: x => (delta / Math.sqrt(1 + x * x)) * Math.cosh(delta * Math.asinh(x) + eps),
  }),
  domain: () => REAL,
  image: () => REAL,
  view: () => [-4, 4],
  formulas: {
    forward: String.raw`g(x;\,\delta,\varepsilon) = \sinh\bigl(\delta\,\mathrm{arcsinh}(x)+\varepsilon\bigr),\quad \delta>0,\ \varepsilon\in\mathbb{R}`,
    inverse: String.raw`g^{-1}(y;\,\delta,\varepsilon) = \sinh\!\left(\frac{\mathrm{arcsinh}(y)-\varepsilon}{\delta}\right)`,
    derivative: String.raw`g'(x;\,\delta,\varepsilon) = \frac{\delta}{\sqrt{1+x^2}}\cosh\bigl(\delta\,\mathrm{arcsinh}(x)+\varepsilon\bigr)`,
  },
  defaultBase: 'normal',
  note: 'δ が裾の重さ（δ < 1 で重い裾、δ > 1 で軽い裾）、ε が非対称性を決める。ℝ 上の滑らかな全単射で、順・逆変換、導関数とも O(1)。ただし局所的な形の変形は苦手である。',
};
