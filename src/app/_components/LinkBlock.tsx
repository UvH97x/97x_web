import React from 'react';
import { LinkCard } from '@/src/components/ui/LinkCard';

import { PageLink } from "@/src/types/UvHTypes";

interface Props {
  pageLink: PageLink;
}

const LinkBlock: React.FC<Props> = ({ pageLink }) => {
  return (
    <LinkCard
      href={pageLink.href}
      title={pageLink.label}
      icon={pageLink.icon}
      description={pageLink.description}
    />
  );
};

export default LinkBlock;
