// src/app/applications/todo/TodoList.tsx
// クラスの階層に沿ってタスクを表示する。最上位はカード、二段目以降は折りたたみ見出しとインデント線で表す。
'use client';

import { useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { ChevronRight, FolderPlus, Pencil, Plus } from 'lucide-react';
import { COLOR_BG, type ColorKey } from './colors';
import { useTodoDrop } from './dnd';
import TodoItem from './TodoItem';
import { UNCATEGORIZED, childrenOf, type Count } from './tree';
import type { Category, Todo } from './types';

export interface TreeContext {
  categories: Category[];
  /** クラス ID ごとの、表示対象（検索・完了表示の条件を通った）タスク。並び替え済み。 */
  tasksByCategory: Map<string, Todo[]>;
  /** 子孫を含む全タスクの件数（進捗表示用）。 */
  counts: Map<string, Count>;
  /** 子孫を含む表示対象タスクの件数（検索時に空のクラスを隠す用）。 */
  visibleCounts: Map<string, Count>;
  collapsed: Set<string>;
  searching: boolean;
  colorOf: (id: string) => ColorKey | null;
  toggleCollapsed: (id: string) => void;
  toggleTodo: (id: number) => void;
  editTodo: (todo: Todo) => void;
  addTasks: (names: string[], categoryId: string | null) => void;
  moveTodo: (todoId: number, categoryId: string | null) => void;
  addCategory: (parentId: string | null) => void;
  editCategory: (category: Category) => void;
  onTagClick: (tag: string) => void;
}

function Progress({ count, size }: { count: Count; size: 'lg' | 'sm' }) {
  if (count.total === 0) return null;
  const ratio = count.done / count.total;
  return (
    <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted" title={`${count.done} / ${count.total} 完了`}>
      <span className={`${size === 'lg' ? 'w-20' : 'w-12'} hidden h-1.5 overflow-hidden rounded-full bg-border/60 sm:block`}>
        <span
          className={`block h-full rounded-full ${ratio === 1 ? 'bg-emerald-500' : 'bg-accent/70'}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </span>
      {count.done}/{count.total}
    </span>
  );
}

/** グループ末尾のその場追加欄。Enter で連続追加、複数行を貼り付けると行ごとにタスクにする。 */
function QuickAdd({ onAdd }: { onAdd: (names: string[]) => void }) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState('');

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted transition-colors hover:bg-surface hover:text-accent"
      >
        <Plus size={15} /> タスクを追加
      </button>
    );
  }

  const submit = () => {
    if (!text.trim()) return;
    onAdd([text.trim()]);
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 日本語変換の確定 Enter では追加しない。
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    if (e.key === 'Escape') { setText(''); setActive(false); }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const lines = e.clipboardData.getData('text').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return;
    e.preventDefault();
    onAdd(lines);
    setText('');
  };

  return (
    <div className="px-2 py-1">
      <input
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => { if (!text.trim()) setActive(false); }}
        placeholder="タスク名を入力して Enter（複数行の貼り付けで一括追加・Esc で閉じる）"
        className="w-full rounded-md border !border-accent/50 bg-bg !px-2 !py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}

function IconButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={title}
      aria-label={title}
      className="rounded p-1 text-muted transition hover:bg-surface hover:text-fg md:opacity-0 md:group-hover/header:opacity-100 md:focus-visible:opacity-100"
    >
      {children}
    </button>
  );
}

interface GroupProps {
  /** null は未分類グループ。 */
  category: Category | null;
  depth: number;
  ctx: TreeContext;
}

export function TaskGroup({ category, depth, ctx }: GroupProps) {
  const id = category?.id ?? UNCATEGORIZED;
  const name = category?.name ?? '未分類';
  const categoryId = category?.id ?? null;
  const subcategories = category ? childrenOf(ctx.categories, category.id) : [];
  const tasks = ctx.tasksByCategory.get(id) ?? [];
  const count = ctx.counts.get(id) ?? { total: 0, done: 0 };
  const { isOver, dropProps } = useTodoDrop(todoId => ctx.moveTodo(todoId, categoryId));

  if (ctx.searching && !(ctx.visibleCounts.get(id)?.total)) return null;

  const collapsed = !ctx.searching && ctx.collapsed.has(id);
  const color = category ? ctx.colorOf(category.id) : null;
  const isRoot = depth === 0;

  const chevron = (
    <ChevronRight
      size={isRoot ? 18 : 16}
      className={`shrink-0 text-muted transition-transform ${collapsed ? '' : 'rotate-90'}`}
    />
  );

  const actions = category && (
    <span className="flex items-center">
      <IconButton onClick={() => ctx.addCategory(category.id)} title={`「${name}」にサブクラスを追加`}>
        <FolderPlus size={15} />
      </IconButton>
      <IconButton onClick={() => ctx.editCategory(category)} title={`「${name}」を編集`}>
        <Pencil size={15} />
      </IconButton>
    </span>
  );

  const body = !collapsed && (
    <>
      {tasks.map(todo => (
        <TodoItem key={todo.id} todo={todo} toggleTodo={ctx.toggleTodo} editTodo={ctx.editTodo} onTagClick={ctx.onTagClick} />
      ))}
      {subcategories.map(sub => (
        <TaskGroup key={sub.id} category={sub} depth={depth + 1} ctx={ctx} />
      ))}
      {!ctx.searching && <QuickAdd onAdd={names => ctx.addTasks(names, categoryId)} />}
    </>
  );

  const dropRing = isOver ? 'bg-accent/10 ring-2 ring-inset ring-accent/60' : '';

  if (isRoot) {
    return (
      <section className="relative overflow-hidden rounded-xl border border-border bg-surface/30">
        <span className={`absolute inset-y-0 left-0 w-1 ${color ? COLOR_BG[color] : 'bg-border'}`} aria-hidden />
        <div
          className={`group/header flex cursor-pointer select-none items-center gap-2 py-3 pl-4 pr-3 ${dropRing}`}
          {...dropProps}
          onClick={() => ctx.toggleCollapsed(id)}
          aria-expanded={!collapsed}
        >
          {chevron}
          <h2 className={`min-w-0 flex-1 truncate text-lg font-semibold ${category ? '' : 'text-muted'}`}>{name}</h2>
          {actions}
          <Progress count={count} size="lg" />
        </div>
        {body && <div className="space-y-0.5 pb-2 pl-3 pr-2">{body}</div>}
      </section>
    );
  }

  return (
    <div>
      <div
        className={`group/header flex cursor-pointer select-none items-center gap-1.5 rounded-md px-1 py-1.5 hover:bg-surface ${dropRing}`}
        {...dropProps}
        onClick={() => ctx.toggleCollapsed(id)}
        aria-expanded={!collapsed}
      >
        {chevron}
        <h3 className="min-w-0 flex-1 truncate font-semibold">{name}</h3>
        {actions}
        <Progress count={count} size="sm" />
      </div>
      {body && <div className="ml-[0.9rem] space-y-0.5 border-l border-border pl-2">{body}</div>}
    </div>
  );
}
