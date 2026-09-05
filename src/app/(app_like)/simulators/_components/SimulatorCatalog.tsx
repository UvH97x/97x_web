import { LinkCard, type LinkCardItem } from '@/src/components/ui/LinkCard';

interface Props {
  title: string;
  description: string;
  items: readonly LinkCardItem[];
}

export function SimulatorCatalog({ title, description, items }: Props) {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{description}</p>
      <ul className="grid gap-4">
        {items.map(item => (
          <li key={item.href} className="p-4 border rounded-lg shadow hover:shadow-md transition">
            <LinkCard {...item} variant="catalog" />
          </li>
        ))}
      </ul>
    </main>
  );
}
