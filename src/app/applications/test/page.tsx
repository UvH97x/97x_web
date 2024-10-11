// src/app/applications/test/page.tsx
"use client";

import React, { useState } from 'react';

export default function Page() {
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string>(''); // 削除・編集対象のアイテムID
  const [newTitle, setNewTitle] = useState<string>(''); // 編集用の新しいタイトル

  // POST
  const handlePostData = async () => {
    const response = await fetch('/api/test-connection-to-supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'sample-article.md',
        isDirectory: false,
        title: 'サンプル記事',
        description: 'この記事はデータベースのサンプル記事です。',
        author: 'UvH',
        tags: ['プログラミング', '物理', '数学'],
        references: ['参考文献1, https://example.com/reference1', '参考文献2, https://example.com/reference2'],
      }),
    });

    const result = await response.json();
    setConsoleOutput(JSON.stringify(result, null, 2));
  };
  // GET
  const handleGetData = async () => {
    const response = await fetch('/api/test-connection-to-supabase', {
      method: 'GET',
    });

    const result = await response.json();
    setConsoleOutput(JSON.stringify(result, null, 2));
  };
  // DELETE
  const handleDeleteData = async () => {
    const response = await fetch(`/api/test-connection-to-supabase?id=${itemId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    setConsoleOutput(JSON.stringify(result, null, 2));
  };
  // PUT
  const handleEditData = async () => {
    const response = await fetch('/api/test-connection-to-supabase', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: itemId,
        title: newTitle,
      }),
    });

    const result = await response.json();
    setConsoleOutput(JSON.stringify(result, null, 2));
  };

  return (
    <div className="w-full p-4">
      <div>this is test page</div>
      <button onClick={handlePostData} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Send POST Request
      </button>
      <button onClick={handleGetData} className="mt-4 ml-4 p-2 bg-green-500 text-white rounded">
        Send GET Request
      </button>

      {/* 削除・編集用の入力フィールド */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Enter item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="p-2 border border-gray-300 rounded mr-4"
        />
        <button onClick={handleDeleteData} className="p-2 bg-red-500 text-white rounded">
          Delete Item
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Enter new title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="p-2 border border-gray-300 rounded mr-4"
        />
        <button onClick={handleEditData} className="p-2 bg-yellow-500 text-white rounded">
          Edit Item
        </button>
      </div>

      {/* コンソール画面の追加 */}
      <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded">
        <h2 className="text-lg font-bold mb-2">Console Output</h2>
        <pre className="bg-white p-2 border border-gray-300 rounded text-sm whitespace-pre-wrap">
          {consoleOutput || 'No output yet...'}
        </pre>
      </div>
    </div>
  );
}
