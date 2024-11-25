import React from "react";
import fs from "fs";
import path from "path";
import Article from "@/src/components/article_renderer/Lv0/Article";

const ArticleTestPage = () => {
  // サーバー側で直接データを読み込む
  const filePath = path.join(process.cwd(), "src", "app", "applications", "article-renderer-test", "Article.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const articleData = JSON.parse(jsonData);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Article Renderer Test</h1>
      <Article content={articleData.content} children={articleData.children} />
    </div>
  );
};

export default ArticleTestPage;
