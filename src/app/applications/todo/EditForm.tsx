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
      <div className="modal-content">
        <h2>{todo?.todoName ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            ref={inputRef}
            onChange={(e) => setText(e.target.value)}
            placeholder="Task Name"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due Date"
          />
          <input
            type='text'
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder='Tags ("," separated)'
          />
          <button type="submit">{todo?.todoName ? 'Update' : 'Add'}</button>
          <button type='button' onClick={handleDelete}>Delete</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default EditForm;