'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = Omit<ComponentProps<'select'>, 'value' | 'onChange'> & {
  label: ReactNode;
  /** セレクトの下に出す補足。選択中の項目の説明などに使う。 */
  hint?: ReactNode;
  value: T;
  options: readonly Option<T>[];
  onValueChange: (value: T) => void;
};

export function SelectField<T extends string>({
  label, hint, value, options, onValueChange, id, className, ...selectProps
}: Props<T>) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div>
      <label htmlFor={selectId} className="block text-[13px] font-semibold text-fg">{label}</label>
      <select
        {...selectProps}
        className={['mt-1 w-full py-1.5 text-sm', className].filter(Boolean).join(' ')}
        id={selectId}
        value={value}
        onChange={event => onValueChange(event.target.value as T)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs leading-snug text-muted">{hint}</p>}
    </div>
  );
}
