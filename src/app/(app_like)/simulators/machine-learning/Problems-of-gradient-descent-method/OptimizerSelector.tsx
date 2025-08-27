// app/simulators/machine-learning/Problems-of-gradient-descent-method/OptimizerSelector.tsx

import React from 'react';
import { OptimizerType } from './utils/types';
import { getOptimizerList } from './utils/optimizers';

type Props = {
  selected: OptimizerType;
  onChange: (value: OptimizerType) => void;
};

export default function OptimizerSelector({ selected, onChange }: Props) {
  const list = getOptimizerList();
  return (
    <div className="mb-2">
      <div className="font-semibold mb-1">最適化アルゴリズムの選択</div>
      <div className="flex flex-wrap gap-4">
        {list.map((item) => (
          <label key={item.type} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="optimizer"
              value={item.type}
              checked={selected === item.type}
              onChange={() => onChange(item.type)}
              className="accent-green-600"
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {list.find((i) => i.type === selected)?.description}
      </div>
    </div>
  );
}
