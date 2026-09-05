// app/simulators/machine-learning/Problems-of-gradient-descent-method/OptimizerSelector.tsx

import React from 'react';
import { SelectField } from '@/src/components/ui/SelectField';
import { OptimizerType } from './utils/types';
import { getOptimizerList } from './utils/optimizers';

type Props = {
  selected: OptimizerType;
  onChange: (value: OptimizerType) => void;
};

export default function OptimizerSelector({ selected, onChange }: Props) {
  const list = getOptimizerList();
  return (
    <SelectField
      label="最適化アルゴリズム"
      value={selected}
      options={list.map((item) => ({ value: item.type, label: item.name }))}
      onValueChange={onChange}
      hint={list.find((item) => item.type === selected)?.description}
    />
  );
}
