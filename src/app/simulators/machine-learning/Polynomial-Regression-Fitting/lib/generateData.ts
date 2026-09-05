// generateData.ts

// 10組の(x, y)データ点を計算。xは[-10, 19]の一様分布からサンプリングされ、三次関数にガウス分布のノイズを加えたものがyに作られる。
// データ点の範囲が[-11, 11]に収まるか分からないので、そこはパラメータの調整によりどうにかする。
export function generateData(): [number, number][] {
  // y = ax^3+bx^2+cx+d+epsilon, epsilon ~ cal(N)(0, sigma^2)
  const a = 1.0
  const b = 0.0
  const c = -10.0
  const d = 0.0
  const sigma = 0.5 * 10

  const randn = () => {
    // Box-Muller法で正規分布を生成
    const u1 = Math.random()
    const u2 = Math.random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  const data: [number, number][] = []

  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 10 - 5 // [-5, 5]の一様分布
    const noise = (randn() * 1) * sigma
    const y = a * x ** 3 + b * x ** 2 + c * x + d + noise
    data.push([x, y])
  }

  return data
}