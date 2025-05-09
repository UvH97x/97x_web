// LossDisplay.tsx

"use client"

import { FC } from "react"

type Props = {
  currentLoss: number
  degree: number
  regType: string
  lossType: string
}

export const LossDisplay: FC<Props> = ({
  currentLoss,
  degree,
  regType,
  lossType
}) => {
  return(
    <div className="p-4 border rounded-lg">
      <h2 className="font-bold text-lg mb-2">現在の誤差</h2>
      <p>{currentLoss.toFixed(4)}</p>
      <hr className="my-2" />
      <h2 className="font-bold text-lg mb-2">現在のモデル({regType}回帰)</h2>
      <p className="text-sm font-mono break-words">y = {formatSymbolicModel(degree)}</p>
      <h2 className="font-bold text-lg">誤差関数</h2>
      <p className="font-mono text-sm">{formatLossFunction(lossType, regType)}</p>
    </div>
  )
}

function formatSymbolicModel(degree: number): string {
  return Array.from({ length: degree + 1 }, (_, i) => {
    if (i === 0) return `w₀`
    if (i === 1) return `w₁·x`
    return `w_${i}·x^${i}`
  }).join(" + ")
}

function formatLossFunction(lossType: string, regType: string): string {
  const errorTerm = lossType === "mse" ? "MSE" : "MAE"

  const regTerm = {
    normal: "",
    ridge: "+ λ‖w‖²",
    lasso: "+ λ‖w‖",
  }[regType]

  return `E(w) = ${errorTerm} ${regTerm}`
}