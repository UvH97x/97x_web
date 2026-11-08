// src/app/applications/todo/dnd.ts
// タスクをクラスへドラッグして移動するための小さなヘルパー。

import { useState, type DragEvent } from 'react';

export const TODO_DRAG_TYPE = 'application/x-97x-todo-id';

export function startTodoDrag(e: DragEvent, todoId: number) {
  e.dataTransfer.setData(TODO_DRAG_TYPE, String(todoId));
  e.dataTransfer.effectAllowed = 'move';
}

/** ドロップ先にする要素へ渡すハンドラと、ドラッグ中に重なっているかどうか。 */
export function useTodoDrop(onDrop: (todoId: number) => void) {
  const [isOver, setIsOver] = useState(false);
  const accepts = (e: DragEvent) => e.dataTransfer.types.includes(TODO_DRAG_TYPE);

  return {
    isOver,
    dropProps: {
      onDragOver: (e: DragEvent) => {
        if (!accepts(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!isOver) setIsOver(true);
      },
      onDragLeave: (e: DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsOver(false);
      },
      onDrop: (e: DragEvent) => {
        setIsOver(false);
        if (!accepts(e)) return;
        e.preventDefault();
        const id = Number(e.dataTransfer.getData(TODO_DRAG_TYPE));
        if (Number.isFinite(id)) onDrop(id);
      },
    },
  };
}
