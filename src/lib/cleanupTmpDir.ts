import fs from 'fs/promises';
import path from 'path';

// tmpディレクトリのファイル数がmaxFilesを超えた場合、古い順に削除する関数
export async function cleanupTmpDir(tmpDir: string, maxFiles: number) {
  try {
    // ディレクトリ内のファイル一覧を取得
    const files = await fs.readdir(tmpDir);
    
    // ファイルがmaxFilesを超えている場合に削除を開始
    if (files.length > maxFiles) {
      // ファイル情報の取得 (ファイル名 + 作成日時)
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(tmpDir, file);
          const stats = await fs.stat(filePath);
          return { filePath, mtime: stats.mtime }; // 最終更新日時
        })
      );

      // 最終更新日時の古い順にソート
      fileStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

      // 古いファイルから削除
      const filesToDelete = fileStats.slice(0, files.length - maxFiles);
      await Promise.all(filesToDelete.map(f => fs.unlink(f.filePath)));
      
      // コンソールからお知らせ
      console.log(`Deleted ${filesToDelete.length} old files from tmp directory.`);
    }
  } catch (error) {
    console.error(`Error during tmp directory cleanup: ${error}`);
  }
}