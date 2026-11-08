// src/app/applications/todo/colors.ts
// Tailwind はクラス名を静的に検出するので、色ごとのクラス名はここに文字列で列挙する。

export const COLOR_KEYS = ['sky', 'emerald', 'amber', 'rose', 'violet', 'teal', 'orange', 'slate'] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];

export const COLOR_BG: Record<ColorKey, string> = {
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
  slate: 'bg-slate-500',
};

export const COLOR_LABEL: Record<ColorKey, string> = {
  sky: '空',
  emerald: '緑',
  amber: '黄',
  rose: '赤',
  violet: '紫',
  teal: '青緑',
  orange: '橙',
  slate: '灰',
};

export function isColorKey(value: unknown): value is ColorKey {
  return typeof value === 'string' && (COLOR_KEYS as readonly string[]).includes(value);
}
