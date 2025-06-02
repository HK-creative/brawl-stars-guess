import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyStore, DailyGameMode } from '@/stores/useDailyStore';
import { useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';

interface DailyModeProgressProps {
  currentMode?: DailyGameMode;
  className?: string;
}

const DailyModeProgress: React.FC<DailyModeProgressProps> = ({ 
  currentMode, 
  className 
}) => {
  const navigate = useNavigate();
  const { classic, gadget, starpower, audio } = useDailyStore();
  
  const modes = [
    { 
      key: 'classic' as const, 
      name: t('mode.classic'), 
      state: classic,
      iconSrc: '/ClassicIcon.png',
      path: '/daily/classic',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      key: 'gadget' as const, 
      name: t('mode.gadget'), 
      state: gadget,
      iconSrc: '/GadgetIcon.png',
      path: '/daily/gadget',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      key: 'starpower' as const, 
      name: t('mode.starpower'), 
      state: starpower,
      iconSrc: '/StarpowerIcon.png',
      path: '/daily/starpower',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      key: 'audio' as const, 
      name: t('mode.audio'), 
      state: audio,
      iconSrc: '/AudioIcon.png',
      path: '/daily/audio',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const handleModeClick = (mode: typeof modes[0]) => {
    if (mode.key !== currentMode) {
      navigate(mode.path);
    }
  };

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {/* Minimal Mode Icons */}
      {modes.map((mode) => {
        const isCompleted = mode.state.isCompleted;
        const isCurrent = mode.key === currentMode;
        
        return (
          <button
            key={mode.key}
            onClick={() => handleModeClick(mode)}
            className={cn(
              "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400/50",
              isCompleted
                ? "bg-green-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                : isCurrent
                ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50"
                : "bg-slate-700/70 text-slate-400 hover:bg-slate-600/70 shadow-md hover:shadow-lg",
              !isCurrent && "cursor-pointer"
            )}
            disabled={isCurrent}
            title={mode.name}
          >
            {isCompleted ? (
              <Check className="h-6 w-6" />
            ) : (
              <img 
                src={mode.iconSrc} 
                alt={mode.name} 
                className="h-6 w-6 object-contain"
              />
            )}
            
            {/* Small completion dot indicator */}
            {isCompleted && !isCurrent && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900">
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DailyModeProgress; 