import { ErrorFunctionType, SimulationState } from './types';
import { errorFunction, gradientFunction, VALLEY_HALF_WIDTH } from './errorFunctions';

/** 折れ点・不連続点。ここを跨いで線を引くと壁や谷が斜めに潰れるため、両側を明示的にサンプルする。 */
function breakPoints(type: ErrorFunctionType): number[] {
  switch (type) {
    case 'flat':
      return [0, 1];
    case 'valley':
      return [-VALLEY_HALF_WIDTH, VALLEY_HALF_WIDTH];
    default:
      return [];
  }
}

const BASE_MIN = -5;
const BASE_MAX = 5;
const SAMPLES = 240;
const EPS = 1e-6;

/**
 * 描画範囲。既定は [-5, 5] で、現在のパラメータが外に出たらそこまで広げる。
 * 毎ステップ曲線を作り直さずに済むよう、境界は 1 刻みに丸める。
 */
export function plotDomain(state: SimulationState): { xMin: number; xMax: number } {
  const current = state.steps[state.step] ?? state.steps[state.steps.length - 1];
  const w = Number.isFinite(current?.w) ? current.w : 0;
  return {
    xMin: Math.min(BASE_MIN, Math.floor(w - 0.5)),
    xMax: Math.max(BASE_MAX, Math.ceil(w + 0.5)),
  };
}

/**
 * 描画用の曲線データ生成。誤差関数と描画範囲だけに依存するので、呼び出し側でメモ化できる。
 */
export function plotCurves(type: ErrorFunctionType, xMin: number, xMax: number) {
  const xs = Array.from({ length: SAMPLES + 1 }, (_, i) => xMin + ((xMax - xMin) * i) / SAMPLES);
  for (const b of breakPoints(type)) {
    if (b > xMin && b < xMax) xs.push(b - EPS, b, b + EPS);
  }
  xs.sort((a, b) => a - b);

  const errorCurve = xs.map((x) => ({ x, y: errorFunction(x, type) }));
  const gradCurve = xs.map((x) => ({ x, y: gradientFunction(x, type) }));
  return { errorCurve, gradCurve };
}
