// scripts/generateFileStructure.ts

import * as fs from 'fs';
import * as path from 'path';

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

// ファイル構造をチェックし、存在しないものを削除する関数
const cleanFileStructure = (fileStructure: FileData[]): FileData[] => {
  return fileStructure.filter(file => {
    const fullPath = path.join(process.cwd(), file.filePath);
    return fs.existsSync(fullPath); // ファイルやディレクトリが存在するか確認
  });
};

// ファイル構造を生成して保存する関数
const generateFileStructure = () => {
  const targetDirectory = path.join(process.cwd(), "src/data/articles");
  const newFileStructure = readDirectoryRecursively(targetDirectory);

  // 既存のファイル構造を読み込む（存在しない場合は新規作成）
  const outputPath = path.join(process.cwd(), "src/data/fileStructure.json");
  let existingFileStructure: FileData[] = [];

  if (fs.existsSync(outputPath)) {
    const fileContent = fs.readFileSync(outputPath, 'utf-8');
    existingFileStructure = JSON.parse(fileContent);
  }

  // 存在しないファイルやディレクトリを削除
  const cleanedFileStructure = cleanFileStructure(existingFileStructure);

  // 新しいファイル構造を統合して保存
  const updatedFileStructure = [...cleanedFileStructure, ...newFileStructure];

  fs.writeFileSync(outputPath, JSON.stringify(updatedFileStructure, null, 2));

  console.log("ファイル構造を保存しました:", outputPath);
};

// スクリプトを実行
generateFileStructure();