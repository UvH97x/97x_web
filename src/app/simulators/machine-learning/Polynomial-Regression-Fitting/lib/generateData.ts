// generateData.ts

/**
 * データ生成に使う真のモデル。
 * x ~ U[xMin, xMax],  y = a x³ + b x² + c x + d + ε,  ε ~ N(0, σ²)
 */
export const TRUE_MODEL = {
  coefficients: [0.0, -10.0, 0.0, 1.0], // [d, c, b, a]（x^0, x^1, x^2, x^3 の係数）
  sigma: 5.0,
  xMin: -5,
  xMax: 5,
  count: 15,
} as const

/** 真のモデルの（ノイズを除いた）値 */
export function trueFunction(x: number): number {
  return TRUE_MODEL.coefficients.reduce<number>((sum, w, i) => sum + w * x ** i, 0)
}

/** 真のモデルからデータ点を TRUE_MODEL.count 組サンプリングする */
export function generateData(): [number, number][] {
  const { sigma, xMin, xMax, count } = TRUE_MODEL

  const randn = () => {
    // Box-Muller法で正規分布を生成（u1 = 0 で log(0) にならないよう 1 − random を使う）
    const u1 = 1 - Math.random()
    const u2 = Math.random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  const data: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const x = xMin + Math.random() * (xMax - xMin)
    const y = trueFunction(x) + sigma * randn()
    data.push([x, y])
  }
  return data
}
