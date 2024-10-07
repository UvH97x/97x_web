---
title: "球座標系におけるナブラ演算子"
author: "UvH"
created_at: "2024-09-19"
updated_at: "2024-10-07"  # 更新日がない場合はこの行を省略
tags:
  - "物理"
  - "数学"
  - "ナブラ演算子"
excerpt: "球座標系におけるナブラ演算子を直交座標系からの変換として求める"
---
## 直交座標系から球座標系へのナブラ演算子の変換
直交座標系におけるナブラ演算子は以下の通り。
$$
nabla = bb(e)_x partial / (partial x) + bb(e)_y partial / (partial y) + bb(e)_z partial / (partial z)
$$
これを球座標系$(r, \theta, \phi)$へ変換する。
二つの座標系との関係は以下の通り。ただし、$\mathbf{e}_i$は$i$軸方向への単位ベクトルを表す。
$$
x &= r sin theta cos phi \
y &= r sin theta sin phi \
z &= r cos theta 
$$
$$
r^2 &= x^2 + y^2 + z^2 \
cos^2 theta &= z(x^2 + y^2 + z^2)^(-1) \
tan phi &= x^(-1)y 
$$
$$
bb(e)_x &= sin theta cos phi bb(e)_r + cos theta cos phi bb(e)_ theta - sin phi bb(e)_ phi \
bb(e)_y &= sin theta sin phi bb(e)_r + cos theta sin phi bb(e)_ theta + cos phi bb(e)_ phi \
bb(e)_z &= cos theta bb(e)_r - sin theta bb(e)_ theta
$$
$r, \theta, \phi$を$x, y, z$でそれぞれ偏微分していく。$r$は、
$$
2r (partial r) / (partial x) = 2x
$$
であり、$y$、$z$も同じ形をしてるので、
$$
(partial r) / (partial x) &= x / r \ &= sin theta cos phi\
(partial r) / (partial y) &= y / r \ &= sin theta sin phi\
(partial r) / (partial z) &= z / r \ &= cos theta\
$$
$\theta$は、
$$
-sin theta (partial theta) / (partial x) &= z ( -1 / 2 (x^2 + y^2 + z^2)^(-3 / 2) dot 2x ) \ &= -x z(x^2 + y^2 + z^2)^(-3 / 2)
$$
より、
$$
(partial theta) / (partial x) = (x z) / (r^3 sin theta)
$$
$\frac{\partial \theta}{\partial y}$も同じ形。一方で$\frac{\partial \theta}{\partial z}$は、
$$
-sin theta (partial theta) / (partial z) &= z ( -1 / 2 (x^2 + y^2 + z^2)^(-3 / 2) dot 2z ) + (x^2 + y^2 + z^2)^(-1) / 2 \ &= (x^2 + y^2) / r^3
$$
より、
$$
(partial theta) / (partial z) = -(x^2 + y^2) / (r^3 sin theta)
$$
まとめると、
$$
(partial theta) / (partial x) &= (x z) / (r^3 sin theta) \ &= (r sin theta cos phi dot r cos theta) / (r^3 sin theta) \ &= (cos theta cos phi) / r\
(partial theta) / (partial y) &= (y z) / (r^3 sin theta) \ &= (r sin theta sin phi dot r cos theta) / (r^3 sin theta) \ &= (sin phi cos theta) / r\
(partial theta) / (partial z) &= -(x^2 + y^2) / (r^3 sin theta) \ &= -(r^2 sin^2 theta cos^2 phi + r^2sin^2 theta sin^2 phi) / (r^3 sin theta) \ &= -(sin theta) / r
$$
$\phi$については、
$$
1 / (cos^2 phi) (partial phi) / (partial x) &= -x^(-2)y \
1 / (cos^2 phi) (partial phi) / (partial y) &= x^(-1) \
1 / (cos^2 phi) (partial phi) / (partial z) &= 0
$$
より、
$$
(partial phi) / (partial x) &= -(r sin theta sin phi) / (r^2sin^2 theta cos^2 phi) dot cos^2 phi \ &= -(sin phi) / (r sin theta) \
(partial phi) / (partial y) &= 1 / (r sin theta cos phi) dot cos^2 phi \ &= (cos phi) / (r sin theta) \
(partial phi) / (partial z) &= 0
$$
さて、改めて、直交座標系 $(x, y, z)$ でのナブラ演算子は次のように定義される。
$$
nabla = bb(e)_x partial / (partial x) + bb(e)_y partial / (partial y) + bb(e)_z partial / (partial z)
$$
チェーンルールを適用したうえで、今まで用意してきた結果を代入していく。
$$
bb(e)_x partial / (partial x)
&= 
(sin theta cos phi bb(e)_r + cos theta cos phi bb(e)_ theta - sin phi bb(e)_ phi)
((partial r) / (partial x) partial / (partial r)
+ (partial theta) / (partial x) partial / (partial theta)
+ (partial phi) / (partial x) partial / (partial phi)) \
&=
(sin theta cos phi bb(e)_r + cos theta cos phi bb(e)_ theta - sin phi bb(e)_ phi)
((sin theta cos phi partial) / (partial r)
+ (cos theta cos phi) / r partial / (partial theta)
-sin phi / (r sin theta) partial / (partial phi)) \
&=
bb(e)_r (sin^2 theta cos^2 phi partial / (partial r) + (sin theta cos theta cos^2 phi) / r partial / (partial theta) - (sin phi cos phi) / r partial / (partial phi)) \
&quad+ bb(e)_ theta (sin theta cos theta cos^2 phi partial / (partial r) + (cos^2 theta cos^2 phi) / r partial / (partial theta) - (cos theta cos phi sin phi) / (r sin theta) partial / (partial phi)) \
&quad+ bb(e)_ phi (-sin theta sin phi cos phi partial / (partial r) - (cos theta sin phi cos phi) / r partial / (partial theta) + (sin^2 phi) / (r sin theta) partial / (partial phi))
$$
$$
bb(e)_y partial / (partial y)
&=
(sin theta sin phi bb(e)_r + cos theta sin phi bb(e)_ theta + cos phi bb(e)_ phi)((partial r) / (partial y) partial / (partial r)
+ (partial theta) / (partial y) partial / (partial theta)
+ (partial phi) / (partial y) partial / (partial phi)) \
&=
(sin theta sin phi bb(e)_r + cos theta sin phi bb(e)_ theta + cos phi bb(e)_ phi)
(sin theta sin phi partial / (partial r)
+ (cos theta sin phi) / r partial / (partial theta)
+ (cos phi) / (r sin theta) partial / (partial phi)) \
&=
bb(e)_r (sin^2 theta sin^2 phi partial / (partial r) + (sin theta cos theta sin^2 phi) / r partial / (partial theta) + (sin phi cos phi) / r partial / (partial phi)) \
&quad+ bb(e)_ theta (sin theta cos theta sin^2 phi partial / (partial r) + (cos^2 theta sin^2 phi) / r partial / (partial theta) + (cos theta cos phi sin phi) / (r sin theta) partial / (partial phi)) \
&quad+ bb(e)_ phi (sin theta sin phi cos phi partial / (partial r) + (cos theta sin phi cos phi) / r partial / (partial theta) + (cos^2 phi) / (r sin theta) partial / (partial phi))
$$
$$
bb(e)_z partial / (partial z)
&=
(cos theta bb(e)_r - sin theta bb(e)_ theta)((partial r) / (partial z) partial / (partial r)
+ (partial theta) / (partial z) partial / (partial theta)
+ (partial phi) / (partial z) partial / (partial phi))\
&=
(cos theta bb(e)_r - sin theta bb(e)_ theta)
(cos theta partial / (partial r)
-(sin theta) / r partial / (partial theta)) \
&=
bb(e)_r (cos^2 theta partial / (partial r) - (sin theta cos theta) / r partial / (partial theta)) \
&quad+ bb(e)_ theta (-sin theta cos theta partial / (partial r) + (sin^2 theta) / r partial / (partial theta)) \
$$
よって全て足すと、(かなりの項が打ち消されて、)
$$
nabla
= bb(e)_r partial / (partial r)
+ bb(e)_ theta 1 / r partial / (partial theta)
+ bb(e)_ phi 1 / (r sin theta) partial / (partial phi)
$$
が球座標系におけるナブラ演算子である。