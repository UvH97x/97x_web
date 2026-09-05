// src/app/simulators/page.tsx
import { SimulatorCatalog } from '@/src/app/simulators/_components/SimulatorCatalog';

const apps = [
  {
    title: 'Machine Learning',
    description: '機械学習関連',
    href: '/simulators/machine-learning/',
  },
  {
    title: '統計',
    description: '統計・確率関連',
    href: '/simulators/statistics/',
  },
];

export default function PageMain() {
  return (
    <SimulatorCatalog
      title="シミュレーター一覧"
      description="以下は、自作した各分野のシミュレーターです。"
      items={apps}
    />
  );
}