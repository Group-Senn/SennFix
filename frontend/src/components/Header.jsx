import React from 'react';

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 border-b border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">construction</span>
          <h1 className="text-2xl font-bold tracking-tighter text-primary">SENN Fix</h1>
        </div>
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-primary/5 text-primary"><span className="material-symbols-outlined">notifications</span></button>
          <button className="p-2 rounded-full bg-primary/5 text-primary"><span className="material-symbols-outlined">menu</span></button>
        </div>
      </div>
    </header>
  );
}

export default Header;