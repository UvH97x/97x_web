import { evaluateModel } from "./modelUtils";

/**
 * データに対する誤差関数（MSEまたはMAE）を計算
 * @param data - [[x, y], ...] のデータ点
 * @param weights - モデルパラメータ
 * @param lossType - "mse" または "mae"
 * @returns 損失（平均誤差）
 */
export function computeLoss(
  data: [number, number][],
  weights: number[],
  lossType: string
): number{
  const n = data.length

  if (lossType === "mse"){
    const totalSquaredError = data.reduce((acc, [x, y]) => {
      const yPred = evaluateModel(x, weights)
      const error = y - yPred
      return acc + error ** 2
    }, 0)
    return totalSquaredError / n
  } else if (lossType === "mae"){
    const totalAbsoluteError = data.reduce((acc, [x, y]) => {
      const yPred = evaluateModel(x, weights)
      return acc + Math.abs(y - yPred)
    }, 0)
    return totalAbsoluteError / n
  }

  throw new Error("未知のlossTypeです")
}

/**
 * 正則化項を加えた誤差関数
 * @param data - データ点
 * @param weights - モデルのパラメータ
 * @param lossType - 誤差関数の種類
 * @param regType- 回帰の種類
 * @param lambda - 正則化項の重み
 * @returns 誤差の合計
 */
export function computeTotalLoss(
  data: [number, number][],
  weights: number[],
  lossType: string,
  regType: string,
  lambda: number
): number{
  const baseLoss: number = computeLoss(data, weights, lossType)

  if(regType === "normal") return baseLoss

  if(regType === "ridge"){
    const l2Penalty = weights.reduce((acc, w) => acc + w ** 2, 0)
    return baseLoss + lambda * l2Penalty
  }

  if(regType === "lasso"){
    const l1Penalty = weights.reduce((acc, w) => acc + Math.abs(w), 0)
    return baseLoss + lambda * l1Penalty
  }

  throw new Error("未知の正則化法です")
}