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
    : '';

    const handleClick = () => {
      editTodo(todo);
    };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-4 border rounded-lg cursor-pointer hover:border-accent ${
        todo.completed
          ? 'bg-emerald-500/10'
          : todo.dueDate && new Date(todo.dueDate).toDateString() === new Date().toDateString()
          ? 'bg-accent/10' // 今日が期限のタスクは黄色系で強調
          : todo.dueDate && new Date(todo.dueDate) < new Date()
          ? 'bg-red-500/10' // 期限が過ぎたタスクは赤系で強調
          : 'bg-accent/5'
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
        className={`appearance-none w-5 h-5 rounded-full border-2 border-border focus:outline-none focus:ring-2 focus:ring-green-300 relative
          ${todo.completed
            ? 'checked:bg-green-700 checked:border-green-500 checked:after:content-["✓"]'
            : ''}
          after:text-xl after:flex after:justify-center after:items-center after:w-full after:h-full after:absolute after:top-0 after:left-0 after:-translate-y-0`
        }
      />
      {/* タスク名と期限日 */}
      <div
        className={`flex-1 min-w-0 break-words ${
          todo.completed
            ? 'line-through text-muted'
            : todo.dueDate && new Date(todo.dueDate).toDateString() === new Date().toDateString()
            ? 'font-bold text-fg' // 今日が期限のタスクのテキストを黄色く太字に
            : todo.dueDate && new Date(todo.dueDate) < new Date()
            ? 'font-bold text-red-700 dark:text-red-300' // 期限が過ぎたタスクのテキストを赤く太字に
            : ''
        }`}
      >
        <span className="font-medium">{todo.todoName}</span>
        <small className="ml-2 text-sm text-muted">{formattedDate}</small>
      </div>

      {/* タグ */}
      <div className="flex flex-wrap gap-2">
        {todo.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-accent/15 text-accent rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
