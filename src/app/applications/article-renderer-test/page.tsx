import React from "react";
import fs from "fs";
import path from "path";
import Article from "@/src/components/article_renderer/Lv0/Article";

const ArticleTestPage = () => {
  // サーバー側で直接データを読み込む
  const filePath = path.join(process.cwd(), "src", "app", "applications", "article-renderer-test", "Article3.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const articleData = JSON.parse(jsonData);

  return (
    <div className="container mx-auto">
      <Article content={articleData.content} children={articleData.children} />
    </div>
  );
};

export default ArticleTestPage;
