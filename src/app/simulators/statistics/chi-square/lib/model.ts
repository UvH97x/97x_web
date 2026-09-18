import type { HistogramData, QuantilePoint, SampleStats } from './types';

// Seeded RNG: mulberry32 (Math.random is not seedable).
export function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function standardNormal(rng: () => number): number {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Marsaglia–Tsang gamma sampler (shape, scale = 1).
function gamma(shape: number, rng: () => number): number {
  if (shape < 1) {
    return gamma(shape + 1, rng) * Math.pow(Math.max(rng(), Number.EPSILON), 1 / shape);
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

function poisson(mean: number, rng: () => number): number {
  if (mean === 0) return 0;
  const limit = Math.exp(-mean);
  let product = 1;
  let k = 0;
  do {
    k++;
    product *= rng();
  } while (product > limit);
  return k - 1;
}

// X ~ chi-square(df + 2K), K ~ Poisson(lambda / 2).
export function generate(df: number, lambda: number, count: number, seed: number): Float64Array {
  const rng = mulberry32(seed >>> 0);
  const out = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const k = poisson(lambda / 2, rng);
    out[i] = 2 * gamma(df / 2 + k, rng);
  }
  return out;
}

// Lanczos approximation for log Gamma.
function logGamma(z: number): number {
  const p = [
    0.9999999999998099, 676.5203681218851, -1259.1392167224028,
    771.3234287776531, -176.6150291621406, 12.507343278686905,
    -0.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  const zz = z - 1;
  let x = p[0];
  for (let i = 1; i < p.length; i++) x += p[i] / (zz + i);
  const t = zz + p.length - 1.5;
  return 0.5 * Math.log(2 * Math.PI) + (zz + 0.5) * Math.log(t) - t + Math.log(x);
}

export function centralDensity(x: number, df: number): number {
  if (x < 0) return 0;
  if (x === 0) {
    if (df < 2) return Number.POSITIVE_INFINITY;
    if (df === 2) return 0.5;
    return 0;
  }
  const a = df / 2;
  return Math.exp((a - 1) * Math.log(x) - x / 2 - a * Math.log(2) - logGamma(a));
}

// Poisson-mixture representation of the noncentral chi-square density.
export function noncentralDensity(x: number, df: number, lambda: number): number {
  if (lambda === 0) return centralDensity(x, df);
  if (x < 0) return 0;
  if (x === 0) {
    const base = centralDensity(0, df);
    return Number.isFinite(base) ? Math.exp(-lambda / 2) * base : base;
  }

  const mu = lambda / 2;
  let weight = Math.exp(-mu);
  let sum = 0;
  for (let k = 0; k < 512; k++) {
    sum += weight * centralDensity(x, df + 2 * k);
    weight *= mu / (k + 1);
    if (k > mu && weight < 1e-14) break;
  }
  return sum;
}

// Regularized lower incomplete gamma P(a, x), using a series below a + 1
// and a continued fraction for the complementary tail.
function regularizedGammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  const epsilon = 1e-14;
  const tiny = 1e-300;

  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    let ap = a;
    for (let n = 1; n <= 500; n++) {
      ap++;
      term *= x / ap;
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * epsilon) break;
    }
    return Math.min(1, sum * Math.exp(-x + a * Math.log(x) - logGamma(a)));
  }

  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / Math.max(Math.abs(b), tiny);
  let h = d;
  for (let i = 1; i <= 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < epsilon) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
  return Math.max(0, Math.min(1, 1 - q));
}

export function noncentralCdf(x: number, df: number, lambda: number): number {
  if (x <= 0) return 0;
  if (lambda === 0) return regularizedGammaP(df / 2, x / 2);

  const mu = lambda / 2;
  let weight = Math.exp(-mu);
  let sum = 0;
  for (let k = 0; k < 512; k++) {
    sum += weight * regularizedGammaP(df / 2 + k, x / 2);
    weight *= mu / (k + 1);
    if (k > mu && weight < 1e-14) break;
  }
  return Math.max(0, Math.min(1, sum));
}

const QUANTILE_PROBABILITIES = [0.05, 0.25, 0.5, 0.75, 0.95] as const;

export function distributionQuantiles(df: number, lambda: number): QuantilePoint[] {
  return QUANTILE_PROBABILITIES.map(probability => {
    let lo = 0;
    let hi = plotMax(df, lambda);
    while (noncentralCdf(hi, df, lambda) < probability) hi *= 2;
    for (let i = 0; i < 70; i++) {
      const mid = (lo + hi) / 2;
      if (noncentralCdf(mid, df, lambda) < probability) lo = mid;
      else hi = mid;
    }
    return { probability, value: (lo + hi) / 2 };
  });
}

export function plotMax(df: number, lambda: number): number {
  const mean = df + lambda;
  const sd = Math.sqrt(2 * (df + 2 * lambda));
  return Math.max(8, mean + 5 * sd);
}

export function histogram(samples: Float64Array, xMax: number, binW: number): HistogramData {
  const nb = Math.max(1, Math.ceil(xMax / binW));
  const dens = new Float64Array(nb);
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    if (x < 0 || x >= xMax) continue;
    dens[Math.min(nb - 1, Math.floor(x / binW))]++;
  }
  for (let b = 0; b < nb; b++) dens[b] /= samples.length * binW;
  return { dens, nb, binW, xMax };
}

export function sampleStats(samples: Float64Array): SampleStats {
  let mean = 0;
  for (const x of samples) mean += x;
  mean /= samples.length;
  let variance = 0;
  for (const x of samples) variance += (x - mean) ** 2;
  variance /= samples.length;
  return { mean, variance };
}
