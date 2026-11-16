import type { DistributionDef, Params } from '../types';
import { binomial } from './binomial';
import { chiSquare } from './chiSquare';
import { normal } from './normal';
import { poisson } from './poisson';

/** 新しい分布はここに追加する。先頭が既定の分布。 */
export const DISTRIBUTIONS: readonly DistributionDef[] = [normal, chiSquare, binomial, poisson];

export function getDistribution(id: string): DistributionDef {
  return DISTRIBUTIONS.find(def => def.id === id) ?? DISTRIBUTIONS[0];
}

export function initialParams(def: DistributionDef): Params {
  return Object.fromEntries(def.params.map(spec => [spec.key, spec.init]));
}
