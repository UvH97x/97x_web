import { PageHeader } from '@/src/components/ui/PageHeader';
// /src/app/applications/page.tsx


import React from 'react';
import { LinkCard } from '@/src/components/ui/LinkCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  description: "色々なアプリケーションへのリンク"
}

export default function PageMain() {
  return (
    <div>
      {/* タイトル */}
      <PageHeader description="This is the Application Home. Explore the available apps below.">
        Applications Home
      </PageHeader>

      {/* リンクコンテナ */}
      <div className="space-y-4">
        {/* リンク */}
        <LinkCard href="/applications/todo" title="Todo List" />
      </div>
    </div>
  );
}
