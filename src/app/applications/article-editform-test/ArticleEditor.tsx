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
  const [ref, setRef] = useState<RefItem[]>(initialRef);
  const [children, setChildren] = useState<Section[]>(initialChildren);

  // Articleの要素が変更される度に実行
  useEffect(() => {
    // 目次を更新
    const newToc=generateToc(children);
    console.log(newToc);

    // 親へ通知
    onArticleChange({
      type: "article",
      content: {
        meta,
        toc: newToc,
        ref,
      },
      children
    })
  }, [meta, ref, children]);

  return (
    <div className="border p-4">
      <EditMeta meta={meta} onMetaChange={setMeta} />
      <EditChildren children={children} onChildrenChange={setChildren} />
    </div>
  )
}

export default ArticleEditor;

function generateToc(sections: Section[]): TocItem[]{
  const toc: TocItem[] = [];

  // traverse関数
  function traverse(section: Section){
    // 現在のセクションをtocに追加
    toc.push({
      id: section.content.id,
      title: section.content.title,
    });

    // 子要素の分も追加
    if (section.children && section.children.length > 0){
      for (const child of section.children) {
        if (child.type==="section") {
          traverse(child);
        }
      }
    }
  }

  // 各セクションにtraverseする
  for (const section of sections) {
    traverse(section);
  }

  return toc;
}