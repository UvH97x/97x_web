// src/app/applications/todo/page.tsx
// [ ]:タスクの種類を増やして、例えば複数回完了できる(定期的に未完了になり、完了した回数がカウントされる)やつとかあるといいね。
// [ ]:EditFormをスタイリングする(escで閉じたりしたい)。
// [ ]:TodoListをスタイリングする。


"use client";

// pages/index.tsx
import { useState, useEffect } from 'react';
import TodoList from './TodoList';
import { Todo } from './types';
import EditForm from './EditForm';

export default function Home() {
  // useStateの宣言
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  // アプリ起動時にlocalStorageからTodosをフェッチ
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos && isMounted) {
      setTodos(JSON.parse(savedTodos));
      setIsMounted(false);
    } else if(isMounted) {
      setTodos([]);
      setIsMounted(false);
    } else {
      alert("something error at fetching todos");
    }
  }, []); // 依存配列を空にして、初回マウント時のみ実行

  // Todosの変更をlocalStorageに保存
  useEffect(() => {
    if (!isMounted) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]); // todosが変更された時のみ実行

  // タスクの追加及び編集結果の保存
  const saveTodo = (todo: Todo) => {
    const todoExists = todos.some(t => t.id === todo.id);
    if (todoExists) {
      // すでに同じidのタスクが存在する場合は更新
      setTodos(todos.map(t => t.id === todo.id ? todo : t));
    } else {
      // 同じidのタスクが存在しない場合は新規追加
      setTodos([...todos, todo]);
    }
    setEditingTodo(null);
  };
  // タスクの状態を変更
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  // 編集モード
  const editTodo = (todo: Todo) => {
    if(!editingTodo){
      setEditingTodo(todo);
    }
  };
  // タスクを削除
  const deleteTodo = (todo: Todo) => {
    setTodos(todos.filter(t => t.id !== todo.id));
    setEditingTodo(null);
  }

  return (
    <div className='relative min-h-full flex flex-col items-center justify-center bg-white'>
      {/* タイトル */}
      <h1 className='text-3xl font-bold mb-6'>Todoリスト</h1>
  
      {/* 新しいタスク追加ボタン */}
      <button 
        className='mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300'
        onClick={() => setEditingTodo({} as Todo)}>
        タスクを追加
      </button>
  
      {/* タスクの取得ステータス */}
      {isMounted ? (
        <p>Fetching Tasks...</p>
      ) : (
        <>
          {/* タスクの数 */}
          <h4 className='text-xl mb-4'>残りのタスクの数: {todos.filter(todo => !todo.completed).length}</h4>
  
          {/* Todoリスト */}
          <TodoList 
            todos={todos} 
            toggleTodo={toggleTodo} 
            editTodo={editTodo} 
          />
        </>
      )}
  
      {/* 編集モーダル */}
      {editingTodo !== null && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='relative bg-white rounded-lg p-6 w-3/4 max-w-lg'>
            <EditForm
              todo={editingTodo}
              onSave={saveTodo}
              onClose={() => setEditingTodo(null)}
              onDelete={deleteTodo}
            />
            <button 
              className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
              onClick={() => setEditingTodo(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}