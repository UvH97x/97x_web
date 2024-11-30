// InlineMath.tsx

"use client";

import React from "react";
import "katex/dist/katex.min.css"; // KaTeXのスタイルをインポート
import { InlineMath } from "react-katex";

const InlineMathComponent: React.FC<{ content: any }> = ({ content }) => {
  const { expression } = content;
  return (
    <span>
      {/* KaTeXのインラインレンダリング */}
      <InlineMath>{expression}</InlineMath>
    </span>
  );
};

export default InlineMathComponent;
