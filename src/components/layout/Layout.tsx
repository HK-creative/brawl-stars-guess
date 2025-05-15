
import React from 'react';
import TopBar from './TopBar';
import RotatingBackground from './RotatingBackground';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen max-h-screen flex-col bg-brawl-dark relative overflow-hidden">
      <RotatingBackground />
      <TopBar />
      <main className="flex-1 relative z-10 flex justify-center overflow-hidden">
        <div className="w-full max-w-5xl px-1 pt-1 pb-0 overflow-hidden">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
