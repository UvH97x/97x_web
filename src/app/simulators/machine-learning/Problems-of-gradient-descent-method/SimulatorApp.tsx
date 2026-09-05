// app/simulators/machine-learning/Problems-of-gradient-descent-method/SimulatorApp.tsx
'use client';

import TitleSection from './TitleSection';
import ErrorFunctionSelector from './ErrorFunctionSelector';
import OptimizerSelector from './OptimizerSelector';
import HyperParameterInputs from './HyperParameterInputs';
import SimulationControls from './SimulationControls';
import MainCanvas from './MainCanvas';
import ParameterHistoryTimeline from './ParameterHistoryTimeline';

import React, { useReducer } from 'react';
import { ErrorFunctionType, OptimizerType, SimulationState } from './utils/types';
import { generateInitialState } from './utils/initialState';
import { DIVERGENCE_LIMIT, optimizerStep } from './utils/optimizerStep';
type Action =
  | { type: 'RESET'; errorFunction: ErrorFunctionType; optimizer: OptimizerType }
  | { type: 'SET_ERROR_FUNCTION'; errorFunction: ErrorFunctionType }
  | { type: 'SET_OPTIMIZER'; optimizer: OptimizerType }
  | { type: 'SET_HYPERPARAMETERS'; hyperParameters: Record<string, number> }
  | { type: 'STEP' }
  | { type: 'BACK' }
  | { type: 'RUNNING'; running: boolean }
  | { type: 'RESET_HISTORY' }
  | { type: 'GOTO_STEP'; step: number };

function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'RESET':
      return generateInitialState(action.errorFunction, action.optimizer);
    case 'SET_ERROR_FUNCTION':
      // 誤差関数切り替えで履歴もリセット
      return generateInitialState(action.errorFunction, state.optimizer);
    case 'SET_OPTIMIZER':
      return generateInitialState(state.errorFunction, action.optimizer);
    case 'SET_HYPERPARAMETERS':
      return { ...state, hyperParameters: { ...state.hyperParameters, ...action.hyperParameters } };
    case 'STEP': {
      const newStep = optimizerStep(state);
      // 数値が壊れたら履歴に積まない（再生中なら止める）
      if (!Number.isFinite(newStep.w) || !Number.isFinite(newStep.error)) {
        return state.running ? { ...state, running: false } : state;
      }
      return {
        ...state,
        step: state.step + 1,
        steps: [...state.steps, newStep],
        running: state.running && Math.abs(newStep.w) <= DIVERGENCE_LIMIT,
      };
    }
    case 'BACK': {
      if (state.step === 0) return state;
      return { ...state, step: state.step - 1, steps: state.steps.slice(0, -1) };
    }
    case 'RUNNING':
      return { ...state, running: action.running };
    case 'RESET_HISTORY':
      return { ...state, steps: state.steps.slice(0, 1), step: 0 };
    case 'GOTO_STEP': {
      if (action.step < 0 || action.step >= state.steps.length) return state;
      return { ...state, step: action.step };
    }
    default:
      return state;
  }
}

const DEFAULT_ERROR_FUNCTION: ErrorFunctionType = 'flat';
const DEFAULT_OPTIMIZER: OptimizerType = 'gd';

export default function SimulatorApp() {
  const [state, dispatch] = useReducer(
    reducer,
    generateInitialState(DEFAULT_ERROR_FUNCTION, DEFAULT_OPTIMIZER)
  );

  return (
    <div>
      <TitleSection />

      {/* 2カラムレイアウト（左: 誤差曲線と勾配曲線を重ねた1枚のグラフ / 右: 操作と履歴） */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <MainCanvas state={state} />
        </div>

        {/* 右カラム: 高さをグラフに揃え、あふれる履歴だけを内部スクロールさせる */}
        <div className="flex min-w-0 flex-col gap-3 xl:h-[clamp(340px,62vh,620px)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ErrorFunctionSelector
              selected={state.errorFunction}
              onChange={(value) => dispatch({ type: 'SET_ERROR_FUNCTION', errorFunction: value })}
            />
            <OptimizerSelector
              selected={state.optimizer}
              onChange={(value) => dispatch({ type: 'SET_OPTIMIZER', optimizer: value })}
            />
          </div>
          <HyperParameterInputs state={state} dispatch={dispatch} />
          <SimulationControls state={state} dispatch={dispatch} />
          <ParameterHistoryTimeline state={state} dispatch={dispatch} />
        </div>
      </div>
    </div>
  );
}
