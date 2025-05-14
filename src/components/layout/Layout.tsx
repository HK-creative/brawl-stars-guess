
import React from 'react';
import TopBar from './TopBar';
import RotatingBackground from './RotatingBackground';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-brawl-dark relative">
      <RotatingBackground />
      <TopBar />
      <main className="flex-1 relative z-10 flex justify-center">
        <div className="w-full max-w-5xl px-4 py-6">
          {children}
        </div>
      </main>
      <Toaster position="bottom-center" closeButton />
    </div>
  );
};

export default Layout;
