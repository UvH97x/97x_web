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
    <div className="md:grid md:grid-cols-4 md:gap-4">
      <span className="hidden md:border md:col-span-1 md:block" />
      <span className="mr-4 md:col-span-3">
        <Article content={articleData.content} children={articleData.children} />
      </span>
    </div>
  );
};

export default ArticleTestPage;
