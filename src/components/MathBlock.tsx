/*
  * src/components/MathBlock.tsx
*/

"use client";

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

import { texToAsciiMath } from '../lib/texToAsciiMath';

interface MathBlockProps {
  math: string;
  width?: string;
}

const MathBlock: React.FC<MathBlockProps> = ({ math, width = '100%' }) => {
  const [isCopied, setIsCopied] = useState(false);
  // const [copyType, setCopyType] = useState<'text' | 'tex'>('text'); // コピーの種類を管理

  const handleCopy = () => {
    const copyContent = /*copyType === 'tex' ?*/ math /*: renderToAsciiMath(math)*/; // TeX形式でコピー
    navigator.clipboard.writeText(copyContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2秒後にメッセージを消す
    });
  };

  const renderToAsciiMath = (tex: string) => {
    return texToAsciiMath(tex);
  };

  return (
    <div className={`relative overflow-auto max-w-full`}>
      {/* 数式表示 */}
      <BlockMath math={math} />
      <div className='absolute top-0 right-0 text-xs flex flex-row'>
        {/* コピーオプション（右上）*/}{/*
        <select
          value={copyType}
          onChange={(e) => setCopyType(e.target.value as 'text' | 'tex')}
          className="bg-gray-300 rounded px-1 py-0.5 mr-2"
        >
          <option value="asciiMath">AsciiMath</option>
          <option value="tex">TeX</option>
        </select>*/}
        {/* コピー ボタン（右上） */}
        <button
          onClick={handleCopy}
          className="bg-gray-800 text-white rounded hover:bg-gray-600 w-20"
        >
          {isCopied ? 'Copied!' : 'Copy tex code'}
        </button>
      </div>
    </div>
  );
};

export default MathBlock;
