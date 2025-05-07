// ParameterSliders.tsx

"use client";

import { FC } from "react"

type Props = {
  parameters: number[]
  onParameterChange: (index: number, value: number) => void
}

export const ParameterSliders: FC<Props> = ({ parameters, onParameterChange }) => {
  return(
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-lg font-bold">モデルパラメータ(w)</h2>
      {parameters.map((w, i) => (
        <div key={i}>
          <label className="block font-semibold">
            w<sub>{i}</sub>: {w.toFixed(4)}
          </label>
          <input
            type="range"
            min={-10}
            max={10}
            step={0.01}
            value={w}
            onChange={(e) => onParameterChange(i, parseFloat(e.target.value))}
          />
        </div>
      ))}
    </div>
  )
}