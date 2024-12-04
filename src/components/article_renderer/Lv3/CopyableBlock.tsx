"use client";

import React, { useState } from "react";

interface CopyableBlockProps {
  id?: string; // 左上の番号
  content: string; // コピー対象の内容
  children: React.ReactNode; // コンテンツの中身
  buttonString?: string; // コピーボタンの文字
}

const CopyableBlock: React.FC<CopyableBlockProps> = ({ id, content, children, buttonString }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!buttonString) {
    buttonString = "Copy";
  }

  // コピーボタンの動作
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content); // クリップボードにコピー
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2秒後に状態をリセット
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="py-1 my-1">
      <div className="rounded-md shadow flex flex-col gap-0 text-center border border-gray-300">
        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between bg-gray-600 rounded-t-md">
          {/* alt説明 */}
          {id && <span className="px-4 text-sm text-gray-200">{id}</span>}
          {/* コピーボタン */}
          <button
          onClick={handleCopy}
          className="rounded-tl-md rounded-tr-md text-xs bg-gray-800 hover:bg-gray-700 active:bg-gray-700 text-gray-200 px-2 py-0.5 min-w-[110px]"
        >{isCopied ? "Copied!" : buttonString}</button>
        </div>
        {/* コンテンツ部分 */}
        <div className="rounded-bl-md rounded-br-md text-center overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CopyableBlock;
