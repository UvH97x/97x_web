/**
 * 狭義単調増加関数 f について f(x) = y を [lo, hi] で解く。Newton 法の一歩が区間を
 * はみ出すか導関数が使えないときは二分法に切り替える（safeguarded Newton）。
 * f(lo) ≤ y ≤ f(hi) を仮定する。
 */
export function solveMonotone(
  f: (x: number) => number, df: ((x: number) => number) | null, y: number, lo: number, hi: number,
): number {
  let a = lo;
  let b = hi;
  let x = (a + b) / 2;
  for (let i = 0; i < 200; i++) {
    const r = f(x) - y;
    if (r === 0) return x;
    if (r < 0) a = x; else b = x;
    let next = Number.NaN;
    if (df) {
      const slope = df(x);
      if (slope > 0 && Number.isFinite(slope)) next = x - r / slope;
    }
    if (!(next > a && next < b)) next = (a + b) / 2;
    if (Math.abs(next - x) <= 1e-15 * Math.max(1, Math.abs(x)) || b - a <= 1e-15 * Math.max(1, Math.abs(x))) {
      return next;
    }
    x = next;
  }
  return x;
}

/**
 * 定義域が ℝ 全体の単調増加関数について、f(lo) ≤ y ≤ f(hi) となる区間を倍々に広げて探す。
 */
export function bracket(f: (x: number) => number, y: number, center = 0): [number, number] {
  let step = 1;
  let lo = center - step;
  let hi = center + step;
  for (let i = 0; i < 200 && f(lo) > y; i++) { step *= 2; lo = center - step; }
  step = 1;
  for (let i = 0; i < 200 && f(hi) < y; i++) { step *= 2; hi = center + step; }
  return [lo, hi];
}
