// app/applications/artcle-editform-test/page.tsx

"use client";

import { useEffect, useState } from "react";

import Article from "@/src/components/article_renderer/Lv0/Article";
import { ArticleContent, RefItem, MetaContent, TocItem }from "./article-edit-type";

import childrenSample from "./sample-article";

import ArticleEditor from "./ArticleEditor";

const nowDate = new Date();
const month = nowDate.getMonth().toString().padStart(2, '0');
const day = nowDate.getDate().toString().padStart(2, '0');
const year = nowDate.getFullYear().toString().padStart(4, '0');
const myDate = `${year}-${month}-${day}`;
console.log(myDate);

export default function Page() {
  const [article, setArticle] = useState<ArticleContent>({"type": "article",
  "content": {
    "meta": {
      "title": "JSONデータを記事へレンダリングするコンポーネントの実装テスト",
      "author": "UvH",
      "created_at": "2023-11-24",
      "updated_at": "2024-12-05",
      "summary": "　この記事は、JSON構造をレンダリングするReactコンポーネントのテスト用です。字体はNoto Serif JPを使用しています。",
      "tags": ["プログラミング", "JSON", "Next.js", "JavaScript"]
    },
    "toc": [
      { "id": "section:1",   "title": "概要" },
      { "id": "section:2",   "title": "機能" },
      { "id": "section:2-1", "title": "折り畳みコンテンツ" },
      { "id": "section:2-2", "title": "枠付きコンテンツ" },
      { "id": "section:2-3", "title": "機能ブロック" },
      { "id": "section:2-3-1", "title": "表ブロック" },
      { "id": "section:2-3-2", "title": "画像ブロック" },
      { "id": "section:2-3-3", "title": "コードブロック" },
      { "id": "section:3", "title": "まとめ" }
    ],
    "ref": [
      {
        "id": "reference:1",
        "title": "React公式ドキュメント",
        "src": "https://reactjs.org",
        "author": "Meta",
        "refered_at": "2024-11-24",
        "caption": "Reactに関する詳細なドキュメント"
      }
    ]
  },
  "children": childrenSample
  });
  
  return (
    <>
      <div className="overflow-y-hidden border md:grid md:grid-cols-2 md:gap-1">
        {/* 編集フォーム */}
        <div className="overflow-y-auto">
          <ArticleEditor article={article} onArticleChange={setArticle} />
        </div>
        
        {/* プレビュー */}
        <div className="p-4 overflow-y-auto">
          <Article article={article} />        
        </div>
      </div>
    </>
  );
}