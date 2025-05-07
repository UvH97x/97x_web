// optimizer.ts

import { computeLoss } from "./loss";

export function updateParameters(
  weights: number[],
  delta: number,
  data: [number, number][],
  lossType: string
): number[] {
  const newWeights = [...weights]
  const oldLoss = computeLoss(data, weights, lossType)

  for(let i = 0; i < weights.length; i++){
    // 現在の重み配列のコピーを作って +delta 試行
    const plusWeights = [...weights]
    plusWeights[i] += delta
    const lossPlus = computeLoss(data, plusWeights, lossType)

    if(lossPlus < oldLoss){
      newWeights[i] += delta
    } else {
      newWeights[i] -= delta
    }
  }

  return newWeights
}