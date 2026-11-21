import { mulberry32, standardNormal } from '@/src/app/simulators/statistics/distributions/lib/random';
import { normalCdf, normalPdf } from '@/src/app/simulators/statistics/distributions/lib/special';
import { niceStep, stepDigits } from '@/src/app/simulators/statistics/distributions/lib/model';
import type {
  BaseId, DensityRange, FlowDef, FlowFn, FlowParams, FunctionView, HistogramData, QuantilePoint,
} from './types';

export { formatValue, niceStep, stepDigits } from '@/src/app/simulators/statistics/distributions/lib/model';

// ---------------------------------------------------------------------------
// 基底分布

export interface BaseDef {
  id: BaseId;
  label: string;
  tex: string;
  support: [number, number];
  pdf(z: number): number;
  quantile(p: number): number;
  sample(rng: () => number): number;
}

function normalQuantile(p: number): number {
  let lo = -40;
  let hi = 40;
  for (let i = 0; i < 200 && hi - lo > 1e-12; i++) {
    const mid = (lo + hi) / 2;
    if (normalCdf(mid) < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export const BASES: Record<BaseId, BaseDef> = {
  normal: {
    id: 'normal', label: '標準正規 N(0, 1)', tex: String.raw`\mathcal{N}(0,1)`,
    support: [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
    pdf: normalPdf, quantile: normalQuantile, sample: standardNormal,
  },
  uniform: {
    id: 'uniform', label: '一様 U(0, 1)', tex: String.raw`\mathcal{U}(0,1)`,
    support: [0, 1],
    pdf: z => (z > 0 && z < 1 ? 1 : 0),
    quantile: p => p,
    // 0 ちょうどは logit などで −∞ になるので避ける。
    sample: rng => rng() || 2 ** -33,
  },
};

/** 台が定義域に収まる基底分布だけを使える。 */
export function allowedBases(def: FlowDef, params: FlowParams): BaseId[] {
  const [lo, hi] = def.domain(params);
  return (Object.keys(BASES) as BaseId[]).filter(id => BASES[id].support[0] >= lo && BASES[id].support[1] <= hi);
}

// ---------------------------------------------------------------------------
// 標本

/** 基底 z を count 個生成して g で移す。 */
export function generate(fn: FlowFn, base: BaseId, count: number, seed: number): { z: Float64Array; y: Float64Array } {
  const rng = mulberry32(seed >>> 0);
  const sample = BASES[base].sample;
  const z = new Float64Array(count);
  const y = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    z[i] = sample(rng);
    y[i] = fn.forward(z[i]);
  }
  return { z, y };
}

export interface SampleSummary {
  mean: number;
  variance: number;
  /** 標本平均 (1/M) Σ log g′(z_i)。対数尤度のヤコビアン項にあたる。 */
  logDet: number;
}

export function sampleSummary(fn: FlowFn, z: Float64Array, y: Float64Array): SampleSummary {
  let mean = 0;
  let logDet = 0;
  for (let i = 0; i < y.length; i++) { mean += y[i]; logDet += Math.log(fn.derivative(z[i])); }
  mean /= y.length;
  let variance = 0;
  for (let i = 0; i < y.length; i++) variance += (y[i] - mean) ** 2;
  return { mean, variance: variance / y.length, logDet: logDet / y.length };
}

/**
 * E[h(Z)] の数値積分。正規分布は [−9, 9] の Simpson 則、一様分布は端点の特異性
 * （logit など）を避けて中点則で計算する。
 */
export function expectation(base: BaseId, h: (z: number) => number): number {
  if (base === 'uniform') {
    const n = 20000;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += h((i + 0.5) / n);
    return sum / n;
  }
  const n = 1800;
  const a = -9;
  const step = 18 / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const z = a + i * step;
    const weight = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    sum += weight * h(z) * normalPdf(z);
  }
  return (sum * step) / 3;
}

export function theorySummary(fn: FlowFn, base: BaseId): SampleSummary {
  const mean = expectation(base, z => fn.forward(z));
  return {
    mean,
    variance: expectation(base, z => (fn.forward(z) - mean) ** 2),
    logDet: expectation(base, z => Math.log(fn.derivative(z))),
  };
}

// ---------------------------------------------------------------------------
// 密度と分位点

/** 変数変換の公式 p_Y(y) = p_Z(g⁻¹(y)) / g′(g⁻¹(y))。値域外では 0。 */
export function pushforwardDensity(fn: FlowFn, base: BaseId, y: number): number {
  const z = fn.inverse(y);
  if (!Number.isFinite(z)) return 0;
  const value = BASES[base].pdf(z) / fn.derivative(z);
  return Number.isFinite(value) ? value : 0;
}

export const QUANTILE_PROBABILITIES = [0.05, 0.25, 0.5, 0.75, 0.95] as const;

/** g は狭義単調増加なので、Y = g(Z) の分位点は Z の分位点の像そのもの。 */
export function quantiles(fn: FlowFn, base: BaseId): QuantilePoint[] {
  return QUANTILE_PROBABILITIES.map(probability => {
    const z = BASES[base].quantile(probability);
    return { probability, z, y: fn.forward(z) };
  });
}

/** 分布エクスプローラと同じく、重い裾を四分位範囲の何倍で打ち切るか。 */
const TAIL_FENCE = 6;

/** 0.05% と 99.95% の分位点を基準にした密度グラフの横軸。値域の端が近ければそこまで広げる。 */
export function densityRange(def: FlowDef, params: FlowParams, fn: FlowFn, base: BaseId): DensityRange {
  const b = BASES[base];
  const y = (p: number) => fn.forward(b.quantile(p));
  const q25 = y(0.25);
  const q75 = y(0.75);
  const iqr = Math.max(q75 - q25, 1e-9);
  const qLo = Math.max(y(0.0005), q25 - TAIL_FENCE * iqr);
  const qHi = Math.min(y(0.9995), q75 + TAIL_FENCE * iqr);
  const span = Math.max(qHi - qLo, 1e-9);
  const [iLo, iHi] = def.image(params);
  let lo = Math.max(iLo, qLo - 0.04 * span);
  let hi = Math.min(iHi, qHi + 0.04 * span);
  if (lo - iLo <= 0.25 * span) lo = iLo;
  if (iHi - hi <= 0.25 * span) hi = iHi;
  return { xMin: lo, xMax: hi };
}

/** 描画範囲を bins 本に分けた密度ヒストグラム。範囲外の標本も正規化には数える。 */
export function histogram(samples: Float64Array, range: DensityRange, bins: number): HistogramData {
  const binW = (range.xMax - range.xMin) / bins;
  const values = new Float64Array(bins);
  for (let i = 0; i < samples.length; i++) {
    const k = Math.floor((samples[i] - range.xMin) / binW);
    if (k >= 0 && k < bins) values[k]++;
  }
  const norm = samples.length * binW;
  for (let k = 0; k < bins; k++) values[k] /= norm;
  return { values, x0: range.xMin, binW };
}

// ---------------------------------------------------------------------------
// 関数グラフ

export const GRID = 400;

/** 横軸の範囲。定義域が有限ならそれ、無限なら def.view か [−4, 4]。 */
export function functionXRange(def: FlowDef, params: FlowParams): [number, number] {
  if (def.view) return def.view(params);
  const [lo, hi] = def.domain(params);
  return [Number.isFinite(lo) ? lo : -4, Number.isFinite(hi) ? hi : 4];
}

/**
 * 格子点 [xMin, xMax] を GRID 等分する。開区間の端点（logit の 0, 1 など）では値が
 * 発散するので、定義域の端にある格子点はわずかに内側へずらす。
 */
export function functionGrid(def: FlowDef, params: FlowParams): Float64Array {
  const [xMin, xMax] = functionXRange(def, params);
  const [dLo, dHi] = def.domain(params);
  const nudge = (xMax - xMin) * 1e-4;
  const xs = new Float64Array(GRID + 1);
  for (let i = 0; i <= GRID; i++) {
    let x = xMin + (i / GRID) * (xMax - xMin);
    if (x <= dLo) x = dLo + nudge;
    if (x >= dHi) x = dHi - nudge;
    xs[i] = x;
  }
  return xs;
}

export function functionView(def: FlowDef, params: FlowParams, fn: FlowFn): FunctionView {
  const [xMin, xMax] = functionXRange(def, params);
  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;
  for (const x of functionGrid(def, params)) {
    const y = fn.forward(x);
    if (Number.isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
  }
  const region = def.region?.(params);
  if (region) { yMin = Math.min(yMin, region[2]); yMax = Math.max(yMax, region[3]); }
  if (!(yMax > yMin)) { yMin -= 1; yMax += 1; }
  const pad = 0.06 * (yMax - yMin);
  return { xMin, xMax, yMin: yMin - pad, yMax: yMax + pad };
}

/** 格子点上での max |g⁻¹(g(x)) − x|。逆変換の実装の正しさと数値誤差の目安。 */
export function roundTripError(fn: FlowFn, xs: Float64Array): number {
  let worst = 0;
  for (const x of xs) {
    const back = fn.inverse(fn.forward(x));
    if (Number.isFinite(back)) worst = Math.max(worst, Math.abs(back - x));
  }
  return worst;
}

/** 目盛り。分布エクスプローラの PlotCanvas と同じ規則で 1, 2, 5 × 10^k 刻みにする。 */
export function ticks(lo: number, hi: number, target: number): { values: number[]; digits: number } {
  const step = niceStep((hi - lo) / target);
  const values: number[] = [];
  for (let x = Math.ceil(lo / step - 1e-9) * step; x <= hi + step * 1e-9; x += step) {
    values.push(Math.abs(x) < step * 1e-9 ? 0 : x);
  }
  return { values, digits: stepDigits(step) };
}
