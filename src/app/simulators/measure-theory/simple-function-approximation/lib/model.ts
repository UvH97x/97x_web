import type { PointInfo, Preset, PresetId } from './types';

const INV_SQRT_2PI = 1 / Math.sqrt(2 * Math.PI);

export const normalPdf = (x: number, sigma: number): number =>
  (INV_SQRT_2PI / sigma) * Math.exp(-(x * x) / (2 * sigma * sigma));

// Abramowitz–Stegun 7.1.26 — |ε| < 1.5e-7, far below one screen pixel.
function erf(x: number): number {
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const p = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const y = 1 - p * Math.exp(-a * a);
  return x < 0 ? -y : y;
}

export const normalCdf = (x: number): number => 0.5 * (1 + erf(x / Math.SQRT2));

export const PRESETS: readonly Preset[] = [
  {
    id: 'normal-pdf',
    label: '正規分布の確率密度函数',
    tex: String.raw`f(x)=\frac{1}{\sqrt{2\pi}\,\sigma}\exp\!\left(-\frac{x^{2}}{2\sigma^{2}}\right)`,
    note: 'σ が小さいほどピークが高くなり、f(x) ≥ n による切り詰めを観察できます（σ = 0.2 でピークは約 1.995）。',
    defaultR: 1,
    usesSigma: true,
    f: normalPdf,
  },
  {
    id: 'normal-cdf',
    label: '標準正規分布の累積分布函数 Φ(x)',
    tex: String.raw`f(x)=\Phi(x)=\int_{-\infty}^{x}\frac{1}{\sqrt{2\pi}}e^{-t^{2}/2}\,dt`,
    note: '0 ≤ Φ(x) ≤ 1 なので n ≥ 1 では切り詰めが起きません。分布函数もまた非負可測函数であることの確認用です。',
    defaultR: 3,
    usesSigma: false,
    f: normalCdf,
  },
  {
    id: 'square',
    label: 'f(x) = x²',
    tex: String.raw`f(x)=x^{2}`,
    note: '表示範囲を広げるほど値が大きくなるため、上端 n での切り詰めが最も分かりやすい例です。',
    defaultR: 2,
    usesSigma: false,
    f: (x: number) => x * x,
  },
  {
    id: 'sine',
    label: '正弦波 1 + sin x',
    tex: String.raw`f(x)=1+\sin x`,
    note: '単函数近似は非負函数に対する構成なので、sin を 1 だけ持ち上げています。値域 [0, 2] を刻む様子と、山の頂上が n で切り詰められる様子を同時に見られます。',
    defaultR: 3,
    usesSigma: false,
    f: (x: number) => 1 + Math.sin(x),
  },
  {
    id: 'damped-oscillation',
    label: '減衰振動 (1 + sin 6x)·e^(−x²/2)',
    tex: String.raw`f(x)=\bigl(1+\sin 6x\bigr)\,e^{-x^{2}/2}`,
    note: '速い振動と減衰を重ねた函数。値域の分割線を何度も横切るため、fₙ の階段が細かく折れ曲がり、山ごとに切り詰めの有無が変わります。',
    defaultR: 3,
    usesSigma: false,
    f: (x: number) => (1 + Math.sin(6 * x)) * Math.exp(-(x * x) / 2),
  },
];

export function presetById(id: PresetId): Preset {
  return PRESETS.find(p => p.id === id) ?? PRESETS[0];
}

/**
 * f_n(x) = min( n, floor(2^n f(x)) / 2^n ).
 * The cases definition and this one formula agree; see the spec §15.
 */
export function approxAt(y: number, n: number): number {
  if (!Number.isFinite(y)) return n;
  if (y >= n) return n;
  const den = 2 ** n;
  return Math.floor(Math.max(0, y) * den) / den;
}

/** k(x) = floor(2^n f(x)) + 1, defined only while f(x) < n. */
export function pointInfo(x: number, fxRaw: number, n: number): PointInfo {
  const fx = Math.max(0, fxRaw);
  const den = 2 ** n;
  if (!Number.isFinite(fx) || fx >= n) return { x, fx, fn: n, k: null, den };
  const k = Math.floor(fx * den) + 1;
  return { x, fx, fn: (k - 1) / den, k, den };
}

/** Peak of f over the drawn window — drives the y-axis extent. */
export function maxValue(f: (x: number) => number, R: number, samples = 1024): number {
  let m = 0;
  for (let i = 0; i <= samples; i++) {
    const v = f(-R + (2 * R * i) / samples);
    if (Number.isFinite(v) && v > m) m = v;
  }
  return m;
}

/**
 * Level lines are drawn every `stride` steps of 2^-n. The stride stays a power
 * of two so the thinned lines are still genuine dyadic levels.
 */
export function levelStride(n: number, yTop: number, maxLines: number): number {
  const total = Math.floor(Math.min(n, yTop) * 2 ** n);
  if (total <= maxLines) return 1;
  return 2 ** Math.ceil(Math.log2(total / maxLines));
}

/** "5/4" — numerator over 2^n, deliberately left unreduced to expose the level index. */
export function fracText(num: number, n: number): string {
  return n === 0 ? String(num) : `${num}/${2 ** n}`;
}

export function fracTex(num: number, n: number): string {
  return n === 0 ? String(num) : String.raw`\frac{${num}}{${2 ** n}}`;
}
