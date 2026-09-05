// app/simulators/machine-learning/Problems-of-gradient-descent-method/SimulationControls.tsx

import React, { useRef, useEffect } from 'react';
import { SimulationState } from './utils/types';
import { DIVERGENCE_LIMIT } from './utils/optimizerStep';

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

  const currentW = state.steps[state.steps.length - 1]?.w ?? 0;
  const diverged = !Number.isFinite(currentW) || Math.abs(currentW) > DIVERGENCE_LIMIT;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="rounded bg-blue-700 px-3 py-1.5 text-sm text-white shadow hover:bg-blue-800"
        onClick={handleStep}
      >次へ</button>
      <button
        className="rounded bg-fg/10 px-3 py-1.5 text-sm text-fg hover:bg-fg/15"
        onClick={handleBack}
        disabled={state.step === 0}
      >戻る</button>
      {state.running ? (
        <button
          className="rounded bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-800"
          onClick={handlePause}
        >停止</button>
      ) : (
        <button
          className="rounded bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-800"
          onClick={handlePlay}
        >再生</button>
      )}
      <button
        className="rounded bg-slate-600 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
        onClick={handleReset}
      >リセット</button>
      <span className="ml-auto text-sm text-muted">Step: {state.step}</span>
      {diverged && (
        <p className="w-full text-xs text-red-600 dark:text-red-400">
          w が発散したため自動再生を停止しました。学習率を下げるかリセットしてください。
        </p>
      )}
    </div>
  );
}
