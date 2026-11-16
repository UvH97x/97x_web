import { DISTRIBUTIONS, getDistribution, initialParams } from './distributions';
import type { DistributionDef, ExplorerState, Params, ParamSpec, ShowState, View } from './types';

// Query keys. Distribution parameter keys (ParamSpec.key) share this namespace
// and must not collide with: dist, samples, bins, seed, view, show, from, to.
export const LIMITS = {
  count: { min: 1_000, max: 500_000, init: 50_000 },
  bins: { min: 10, max: 200, init: 60 },
  seed: { min: 1, max: 9999, init: 42 },
} as const;

const DEFAULT_SHOW: ShowState = { hist: true, theory: true, reference: true, quantiles: true, interval: false };
const SHOW_KEYS = Object.keys(DEFAULT_SHOW) as (keyof ShowState)[];

export function defaultState(distId: string = DISTRIBUTIONS[0].id): ExplorerState {
  const def = getDistribution(distId);
  return {
    distId: def.id,
    params: initialParams(def),
    count: LIMITS.count.init,
    bins: LIMITS.bins.init,
    seed: LIMITS.seed.init,
    view: 'pdf',
    show: { ...DEFAULT_SHOW },
    a: null,
    b: null,
  };
}

function readNumber(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Upper limit of a parameter, which may depend on the parameters declared before it. */
export function paramMax(spec: ParamSpec, params: Params): number {
  return typeof spec.max === 'function' ? spec.max(params) : spec.max;
}

/**
 * Clamps a parameter to its range. Values need not lie on the slider grid (they
 * can be typed in), but integer-valued parameters stay integers.
 */
export function clampParam(value: number, spec: ParamSpec, params: Params): number {
  const clamped = Math.min(paramMax(spec, params), Math.max(spec.min, value));
  return spec.digits === 0 ? Math.round(clamped) : Number(clamped.toFixed(6));
}

/**
 * Clamps every parameter to its range, in declaration order, so that a limit
 * that depends on an earlier parameter sees that parameter's final value.
 * Lowering N therefore pulls K down with it; raising N again does not restore K.
 */
export function constrainParams(def: DistributionDef, params: Params): Params {
  const result = { ...params };
  for (const spec of def.params) result[spec.key] = clampParam(result[spec.key], spec, result);
  return result;
}

function readInt(raw: string | null, { min, max, init }: { min: number; max: number; init: number }): number {
  const value = readNumber(raw);
  return value === null ? init : Math.round(Math.min(max, Math.max(min, value)));
}

/** Unknown or out-of-range values fall back to defaults, so stale links keep working. */
export function parseState(query: { get(key: string): string | null }): ExplorerState {
  const state = defaultState(query.get('dist') ?? undefined);
  const def = getDistribution(state.distId);
  for (const spec of def.params) {
    const value = readNumber(query.get(spec.key));
    if (value !== null) state.params[spec.key] = value;
  }
  // Also clamps the defaults of absent parameters against the ones that were given.
  state.params = constrainParams(def, state.params);
  state.count = readInt(query.get('samples'), LIMITS.count);
  state.bins = readInt(query.get('bins'), LIMITS.bins);
  state.seed = readInt(query.get('seed'), LIMITS.seed);
  state.view = (query.get('view') === 'cdf' ? 'cdf' : 'pdf') satisfies View;
  const show = query.get('show');
  if (show !== null) {
    const enabled = new Set(show.split(','));
    for (const key of SHOW_KEYS) state.show[key] = enabled.has(key);
  }
  state.a = readNumber(query.get('from'));
  state.b = readNumber(query.get('to'));
  return state;
}

const fmt = (value: number) => String(Number(value.toFixed(6)));

/** The all-default state serializes to an empty string, keeping the bare URL clean. */
export function serializeState(state: ExplorerState): string {
  const base = defaultState(state.distId);
  const def = getDistribution(state.distId);
  const query = new URLSearchParams();

  // Written first and unconditionally, so a shared link never depends on defaults.
  query.set('dist', state.distId);
  for (const spec of def.params) query.set(spec.key, fmt(state.params[spec.key]));
  const pinned = query.toString();
  const isDefaultDistribution =
    state.distId === DISTRIBUTIONS[0].id && def.params.every(spec => state.params[spec.key] === spec.init);

  if (state.count !== base.count) query.set('samples', String(state.count));
  if (state.bins !== base.bins) query.set('bins', String(state.bins));
  if (state.seed !== base.seed) query.set('seed', String(state.seed));
  if (state.view !== base.view) query.set('view', state.view);
  if (SHOW_KEYS.some(key => state.show[key] !== base.show[key])) {
    query.set('show', SHOW_KEYS.filter(key => state.show[key]).join(','));
  }
  if (state.a !== null) query.set('from', fmt(state.a));
  if (state.b !== null) query.set('to', fmt(state.b));

  const result = query.toString();
  return isDefaultDistribution && result === pinned ? '' : result;
}
