import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from '@/components/ui/image';
import GameModeTracker from '@/components/GameModeTracker';
import { useStreak } from '@/contexts/StreakContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame } from 'lucide-react';

const TopBar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { language, changeLanguage } = useLanguage();
  const { streak, loading } = useStreak();

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
            {/* Streak Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  "ml-3 flex items-center px-2 py-1 rounded-full bg-yellow-100/80 border border-yellow-400 text-yellow-900 font-semibold text-sm shadow-sm",
                  streak >= 2 ? "animate-pulse" : ""
                )}>
                  {streak >= 2 && <Flame className="w-4 h-4 mr-1 text-orange-500" />}
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
            onClick={() => changeLanguage('en')}
            className={cn(
              "font-semibold",
              language === 'en' ? "text-primary border-primary/50" : "text-foreground/70 hover:text-primary hover:bg-primary/10",
              "border transition-all duration-300 px-3 py-1 h-auto"
            )}
            aria-label="Switch to English"
          >
            EN
          </Button>
          <Button
            variant={language === 'he' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => changeLanguage('he')}
            className={cn(
              "font-semibold",
              language === 'he' ? "text-primary border-primary/50" : "text-foreground/70 hover:text-primary hover:bg-primary/10",
              "border transition-all duration-300 px-3 py-1 h-auto"
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
