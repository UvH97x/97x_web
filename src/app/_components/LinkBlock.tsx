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
      className="group block border border-slate-200 rounded-lg p-5 transition-all duration-200 hover:scale-105 hover:shadow-md"
    >
      {pageLink.icon && (
        <img src={pageLink.icon} alt="" className="mb-3 h-8 w-8" />
      )}
      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-accent">
        {pageLink.label}
      </h2>
      {pageLink.description && (
        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
          {pageLink.description}
        </p>
      )}
    </Link>
  );
};

export default LinkBlock;
