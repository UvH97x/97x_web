// src/app/api/math-to-svg/route.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

import { cleanupTmpDir } from '@/src/lib/cleanupTmpDir';

// execをPromiseベースに変換
const execAsync = promisify(exec);

// コンパイルの結果のインターフェイス
interface CompileResult {
  success: boolean;
  svg?: string;
  error?: string;
  compilationLog?: string;
}

// 本番環境か開発環境かを判別
function isProductionEnvironment(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  const isWindowsPath = process.cwd().startsWith('C:\\');

  // NODE_ENVが'production'の場合は本番環境、それ以外は開発環境
  // また、Windowsのパスで始まる場合は開発環境と仮定
  return isProduction && !isWindowsPath;
}

// 一時ディレクトリの存在確認と作成
async function ensureDirectory(checkDir: string): Promise<void> {
  if (!existsSync(checkDir)) {
    await mkdir(checkDir, { recursive: true });
  }
}

// Typstファイルの内容を生成する関数
async function createTypstFile(typstFile: string, mathExpression: string): Promise<void> {
  // サイズ変更等Typstルールの設定はここで
  const typstContent = `
    #set page(width: auto, height: auto, margin: 0pt)
    #show math.equation: set text(fill: black)
    #show math.equation.where(block: true): set text(size: 14pt)
    $ display(${mathExpression}) $
  `;
  await writeFile(typstFile, typstContent);
}

// Typstコンパイルを実行する関数
async function executeTypstCompile(typstFile: string, svgFile: string): Promise<{ stdout: string, stderr: string }> {
  return execAsync(`typst compile ${typstFile} ${svgFile}`);
}

// SVGファイルを読み込む関数
async function readSvgFile(svgFile: string): Promise<string> {
  return readFile(svgFile, 'utf-8');
}

// Typstコンパイルのフロー全体を処理する関数
async function compileTypst(
  typstFile: string, 
  svgFile: string, 
  mathExpression: string
): Promise<CompileResult> {
  try {
    // Typstファイルの作成
    await createTypstFile(typstFile, mathExpression);
    
    // Typstのコンパイルを実行
    const { stdout, stderr } = await executeTypstCompile(typstFile, svgFile);

    // SVGファイルの存在を確認し、読み込む
    if (existsSync(svgFile)) {
      const svgContent = await readSvgFile(svgFile);
      return {
        success: true,
        svg: svgContent,
        compilationLog: `stdout: ${stdout}\nstderr: ${stderr}`,
      };
    } else {
      return {
        success: false,
        error: 'SVG file was not generated',
        compilationLog: `stdout: ${stdout}\nstderr: ${stderr}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      compilationLog: `Error during compilation: ${error}`,
    };
  }
}

// APIのエントリーポイント
export async function POST(req: Request) {
  try {
    const { fileName, mathExpression } = await req.json();  // ファイル名とtypstコードを取得

    if (!fileName || !mathExpression) {
      return NextResponse.json(
        { error: 'fileName and mathExpression are required' },
        { status: 400 }
      );
    }

    // 環境の判別
    const isProductionEnv = isProductionEnvironment();

    // 公開ディレクトリのパス設定
    const publicDir = path.join(process.cwd(), 'public', 'articles', 'math');
    const svgFile = path.join(publicDir, `${fileName}.svg`);

    // 開発環境でのコンパイル処理
    if (!isProductionEnv) {
      // 一時ファイルのパス設定
      const tmpDir = path.join(process.cwd(), 'tmp');
      const typstFile = path.join(tmpDir, `${fileName}.typ`);

      // 一時ディレクトリの確認・作成
      await ensureDirectory(publicDir);
      await ensureDirectory(tmpDir);

      // 一時ディレクトリのクリーンアップ
      await cleanupTmpDir(tmpDir, 100); // 100ファイル以下を許容
      
      // Typstのコンパイルを実行
      const result = await compileTypst(typstFile, svgFile, mathExpression);

      if (!result.success) {
        return NextResponse.json({
          error: result.error,
          compilationLog: result.compilationLog,
        }, { status: 500 });
      }
    }
    
    
    if (existsSync(svgFile)) {
      const svgContent = await readFile(svgFile, "utf-8");
      return new NextResponse(svgContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      });
    } else {
      return NextResponse.json({
        error: "SVG file not found",
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Error converting math to SVG or reading SVG',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

