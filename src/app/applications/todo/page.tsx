'use client';

// src/app/applications/todo/page.tsx
// クラス（業務 > Web管理 > … のような多段階の分類）でタスクを整理する Todo リスト。データは localStorage に保存する。
// [ ]:タスクの種類を増やして、例えば複数回完了できる(定期的に未完了になり、完了した回数がカウントされる)やつとかあるといいね。

import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, FolderPlus, Plus, Search, X } from 'lucide-react';
import { PageHeader } from '@/src/components/ui/PageHeader';
import CategoryForm, { type CategoryInput } from './CategoryForm';
import CategorySidebar from './CategorySidebar';
import DataTransfer from './DataTransfer';
import { COLOR_KEYS } from './colors';
import EditForm, { type TodoInput } from './EditForm';
import { buttonClass } from './Modal';
import {
  DEFAULT_UI, loadCategories, loadTodos, loadUi, saveCategories, saveTodos, saveUi, type TodoData,
} from './storage';
import { TaskGroup, type TreeContext } from './TodoList';
import {
  UNCATEGORIZED, childrenOf, colorOf, countByCategory, matchesQuery, nextOrder, pathOf, sortTodos,
} from './tree';
import type { Category, SortOption, Todo, UiState } from './types';

type TaskDraft = { todo: Todo | null; categoryId: string | null };
type CategoryDraft = { category: Category | null; parentId: string | null };

/** 初めて使うとき用のサンプル。 */
const SAMPLE: { name: string; children: string[] }[] = [
  { name: '業務', children: ['Web管理', '計算機管理'] },
  { name: '研究', children: [] },
  { name: '勉強', children: ['ルベーグ積分入門', '確率論', '場の量子論'] },
];

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ui, setUi] = useState<UiState>(DEFAULT_UI);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  // localStorage はブラウザにしかないので、マウント後に読み込む。
  useEffect(() => {
    const loadedCategories = loadCategories();
    setCategories(loadedCategories);
    setTodos(loadTodos(loadedCategories));
    setUi(loadUi());
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) saveTodos(todos); }, [todos, loaded]);
  useEffect(() => { if (loaded) saveCategories(categories); }, [categories, loaded]);
  useEffect(() => { if (loaded) saveUi(ui); }, [ui, loaded]);

  // 削除などで存在しなくなったクラスを選んでいたら「すべて」に戻す。
  const selected =
    ui.selected === null || ui.selected === UNCATEGORIZED || categories.some(c => c.id === ui.selected)
      ? ui.selected
      : null;

  const collapsed = useMemo(() => new Set(ui.collapsed), [ui.collapsed]);
  const counts = useMemo(() => countByCategory(categories, todos), [categories, todos]);
  const categoryIds = useMemo(() => new Set(categories.map(c => c.id)), [categories]);

  const visibleTodos = useMemo(
    () => todos.filter(t => (ui.showCompleted || !t.completed) && matchesQuery(t, query)),
    [todos, ui.showCompleted, query],
  );
  const visibleCounts = useMemo(() => countByCategory(categories, visibleTodos), [categories, visibleTodos]);
  const tasksByCategory = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const todo of visibleTodos) {
      const key = todo.categoryId && categoryIds.has(todo.categoryId) ? todo.categoryId : UNCATEGORIZED;
      map.set(key, [...(map.get(key) ?? []), todo]);
    }
    for (const [key, list] of map) map.set(key, sortTodos(list, ui.sort));
    return map;
  }, [visibleTodos, categoryIds, ui.sort]);

  const colorOfId = useCallback((id: string) => colorOf(categories, id), [categories]);
  const updateUi = (patch: Partial<UiState>) => setUi(prev => ({ ...prev, ...patch }));

  // ---- タスク操作 ----
  const newIds = (n: number) => {
    // 同じミリ秒に複数追加しても衝突しないよう、既存の最大値より大きい値から振る。
    const start = Math.max(Date.now(), ...todos.map(t => t.id + 1));
    return Array.from({ length: n }, (_, i) => start + i);
  };

  const addTasks = (names: string[], categoryId: string | null) => {
    const ids = newIds(names.length);
    setTodos(prev => [
      ...prev,
      ...names.map((todoName, i) => ({
        id: ids[i], todoName, completed: false, dueDate: null, tags: [], categoryId, note: '',
      })),
    ]);
  };

  const saveTask = (input: TodoInput) => {
    const editing = taskDraft?.todo;
    if (editing) {
      setTodos(prev => prev.map(t => (t.id === editing.id ? { ...t, ...input } : t)));
    } else {
      const [id] = newIds(1);
      setTodos(prev => [...prev, { id, completed: false, ...input }]);
    }
    setTaskDraft(null);
  };

  const toggleTodo = (id: number) =>
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTodo = (todo: Todo) => {
    setTodos(prev => prev.filter(t => t.id !== todo.id));
    setTaskDraft(null);
  };

  const moveTodo = (todoId: number, categoryId: string | null) =>
    setTodos(prev => prev.map(t => (t.id === todoId ? { ...t, categoryId } : t)));

  // ---- クラス操作 ----
  const saveCategory = (input: CategoryInput) => {
    const editing = categoryDraft?.category;
    if (editing) {
      setCategories(prev => prev.map(c => {
        if (c.id !== editing.id) return c;
        const order = c.parentId === input.parentId ? c.order : nextOrder(prev, input.parentId);
        return { ...c, ...input, order };
      }));
    } else {
      const category: Category = { id: uuidv4(), ...input, order: nextOrder(categories, input.parentId) };
      setCategories(prev => [...prev, category]);
      // 親が折りたたまれていると追加したことが見えないので開く。
      if (input.parentId) updateUi({ collapsed: ui.collapsed.filter(id => id !== input.parentId) });
    }
    setCategoryDraft(null);
  };

  const deleteCategory = (category: Category) => {
    // 中身は消さずに、ひとつ上へ移す。
    setCategories(prev => prev
      .filter(c => c.id !== category.id)
      .map(c => (c.parentId === category.id ? { ...c, parentId: category.parentId, order: c.order + 1000 } : c)));
    setTodos(prev => prev.map(t => (t.categoryId === category.id ? { ...t, categoryId: category.parentId } : t)));
    setCategoryDraft(null);
  };

  const moveCategory = (category: Category, direction: -1 | 1) => {
    setCategories(prev => {
      // フォームが持つ category は古いことがあるので、最新の状態から引き直す。
      const current = prev.find(c => c.id === category.id);
      if (!current) return prev;
      const siblings = childrenOf(prev, current.parentId);
      const target = siblings[siblings.findIndex(c => c.id === current.id) + direction];
      if (!target) return prev;
      // order が重複していても確実に入れ替わるよう、兄弟全体を振り直す。
      const reordered = siblings.map(c => c.id);
      const i = reordered.indexOf(current.id);
      [reordered[i], reordered[i + direction]] = [reordered[i + direction], reordered[i]];
      const orderOf = new Map(reordered.map((id, index) => [id, index]));
      return prev.map(c => (orderOf.has(c.id) ? { ...c, order: orderOf.get(c.id)! } : c));
    });
  };

  const createSample = () => {
    const created: Category[] = [];
    SAMPLE.forEach((root, i) => {
      const rootId = uuidv4();
      created.push({ id: rootId, name: root.name, parentId: null, order: i, color: COLOR_KEYS[i % COLOR_KEYS.length] });
      root.children.forEach((name, j) =>
        created.push({ id: uuidv4(), name, parentId: rootId, order: j, color: COLOR_KEYS[i % COLOR_KEYS.length] }));
    });
    setCategories(created);
  };

  /** ファイルの内容で現在のデータを丸ごと置き換える（確認は DataTransfer 側で済ませている）。 */
  const importData = (data: TodoData) => {
    setCategories(data.categories);
    setTodos(data.todos);
    setUi(data.ui);
    setQuery('');
    setTaskDraft(null);
    setCategoryDraft(null);
  };

  const toggleCollapsed = (id: string) =>
    updateUi({ collapsed: collapsed.has(id) ? ui.collapsed.filter(x => x !== id) : [...ui.collapsed, id] });

  const selectCategory = (id: string | null) => {
    updateUi({ selected: id });
    setNavOpen(false);
  };

  // ---- 表示 ----
  const ctx: TreeContext = {
    categories,
    tasksByCategory,
    counts,
    visibleCounts,
    collapsed,
    searching: query.trim() !== '',
    colorOf: colorOfId,
    toggleCollapsed,
    toggleTodo,
    editTodo: todo => setTaskDraft({ todo, categoryId: todo.categoryId }),
    addTasks,
    moveTodo,
    addCategory: parentId => setCategoryDraft({ category: null, parentId }),
    editCategory: category => setCategoryDraft({ category, parentId: category.parentId }),
    onTagClick: tag => setQuery(tag),
  };

  const totalRemaining = todos.filter(t => !t.completed).length;
  const selectedPath = selected && selected !== UNCATEGORIZED ? pathOf(categories, selected) : [];
  const selectedLabel = selected === null ? 'すべて' : selected === UNCATEGORIZED ? '未分類' : selectedPath.at(-1)?.name ?? '';
  const defaultTaskCategory = selected && selected !== UNCATEGORIZED ? selected : null;

  // 「すべて」では最上位のクラスを並べ、未分類はタスクがあるときだけ末尾に出す。
  const roots: (Category | null)[] =
    selected === null
      ? [...childrenOf(categories, null), ...(counts.get(UNCATEGORIZED) || categories.length === 0 ? [null] : [])]
      : selected === UNCATEGORIZED
        ? [null]
        : selectedPath.length ? [selectedPath[selectedPath.length - 1]] : [];

  const allGroupIds = [UNCATEGORIZED, ...categories.map(c => c.id)];
  const allCollapsed = categories.length > 0 && categories.every(c => collapsed.has(c.id));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader description="クラス（例: 勉強 › 確率論 › 1.1節）ごとにタスクを整理できます。データはこのブラウザに保存されます。">
        Todo List
      </PageHeader>

      {!loaded ? (
        <p className="text-muted">読み込み中…</p>
      ) : (
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
          {/* クラスツリー */}
          <aside className="mb-4 lg:mb-0">
            <button
              type="button"
              onClick={() => setNavOpen(open => !open)}
              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm lg:hidden"
              aria-expanded={navOpen}
            >
              <span><span className="text-muted">クラス:</span> <span className="font-semibold">{selectedLabel}</span></span>
              <ChevronDown size={16} className={`transition-transform ${navOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`${navOpen ? 'block' : 'hidden'} mt-2 rounded-lg border border-border p-2 lg:sticky lg:top-20 lg:mt-0 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:border-0 lg:p-0`}>
              <CategorySidebar
                categories={categories}
                counts={counts}
                totalRemaining={totalRemaining}
                selected={selected}
                collapsed={collapsed}
                colorOf={colorOfId}
                onSelect={selectCategory}
                onToggleCollapsed={toggleCollapsed}
                onAddCategory={ctx.addCategory}
                onMoveTodo={moveTodo}
              />
              <div className="mt-6 border-t border-border pt-4">
                <DataTransfer current={{ categories, todos, ui }} onImport={importData} />
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-4">
            {/* パンくずと追加ボタン */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="現在のクラス" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
                <button type="button" onClick={() => selectCategory(null)} className="text-muted hover:text-accent">すべて</button>
                {selected === UNCATEGORIZED && <><span className="text-muted">›</span><span className="font-semibold">未分類</span></>}
                {selectedPath.map((c, i) => (
                  <span key={c.id} className="flex items-center gap-1">
                    <span className="text-muted">›</span>
                    {i === selectedPath.length - 1
                      ? <span className="font-semibold">{c.name}</span>
                      : <button type="button" onClick={() => selectCategory(c.id)} className="text-muted hover:text-accent">{c.name}</button>}
                  </span>
                ))}
                <span className="ml-2 text-muted">残り {selected === null ? totalRemaining : (counts.get(selected)?.total ?? 0) - (counts.get(selected)?.done ?? 0)} 件</span>
              </nav>
              <div className="flex gap-2">
                <button type="button" onClick={() => ctx.addCategory(defaultTaskCategory)} className={`${buttonClass.secondary} flex items-center gap-1.5 !py-1.5`}>
                  <FolderPlus size={16} /> {defaultTaskCategory ? 'サブクラス' : 'クラス'}
                </button>
                <button type="button" onClick={() => setTaskDraft({ todo: null, categoryId: defaultTaskCategory })} className={`${buttonClass.primary} flex items-center gap-1.5 !py-1.5`}>
                  <Plus size={16} /> タスク
                </button>
              </div>
            </div>

            {/* 検索・並び替え */}
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface/40 p-2">
              <label className="relative flex min-w-[12rem] flex-1 items-center">
                <Search size={15} className="pointer-events-none absolute left-2.5 text-muted" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="タスク名・タグ・メモで検索"
                  className="w-full rounded-md border border-border bg-bg !py-1.5 !pl-8 !pr-8 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="absolute right-2 text-muted hover:text-fg" aria-label="検索をクリア">
                    <X size={15} />
                  </button>
                )}
              </label>
              <select
                value={ui.sort}
                onChange={e => updateUi({ sort: e.target.value as SortOption })}
                className="rounded-md border border-border bg-bg !px-2 !py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                aria-label="並び替え"
              >
                <option value="added">追加順</option>
                <option value="name">名前順</option>
                <option value="dueDate">期限が近い順</option>
              </select>
              <label className="flex cursor-pointer items-center gap-1.5 px-1 text-sm">
                <input type="checkbox" checked={ui.showCompleted} onChange={e => updateUi({ showCompleted: e.target.checked })} className="accent-emerald-600" />
                完了を表示
              </label>
              <button
                type="button"
                onClick={() => updateUi({ collapsed: allCollapsed ? [] : allGroupIds })}
                className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg"
                title={allCollapsed ? 'すべて展開' : 'すべて折りたたむ'}
                aria-label={allCollapsed ? 'すべて展開' : 'すべて折りたたむ'}
              >
                {allCollapsed ? <ChevronsUpDown size={17} /> : <ChevronsDownUp size={17} />}
              </button>
            </div>

            {/* 初回の案内 */}
            {categories.length === 0 && todos.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm leading-relaxed">
                <p className="font-semibold">クラスを作ってタスクを整理しましょう</p>
                <p className="mt-1 text-muted">
                  「業務」「研究」「勉強」のような大きなクラスの下に「確率論」などのサブクラスを作り、
                  その中に「1.1節」「1.2節」…とタスクを並べられます。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => ctx.addCategory(null)} className={buttonClass.primary}>クラスを追加</button>
                  <button type="button" onClick={createSample} className={buttonClass.secondary}>サンプルのクラスを作成</button>
                </div>
              </div>
            )}

            {/* タスク */}
            <div className="space-y-3">
              {roots.map(category => (
                <TaskGroup key={category?.id ?? UNCATEGORIZED} category={category} depth={0} ctx={ctx} />
              ))}
              {ctx.searching && roots.every(c => !visibleCounts.get(c?.id ?? UNCATEGORIZED)?.total) && (
                <p className="py-6 text-center text-sm text-muted">「{query}」に一致するタスクはありません。</p>
              )}
            </div>
          </div>
        </div>
      )}

      {taskDraft && (
        <EditForm
          todo={taskDraft.todo}
          defaultCategoryId={taskDraft.categoryId}
          categories={categories}
          onSave={saveTask}
          onDelete={deleteTodo}
          onClose={() => setTaskDraft(null)}
        />
      )}
      {categoryDraft && (
        <CategoryForm
          key={categoryDraft.category?.id ?? 'new'}
          category={categoryDraft.category}
          defaultParentId={categoryDraft.parentId}
          defaultColor={COLOR_KEYS[childrenOf(categories, null).length % COLOR_KEYS.length]}
          categories={categories}
          onSave={saveCategory}
          onDelete={deleteCategory}
          onMove={moveCategory}
          onClose={() => setCategoryDraft(null)}
        />
      )}
    </div>
  );
}
