// src/app/simulators/machine-learning/page.tsx
import Link from 'next/link';

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
];

export default function Page() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">機械学習</h1>
      <p className="text-gray-600">以下は、機械学習の概念を可視化するシミュレーターの一覧です。</p>
      <ul className="grid gap-4">
        {apps.map((app) => (
          <li key={app.href} className="p-4 border rounded-lg shadow hover:shadow-md transition">
            <Link href={app.href} className="block">
              <h2 className="text-xl font-semibold text-blue-600 hover:underline">{app.title}</h2>
              <p className="text-gray-500 mt-1">{app.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}