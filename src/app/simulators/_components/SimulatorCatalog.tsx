import { PageHeader } from '@/src/components/ui/PageHeader';
import { LinkCard, type LinkCardItem } from '@/src/components/ui/LinkCard';

interface Props {
  title: string;
  description: string;
  items: readonly LinkCardItem[];
}

export function SimulatorCatalog({ title, description, items }: Props) {
  return (
    <div>
      <PageHeader description={description}>{title}</PageHeader>
      <ul className="grid gap-4">
        {items.map(item => (
          <li key={item.href}>
            <LinkCard {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
