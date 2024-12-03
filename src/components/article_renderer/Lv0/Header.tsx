// Header.tsx
import React from "react";

import TextBlock from "../Lv4/TextBlock";

interface MetaData {
  title: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  summary: string;
}

const Header: React.FC<{ meta: MetaData }> = ({ meta }) => {
  const { title, author, created_at, updated_at, summary, tags } = meta;
  return (
    <>
      <header className="border-b">
        {/* タイトル */}
        <div className="font-bold text-2xl pt-2 pb-4 border-b">{title}</div>

        {/* メタ情報 */}
        <div className="grid grid-cols-2">
          {/* 左側: タグ */}
          <div className="col-span-1 flex flex-row flex-wrap items-center">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 m-1 h-6 bg-blue-50 text-blue-700 text-sm font-medium rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 右側: 著者と作成日 */}
          <div className="flex justify-end text-gray-600">
            <div className="grid grid-cols-2">
              <span className="w-20 text-right">筆　者:</span>
              <span className="ml-1">{author}</span>
              <span className="w-20 text-right">作成日:</span>
              <span className="ml-1">{formatDate(created_at)}</span>
              {updated_at && (
                <>
                  <span className="w-20 text-right">更新日:</span>
                  <span className="ml-1">{formatDate(updated_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* 概要 */}
      <div className="m-1.5 text-black">
        <TextBlock content={{expression: summary, style: ""}} />
      </div>
    </>
  );
};

export default Header;

function formatDate(dateString: string){
  const date = new Date(dateString);
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 一年以上前の場合
  if (date < oneYearAgo) {
    return `${month}/${day}(${date.getFullYear()})`;
  }
  
  // 一年以内の場合
  return `${month}/${day}`;
};