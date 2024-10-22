// src/app/applications/todo/EditForm.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Todo } from './types';

interface EditFormProps {
  todo: Todo | null;
  onSave: (todo: Todo) => void;
  onClose: () => void;
  onDelete: (todo: Todo) => void;
}

const EditForm: React.FC<EditFormProps> = ({ todo, onSave, onClose, onDelete }) => {
  const [text, setText] = useState<string>(todo?.todoName || '');
  const [dueDate, setDueDate] = useState<string>(todo?.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '');
  const [tags, setTags] = useState<string>(todo?.tags?.join(',') || '');

  useEffect(() => {
    setText(todo?.todoName || '');
    setDueDate(todo?.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '');
    setTags(todo?.tags?.join(',') || '');
  
    // PCかどうかを判定
    const isPC = () => {
      return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
  
    if (isPC() && inputRef.current) {
      inputRef.current.focus();
    }
  }, [todo]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({
      id: todo?.id || Date.now(),
      todoName: text.trim(),
      completed: todo?.completed || false,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags?.split(',').map(tag => tag.trim()).filter(tag => tag),
    });
    onClose();
  };

  const handleDelete = () => {
    if (todo && !todo?.completed) {
      const taskName = todo?.todoName || 'このタスク';
      const confirmDelete = confirm(`本当に「${taskName}」を削除しますか？`); // [ ]確認用フォームを自分で作る
      
      if (confirmDelete) {
        // タスクを削除する処理をここに記述
        onDelete(todo);
      } else {
        onClose();
      }
    }
  }

  // Add Formの場合、Delete Buttonが出ないようにする
  return (
    <div className="modal">
      <div className="modal-content bg-white p-6 rounded-lg shadow-lg">
        {/* タイトル */}
        <h2 className="text-2xl font-semibold mb-4">
          {todo?.todoName ? '編集' : '新規'}
        </h2>
  
        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-1">
          {/* タスク名 */}
          <span className='flex flex-col gap-0'>
            <label>名前: </label>
            <input
              type="text"
              value={text}
              ref={inputRef}
              onChange={(e) => setText(e.target.value)}
              placeholder="タスク名"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </span>

          {/* 期限日 */}
          <span className='flex flex-col gap-0'>
            <label>期限: </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="期限"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </span>
  
          {/* タグ入力 */}
          <span className='flex flex-col gap-0'>
            <label>タグ: </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder='タグ ("," で分ければ複数設定できます)'
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </span>
  
          {/* ボタン群 */}
          <div className="flex flex-wrap md:flex-row-reverse flex-col gap-2 md:space-x-2">
            {/* 追加/更新ボタン */}
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors duration-300"
            >
              {todo?.todoName ? '更新' : '追加'}
            </button>

            {/* キャンセルボタン */}
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition-colors duration-300"
            >
              キャンセル
            </button>

            {todo?.todoName ? (
              <>
                {/* 削除ボタン */}
                <button 
                  type="button" 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors duration-300"
                >
                  削除
                </button>
              </>
            ) : ''}

            
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm;