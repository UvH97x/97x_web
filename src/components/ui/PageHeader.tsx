import type { ReactNode } from 'react';

export function PageHeader({ children, description }: {
  children: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header className="not-prose mb-8 space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl leading-snug break-words">
        {children}
      </h1>
      {description && <p className="text-base leading-relaxed text-muted">{description}</p>}
    </header>
  );
}
