// TodoItem.tsx

"use client";

import { Todo } from './types';

interface TodoItemProps {
  todo: Todo;
  toggleTodo: (id: number) => void;
  editTodo: (todo: Todo) => void;
}

export default function TodoItem({ todo, toggleTodo, editTodo }: TodoItemProps) {
  const formattedDate = todo.dueDate
    ? new Intl.DateTimeFormat('ja', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(todo.dueDate))
    : 'No Due Date';

    const handleClick = () => {
      editTodo(todo);
    };

  return (
    <div
      className={`flex items-center gap-2 p-4 rounded-md shadow cursor-pointer hover:shadow-lg ${
        todo.completed ? 'bg-green-100' : 'bg-white'
      }`}
      onClick={handleClick}
    >
      {/* タスク完了用のチェックボックス */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        onClick={(e) => e.stopPropagation()}
        className="appearance-none w-6 h-6 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 checked:bg-green-500 checked:border-green-500 relative checked:after:content-['✓'] checked:after:text-white checked:after:text-2xl checked:after:flex checked:after:justify-center checked:after:items-center checked:after:-translate-y-1"
      />

      {/* タスク名と期限日 */}
      <div
        className={`flex-1 ${
          todo.completed ? 'line-through text-gray-500' : ''
        }`}
      >
        <span className="font-medium">{todo.todoName}</span>
        <small className="ml-2 text-sm text-gray-400">({formattedDate})</small>
      </div>

      {/* タグ */}
      <div className="flex space-x-2">
        {todo.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}