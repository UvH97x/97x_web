import { OptimizerType, HyperParameters } from './types';

/**
 * 最適化法ごとのデフォルトハイパーパラメータ
 */
export function getDefaultHyperParameters(type: OptimizerType): HyperParameters {
  switch (type) {
    case 'gd':
      return { eta: 0.05 };
    case 'clip':
      return { eta: 0.05, g0: 1.0 };
    case 'momentum':
      return { eta: 0.05, mu: 0.9 };
    case 'nesterov':
      return { eta: 0.05, mu: 0.9 };
    case 'adagrad':
      return { eta: 0.03, eps: 1e-8 };
    case 'rmsprop':
      return { eta: 0.03, rho: 0.9, eps: 1e-8 };
    case 'adadelta':
      return { rho: 0.95, eps: 1e-6 };
    case 'adam':
      return { eta: 0.03, rho1: 0.9, rho2: 0.999, eps: 1e-8 };
    default:
      return {};
  }
}