import { FLOWS, getFlow, initialParams } from './flows';
import { allowedBases } from './model';
import type { BaseId, ExplorerState, FlowDef, FlowParams, ParamSpec, ShowState } from './types';

/**
 * 分布エクスプローラの clampParam と同じ規則。あちらの urlState.ts を import すると
 * 分布の索引ごと読み込まれるので、ここに置く。
 */
export function clampParam(value: number, spec: ParamSpec, s: Record<string, number>): number {
  const max = typeof spec.max === 'function' ? spec.max(s) : spec.max;
  const clamped = Math.min(max, Math.max(spec.min, value));
  return spec.digits === 0 ? Math.round(clamped) : Number(clamped.toFixed(6));
}

// クエリのキー。ParamSpec.key と VectorSpec.key は同じ名前空間を使うので、
// flow, base, samples, bins, seed, show と衝突させないこと。
export const LIMITS = {
  count: { min: 1_000, max: 200_000, init: 50_000 },
  bins: { min: 10, max: 200, init: 60 },
  seed: { min: 1, max: 9999, init: 42 },
} as const;

const DEFAULT_SHOW: ShowState = { inverse: false, derivative: true, identity: true, base: true, hist: true, theory: true };
const SHOW_KEYS = Object.keys(DEFAULT_SHOW) as (keyof ShowState)[];

/** 現在の基底が使えなければフローの既定の基底にする。 */
export function chooseBase(def: FlowDef, params: FlowParams, current: BaseId | null): BaseId {
  const allowed = allowedBases(def, params);
  if (current && allowed.includes(current)) return current;
  return allowed.includes(def.defaultBase) ? def.defaultBase : allowed[0];
}

export function defaultState(flowId: string = FLOWS[0].id): ExplorerState {
  const def = getFlow(flowId);
  const params = initialParams(def);
  return {
    flowId: def.id,
    params,
    base: chooseBase(def, params, null),
    count: LIMITS.count.init,
    bins: LIMITS.bins.init,
    seed: LIMITS.seed.init,
    show: { ...DEFAULT_SHOW },
  };
}

/** スカラーを範囲に収める（宣言順に処理するので、前のパラメータに依存する上限も効く）。 */
export function constrainScalars(def: FlowDef, s: Record<string, number>): Record<string, number> {
  const result = { ...s };
  for (const spec of def.scalars) result[spec.key] = clampParam(result[spec.key], spec, result);
  return result;
}

function readNumber(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readInt(raw: string | null, { min, max, init }: { min: number; max: number; init: number }): number {
  const value = readNumber(raw);
  return value === null ? init : Math.round(Math.min(max, Math.max(min, value)));
}

/** 不明な値や範囲外の値は既定値に戻すので、古いリンクも開ける。 */
export function parseState(query: { get(key: string): string | null }): ExplorerState {
  const state = defaultState(query.get('flow') ?? undefined);
  const def = getFlow(state.flowId);

  const s = { ...state.params.s };
  for (const spec of def.scalars) {
    const value = readNumber(query.get(spec.key));
    if (value !== null) s[spec.key] = value;
  }
  const scalars = constrainScalars(def, s);
  // ベクトルは書かれていなければ（または長さが合わなければ）normalize が既定値で補う。
  const v: Record<string, number[]> = {};
  const fallback = def.init(scalars);
  for (const spec of def.vectors ?? []) {
    const raw = query.get(spec.key);
    v[spec.key] = raw === null ? fallback[spec.key] : raw.split(',').map(Number);
  }
  state.params = def.normalize({ s: scalars, v });

  const base = query.get('base');
  state.base = chooseBase(def, state.params, base === 'normal' || base === 'uniform' ? base : null);
  state.count = readInt(query.get('samples'), LIMITS.count);
  state.bins = readInt(query.get('bins'), LIMITS.bins);
  state.seed = readInt(query.get('seed'), LIMITS.seed);
  const show = query.get('show');
  if (show !== null) {
    const enabled = new Set(show.split(','));
    for (const key of SHOW_KEYS) state.show[key] = enabled.has(key);
  }
  return state;
}

const fmt = (value: number) => String(Number(value.toFixed(6)));

/** すべて既定値の状態は空文字列になり、素の URL のままにする。 */
export function serializeState(state: ExplorerState): string {
  const def = getFlow(state.flowId);
  const base = defaultState(state.flowId);
  const query = new URLSearchParams();

  // 共有リンクが既定値に依存しないよう、フローとそのパラメータは常に書く。
  query.set('flow', state.flowId);
  for (const spec of def.scalars) query.set(spec.key, fmt(state.params.s[spec.key]));
  for (const spec of def.vectors ?? []) {
    if (spec.visible && !spec.visible(state.params)) continue;
    query.set(spec.key, (state.params.v[spec.key] ?? []).map(fmt).join(','));
  }
  const pinned = query.toString();
  const isDefault = state.flowId === FLOWS[0].id
    && JSON.stringify(state.params) === JSON.stringify(base.params);

  if (state.base !== base.base) query.set('base', state.base);
  if (state.count !== base.count) query.set('samples', String(state.count));
  if (state.bins !== base.bins) query.set('bins', String(state.bins));
  if (state.seed !== base.seed) query.set('seed', String(state.seed));
  if (SHOW_KEYS.some(key => state.show[key] !== base.show[key])) {
    query.set('show', SHOW_KEYS.filter(key => state.show[key]).join(','));
  }

  const result = query.toString();
  return isDefault && result === pinned ? '' : result;
}
