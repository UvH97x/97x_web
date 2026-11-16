---
title: "Typst 記法の数式サンプル"
author: "UvH"
created_at: "2026-11-17"
math: typst
references:
  - "Typlet, https://github.com/dbccccccc/Typlet"
  - "Typst Documentation: Math, https://typst.app/docs/reference/math/"
tags:
  - "Typst"
  - "数学"
excerpt: "フロントマターに math: typst を書くと、記事中の数式を Typst 記法で書ける。その動作確認用のサンプルである。"
---

## 使い方

フロントマターに `math: typst` を書くと、この記事の数式は KaTeX ではなく [Typlet](https://github.com/dbccccccc/Typlet) で描画される。区切り記号は TeX 記法の記事と同じで、`$...$` が行内数式、`$$...$$` がディスプレイ数式になる。

## 行内数式

質量とエネルギーの関係は $E = m c^2$ である。$alpha, beta, gamma$ のようなギリシャ文字や、$x in RR$ のような記号も書ける。

## ディスプレイ数式

ガウス積分：

$$
integral_(-oo)^oo e^(-x^2) dif x = sqrt(pi)
$$

和の公式：

$$
sum_(k=1)^n k = (n(n+1))/2
$$

## 行列と場合分け

$$
A = mat(a, b; c, d), quad det A = a d - b c
$$

$$
|x| = cases(x &"if" x >= 0, -x &"if" x < 0)
$$

## `#let` による定義

$$
#let RR = $bb(R)$
f: RR -> RR
$$

## 偏微分

球座標系のラプラシアンの動径成分：

$$
nabla^2 f = 1/r^2 partial/(partial r) (r^2 (partial f)/(partial r)) + dots.c
$$