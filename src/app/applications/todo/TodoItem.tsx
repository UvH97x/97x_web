// TodoItem.tsx
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

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-md shadow ${
        todo.completed ? 'bg-green-100' : 'bg-white'
      }`}
    >
      {/* タスク完了用のチェックボックス */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="mr-2"
      />

      {/* タスク名と期限日 */}
      <div
        className={`flex-1 cursor-pointer ${
          todo.completed ? 'line-through text-gray-500' : ''
        }`}
        onClick={() => editTodo(todo)}
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