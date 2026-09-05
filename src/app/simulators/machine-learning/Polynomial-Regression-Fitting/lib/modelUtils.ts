// lib/modelUtils.ts

/**
 * 指定された次数の多項式特徴量を返す
 * @param x - 入力値（スカラー）
 * @param degree - 多項式の次数
 * @returns [1, x, x^2, ..., x^degree]
 */
export function polynomialFeatures(x: number, degree: number): number[] {
  const features: number[] = []
  for (let i = 0; i <= degree; i++){
    features.push(x ** i)
  }
  return features
}

/**
 * 多項式回帰モデルを評価する
 * @param x - 入力スカラー
 * @pram weights - 重みベクトル [w0, w1, ..., wM]
 * @returns y = w0 + w1*x + w2*x^2 + ... + wM*x^M
 */
export function evaluateModel(x: number, weights: number[]): number {
  return weights.reduce((sum, w_i, i) => sum + w_i * x ** i, 0)
}