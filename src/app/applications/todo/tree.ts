// src/app/applications/todo/tree.ts
// クラスの木構造とタスクの並び替えに関する純粋関数。

import type { Category, SortOption, Todo } from './types';
import type { ColorKey } from './colors';

/** 未分類を表す擬似クラス ID。 */
export const UNCATEGORIZED = '__uncategorized__';

const byOrder = (a: Category, b: Category) => a.order - b.order;

export function childrenOf(categories: Category[], parentId: string | null): Category[] {
  return categories.filter(c => c.parentId === parentId).sort(byOrder);
}

/** id 自身とその子孫すべての ID。 */
export function subtreeIds(categories: Category[], id: string): Set<string> {
  const ids = new Set([id]);
  let added = true;
  while (added) {
    added = false;
    for (const c of categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        added = true;
      }
    }
  }
  return ids;
}

/** 最上位から id までのクラス列。 */
export function pathOf(categories: Category[], id: string | null): Category[] {
  const byId = new Map(categories.map(c => [c.id, c]));
  const path: Category[] = [];
  const seen = new Set<string>();
  let current = id ? byId.get(id) : undefined;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}

export function colorOf(categories: Category[], id: string | null): ColorKey | null {
  return pathOf(categories, id)[0]?.color ?? null;
}

/** セレクトボックス用に木を深さ付きで平らにする。exclude の部分木は除く。 */
export function flatten(
  categories: Category[],
  exclude?: Set<string>,
  parentId: string | null = null,
  depth = 0,
): { category: Category; depth: number }[] {
  return childrenOf(categories, parentId)
    .filter(c => !exclude?.has(c.id))
    .flatMap(c => [{ category: c, depth }, ...flatten(categories, exclude, c.id, depth + 1)]);
}

export function nextOrder(categories: Category[], parentId: string | null): number {
  const siblings = categories.filter(c => c.parentId === parentId);
  return siblings.length ? Math.max(...siblings.map(c => c.order)) + 1 : 0;
}

export interface Count {
  total: number;
  done: number;
}

/** クラスごとの、子孫クラスを含めたタスク数。未分類は UNCATEGORIZED に入る。 */
export function countByCategory(categories: Category[], todos: Todo[]): Map<string, Count> {
  const parentOf = new Map(categories.map(c => [c.id, c.parentId]));
  const counts = new Map<string, Count>();
  const bump = (id: string, done: boolean) => {
    const count = counts.get(id) ?? { total: 0, done: 0 };
    count.total += 1;
    if (done) count.done += 1;
    counts.set(id, count);
  };
  for (const todo of todos) {
    if (!todo.categoryId || !parentOf.has(todo.categoryId)) {
      bump(UNCATEGORIZED, todo.completed);
      continue;
    }
    const seen = new Set<string>();
    let id: string | null | undefined = todo.categoryId;
    while (id && !seen.has(id)) {
      seen.add(id);
      bump(id, todo.completed);
      id = parentOf.get(id);
    }
  }
  return counts;
}

/** ローカル日付の YYYY-MM-DD を Date に。 */
export function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 今日から期限日までの日数。過ぎていれば負。 */
export function daysUntil(dueDate: string, now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parseLocalDate(dueDate).getTime() - today.getTime()) / 86_400_000);
}

const collator = new Intl.Collator('ja', { numeric: true, sensitivity: 'base' });

/** 未完了を先に、その中で指定の順に並べる。名前順は「1.2節」<「1.10節」となる数値順。 */
export function sortTodos(todos: Todo[], sort: SortOption): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    switch (sort) {
      case 'name':
        return collator.compare(a.todoName, b.todoName);
      case 'dueDate':
        if (a.dueDate !== b.dueDate) {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate < b.dueDate ? -1 : 1;
        }
        return a.id - b.id;
      case 'added':
      default:
        return a.id - b.id;
    }
  });
}

export function matchesQuery(todo: Todo, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    todo.todoName.toLowerCase().includes(q) ||
    todo.note.toLowerCase().includes(q) ||
    todo.tags.some(tag => tag.toLowerCase().includes(q))
  );
}
