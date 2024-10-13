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
    if(inputRef.current) {
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
    if (todo?.id) {
      onDelete(todo);  // onDelete関数を呼び出して削除処理を実行
    }
  }

  // Add Formの場合、Delete Buttonが出ないようにする
  return (
    <div className="modal">
      <div className="modal-content bg-white p-6 rounded-lg shadow-lg">
        {/* タイトル */}
        <h2 className="text-2xl font-semibold mb-4">
          {todo?.todoName ? 'Edit Task' : 'Add New Task'}
        </h2>
  
        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タスク名 */}
          <input
            type="text"
            value={text}
            ref={inputRef}
            onChange={(e) => setText(e.target.value)}
            placeholder="Task Name"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
  
          {/* 期限日 */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due Date"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
  
          {/* タグ入力 */}
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder='Tags ("," separated)'
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
  
          {/* ボタン群 */}
          <div className="flex justify-between space-x-2">
            {/* 追加/更新ボタン */}
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors duration-300"
            >
              {todo?.todoName ? 'Update' : 'Add'}
            </button>
  
            {/* 削除ボタン */}
            <button 
              type="button" 
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors duration-300"
            >
              Delete
            </button>
  
            {/* キャンセルボタン */}
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm;