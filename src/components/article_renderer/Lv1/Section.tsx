// Section.tsx

import React from "react";

import Renderer from "../Renderer";

const Section: React.FC<{ content: any; children: any[]; depth: number }> = ({ content, children, depth }) => {
  // 深さに応じたスタイル設定
  const titleStyles = {
    1: "text-xl font-bold border-b border-gray-400 pb-1 mb-2",
    2: "text-lg font-semibold border-b border-gray-300 pb-1 mb-2",
    3: "text-base font-medium text-gray-700 pb-1 mb-1",
    4: "text-sm font-normal text-gray-600 pb-1 mb-1",
    5: "text-sm font-light text-gray-500 pb-1",
    6: "text-xs font-thin text-gray-400 pb-1",
  };

  // 深さに応じたマージンやパディングの調整（タイトル周辺のスペース）
  const containerStyles = {
    1: "mt-6 mb-4",
    2: "mt-5 mb-3",
    3: "mt-4 mb-2",
    4: "mt-3 mb-2",
    5: "mt-2 mb-1",
    6: "mt-2 mb-1",
  };
  // デフォルトスタイル設定
  const defaultTitleStyle = "text-sm font-normal text-gray-600";
  const defaultContainerStyle = "";

  // スタイルの適用
  const appliedTitleStyle = titleStyles[depth as 1 | 2 | 3 | 4 | 5 | 6] || defaultTitleStyle;
  const appliedContainerStyle = containerStyles[depth as 1 | 2 | 3 | 4 | 5 | 6] || defaultContainerStyle;

  return (
    <section id={content.id}>
      {/* 深さに基づいてタイトルのスタイルを変更 */}
      <div className={appliedContainerStyle}>
        <h2 className={appliedTitleStyle}>{content.title}</h2>
      </div>

      {/* 子要素を再帰的にレンダリング */}
      {children &&
        children.map((child, idx) => {
          if (child.type === "section") {
            // 子要素が Section の場合、深さを +1 して再帰的にレンダリング
            return <Section key={idx} content={child.content} children={child.children} depth={depth === 6 ? 6 : depth + 1} />;
          }
          // その他の要素は通常のレンダリング
          return <Renderer key={idx} data={child} />;
        })
      }
    </section>
  );
};

export default Section;