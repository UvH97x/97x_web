// src/app/applications/todo/types.ts

import type { ColorKey } from './colors';

export interface Todo {
  id: number;
  todoName: string;
  completed: boolean;
  /** 期限日 (ローカル日付の YYYY-MM-DD)。タイムゾーンでずれないよう Date ではなく文字列で持つ。 */
  dueDate: string | null;
  tags: string[];
  /** 所属するクラス。null は未分類。 */
  categoryId: string | null;
  note: string;
}

/**
 * タスクを分けるクラス。parentId で木構造を作る（例: 勉強 > 確率論 > …）。
 * 深さに上限は設けない。
 */
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  /** 兄弟間の並び順。小さいほど上。 */
  order: number;
  /** 色は最上位のクラスのものを子孫が引き継ぐ。 */
  color: ColorKey;
}

export type SortOption = 'added' | 'name' | 'dueDate';

export interface UiState {
  /** 絞り込み中のクラス。null はすべて、UNCATEGORIZED は未分類のみ。 */
  selected: string | null;
  collapsed: string[];
  sort: SortOption;
  showCompleted: boolean;
}
