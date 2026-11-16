export type Params = Record<string, number>;
export type Rng = () => number;

export interface ParamSpec {
  /** URL クエリのキーにもなる。urlState.ts の予約語と衝突させないこと。 */
  key: string;
  label: string;
  sublabel: string;
  min: number;
  max: number;
  step: number;
  init: number;
  /** 表示時の小数桁数。 */
  digits: number;
}

/** 比較用に重ねる連続曲線（例: 正規近似）。 */
export interface ReferenceCurve {
  label: string;
  pdf(x: number, params: Params): number;
  cdf(x: number, params: Params): number;
}

/**
 * 分布 1 つぶんの定義。新しい分布はこのオブジェクトを書いて
 * distributions/index.ts に登録するだけで UI 全体に反映される。
 */
export interface DistributionDef {
  id: string;
  name: string;
  kind: 'continuous' | 'discrete';
  params: ParamSpec[];
  /** KaTeX: 密度関数 / 確率質量関数（例: N(X = x; \mu, \sigma^2) = ...）。 */
  formula: string;
  /** KaTeX: 平均・分散。 */
  moments: string;
  note?: string;
  /** 台。±Infinity 可。離散分布では整数の両端。 */
  support(params: Params): [number, number];
  /** 密度。離散分布では整数点での確率質量。 */
  pdf(x: number, params: Params): number;
  cdf(x: number, params: Params): number;
  /** パラメータ依存の前計算を済ませたサンプラーを返す。 */
  sampler(params: Params): (rng: Rng) => number;
  /** 存在しない場合は null。 */
  mean(params: Params): number | null;
  variance(params: Params): number | null;
  /**
   * 常に描画範囲へ含める区間。パラメータを動かしたときに軸ではなく曲線の側が
   * 動いて見えるよう、基準となる範囲を固定したい分布で指定する。
   */
  plotAnchor?(params: Params): [number, number];
  reference?: ReferenceCurve;
}

export type View = 'pdf' | 'cdf';

export interface ShowState {
  hist: boolean;
  theory: boolean;
  reference: boolean;
  quantiles: boolean;
  interval: boolean;
}

export interface ExplorerState {
  distId: string;
  params: Params;
  count: number;
  bins: number;
  seed: number;
  view: View;
  show: ShowState;
  /** 区間の端点。null は既定値（25% / 75% 分位点）に追従。 */
  a: number | null;
  b: number | null;
}

/** 描画範囲。lo / hi はデータ上の両端（離散では整数）、xMin / xMax は余白込み。 */
export interface PlotRange {
  xMin: number;
  xMax: number;
  lo: number;
  hi: number;
}

/** 棒 b は [x0 + b·binW, x0 + (b+1)·binW) を覆う。離散では binW = 1 で値は相対度数。 */
export interface HistogramData {
  values: Float64Array;
  x0: number;
  binW: number;
}

export interface SampleStats {
  mean: number;
  variance: number;
}

export interface QuantilePoint {
  probability: number;
  value: number;
}

/** 端点は ±Infinity になりうる（描画範囲の端に置いた場合）。 */
export interface Interval {
  a: number;
  b: number;
}
