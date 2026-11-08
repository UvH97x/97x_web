// src/app/applications/todo/storage.ts
// localStorage との読み書き。旧形式（クラスなし・dueDate が ISO 文字列）のデータもここで変換する。

import { COLOR_KEYS, isColorKey } from './colors';
import type { Category, SortOption, Todo, UiState } from './types';

const TODO_KEY = 'todos';
const CATEGORY_KEY = 'todo-categories';
const UI_KEY = 'todo-ui';

export const DEFAULT_UI: UiState = {
  selected: null,
  collapsed: [],
  sort: 'added',
  showCompleted: true,
};

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 容量超過やプライベートモードでは保存できないが、表示は続ける。
  }
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  // 旧形式は new Date('YYYY-MM-DD') を JSON にした 'YYYY-MM-DDT00:00:00.000Z' なので先頭10文字が期限日。
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function normalizeCategories(raw: unknown): Category[] {
  if (!Array.isArray(raw)) return [];
  const categories = raw.flatMap((item, index): Category[] => {
    const r = asRecord(item);
    if (!r || typeof r.id !== 'string' || typeof r.name !== 'string') return [];
    return [{
      id: r.id,
      name: r.name,
      parentId: typeof r.parentId === 'string' ? r.parentId : null,
      order: typeof r.order === 'number' ? r.order : index,
      color: isColorKey(r.color) ? r.color : COLOR_KEYS[index % COLOR_KEYS.length],
    }];
  });
  // 親が消えているクラスは最上位に戻す。
  const ids = new Set(categories.map(c => c.id));
  return categories.map(c => (c.parentId && !ids.has(c.parentId) ? { ...c, parentId: null } : c));
}

function normalizeTodos(raw: unknown, categories: Category[]): Todo[] {
  if (!Array.isArray(raw)) return [];
  const ids = new Set(categories.map(c => c.id));
  return raw.flatMap((item, index): Todo[] => {
    const r = asRecord(item);
    if (!r || typeof r.todoName !== 'string') return [];
    const categoryId = typeof r.categoryId === 'string' && ids.has(r.categoryId) ? r.categoryId : null;
    return [{
      id: typeof r.id === 'number' ? r.id : index,
      todoName: r.todoName,
      completed: Boolean(r.completed),
      dueDate: normalizeDate(r.dueDate),
      tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string') : [],
      categoryId,
      note: typeof r.note === 'string' ? r.note : '',
    }];
  });
}

const SORTS: SortOption[] = ['added', 'name', 'dueDate'];

function normalizeUi(raw: unknown): UiState {
  const r = asRecord(raw);
  if (!r) return DEFAULT_UI;
  return {
    selected: typeof r.selected === 'string' ? r.selected : null,
    collapsed: Array.isArray(r.collapsed) ? r.collapsed.filter((x): x is string => typeof x === 'string') : [],
    sort: SORTS.includes(r.sort as SortOption) ? (r.sort as SortOption) : DEFAULT_UI.sort,
    showCompleted: typeof r.showCompleted === 'boolean' ? r.showCompleted : DEFAULT_UI.showCompleted,
  };
}

export const loadCategories = () => normalizeCategories(readJson(CATEGORY_KEY));
export const loadTodos = (categories: Category[]) => normalizeTodos(readJson(TODO_KEY), categories);
export const loadUi = () => normalizeUi(readJson(UI_KEY));

export const saveTodos = (todos: Todo[]) => writeJson(TODO_KEY, todos);
export const saveCategories = (categories: Category[]) => writeJson(CATEGORY_KEY, categories);
export const saveUi = (ui: UiState) => writeJson(UI_KEY, ui);

// ---- ファイルへの書き出し・読み込み（デバイス間でデータを移すため） ----

const EXPORT_APP = '97x-todo';
const EXPORT_VERSION = 1;

export interface TodoData {
  categories: Category[];
  todos: Todo[];
  ui: UiState;
}

export function serializeData(data: TodoData): string {
  return JSON.stringify(
    { app: EXPORT_APP, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), ...data },
    null,
    2,
  );
}

export function exportFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `todo-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.json`;
}

/**
 * 書き出したファイルの中身を検証して読み込む。形式が違えば日本語のメッセージ付きで例外を投げる。
 * 旧形式（localStorage の 'todos' をそのまま保存したタスクの配列）も受け付ける。
 */
export function parseData(text: string): TodoData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('JSON として読み込めませんでした。');
  }
  if (Array.isArray(raw)) {
    return { categories: [], todos: normalizeTodos(raw, []), ui: DEFAULT_UI };
  }
  const r = asRecord(raw);
  if (!r || r.app !== EXPORT_APP || !Array.isArray(r.categories) || !Array.isArray(r.todos)) {
    throw new Error('この Todo リストから書き出したファイルではありません。');
  }
  if (typeof r.version === 'number' && r.version > EXPORT_VERSION) {
    throw new Error('より新しい版のアプリで書き出されたファイルです。ページを再読み込みしてから試してください。');
  }
  const categories = normalizeCategories(r.categories);
  return { categories, todos: normalizeTodos(r.todos, categories), ui: normalizeUi(r.ui) };
}
