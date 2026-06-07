# 97x-website ホーム改修 仕様書

> 目的: 担当者が迷わずに実装できるよう、今回の変更範囲・方針・受け入れ条件・禁止事項を明文化する。
> デザイン方針は **ミニマル / エディトリアル + 技術アクセント** で確定。
> 作業は **Wave A(共通シェル)→ Wave B(ホーム再設計)** の順で行う。

---

## 0. 背景と目的

サイトの目的は次の4つ:

1. 学習メモを Web 講座風にまとめる
2. JS/TS ベースの可視化シミュレータを公開する
3. Web アプリ的なものを公開する
4. モダンなサイトデザインの練習

現状のホーム(`src/app/page.tsx`)は「タイトル + 紹介文 + カード3枚」のプレースホルダ段階で、上記4目的が伝わらない。共通シェル(layout / header / footer)は骨格は良好だが、フォント読み込み・head 管理・メタデータに非モダンな点が残る。本改修でシェルを近代化し(Wave A)、ホームをミニマル/エディトリアル方針で作り直す(Wave B)。

---

## 1. スコープ

### 対象(IN)

- `src/app/layout.tsx`
- `src/app/global.css`
- `tailwind.config.ts`
- `src/app/_components/SiteHeader.tsx`
- `src/app/_components/SiteFooter.tsx`
- `src/app/_components/LinkBlock.tsx`
- `src/app/page.tsx`
- `src/types/UvHTypes.ts`(`PageLink` 型の拡張のみ)
- (必要なら)`src/components/ui/` への小コンポーネント追加

### 非対象(OUT) — 本改修では触らない

- `tsconfig.json` の積み残し(`noEmit`/`outDir`/`ts-node`)
- `ts-node` / `@types/fs-extra` の依存整理
- `next.config.mjs` の `images.remotePatterns` 整理
- 数式レンダリング(KaTeX / MathJax / Typst→SVG)の統合
- ダークモード対応
- ルート(URL)のリネーム(例: `/datas`)
- 記事・シミュレータ一覧の動的取得(「最近の更新」等のデータ連携)

> これらは別ウェーブ。本改修の差分に混ぜないこと。

---

## 2. 前提環境(バージョン変更禁止)

| 項目 | 値 |
|---|---|
| Next.js | 16.2.7(dev/build とも Turbopack がデフォルト。`--turbopack` フラグ不要) |
| React / react-dom | 19.2.7 |
| TypeScript | 5.x |
| Tailwind CSS | 3.4.x(+ `@tailwindcss/typography`) |
| Node | 22.x(`engines.node` と Vercel 設定を一致させたまま) |
| ルーティング | App Router(route group `(app_like)` / `(article_like)` を使用) |

**本改修で依存パッケージの追加・更新・削除は行わない**(next/font は Next 本体に同梱のため追加不要)。

---

## 3. デザイン方針: ミニマル / エディトリアル

考え方: 余白広め、ヘアライン(1px)の罫線、抑えたアクセント1色、見出しは明朝(serif)・本文はサンセリフ(sans)。装飾過多を避け、コンテンツ(数学・物理・ML)に合う落ち着いた印象にする。

### 3.1 デザイントークン(確定値)

| トークン | 推奨値 | 用途 | 備考 |
|---|---|---|---|
| 背景 | `#ffffff` | ページ地 | Tailwind `bg-white` |
| インク(本文) | `slate-900` | 本文・見出し | |
| サブテキスト | `slate-500` / `slate-600` | 補足・フッタ | |
| 罫線 | `slate-200` | 区切り・カード枠 | ヘアライン |
| アクセント | `--accent: #3b5bdb`(indigo 系) | リンク/現在地/小さな強調 | **1色のみ。差し替え可** |
| 見出しフォント | Noto Serif JP | h1/h2 等 | `--font-serif` |
| 本文/UIフォント | Noto Sans JP | body, nav, card | `--font-sans` |
| 等幅フォント | 既存(highlight.js 経由) | コード | 変更なし |

### 3.2 タイポグラフィスケール(目安)

- ヒーロー見出し(サイト名): `text-5xl sm:text-6xl` + serif + `font-bold`
- セクション見出し: `text-2xl sm:text-3xl` + serif
- 本文: `text-base sm:text-lg` + sans + `leading-relaxed`
- 補足/フッタ: `text-sm` + `text-slate-500`

### 3.3 レイアウト幅

- 読み物系(Prose/紹介文): `max-w-3xl`(既存 `Container` のまま)
- ホームのカードグリッド等: `max-w-5xl`(やや広め)
- ヘッダ/フッタの内側: `max-w-6xl`(既存維持)

### 3.4 モーション

- 既存のカード hover lift(`hover:scale-105` 程度)を踏襲。控えめに。
- 過度なアニメーションは入れない。

---

## 4. 情報設計(IA)の確定

現状はヘッダ nav が6項目、ホームのカードが3項目で不一致。以下に統一する。

- **一次導線(ホームでカード表示):** Articles / Simulators / Applications
- **二次導線(ホームでは控えめなテキストリンク、nav/フッタにも残す):** About / Data
- **表示ラベルの修正:** `Datas` → **`Data`**(表示文言のみ。**ルート `/datas` は変更しない**)
- nav の並び順(確定): Home / Articles / Simulators / Applications / About / Data
  - 「Home」はロゴからも辿れるが nav にも残す。

---

## 5. Wave A: 共通シェルのモダン化

全ページに効く低リスク改修。**Wave B より先に完了させる。**

### A-1. フォントを `next/font` 化

**対象:** `layout.tsx`, `global.css`, `tailwind.config.ts`

- `global.css` の `@import url('https://fonts.googleapis.com/...Noto+Serif+JP...')` を**削除**(レンダーブロッキング/CLS の原因)。
- `layout.tsx` で `next/font/google` を使い、CSS 変数として注入する。

参考スニペット(最終コードは実装時に確定):

```ts
// layout.tsx
import { Noto_Serif_JP, Noto_Sans_JP } from 'next/font/google'

const serif = Noto_Serif_JP({
  weight: ['500', '700'],
  display: 'swap',
  preload: false,        // ★ 日本語フォントは subset が大きく preload 不可。必須。
  variable: '--font-serif',
})
const sans = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false,        // ★ 同上
  variable: '--font-sans',
})
```

```tsx
// <body> に変数クラスを付与
<body className={`${serif.variable} ${sans.variable} min-h-dvh bg-white text-slate-900 flex flex-col font-sans`}>
```

```ts
// tailwind.config.ts(theme.extend に追記)
import defaultTheme from 'tailwindcss/defaultTheme'
// ...
fontFamily: {
  sans:  ['var(--font-sans)',  ...defaultTheme.fontFamily.sans],
  serif: ['var(--font-serif)', ...defaultTheme.fontFamily.serif],
},
colors: {
  accent: { DEFAULT: '#3b5bdb' },
},
```

> **注意:** 日本語 Google フォントは `subsets` の小さな分割が無いため、`preload: false` を付けないとビルドエラー(Preload is enabled but no subsets were specified)になる。必ず付ける。

**受け入れ条件:**
- [ ] `global.css` に Google Fonts への `@import` が残っていない
- [ ] 見出しに serif、本文に sans が適用される
- [ ] DevTools の Network でフォントの外部リクエスト(fonts.googleapis.com)が発生しない
- [ ] 初回表示でフォント起因の大きなレイアウトシフトが無い

### A-2. `viewport` の手書き `<head>` を撤去

**対象:** `layout.tsx`

- `<head><meta name="viewport" .../></head>` を**削除**。App Router は同等の viewport を既定で挿入する。
- カスタムが要る場合のみ `export const viewport: Viewport = { width: 'device-width', initialScale: 1 }` を使う(基本は削除のみでよい)。

**受け入れ条件:**
- [ ] `layout.tsx` に手書き `<head>` が無い
- [ ] レンダリング後の HTML に viewport meta が1つだけ存在する

### A-3. メタデータの `title` テンプレート化

**対象:** `layout.tsx`

```ts
export const metadata: Metadata = {
  title: { default: '97x', template: '%s | 97x' },
  description: '...',
}
```

- 各ページは `title: '記事'` のように短い文字列を返すだけで `記事 | 97x` になる。

**受け入れ条件:**
- [ ] ルートで `<title>97x</title>`、子ページで `〇〇 | 97x` になる

### A-4. `*` リセットの削除

**対象:** `global.css`

- 先頭の `* { margin:0; padding:0; box-sizing:border-box }` を**削除**(Tailwind Preflight が同等処理を持つため重複)。
- `@tailwind base; @tailwind components; @tailwind utilities;` は残す。
- 必要なアクセント等の CSS 変数定義はここに置いてよい(例 `:root { --accent: #3b5bdb; }`)。

**受け入れ条件:**
- [ ] `global.css` に手書きの universal リセットが無い
- [ ] 既存ページの余白が大きく崩れていない(目視)

### A-5. ヘッダの微修正

**対象:** `SiteHeader.tsx`

- ロゴの `<img src="/favicon.ico">` を見直す。最低限 `alt` を付与し、可能なら専用ロゴ(SVG)へ差し替え。`width`/`height` は明示。
- nav ラベルを §4 の IA に合わせる(並び順 + `Datas`→`Data`)。
- active/hover の見た目をトークン(アクセント色)に合わせる(`ActiveLink` 側で対応可)。

**受け入れ条件:**
- [ ] ロゴ画像に `alt` がある
- [ ] PC/モバイル両方の nav が §4 の項目・並び・ラベルになっている

### A-6. フッタの微修正

**対象:** `SiteFooter.tsx`

- `@ {year}` → `© {year}`
- GitHub リンクに `rel="noopener noreferrer"` を付与(`target="_blank"` 使用のため)。`aria-label` 付与も推奨。

**受け入れ条件:**
- [ ] `©` 表記になっている
- [ ] 外部リンクに `rel="noopener noreferrer"` がある

### A-7.(任意)`ActiveLink` の一致判定の微調整

**対象:** `ActiveLink.tsx`

- 現状 `pathname.startsWith(href)` はセグメント境界を見ないため、将来 `/art` と `/articles` のような prefix 衝突の余地がある。余裕があれば境界判定(`pathname === href || pathname.startsWith(href + '/')`)に変更。**任意。**

---

## 6. Wave B: ホーム再設計(`src/app/page.tsx`)

ミニマル/エディトリアルで、4目的が一目で伝わる構成にする。

### 6.1 ページ構成(上から)

1. **ヒーロー**
   - サイト名 `97x`(serif, 大きめ)
   - 1行のタグライン(サイトの目的を端的に)
   - 補足1〜2文(現在の英語の謝罪文は短く整理。文面は §10 で要確認)
2. **主要セクション(カードグリッド)**
   - Articles / Simulators / Applications の3枚
   - 各カード: アイコン + タイトル + 短い説明文(1行)
   - レイアウト: `max-w-5xl` 内で `grid` 1→2→3列のレスポンシブ
3. **二次導線**
   - About / Data への控えめなテキストリンク(小さめ・サブカラー)
4. (任意・将来)「最近の更新」: データ連携が要るため**本改修では作らない**(プレースホルダも置かない)。

### 6.2 コンポーネント方針

- `PageLink` 型に **任意プロパティ `description?: string`** を追加。
- `LinkBlock` を拡張して `description` を表示できるようにする(無い場合は従来表示)。
  - もしくは新規 `FeatureCard` を `src/components/ui/` に作って `LinkBlock` は現状用途に温存してもよい。**どちらか一方に統一**し、二重実装にしないこと。
- カード見た目: ヘアライン枠 `border-slate-200`、`rounded-lg`、`p-5〜6`、hover で軽い lift と `shadow`。アクセントは hover 時の枠/タイトル程度に留める。

### 6.3 import の整合(ついで修正)

- `page.tsx` の import が alias(`@/src/...`)と相対(`../components/...`)で混在。**どちらかに統一**(プロジェクト既定の `@/` alias 推奨)。

### 6.4 受け入れ条件

- [ ] ヒーロー・カードグリッド・二次導線の3ブロックが存在する
- [ ] カードは Articles / Simulators / Applications の3枚で、各々に1行説明がある
- [ ] 1列(モバイル)→ 2列 → 3列に折り返す
- [ ] 見出しが serif、本文/カードが sans
- [ ] About / Data への導線がホームから辿れる(§4 の IA と一致)
- [ ] `page.tsx` の import スタイルが統一されている

---

## 7. 触ってはいけない地雷 / 制約

- **`npm audit fix --force` を実行しない。** Next を 9 系へダウングレードしようとする(既知の罠)。残存している moderate 脆弱性は Next 内部の `postcss` 由来で、意図的に放置。
- **Prism / `react-syntax-highlighter` を再導入しない。** ハイライトは `rehype-highlight`(highlight.js 11)で統一済み。`Prism.highlightAllUnder` 等の DOM 直接操作はハイドレーションエラーの原因。
- 既に削除済みのパッケージを再インストールしない(`react-syntax-highlighter`, `prismjs`, `next-mdx-remote`, `@svgr/webpack` 等)。
- 依存パッケージのバージョンを上げ下げしない(本改修はコード変更のみ)。
- ルート URL を変更しない(`/datas` の表示ラベルだけ `Data` に)。

---

## 8. 検証手順(Definition of Done)

1. `npm run dev` で起動し、以下を目視:
   - `/`(ホーム)が新レイアウトで表示される
   - nav の全リンク(`/`, `/articles`, `/simulators`, `/applications`, `/about`, `/datas`)が 404 にならず開く
   - モバイル幅でハンバーガー(`<details>`)が機能し、カードが1列に折り返す
2. ブラウザ DevTools:
   - Console にハイドレーション警告が出ていない
   - Network に fonts.googleapis.com への外部リクエストが無い
3. `npm run build` が成功する(Turbopack デフォルト)。
4. `<title>` がルート/子ページで §A-3 の通りになっている。
5. Wave A / Wave B はそれぞれ別コミット(できれば別 PR)に分け、差分を読みやすく保つ。

---

## 9. 作業順序(推奨)

1. Wave A を A-1 → A-6 の順に実施し、§8 の 1〜4 を通す。
2. ここで一度コミット/プレビュー確認(Vercel preview が green か)。
3. Wave B を実施し、再度 §8 を通す。
4. `main` へマージ。

---

## 10. 未確定事項(オーナー確認が必要)

実装着手前に以下を確定すること。未確定のままなら、暫定値で進めて PR コメントに明記する。

- [ ] **ヒーローのコピー文**: タグライン1行 + 補足文。現状の英語謝罪文を残す/短縮する/和文にする、のいずれか。
- [ ] **言語**: ホームの主要文言は日本語ベースか、日英併記か。
- [ ] **アクセント色**: `#3b5bdb`(indigo)でよいか、別色か。
- [ ] **ロゴ**: `favicon.ico` 流用のままか、専用ロゴ(SVG)を用意するか。
- [ ] **カード説明文**: Articles / Simulators / Applications それぞれの1行説明の文面。
- [ ] **Wave B を今回まで含めるか**、Wave A だけ先に出して Wave B は次サイクルにするか。
