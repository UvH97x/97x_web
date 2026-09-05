import { ErrorFunctionType } from './types';

/**
 * 誤差関数のリスト
 */
export function getErrorFunctionList(): { type: ErrorFunctionType; name: string; description: string }[] {
  return [
    { type: 'flat', name: '平坦＋壁型', description: '平坦な領域と急峻な壁を持つ関数（収束が難しい例）' },
    { type: 'valley', name: '谷型', description: '細く深い谷型（振動・進めない例）' },
    { type: 'saddle', name: '鞍点型', description: '鞍点を持つ関数（局所停止の例）' },
  ];
}

/**
 * 誤差関数E(w)本体
 */
export function errorFunction(w: number, type: ErrorFunctionType): number {
  switch (type) {
    case 'flat':
      // 平坦域 + 壁
      return w <= 0
        ? -1 * w + 1
        : (w > 0 && w < 1)
        ? 100 * w + 1
        : 101;
    case 'valley':
      // 谷型（狭いパラボラ）
      return Math.abs(w)<3
        ? 20 * w ** 2
        : (w<0)
        ? -w + 3 + (20*(-3)**2)
        : w - 3 + (20*3**2)
    case 'saddle':
      // 鞍点（例: w^3 - 3w）
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
      if (w < 0) return -1;
      if (w > 0 && w < 1) return 100;
      return 0;
    case 'valley': {
      if (Math.abs(w) < 3) {
        // 中央（谷）： 40w + 2.5*cos(5w)
        return 40 * w
      } else if (w < 0) {
        // 左側：-1
        return -1;
      } else {
        // 右側：+1
        return 1;
      }
    }
    case 'saddle':
      return -0.6 * w ** 2;
    default:
      return 2 * w;
  }
}