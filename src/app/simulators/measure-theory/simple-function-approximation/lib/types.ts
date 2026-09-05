export type PresetId = 'normal-pdf' | 'normal-cdf' | 'square' | 'sine' | 'damped-oscillation';

export interface Preset {
  readonly id: PresetId;
  readonly label: string;
  /** KaTeX source for the definition shown under the selector. */
  readonly tex: string;
  readonly note: string;
  /** x is redrawn on [-defaultR, defaultR] when the preset is picked. */
  readonly defaultR: number;
  /** σ is only a parameter of the normal density. */
  readonly usesSigma: boolean;
  readonly f: (x: number, sigma: number) => number;
}

export interface ShowState {
  /** 値域の分割線 j/2^n */
  levels: boolean;
  /** 上端 y = n */
  cap: boolean;
  /** f_1 … f_{n-1} を薄く重ねる */
  history: boolean;
}

/** Everything the readout needs about a single point x. */
export interface PointInfo {
  x: number;
  fx: number;
  fn: number;
  /** null on the truncated branch f(x) ≥ n, where k is unused. */
  k: number | null;
  /** 2^n — the common denominator of every level. */
  den: number;
}
