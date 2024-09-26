// scripts/generateFileStructure.ts

import fs from 'fs'; // ESモジュール
import path from 'path'; // ESモジュール

interface FileData {
  fileName: string;
  filePath: string;
  isDirectory: boolean;
}

// ディレクトリを再帰的に読み込む関数
const readDirectoryRecursively = (dir: string): FileData[] => {
  const result: FileData[] = [];

  const items = fs.readdirSync(dir);
  const projectRoot = process.cwd(); // プロジェクトのルートを取得

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // プロジェクトルートからの相対パスを計算し、区切り文字を `/` に統一
    const relativePath = path.posix.join(...path.relative(projectRoot, fullPath).split(path.sep));

    if (stat.isDirectory()) {
      result.push({ fileName: item, filePath: relativePath, isDirectory: true });
      result.push(...readDirectoryRecursively(fullPath));
    } else {
      result.push({ fileName: item, filePath: relativePath, isDirectory: false });
    }
  });

  return result;
};


// ファイル構造を生成して保存する関数
const generateFileStructure = () => {
  const targetDirectory = path.join(process.cwd(), "src/data/articles");
  const fileStructure = readDirectoryRecursively(targetDirectory);

  // JSONファイルとして保存
  const outputPath = path.join(process.cwd(), "src/data/fileStructure.json");
  fs.writeFileSync(outputPath, JSON.stringify(fileStructure, null, 2));

  console.log("ファイル構造を保存しました:", outputPath);
};

// スクリプトを実行
generateFileStructure();