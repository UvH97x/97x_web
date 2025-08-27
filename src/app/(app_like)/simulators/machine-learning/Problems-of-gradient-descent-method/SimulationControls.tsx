// app/simulators/machine-learning/Problems-of-gradient-descent-method/SimulationControls.tsx

import React, { useRef, useEffect } from 'react';
import { SimulationState } from './utils/types';

type Props = {
  state: SimulationState;
  dispatch: React.Dispatch<any>;
};

export default function SimulationControls({ state, dispatch }: Props) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 「再生」ボタンを押したら running=true にするだけ
  const handlePlay = () => {
    dispatch({ type: 'RUNNING', running: true });
  };

  // 「停止」ボタンを押したら running=false にするだけ
  const handlePause = () => {
    dispatch({ type: 'RUNNING', running: false });
  };

  const handleReset = () => {
    dispatch({
      type: 'RESET',
      errorFunction: state.errorFunction,
      optimizer: state.optimizer,
    });
  };
  const handleBack = () => dispatch({ type: 'BACK' });
  const handleStep = () => dispatch({ type: 'STEP' });

  // runningフラグを監視して interval を開始/終了
  useEffect(() => {
    if (state.running && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'STEP' });
      }, 200);
    }
    if (!state.running && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // アンマウント時もクリア
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.running, dispatch]);

  return (
    <div className="flex gap-3 mb-6 items-center">
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700"
        onClick={handleStep}
      >次へ</button>
      <button
        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        onClick={handleBack}
        disabled={state.step === 0}
      >戻る</button>
      {state.running ? (
        <button
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          onClick={handlePause}
        >停止</button>
      ) : (
        <button
          className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
          onClick={handlePlay}
        >再生</button>
      )}
      <button
        className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
        onClick={handleReset}
      >リセット</button>
      <span className="ml-2 text-gray-600 text-sm">Step: {state.step}</span>
    </div>
  );
}
