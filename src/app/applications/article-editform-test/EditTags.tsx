// EditTags.tsx

"use client";

import { useState, useEffect, useRef } from "react";

interface EditTagsProps {
  initTags: string[];
  onTagsChange: (updatedTags: string[]) => void; // タグ変更時のコールバック
}

const EditTags: React.FC<EditTagsProps> = ({ initTags, onTagsChange }) => {
  const [tags, setTags] = useState<string[]>(initTags); // タグの状態
  const inputRefs = useRef<HTMLInputElement[]>([]); // 各タグの入力フィールドへの参照

  // タグの変更を親へ通知
  useEffect(() => {
    onTagsChange(tags);
  }, [tags, onTagsChange]);

  // タグの編集
  const handleChange = (index: number, newTag: string) => {
    const newTags = [...tags];
    newTags[index] = newTag;
    setTags(newTags);
  };

  // 編集結果が空の場合
  const handleBlur = (index: number) => {
    if (tags[index] === "") {
      handleDelete(index); // 値が空の場合は削除
    }
  };

  // タグの削除
  const handleDelete = (index: number) => {
    setTags((prevTags) => {
      const newTags = prevTags.filter((_, i) => i !== index);
      inputRefs.current = inputRefs.current.filter((_, i) => i !== index);
      return newTags;
    });
  };

  // 新しいタグを追加
  const handleAddTag = () => {
    const newTags = [...tags];
    newTags[tags.length] = "新しいタグ";
    setTags(newTags);
    
    // 次のレンダリングで最後のタグにフォーカス
    setTimeout(() => {
      const lastInput = inputRefs.current[newTags.length-1];
      if (lastInput) {
        lastInput.select(); // フォーカス後に選択状態にする
      }
    }, 0);
  };

  return (
    <div className="">
      タグ：
      <div>
        {tags.map((tag, index) => (
          <span key={index} className="border m-1 rounded-lg p-0.5">
            <input
              type="text"
              value={tag}
              ref={(el) => {
                inputRefs.current[index] = el!;
              }}  // 各タグの入力フィールドを参照として保存
              placeholder="タグ名"
              onChange={(e) => handleChange(index, e.target.value)}
              onBlur={() => handleBlur(index)} // フォーカスが外れたときの処理
              className="border-none bg-transparent outline-none"
            />
            <span
              onClick={() => handleDelete(index)}
              className="cursor-pointer text-red-500 ml-2"
            >
              ✕
            </span>
          </span>
        ))}
        <button
          onClick={handleAddTag}
          className="border rounded-lg py-0.5 px-1 m-1 bg-blue-400 border-gray-400 text-gray-100"
        >
          タグを追加
        </button>
      </div>
    </div>
  );
};

export default EditTags;