// LossDisplay.tsx

"use client"

import { FC } from "react"
import { Tex } from "@/src/components/ui/Tex"
import { TRUE_MODEL } from "./lib/generateData"

type Props = {
  currentLoss: number
  degree: number
  regType: string
  lossType: string
  dataCount: number
}

const REG_LABELS: Record<string, string> = {
  normal: "線形回帰",
  ridge: "Ridge回帰",
  lasso: "LASSO回帰",
}

export const LossDisplay: FC<Props> = ({
  currentLoss,
  degree,
  regType,
  lossType,
  dataCount,
}) => {
  return(
    <div className="p-4 border rounded-lg space-y-2">
      <h2 className="font-bold text-lg">現在の誤差</h2>
      <Tex>{String.raw`E(\boldsymbol{w}) = ${currentLoss.toFixed(4)}`}</Tex>
      <hr className="my-2" />
      <h2 className="font-bold text-lg">現在のモデル（{REG_LABELS[regType] ?? regType}）</h2>
      <Tex display>{modelTex(degree)}</Tex>
      <h2 className="font-bold text-lg">誤差関数</h2>
      <Tex display>{lossTex(lossType, regType, degree)}</Tex>
      <p className="text-sm text-muted">
        <Tex>{String.raw`(x_n, y_n)`}</Tex> は <Tex>{`N = ${dataCount}`}</Tex> 個のデータ点です。
      </p>
      <hr className="my-2" />
      <h2 className="font-bold text-lg">真のモデル（データの生成過程）</h2>
      <Tex display>{trueModelTex()}</Tex>
      <p className="text-sm text-muted">グラフの破線はノイズを除いた真の曲線です。</p>
    </div>
  )
}

function trueModelTex(): string {
  const { coefficients, sigma, xMin, xMax } = TRUE_MODEL
  return String.raw`\begin{aligned}
    y &= ${polynomialTex(coefficients)} + \varepsilon, \\
    x &\sim \mathcal{U}(${xMin},\ ${xMax}), \quad \varepsilon \sim \mathcal{N}(0,\ ${sigma}^2)
  \end{aligned}`
}

/** 係数列 [w0, w1, ...] を高次の項から並べた TeX にする（0 の項は省略、係数 ±1 は 1 を省略） */
function polynomialTex(coefficients: readonly number[]): string {
  const terms = coefficients
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => w !== 0)
    .reverse()
  if (terms.length === 0) return "0"
  return terms
    .map(({ w, i }, k) => {
      const power = i === 0 ? "" : i === 1 ? "x" : `x^{${i}}`
      const abs = Math.abs(w)
      const coef = abs === 1 && i > 0 ? "" : String(abs)
      const sign = w < 0 ? "-" : k === 0 ? "" : "+"
      return `${k === 0 ? sign : ` ${sign} `}${coef}${power}`
    })
    .join("")
}

function modelTex(degree: number): string {
  const terms = Array.from({ length: degree + 1 }, (_, i) => {
    if (i === 0) return "w_0"
    if (i === 1) return "w_1 x"
    return `w_${i} x^${i}`
  }).join(" + ")
  return String.raw`f(x) = \sum_{i=0}^{${degree}} w_i x^i = ${terms}`
}

function lossTex(lossType: string, regType: string, degree: number): string {
  const residual = String.raw`y_n - f(x_n)`
  const dataTerm =
    lossType === "mse"
      ? String.raw`\frac{1}{N}\sum_{n=1}^{N} \bigl(${residual}\bigr)^2`
      : String.raw`\frac{1}{N}\sum_{n=1}^{N} \bigl|${residual}\bigr|`

  const regTerm = {
    normal: "",
    ridge: String.raw` + \lambda \sum_{i=0}^{${degree}} w_i^2`,
    lasso: String.raw` + \lambda \sum_{i=0}^{${degree}} |w_i|`,
  }[regType] ?? ""

  return String.raw`E(\boldsymbol{w}) = ${dataTerm}${regTerm}`
}
