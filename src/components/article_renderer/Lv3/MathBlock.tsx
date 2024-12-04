// MathBlock.tsx

import React from "react";
import MathRenderer from "./MathRenderer";
import CopyableBlock from "./CopyableBlock";

interface MathBlockProps {
  content: {
    id: string; // 数式ブロックの一意のID
    expression: string; // 数式
  };
}

const MathBlock: React.FC<MathBlockProps> = ({ content }) => {
  const { id, expression: mathExpression } = content;

  const fileName = id.replace(":", "-");

  return (
    <CopyableBlock id={id} content={mathExpression} buttonString="Copy Typst Code">
      <div id={id} className="py-4 px-2 text-center">
        <MathRenderer expression={mathExpression} fileName={fileName} className="content-center py-0.5" />
      </div>
    </CopyableBlock>
  );
};

export default MathBlock;