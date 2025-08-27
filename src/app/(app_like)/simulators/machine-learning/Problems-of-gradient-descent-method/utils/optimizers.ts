import { OptimizerType } from './types';

/**
 * 勾配降下法のアルゴリズム一覧
 */
export function getOptimizerList(): { type: OptimizerType; name: string; description: string }[] {
  return [
    { type: 'gd', name: '勾配降下法', description: 'ηのみで更新' },
    { type: 'clip', name: '勾配グリップ', description: '勾配に上限値を設定' },
    { type: 'momentum', name: 'モーメンタム法', description: '前ステップの更新を加味' },
    { type: 'nesterov', name: 'ネステロフ法', description: '予測位置で勾配を計算' },
    { type: 'adagrad', name: 'AdaGrad', description: 'パラメータごとに適応学習率' },
    { type: 'rmsprop', name: 'RMSprop', description: '累積移動平均で適応学習率' },
    { type: 'adadelta', name: 'AdaDelta', description: 'ハイパーパラメータη不要' },
    { type: 'adam', name: 'Adam', description: '平均・分散のバイアス補正' },
  ];
}