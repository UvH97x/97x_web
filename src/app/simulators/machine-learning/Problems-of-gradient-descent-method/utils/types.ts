/** 誤差関数の種類 */
export type ErrorFunctionType =
  | 'flat'
  | 'cliff'
  | 'valley'
  | 'saddle'
  | 'custom';

/** 最適化アルゴリズムの種類 */
export type OptimizerType =
  | 'gd'
  | 'clip'
  | 'momentum'
  | 'nesterov'
  | 'adagrad'
  | 'rmsprop'
  | 'adadelta'
  | 'adam';

/** ハイパーパラメータ型 */
export type HyperParameters = {
  [key: string]: number;
};

/** シミュレーション1ステップの状態 */
export type SimulationStep = {
  w: number;
  error: number;
  grad: number;
  deltaW: number;
  /** AdaGrad: 勾配二乗和 */
  gradSum2?: number;
  /** RMSprop / AdaDelta / Adam: 勾配二乗の移動平均 */
  v?: number;
  /** AdaDelta: Δw 二乗の移動平均 */
  u?: number;
  /** Adam: 勾配の移動平均 */
  m?: number;
};

/** シミュレーション全体の状態 */
export type SimulationState = {
  step: number;
  steps: SimulationStep[];
  errorFunction: ErrorFunctionType;
  optimizer: OptimizerType;
  hyperParameters: HyperParameters;
  running: boolean;
};