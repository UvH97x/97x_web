import fs from "fs";
import path from "path";

// 指定されたディレクトリ内の特定の拡張子を持つファイル名を取得する非同期関数
export function getFilesWithExtensionAsync(directory: string, extension: string, callback: (files: string[]) => void) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error("ディレクトリの読み取りに失敗しました:", err);
      return;
    }

    // 指定した拡張子でフィルタリング
    const filteredFiles = files.filter(file => path.extname(file) === extension);

    // 結果をコールバックで返す
    callback(filteredFiles);
  });
}

// 指定されたディレクトリ内の特定の拡張子を持つファイル名を取得する同期関数
export function getFilesWithExtensionSync(directory: string, extension: string): string[] {
  try {
    // 同期的にディレクトリの内容を読み取る
    const files = fs.readdirSync(directory);

    // 指定した拡張子でフィルタリング
    return files.filter(file => path.extname(file) === extension);
  } catch (err) {
    console.error("ディレクトリの読み取りに失敗しました:", err);
    return [];
  }
}
