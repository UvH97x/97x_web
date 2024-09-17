'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Next.jsのルーターを使ってページ遷移を制御

const Header: React.FC = () => {
  const router = useRouter();

  const handleTitleClick = () => {
    router.push('/'); // ホームページへ遷移
  };

  return (
    <header className="p-4 text-white text-2xl">
      <span
        className="cursor-pointer"
        onClick={handleTitleClick} // h1要素をクリックするとホームへ遷移
      >
        97x's garbage
      </span>
    </header>
  );
};

export default Header;
