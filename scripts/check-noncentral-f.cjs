// Run with: node scripts/check-noncentral-f.cjs
// Load the TypeScript model without emitting files or adding test dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function runChecks() {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const localRequire = id => {
      if (!id.startsWith('.')) return require(id);
      const target = path.resolve(path.dirname(filename), id);
      return load(fs.existsSync(`${target}.ts`) ? `${target}.ts` : path.join(target, 'index.ts'));
    };
    new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
    return module.exports;
  }
  const root = path.resolve(__dirname, '../src/app/simulators/statistics/distributions/lib');
  const { fisherF: f } = load(path.join(root, 'distributions/fisherF.ts'));
  const { generate, quantile, plotRange, sampleStats } = load(path.join(root, 'model.ts'));
  const { parseState, serializeState } = load(path.join(root, 'urlState.ts'));
  let checks = 0;
  function close(actual, expected, label, rtol = 1e-9, atol = 1e-13) {
    assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= atol + rtol * Math.abs(expected),
      `${label}: ${actual} != ${expected}`);
    checks++;
  }

  // Independent closed forms: F(2,2), and noncentral F with d2=2 or 4.
  // For d2=2: CDF = z^a exp[-mu(1-z)]. For d2=4 multiply by
  // 1+(1-z)(a+mu*z). These sum the Poisson series analytically.
  for (const d1 of [1, 2, 5, 50]) {
    for (const d2 of [2, 4]) {
      for (const lambda of [0, 0.000001, 0.5, 4, 25, 50]) {
        const p = { d1, d2, lambda };
        const a = d1 / 2;
        const mu = lambda / 2;
        for (const x of [0.0001, 0.1, 1, 5, 50, 1000]) {
          const z = d1 * x / (d1 * x + d2);
          const dz = d1 * d2 / (d1 * x + d2) ** 2;
          const base = z ** a * Math.exp(-mu * (1 - z));
          const factor = d2 === 2 ? 1 : 1 + (1 - z) * (a + mu * z);
          const derivative = d2 === 2 ? 0 : -a + mu - 2 * mu * z;
          close(f.cdf(x, p), base * factor, 'closed-form CDF');
          close(f.pdf(x, p), base * ((a / z + mu) * factor + derivative) * dz,
            'closed-form PDF');
        }
      }
    }
  }
  for (const x of [0, 0.1, 1, 10]) {
    close(f.pdf(x, { d1: 2, d2: 2, lambda: 0 }), 1 / (1 + x) ** 2, 'central PDF');
    close(f.cdf(x, { d1: 2, d2: 2, lambda: 0 }), x / (1 + x), 'central CDF');
  }
  close(f.mean({ d1: 5, d2: 10, lambda: 0 }), 1.25, 'central mean');
  close(f.variance({ d1: 5, d2: 10, lambda: 0 }), 1.3541666666666667, 'central variance');

  const start = performance.now();
  for (const p of [
    { d1: 1, d2: 1, lambda: 50 },
    { d1: 2, d2: 3, lambda: 0.000001 },
    { d1: 5, d2: 10, lambda: 4 },
    { d1: 50, d2: 100, lambda: 50 },
  ]) {
    const range = plotRange(f, p);
    assert.equal(range.xMin, 0);
    assert.ok(Number.isFinite(range.xMax) && range.xMax > 0);
    for (const q of [0.0005, 0.05, 0.25, 0.5, 0.75, 0.95, 0.9995]) {
      close(f.cdf(quantile(f, p, q), p), q, 'quantile inversion', 1e-9);
    }
    let last = 0;
    for (let i = 0; i <= 400; i++) {
      const x = range.xMax * i / 400;
      const cdf = f.cdf(x, p);
      const pdf = f.pdf(x, p);
      assert.ok(cdf >= last - 1e-13 && cdf <= 1 && pdf >= 0 && !Number.isNaN(pdf));
      last = cdf;
    }
    assert.equal(f.pdf(-1, p), 0);
    assert.equal(f.cdf(-1, p), 0);
    assert.equal(f.pdf(Infinity, p), 0);
    assert.equal(f.cdf(Infinity, p), 1);
  }
  const gridMs = performance.now() - start;
  assert.equal(f.pdf(0, { d1: 1, d2: 10, lambda: 50 }), Infinity);
  close(f.pdf(0, { d1: 2, d2: 10, lambda: 4 }), Math.exp(-2), 'PDF at zero');
  assert.equal(f.pdf(0, { d1: 5, d2: 10, lambda: 4 }), 0);
  assert.equal(f.mean({ d1: 5, d2: 2, lambda: 4 }), Infinity);
  assert.equal(f.variance({ d1: 5, d2: 2, lambda: 4 }), null);
  assert.equal(f.variance({ d1: 5, d2: 4, lambda: 4 }), Infinity);

  const legacy = parseState(new URLSearchParams('dist=f&d1=5&d2=10'));
  assert.equal(legacy.params.lambda, 0);
  for (const x of [0, 0.1, 1, 5, 100]) {
    assert.equal(f.pdf(x, legacy.params), f.reference.pdf(x, legacy.params));
    assert.equal(f.cdf(x, legacy.params), f.reference.cdf(x, legacy.params));
  }
  const state = parseState(new URLSearchParams('dist=f&d1=1&d2=3&lambda=50&view=cdf'));
  assert.deepEqual(parseState(new URLSearchParams(serializeState(state))), state);
  assert.equal(parseState(new URLSearchParams('dist=f&lambda=999')).params.lambda, 50);
  assert.equal(parseState(new URLSearchParams('dist=f&lambda=-1')).params.lambda, 0);

  // Distribution-level check of the sampler against both theoretical moments
  // and CDF, with fixed seeds and degrees having well-behaved moments.
  const samplingStart = performance.now();
  for (const lambda of [0, 4, 50]) {
    const p = { d1: 5, d2: 100, lambda };
    const samples = generate(f, p, 100_000, 42);
    const stats = sampleStats(samples);
    close(stats.mean, f.mean(p), 'sample mean', 0.01);
    close(stats.variance, f.variance(p), 'sample variance', 0.04);
    const sorted = samples.sort();
    for (const q of [0.1, 0.5, 0.9]) {
      close(f.cdf(sorted[Math.floor(q * sorted.length)], p), q, 'sample CDF', 0, 0.007);
    }
  }
  // Reject malformed formula changes as well as invalid TypeScript.
  const katex = require('katex');
  for (const formula of [f.formula, f.moments]) katex.renderToString(formula, { throwOnError: true });
  return { checks, gridMs: Math.round(gridMs), samplingMs: Math.round(performance.now() - samplingStart) };
}

module.exports = { runChecks };
if (require.main === module) console.log('Noncentral F checks passed:', runChecks());
