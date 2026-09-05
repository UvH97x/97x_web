// ControlPanel.tsx

"use client";

import { FC } from "react"
import { RangeField } from '@/src/components/ui/RangeField'

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
      <RangeField
        label="多項式の次数(M)"
        min={1}
        max={6}
        value={degree}
        onValueChange={onDegreeChange}
        display={degree}
      />

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

      {regType !== "normal" && (
        <RangeField
          label="正則化項の重み"
          min={-3}
          max={4}
          step={1}
          value={Math.log10(lambda) + 1}
          onValueChange={value => onLambdaChange(10 ** (value - 1))}
          display={lambda}
        />
      )}

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

      <RangeField
        label="ステップの大きさ"
        min={-5}
        max={1}
        step={1}
        value={Math.log10(delta) + 1}
        onValueChange={value => onDeltaChange(10 ** (value - 1))}
        display={delta}
      />

      <div className="space-x-2">
        <button onClick={onReset} className="bg-fg/10 p-2 rounded">
          リセット
        </button>
        <button onClick={onToggle} className="bg-accent/50 text-white p-2 rounded">
          {isRunning ? "ストップ" : "スタート"}
        </button>
      </div>
    </div>
  )
}
