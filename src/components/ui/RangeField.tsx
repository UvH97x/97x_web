'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';

type Props = Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
  label: ReactNode;
  sublabel?: string;
  display?: ReactNode;
  value: number;
  onValueChange: (value: number) => void;
  layout?: 'inline' | 'stacked' | 'detailed';
};

/** Values use the native range scale; callers own unit/log conversions and formatting. */
export function RangeField({
  label, sublabel, display, value, onValueChange, layout = 'inline', id, ...inputProps
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const detailed = layout === 'detailed';

  return (
    <div className={detailed ? 'mb-[15px]' : undefined}>
      {detailed ? (
        <div className="flex justify-between items-baseline mb-1.5">
          <label htmlFor={inputId} className="text-[13px] text-fg">
            {label}{' '}
            <span className="text-muted">{sublabel}</span>
          </label>
          <span className="font-mono text-[13px] text-accent">{display}</span>
        </div>
      ) : (
        <label htmlFor={inputId} className="block font-semibold">{label}</label>
      )}
      <input
        {...inputProps}
        id={inputId}
        type="range"
        value={value}
        onChange={event => onValueChange(Number(event.target.value))}
      />
      {layout === 'inline' && <span className="ml-2">{display}</span>}
    </div>
  );
}
