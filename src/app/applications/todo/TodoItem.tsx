// src/app/applications/todo/TodoItem.tsx
'use client';

import { Check, StickyNote } from 'lucide-react';
import { startTodoDrag } from './dnd';
import { daysUntil, parseLocalDate } from './tree';
import type { Todo } from './types';

interface TodoItemProps {
  todo: Todo;
  toggleTodo: (id: number) => void;
  editTodo: (todo: Todo) => void;
  onTagClick: (tag: string) => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function DueBadge({ dueDate, completed }: { dueDate: string; completed: boolean }) {
  const days = daysUntil(dueDate);
  const date = parseLocalDate(dueDate);
  const label = `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAYS[date.getDay()]})`;
  const text = days === 0 ? '今日' : days === 1 ? '明日' : label;

  const tone = completed
    ? 'text-muted'
    : days < 0
      ? 'bg-red-500/10 text-red-700 dark:text-red-300'
      : days <= 1
        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
        : 'text-muted';

  return (
    <span className={`whitespace-nowrap rounded px-1.5 text-xs leading-5 tabular-nums ${tone}`} title={`期限: ${label}`}>
      {!completed && days < 0 ? `期限切れ ${label}` : text}
    </span>
  );
}

export default function TodoItem({ todo, toggleTodo, editTodo, onTagClick }: TodoItemProps) {
  return (
    <div
      draggable
      onDragStart={e => startTodoDrag(e, todo.id)}
      onClick={() => editTodo(todo)}
      className="group flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-surface"
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
        title={todo.completed ? '未完了に戻す' : '完了にする'}
        onClick={e => { e.stopPropagation(); toggleTodo(todo.id); }}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          todo.completed
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-muted/50 hover:border-emerald-500 hover:bg-emerald-500/10'
        }`}
      >
        {todo.completed && <Check size={12} strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`break-words ${todo.completed ? 'text-muted line-through' : 'text-fg'}`}>
            {todo.todoName}
          </span>
          {todo.note && todo.completed && <StickyNote size={13} className="shrink-0 text-muted" aria-label="メモあり" />}
          {todo.dueDate && <DueBadge dueDate={todo.dueDate} completed={todo.completed} />}
          {todo.tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={e => { e.stopPropagation(); onTagClick(tag); }}
              className="rounded-full bg-accent/10 px-2 text-xs leading-5 text-accent hover:bg-accent/20"
              title={`タグ「${tag}」で検索`}
            >
              #{tag}
            </button>
          ))}
        </div>
        {todo.note && !todo.completed && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{todo.note}</p>
        )}
      </div>
    </div>
  );
}
