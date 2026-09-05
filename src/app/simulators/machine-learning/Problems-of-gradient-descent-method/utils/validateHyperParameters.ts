import { OptimizerType, HyperParameters } from './types';

/**
 * 入力ハイパーパラメータが妥当かチェック。不正ならエラー内容を返す
 */
export function validateHyperParameters(type: OptimizerType, params: HyperParameters): string | null {
  // eta(学習率)など負値不可、rhoなど0〜1のみ許容
  switch (type) {
    case 'gd':
    case 'clip':
    case 'momentum':
    case 'nesterov':
    case 'adagrad':
    case 'rmsprop':
    case 'adam':
      if (params.eta !== undefined && (params.eta <= 0 || params.eta > 1)) return '学習率ηは0より大きく1以下にしてください';
      break;
  }
  if (type === 'clip' && params.g0 !== undefined && params.g0 <= 0) return 'クリップ値g0は0より大きい値にしてください';
  if ((type === 'momentum' || type === 'nesterov') && (params.mu < 0 || params.mu >= 1)) return 'モーメンタム係数μは0以上1未満';
  if ((type === 'rmsprop' || type === 'adadelta') && (params.rho < 0 || params.rho >= 1)) return 'ρは0以上1未満';
  if (type === 'adam') {
    if (params.rho1 < 0 || params.rho1 >= 1) return 'ρ1は0以上1未満';
    if (params.rho2 < 0 || params.rho2 >= 1) return 'ρ2は0以上1未満';
  }
  return null;
}
