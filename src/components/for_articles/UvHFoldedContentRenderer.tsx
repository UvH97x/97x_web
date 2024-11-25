/**
 * UvHFoldedContentRenderer.tsx
 * 
 * このコンポーネントは、折り畳み可能なコンテンツブロックをレンダリングします。
 * クリックするとコンテンツが展開され、再クリックで折り畳まれるシンプルなUIを提供します。
 * 折り畳み部分は "UvHContentRenderer" コンポーネントでレンダリングされます。
 * 
 * @component
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} [props.alt] - タイトルとして表示するオプションのテキスト
 * @param {string} props.content - 折り畳み部分のコンテンツ
 * @param {string} props.fileName - コンテンツに関連するファイル名
 * 
 * @example
 * <UvHFoldedContentRenderer
 *   alt="Example Title"
 *   content="This is some foldable content."
 *   fileName="example.txt"
 * />
 * 
 * Tailwind CSS を使用しているため、必要に応じてスタイルをカスタマイズできます。
 * 
 * @todo
 * - レンダリングに伴うapi通信をキャッシュし、状態変化ごとに起こる通信を減らす
 */

"use client";

import { useRef, useState, useEffect } from 'react';

import UvHContentRenderer from './UvHContentRenderer';

type UvHFoldedContentRendererProps = {
  alt?: string;
  content: string;
  fileName: string;
};
const UvHFoldedContentRenderer = ({ alt, content, fileName }: UvHFoldedContentRendererProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!contentRef.current) return;
    
    // isOpenが変更されたときに適切な高さを設定
    if (isOpen) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="border rounded-lg p-4 mb-4">
      {/* タイトル部分をボタンのように使う */}
      <div
        onClick={toggleIsOpen}
        className="flex items-center cursor-pointer w-full text-left font-semibold text-sm"
      >
        {/* 三角形のアイコン（折り畳み状態に応じて回転させる） */}
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? 'rotate-90' : ''
          }`}
        >
          &#9654;
        </span>
        <span className="ml-2">{alt}</span>
      </div>
      
      {/* 折り畳みの内容部分 */}
      <div 
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{ height: `${contentHeight}px` }}
      >
        <div ref={contentRef}>
          <UvHContentRenderer content={content} fileName={fileName} />
        </div>
      </div>
    </div>
  );
};

export default UvHFoldedContentRenderer;

