// Section.tsx

"use client";

import React from "react";

import Renderer from "../Renderer";

const Section: React.FC<{ content: any; children: any[]; }> = ({ content, children }) => {
  const { id, title } = content;
  const parsedId = parseSection(id);

  // スタイル変数
  let textStyle = "";
  // parsedIdの長さに基づいてスタイリングを変更
  switch (parsedId.length) {
    case 1: // ネストの深さ1
      textStyle = "text-2xl font-extrabold";
      break;
    case 2: // ネストの深さ2
      textStyle = "text-xl font-bold";
      break;
    case 3: // ネストの深さ3
      textStyle = "text-lg font-semibold";
      break;
    default: // その他のネストの深さ
      textStyle = "text-md font-medium";
  }

  // ハンドラ関数を定義
  const handleClickTitle = () => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // URLを更新
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <section id={id}>
      {/* 深さに基づいてタイトルのスタイルを変更 */}
      <div
        className={`${textStyle} md:hover:text-gray-600 md:hover:cursor-pointer my-1 py-1 border-y border-black`}
        onClick={handleClickTitle}>
        {parsedId.join(".")}. {title}
      </div>
      

      {/* 子要素を再帰的にレンダリング */}
      {children &&
        children.map((child, idx) => {
          return <Renderer key={idx} data={child} />;
        })
      }
    </section>
  );
};

export default Section;

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