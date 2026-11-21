import type { FlowDef, FlowParams } from '../types';
import { bernstein } from './bernstein';
import { piecewisePoly } from './piecewisePoly';
import { rqs } from './rqs';
import { affine, logit, sigmoid, sinhArcsinh, tanh } from './simple';
import { sos } from './sos';

/**
 * 新しいフローはここに追加する。先頭が既定のフロー。
 * 選択リストではグループ（固定形状・パラメトリック・スプライン）ごとに、この並び順で表示される。
 */
export const FLOWS: readonly FlowDef[] = [
  rqs, sigmoid, logit, tanh, affine, sinhArcsinh, piecewisePoly, sos, bernstein,
];

export function getFlow(id: string): FlowDef {
  return FLOWS.find(def => def.id === id) ?? FLOWS[0];
}

export function initialParams(def: FlowDef): FlowParams {
  const s = Object.fromEntries(def.scalars.map(spec => [spec.key, spec.init]));
  return def.normalize({ s, v: def.init(s) });
}
