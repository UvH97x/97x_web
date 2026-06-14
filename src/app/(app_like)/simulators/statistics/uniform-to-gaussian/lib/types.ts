export interface IrwinHallData {
  p: Float64Array;
  h: number;
  len: number;
  N: number;
  sd: number;
}

export interface HistogramData {
  dens: Float64Array;
  nb: number;
  binW: number;
  R: number;
}

export interface SampleStats {
  mean: number;
  varr: number;
  exKurt: number;
}

export interface ShowState {
  hist: boolean;
  ih: boolean;
  gauss: boolean;
}
