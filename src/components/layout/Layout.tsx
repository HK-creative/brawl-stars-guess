import React from 'react';
import { Button } from '@/components/ui/button';
import RotatingBackground from './RotatingBackground';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useLocation, Outlet } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from '@/components/ui/image';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { language, changeLanguage } = useLanguage();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 w-full h-full">
          <RotatingBackground />
        </div>

        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => changeLanguage('en')}
            className={cn(
              'rounded-full p-1 transition-all duration-200 border',
              language === 'en' 
                ? 'ring-2 ring-yellow-400 bg-black/60 border-yellow-400' 
                : 'opacity-70 hover:opacity-100 border-white/30'
            )}
            aria-label="Switch to English"
          >
            <Image
              src="/USAIcon.png"
              alt="English"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </button>
          
          <button
            onClick={() => changeLanguage('he')}
            className={cn(
              'rounded-full p-1 transition-all duration-200 border',
              language === 'he' 
                ? 'ring-2 ring-yellow-400 bg-black/60 border-yellow-400' 
                : 'opacity-70 hover:opacity-100 border-white/30'
            )}
            aria-label="Switch to Hebrew"
          >
            <Image
              src="/IsraelIcon.png"
              alt="Hebrew"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </button>
        </div>
        
        <main className={cn(
          "relative z-10 min-h-screen",
          isHomePage ? "pt-24" : "pt-8 px-4",
            "overflow-visible"
          )}>
          {children || <Outlet />}
        </main>
      </div>
      <Toaster />
    </ToastProvider>
  );
};

export default Layout;
