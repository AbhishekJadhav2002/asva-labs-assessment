import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProperties {
  children: ReactNode;
}

export function Layout({ children }: LayoutProperties) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}