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