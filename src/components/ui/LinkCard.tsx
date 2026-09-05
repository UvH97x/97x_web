import Link from 'next/link';

export interface LinkCardItem {
  href: string;
  title: string;
  description?: string;
  icon?: string;
}

type Props = LinkCardItem & { variant?: 'home' | 'catalog' };

export function LinkCard({ href, title, description, icon, variant = 'home' }: Props) {
  const isHome = variant === 'home';

  return (
    <Link
      href={href}
      className={isHome
        ? 'group block border border-border rounded-lg p-5 transition-all duration-200 hover:scale-105 hover:shadow-md'
        : 'block'}
    >
      {icon && <img src={icon} alt="" className="mb-3 h-8 w-8 dark:invert" />}
      <h2 className={isHome
        ? 'text-lg font-semibold text-fg group-hover:text-accent'
        : 'text-xl font-semibold text-blue-600 hover:underline'}>
        {title}
      </h2>
      {description && (
        <p className={isHome
          ? 'mt-1 text-sm text-muted leading-relaxed'
          : 'text-gray-500 mt-1'}>
          {description}
        </p>
      )}
    </Link>
  );
}
