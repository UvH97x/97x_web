import { SimulationState, SimulationStep } from './types';
import { gradientFunction, errorFunction } from './errorFunctions';

/**
 * |w| がこれを超えたら発散とみなす。
 * 例えば鞍点型 + モーメンタム法は停留点を抜けた後 E が下に非有界なので、
 * 放っておくと w が Infinity になりグラフも履歴も壊れる。
 */
export const DIVERGENCE_LIMIT = 20;

/**
 * 現在の状態から次のパラメータを計算
 */
export function optimizerStep(state: SimulationState): SimulationStep {
  const last = state.steps[state.steps.length - 1];
  const { optimizer, hyperParameters, errorFunction: errType } = state;
  const grad = gradientFunction(last.w, errType);
  // last.deltaW は「last に至るために踏んだ変化量」＝ Δw^(t-1)
  const prevDeltaW = last.deltaW;

  /** w の更新量から次のステップを組み立てる */
  const commit = (deltaW: number, carry: Partial<SimulationStep> = {}): SimulationStep => {
    const wNew = last.w + deltaW;
    return {
      w: wNew,
      error: errorFunction(wNew, errType),
      grad: gradientFunction(wNew, errType),
      deltaW,
      ...carry,
    };
  };

  // アルゴリズムごとに場合分け
  switch (optimizer) {
    case 'gd': {
      const eta = hyperParameters.eta ?? 0.01;
      return commit(-eta * grad);
    }

    // 2. 勾配クリッピング
    case 'clip': {
      const eta = hyperParameters.eta ?? 0.01;
      const g0 = hyperParameters.g0 ?? 1.0;
      const gradAbs = Math.abs(grad);
      const clippedGrad = gradAbs > g0 ? (grad / gradAbs) * g0 : grad;
      return commit(-eta * clippedGrad);
    }

    // 3. モーメンタム法
    case 'momentum': {
      const eta = hyperParameters.eta ?? 0.01;
      const mu = hyperParameters.mu ?? 0.9;
      return commit(mu * prevDeltaW - (1 - mu) * eta * grad);
    }

    // 4. ネステロフ法
    case 'nesterov': {
      const eta = hyperParameters.eta ?? 0.01;
      const mu = hyperParameters.mu ?? 0.9;
      const lookaheadGrad = gradientFunction(last.w + mu * prevDeltaW, errType);
      return commit(mu * prevDeltaW - (1 - mu) * eta * lookaheadGrad);
    }

    // 5. AdaGrad
    case 'adagrad': {
      const eta = hyperParameters.eta ?? 0.01;
      const eps = hyperParameters.eps ?? 1e-8;
      // 勾配二乗和
      const gradSum2 = (last.gradSum2 ?? 0) + grad * grad;
      return commit((-eta / Math.sqrt(gradSum2 + eps)) * grad, { gradSum2 });
    }

    // 6. RMSprop
    case 'rmsprop': {
      const eta = hyperParameters.eta ?? 0.01;
      const rho = hyperParameters.rho ?? 0.9;
      const eps = hyperParameters.eps ?? 1e-8;
      const v = rho * (last.v ?? 0) + (1 - rho) * grad * grad;
      return commit((-eta / Math.sqrt(v + eps)) * grad, { v });
    }

    // 7. AdaDelta
    case 'adadelta': {
      const rho = hyperParameters.rho ?? 0.95;
      const eps = hyperParameters.eps ?? 1e-6;
      // v:勾配二乗移動平均, u: Δw^2移動平均
      const prevU = last.u ?? 0;
      const v = rho * (last.v ?? 0) + (1 - rho) * grad * grad;
      // RMS[Δw]_{t-1} / RMS[∇E]_t
      const deltaW = (-Math.sqrt(prevU + eps) / Math.sqrt(v + eps)) * grad;
      const u = rho * prevU + (1 - rho) * deltaW * deltaW;
      return commit(deltaW, { v, u });
    }

    // 8. Adam
    case 'adam': {
      const eta = hyperParameters.eta ?? 0.01;
      const rho1 = hyperParameters.rho1 ?? 0.9;
      const rho2 = hyperParameters.rho2 ?? 0.999;
      const eps = hyperParameters.eps ?? 1e-8;
      const t = state.steps.length; // バイアス補正用。1-indexed

      const m = rho1 * (last.m ?? 0) + (1 - rho1) * grad;
      const v = rho2 * (last.v ?? 0) + (1 - rho2) * grad * grad;
      const mHat = m / (1 - Math.pow(rho1, t));
      const vHat = v / (1 - Math.pow(rho2, t));
      return commit((-eta * mHat) / (Math.sqrt(vHat) + eps), { m, v });
    }

    default:
      return last;
  }
}
