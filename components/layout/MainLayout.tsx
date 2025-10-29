import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-6 shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide text-indigo-300">Список дел</h1>
      </header>
      <main className="grow p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-400 p-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Список дел. Все права защищены.</p>
      </footer>
    </div>
  );
}
