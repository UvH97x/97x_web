// ArticleEditor.tsx

"use client";

import React, { useState, useEffect } from "react";

import EditMeta from "./EditMeta";
import EditChildren from "./EditChildren";

import { ArticleContent, RefItem, MetaContent, TocItem, Section }from "./article-edit-type";

interface ArticleEditorProps {
  article: ArticleContent;
  onArticleChange: (updateArticle: ArticleContent) => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onArticleChange }) => {
  // 初期値
  const { content: initialContent, children: initialChildren} = article;
  const { meta: initialMeta, toc: initialToc, ref: initialRef} = initialContent;

  // 状態管理
  const [meta, setMeta] = useState<MetaContent>(initialMeta);
  const [toc, setToc] = useState<TocItem[]>(initialToc);
  const [ref, setRef] = useState<RefItem[]>(initialRef);
  const [children, setChildren] = useState<Section[]>(initialChildren);

  // Articleが変更された際親へ通知
  useEffect(() => {
    onArticleChange({
      type: "article",
      content: {
        meta,
        toc,
        ref,
      },
      children
    })
  }, [meta, toc, ref, children]);

  return (
    <div className="border">
      <EditMeta meta={meta} onMetaChange={setMeta} />
      <EditChildren children={children} onSectionChange={setChildren} />
    </div>
  )
}

export default ArticleEditor;