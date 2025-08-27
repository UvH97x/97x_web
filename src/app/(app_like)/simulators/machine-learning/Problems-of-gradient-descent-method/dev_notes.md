# 勾配降下法の問題点をビジュアルに見せる
## 勾配降下法
時刻$t$におけるモデルのパラメータが$\boldsymbol{w}^{(t)}$であり、誤差関数を$E(\boldsymbol{w}^{(t)})$とするとき、次の時刻$t+1$におけるパラメータを$$\boldsymbol{w}^{(t+1)} = \boldsymbol{w}^{(t)} + \Delta \boldsymbol{w}^{(t)}\\ \Delta \boldsymbol{w}^{(t)} = - \eta \nabla E(\boldsymbol{w}^{(t)})$$のように更新する方法。いくつか改良された方法が存在する。
### 勾配グリップ
誤差関数の勾配に上限値$g_0$を持たせる方法。$$\Delta \boldsymbol{w}^{(t)} = \left\{\begin{array}{ll} - \eta \nabla E(\boldsymbol{w}^{(t)}) & (|\nabla E(\boldsymbol{w}^{(t)})| \leq g_0) \\ - \eta g_0 \frac{\nabla E(\boldsymbol{w}^{(t)})}{|\nabla E(\boldsymbol{w}^{(t)})|} & (\nabla E(|\boldsymbol{w}^{(t)})| > g_0)\end{array} \right .$$
### モーメンタム法
今の勾配のみではなく以前のパラメータ変化率を減衰付きで参照し、慣性を持たせる方法。$$\Delta \boldsymbol{w}^{(t)} = \mu \Delta \boldsymbol{w}^{(t-1)} - (1-\mu)\eta \nabla E(\boldsymbol{w}^{(t)})\\ \boldsymbol{w}^{(0)} = \boldsymbol{0}$$
### ネステロフの加速勾配法
モーメンタム法の改良版。誤差関数の評価地点を現時点より少し先の予測値点とすることで、学習速度を速める。$$\boldsymbol{w}^{(t)} = \mu \Delta \boldsymbol{w}^{(t-1)} - (1-\mu)\eta \nabla E(\boldsymbol{w}^{(t)} + \mu \Delta \boldsymbol{w}^{(t-1)})$$
### AdaGrad
学習率をパラメータの成分ごとにスケーリングする工夫。$$\Delta w_i^{(t)} = -\frac{\eta}{\sqrt{\sum_{s=1}^t (\nabla E(\boldsymbol{w}^{(s)})_i)^2}}\nabla E(\boldsymbol{w}^{(t)})_i$$
### RMSprop
AdaGradの、過去の勾配全ての累積値を取ったせいで学習率が単調減少してしまうという問題点を解消する工夫。$$v_{i,t} = \rho v_{i,t-1} + (1-\rho)\{\nabla E(\boldsymbol{w}^{(t)})_i\}^2\\ \Delta w_i^{(t)} = -\frac{\eta}{{RMS}[\nabla E_i]_t}\nabla E(\boldsymbol{w}^{(t)})_i\\ \text{RMS}[\nabla E_i]_t = \sqrt{v_{i,t}+\epsilon}$$
### AdaDelta
ハイパーパラメータ$\eta$を用いずに学習率をうまく決める工夫。$$\Delta w_i^{(t)} = - \frac{\text{RMS}[\Delta w_i]_{t-1}}{\text{RMS}[\nabla E(\boldsymbol{w})_i]_t}\nabla E(\boldsymbol{w}^{(t)})_i\\ $$
### Adam
RMSpropにおいて、勾配の平均・分散のバイアスをなくす工夫。$$\Delta w_i^{(t)} = -\eta \frac{\hat{m}_{i,t}}{\sqrt{\hat{v}_{i,t}+\epsilon}}\\ \hat{m}_{i,t} = \frac{m_{i,t}}{1-\rho_1^t}\\ \hat{v}_{i,t} = \frac{v_{i,t}}{1-\rho_2^t}\\ m_{i,t} = \rho_1 m_{i,t-1} + (1-\rho_1)\nabla E(\boldsymbol{w}^{(t)})_i\\ v_{i,t} = \rho_2 v_{i,t-1} + (1-\rho_2)(\nabla E(\boldsymbol{w}^{(t)})_i)^2\\ m_{i,0} = 0\\ v_{i,0} = 0$$

## 単なる勾配降下法の問題点
誤差関数$E(w)$の形によっては、学習が安定しない。
- 非常に緩やかで広い領域では、勾配が小さいのでなかなか学習が進まない
- 緩やかな領域に突然急峻な壁があると、ゆっくり壁に近づいて跳ね返され、また近づいては跳ね返され...を繰り返し、学習が終わらない。
- 非常に鋭く深い谷があると、その両側の壁の勾配の大きさから一向にそこに到達することなく振動を続けてしまう。
- 鞍点(saddle point)と極小を区別できず、学習が終了してしまう。

##  ビジュアル化の概要
各問題点を表現するような勾配曲線を定義、そこに現在のパラメータを表す点を表示し、勾配降下法によってパラメータを更新していき、点がアニメーションとして移動する様子を見せる。簡単のためパラメータは1次元とする。
### 表示
- タイトル・説明
- メインキャンバス：以下の二つグラフを縦に並べ、現時点のパラメータに対応する点をプロットする。
  - 誤差曲線：横軸がパラメータ$w$、縦軸がその時の誤差$E(w)$
  - 勾配曲線：横軸がパラメータ$w$、縦軸がその時の誤差曲線の勾配$\frac{\partial E}{\partial w}(w)$
- UI
  - 誤差関数の選択
    - 上記問題点を分かりやすく表現する誤差関数をいくつか定義し、それを選択できるようにする。
  - 勾配降下法の種類の選択
    - シンプルな勾配降下法を含めた上記8種類を選択可能にする。
  - ハイパーパラメータの設定
    - 各学習方法で設定が必要最低限のハイパーパラメータを数値入力形式で更新可能にする。
    - 初期値は一般に推奨されているものをそれぞれ採用。
  - シミュレーションのステップ制御
    - 次へ：次のステップへパラメータを一回のみ更新する
    - 戻る：パラメータの更新履歴を保存し、現時点より一歩前に戻る。
    - 再生・停止・リセット：ステップを自動で更新し続けるモードの制御。