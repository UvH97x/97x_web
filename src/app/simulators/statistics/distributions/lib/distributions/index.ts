import type { DistributionDef, Params } from '../types';
import { bernoulli } from './bernoulli';
import { beta } from './beta';
import { binomial } from './binomial';
import { cauchy } from './cauchy';
import { chiSquare } from './chiSquare';
import { discreteUniform } from './discreteUniform';
import { exponential } from './exponential';
import { fisherF } from './fisherF';
import { gamma } from './gamma';
import { geometric } from './geometric';
import { laplace } from './laplace';
import { logistic } from './logistic';
import { logNormal } from './logNormal';
import { negativeBinomial } from './negativeBinomial';
import { normal } from './normal';
import { pareto } from './pareto';
import { poisson } from './poisson';
import { studentT } from './studentT';
import { uniform } from './uniform';
import { weibull } from './weibull';

/**
 * 新しい分布はここに追加する。先頭が既定の分布。
 * 選択リストでは連続・離散に分けて、それぞれこの並び順で表示される。
 */
export const DISTRIBUTIONS: readonly DistributionDef[] = [
  normal, uniform, exponential, gamma, beta, chiSquare, studentT, fisherF, logNormal, weibull, laplace, logistic,
  cauchy, pareto,
  bernoulli, binomial, geometric, negativeBinomial, poisson, discreteUniform,
];

export function getDistribution(id: string): DistributionDef {
  return DISTRIBUTIONS.find(def => def.id === id) ?? DISTRIBUTIONS[0];
}

export function initialParams(def: DistributionDef): Params {
  return Object.fromEntries(def.params.map(spec => [spec.key, spec.init]));
}
