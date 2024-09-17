// TodoList.tsx
import React from 'react';
import TodoItem from './TodoItem';
import { Todo } from './types';

interface TodoListProps {
  todos: Todo[];
  toggleTodo: (id: number) => void;
  editTodo: (todo: Todo) => void;
}

export default function TodoList({ todos, toggleTodo, editTodo }: TodoListProps) {
  const [sortOption, setSortOption] = React.useState<'id' | 'name' | 'dueDate' | 'tag'>('id');
  const [filterTag, setFilterTag] = React.useState<string>('');

  // 並び替え処理
  const sortedTodos = [...todos].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.todoName.localeCompare(b.todoName);
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'tag':
        if (!filterTag) return 0;
        const aHasTag = a.tags.includes(filterTag);
        const bHasTag = b.tags.includes(filterTag);
        if (aHasTag && !bHasTag) return -1;
        if (!aHasTag && bHasTag) return 1;
        return 0;
      case 'id':
      default:
        return a.id - b.id;
    }
  });

  // 完了済みと未完了タスクに分割
  const incompleteTodos = sortedTodos.filter(todo => !todo.completed);
  const completedTodos = sortedTodos.filter(todo => todo.completed);

  return (
    <div className='flex flex-col'>
      <div className='bg-slate-300'>
        <span>
          <label>Sort by: </label>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value as 'id' | 'name' | 'dueDate' | 'tag')}>
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="dueDate">Due Date</option>
            <option value="tag">Tag</option>
          </select>
        </span>
        {/* タグフィルタの入力欄は、tagが選択された場合にのみ表示 */}
        {sortOption === 'tag' && (
          <span>
            <label>Filter by Tag: </label>
            <input
              type='text'
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              placeholder='Enter tag to filter'
            />
          </span>
        )}
      </div>
      <div className='flex flex-col'>
        {incompleteTodos.length > 0 ? (
          incompleteTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} toggleTodo={toggleTodo} editTodo={editTodo} />
          ))
        ) : (
          <p>すべてのタスクが完了しました。お疲れさまでした！</p>
        )}

        {completedTodos.length > 0 && (
          <>
            <p>完了済みのタスク</p>
            {completedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} toggleTodo={toggleTodo} editTodo={editTodo} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}