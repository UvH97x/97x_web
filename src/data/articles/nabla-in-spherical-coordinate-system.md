---
title: "球座標系におけるナブラ演算子"
author: "UvH"
created_at: "2024-09-19"
updated_at: "2024-09-21"  # 更新日がない場合はこの行を省略
tags:
  - "物理"
  - "数学"
  - "ナブラ演算子"
excerpt: "球座標系におけるナブラ演算子を直交座標系からの変換として求める"
---

## 直交座標系から球座標系へのナブラ演算子の変換

二つの座標系との関係は以下の通り。ただし、$\mathbf{e}_i$は$i$軸方向への単位ベクトルを表す。
$$
\begin{cases}
  x = r \sin\theta \cos \phi \\
  y = r \sin\theta \sin\phi \\
  z = r \cos\theta \\
\end{cases}
\iff
\begin{cases}
  r^2 = x^2 + y^2 + z^2 \\
  \cos^2\theta = z(x^2 + y^2 + z^2)^{-1}\\
  \tan\phi = x^{-1}y \\
\end{cases}
$$
$$
\begin{cases}
  \mathbf{e}_x = \sin\theta \cos\phi \, \mathbf{e}_r + \cos\theta \cos\phi \, \mathbf{e}_\theta - \sin\phi \, \mathbf{e}_\phi \\
  \mathbf{e}_y = \sin\theta \sin\phi \, \mathbf{e}_r + \cos\theta \sin\phi \, \mathbf{e}_\theta + \cos\phi \, \mathbf{e}_\phi \\
  \mathbf{e}_z = \cos\theta \, \mathbf{e}_r - \sin\theta \, \mathbf{e}_\theta
\end{cases}
$$
$r, \theta, \phi$を$x, y, z$でそれぞれ偏微分していく。$r$は、
$$
  2r\frac{\partial r}{\partial x} = 2x
$$
であり、$y$、$z$も同じ形をしてるので、
$$
\begin{cases}
  \frac{\partial r}{\partial x} = \frac{x}{r} = \sin\theta\,\cos\phi\\
  \frac{\partial r}{\partial y} = \frac{y}{r} = \sin\theta\,\sin\phi\\
  \frac{\partial r}{\partial z} = \frac{z}{r} = \cos\theta\\
\end{cases}
$$
$\theta$は、
$$
  -\sin\theta \frac{\partial \theta}{\partial x} = z \left( -\frac{1}{2} (x^2 + y^2 + z^2)^{-\frac{3}{2}} \cdot 2x \right) = -xz(x^2 + y^2 + z^2)^{-\frac{3}{2}}\\
  \iff
  \frac{\partial \theta}{\partial x} = \frac{xz}{r^3 \sin\theta}
$$
$\frac{\partial\theta}{\partial y}$も同じ形。一方で$\frac{\partial\theta}{\partial z}$は、
$$
  -\sin\theta \frac{\partial \theta}{\partial z} = z \left( -\frac{1}{2} (x^2 + y^2 + z^2)^{-\frac{3}{2}} \cdot 2z \right) + (x^2 + y^2 + z^2)^{-\frac{1}{2}} = \frac{x^2 + y^2}{r^3}\\
  \iff
  \frac{\partial \theta}{\partial z} = -\frac{x^2 + y^2}{r^3 \sin\theta}
$$
まとめると、
$$
\begin{cases}
  \frac{\partial \theta}{\partial x} = \frac{xz}{r^3 \sin\theta} = \frac{r\sin\theta \, \cos\phi \, r\cos\theta}{r^3 \sin\theta} = \frac{\cos\theta \, \cos\phi}{r}\\
  \frac{\partial \theta}{\partial y} = \frac{yz}{r^3 \sin\theta} = \frac{r\sin\theta \, \sin\phi \, r\cos\theta}{r^3 \sin\theta} = \frac{\sin\phi \, \cos\theta}{r}\\
  \frac{\partial \theta}{\partial z} = -\frac{x^2 + y^2}{r^3 \sin\theta} = -\frac{r^2 \sin^2\theta \, \cos^2\phi + r^2\sin^2\theta \, \sin^2\phi}{r^3 \sin\theta} = -\frac{\sin\theta}{r}
\end{cases}
$$
$\phi$については、
$$
\begin{cases}
  \frac{1}{\cos^2\phi}\frac{\partial\phi}{\partial x} = -x^{-2}y\\
  \frac{1}{\cos^2\phi}\frac{\partial\phi}{\partial y} = x^{-1}\\
  \frac{1}{\cos^2\phi}\frac{\partial\phi}{\partial z} = 0\\
\end{cases}
\iff
\begin{cases}
  \frac{\partial\phi}{\partial x} = -\frac{r\sin\theta\,\sin\phi}{r^2\sin^2\theta\,\cos^2\phi}\cos^2\phi = -\frac{\sin\phi}{r\sin\theta}\\
  \frac{\partial\phi}{\partial y} = \frac{1}{r\sin\theta\,\cos\phi}\cos^2\phi = \frac{\cos\phi}{r\sin\theta}\\
  \frac{\partial\phi}{\partial z} = 0\\
\end{cases}
$$

さて、直交座標系 $(x, y, z)$ でのナブラ演算子は次のように定義される。
$$
\nabla = \mathbf{e}_x \frac{\partial}{\partial x} + \mathbf{e}_y \frac{\partial}{\partial y} + \mathbf{e}_z \frac{\partial}{\partial z}
$$
チェーンルールを適用したうえで、今まで用意してきた結果を代入していく。
$$
\begin{aligned}
\mathbf{e}_x\frac{\partial}{\partial x}
&= 
\left(\sin\theta \cos\phi \, \mathbf{e}_r + \cos\theta \cos\phi \, \mathbf{e}_\theta - \sin\phi \, \mathbf{e}_\phi\right)
\left(\frac{\partial r}{\partial x} \frac{\partial}{\partial r}
+ \frac{\partial \theta}{\partial x} \frac{\partial}{\partial \theta}
+ \frac{\partial \phi}{\partial x} \frac{\partial}{\partial \phi}\right) \\
&=
\left(\sin\theta \cos\phi \, \mathbf{e}_r + \cos\theta \cos\phi \, \mathbf{e}_\theta - \sin\phi \, \mathbf{e}_\phi\right)
\left(\sin\theta\,\cos\phi \frac{\partial}{\partial r}
+ \frac{\cos\theta \, \cos\phi}{r} \frac{\partial}{\partial \theta}
-\frac{\sin\phi}{r\sin\theta} \frac{\partial}{\partial \phi}\right) \\
&=
\mathbf{e}_r \left(\sin^2\theta\,\cos^2\phi\,\frac{\partial}{\partial r} + \frac{\sin\theta\,\cos\theta\,\cos^2\phi}{r}\frac{\partial}{\partial \theta} - \frac{\sin\phi\,\cos\phi}{r}\frac{\partial}{\partial \phi}\right) \\
&+ \mathbf{e}_\theta \left(\sin\theta\,\cos\theta\,\cos^2\phi\,\frac{\partial}{\partial r} + \frac{\cos^2\theta\,\cos^2\phi\,}{r}\frac{\partial}{\partial \theta} - \frac{\cos\theta\,\cos\phi\,\sin\phi}{r\sin\theta}\frac{\partial}{\partial \phi}\right) \\
&+ \mathbf{e}_\phi \left(-\sin\theta\,\sin\phi\,\cos\phi\,\frac{\partial}{\partial r} - \frac{\cos\theta\,\sin\phi\,\cos\phi}{r}\frac{\partial}{\partial \theta} + \frac{\sin^2\phi}{r \sin\theta} \frac{\partial}{\partial \phi}\right)
\end{aligned}
$$
$$
\begin{aligned}
\mathbf{e}_y\frac{\partial}{\partial y}
&=
\left(\sin\theta \sin\phi \, \mathbf{e}_r + \cos\theta \sin\phi \, \mathbf{e}_\theta + \cos\phi \, \mathbf{e}_\phi\right)\left(\frac{\partial r}{\partial y} \frac{\partial}{\partial r}
+ \frac{\partial \theta}{\partial y} \frac{\partial}{\partial \theta}
+ \frac{\partial \phi}{\partial y} \frac{\partial}{\partial \phi}\right) \\
&=
\left(\sin\theta \sin\phi \, \mathbf{e}_r + \cos\theta \sin\phi \, \mathbf{e}_\theta + \cos\phi \, \mathbf{e}_\phi\right)
\left(\sin\theta\,\sin\phi \frac{\partial}{\partial r}
+ \frac{\cos\theta \, \sin\phi}{r} \frac{\partial}{\partial \theta}
+ \frac{\cos\phi}{r\sin\theta} \frac{\partial}{\partial \phi}\right) \\
&=
\mathbf{e}_r \left(\sin^2\theta\,\sin^2\phi\,\frac{\partial}{\partial r} + \frac{\sin\theta\,\cos\theta\,\sin^2\phi}{r}\frac{\partial}{\partial\theta} + \frac{\sin\phi\,\cos\phi}{r}\frac{\partial}{\partial \phi}\right) \\
&+ \mathbf{e}_\theta \left(\sin\theta\,\cos\theta\,\sin^2\phi\,\frac{\partial}{\partial r} + \frac{\cos^2\theta\,\sin^2\phi}{r}\frac{\partial}{\partial\theta} + \frac{\cos\theta\,\cos\phi\,\sin\phi}{r\sin\theta}\frac{\partial}{\partial \phi}\right) \\
&+ \mathbf{e}_\phi \left(\sin\theta\,\sin\phi\,\cos\phi\,\frac{\partial}{\partial r} + \frac{\cos\theta\,\sin\phi\,\cos\phi}{r}\frac{\partial}{\partial \theta} + \frac{\cos^2\phi}{r\sin\theta}\frac{\partial}{\partial\phi}\right)
\end{aligned} 
$$
$$
\begin{aligned}
\mathbf{e}_z\frac{\partial}{\partial z}
&=
\left(\cos\theta \, \mathbf{e}_r - \sin\theta \, \mathbf{e}_\theta\right)\left(\frac{\partial r}{\partial z} \frac{\partial}{\partial r}
+ \frac{\partial \theta}{\partial z} \frac{\partial}{\partial \theta}
+ \frac{\partial \phi}{\partial z} \frac{\partial}{\partial \phi}\right)\\
&=
\left(\cos\theta \, \mathbf{e}_r - \sin\theta \, \mathbf{e}_\theta\right)
\left(\cos\theta \frac{\partial}{\partial r}
-\frac{\sin\theta}{r} \frac{\partial}{\partial \theta}\right) \\
&=
\mathbf{e}_r \left(\cos^2\theta\,\frac{\partial}{\partial r} - \frac{\sin\theta\,\cos\theta}{r}\frac{\partial}{\partial \theta}\right) \\
&+ \mathbf{e}_\theta \left(-\sin\theta\,\cos\theta\,\frac{\partial}{\partial r} + \frac{\sin^2\theta}{r}\frac{\partial}{\partial \theta}\right) \\
\end{aligned}
$$
よって全て足すと、(かなりの項が打ち消されて、)
$$
  \nabla
  = \mathbf{e}_r \frac{\partial}{\partial r}
  + \mathbf{e}_\theta \frac{1}{r} \frac{\partial}{\partial \theta}
  + \mathbf{e}_\phi \frac{1}{r\sin\theta}\frac{\partial}{\partial \phi}
$$
が球座標系におけるナブラ演算子である。