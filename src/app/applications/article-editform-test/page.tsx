// app/applications/artcle-editform-test/page.tsx

"use client";

import { useEffect, useState } from "react";

import Article from "@/src/components/article_renderer/Lv0/Article";
import { ArticleContent, RefItem, MetaContent, TocItem }from "./article-edit-type";

import ArticleEditor from "./ArticleEditor";

const nowDate = new Date();
const month = nowDate.getMonth().toString().padStart(2, '0');
const day = nowDate.getDate().toString().padStart(2, '0');
const year = nowDate.getFullYear().toString().padStart(4, '0');
const myDate = `${year}-${month}-${day}`;
console.log(myDate);

export default function Page() {
  const [article, setArticle] = useState<ArticleContent>({
    type: "article",
    content: {
      meta: {
        title: "",
        author: "UvH",
        tags: ["タグ１", "タグ２", "タグ３", "タグ４"],
        summary: "",
        created_at: myDate,
        updated_at: myDate,
      },
      toc: [],
      ref: [],
    },
    children: [],
  });
  
  return (
    <>
      <div className="border rounded-xl mb-4">
        <p className="text-3xl text-center">
          Article Edit Form Test Page.
        </p>
      </div>
      <div className="w-full h-full border md:grid md:grid-cols-2 md:gap-1">
        {/* 編集フォーム */}
        <ArticleEditor article={article} onArticleChange={setArticle} />
        {/* プレビュー */}
        <Article article={article} />
      </div>
    </>
  );
}