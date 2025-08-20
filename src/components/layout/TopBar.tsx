import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from '@/components/ui/image';
import GameModeTracker from '@/components/GameModeTracker';
import { useStreak } from '@/contexts/StreakContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame } from 'lucide-react';

const TopBar: React.FC = () => {
  // Determine if viewport is mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { language, changeLanguage } = useLanguage();
  const { streak, loading } = useStreak();

  // Scale top bar globally: boost on mobile, slight on desktop
  const [topBarScale, setTopBarScale] = useState(1);
  useEffect(() => {
    const calcScale = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      const isMobileViewport = w < 640;
      if (isMobileViewport) {
        const ratio = w >= 410 ? 1 : Math.max(0.8, (w - 320) / (410 - 320));
        const mobileBase = 1.30; // stronger boost on mobile
        setTopBarScale(ratio * mobileBase);
      } else {
        const desktopBase = 1.12; // subtle boost on desktop
        setTopBarScale(desktopBase);
      }
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <header className={cn(
      "top-bar",
      "relative z-20",
      "border-b border-primary/30",
      "bg-background/80 backdrop-blur-sm"
    )}>
      <div
        className={cn(
        "w-full sm:w-[48rem] mx-auto",
        "px-4 sm:px-6 lg:px-8",
        "h-16",
        "flex items-center justify-between"
      )}
      style={{
        transform: `scale(${topBarScale})`,
        transformOrigin: 'top center',
        height: `${64 * topBarScale}px`,
      }}>
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
                <img 
                  src="/bs_home_icon.png"
                  alt="Home"
                  className={isMobile ? 'h-9 w-9' : 'h-8 w-8'}
                />
              </Button>
            </Link>
          )}
          
          <Link to="/" className="flex items-center space-x-2">
            <span className={cn(
              isMobile ? "text-3xl" : "text-2xl",
              "animate-bounce",
              "transition-transform duration-300 hover:scale-110"
            )}>
              🔥
            </span>
            <h1 className={cn(
              isMobile ? "text-2xl font-bold" : "text-xl font-bold",
              "text-gradient-primary"
            )}
            style={{ fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive" }}
            >
              Brawldle
            </h1>
            {/* Streak Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  "ml-3 flex items-center px-2 py-1 rounded-full bg-yellow-100/80 border border-yellow-400 text-yellow-900 font-semibold text-sm shadow-sm",
                  streak >= 2 ? "animate-pulse" : ""
                )}>
                  {streak >= 2 && <Flame className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4', 'mr-1 text-orange-500')} />}
                  {loading ? '...' : streak}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Consecutive days you've conquered every mode!
              </TooltipContent>
            </Tooltip>
          </Link>
        </div>
        {/* Game Mode Tracker */}
        <div className="flex-1 flex justify-center">
          <GameModeTracker />
        </div>
        <div className="flex items-center space-x-2">
          {/* Language Buttons */}
          <Button
            variant={language === 'en' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => { if (language !== 'en') changeLanguage('en'); }}
            disabled={language === 'en'}
            aria-disabled={language === 'en'}
            tabIndex={language === 'en' ? -1 : 0}
            className={cn(
              "font-semibold",
              language === 'en' ? "text-primary border-primary/50 cursor-not-allowed" : "text-foreground/70 hover:text-primary hover:bg-primary/10",
              "border transition-all duration-300 px-4 py-2 h-auto"
            )}
            aria-label="Switch to English"
          >
            EN
          </Button>
          <Button
            variant={language === 'he' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => { if (language !== 'he') changeLanguage('he'); }}
            disabled={language === 'he'}
            aria-disabled={language === 'he'}
            tabIndex={language === 'he' ? -1 : 0}
            className={cn(
              "font-semibold",
              language === 'he' ? "text-primary border-primary/50 cursor-not-allowed" : "text-foreground/70 hover:text-primary hover:bg-primary/10",
              "border transition-all duration-300 px-4 py-2 h-auto"
            )}
            aria-label="Switch to Hebrew"
          >
            HE
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
