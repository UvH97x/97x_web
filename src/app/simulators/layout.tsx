// src/app/simulators/layout.tsx

export const metadata = {
  title: 'シミュレーター',
  description: '数学・物理・機械学習の概念を体験できるシミュレーターです。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div>{children}</div>
  )
}
