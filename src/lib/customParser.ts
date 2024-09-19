import fs from "fs";
import matter from 'gray-matter';

export interface ParsedFile {
  title: string;
  createdAt: string;
  updatedAt?: string;
  references: string[];
  tags: string[];
  content: string;
}

export interface metaData {
  title: string;
  createdAt: string;
  tags: string[];
}

export function getMetaData(filePath: string): metaData {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContent);  // YAMLフロントマターのみを解析

  return {
    title: data.title,
    createdAt: data.created_at,
    tags: data.tags || [],
  };
}

export function getParsedFile(filePath: string): ParsedFile {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);  // gray-matterを使って解析

  return {
    title: data.title,
    createdAt: data.created_at,
    updatedAt: data.updated_at || null,  // 更新日がない場合はnull
    references: data.references || [],
    tags: data.tags || [],
    content: content.trim(),
  };
}