// app/simulators/machine-learning/Problems-of-gradient-descent-method/ParameterHistoryTimeline.tsx

import React, { useMemo } from 'react';
import { SimulationState } from './utils/types';

type Props = {
  state: SimulationState;
  dispatch: React.Dispatch<any>;
};

/**
 * 表示する行数の上限。
 * 全ステップを行にすると、再生中は 200ms ごとに全行を React が再調整することになり、
 * 数百ステップでアプリ全体が目に見えて重くなる。表示は最新分だけに絞る。
 */
const VISIBLE_ROWS = 100;

/** 桁が極端に離れるので、読みやすい範囲は固定小数点、外れたときだけ指数表記にする。 */
function formatValue(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e5)) return value.toExponential(2);
  return value.toFixed(3);
}

export default function ParameterHistoryTimeline({ state, dispatch }: Props) {
  const total = state.steps.length;
  // 最新の VISIBLE_ROWS 件だけを新しい順に並べる（配列全体のコピーは避ける）
  const rows = useMemo(() => {
    const from = Math.max(0, total - VISIBLE_ROWS);
    return state.steps.slice(from).map((step, i) => ({ index: from + i, step })).reverse();
  }, [state.steps, total]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold">履歴</span>
        <span className="text-xs text-muted">
          {total > VISIBLE_ROWS ? `最新 ${VISIBLE_ROWS} 件 / 全 ${total} 件` : `全 ${total} 件`}
        </span>
      </div>
      <div className="max-h-[45vh] min-h-[140px] flex-1 overflow-y-auto rounded border border-border">
        <table className="min-w-full border-collapse text-right font-mono text-xs tabular-nums">
          <thead className="sticky top-0 bg-bg">
            <tr className="text-muted">
              <th className="border-b border-border px-2 py-1 text-right font-normal">step</th>
              <th className="border-b border-border px-2 py-1 text-right font-normal">w</th>
              <th className="border-b border-border px-2 py-1 text-right font-normal">E(w)</th>
              <th className="border-b border-border px-2 py-1 text-right font-normal">dE/dw</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ index, step }) => (
              <tr
                key={index}
                className={
                  index === state.step
                    ? 'bg-accent/10 font-bold'
                    : 'cursor-pointer hover:bg-accent/5'
                }
                onClick={() => dispatch({ type: 'GOTO_STEP', step: index })}
              >
                <td className="border-b border-border px-2 py-0.5">{index}</td>
                <td className="border-b border-border px-2 py-0.5">{formatValue(step.w)}</td>
                <td className="border-b border-border px-2 py-0.5">{formatValue(step.error)}</td>
                <td className="border-b border-border px-2 py-0.5">{formatValue(step.grad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
