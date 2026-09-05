# 共通レイアウトとテーマ

## ページ構造

`src/app/layout.tsx` が全ページの `AppShell`・`main`・`Container`・`SiteFooter` を提供する。
旧 `(app_like)` / `(article_like)` は撤去し、`articles`・`applications`・`simulators` などを `src/app` 直下へ移動した。URLは変更しない。

- 外側余白：`Container` で左右16 / 24 / 32px、上下32 / 40px。最大幅は80rem。
- ページ見出し：`PageHeader` で24 / 30px、太字、下余白32px。説明文は16px・`text-muted`。
- 記事本文とTodo：内側の最大幅48rem。シミュレーターは共通コンテナの幅を使用し、狭い画面では操作欄を縦に並べる。
- カード：`LinkCard`。ページ別のスタイル分岐は持たない。
- スライダー：`RangeField`。入力の色・つまみ・フォーカス表示も共通化する。

## 配色

`src/app/global.css` のCSS変数と `tailwind.config.ts` の色定義を使う。

| 用途 | クラス / 変数 |
| --- | --- |
| ページ背景 | `bg-bg` |
| カード・補助背景 | `bg-surface` |
| 本文・見出し | `text-fg` |
| 説明・補足 | `text-muted` |
| リンク・操作の強調 | `text-accent` |
| 区切り線 | `border-border` |
| 統計グラフと凡例 | `--plot-hist` / `--plot-ih` / `--plot-gauss` |

記事のProse、コードハイライト、入力欄、Todoの状態表示、履歴、SVGにも明暗両方の配色を適用する。
Chart.jsとCanvasは `useThemeColors` でテーマの変更を監視して描画を更新する。
グラフ系列や成功・削除など意味を持つ色は区別を維持する。

## テーマ選択

保存済みの明暗選択を優先し、未指定時はOS設定に追従する。
別タブからの変更も反映し、localStorageが使用できなくても切り替えを可能にする。
`color-scheme` を指定し、ネイティブの日付入力や選択肢もテーマに合わせる。

## 検証範囲

本番ビルドとTypeScript型チェックが成功。記事5件を含む20 URLでHTTP 200・共通見出し・main/footer各1個を確認した。
テーマ切り替えのロジック（OS設定・明示的選択・別タブ同期・保存エラー・監視の解除）も検証済み。
本文・補足・リンク色とページ/カード背景の12組は、計算上のコントラスト比4.5:1以上。
今回、Computer UseがブラウザーURLを判定できず停止したため、実ブラウザーでの見た目とモバイル操作の確認は未実施。
