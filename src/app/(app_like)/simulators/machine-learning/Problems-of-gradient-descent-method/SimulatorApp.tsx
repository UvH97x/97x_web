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
import { optimizerStep } from './utils/optimizerStep';
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
      return { ...state, step: state.step + 1, steps: [...state.steps, newStep] };
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
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <TitleSection />

      {/* 2カラムレイアウト */}
      <div className="flex gap-8 min-h-[600px]">
        {/* 左カラム（グラフ2枚、縦並び） */}
        <div className="flex-1 flex flex-col justify-start">
          <MainCanvas state={state} />
        </div>

        {/* 右カラム（コントロール＋履歴、下端揃え＆履歴はスクロール） */}
        <div className="w-[340px] flex flex-col h-full">
          <div>
            <ErrorFunctionSelector
              selected={state.errorFunction}
              onChange={(value) => dispatch({ type: 'SET_ERROR_FUNCTION', errorFunction: value })}
            />
            <OptimizerSelector
              selected={state.optimizer}
              onChange={(value) => dispatch({ type: 'SET_OPTIMIZER', optimizer: value })}
            />
            <HyperParameterInputs state={state} dispatch={dispatch} />
            <SimulationControls state={state} dispatch={dispatch} />
          </div>
          <div className="flex-1 overflow-y-auto mt-2 max-h-[440px] min-h-[220px] border rounded bg-white shadow">
            <ParameterHistoryTimeline state={state} dispatch={dispatch} />
          </div>
        </div>
      </div>
    </div>
  );
}