// LossDisplay.tsx

"use client"

import { FC } from "react"

type Props = {
  lossType: string
  currentLoss: number
  idealLoss: number
}

export const LossDisplay: FC<Props> = ({
  lossType,
  currentLoss,
  idealLoss,
}) => {
  return(
    <div className="p-4 border rounded-lg">
      <h2 className="font-bold text-lg mb-2">誤差関数の情報</h2>
      <p>選択中：<strong>{lossType.toUpperCase()}</strong></p>
      <p>現在の誤差：{currentLoss.toFixed(4)}</p>
      <hr className="my-2" />
      <p>
        理想値(解析解)：{idealLoss.toFixed(4)} ({lossType.toUpperCase()})
      </p>
    </div>
  )
}