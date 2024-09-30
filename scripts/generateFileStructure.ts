import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// 手動でディレクトリのタイトルを設定する対応表
const directoryTitles: Record<string, string> = {
  "electro-dynamics": "電磁気学",
  "math-for-physics": "物理数学",
  "mechanics": "力学",
  "something-else": "その他",
};

// Markdownファイルからメタデータを取得
const getMarkdownTitle = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);
  return data.title || path.basename(filePath, '.md');
};

interface FileData {
  fileName: string;
  filePath: string;
  isDirectory: boolean;
  title?: string;
}

// ディレクトリを再帰的に読み込む関数 
const readDirectoryRecursively = (dir: string): FileData[] => {
  const result: FileData[] = [];
  const items = fs.readdirSync(dir);
  const projectRoot = process.cwd();

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const relativePath = path.posix.join(...path.relative(projectRoot, fullPath).split(path.sep));

    if (stat.isDirectory()) {
      const directoryTitle = directoryTitles[item] || item;
      result.push({ fileName: item, filePath: relativePath, isDirectory: true, title: directoryTitle });
      result.push(...readDirectoryRecursively(fullPath));
    } else if (item.endsWith('.md')) {
      const title = getMarkdownTitle(fullPath);
      result.push({ fileName: item, filePath: relativePath, isDirectory: false, title });
    } else {
      result.push({ fileName: item, filePath: relativePath, isDirectory: false });
    }
  });

  return result;
};

// ファイル構造を生成して保存する関数
const generateFileStructure = () => {
  // 記事のルートをプッシュ
  const rootItem = {
    "fileName": "articles",
    "filePath": "src/data/articles",
    "isDirectory": true,
    "title": "記事トップ"
  };
  const targetDirectory = path.join(process.cwd(), "src/data/articles");
  const newFileStructure = readDirectoryRecursively(targetDirectory)
  newFileStructure.unshift(rootItem);

  const outputPath = path.join(process.cwd(), "src/data/fileStructure.json");

  // ファイル構造を保存
  fs.writeFileSync(outputPath, JSON.stringify(newFileStructure, null, 2));
  console.log("ファイル構造を保存しました:", outputPath);
};

generateFileStructure();
