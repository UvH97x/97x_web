// optimizer.ts

import { computeTotalLoss } from "./loss";

export function updateParameters(
  weights: number[],
  delta: number,
  data: [number, number][],
  lossType: string,
  regType: string,
  lambda: number
): number[] {
  const newWeights = [...weights]

  for(let i = 0; i < weights.length; i++){
    // 現在の重み配列のコピーを作って +delta 試行
    const plusWeights = [...weights]
    plusWeights[i] += delta
    const oldLoss = computeTotalLoss(data, newWeights, lossType, regType, lambda)
    const lossPlus = computeTotalLoss(data, plusWeights, lossType, regType, lambda)

    if(Math.abs(oldLoss - lossPlus) < (0.1 ** (4))){
      newWeights[i] += 0
    } else if(lossPlus < oldLoss){
      newWeights[i] += delta
    } else {
      newWeights[i] -= delta
    }
  }

  return newWeights
}