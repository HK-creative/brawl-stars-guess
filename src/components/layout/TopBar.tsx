
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from '@/components/ui/image';
import { useIsMobile } from '@/hooks/use-mobile';

const TopBar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { language, changeLanguage } = useLanguage();
  const isMobile = useIsMobile();

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <header className="relative z-20 border-b border-primary/30 bg-background/80 backdrop-blur-sm py-2">
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          {!isHome && (
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/70 hover:text-primary hover:bg-primary/10 border border-primary/30"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          {isMobile && isHome ? (
            <div className="flex items-center space-x-1">
              <span className="text-xl animate-bounce transition-transform duration-300 hover:scale-110">
                🔥
              </span>
              <h1 className="text-xl font-bold text-gradient-primary">
                Brawldle
              </h1>
            </div>
          ) : !isHome && (
            <Link to="/" className="flex items-center space-x-1">
              <span className="text-lg animate-bounce transition-transform duration-300 hover:scale-110">
                🔥
              </span>
              <h1 className="text-lg font-bold text-gradient-primary">
                Brawldle
              </h1>
            </Link>
          )}
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-foreground/70 hover:text-primary hover:bg-primary/10 border border-primary/30 p-1"
          >
            <Image 
              src={language === 'en' ? '/USAIcon.png' : '/IsraelIcon.png'} 
              alt={language === 'en' ? 'English' : 'Hebrew'}
              width={18}
              height={18}
              className="w-5 h-5"
              objectFit="contain"
            />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
