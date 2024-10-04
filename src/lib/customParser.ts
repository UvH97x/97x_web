// src/lib/customParser.ts
// 指定したMDXファイルを解析し、オブジェクトをかえす


import fs from "fs";
import matter from 'gray-matter';

// ファイル全ての型
export interface ParsedFile {
  title: string;        // タイトル
  author: string;       // 著者
  createdAt: string;    // 作成日
  updatedAt?: string;   // 更新日
  references: string[]; // 参考文献
  tags: string[];       // タグ
  excerpt?: string;     // 概要
  content: string;      // 本文
}

// パスを指定して、記事のあらゆる情報を解析して返す。
export function getParsedFile(filePath: string): ParsedFile {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);  // gray-matterを使って解析

  // 概要をメタデータから取得するか、本文の最初の150文字を使用
  const excerpt = data.excerpt || content.slice(0, 150).trim() + '...';

  /*
  * 確認用
  console.log("In getParsedFile function, data: \n");
  console.log(data);
  */

  return {
    title: data.title,
    author: data.author,
    createdAt: data.created_at,
    updatedAt: data.updated_at || null,  // 更新日がない場合はnull
    references: data.references || [],
    tags: data.tags || [],
    excerpt,  // 概要を追加
    content: content.trim(),
  };
}

// メタデータのみの型
export interface metaData {
  title: string;
  createdAt: string;
  tags: string[];
}

// メタデータのみを取得。記事の本文はいらないが、タイトルなどが必要なときに使用。
export function getMetaData(filePath: string): metaData {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContent);  // YAMLフロントマターのみを解析

  return {
    title: data.title,
    createdAt: data.created_at,
    tags: data.tags || [],
  };
}