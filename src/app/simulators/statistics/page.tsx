import { SimulatorCatalog } from '@/src/app/simulators/_components/SimulatorCatalog';

const simulators = [
  {
    title: '確率分布エクスプローラ',
    description:
      '正規・Gamma・（非心）χ²・二項・Poisson など 15 種類の分布の密度関数／確率質量関数と累積分布関数を、乱数標本と重ねて可視化。' +
      '分位点や区間確率も確認でき、状態は URL で共有できる。',
    href: '/simulators/statistics/distributions',
  },
  {
    title: '一様乱数からのガウス生成器',
    description:
      'N 個の U(0,1) 乱数の和を標準化して N(0,1) を近似する方法を可視化。' +
      '厳密な Irwin–Hall 分布・経験ヒストグラム・N(0,1) の三重比較でCLTを体感できる。',
    href: '/simulators/statistics/uniform-to-gaussian',
  },
];

export default function Page() {
  return (
    <SimulatorCatalog
      title="統計"
      description="統計・確率に関するシミュレーターの一覧です。"
      items={simulators}
    />
  );
}
