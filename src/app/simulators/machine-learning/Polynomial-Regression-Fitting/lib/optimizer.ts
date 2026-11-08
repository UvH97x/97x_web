// optimizer.ts
//
// 多項式回帰の最適化器（減衰付き近接ニュートン法 / MM法）。
//
// 単項式特徴量 [1, x, ..., x^M] は x∈[-5,5] で強く相関し、スケールも 1〜1.5e4 と桁違いなので、
// 勾配降下や等ステップ探索では条件数の悪さにより収束に非常に長い時間がかかる。
// そこで各ステップで目的関数の二次の代理関数（サロゲート）を作り、それを厳密に解く。
//
//   データ項:  MSE → (1/n)Σ r_j²            （そのまま二次）
//              MAE → (1/n)Σ r_j²/(2|r̃_j|)  （IRLS による上界。現在の残差 r̃ で重み付け）
//   正則化項:  Ridge → λ‖w‖²  （二次なのでそのまま）
//              LASSO → λ‖w‖₁  （有効集合法で厳密に扱う → 係数がちょうど 0 になる）
//
// さらにアニメーションを滑らかにするため、近接項 μ(v−w)ᵀQ(v−w) を加えて 1 ステップの移動量を抑える
// （rate = 1/(1+μ)。二次の目的関数なら最適解との差が毎ステップ (1−rate) 倍に縮み、条件数に依存しない）。
// 曲線が大きく動く間は rate を小さくして滑らかに動かし、1 ステップの移動が目に見えないほど小さくなったら
// rate を 1 まで上げて一気に収束させる（MAE の IRLS は減衰させると極端に遅くなるため）。
// 代理関数は真の目的関数の上界なので、どの rate でも損失は単調に減少する。

/** 曲線が大きく動いているときの rate（1 ステップで最適解までの距離をどれだけ縮めるか） */
export const DEFAULT_STEP_RATE = 0.15
/** 1 ステップでの予測値の移動量がデータの y の範囲のこの割合以下なら、減衰を弱める */
const VISIBLE_MOVE = 0.005

export type StepResult = {
  weights: number[]
  /** これ以上ほとんど動かない（収束した）かどうか */
  converged: boolean
}

export function updateParameters(
  weights: number[],
  data: [number, number][],
  lossType: string,
  regType: string,
  lambda: number,
  stepRate: number = DEFAULT_STEP_RATE
): StepResult {
  stepRate = Math.min(1, Math.max(1e-6, stepRate))
  const p = weights.length
  const n = data.length
  const ys = data.map(([, y]) => y)
  const yScale = Math.max(1, ...ys.map(Math.abs))

  // 列ごとのスケーリング（x^i の桁の違いを吸収する）。u_i = s^i w_i, 特徴量は (x/s)^i
  const s = Math.max(1e-12, ...data.map(([x]) => Math.abs(x)))
  const colScale = Array.from({ length: p }, (_, i) => s ** i)
  const phi = data.map(([x]) => Array.from({ length: p }, (_, i) => (x / s) ** i))
  const u = weights.map((w, i) => w * colScale[i])

  // 残差に応じたサンプルごとの重み
  const eps = 1e-6 * yScale
  const sampleWeights = ys.map((y, j) => {
    if (lossType !== "mae") return 1 / n
    return 1 / (2 * n * Math.max(Math.abs(y - dot(phi[j], u)), eps))
  })

  // 重み付き計画行列 B = √A Φ, 目的変数 b = √A y
  // （Ridge の場合は √λ/s^i の行を追加: λ‖w‖² = Σ (λ/s^{2i}) u_i²）
  const B = phi.map((row, j) => row.map((f) => Math.sqrt(sampleWeights[j]) * f))
  const b = ys.map((y, j) => Math.sqrt(sampleWeights[j]) * y)
  if (regType === "ridge") {
    for (let i = 0; i < p; i++) {
      const row = new Array(p).fill(0)
      row[i] = Math.sqrt(lambda) / colScale[i]
      B.push(row)
      b.push(0)
    }
  }

  const yRange = Math.max(1e-12, Math.max(...ys) - Math.min(...ys))
  const maxMove = (v: number[]) => Math.max(...phi.map((f) => Math.abs(dot(f, v) - dot(f, u))))
  const clampRate = (fullMove: number) =>
    Math.min(1, Math.max(stepRate, (VISIBLE_MOVE * yRange) / Math.max(fullMove, 1e-300)))

  // 近接項 μ‖B(v−u)‖² を加えたサロゲートの最小化。rate = 1/(1+μ)
  let next: number[]
  if (regType === "lasso") {
    // min (1+μ)vᵀQv − 2(c+μQu)ᵀv + λΣ|v_i|/s^i,  Q = BᵀB, c = Bᵀb
    const Q = gram(B)
    const c = transposeVec(B, b)
    const Qu = matVec(Q, u)
    const t = colScale.map((sc) => lambda / (2 * sc))
    const solveWithRate = (rate: number) => {
      const mu = (1 - rate) / rate
      const Qp = Q.map((row) => row.map((q) => (1 + mu) * q))
      const cp = c.map((ci, i) => ci + mu * Qu[i])
      return featureSignSearch(Qp, cp, t, u)
    }
    const full = solveWithRate(1)
    const rate = clampRate(maxMove(full))
    next = rate < 1 ? solveWithRate(rate) : full
  } else {
    // 二次なので厳密解 u* を最小二乗で求め、u + rate (u* − u) に進む
    const target = leastSquares(B, b) ?? u
    const rate = clampRate(maxMove(target))
    next = u.map((ui, i) => ui + rate * (target[i] - ui))
  }

  // 収束判定: データ点での予測値の変化がごく小さい
  return {
    weights: next.map((v, i) => v / colScale[i]),
    converged: maxMove(next) < 1e-8 * yScale,
  }
}

/**
 * min f(v) = vᵀQv − 2cᵀv + 2Σ t_i|v_i| を feature-sign search（有効集合法）で厳密に解く。
 * Lee et al., "Efficient sparse coding algorithms" (NIPS 2006)。前回の解から warm start する。
 */
function featureSignSearch(Q: number[][], c: number[], t: number[], init: number[]): number[] {
  const p = c.length
  const f = (x: number[]) =>
    dot(x, matVec(Q, x)) - 2 * dot(c, x) + 2 * x.reduce((acc, xi, i) => acc + t[i] * Math.abs(xi), 0)
  // h = Qv − c。最適性: v_i≠0 なら h_i = −t_i sign(v_i)、v_i=0 なら |h_i| ≤ t_i
  const grad = (x: number[]) => matVec(Q, x).map((qx, i) => qx - c[i])
  const tol = 1e-9 * Math.max(...t, ...c.map(Math.abs), 1e-300)

  let v = [...init]
  let fv = f(v)
  for (let iter = 0; iter < 100; iter++) {
    const h = grad(v)
    const signs = v.map(Math.sign)
    const active = range(p).filter((i) => v[i] !== 0)

    if (active.every((i) => Math.abs(h[i] + t[i] * signs[i]) <= tol)) {
      // 非零係数は最適。ゼロ係数のうち最も KKT 条件を破るものを有効集合に加える
      let worst = -1
      for (let i = 0; i < p; i++) {
        if (v[i] !== 0 || Math.abs(h[i]) - t[i] <= tol) continue
        if (worst < 0 || Math.abs(h[i]) - t[i] > Math.abs(h[worst]) - t[worst]) worst = i
      }
      if (worst < 0) return v
      signs[worst] = -Math.sign(h[worst])
      active.push(worst)
      active.sort((a, b) => a - b)
    }

    // 符号を固定した二次問題の解 v_S = Q_SS⁻¹(c_S − t_S θ_S)
    const sol = solveSymmetric(
      active.map((i) => active.map((k) => Q[i][k])),
      active.map((i) => c[i] - t[i] * signs[i])
    )
    if (!sol) return v
    const vNew = new Array(p).fill(0)
    active.forEach((i, a) => (vNew[i] = sol[a]))

    // v → vNew の線分上で、係数の符号が変わる点と終点のうち f が最小のものへ進む
    let best = vNew
    let bestF = f(vNew)
    for (const i of active) {
      if (v[i] === 0 || Math.sign(vNew[i]) === signs[i]) continue
      const theta = v[i] / (v[i] - vNew[i])
      const cand = v.map((vi, k) => (k === i ? 0 : vi + theta * (vNew[k] - vi)))
      const fc = f(cand)
      if (fc < bestF) {
        best = cand
        bestF = fc
      }
    }
    if (!(bestF < fv)) return v // 数値誤差の範囲でしか改善しない
    v = best
    fv = bestF
  }
  return v
}

/** 列を正規化したハウスホルダー QR 分解で min ‖Bx − b‖² を解く */
function leastSquares(B: number[][], b: number[]): number[] | null {
  const m = B.length
  const p = B[0].length
  const norms = range(p).map((k) => Math.sqrt(B.reduce((acc, row) => acc + row[k] ** 2, 0)) || 1)
  const A = B.map((row) => row.map((v, k) => v / norms[k]))
  const y = [...b]

  for (let k = 0; k < p; k++) {
    let alpha = 0
    for (let i = k; i < m; i++) alpha += A[i][k] ** 2
    alpha = Math.sqrt(alpha)
    if (alpha < 1e-300) return null
    if (A[k][k] > 0) alpha = -alpha
    const vk = range(m).map((i) => (i < k ? 0 : A[i][k]))
    vk[k] -= alpha
    const vnorm2 = vk.reduce((acc, x) => acc + x * x, 0)
    if (vnorm2 === 0) continue
    for (let j = k; j < p; j++) {
      let proj = 0
      for (let i = k; i < m; i++) proj += vk[i] * A[i][j]
      proj = (2 * proj) / vnorm2
      for (let i = k; i < m; i++) A[i][j] -= proj * vk[i]
    }
    let proj = 0
    for (let i = k; i < m; i++) proj += vk[i] * y[i]
    proj = (2 * proj) / vnorm2
    for (let i = k; i < m; i++) y[i] -= proj * vk[i]
  }

  const x = new Array(p).fill(0)
  for (let r = p - 1; r >= 0; r--) {
    let acc = y[r]
    for (let k = r + 1; k < p; k++) acc -= A[r][k] * x[k]
    x[r] = acc / A[r][r]
  }
  const result = x.map((xi, k) => xi / norms[k])
  return result.every(Number.isFinite) ? result : null
}

/** 対角スケーリング付きコレスキー分解で対称正定値な Ax = b を解く */
function solveSymmetric(A: number[][], b: number[]): number[] | null {
  const p = b.length
  const d = A.map((row, i) => 1 / Math.sqrt(Math.abs(row[i]) || 1))
  const M = A.map((row, i) => row.map((a, k) => d[i] * a * d[k]))
  const L = zeros(p, p)
  for (let i = 0; i < p; i++) {
    for (let k = 0; k <= i; k++) {
      let acc = M[i][k]
      for (let j = 0; j < k; j++) acc -= L[i][j] * L[k][j]
      if (i === k) {
        if (acc <= 0) return null
        L[i][i] = Math.sqrt(acc)
      } else {
        L[i][k] = acc / L[k][k]
      }
    }
  }
  const z = new Array(p).fill(0)
  for (let i = 0; i < p; i++) {
    let acc = d[i] * b[i]
    for (let j = 0; j < i; j++) acc -= L[i][j] * z[j]
    z[i] = acc / L[i][i]
  }
  const x = new Array(p).fill(0)
  for (let i = p - 1; i >= 0; i--) {
    let acc = z[i]
    for (let j = i + 1; j < p; j++) acc -= L[j][i] * x[j]
    x[i] = acc / L[i][i]
  }
  const result = x.map((xi, i) => xi * d[i])
  return result.every(Number.isFinite) ? result : null
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const dot = (a: number[], b: number[]) => a.reduce((acc, ai, i) => acc + ai * b[i], 0)
const matVec = (A: number[][], x: number[]) => A.map((row) => dot(row, x))
const zeros = (r: number, c: number) => Array.from({ length: r }, () => new Array(c).fill(0))
const gram = (B: number[][]) => {
  const p = B[0].length
  const G = zeros(p, p)
  for (const row of B) for (let i = 0; i < p; i++) for (let k = 0; k < p; k++) G[i][k] += row[i] * row[k]
  return G
}
const transposeVec = (B: number[][], b: number[]) => {
  const out = new Array(B[0].length).fill(0)
  B.forEach((row, j) => row.forEach((v, i) => (out[i] += v * b[j])))
  return out
}
