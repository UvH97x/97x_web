import { OptimizerType, HyperParameters } from './types';

/**
 * 最適化法ごとのデフォルトハイパーパラメータ
 *
 * 一般的な推奨値をそのまま使うと、このシミュレータの 1 次元・|w| ≲ 5 というスケールでは
 * 適応的手法（AdaGrad / RMSprop / AdaDelta / Adam）の 1 ステップ幅がおおよそ η 程度に固定されるため、
 * 初期位置 w = -4.14 から問題が起きる領域に着くまで数百〜数千ステップかかってしまう。
 * そこで、どの手法でもおよそ 15〜120 ステップで挙動の違いが見えるよう η（相当の量）を調整した。
 */
export function getDefaultHyperParameters(type: OptimizerType): HyperParameters {
  switch (type) {
    case 'gd':
      // 谷型で 2aη = 2 となり、振動が減衰も発散もせず続く値
      return { eta: 0.1 };
    case 'clip':
      // g0 = 2 は緩斜面の勾配そのもの。壁と谷の内側だけが頭打ちになる
      return { eta: 0.1, g0: 2.0 };
    case 'momentum':
      // μ = 0.99 だと立ち上がりに 1/(1-μ) = 100 ステップかかるので 0.9
      return { eta: 0.1, mu: 0.9 };
    case 'nesterov':
      return { eta: 0.1, mu: 0.9 };
    case 'adagrad':
      // 学習率が単調減少するぶん、他より大きめの η が要る
      return { eta: 0.5, eps: 1e-8 };
    case 'rmsprop':
      return { eta: 0.1, rho: 0.9, eps: 1e-8 };
    case 'adadelta':
      // η を持たない代わりに、初期の歩幅を eps が決める（1e-6 では歩幅 1e-3 で動かない）
      return { rho: 0.95, eps: 1e-3 };
    case 'adam':
      return { eta: 0.1, rho1: 0.9, rho2: 0.999, eps: 1e-8 };
    default:
      return {};
  }
}
