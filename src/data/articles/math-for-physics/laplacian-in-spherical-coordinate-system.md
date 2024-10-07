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
nabla^2 =  partial^2 / (partial x^2) +  partial^2 / (partial y^2) +  partial^2 / (partial z^2)
$$
これを球座標系$(r, \theta , \phi )$へ変換する。

二つの座標系との関係は以下の通り。
$$
  x &= r sin theta cos phi \
  y &= r sin theta sin phi \
  z &= r cos theta 

$$
よって
$$
  r^2 &= x^2 + y^2 + z^2 \
  cos^2 theta &= z(x^2 + y^2 + z^2)^(-1) \
  tan phi &= x^(-1)y 
$$
三つの式を$x, y, z$ですべて偏微分する。

## 一階微分
### r:
$$
  2r (partial r) / (partial x) = 2x \
  2r (partial r) / (partial y) = 2y \
  2r (partial r) / (partial z) = 2z 
$$
より、
$$
   (partial r) / (partial x) &=  x / r = sin theta  cos phi \
   (partial r) / (partial y) &=  y / r = sin theta  sin phi \
   (partial r) / (partial z) &=  z / r = cos theta
$$

### $ \theta $:
$$
  -sin theta (partial theta) / (partial x) &= 
  z ( - 1 / 2 (x^2 + y^2 + z^2)^(- 3 / 2) dot 2x ) \ &=
  -x z(x^2 + y^2 + z^2)^(- 3 / 2) \
  
  -sin theta (partial theta) / (partial y) &= 
  z ( - 1 / 2 (x^2 + y^2 + z^2)^(- 3 / 2) dot 2y ) \ &= 
  -y z(x^2 + y^2 + z^2)^(- 3 / 2) \
 
  -sin theta (partial theta) / (partial z) &= 
  z ( - 1 / 2 (x^2 + y^2 + z^2)^(- 3 / 2) dot 2z ) + 
  (x^2 + y^2 + z^2)^(- 1 / 2) \ &=  (x^2 + y^2) / ((x^2 + y^2 + z^2)^(3/2)) 
$$
より、
$$
   (partial theta)  / (partial x) &= 
   (x z) / (r^3 sin theta)  \ &= 
   (r sin theta cos phi dot r cos theta) / (r^3 sin theta) \ &= 
   (cos theta cos phi) / r \
   
   (partial theta)  / (partial y) &=  
   (y z) / (r^3 sin theta) \ &=  
   (r sin theta sin phi dot r cos theta) / (r^3 sin theta) \ &=  
   (cos theta sin phi) / r \
   
   (partial theta)  / (partial z) &= 
   - (x^2 + y^2) / (r^3 sin theta) \ &= 
   - (r^2 sin^2 theta cos^2 phi + r^2 sin^2 theta sin^2 phi) / (r^3 sin theta) \ &= 
   - (sin theta) / r
$$

### $\phi $:
$$
   1 / (cos ^2phi)  (partial phi)  / (partial x) &= -x^(-2)y \
   1 / (cos ^2phi)  (partial phi)  / (partial y) &= x^(-1) \
   1 / (cos ^2phi)  (partial phi)  / (partial z) &= 0
$$
より、
$$
   (partial phi)  / (partial x) &= - (r sin theta  sin phi)  / (r^2sin^2theta  cos ^2phi) cos^2phi \ &= - (sin phi)  / (r sin theta) \
   (partial phi)  / (partial y) &=  1 / (r sin theta  cos phi) cos ^2phi \ &=  (cos phi)  / (r sin theta) \
   (partial phi)  / (partial z) &= 0
$$

### 一階微分の結果まとめ
$$
   (partial r) / (partial x) &= sin theta  cos phi \
   (partial r) / (partial y) &= sin theta  sin phi \
   (partial r) / (partial z) &= cos theta
$$
$$
   (partial theta)  / (partial x) &=  (cos theta cos phi) / r \
   (partial theta)  / (partial x) &=  sin phi    (cos theta)  / r \
   (partial theta)  / (partial z) &= - (sin theta)  / r
$$
$$
   (partial phi)  / (partial x) &= - sin phi  / r sin theta \
   (partial phi)  / (partial y) &=  cos phi  / r sin theta \
   (partial phi)  / (partial z) &= 0
$$

## 二階微分
チェーンルールより、
$$

   partial / (partial x) &= 
   (partial r) / (partial x) partial / (partial r) +  (partial theta)  / (partial x) partial / (partial theta)  +  (partial phi)  / (partial x) partial / (partial phi)  \
   partial / (partial y) &= 
   (partial r) / (partial y) partial / (partial r) +  (partial theta)  / (partial y) partial / (partial theta)  +  (partial phi)  / (partial y) partial / (partial phi)  \
   partial / (partial z) &= 
   (partial r) / (partial z) partial / (partial r) + (partial theta)  / (partial z) partial / (partial theta)  +  (partial phi)  / (partial z) partial / (partial phi)
$$
なので、ちょっと大変だが各成分を二乗していく。この時、例えば
$$
   partial / (partial r)( 1 / r partial / (partial theta) ) &= 
  ( partial / (partial r) 1 / r)  partial / (partial theta)  +  1 / r ( partial / (partial r) partial / (partial theta) ) \ &=
  - 1 / r^2 partial / (partial theta)  +  1 / r partial^2 / (partial r partial theta) 
$$
などのように、微分演算子がその変数を含む部分と単に交換しない点に注意する。
$$
   partial^2 / (partial x^2) &= 
  (
     (partial r) / (partial x) partial / (partial r) +  (partial theta)  / (partial x) partial / (partial theta) + (partial phi)  / (partial x) partial / (partial phi)
  )^2 \ &= 
  (
    sin theta  cos phi partial / (partial r) + (cos theta cos phi)  / r partial / (partial theta) - (sin phi)  / (r sin theta) partial / (partial phi)
  )^2 \ &= 

  sin^2theta  cos ^2phi partial^2 / (partial r^2) + sin theta  cos theta  cos ^2phi partial / (partial r)( 1 / r partial / (partial theta)) - sin phi  cos phi partial / (partial r)(1 / r partial / (partial phi)) \ &quad+ 
  (cos theta  cos ^2phi)   / r partial / (partial theta)(sin theta partial / (partial r)) + (cos theta  cos ^2phi)  / r^2 partial / (partial theta) (cos theta partial / (partial theta)) - (cos theta  sin phi  cos phi)  / r^2 partial / (partial theta)(1 / (sin theta) partial / (partial phi)) \ &quad- 
   (sin phi)  / r partial / (partial phi)(cos phi partial / (partial r)) - (cos theta  sin phi) / (r^2 sin theta) partial / (partial phi)(cos phi   partial / (partial theta)) +  (sin phi) / (r^2 sin^2theta) partial / (partial phi)(sin phi partial / (partial phi)) \ &= 

  sin^2theta  cos ^2phi partial^2 / (partial r^2) + sin theta  cos theta  cos^2phi  (- 1 / r^2 + 1 / r partial / (partial r)) partial / (partial theta) - sin phi  cos phi (- 1 / r^2 +  1 / r partial / (partial r)) partial / (partial phi) \ &quad+ 
  (cos ^2phi)  / (r cos theta)  (cos theta  +sin theta   partial / (partial theta)) partial / (partial r) +  (cos ^2phi  cos theta)  / r^2 (-sin theta  + cos theta  partial / (partial theta)) partial / (partial theta) \ &quad- 
   (sin phi  cos phi) / (r^2 cos theta) (- (cos theta) / (sin^2theta) + 1 / (sin theta) partial / (partial theta)) partial / (partial phi) - 1 / (r sin phi) (-sin phi   + cos phi partial / (partial phi)) partial / (partial r) \ &quad- 
   1 / r^2 (cos theta)  / (sin theta sin phi) (-sin phi  +cos phi partial / (partial phi)) partial / (partial theta) + 1 / (r^2 sin^2theta sin phi) (cos phi  +sin phi partial / (partial phi)) partial / (partial phi)
$$
$$
   partial^2 / (partial y^2) &= ( (partial r) / (partial y) partial / (partial r) + (partial theta) / (partial y) partial / (partial theta) +  (partial phi) / (partial y) partial / (partial phi))^2 \ &= 

  (sin theta  sin phi  partial / (partial r) + (cos theta  sin phi) / r partial / (partial theta) + (cos phi) / (r sin theta) partial / (partial phi))^2 \ &= 

  sin^2theta  sin^2phi partial^2 / (partial r^2) + sin theta  cos theta  sin^2phi partial / (partial r)( 1 / r partial / (partial theta)) + sin phi  cos phi partial / (partial r)(1 / r partial / (partial phi)) \ &quad+ 
   (cos theta  sin^2phi) / r partial / (partial theta)(sin theta   partial / (partial r)) + (cos theta  sin^2phi) / r^2 partial / (partial theta)(cos theta partial / (partial theta)) + (cos theta  sin phi  cos phi) / r^2 partial / (partial theta)( 1 / (sin theta) partial / (partial phi)) \ &quad+ 
   (cos phi)  / r partial / (partial phi)(sin phi partial / (partial r)) + (cos theta  cos phi) / (r^2 sin theta) partial / (partial phi)(sin phi partial / (partial theta)) + (cos phi) / (r^2sin^2theta) partial / (partial phi)(cos phi partial / (partial phi)) \ &=

  sin^2theta  sin^2phi partial^2 / (partial r^2) + sin theta  cos theta  sin^2phi  (- 1 / r^2 + 1 / r partial / (partial r)) partial / (partial theta) + sin phi  cos phi  (- 1 / r^2 +  1 / r partial / (partial r)) partial / (partial phi) \ &quad+ 
   1 / r cos theta  sin^2phi  (cos theta   + sin theta  partial / (partial theta)) partial / (partial r) + 1 / r^2 cos theta  sin^2phi  (-sin theta   + cos theta partial / (partial theta)) partial / (partial theta) \ &quad+ 
   1 / r^2 cos theta  sin phi  cos phi  (- (cos theta) / (sin^2 theta) + 1 / (sin theta) partial / (partial phi)) partial / (partial phi) + (cos phi) / r (cos phi  + sin phi partial / (partial phi)) partial / (partial r) \ &quad+ 
   (cos theta  cos phi) / (r^2sin theta) (cos phi  + sin phi partial / (partial phi)) partial / (partial theta) + (cos phi) / (r^2sin^2theta)(-sin phi  + cos phi partial / (partial phi)) partial / (partial phi)
$$
$$
   partial^2 / (partial z^2) &= ( (partial r) / (partial z) partial / (partial r) +  partial theta  / (partial z) partial / (partial theta)  +  (partial phi)  / (partial z) partial / (partial phi) )^2 \ &= 
  (cos theta   partial / (partial r) -  sin theta   / r partial / (partial theta) )^2 \ &= 

  cos ^2theta   partial^2 / (partial r^2) - sin theta  cos theta   partial / (partial r)( 1 / r partial / (partial theta) ) - (sin theta)  / r partial / (partial theta) (cos theta   partial / (partial r)) +  (sin theta)  / r^2 partial / (partial theta) (sin theta   partial / (partial theta) ) \ &= 

  cos ^2theta   partial^2 / (partial r^2) +  (sin^2theta) / r^2 partial^2 / (partial theta^2) +  (sin^2theta) / r partial / (partial r) \ &quad+ 
   (2sin theta  cos theta)  / r^2 partial / (partial theta)  -  (2sin theta  cos theta)  / r partial^2 / (partial r partial theta) 

$$

## 球座標系のラプラシアン
最後に全て足し上げると、かなりの項が打ち消しあって、
$$
nabla^2 &=  partial^2 / (partial x^2) +  partial^2 / (partial y^2) +  partial^2 / (partial y^2) \ &= 

 partial^2 / (partial r^2) +  1 / r^2 partial^2 / (partial theta^2) +  1 / (r^2sin^2theta)  partial^2 / (partial phi) ^2 +  2 / r partial / (partial r) +  (cos theta)  / (r^2 sin theta)  partial / (partial theta) 

$$
もう少し整理すると、
$$
  nabla^2 =  partial^2 / (partial r^2) +  2 / r partial / (partial r) +  1 / r^2 [1 / (sin theta)  partial / (partial theta) (sin theta   partial / (partial theta) ) +  1 / (sin^2theta)  partial^2 / (partial phi ^2)]\
$$
のようになって、最終的には動径($r$)方向とそのほかの($\theta , \phi $)方向へ分離できる。