// Header.tsx
import React from "react";

interface MetaData {
  title: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  summary: string;
}

const Header: React.FC<{ meta: MetaData }> = ({ meta }) => {
  return (
    <>
      <header className="mb-6 border-b pb-4">
        {/* タイトル */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">{meta.title}</h1>

        {/* メタ情報 */}
        <div className="items-center gap-4">
          {/* タグ */}
          <div className="flex flex-wrap gap-2">
            {meta.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 著者と作成日 */}
          <div className="flex flex-col items-end text-black text-sm space-y-1">
            <span>筆者: {meta.author}</span>
            <span>作成日: {meta.created_at}</span>
            {meta.updated_at && <span>更新日: {meta.updated_at}</span>}
          </div>
        </div>
      </header>
      
      {/* 概要 */}
      <p className="mt-6 text-black text-base leading-relaxed">{meta.summary}</p>
    </>
  );
};

export default Header;
