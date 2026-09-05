// app/simulators/machine-learning/Problems-of-gradient-descent-method/ErrorFunctionSelector.tsx

import React from 'react';
import { SelectField } from '@/src/components/ui/SelectField';
import { ErrorFunctionType } from './utils/types';
import { getErrorFunctionList } from './utils/errorFunctions';

type Props = {
  selected: ErrorFunctionType;
  onChange: (value: ErrorFunctionType) => void;
};

export default function ErrorFunctionSelector({ selected, onChange }: Props) {
  const list = getErrorFunctionList();
  return (
    <SelectField
      label="誤差関数"
      value={selected}
      options={list.map((item) => ({ value: item.type, label: item.name }))}
      onValueChange={onChange}
      hint={list.find((item) => item.type === selected)?.description}
    />
  );
}
