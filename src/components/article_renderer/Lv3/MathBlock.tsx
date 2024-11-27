// MathBlock.tsx

import React from "react";
import MathRenderer from "./MathRenderer";
import CopyableBlock from "./CopyableBlock";

interface MathBlockProps {
  content: {
    id: string; // 数式ブロックの一意のID
    alt?: string; // 数式の説明
    content: string; // 数式
  };
}

const MathBlock: React.FC<MathBlockProps> = ({ content }) => {
  const { id, alt, content: mathExpression } = content;

  // ファイル名をIDから動的に生成
  const fileName = `${id}.svg`;

  return (
    <CopyableBlock id={alt} content={mathExpression} buttonString="Copy Typst Code">
      <div id={id} className="py-4 px-2 text-center">
        <MathRenderer expression={mathExpression} fileName={fileName} className="content-center py-0.5" />
      </div>
    </CopyableBlock>
  );
};

export default MathBlock;