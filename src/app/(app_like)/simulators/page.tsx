// src/app/simulators/page.tsx
import Link from 'next/link';

const apps = [
  {
    title: 'Machine Learning',
    description: '機械学習関連',
    href: '/simulators/machine-learning/',
  },
];

export default function PageMain() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">シミュレーター一覧</h1>
      <p className="text-gray-600">以下は、自作した各分野のシミュレーターです。</p>
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