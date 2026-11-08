// src/app/applications/todo/CategorySidebar.tsx
// クラスのツリー。クリックで絞り込み、タスクをドロップするとそのクラスへ移動する。
'use client';

import { ChevronRight, Inbox, Layers, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { COLOR_BG, type ColorKey } from './colors';
import { useTodoDrop } from './dnd';
import { UNCATEGORIZED, childrenOf, type Count } from './tree';
import type { Category } from './types';

interface SidebarProps {
  categories: Category[];
  counts: Map<string, Count>;
  totalRemaining: number;
  selected: string | null;
  collapsed: Set<string>;
  colorOf: (id: string) => ColorKey | null;
  onSelect: (id: string | null) => void;
  onToggleCollapsed: (id: string) => void;
  onAddCategory: (parentId: string | null) => void;
  onMoveTodo: (todoId: number, categoryId: string | null) => void;
}

function remaining(count: Count | undefined) {
  return count ? count.total - count.done : 0;
}

function Row({ depth, active, icon, label, badge, onClick, onDropTodo, chevron, trailing }: {
  depth: number;
  active: boolean;
  icon: ReactNode;
  label: string;
  badge: number;
  onClick: () => void;
  onDropTodo: (todoId: number) => void;
  chevron?: ReactNode;
  trailing?: ReactNode;
}) {
  const { isOver, dropProps } = useTodoDrop(onDropTodo);
  return (
    <div
      {...dropProps}
      className={`group flex items-center gap-1 rounded-md pr-1 text-sm transition-colors ${
        active ? 'bg-accent/15 font-semibold text-fg' : 'text-muted hover:bg-surface hover:text-fg'
      } ${isOver ? 'ring-2 ring-inset ring-accent/60' : ''}`}
      style={{ paddingLeft: `${depth * 0.85 + 0.25}rem` }}
    >
      <span className="flex w-5 shrink-0 justify-center">{chevron}</span>
      <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left">
        {icon}
        <span className="truncate">{label}</span>
      </button>
      {badge > 0 && <span className="text-xs tabular-nums text-muted">{badge}</span>}
      {trailing}
    </div>
  );
}

export default function CategorySidebar(props: SidebarProps) {
  const { categories, counts, selected, collapsed, colorOf, onSelect, onToggleCollapsed, onAddCategory, onMoveTodo } = props;

  const renderNode = (category: Category, depth: number): ReactNode => {
    const children = childrenOf(categories, category.id);
    const isCollapsed = collapsed.has(category.id);
    const color = colorOf(category.id);
    return (
      <li key={category.id}>
        <Row
          depth={depth}
          active={selected === category.id}
          icon={<span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color ? COLOR_BG[color] : 'bg-border'} ${depth > 0 ? 'opacity-60' : ''}`} />}
          label={category.name}
          badge={remaining(counts.get(category.id))}
          onClick={() => onSelect(category.id)}
          onDropTodo={todoId => onMoveTodo(todoId, category.id)}
          chevron={children.length > 0 && (
            <button
              type="button"
              onClick={() => onToggleCollapsed(category.id)}
              aria-label={isCollapsed ? '開く' : '閉じる'}
              className="rounded p-0.5 hover:bg-border/40"
            >
              <ChevronRight size={14} className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
            </button>
          )}
          trailing={
            <button
              type="button"
              onClick={() => onAddCategory(category.id)}
              title={`「${category.name}」にサブクラスを追加`}
              aria-label={`「${category.name}」にサブクラスを追加`}
              className="rounded p-0.5 text-muted hover:bg-border/40 hover:text-fg md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <Plus size={14} />
            </button>
          }
        />
        {children.length > 0 && !isCollapsed && <ul>{children.map(c => renderNode(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <nav aria-label="クラス" className="flex flex-col gap-1">
      <Row
        depth={0}
        active={selected === null}
        icon={<Layers size={15} className="shrink-0" />}
        label="すべて"
        badge={props.totalRemaining}
        onClick={() => onSelect(null)}
        onDropTodo={() => {}}
      />
      <Row
        depth={0}
        active={selected === UNCATEGORIZED}
        icon={<Inbox size={15} className="shrink-0" />}
        label="未分類"
        badge={remaining(counts.get(UNCATEGORIZED))}
        onClick={() => onSelect(UNCATEGORIZED)}
        onDropTodo={todoId => onMoveTodo(todoId, null)}
      />

      <div className="mt-3 mb-1 px-2 text-xs font-semibold tracking-wide text-muted">クラス</div>
      {categories.length === 0 && <p className="px-2 text-xs text-muted">まだクラスがありません。</p>}
      <ul>{childrenOf(categories, null).map(c => renderNode(c, 0))}</ul>

      <button
        type="button"
        onClick={() => onAddCategory(null)}
        className="mt-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-accent"
      >
        <Plus size={15} /> クラスを追加
      </button>
      <p className="mt-2 hidden px-2 text-xs leading-relaxed text-muted/80 md:block">
        タスクをここへドラッグするとクラスを移動できます。
      </p>
    </nav>
  );
}
