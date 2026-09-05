import { ErrorFunctionType } from './types';

/**
 * 誤差関数のリスト
 */
export function getErrorFunctionList(): { type: ErrorFunctionType; name: string; description: string }[] {
  return [
    { type: 'flat', name: '平坦＋壁型', description: '緩やかな斜面の先に急峻な壁がある関数（跳ね返されて収束しない例）' },
    { type: 'valley', name: '谷型', description: '細く深い谷（両側で振動し谷底に降りられない例）' },
    { type: 'saddle', name: '鞍点型', description: '勾配が消える停留点を持つ関数（そこで学習が止まる例）' },
  ];
}

/*
 * スケール方針: どの誤差関数も E の値域と |dE/dw| の桁を揃え、
 * 既定のハイパーパラメータで数十ステップ以内に「問題」が観察できるようにしている。
 *   flat   : E ∈ [1, 21]  、勾配 -2 / 20 / 0   （緩斜面と壁の比は 10 倍）
 *   valley : E ∈ [0, 18]  、勾配 ±20（谷の内側）/ ±2（外側）
 *   saddle : E ∈ [-25, 25]、勾配 -15 〜 0
 */

/** 谷型が放物線になる区間の半幅。描画側で折れ点として使う */
export const VALLEY_HALF_WIDTH = 1;
/** 谷型の放物線の係数。η=0.1 のとき 2aη=2 となり、素の勾配降下法がちょうど振動し続ける */
const VALLEY_CURVATURE = 10;
/** 谷型・平坦型の緩斜面の傾き */
const GENTLE_SLOPE = 2;
/** 平坦型の壁の傾き */
const WALL_SLOPE = 20;

/**
 * 誤差関数E(w)本体
 */
export function errorFunction(w: number, type: ErrorFunctionType): number {
  switch (type) {
    case 'flat':
      // 緩斜面 + 壁 + 壁の上の平坦域
      return w <= 0
        ? -GENTLE_SLOPE * w + 1
        : w < 1
        ? WALL_SLOPE * w + 1
        : WALL_SLOPE + 1;
    case 'valley': {
      // 谷型（狭く深いパラボラ）: 外側は傾き ±GENTLE_SLOPE の緩斜面へ連続的に接続する
      const edge = VALLEY_CURVATURE * VALLEY_HALF_WIDTH ** 2;
      return Math.abs(w) < VALLEY_HALF_WIDTH
        ? VALLEY_CURVATURE * w ** 2
        : edge + GENTLE_SLOPE * (Math.abs(w) - VALLEY_HALF_WIDTH);
    }
    case 'saddle':
      // 停留点（w=0 で勾配が消えるが極小ではない）
      return -0.2 * w ** 3;
    default:
      return w ** 2;
  }
}

/**
 * 誤差関数の勾配（∂E/∂w）
 */
export function gradientFunction(w: number, type: ErrorFunctionType): number {
  switch (type) {
    case 'flat':
      if (w <= 0) return -GENTLE_SLOPE;
      if (w < 1) return WALL_SLOPE;
      return 0;
    case 'valley':
      if (Math.abs(w) < VALLEY_HALF_WIDTH) return 2 * VALLEY_CURVATURE * w;
      return w < 0 ? -GENTLE_SLOPE : GENTLE_SLOPE;
    case 'saddle':
      return -0.6 * w ** 2;
    default:
      return 2 * w;
  }
}
