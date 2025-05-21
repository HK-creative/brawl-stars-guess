import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { modeOrder, modeIcons, modeDisplayNames } from './GameModeCard';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStreak } from '@/contexts/StreakContext';

// Helper to get mode key from path
const getModeFromPath = (pathname: string) => {
  if (pathname === '/') return null;
  for (const mode of modeOrder) {
    if (pathname.includes(mode)) return mode;
  }
  return null;
};

const STORAGE_KEY = 'brawldle_completed_modes';

const GameModeTracker: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { completedModes: gameModeCompletions } = useStreak();
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [nextMode, setNextMode] = useState<string | null>(null);
  const [completedModes, setCompletedModes] = useState<string[]>([]);

  // Determine current mode from URL
  useEffect(() => {
    const mode = getModeFromPath(location.pathname);
    setCurrentMode(mode);

    // Set next mode based on current mode
    if (mode) {
      const currentIndex = modeOrder.indexOf(mode);
      const nextIndex = (currentIndex + 1) % modeOrder.length;
      setNextMode(modeOrder[nextIndex]);
    } else {
      setNextMode(null);
    }
  }, [location.pathname]);

  // Set completed modes from streak context
  useEffect(() => {
    if (gameModeCompletions) {
      const completed = Object.entries(gameModeCompletions)
        .filter(([_, status]) => status === true)
        .map(([mode]) => mode);
      setCompletedModes(completed);
    }
  }, [gameModeCompletions]);

  // Check if all modes are completed
  const allCompleted = modeOrder.every(mode => completedModes.includes(mode));

  // Load completed modes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCompletedModes(JSON.parse(stored));
    }
  }, []);

  // Mark mode as completed when game is finished (listen for custom event)
  useEffect(() => {
    const handler = (e: any) => {
      const { mode } = e.detail || {};
      if (mode && !completedModes.includes(mode)) {
        const updated = [...completedModes, mode];
        setCompletedModes(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    };
    window.addEventListener('brawldle-mode-completed', handler);
    return () => window.removeEventListener('brawldle-mode-completed', handler);
  }, [completedModes]);

  // Reset tracker on home
  useEffect(() => {
    if (location.pathname === '/') {
      setCompletedModes([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [location.pathname]);

  return (
    <div className={cn(
      'flex items-center gap-2 md:gap-4 px-2 py-1 mt-14 sm:mt-4 rounded-xl bg-black/30 border border-primary/30 shadow',
      allCompleted && 'ring-2 ring-yellow-400 animate-pulse-glow'
    )}>
      {modeOrder.map((mode, idx) => {
        const isCurrent = mode === currentMode;
        const isCompleted = completedModes.includes(mode);
        const isNext = nextMode === mode;
        return (
          <div
            key={mode}
            className={cn(
              'flex flex-col items-center justify-center cursor-pointer group',
              isCurrent && 'scale-110 drop-shadow-lg',
              isCompleted && 'opacity-80',
              isNext && 'animate-pulse-glow'
            )}
            onClick={() => navigate(`/${mode}`)}
            title={modeDisplayNames[mode]}
          >
            <div className={cn(
              'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2',
              isCurrent ? 'border-yellow-400 bg-brawl-yellow' : 'border-white/30 bg-black/60',
              isCompleted && 'border-green-400 bg-green-600/80',
              isNext && 'border-yellow-400 bg-yellow-400/30',
              'transition-all duration-200'
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-green-300" />
              ) : (
                <img src={modeIcons[mode]} alt={mode} className="w-6 h-6 md:w-8 md:h-8 object-contain" />
              )}
            </div>
            <span className={cn(
              'text-xs md:text-sm font-bold mt-1',
              isCurrent ? 'text-brawl-yellow' : 'text-white/80',
              isCompleted && 'text-green-300',
              isNext && 'text-yellow-400'
            )}>
              {modeDisplayNames[mode].replace(' Mode', '')}
            </span>
          </div>
        );
      })}
      
      {allCompleted && (
        <div className="absolute -right-1 -top-2 rotate-12 text-lg">
          🎉
        </div>
      )}
    </div>
  );
};

export default GameModeTracker; 