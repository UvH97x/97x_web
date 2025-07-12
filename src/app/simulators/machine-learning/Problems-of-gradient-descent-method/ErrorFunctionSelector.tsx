// app/simulators/machine-learning/Problems-of-gradient-descent-method/ErrorFunctionSelector.tsx

import React from 'react';
import { ErrorFunctionType } from './utils/types';
import { getErrorFunctionList } from './utils/errorFunctions';

type Props = {
  selected: ErrorFunctionType;
  onChange: (value: ErrorFunctionType) => void;
};

export default function ErrorFunctionSelector({ selected, onChange }: Props) {
  const list = getErrorFunctionList();
  return (
    <div className="mb-2">
      <div className="font-semibold mb-1">誤差関数の選択</div>
      <div className="flex flex-wrap gap-4">
        {list.map((item) => (
          <label key={item.type} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="error-function"
              value={item.type}
              checked={selected === item.type}
              onChange={() => onChange(item.type)}
              className="accent-blue-500"
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
