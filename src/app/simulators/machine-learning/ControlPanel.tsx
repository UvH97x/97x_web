// ControlPanel.tsx

"use client";

import { FC } from "react"

type Props = {
  degree: number
  onDegreeChange: (value: number) => void
  regType: string
  onRegChange: (value: string) => void
  lossType: string
  onLossTypeChange: (value: string) => void
  delta: number
  onDeltaChange: (value: number) => void
  lambda: number
  onLambdaChange: (value: number) => void
  onReset: () => void
  onToggle: () => void
  isRunning: boolean
}

export const ControlPanel: FC<Props> = ({
  degree,
  onDegreeChange,
  regType,
  onRegChange,
  lossType,
  onLossTypeChange,
  delta,
  onDeltaChange,
  lambda,
  onLambdaChange,
  onReset,
  onToggle,
  isRunning,
}) => {
  return (
    <div className="p-4 space-y-4 border rounded-lg">
      <div>
        <label className="block font-semibold">多項式の次数(M)</label>
        <input
          type="range"
          min={1}
          max={6}
          value={degree}
          onChange={(e) => onDegreeChange(Number(e.target.value))}
        />
        <span className="ml-2">{degree}</span>
      </div>

      <div>
        <label className="block font-semibold">回帰法</label>
        <select
          value={regType}
          onChange={(e) => onRegChange(e.target.value)}
        >
          <option value="normal">線形回帰</option>
          <option value="ridge">Ridge回帰</option>
          <option value="lasso">LASSO回帰</option>
        </select>
      </div>

      {regType !== "normal" && (<div>
        <label className="block font-semibold">正則化項の重み</label>
        <input
          type="range"
          min={-6}
          max={1}
          step={1}
          value={Math.log10(lambda) + 1}
          onChange={(e) => onLambdaChange(10 ** (Number(e.target.value)-1))}
        />
        <span className="ml-2">{lambda}</span>
      </div>)}

      <div>
        <label className="block font-semibold">誤差関数</label>
        <select
          value={lossType}
          onChange={(e) => onLossTypeChange(e.target.value)}
        >
          <option value="mse">平均二乗誤差(MSE)</option>
          <option value="mae">平均絶対誤差(MAE)</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold">ステップの大きさ</label>
        <input
          type="range"
          min={-5}
          max={1}
          step={1}
          value={Math.log10(delta) + 1}
          onChange={(e) => onDeltaChange(10 ** (Number(e.target.value)-1))}
        />
        <span className="ml-2">{delta}</span>
      </div>

      <div className="space-x-2">
        <button onClick={onReset} className="bg-gray-200 p-2 rounded">
          リセット
        </button>
        <button onClick={onToggle} className="bg-blue-500 text-white p-2 rounded">
          {isRunning ? "ストップ" : "スタート"}
        </button>
      </div>
    </div>
  )
}