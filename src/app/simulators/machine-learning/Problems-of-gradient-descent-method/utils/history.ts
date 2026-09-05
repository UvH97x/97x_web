import { SimulationState, SimulationStep } from './types';

/**
 * 現在の状態に新しいステップを追加
 */
export function updateHistory(state: SimulationState, newStep: SimulationStep): SimulationState {
  return {
    ...state,
    step: state.step + 1,
    steps: [...state.steps, newStep],
  };
}
