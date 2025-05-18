
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from '@/components/ui/image';

const TopBar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <header className={cn(
      "relative z-20",
      "border-b border-primary/30",
      "bg-background/80 backdrop-blur-sm"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto",
        "px-4 sm:px-6 lg:px-8",
        "h-16",
        "flex items-center justify-between"
      )}>
        <div className="flex items-center space-x-4">
          {!isHome && (
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-foreground/70 hover:text-primary",
                  "hover:bg-primary/10",
                  "border border-primary/30",
                  "transition-all duration-300"
                )}
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          <Link to="/" className="flex items-center space-x-2">
            <span className={cn(
              "text-2xl",
              "animate-bounce",
              "transition-transform duration-300 hover:scale-110"
            )}>
              🔥
            </span>
            <h1 className={cn(
              "text-xl font-bold",
              "text-gradient-primary"
            )}>
              Brawldle
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className={cn(
              "text-foreground/70 hover:text-primary",
              "hover:bg-primary/10",
              "border border-primary/30",
              "transition-all duration-300"
            )}
          >
            <Image 
              src={language === 'en' ? '/USAIcon.png' : '/IsraelIcon.png'} 
              alt={language === 'en' ? 'English' : 'Hebrew'}
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
            />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
