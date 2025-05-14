
import React from 'react';
import TopBar from './TopBar';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-brawl-gradient">
      <TopBar />
      <main className="flex-1 w-full px-4 py-4 mx-auto max-w-lg">
        {children}
      </main>
      <Toaster position="bottom-center" closeButton />
    </div>
  );
};

export default Layout;
