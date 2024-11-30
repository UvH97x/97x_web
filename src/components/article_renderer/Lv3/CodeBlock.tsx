// CodeBlock.tsx

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import CopyableBlock from "./CopyableBlock";

const CodeBlock: React.FC<{ content: any }> = ({ content }) => {
  const { id, alt: language, content: code } = content;

  return (
    <CopyableBlock id={language} content={code} buttonString="Copy Source Code">
      <div id={id} className="bg-black text-white">
        <SyntaxHighlighter language={language} style={darcula} customStyle={{ margin: 0 }}>
          {code}
        </SyntaxHighlighter>
      </div>
    </CopyableBlock>
  );
};

export default CodeBlock;
