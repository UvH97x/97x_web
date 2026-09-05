// src/app/simulators/machine-learning/page.tsx
import { SimulatorCatalog } from '@/src/app/(app_like)/simulators/_components/SimulatorCatalog';

const apps = [
  {
    title: 'Polynomial Regression Fitting',
    description: '多項式回帰モデルによるデータフィッティングのインタラクティブ可視化。過学習やL1,L2正則化の効果も分かる。',
    href: '/simulators/machine-learning/Polynomial-Regression-Fitting',
  },
  {
    title: 'Problems of Gradient Descent Method',
    description: '勾配降下法の問題点（局所解・鞍点など）を可視化するツール。',
    href: '/simulators/machine-learning/Problems-of-gradient-descent-method',
  },
  {
  title: '4-3-2 部分ネット可視化（ドロップアウト用）',
  description: '入力4・中間3のノードマスク105通りをID=1～105で切替可視化。出力層は落とさない。',
  href: '/simulators/machine-learning/Subnetwork-visualizer-4-3-2',
  }
];

export default function Page() {
  return (
    <SimulatorCatalog
      title="機械学習"
      description="以下は、機械学習の概念を可視化するシミュレーターの一覧です。"
      items={apps}
    />
  );
}