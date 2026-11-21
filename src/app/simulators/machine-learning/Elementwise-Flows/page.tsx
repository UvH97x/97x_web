import { Suspense } from 'react';
import { Explorer } from './Explorer';

export default function Page() {
  // Explorer 内の useSearchParams はプリレンダリング時に Suspense 境界を必要とする。
  return (
    <Suspense fallback={null}>
      <Explorer />
    </Suspense>
  );
}
