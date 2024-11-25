/**
 * UvHMathBlockRenderer.tsx
 * 
 * このコンポーネントは、数式のブロックを表示するために使用されます。数式は "MathRenderer" コンポーネントで描画されますが、加えて、数式の上部に式番号の代わりに `alt` を表示し、数式をクリップボードにコピーする機能も提供します。
 * 
 * 数式を表示するだけでなく、"Copy Typst Code" ボタンをクリックすることで、数式のコード（Typst形式）をクリップボードにコピーすることができます。
 * コピーが成功すると、ボタンのテキストが一時的に "Copied!" に変更されます。
 * 
 * @component
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.expression - 描画する数式
 * @param {string} props.fileName - 数式を表示する際に使用するファイル名（一意識別のために使用）
 * @param {string} [props.alt] - 数式に対応する代替テキストや式番号
 * @param {string} [props.className] - 数式レンダリング部分に適用されるクラス名
 * 
 * @example
 * const expression = "a^2 + b^2 = c^2";
 * 
 * <UvHMathBlockRenderer
 *   expression={expression}
 *   fileName="example-math"
 *   alt="(1)"
 * />
 * 
 * @function handleCopy
 * `handleCopy` 関数は、数式コードをクリップボードにコピーするために使用されます。
 * コピーに成功すると、`copySuccess` 状態が true になり、ボタンの表示が "Copied!" に変わります。
 * 
 * @returns JSX.Element - 数式ブロック表示とコピー機能を含むUI
 */

"use client";

import { useState } from "react";

import MathRenderer from "./MathRenderer";

// 数式のブロック表示
// altの表示が可能にする(式番号の代わり)
interface UvHMathBlockRendererProps {
  expression: string;
  fileName: string;
  className?: string;
  alt?: string;
}
export function UvHMathBlockRenderer({ expression, fileName, alt = "", className = "" }: UvHMathBlockRendererProps) {
  // コピーの状態管理
  const [copySuccess, setCopySuccess] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);  // ボタンのリセット時間
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <div className="rounded-md shadow flex flex-col gap-2 text-center border border-gray-300">
      <div className="rounded-tl-md rounded-tr-md bg-gray-200 relative flex justify-end">
        <span className="text-xs absolute top-0.5 left-3">{alt}</span>
        <button
          onClick={handleCopy}
          className="rounded-tl-md rounded-tr-md text-xs bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-black px-2 py-0.5 min-w-[110px]"
        >{copySuccess ? "Copied!" : "Copy Typst Code"}</button>
      </div>
      <div className="rounded-bl-md rounded-br-md text-center py-2 overflow-x-auto">
        <MathRenderer expression={expression} fileName={fileName} className={`${className} bg-white block`} />
      </div>
    </div>
  );
}
export default UvHMathBlockRenderer;