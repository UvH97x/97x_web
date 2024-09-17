import React from 'react';

function HomePage() {
  return (
    <div className="flex flex-col items-center p-0">
      {/* タイトル */}
      <h1 className="text-4xl font-bold mb-8 text-slate-900">
        Welcome to My Website
      </h1>
  
      {/* 説明文 */}
      <p className="text-lg text-gray-700 mb-8">
        This is the homepage content.
      </p>
    </div>
  );
}

export default HomePage;