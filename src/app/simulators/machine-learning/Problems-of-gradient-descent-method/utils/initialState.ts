import { ErrorFunctionType, OptimizerType, SimulationState, SimulationStep } from './types';
import { getDefaultHyperParameters } from './hyperParameters';
import { errorFunction, gradientFunction } from './errorFunctions';

export function generateInitialState(
  errorFunctionType: ErrorFunctionType,
  optimizerType: OptimizerType
): SimulationState {
  const w0 = -4.1415; // 初期パラメータ
  const error0 = errorFunction(w0, errorFunctionType);
  const grad0 = gradientFunction(w0, errorFunctionType);
  const deltaW0 = 0;
  const step0: SimulationStep = { w: w0, error: error0, grad: grad0, deltaW: deltaW0 };

  return {
    step: 0,
    steps: [step0],
    errorFunction: errorFunctionType,
    optimizer: optimizerType,
    hyperParameters: getDefaultHyperParameters(optimizerType),
    running: false,
  };
}