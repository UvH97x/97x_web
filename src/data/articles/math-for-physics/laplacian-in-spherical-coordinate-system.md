---
title: "球座標系におけるラプラシアン"
author: "UvH"
created_at: "2024-09-21"
updated_at: "2024-10-07"  # 更新日がない場合はこの行を省略
tags:
  - "物理"
  - "数学"
  - "ラプラシアン"
excerpt: "球座標系におけるラプラシアンを直交座標系からの変換として求める"
---

## 直交座標系から球座標系へのラプラシアンの変換

直交座標系におけるラプラシアンは以下の通り。
$$
\nabla^{2} = \frac{\partial^{2}}{\partial x^{2}} + \frac{\partial^{2}}{\partial y^{2}} + \frac{\partial^{2}}{\partial z^{2}}
$$
これを球座標系$(r, \theta, \phi )$へ変換する。

二つの座標系との関係は以下の通り。
$$
\begin{aligned}
  x &= r \sin \theta \cos \phi \\
  y &= r \sin \theta \sin \phi \\
  z &= r \cos \theta
\end{aligned}
$$
よって
$$
\begin{aligned}
  r^{2} &= x^{2} + y^{2} + z^{2} \\
 \cos^{2} \theta &= z(x^{2} + y^{2} + z^{2})^{-1} \\
 \tan \phi &= x^{-1}y
\end{aligned}
$$
三つの式を$x, y, z$ですべて偏微分する。

## 一階微分
### r:
$$
\begin{aligned}
  2r \frac{\partial r}{\partial x} = 2x \\
  2r \frac{\partial r}{\partial y} = 2y \\
  2r \frac{\partial r}{\partial z} = 2z
\end{aligned}
$$
より、
$$
\begin{aligned}
 \frac{\partial r}{\partial x} &= \frac{x}{r} = \sin \theta \cos \phi \\
 \frac{\partial r}{\partial y} &= \frac{y}{r} = \sin \theta \sin \phi \\
 \frac{\partial r}{\partial z} &= \frac{z}{r} = \cos \theta
\end{aligned}
$$

### $\theta$:
$$
\begin{aligned}
  -\sin \theta \frac{\partial \theta}{\partial x} &=
  z ( - \frac{1}{2} (x^{2} + y^{2} + z^{2})^{- \frac{3}{2}} \cdot 2x ) \\ &=
  -x z(x^{2} + y^{2} + z^{2})^{- \frac{3}{2}} \\
  -\sin \theta \frac{\partial \theta}{\partial y} &=
  z ( - \frac{1}{2} (x^{2} + y^{2} + z^{2})^{- \frac{3}{2}} \cdot 2y ) \\ &=
  -y z(x^{2} + y^{2} + z^{2})^{- \frac{3}{2}} \\
  -\sin \theta \frac{\partial \theta}{\partial z} &=
  z ( - \frac{1}{2} (x^{2} + y^{2} + z^{2})^{- \frac{3}{2}} \cdot 2z ) +
  (x^{2} + y^{2} + z^{2})^{- \frac{1}{2}} \\ &= \frac{x^{2} + y^{2}}{(x^{2} + y^{2} + z^{2})^{\frac{3}{2}}}
\end{aligned}
$$
より、
$$
\begin{aligned}
 \frac{\partial \theta}{\partial x} &=
 \frac{x z}{r^{3} \sin \theta}  \\ &=
 \frac{r \sin \theta \cos \phi \cdot r \cos \theta}{r^{3} \sin \theta} \\ &=
 \frac{\cos \theta \cos \phi}{r} \\
 \frac{\partial \theta}{\partial y} &=
 \frac{y z}{r^{3} \sin \theta} \\ &=
 \frac{r \sin \theta \sin \phi \cdot r \cos \theta}{r^{3} \sin \theta} \\ &=
 \frac{\cos \theta \sin \phi}{r} \\
 \frac{\partial \theta}{\partial z} &=
   - \frac{x^{2} + y^{2}}{r^{3} \sin \theta} \\ &=
   - \frac{r^{2} \sin^{2} \theta \cos^{2} \phi + r^{2} \sin^{2} \theta \sin^{2} \phi}{r^{3} \sin \theta} \\ &=
   - \frac{\sin \theta}{r}
\end{aligned}
$$

### $\phi$:
$$
\begin{aligned}
 \frac{1}{\cos^{2} \phi} \frac{\partial \phi}{\partial x} &= -x^{-2}y \\
 \frac{1}{\cos^{2} \phi} \frac{\partial \phi}{\partial y} &= x^{-1} \\
 \frac{1}{\cos^{2} \phi} \frac{\partial \phi}{\partial z} &= 0
\end{aligned}
$$
より、
$$
\begin{aligned}
 \frac{\partial \phi}{\partial x} &= - \frac{r \sin \theta \sin \phi}{r^{2}\sin^{2} \theta \cos^{2} \phi} \cos^{2} \phi \\ &= - \frac{\sin \phi}{r \sin \theta} \\
 \frac{\partial \phi}{\partial y} &= \frac{1}{r \sin \theta \cos \phi} \cos^{2} \phi \\ &= \frac{\cos \phi}{r \sin \theta} \\
 \frac{\partial \phi}{\partial z} &= 0
\end{aligned}
$$

### 一階微分の結果まとめ
$$
\begin{aligned}
 \frac{\partial r}{\partial x} &= \sin \theta \cos \phi \\
 \frac{\partial r}{\partial y} &= \sin \theta \sin \phi \\
 \frac{\partial r}{\partial z} &= \cos \theta
\end{aligned}
$$
$$
\begin{aligned}
 \frac{\partial \theta}{\partial x} &= \frac{\cos \theta \cos \phi}{r} \\
 \frac{\partial \theta}{\partial x} &= \sin \phi \frac{\cos \theta}{r} \\
 \frac{\partial \theta}{\partial z} &= - \frac{\sin \theta}{r}
\end{aligned}
$$
$$
\begin{aligned}
 \frac{\partial \phi}{\partial x} &= - \frac{\sin \phi}{r \sin \theta} \\
 \frac{\partial \phi}{\partial y} &= \frac{\cos \phi}{r \sin \theta} \\
 \frac{\partial \phi}{\partial z} &= 0
\end{aligned}
$$

## 二階微分
チェーンルールより、
$$
\begin{aligned}
 \frac{\partial}{\partial x} &=
 \frac{\partial r}{\partial x} \frac{\partial}{\partial r} + \frac{\partial \theta}{\partial x} \frac{\partial}{\partial \theta}  + \frac{\partial \phi}{\partial x} \frac{\partial}{\partial \phi}  \\
 \frac{\partial}{\partial y} &=
 \frac{\partial r}{\partial y} \frac{\partial}{\partial r} + \frac{\partial \theta}{\partial y} \frac{\partial}{\partial \theta}  + \frac{\partial \phi}{\partial y} \frac{\partial}{\partial \phi}  \\
 \frac{\partial}{\partial z} &=
 \frac{\partial r}{\partial z} \frac{\partial}{\partial r} + \frac{\partial \theta}{\partial z} \frac{\partial}{\partial \theta}  + \frac{\partial \phi}{\partial z} \frac{\partial}{\partial \phi}
\end{aligned}
$$
なので、ちょっと大変だが各成分を二乗していく。この時、例えば
$$
\begin{aligned}
 \frac{\partial}{\partial r}( \frac{1}{r} \frac{\partial}{\partial \theta} ) &=
  ( \frac{\partial}{\partial r} \frac{1}{r}) \frac{\partial}{\partial \theta}  + \frac{1}{r} ( \frac{\partial}{\partial r} \frac{\partial}{\partial \theta} ) \\ &=
  - \frac{1}{r^{2}} \frac{\partial}{\partial \theta}  + \frac{1}{r} \frac{\partial^{2}}{\partial r \partial \theta}
\end{aligned}
$$
などのように、微分演算子がその変数を含む部分と単に交換しない点に注意する。
$$
\begin{aligned}
 \frac{\partial^{2}}{\partial x^{2}} &=
  (
 \frac{\partial r}{\partial x} \frac{\partial}{\partial r} + \frac{\partial \theta}{\partial x} \frac{\partial}{\partial \theta} + \frac{\partial \phi}{\partial x} \frac{\partial}{\partial \phi}
  )^{2} \\ &=
  (
 \sin \theta \cos \phi \frac{\partial}{\partial r} + \frac{\cos \theta \cos \phi}{r} \frac{\partial}{\partial \theta} - \frac{\sin \phi}{r \sin \theta} \frac{\partial}{\partial \phi}
  )^{2} \\ &=
 \sin^{2} \theta \cos^{2} \phi \frac{\partial^{2}}{\partial r^{2}} + \sin \theta \cos \theta \cos^{2} \phi \frac{\partial}{\partial r}( \frac{1}{r} \frac{\partial}{\partial \theta}) - \sin \phi \cos \phi \frac{\partial}{\partial r}(\frac{1}{r} \frac{\partial}{\partial \phi}) \\ &\quad+
 \frac{\cos \theta \cos^{2} \phi}{r} \frac{\partial}{\partial \theta}(\sin \theta \frac{\partial}{\partial r}) + \frac{\cos \theta \cos^{2} \phi}{r^{2}} \frac{\partial}{\partial \theta} (\cos \theta \frac{\partial}{\partial \theta}) - \frac{\cos \theta \sin \phi \cos \phi}{r^{2}} \frac{\partial}{\partial \theta}(\frac{1}{\sin \theta} \frac{\partial}{\partial \phi}) \\ &\quad-
 \frac{\sin \phi}{r} \frac{\partial}{\partial \phi}(\cos \phi \frac{\partial}{\partial r}) - \frac{\cos \theta \sin \phi}{r^{2} \sin \theta} \frac{\partial}{\partial \phi}(\cos \phi \frac{\partial}{\partial \theta}) + \frac{\sin \phi}{r^{2} \sin^{2} \theta} \frac{\partial}{\partial \phi}(\sin \phi \frac{\partial}{\partial \phi}) \\ &=
 \sin^{2} \theta \cos^{2} \phi \frac{\partial^{2}}{\partial r^{2}} + \sin \theta \cos \theta \cos^{2} \phi (- \frac{1}{r^{2}} + \frac{1}{r} \frac{\partial}{\partial r}) \frac{\partial}{\partial \theta} - \sin \phi \cos \phi (- \frac{1}{r^{2}} + \frac{1}{r} \frac{\partial}{\partial r}) \frac{\partial}{\partial \phi} \\ &\quad+
 \frac{\cos^{2} \phi}{r \cos \theta}  (\cos \theta +\sin \theta \frac{\partial}{\partial \theta}) \frac{\partial}{\partial r} + \frac{\cos^{2} \phi \cos \theta}{r^{2}} (-\sin \theta + \cos \theta \frac{\partial}{\partial \theta}) \frac{\partial}{\partial \theta} \\ &\quad-
 \frac{\sin \phi \cos \phi}{r^{2} \cos \theta} (- \frac{\cos \theta}{\sin^{2} \theta} + \frac{1}{\sin \theta} \frac{\partial}{\partial \theta}) \frac{\partial}{\partial \phi} - \frac{1}{r \sin \phi} (-\sin \phi + \cos \phi \frac{\partial}{\partial \phi}) \frac{\partial}{\partial r} \\ &\quad-
 \frac{1}{r^{2}} \frac{\cos \theta}{\sin \theta \sin \phi} (-\sin \phi +\cos \phi \frac{\partial}{\partial \phi}) \frac{\partial}{\partial \theta} + \frac{1}{r^{2} \sin^{2} \theta \sin \phi} (\cos \phi +\sin \phi \frac{\partial}{\partial \phi}) \frac{\partial}{\partial \phi}
\end{aligned}
$$
$$
\begin{aligned}
 \frac{\partial^{2}}{\partial y^{2}} &= ( \frac{\partial r}{\partial y} \frac{\partial}{\partial r} + \frac{\partial \theta}{\partial y} \frac{\partial}{\partial \theta} + \frac{\partial \phi}{\partial y} \frac{\partial}{\partial \phi})^{2} \\ &=
  (\sin \theta \sin \phi \frac{\partial}{\partial r} + \frac{\cos \theta \sin \phi}{r} \frac{\partial}{\partial \theta} + \frac{\cos \phi}{r \sin \theta} \frac{\partial}{\partial \phi})^{2} \\ &=
 \sin^{2} \theta \sin^{2} \phi \frac{\partial^{2}}{\partial r^{2}} + \sin \theta \cos \theta \sin^{2} \phi \frac{\partial}{\partial r}( \frac{1}{r} \frac{\partial}{\partial \theta}) + \sin \phi \cos \phi \frac{\partial}{\partial r}(\frac{1}{r} \frac{\partial}{\partial \phi}) \\ &\quad+
 \frac{\cos \theta \sin^{2} \phi}{r} \frac{\partial}{\partial \theta}(\sin \theta \frac{\partial}{\partial r}) + \frac{\cos \theta \sin^{2} \phi}{r^{2}} \frac{\partial}{\partial \theta}(\cos \theta \frac{\partial}{\partial \theta}) + \frac{\cos \theta \sin \phi \cos \phi}{r^{2}} \frac{\partial}{\partial \theta}( \frac{1}{\sin \theta} \frac{\partial}{\partial \phi}) \\ &\quad+
 \frac{\cos \phi}{r} \frac{\partial}{\partial \phi}(\sin \phi \frac{\partial}{\partial r}) + \frac{\cos \theta \cos \phi}{r^{2} \sin \theta} \frac{\partial}{\partial \phi}(\sin \phi \frac{\partial}{\partial \theta}) + \frac{\cos \phi}{r^{2}\sin^{2} \theta} \frac{\partial}{\partial \phi}(\cos \phi \frac{\partial}{\partial \phi}) \\ &=
 \sin^{2} \theta \sin^{2} \phi \frac{\partial^{2}}{\partial r^{2}} + \sin \theta \cos \theta \sin^{2} \phi (- \frac{1}{r^{2}} + \frac{1}{r} \frac{\partial}{\partial r}) \frac{\partial}{\partial \theta} + \sin \phi \cos \phi (- \frac{1}{r^{2}} + \frac{1}{r} \frac{\partial}{\partial r}) \frac{\partial}{\partial \phi} \\ &\quad+
 \frac{1}{r} \cos \theta \sin^{2} \phi (\cos \theta + \sin \theta \frac{\partial}{\partial \theta}) \frac{\partial}{\partial r} + \frac{1}{r^{2}} \cos \theta \sin^{2} \phi (-\sin \theta + \cos \theta \frac{\partial}{\partial \theta}) \frac{\partial}{\partial \theta} \\ &\quad+
 \frac{1}{r^{2}} \cos \theta \sin \phi \cos \phi (- \frac{\cos \theta}{\sin^{2} \theta} + \frac{1}{\sin \theta} \frac{\partial}{\partial \phi}) \frac{\partial}{\partial \phi} + \frac{\cos \phi}{r} (\cos \phi + \sin \phi \frac{\partial}{\partial \phi}) \frac{\partial}{\partial r} \\ &\quad+
 \frac{\cos \theta \cos \phi}{r^{2}\sin \theta} (\cos \phi + \sin \phi \frac{\partial}{\partial \phi}) \frac{\partial}{\partial \theta} + \frac{\cos \phi}{r^{2}\sin^{2} \theta}(-\sin \phi + \cos \phi \frac{\partial}{\partial \phi}) \frac{\partial}{\partial \phi}
\end{aligned}
$$
$$
\begin{aligned}
 \frac{\partial^{2}}{\partial z^{2}} &= ( \frac{\partial r}{\partial z} \frac{\partial}{\partial r} + \frac{\partial \theta}{\partial z} \frac{\partial}{\partial \theta}  + \frac{\partial \phi}{\partial z} \frac{\partial}{\partial \phi} )^{2} \\ &=
  (\cos \theta \frac{\partial}{\partial r} - \frac{\sin \theta}{r} \frac{\partial}{\partial \theta} )^{2} \\ &=
 \cos^{2} \theta \frac{\partial^{2}}{\partial r^{2}} - \sin \theta \cos \theta \frac{\partial}{\partial r}( \frac{1}{r} \frac{\partial}{\partial \theta} ) - \frac{\sin \theta}{r} \frac{\partial}{\partial \theta} (\cos \theta \frac{\partial}{\partial r}) + \frac{\sin \theta}{r^{2}} \frac{\partial}{\partial \theta} (\sin \theta \frac{\partial}{\partial \theta} ) \\ &=
 \cos^{2} \theta \frac{\partial^{2}}{\partial r^{2}} + \frac{\sin^{2} \theta}{r^{2}} \frac{\partial^{2}}{\partial \theta^{2}} + \frac{\sin^{2} \theta}{r} \frac{\partial}{\partial r} \\ &\quad+
 \frac{2\sin \theta \cos \theta}{r^{2}} \frac{\partial}{\partial \theta}  - \frac{2\sin \theta \cos \theta}{r} \frac{\partial^{2}}{\partial r \partial \theta}
\end{aligned}
$$

## 球座標系のラプラシアン
最後に全て足し上げると、かなりの項が打ち消しあって、
$$
\begin{aligned}
\nabla^{2} &= \frac{\partial^{2}}{\partial x^{2}} + \frac{\partial^{2}}{\partial y^{2}} + \frac{\partial^{2}}{\partial y^{2}} \\ &=
 \frac{\partial^{2}}{\partial r^{2}} + \frac{1}{r^{2}} \frac{\partial^{2}}{\partial \theta^{2}} + \frac{1}{r^{2}\sin^{2} \theta} \frac{\partial^{2}}{\partial \phi^{2}} + \frac{2}{r} \frac{\partial}{\partial r} + \frac{\cos \theta}{r^{2} \sin \theta} \frac{\partial}{\partial \theta}
\end{aligned}
$$
もう少し整理すると、
$$
\begin{aligned}
  \nabla^{2} = \frac{\partial^{2}}{\partial r^{2}} + \frac{2}{r} \frac{\partial}{\partial r} + \frac{1}{r^{2}} [\frac{1}{\sin \theta} \frac{\partial}{\partial \theta} (\sin \theta \frac{\partial}{\partial \theta} ) + \frac{1}{\sin^{2} \theta} \frac{\partial^{2}}{\partial \phi^{2}}]\\
\end{aligned}
$$
のようになって、最終的には動径($r$)方向とそのほかの($\theta, \phi$)方向へ分離できる。