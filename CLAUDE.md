# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語

ユーザーへの回答、およびドキュメント（`doc/` 配下、コードコメント、仕様メモなど）は日本語で書く。ドキュメント文体については「だ/である」調とし、回答は丁寧語でよい。

## 概要

Next.js 16（App Router）、React 19、TypeScript、Tailwind CSS 3 で構築した個人サイトである。UI と本文は日本語で、Vercel（Node 22）にデプロイしている。Markdown の学習ノート（記事）、数学・機械学習・統計の対話型シミュレーター、クライアント側だけで動く小さなアプリ（Todo アプリ）を公開している。

## コマンド

- `npm run dev`：開発サーバーを起動する。
- `npm run build`：本番ビルドを行う。主な動作確認もこれで行う。
- `npx tsc --noEmit`：型チェックを行う。tsconfig が `noEmit: false` / `outDir: dist` になっているため、`--noEmit` を明示する必要がある。
- テストフレームワークは無い。`npm run lint` は `next lint` を呼ぶが、Next 16 ではこのコマンドが廃止されており、ESLint も未導入のため動かない。

これまでの検証は、型チェックと本番ビルドの成功で確認している。

## アーキテクチャ

- **import**：エイリアス `@/*` はリポジトリのルートを指す。そのため import は `@/src/components/ui/...` の形になる。
- **レイアウト**：[src/app/layout.tsx](src/app/layout.tsx) が全ページを `AppShell`（[src/config/nav.ts](src/config/nav.ts) に基づくサイドバー）、`main`、`Container`、`SiteFooter` で包む。各ページは外側の余白や最大幅を独自に持たず、見出しには `PageHeader` を使う。
- **共通 UI**：[src/components/ui/](src/components/ui/) にある。`LinkCard`、`RangeField`（数値を通知するスライダー。対数変換・丸め・表示桁数は呼び出し側で指定する）、`SelectField`、`Tex`（KaTeX）、`Prose`、`useThemeColors` などである。あえて共通化しなかったもの（各シミュレーターの描画や再生・停止・リセットの処理）は [doc/component-refactoring.md](doc/component-refactoring.md) を参照する。
- **テーマ**：色は [src/app/global.css](src/app/global.css) の CSS 変数で定義し、[tailwind.config.ts](tailwind.config.ts) で Tailwind の色名として公開している（`bg-bg`、`bg-surface`、`text-fg`、`text-muted`、`text-accent`、`border-border`、グラフ用の `--plot-*`）。ダークモードは `<html>` に付く `dark` クラスで切り替える。このクラスはルートレイアウトのインラインスクリプトが描画前に付与し、`ThemeToggle` が切り替える（localStorage のキーは `theme`。未指定時は OS の設定に従う）。Canvas や Chart.js のコードは `useThemeColors` で色を読み、テーマ変更時に再描画されるようにする。色は直接書かずにこれらのトークンを使う。詳しくは [doc/site-style.md](doc/site-style.md) を参照する。

### 記事

記事は `src/data/articles/<genre>/<slug>.md` に置く Markdown ファイルで、YAML フロントマター（`title`、`author`、`created_at`、`updated_at`、`references`、`tags`、`excerpt`、省略可の `math`）を持つ。[src/lib/customParser.ts](src/lib/customParser.ts)（gray-matter）が解析し、`ArticleContent`（react-markdown に remark-math / rehype-katex、GFM、highlight.js を組み合わせたもの）が描画する。数式は既定では TeX 記法で書き、KaTeX が描画する。フロントマターに `math: typst` を書いた記事だけは Typst 記法で書き、Typlet（`rehype-typlet`）が描画する。どちらの記法でも区切り記号は `$...$`（行内）と `$$...$$`（ディスプレイ）である。Typlet が対応する構文は Typst の一部で、`show` ルールのほとんど、ループ、`context` などは使えない。数式中の CJK 文字はブラウザのフォントで近似して描画される。

記事・ジャンルの一覧、静的パラメータ、パンくずリストは、ディレクトリの走査ではなく**手作業で管理する**索引 [src/data/fileStructure.ts](src/data/fileStructure.ts) に基づく。記事を追加するときは、`.md` ファイルに加えてこのファイルへの登録も必要である（新しいジャンルならディレクトリの項目も追加する）。[next.config.mjs](next.config.mjs) は `.md` ファイルを出力トレースに含め、Vercel 上の実行時に読み込めるようにしている。

### シミュレーター

各シミュレーターは `src/app/simulators/<category>/<name>/` のルートで、必要なものをそのフォルダー内に持つ。構成は `page.tsx`（メタデータとクライアント側の入口）、UI コンポーネント（`Controls`、`PlotCanvas`、`Diagnostics` など）、ローカルの `lib/` に置く純粋なロジック（`model.ts`、`types.ts`）である。カテゴリーの一覧ページはリンクの配列を `SimulatorCatalog` に渡しており、新しいシミュレーターはそのカテゴリーページにも追加する。

統計の分布エクスプローラー（`simulators/statistics/distributions`）はプラグイン形式である。各分布は `lib/distributions/` 内の `DistributionDef` オブジェクト（`lib/types.ts` を参照）として書き、`lib/distributions/index.ts` に登録する（配列の順序が選択リストの順序で、先頭が既定の分布）。エクスプローラーの状態は `lib/urlState.ts` で URL のクエリに保存する。`ParamSpec.key` はクエリと名前空間を共有するため、`dist, samples, bins, seed, view, show, from, to` と衝突させてはならない。パラメータの `max` は、それより前に宣言したパラメータの関数として与えてよい。特殊関数とシード付き乱数は `lib/special.ts` と `lib/random.ts` にある。

### アプリ

Todo アプリ（`src/app/applications/todo`）はクライアント側だけで動き、`storage.ts` を通じて localStorage に保存する。`storage.ts` は旧形式の保存データの変換も担うため、`types.ts` を変更する際もこの変換が動き続けるようにする。

## 規約

- コミットメッセージには Conventional Commits の接頭辞（`feat:`、`fix:`、`refactor:`、`chore:`）を付ける。
