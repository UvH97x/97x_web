// /src/app/applications/page.tsx


import React from 'react';
import Link from 'next/link';

export default function AppHome() {
  return (
    <div className="flex flex-col items-center p-0">
      {/* タイトル */}
      <h1 className="text-4xl font-bold mb-6 text-slate-800">
        Applications Home
      </h1>

      {/* 説明文 */}
      <p className="text-lg text-gray-600 mb-4">
        This is the Application Home. Explore the available apps below.
      </p>

      {/* リンクコンテナ */}
      <div className="flex flex-col items-center space-y-4">
        {/* リンク */}
        <Link href="./applications/todo">
          <span className="text-xl text-blue-600 hover:text-blue-800 underline transition duration-300">
            Todo List
          </span>
        </Link>
      </div>
    </div>
  );
}
