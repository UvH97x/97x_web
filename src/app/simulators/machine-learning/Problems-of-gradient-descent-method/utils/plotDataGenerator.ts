import { SimulationState } from './types';
import { errorFunction, gradientFunction } from './errorFunctions';

/**
 * 描画用データ生成
 * @param state 現在のシミュレーション状態
 * @returns { errorCurve: {x:number, y:number}[], gradCurve: {x:number, y:number}[] }
 */
export function plotDataGenerator(state: SimulationState) {
  // 例：-5~+5を0.05刻み
  const xs = Array.from({ length: 201 }, (_, i) => -5 + 0.05 * i);
  const errorCurve = xs.map((x) => ({ x, y: errorFunction(x, state.errorFunction) }));
  const gradCurve = xs.map((x) => ({ x, y: gradientFunction(x, state.errorFunction) }));
  return { errorCurve, gradCurve };
}
