// src/app/applications/todo/EditForm.tsx
'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Modal, buttonClass, inputClass, prefersAutoFocus } from './Modal';
import { flatten } from './tree';
import type { Category, Todo } from './types';

export type TodoInput = Omit<Todo, 'id' | 'completed'>;

interface EditFormProps {
  /** null なら新規作成。 */
  todo: Todo | null;
  defaultCategoryId: string | null;
  categories: Category[];
  onSave: (input: TodoInput) => void;
  onDelete: (todo: Todo) => void;
  onClose: () => void;
}

export default function EditForm({ todo, defaultCategoryId, categories, onSave, onDelete, onClose }: EditFormProps) {
  const [name, setName] = useState(todo?.todoName ?? '');
  const [categoryId, setCategoryId] = useState<string>(todo ? todo.categoryId ?? '' : defaultCategoryId ?? '');
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? '');
  const [tags, setTags] = useState(todo?.tags.join(', ') ?? '');
  const [note, setNote] = useState(todo?.note ?? '');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefersAutoFocus()) nameRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      todoName: name.trim(),
      categoryId: categoryId || null,
      dueDate: dueDate || null,
      tags: tags.split(/[,、]/).map(t => t.trim()).filter(Boolean),
      note: note.trim(),
    });
  };

  const handleDelete = () => {
    if (!todo) return;
    if (todo.completed || confirm(`「${todo.todoName}」を削除しますか？`)) onDelete(todo);
  };

  return (
    <Modal title={todo ? 'タスクを編集' : 'タスクを追加'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">名前</span>
          <input ref={nameRef} value={name} onChange={e => setName(e.target.value)} placeholder="例: 1.1節を読む" className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">クラス</span>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">未分類</option>
            {flatten(categories).map(({ category, depth }) => (
              <option key={category.id} value={category.id}>
                {'　'.repeat(depth)}{depth > 0 ? '└ ' : ''}{category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">期限</span>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">タグ</span>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="カンマ区切りで複数" className={inputClass} />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">メモ</span>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className={`${inputClass} resize-y`} />
        </label>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
          {todo && (
            <button type="button" onClick={handleDelete} className={`${buttonClass.danger} sm:mr-auto`}>
              削除
            </button>
          )}
          <button type="button" onClick={onClose} className={`${buttonClass.secondary} ${todo ? '' : 'sm:ml-auto'}`}>
            キャンセル
          </button>
          <button type="submit" disabled={!name.trim()} className={`${buttonClass.primary} disabled:opacity-50`}>
            {todo ? '保存' : '追加'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
