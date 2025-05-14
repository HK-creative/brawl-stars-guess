
import React from 'react';
import TopBar from './TopBar';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
