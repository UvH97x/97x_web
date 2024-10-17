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
        todo.completed
          ? 'bg-green-100'
          : todo.dueDate && new Date(todo.dueDate).toDateString() === new Date().toDateString()
          ? 'bg-yellow-100' // 今日が期限のタスクは黄色系で強調
          : todo.dueDate && new Date(todo.dueDate) < new Date()
          ? 'bg-red-100' // 期限が過ぎたタスクは赤系で強調
          : 'bg-blue-100'
      }`}
      onClick={handleClick}
    >
      {/* タスク完了用のチェックボックス */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        onClick={(e) => e.stopPropagation()}
        title={todo.completed ? '未完了に戻す' : '完了にする'}
        className={`appearance-none w-5 h-5 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 relative
          ${todo.completed 
            ? 'checked:bg-green-500 checked:border-green-500 checked:after:content-["🥳"]' 
            : ''}
          ${!todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date() 
            ? 'after:content-["🤬"]' 
            : 'after:content-["😶"]'}
          after:text-xl after:flex after:justify-center after:items-center after:w-full after:h-full after:absolute after:top-0 after:left-0 after:-translate-y-0`
        }
      />
      {/* タスク名と期限日 */}
      <div
        className={`flex-1 ${
          todo.completed
            ? 'line-through text-gray-500'
            : todo.dueDate && new Date(todo.dueDate).toDateString() === new Date().toDateString()
            ? 'font-bold text-yellow-800' // 今日が期限のタスクのテキストを黄色く太字に
            : todo.dueDate && new Date(todo.dueDate) < new Date()
            ? 'font-bold text-red-600' // 期限が過ぎたタスクのテキストを赤く太字に
            : ''
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
            className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}