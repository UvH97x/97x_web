// Header.tsx
import React from "react";

import TextBlock from "../Lv4/TextBlock";
import { MetaContent } from "@/src/app/applications/article-editform-test/article-edit-type";

interface HeaderProps {
  meta: MetaContent;
}

const Header: React.FC<{ meta: MetaContent }> = ({ meta }) => {
  const { title, author, created_at, updated_at, summary, tags } = meta;
  return (
    <>
      <header className="border-b">
        {/* タイトル */}
        <div className="font-bold text-2xl pt-2 pb-4 border-b">
          {title}
        </div>

        {/* メタ情報 */}
        <div className="flex flex-col">
          {/* 左側: タグ */}
          <div className="flex flex-wrap gap-1 justify-start md:justify-end">
            🏷️
            {tags.length > 0 && tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 m-1 h-6 bg-blue-50 text-blue-700 text-sm font-medium rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 右側: 著者と作成日 */}
          <div className="flex flex-wrap gap-1 justify-end text-gray-600">
            <span className="">✒️{formatDate(created_at)}</span>
            {updated_at && (
              <span className="">【{formatDate(updated_at)}更新】</span>
            )}
            <span className="">🧑‍💻{author}</span>
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