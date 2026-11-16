import { logGamma } from './special';
import type { Rng } from './types';

// Seeded RNG: mulberry32 (Math.random is not seedable).
export function mulberry32(a: number): Rng {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function standardNormal(rng: Rng): number {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Marsaglia–Tsang gamma sampler (shape, scale = 1).
export function gammaSample(shape: number, rng: Rng): number {
  if (shape < 1) {
    return gammaSample(shape + 1, rng) * Math.pow(Math.max(rng(), Number.EPSILON), 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = standardNormal(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

// Poisson sampler: Knuth's product method for small means, and Hörmann's
// transformed rejection (PTRS) above 10, where the product method gets slow.
export function poissonSampler(mean: number): (rng: Rng) => number {
  if (!(mean > 0)) return () => 0;

  if (mean < 10) {
    const limit = Math.exp(-mean);
    return rng => {
      let k = 0;
      let product = rng();
      while (product > limit) {
        k++;
        product *= rng();
      }
      return k;
    };
  }

  const logMean = Math.log(mean);
  const b = 0.931 + 2.53 * Math.sqrt(mean);
  const a = -0.059 + 0.02483 * b;
  const logInvAlpha = Math.log(1.1239 + 1.1328 / (b - 3.4));
  const vr = 0.9277 - 3.6224 / (b - 2);
  return rng => {
    for (;;) {
      const u = rng() - 0.5;
      const v = rng();
      const us = 0.5 - Math.abs(u);
      const k = Math.floor(((2 * a) / us + b) * u + mean + 0.43);
      if (us >= 0.07 && v <= vr) return k;
      if (k < 0 || (us < 0.013 && v > us)) continue;
      if (Math.log(v) + logInvAlpha - Math.log(a / (us * us) + b) <= -mean + k * logMean - logGamma(k + 1)) {
        return k;
      }
    }
  };
}

// Binomial sampler by sequential inversion from 0, on the smaller of p and 1 - p.
// Expected cost is O(n·min(p, 1 - p)); q^n stays representable for n up to ~1000.
export function binomialSampler(n: number, p: number): (rng: Rng) => number {
  const flip = p > 0.5;
  const pp = flip ? 1 - p : p;
  const q = 1 - pp;
  const ratio = pp / q;
  const p0 = Math.pow(q, n);
  return rng => {
    let u = rng();
    let k = 0;
    let prob = p0;
    while (u > prob && k < n) {
      u -= prob;
      k++;
      prob *= (ratio * (n - k + 1)) / k;
    }
    return flip ? n - k : k;
  };
}
