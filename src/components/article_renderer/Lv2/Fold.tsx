// Fold.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";

import Renderer from "../Renderer";

const Fold: React.FC<{ content: any; children: any[] }> = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // 開閉トグル
  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  // 開閉状態に応じて高さを調整
  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      setContentHeight(contentRef.current.scrollHeight + 8);  // 最下部の見切れを防ぐ
    } else {
      setContentHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="border rounded-lg p-4 my-1 shadow-sm bg-white">
      {/* タイトル部分 */}
      <div
        onClick={toggleIsOpen}
        className="flex items-center cursor-pointer w-full text-left font-semibold text-sm text-gray-700"
      >
        {/* 折り畳みアイコン */}
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          &#9654;
        </span>
        <span className="ml-2">{content.alt}</span>
      </div>

      {/* 折り畳みコンテンツ部分 */}
      <div
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{ height: `${contentHeight}px` }}
      >
        <div ref={contentRef}>
          {children && children.map((child, idx) => <Renderer key={idx} data={child} />)}
        </div>
      </div>
    </div>
  );
};

export default Fold;
