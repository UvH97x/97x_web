// src/articles/Breadcrumbs.tsx
import Link from 'next/link';

interface BreadcrumbItem {
  title: string;
  href: string;
}

export default function Breadcrumbs( param: BreadcrumbItem ) {
  return (
    <nav aria-label="breadcrumb">
      <div className='flex flex-row gap-2 text-xl'>
        {param.href.split("/").map((href, index) => (
          <span key={index} className='flex flex-row gap-2'>
            <Link href={`/${href}`}><span className="underline text-blue-800">{param.title}</span></Link>
            {`>`}
          </span>
        ))}
      </div>
    </nav>
  );
}
