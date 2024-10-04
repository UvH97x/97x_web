// src/components/Header.tsx

'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="px-4 py-2 text-white text-2xl h-14">
      {/* サイドバーのトグル */}
      <div>
      </div>
      {/**/}
      <Link href="/">
        97x
      </Link>
    </header>
  );
};

export default Header;
