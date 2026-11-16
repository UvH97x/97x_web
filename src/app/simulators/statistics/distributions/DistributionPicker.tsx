'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { DISTRIBUTIONS } from './lib/distributions';
import type { DistributionDef } from './lib/types';

// Hues of their own, so the tags are not mistaken for the plot's series colours.
// Mixed with the theme tokens to stay readable in both light and dark themes.
const KIND = {
  continuous: { label: '連続', hue: '#0d9488' },
  discrete: { label: '離散', hue: '#7c3aed' },
} as const;

export function KindTag({ kind }: { kind: DistributionDef['kind'] }) {
  const { label, hue } = KIND[kind];
  return (
    <span className="shrink-0 rounded px-1.5 py-px text-[11px] font-semibold leading-[1.5]"
      style={{
        background: `color-mix(in srgb, ${hue} 20%, transparent)`,
        color: `color-mix(in srgb, ${hue} 65%, rgb(var(--fg)))`,
        border: `1px solid color-mix(in srgb, ${hue} 45%, transparent)`,
      }}>
      {label}
    </span>
  );
}

/** A select-like listbox; native <option> elements cannot carry coloured tags. */
export function DistributionPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, DISTRIBUTIONS.findIndex(def => def.id === value));
  const [active, setActive] = useState(selectedIndex);
  const selected = DISTRIBUTIONS[selectedIndex];
  const last = DISTRIBUTIONS.length - 1;

  const show = () => { setActive(selectedIndex); setOpen(true); };
  const choose = (index: number) => { onChange(DISTRIBUTIONS[index].id); setOpen(false); };

  function onKeyDown(event: KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      if (open) setActive(moves[event.key]); else show();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active); else show();
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div id={`${baseId}-label`} className="block text-[13px] font-semibold text-fg">分布</div>
      <button type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open}
        aria-controls={`${baseId}-list`} aria-labelledby={`${baseId}-label`}
        aria-activedescendant={open ? `${baseId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={onKeyDown} onBlur={() => setOpen(false)}
        className="mt-1 w-full flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg text-left hover:bg-fg/5">
        <KindTag kind={selected.kind} />
        <span className="flex-1 truncate">{selected.name}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" className="shrink-0 text-muted">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul id={`${baseId}-list`} role="listbox" aria-labelledby={`${baseId}-label`}
          className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-md border border-border bg-bg py-1 shadow-lg list-none m-0 pl-0">
          {DISTRIBUTIONS.map((def, index) => (
            <li key={def.id} id={`${baseId}-${index}`} role="option" aria-selected={index === selectedIndex}
              // Keep focus on the button so that its blur handler does not close the list before the click lands.
              onPointerDown={event => event.preventDefault()}
              onPointerEnter={() => setActive(index)} onClick={() => choose(index)}
              className={`flex items-center gap-2 px-2.5 py-1.5 text-sm cursor-pointer ${index === active ? 'bg-fg/10' : ''} ${
                index === selectedIndex ? 'font-semibold' : ''}`}>
              <KindTag kind={def.kind} />
              <span className="flex-1 truncate">{def.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
