// src/app/applications/test/page.tsx

import { InlineMath, MathBlock } from "@/src/components/MathRenderer"
import UvHMarkdownRenderer from "@/src/components/UvHMarkdownRenderer";

export default function Page() {
  // MathRendererのテスト
  const mathContent = `cases(
  x = r sin theta cos phi,
  y = r sin theta sin phi,
  z = r cos theta
) <=> cases(
  r^2 = x^2 + y^2 + z^2,
  cos^2 theta = z(x^2 + y^2 + z^2)^(-1),
  tan phi = x^(-1)y
)`;
  // UvHMarkdownRendererのテスト
  const myContent = `# 中性子
  中性子は原子核を構成する核子の一つで、以下の性質を持つ。
  - 電気的に中性であり、物質との電気的相互作用を起こさない。
  - 
  - 中性子単体では不安定で、平均寿命886.7$plus.minus$1.9sで以下のベータ崩壊をする。
    $$ n arrow p + e^- + accent(nu, macron)_e + 0.78"MeV" $$
  - 1/2のスピンをもち、それによって磁気モーメント$mu_n$を持ち、以下の大きさである。
    $$ mu_n = g_n / 2 dot mu_N = -1.91 dot mu_N (mu_N": 核磁子, " 3.1525 times 10^(-14) "MeV"dot"T"^(-1)) $$
  - 磁気モーメントから、g因子$g_n$は$-3.82$である。`
  return (
    <div className="w-full">
      <div>
        this is test page
      </div>

      {/* MathRendererのテスト */}
      <p>インラインの数式は
        <InlineMath
          expression="sin theta"
        />
        のように書かれる。</p>
      <div>数式ブロックは
        <MathBlock
          expression={mathContent}
        />
        のように見える。</div>

      {/* UvHMarkdownRendererのテスト */}
      <UvHMarkdownRenderer markdownContent={myContent} />
    </div>
  )
}