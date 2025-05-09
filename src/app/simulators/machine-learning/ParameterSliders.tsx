// ParameterSliders.tsx

"use client";

import { FC } from "react"

type Props = {
  parameters: number[]
  onParameterChange: (index: number, value: number) => void
  delta: number
}

export const ParameterSliders: FC<Props> = ({ parameters, onParameterChange, delta }) => {
  return(
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-lg font-bold">モデルパラメータ(w)</h2>
      {parameters.map((w, i) => (
        <div key={i}>
          <label className="block font-semibold">
            w<sub>{i}</sub>: {w.toFixed(-Math.log10(delta))}
          </label>
          <input
            type="range"
            min={-20}
            max={20}
            step={0.001}
            value={w}
            onChange={(e) => onParameterChange(i, parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      ))}
    </div>
  )
}