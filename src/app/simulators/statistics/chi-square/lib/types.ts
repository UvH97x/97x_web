export interface HistogramData {
  dens: Float64Array;
  nb: number;
  binW: number;
  xMax: number;
}

export interface SampleStats {
  mean: number;
  variance: number;
}

export interface QuantilePoint {
  probability: number;
  value: number;
}

export interface ShowState {
  hist: boolean;
  noncentral: boolean;
  central: boolean;
  quantiles: boolean;
}
