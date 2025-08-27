import { OptimizerType, SimulationState, SimulationStep } from './types';
import { gradientFunction, errorFunction } from './errorFunctions';

/**
 * 現在の状態から次のパラメータを計算
 */
export function optimizerStep(state: SimulationState): SimulationStep {
  const last = state.steps[state.steps.length - 1];
  const prev = state.steps.length >= 2 ? state.steps[state.steps.length - 2] : null;
  const { optimizer, hyperParameters, errorFunction: errType } = state;
  const grad = gradientFunction(last.w, errType);

  // アルゴリズムごとに場合分け
  switch (optimizer) {
    case 'gd': {
      const eta = hyperParameters.eta ?? 0.01;
      const deltaW = -eta * grad;
      const wNew = last.w + deltaW;
      return {
        w: wNew,
        error: errorFunction(wNew, errType),
        grad: gradientFunction(wNew, errType),
        deltaW,
      };
    }

    // 2. 勾配クリッピング
    case 'clip': {
      const eta = hyperParameters.eta ?? 0.01;
      const g0 = hyperParameters.g0 ?? 1.0;
      const gradAbs = Math.abs(grad);
      let clippedGrad = grad;
      if (gradAbs > g0) {
        clippedGrad = (grad / gradAbs) * g0;
      }
      const deltaW = -eta * clippedGrad;
      const wNew = last.w + deltaW;
      return {
        w: wNew,
        error: errorFunction(wNew, errType),
        grad: gradientFunction(wNew, errType),
        deltaW,
      };
    }

    // 3. モーメンタム法
    case 'momentum': {
      const eta = hyperParameters.eta ?? 0.01;
      const mu = hyperParameters.mu ?? 0.9;
      const prevDeltaW = prev?.deltaW ?? 0;
      const deltaW = mu * prevDeltaW - (1 - mu) * eta * grad;
      const wNew = last.w + deltaW;
      return {
        w: wNew,
        error: errorFunction(wNew, errType),
        grad: gradientFunction(wNew, errType),
        deltaW,
      };
    }

    // 4. ネステロフ法
    case 'nesterov': {
      const eta = hyperParameters.eta ?? 0.01;
      const mu = hyperParameters.mu ?? 0.9;
      const prevDeltaW = prev?.deltaW ?? 0;
      const lookaheadW = last.w + mu * prevDeltaW;
      const lookaheadGrad = gradientFunction(lookaheadW, errType);
      const deltaW = mu * prevDeltaW - (1 - mu) * eta * lookaheadGrad;
      const wNew = last.w + deltaW;
      return {
        w: wNew,
        error: errorFunction(wNew, errType),
        grad: gradientFunction(wNew, errType),
        deltaW,
      };
    }

    // 5. AdaGrad
    case 'adagrad': {
      const eta = hyperParameters.eta ?? 0.01;
      const eps = hyperParameters.eps ?? 1e-8;
      // 勾配二乗和
      const gradSum2 =
        (last as any).gradSum2 !== undefined
          ? (last as any).gradSum2 + grad * grad
          : grad * grad;
      const deltaW = -eta / Math.sqrt(gradSum2 + eps) * grad;
      const wNew = last.w + deltaW;
      // 型の拡張（gradSum2）を返す
      return {
        w: wNew,
        error: errorFunction(wNew, errType),
        grad: gradientFunction(wNew, errType),
        deltaW,
        gradSum2,
      } as SimulationStep;
    }

    // 6. RMSprop
    case 'rmsprop': {
      const eta = hyperParameters.eta ?? 0.01;
      const rho = hyperParameters.rho ?? 0.9;
      const eps = hyperParameters.eps ?? 1e-8;
      const prev_v = (last as any).v ?? 0;
      const v = rho * prev_v + (1 - rho) * grad * grad;
      const rms = Math.sqrt(v + eps);
      const deltaW = -eta / rms * grad;
      const wNew = last.w + deltaW;
      return {
        w: wNew,
        error: errorFunction(wNew, errType),
        grad: gradientFunction(wNew, errType),
        deltaW,
        v,
      } as SimulationStep;
    }

    // 7. AdaDelta
    case 'adadelta': {
      const rho = hyperParameters.rho ?? 0.95;
      const eps = hyperParameters.eps ?? 1e-6;
      // v:勾配二乗移動平均, u: Δw^2移動平均
      const prev_v = (last as any).v ?? 0;
      const prev_u = (last as any).u ?? 0;
      const v = rho * prev_v + (1 - rho) * grad * grad;
      // RMS[Δw]_{t-1}
      const RMS_u = Math.sqrt(prev_u + eps);
      const RMS_v = Math.sqrt(v + eps);
      const deltaW = -RMS_u / RMS_v * grad;
      const u = rho * prev_u + (1 - rho) * deltaW * deltaW;
      const wNew = last.w + deltaW;
      return {
        w: wNew,
        error: errorFunction(wNew, errType),
        grad: gradientFunction(wNew, errType),
        deltaW,
        v,
        u,
      } as SimulationStep;
    }

    // 8. Adam
    case 'adam': {
      const eta = hyperParameters.eta ?? 0.01;
      const rho1 = hyperParameters.rho1 ?? 0.9;
      const rho2 = hyperParameters.rho2 ?? 0.999;
      const eps = hyperParameters.eps ?? 1e-8;

      const prev_m = (last as any).m ?? 0;
      const prev_v = (last as any).v ?? 0;
      const t = state.step + 1; // 1-indexed

      const m = rho1 * prev_m + (1 - rho1) * grad;
      const v = rho2 * prev_v + (1 - rho2) * grad * grad;
      const m_hat = m / (1 - Math.pow(rho1, t));
      const v_hat = v / (1 - Math.pow(rho2, t));
      const deltaW = -eta * m_hat / (Math.sqrt(v_hat) + eps);
      const wNew = last.w + deltaW;
      return {
        w: wNew,
        error: errorFunction(wNew, errType),
        grad: gradientFunction(wNew, errType),
        deltaW,
        m,
        v,
      } as SimulationStep;
    }
    
    default:
      return last;
  }
}
