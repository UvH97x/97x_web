import React from 'react';
import Link from 'next/link';

import { PageLink } from "@/src/types/UvHTypes";

interface Props {
  pageLink: PageLink;
}

const LinkBlock: React.FC<Props> = ({ pageLink }) => {
  return (
    <Link
      href={pageLink.href}
      className="group block border border-border rounded-lg p-5 transition-all duration-200 hover:scale-105 hover:shadow-md"
    >
      {pageLink.icon && (
        <img src={pageLink.icon} alt="" className="mb-3 h-8 w-8 dark:invert" />
      )}
      <h2 className="text-lg font-semibold text-fg group-hover:text-accent">
        {pageLink.label}
      </h2>
      {pageLink.description && (
        <p className="mt-1 text-sm text-muted leading-relaxed">
          {pageLink.description}
        </p>
      )}
    </Link>
  );
};

export default LinkBlock;
