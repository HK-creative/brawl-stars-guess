import React from 'react';
import TopBar from './TopBar';
import RotatingBackground from './RotatingBackground';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <ToastProvider>
      <div className={cn(
        "flex min-h-screen max-h-screen flex-col",
        "bg-background",
        "relative overflow-hidden"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-30" />
        
        <RotatingBackground showNextButton={isHomePage} />
        
        <TopBar />
        
        <main className={cn(
          "flex-1 relative z-10",
          "flex justify-center",
          "overflow-hidden",
          "px-4 sm:px-6 lg:px-8",
          "animate-fade-in"
        )}>
          <div className={cn(
            "w-full max-w-7xl mx-auto",
            "py-6 space-y-8",
            "overflow-hidden"
          )}>
            {children}
          </div>
        </main>
        
        <footer className={cn(
          "relative z-10",
          "py-4 px-4 sm:px-6 lg:px-8",
          "border-t border-primary/30",
          "bg-background/80 backdrop-blur-sm"
        )}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className="text-sm text-foreground/60">
              Made with ❤️ for Brawl Stars fans
            </p>
            <p className="text-sm text-foreground/60">
              © {new Date().getFullYear()} Brawldle
            </p>
          </div>
        </footer>
        
        <Toaster />
      </div>
    </ToastProvider>
  );
};

export default Layout;
