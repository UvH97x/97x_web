---
title: "Rustを用いたWindowsへのTypstインストール"
author: "UvH"
created_at: "2024-09-21"
#updated_at: "2024-09-20"  # 更新日がない場合はこの行を省略
references:
  - "Typst-github, https://github.com/typst/typst"
  - "rustup, https://rustup.rs/"
tags:
  - "プログラミング"
  - "typst"
  - "Rust"
excerpt: "TypstをRustツールチェインからインストールしたときのメモ"
---

## 環境
- Windows 11 23H2
- cargo 1.81.0 (https://rustup.rs/ からrustup-init.exeをダウンロード・実行)

## 手順
```bash
cargo install --git https://github.com/typst/typst --locked typst-cli
```
を実行。そこそこ時間がかかった(特に最後の2ステップが)。

```bash
typst --version
```
が通れば成功。

## 失敗
```bash
cargo install --locked typst-cli
```
も試したが、コンパイルエラーでうまくいかなかった。

```bash
winget install --id Typst.Typst
```
は.exeが見当たらず、パスをどう通せばいいかもわからず断念。