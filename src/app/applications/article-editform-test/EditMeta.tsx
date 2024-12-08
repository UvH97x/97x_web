// EditMeta.tsx

"use client";

import { useState, useEffect } from "react";

import EditTags from "./EditTags";

import { MetaContent } from "./article-edit-type";

interface EditMetaProps {
  meta: MetaContent;
  onMetaChange: (updateMeta: MetaContent) => void;
}

const EditMeta: React.FC<EditMetaProps> = ({ meta, onMetaChange }) => {
  // 状態管理
  const { title: initTitle, tags: initTags, summary: initSummary, author, created_at, updated_at } = meta;
  const [title, setTitle] = useState(initTitle);
  const [tags, setTags] = useState(initTags);
  const [summary, setSummary] = useState(initSummary);

  // MetaDataの変更を親へ通知
  useEffect(() => {
    onMetaChange({ title, tags, summary, author, created_at, updated_at });
  }, [title, tags, summary])
  
  // 入力時変更用ハンドラ
  const handleChange = (field: "title" | "tags" | "summary", value: string) => {
    switch(field) {
      case "title":
        setTitle(value);
        break;
      case "summary":
        setSummary(value);
        break;
      default:
        console.log("something wrong...")
        break;
    }
  }

  // タグ情報の更新
  const handleTagsChange = (updatedTags: string[]) => {
    setTags(updatedTags);
  }

  return (
    <div>
      <span className="w-full flex my-1">
        <label>タイトル：</label>
        <input
          type="text"
          id="edit-title"
          defaultValue={title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="タイトルを入力"
          className="border flex-1"
        />
      </span>

      <div className="my-1 w-full">
        <EditTags onTagsChange={handleTagsChange} initTags={tags} />
      </div>
      
      <span className="w-full flex my-1">
        <label>概　要：</label>
        <input
          type="text"
          id="edit-summary"
          defaultValue={summary}
          onChange={(e) => handleChange("summary", e.target.value)}
          placeholder="概要"
          className="border flex-grow"
        />
      </span>
    </div>
  )
}

export default EditMeta;