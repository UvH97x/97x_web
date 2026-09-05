// src/app/articles/layout.tsx

import Breadcrumbs from './_components/Breadcrumbs';

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs />
      <div>{children}</div>
    </div>
  );
}
