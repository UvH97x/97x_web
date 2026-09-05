// src/app/simulators/measure-theory/page.tsx
import { SimulatorCatalog } from '@/src/app/simulators/_components/SimulatorCatalog';

const apps = [
  {
    title: '単函数近似 fₙ ↑ f',
    description:
      '非負可測函数 f を単函数列で下から近似する構成の可視化。値域を 2⁻ⁿ 幅で分割して下側に丸め、'
      + 'f(x) ≥ n を n で切り詰める過程と、添字 k の意味を点ごとに確認できる。',
    href: '/simulators/measure-theory/simple-function-approximation',
  },
];

export default function Page() {
  return (
    <SimulatorCatalog
      title="測度論"
      description="測度論・ルベーグ積分の構成を可視化するシミュレーターの一覧です。"
      items={apps}
    />
  );
}
