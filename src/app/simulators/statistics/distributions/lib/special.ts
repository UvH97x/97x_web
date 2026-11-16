// Lanczos approximation for log Gamma.
export function logGamma(z: number): number {
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

// Regularized lower incomplete gamma P(a, x), using a series below a + 1
// and a continued fraction for the complementary tail.
export function regularizedGammaP(a: number, x: number): number {
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

/** log B(a, b). */
export function logBeta(a: number, b: number): number {
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

// Continued fraction for the incomplete beta function, by the modified Lentz method.
function betaContinuedFraction(x: number, a: number, b: number): number {
  const epsilon = 1e-14;
  const tiny = 1e-300;
  const guard = (value: number) => (Math.abs(value) < tiny ? tiny : value);

  let c = 1;
  let d = 1 / guard(1 - ((a + b) * x) / (a + 1));
  let h = d;
  for (let m = 1; m <= 1000; m++) {
    const even = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 / guard(1 + even * d);
    c = guard(1 + even / c);
    h *= d * c;

    const odd = (-(a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 / guard(1 + odd * d);
    c = guard(1 + odd / c);
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < epsilon) break;
  }
  return h;
}

// Regularized incomplete beta I_x(a, b). The continued fraction converges fast
// below the mean-like point (a + 1) / (a + b + 2); above it, use the symmetry
// I_x(a, b) = 1 - I_{1-x}(b, a).
export function regularizedBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(a * Math.log(x) + b * Math.log1p(-x) - logBeta(a, b));
  const value = x < (a + 1) / (a + b + 2)
    ? (front * betaContinuedFraction(x, a, b)) / a
    : 1 - (front * betaContinuedFraction(1 - x, b, a)) / b;
  return Math.max(0, Math.min(1, value));
}

export function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

// Φ(z) = (1 ± P(1/2, z²/2)) / 2.
export function normalCdf(z: number): number {
  const t = regularizedGammaP(0.5, (z * z) / 2);
  return z < 0 ? 0.5 * (1 - t) : 0.5 * (1 + t);
}
