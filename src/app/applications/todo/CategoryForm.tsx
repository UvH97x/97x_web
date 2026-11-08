// src/app/applications/todo/CategoryForm.tsx
'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { COLOR_BG, COLOR_KEYS, COLOR_LABEL, type ColorKey } from './colors';
import { Modal, buttonClass, inputClass, prefersAutoFocus } from './Modal';
import { flatten, subtreeIds } from './tree';
import type { Category } from './types';

export interface CategoryInput {
  name: string;
  parentId: string | null;
  color: ColorKey;
}

interface CategoryFormProps {
  /** null なら新規作成。 */
  category: Category | null;
  defaultParentId: string | null;
  defaultColor: ColorKey;
  categories: Category[];
  onSave: (input: CategoryInput) => void;
  onDelete: (category: Category) => void;
  onMove: (category: Category, direction: -1 | 1) => void;
  onClose: () => void;
}

export default function CategoryForm({
  category, defaultParentId, defaultColor, categories, onSave, onDelete, onMove, onClose,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [parentId, setParentId] = useState<string>(category ? category.parentId ?? '' : defaultParentId ?? '');
  const [color, setColor] = useState<ColorKey>(category?.color ?? defaultColor);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefersAutoFocus()) nameRef.current?.focus();
  }, []);

  // 自分自身や子孫を親にすると循環するので選択肢から外す。
  const parentOptions = flatten(categories, category ? subtreeIds(categories, category.id) : undefined);
  const isRoot = !parentId;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), parentId: parentId || null, color });
  };

  const handleDelete = () => {
    if (!category) return;
    const message =
      `クラス「${category.name}」を削除しますか？\n` +
      '中のタスクとサブクラスは削除されず、ひとつ上のクラスへ移ります。';
    if (confirm(message)) onDelete(category);
  };

  return (
    <Modal title={category ? 'クラスを編集' : 'クラスを追加'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">名前</span>
          <input
            ref={nameRef}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={isRoot ? '例: 業務・研究・勉強' : '例: 確率論'}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">親クラス</span>
          <select value={parentId} onChange={e => setParentId(e.target.value)} className={inputClass}>
            <option value="">（なし: 最上位のクラス）</option>
            {parentOptions.map(({ category: c, depth }) => (
              <option key={c.id} value={c.id}>
                {'　'.repeat(depth)}{depth > 0 ? '└ ' : ''}{c.name}
              </option>
            ))}
          </select>
        </label>

        {isRoot ? (
          <fieldset className="flex flex-col gap-2 text-sm">
            <legend className="mb-1 font-medium">色</legend>
            <div className="flex flex-wrap gap-2">
              {COLOR_KEYS.map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  title={COLOR_LABEL[key]}
                  aria-label={COLOR_LABEL[key]}
                  aria-pressed={color === key}
                  className={`h-7 w-7 rounded-full ${COLOR_BG[key]} ring-offset-2 ring-offset-bg transition ${
                    color === key ? 'ring-2 ring-fg' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="text-xs text-muted">色は最上位のクラスの色を引き継ぎます。</p>
        )}

        {category && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">並び順</span>
            <button type="button" onClick={() => onMove(category, -1)} className={`${buttonClass.secondary} !px-2 !py-1`} title="上へ">
              <ArrowUp size={16} />
            </button>
            <button type="button" onClick={() => onMove(category, 1)} className={`${buttonClass.secondary} !px-2 !py-1`} title="下へ">
              <ArrowDown size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
          {category && (
            <button type="button" onClick={handleDelete} className={`${buttonClass.danger} sm:mr-auto`}>
              削除
            </button>
          )}
          <button type="button" onClick={onClose} className={`${buttonClass.secondary} ${category ? '' : 'sm:ml-auto'}`}>
            キャンセル
          </button>
          <button type="submit" disabled={!name.trim()} className={`${buttonClass.primary} disabled:opacity-50`}>
            {category ? '保存' : '追加'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
