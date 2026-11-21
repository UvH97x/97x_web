'use client';

import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { FLOWS } from './lib/flows';
import type { FlowDef } from './lib/types';

// 分布エクスプローラの DistributionPicker と同じ作り。グラフの系列色と紛れないよう独自の色相を使い、
// テーマのトークンと混ぜてライト・ダークの両方で読めるようにする。
const GROUP = {
  fixed: { label: '固定形状', hue: '#0d9488' },
  parametric: { label: 'パラメトリック', hue: '#7c3aed' },
  spline: { label: 'スプライン', hue: '#c2410c' },
} as const;

const GROUPS = (Object.keys(GROUP) as FlowDef['group'][])
  .map(group => ({ group, items: FLOWS.filter(def => def.group === group) }))
  .filter(entry => entry.items.length > 0)
  .map((entry, index, all) => ({
    ...entry,
    start: all.slice(0, index).reduce((count, earlier) => count + earlier.items.length, 0),
  }));
const OPTIONS = GROUPS.flatMap(entry => entry.items);

function GroupTag({ group }: { group: FlowDef['group'] }) {
  const { label, hue } = GROUP[group];
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

export function FlowPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, OPTIONS.findIndex(def => def.id === value));
  const [active, setActive] = useState(selectedIndex);
  const selected = OPTIONS[selectedIndex];
  const last = OPTIONS.length - 1;

  const show = () => { setActive(selectedIndex); setOpen(true); };
  const choose = (index: number) => { onChange(OPTIONS[index].id); setOpen(false); };

  useEffect(() => {
    if (open) document.getElementById(`${baseId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, baseId]);

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
      <div id={`${baseId}-label`} className="block text-[13px] font-semibold text-fg">変換 g</div>
      <button type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open}
        aria-controls={`${baseId}-list`} aria-labelledby={`${baseId}-label`}
        aria-activedescendant={open ? `${baseId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={onKeyDown} onBlur={() => setOpen(false)}
        className="mt-1 w-full flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg text-left hover:bg-fg/5">
        <GroupTag group={selected.group} />
        <span className="flex-1 truncate">{selected.name}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" className="shrink-0 text-muted">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div id={`${baseId}-list`} role="listbox" aria-labelledby={`${baseId}-label`}
          // ボタンのフォーカスを保ち、クリックが届く前に blur でリストが閉じないようにする。
          onPointerDown={event => event.preventDefault()}
          className="absolute z-20 mt-1 w-full max-h-80 overflow-y-auto rounded-md border border-border bg-bg pb-1 shadow-lg">
          {GROUPS.map(entry => (
            <div key={entry.group} role="group" aria-labelledby={`${baseId}-group-${entry.group}`}>
              <div id={`${baseId}-group-${entry.group}`}
                className="flex items-center gap-2 px-2.5 pt-2.5 pb-1 text-[11px] font-semibold text-muted">
                <GroupTag group={entry.group} />
                <span className="ml-auto font-normal tabular-nums">{entry.items.length}</span>
              </div>
              {entry.items.map((def, offset) => {
                const index = entry.start + offset;
                return (
                  <div key={def.id} id={`${baseId}-${index}`} role="option" aria-selected={index === selectedIndex}
                    onPointerEnter={() => setActive(index)} onClick={() => choose(index)}
                    className={`px-2.5 py-1.5 pl-4 text-sm truncate cursor-pointer ${index === active ? 'bg-fg/10' : ''} ${
                      index === selectedIndex ? 'font-semibold' : ''}`}>
                    {def.name}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
