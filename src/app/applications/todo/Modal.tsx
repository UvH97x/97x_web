// src/app/applications/todo/Modal.tsx
'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const inputClass =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-fg placeholder:text-muted/70 ' +
  'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent';

export const buttonClass = {
  primary: 'rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/85 transition-colors',
  secondary: 'rounded-md border border-border px-4 py-2 text-sm text-fg hover:bg-surface transition-colors',
  danger: 'rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400 transition-colors',
};

/** PC（細かいポインタ）のときだけ自動フォーカスする。スマホではキーボードが勝手に開くのを避ける。 */
export function prefersAutoFocus(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
}

export function Modal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 親要素が sticky などで重なりの層を作っていると z-index がその中に閉じ込められるので、body 直下に描画する。
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-bg p-5 shadow-xl sm:max-w-lg sm:rounded-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-surface hover:text-fg"
            aria-label="閉じる"
            title="閉じる (Esc)"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
