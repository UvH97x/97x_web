// src/components/Header.tsx

'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="px-4 py-2 text-white text-xl">
      {/* サイドバーのトグル */}
      {/**/}
      <Link href="/" className='flex gap-1 w-20'>
        <img src="/favicon.ico" width={32} height={32} />
        <span className="text-gray-200 font-bold">97x</span>
      </Link>
    </header>
  );
};

export default Header;
