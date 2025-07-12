// app/simulators/machine-learning/Problems-of-gradient-descent-method/HyperParameterInputs.tsx

import React from 'react';
import { SimulationState } from './utils/types';
import { getDefaultHyperParameters } from './utils/hyperParameters';

type Props = {
  state: SimulationState;
  dispatch: React.Dispatch<any>;
};

const hyperParamLabels: Record<string, string> = {
  eta: '学習率 η',
  g0: '勾配グリップ上限 g₀',
  mu: 'モーメンタム係数 μ',
  rho: '減衰率 ρ',
  rho1: '平均減衰率 ρ₁',
  rho2: '分散減衰率 ρ₂',
  eps: 'ε（微小値）',
};

export default function HyperParameterInputs({ state, dispatch }: Props) {
  const params = state.hyperParameters;
  // 選択中の最適化法のデフォルトパラメータを参考に表示すべき項目を決定
  const defaultParams = getDefaultHyperParameters(state.optimizer);

  const handleChange = (key: string, value: string) => {
    // 数値に変換してdispatch
    const num = Number(value);
    if (!isNaN(num)) {
      dispatch({ type: 'SET_HYPERPARAMETERS', hyperParameters: { [key]: num } });
    }
  };

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-1">ハイパーパラメータ設定</label>
      <div className="flex flex-wrap gap-4">
        {Object.keys(defaultParams).map(key => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm">
              {hyperParamLabels[key] || key}
            </label>
            <input
              type="number"
              step="any"
              min={key === 'eta' || key === 'g0' || key === 'eps' ? '0' : undefined}
              max={key.startsWith('rho') || key === 'mu' ? '1' : undefined}
              className="rounded border px-2 py-1 w-28"
              value={params[key] ?? ''}
              onChange={e => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
