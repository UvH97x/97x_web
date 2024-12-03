// TocBlock.tsx

"use client";

import React from "react";

import TextBlock from "../Lv4/TextBlock";

interface TocItem {
  id: string;
  title: string;
}

const TocBlock: React.FC<{ tocBlock: TocItem[] }> = ({ tocBlock }) => {

  // ハンドラ関数を定義
  const handleClickTitle = (id: string) => (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault(); // デフォルトの動作を抑制
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" }); // スムーズスクロール
      window.history.pushState(null, "", `#${id}`); // URLを更新
    }
  };

  return (
    <nav className="my-4 p-4 border rounded bg-gray-50 shadow-md w-auto">
      <h2 className="text-lg font-semibold mb-2">目次</h2>
  
      <ul className="space-y-1">
        {tocBlock.map((toc) => {
          const { id, title } = toc;
          const parsedSection = parseSection(id);
          const sectionDepth = parsedSection.length;
          return (
            <li key={id}>
              <span
                className={`ml-${(sectionDepth-1) * 2} text-blue-500 hover:underline md:hover:cursor-pointer`}
                onClick={handleClickTitle(id)}
              >
                {`${parsedSection.join(".")}. `}
                <TextBlock content={{expression: title, style:""}} />
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TocBlock;

/**
 * "section:<番号>"形式の文字列をパースして配列を返す関数
 * @param input - "section:1" や "section:4-5-6" のような文字列
 * @returns number[] - パースされた配列
 */
function parseSection(input: string): number[] {
  // 正規表現で"section:"部分を除去して、番号部分を取得
  const match = input.match(/^section:([\d-]+)$/);

  if (!match) {
      throw new Error("Invalid format. Expected format is 'section:<番号>'");
  }

  // "-"で区切られた番号部分を配列に変換
  return match[1].split("-").map((num) => parseInt(num, 10));
}