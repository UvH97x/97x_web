/*
  * /src/app/applications/page.tsx
*/

import React from 'react';
import Link from 'next/link';

export default function AppHome() {
  return (
    <div>
      <h1>Applications Home</h1>
      <p>This is the Application Home.</p>
      <div>
        <Link href="./applications/todo">
          <span className="underline hover:text-slate-400">
            Todo List
          </span>
        </Link>
      </div>
    </div>
  );
}