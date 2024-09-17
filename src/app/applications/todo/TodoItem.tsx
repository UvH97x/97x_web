// TodoItem.tsx
import { Todo } from './types';

interface TodoItemProps {
  todo: Todo;
  toggleTodo: (id: number) => void;
  editTodo: (todo: Todo) => void;
}

export default function TodoItem({ todo, toggleTodo, editTodo }: TodoItemProps) {
  const formattedDate = todo.dueDate ? new Intl.DateTimeFormat('ja', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(todo.dueDate)) : 'No Due Date';

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
      />
      <span
        style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
        onClick={() => editTodo(todo)}
      >
        {todo.todoName}<small>({formattedDate})</small>
      </span>
      <span>
        {todo.tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
          </span>
        ))}
      </span>
    </div>
  );
}