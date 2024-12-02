// TocBlock.tsx
import React from "react";

import TextBlock from "../Lv4/TextBlock";

interface TocItem {
  id: string;
  title: string;
}

const TocBlock: React.FC<{ tocBlock: TocItem[] }> = ({ tocBlock }) => {

  return (
    <nav className="my-4 p-4 border rounded bg-gray-50 shadow-md w-auto">
      <h2 className="text-lg font-semibold mb-2">目次</h2>
  
      <ul className="space-y-1">
        {tocBlock.map((toc) => {
          const { id, title } = toc;
          const parsedSection = parseSection(id);
          const sectionDepth = parsedSection.length;
  
          return (
            <li key={toc.id}>
              <a href={`#${id}`}>
                <span
                  className={`pl-${(sectionDepth-1) * 2} border-gray-300`}
                >
                  <span className="text-blue-500 hover:underline">
                    {`${parsedSection.join(".")}. `}
                    <TextBlock content={{ expression: title, style: "" }} />
                  </span>
                </span>
              </a>
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