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
    <div className='absolute'>
      <h1>Todo List</h1>
      <button onClick={() => {
        setEditingTodo({} as Todo);
      }}>Add New Task</button>
    {isMounted ? (
      <p>Fetching Tasks...</p>
    ) : (
      <>
        <h4>残りのタスクの数: {todos.length}</h4>
        <TodoList todos={todos} toggleTodo={toggleTodo} editTodo={editTodo} />
      </>
    )}
      {editingTodo !== null && (
        <div className='absolute top-10 left-10 w-3/4 h-1/5 bg-slate-600'>
          <EditForm
            todo={editingTodo}
            onSave={saveTodo}
            onClose={() => setEditingTodo(null)}
            onDelete={deleteTodo}
          />
        </div>
      )}
    </div>
  );
}