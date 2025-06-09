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
  const { classic, gadget, starpower, audio, pixels } = useDailyStore();
  
  const modes = [
    { 
      key: 'classic' as const, 
      name: t('mode.classic'), 
      state: classic,
      iconSrc: '/ClassicIcon.png',
      path: '/daily/classic',
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-400/40'
    },
    { 
      key: 'gadget' as const, 
      name: t('mode.gadget'), 
      state: gadget,
      iconSrc: '/GadgetIcon.png',
      path: '/daily/gadget',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/40'
    },
    { 
      key: 'starpower' as const, 
      name: t('mode.starpower'), 
      state: starpower,
      iconSrc: '/StarpowerIcon.png',
      path: '/daily/starpower',
      color: 'from-orange-500 to-yellow-600',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-400/40'
    },
    { 
      key: 'audio' as const, 
      name: t('mode.audio'), 
      state: audio,
      iconSrc: '/AudioIcon.png',
      path: '/daily/audio',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-400/40'
    },
    { 
      key: 'pixels' as const, 
      name: t('mode.pixels'), 
      state: pixels,
      iconSrc: '/PixelsIcon.png',
      path: '/daily/pixels',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-500/20',
      borderColor: 'border-indigo-400/40'
    },
  ];

  const handleModeClick = (mode: typeof modes[0]) => {
    if (mode.key !== currentMode) {
      navigate(mode.path);
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-3 md:gap-4", className)}>
      {/* Enhanced Mode Icons */}
      {modes.map((mode, index) => {
        const isCompleted = mode.state.isCompleted;
        const isCurrent = mode.key === currentMode;
        
        return (
          <div key={mode.key} className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleModeClick(mode)}
              className={cn(
                "relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg",
                isCompleted
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/30 hover:shadow-green-500/50"
                  : isCurrent
                  ? `bg-gradient-to-br ${mode.color} text-white shadow-xl hover:shadow-2xl`
                  : `${mode.bgColor} ${mode.borderColor} border-2 text-white/70 hover:text-white hover:bg-opacity-30 shadow-md hover:shadow-lg`,
                !isCurrent && "cursor-pointer"
              )}
              disabled={isCurrent}
              title={mode.name}
            >
              {isCompleted ? (
                <Check className="h-7 w-7 md:h-8 md:w-8 drop-shadow-sm" />
              ) : (
                <img 
                  src={mode.iconSrc} 
                  alt={mode.name} 
                  className="h-7 w-7 md:h-8 md:w-8 object-contain drop-shadow-sm"
                />
              )}
              
              {/* Current mode indicator */}
              {isCurrent && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
              )}
              
              {/* Completion indicator */}
              {isCompleted && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-slate-900" />
                </div>
              )}
            </button>
            
            {/* Mode label */}
            <span className={cn(
              "text-xs font-medium text-center leading-tight transition-colors duration-200",
              isCurrent ? "text-white" : "text-white/60"
            )}>
              {mode.name}
            </span>
            
            {/* Connection line to next mode */}
            {index < modes.length - 1 && (
              <div className="hidden md:block absolute top-7 left-full w-4 h-0.5 bg-white/20 transform translate-x-2"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DailyModeProgress; 