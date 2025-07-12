// app/simulators/machine-learning/Problems-of-gradient-descent-method/ParameterHistoryTimeline.tsx

import React from 'react';
import { SimulationState } from './utils/types';

type Props = {
  state: SimulationState;
  dispatch: React.Dispatch<any>;
};

export default function ParameterHistoryTimeline({ state, dispatch }: Props) {
  // 配列を逆順にして map
  const stepsReversed = [...state.steps].reverse();

  return (
    <div className="mb-6">
      <label className="block font-semibold mb-2">履歴</label>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse min-w-full">
          <thead>
            <tr>
              <th className="px-2 py-1 border-b">step</th>
              <th className="px-2 py-1 border-b">w</th>
              <th className="px-2 py-1 border-b">E(w)</th>
              <th className="px-2 py-1 border-b">dE/dw</th>
            </tr>
          </thead>
          <tbody>
            {stepsReversed.map((step, revIdx) => {
              // 元のstep番号を復元
              const idx = state.steps.length - 1 - revIdx;
              return (
                <tr
                  key={idx}
                  className={
                    idx === state.step
                      ? 'bg-blue-100 font-bold'
                      : 'hover:bg-blue-50 cursor-pointer'
                  }
                  onClick={() => dispatch({ type: 'GOTO_STEP', step: idx })}
                >
                  <td className="px-2 py-1 border-b">{idx}</td>
                  <td className="px-2 py-1 border-b">{step.w.toFixed(4)}</td>
                  <td className="px-2 py-1 border-b">{step.error.toExponential(4)}</td>
                  <td className="px-2 py-1 border-b">{step.grad.toExponential(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}