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