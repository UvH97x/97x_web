import Link from 'next/link';

export interface LinkCardItem {
  href: string;
  title: string;
  description?: string;
  icon?: string;
}

export function LinkCard({ href, title, description, icon }: LinkCardItem) {
  return (
    <Link
      href={href}
      className="group block h-full border border-border bg-surface rounded-lg p-5 transition-colors hover:border-accent"
    >
      {icon && <img src={icon} alt="" className="mb-3 h-8 w-8 dark:invert" />}
      <h2 className="text-lg font-semibold text-fg group-hover:text-accent">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-muted leading-relaxed">
          {description}
        </p>
      )}
    </Link>
  );
}
