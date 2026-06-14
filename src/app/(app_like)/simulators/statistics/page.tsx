import Link from 'next/link';

const simulators = [
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
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">統計</h1>
      <p className="text-gray-600">統計・確率に関するシミュレーターの一覧です。</p>
      <ul className="grid gap-4">
        {simulators.map(s => (
          <li key={s.href} className="p-4 border rounded-lg shadow hover:shadow-md transition">
            <Link href={s.href} className="block">
              <h2 className="text-xl font-semibold text-blue-600 hover:underline">{s.title}</h2>
              <p className="text-gray-500 mt-1">{s.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
