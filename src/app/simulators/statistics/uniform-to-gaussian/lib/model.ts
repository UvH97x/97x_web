import type { IrwinHallData, HistogramData, SampleStats } from './types';

// Seeded RNG: mulberry32 (Math.random is not seedable)
export function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate M samples of g = (Σ u_i − N/2) / √(N/12), u_i ~ U(0,1)
export function generate(N: number, M: number, seed: number): Float64Array {
  const rng = mulberry32(seed >>> 0);
  const sd = Math.sqrt(N / 12);
  const out = new Float64Array(M);
  for (let m = 0; m < M; m++) {
    let s = 0;
    for (let i = 0; i < N; i++) s += rng();
    out[m] = (s - N / 2) / sd;
  }
  return out;
}

const CELLS_PER_UNIT = 400;

// Exact density of S_N (sum of N uniforms) via iterative convolution.
// Avoids catastrophic cancellation from the closed-form alternating polynomial.
export function buildIrwinHall(N: number): IrwinHallData {
  const h = 1 / CELLS_PER_UNIT;
  const W = CELLS_PER_UNIT;
  const len = N * CELLS_PER_UNIT + 1;
  let p = new Float64Array(len);
  for (let i = 0; i < W; i++) p[i] = 1.0;
  const pref = new Float64Array(len + 1);
  for (let c = 1; c < N; c++) {
    pref[0] = 0;
    for (let i = 0; i < len; i++) pref[i + 1] = pref[i] + p[i];
    const q = new Float64Array(len);
    for (let i = 0; i < len; i++) {
      const lo = i - W + 1 > 0 ? i - W + 1 : 0;
      q[i] = (pref[i + 1] - pref[lo]) * h;
    }
    p = q;
  }
  return { p, h, len, N, sd: Math.sqrt(N / 12) };
}

// Evaluate standardized-g density from the precomputed S_N density (linear interp + Jacobian)
export function ihDensityAt(g: number, D: IrwinHallData): number {
  const x = g * D.sd + D.N / 2;
  if (x < 0 || x > D.N) return 0;
  const idx = x / D.h;
  const i0 = Math.floor(idx);
  const f = idx - i0;
  if (i0 < 0 || i0 >= D.len - 1) return 0;
  return (D.p[i0] * (1 - f) + D.p[i0 + 1] * f) * D.sd;
}

const INV_SQRT_2PI = 1 / Math.sqrt(2 * Math.PI);
export const gaussDensity = (g: number): number =>
  INV_SQRT_2PI * Math.exp(-0.5 * g * g);

// Density-normalized histogram over [−R, R]
export function histogram(
  samples: Float64Array,
  R: number,
  binW: number
): HistogramData {
  const nb = Math.max(1, Math.ceil((2 * R) / binW));
  const counts = new Float64Array(nb);
  const M = samples.length;
  for (let i = 0; i < M; i++) {
    const g = samples[i];
    if (g < -R || g >= R) continue;
    let b = Math.floor((g + R) / binW);
    if (b >= nb) b = nb - 1;
    counts[b]++;
  }
  const dens = new Float64Array(nb);
  for (let b = 0; b < nb; b++) dens[b] = counts[b] / (M * binW);
  return { dens, nb, binW, R };
}

// Sample mean, variance, excess kurtosis
export function sampleStats(s: Float64Array): SampleStats {
  const M = s.length;
  let mean = 0;
  for (let i = 0; i < M; i++) mean += s[i];
  mean /= M;
  let m2 = 0,
    m4 = 0;
  for (let i = 0; i < M; i++) {
    const d = s[i] - mean;
    const d2 = d * d;
    m2 += d2;
    m4 += d2 * d2;
  }
  m2 /= M;
  m4 /= M;
  return { mean, varr: m2, exKurt: m4 / (m2 * m2) - 3 };
}

export function plotRange(N: number): number {
  return Math.max(4, Math.sqrt(3 * N)) * 1.06;
}
