// Paragraph.tsx

import React from "react";

import Renderer from "../Renderer";

const Paragraph: React.FC<{ content: any; children: any[] }> = ({ children }) => {
  // 最初の `text` を特定
  const firstTextIndex = children.findIndex(
    (child: any) => child.type === "text"
  );

  return (
    <div className="my-1">
      {children.map((child, idx) => {
        // 最初の `text` には字下げ（インデント）を適用
        if (idx === firstTextIndex && child.type === "text") {
          return (
            <span
              key={idx}
              className="inline-block"
              style={{ textIndent: "1rem" }}
            >
              <Renderer data={child} />
            </span>
          );
        }

        // それ以外は通常の処理
        return (
          <span key={idx} className="inline">
            <Renderer data={child} />
          </span>
        );
      })}
    </div>
  );
};

export default Paragraph;
