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
  const [sortOption, setSortOption] = React.useState<'id' | 'name' | 'dueDate' | 'tag'>('dueDate');
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
    <div className='flex flex-col space-y-4'>
      {/* ソートおよびフィルタ部分 */}
      <div className='bg-slate-300 p-2 rounded-md shadow-sm flex items-center justify-between'>
        <div>
          <label className='mr-2 font-semibold'>並び替え:</label>
          <select
            value={sortOption}
            onChange={(e) =>
              setSortOption(e.target.value as 'id' | 'name' | 'dueDate' | 'tag')
            }
            className='px-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300'
          >
            <option value="id">追加順</option>
            <option value="name">名前順</option>
            <option value="dueDate">期限が近い順</option>
            <option value="tag">タグ一致優先(他は追加順)</option>
          </select>
        </div>
        
        {/* タグフィルタはタグが選択されたときのみ表示 */}
        {sortOption === 'tag' && (
          <div className='ml-4'>
            <label className='mr-2 font-semibold'>Filter by Tag:</label>
            <input
              type='text'
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              placeholder='Enter tag to filter'
              className='px-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300'
            />
          </div>
        )}
      </div>
  
      {/* タスクリスト */}
      <div className='space-y-6'>
        {/* 未完了のタスク */}
        {incompleteTodos.length > 0 ? (
          <div className='flex flex-col gap-4'>
            <h3 className='text-lg font-semibold'>未完了のタスク</h3>
            {incompleteTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                toggleTodo={toggleTodo}
                editTodo={editTodo}
              />
            ))}
          </div>
        ) : (
          <p className='text-gray-600'>すべてのタスクが完了しました。お疲れさまでした！</p>
        )}
  
        {/* 完了済みのタスク */}
        {completedTodos.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h3 className='text-lg font-semibold'>完了済みのタスク</h3>
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                toggleTodo={toggleTodo}
                editTodo={editTodo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}