import { Suspense } from 'react';
import { Explorer } from './Explorer';

export default function Page() {
  // useSearchParams (inside Explorer) requires a Suspense boundary for prerendering.
  return (
    <Suspense fallback={null}>
      <Explorer />
    </Suspense>
  );
}
