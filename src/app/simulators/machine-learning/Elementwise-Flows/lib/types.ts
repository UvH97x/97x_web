import type { ParamSpec } from '@/src/app/simulators/statistics/distributions/lib/types';

export type { ParamSpec };

/**
 * フロー 1 つぶんのパラメータ。s はスライダー 1 本に対応するスカラー、
 * v はノット・係数など長さが他のパラメータ（K や n）で決まるベクトル。
 */
export interface FlowParams {
  s: Record<string, number>;
  v: Record<string, number[]>;
}

/** ベクトルパラメータの各要素をスライダーで操作するための仕様。 */
export interface VectorSpec {
  /** URL クエリのキーにもなる。urlState.ts の予約語やスカラーのキーと衝突させないこと。 */
  key: string;
  /** スライダー群の見出し（例: 'ノットでの微係数 d_j'）。 */
  title: string;
  min: number;
  max: number;
  step: number;
  digits: number;
  /** true ならスライダーを log10 スケールにする（正の値のみ）。 */
  log?: boolean;
  itemLabel(index: number, params: FlowParams): string;
  /** スライダーを出す要素。固定された要素（境界の微係数など）は false を返す。既定はすべて true。 */
  editable?(index: number, params: FlowParams): boolean;
  /** このベクトル自体を表示・URL 保存するか（例: 次数 n = 2 のときだけ c_j）。既定は true。 */
  visible?(params: FlowParams): boolean;
}

/** キャンバス上でドラッグできる点。axes = 'y' なら縦方向にだけ動く。 */
export interface Handle {
  x: number;
  y: number;
  axes: 'xy' | 'y';
}

/** パラメータを固定して前計算を済ませた関数の組。定義域外では NaN を返す。 */
export interface FlowFn {
  forward(x: number): number;
  inverse(y: number): number;
  derivative(x: number): number;
}

/** 診断欄に表として出す補助情報（例: 区分多項式のべき基底係数 a_{j,r}）。 */
export interface CoefficientTable {
  title: string;
  header: string[];
  rows: string[][];
}

/**
 * 要素別フロー 1 つぶんの定義。新しい関数はこのオブジェクトを書いて
 * flows/index.ts に登録するだけで UI 全体に反映される。
 */
export interface FlowDef {
  id: string;
  name: string;
  group: 'fixed' | 'parametric' | 'spline';
  scalars: ParamSpec[];
  vectors?: VectorSpec[];
  /** スカラーから既定のベクトルパラメータを作る。 */
  init(s: Record<string, number>): Record<string, number[]>;
  /**
   * パラメータの整合性（単調性・ベクトルの長さ）を回復する。prev は変更前の値で、
   * K などが変わったときに今の曲線の形を引き継ぐために使う。URL からの復元時は undefined。
   */
  normalize(next: FlowParams, prev?: FlowParams): FlowParams;
  build(params: FlowParams): FlowFn;
  /** 定義域。開区間か閉区間かは区別せず、端点は描画・基底分布の判定にだけ使う。 */
  domain(params: FlowParams): [number, number];
  /** 値域。 */
  image(params: FlowParams): [number, number];
  /** 関数グラフの横軸の範囲。省略時は定義域（無限なら [−4, 4]）。 */
  view?(params: FlowParams): [number, number];
  handles?(params: FlowParams): Handle[];
  /** ハンドル index を (x, y) へ動かした結果のパラメータ（整合性回復済み）を返す。 */
  drag?(params: FlowParams, index: number, x: number, y: number): FlowParams;
  /** ハンドルを結ぶ折れ線（Bernstein の制御多角形）を描くか。 */
  polygon?: boolean;
  /** 破線で囲んで示す領域 [x0, x1, y0, y1]（スプラインの [−L, L]²）。 */
  region?(params: FlowParams): [number, number, number, number];
  /** KaTeX。記法は「0. Prince.pdf」に合わせる。 */
  formulas: { forward: string; inverse: string; derivative: string };
  defaultBase: BaseId;
  /** 計算量・表現力のメモ。 */
  note: string;
  coefficients?(params: FlowParams): CoefficientTable | null;
}

export type BaseId = 'normal' | 'uniform';

export interface ShowState {
  inverse: boolean;
  derivative: boolean;
  identity: boolean;
  base: boolean;
  hist: boolean;
  theory: boolean;
}

export interface ExplorerState {
  flowId: string;
  params: FlowParams;
  base: BaseId;
  count: number;
  bins: number;
  seed: number;
  show: ShowState;
}

/** 関数グラフの描画範囲。 */
export interface FunctionView {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** 密度グラフの描画範囲。lo / hi は値域でクリップする前の目安。 */
export interface DensityRange {
  xMin: number;
  xMax: number;
}

export interface HistogramData {
  values: Float64Array;
  x0: number;
  binW: number;
}

export interface QuantilePoint {
  probability: number;
  /** 基底 Z の分位点。 */
  z: number;
  /** Y = g(Z) の分位点（g は狭義単調増加なので g(z) に等しい）。 */
  y: number;
}
