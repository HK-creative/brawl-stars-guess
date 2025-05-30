import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyStore, DailyGameMode } from '@/stores/useDailyStore';

interface DailyModeProgressProps {
  currentMode?: DailyGameMode;
  className?: string;
}

const DailyModeProgress: React.FC<DailyModeProgressProps> = ({ 
  currentMode, 
  className 
}) => {
  const { classic, gadget, starpower, audio } = useDailyStore();
  
  const modes = [
    { 
      key: 'classic' as const, 
      name: 'Classic', 
      state: classic,
      iconSrc: '/ClassicIcon.png',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      key: 'gadget' as const, 
      name: 'Gadget', 
      state: gadget,
      iconSrc: '/GadgetIcon.png',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      key: 'starpower' as const, 
      name: 'Star Power', 
      state: starpower,
      iconSrc: '/StarpowerIcon.png',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      key: 'audio' as const, 
      name: 'Audio', 
      state: audio,
      iconSrc: '/AudioIcon.png',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const completedCount = modes.filter(mode => mode.state.isCompleted).length;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Progress Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-1">Daily Progress</h3>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs bg-slate-800/50 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 ease-out"
          style={{ width: `${(completedCount / 4) * 100}%` }}
        />
      </div>

      {/* Mode Icons Grid */}
      <div className="grid grid-cols-4 gap-3">
        {modes.map((mode) => {
          const isCompleted = mode.state.isCompleted;
          const isCurrent = mode.key === currentMode;
          
          return (
            <div
              key={mode.key}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300",
                isCompleted
                  ? "bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-400/50 shadow-lg shadow-green-500/20"
                  : isCurrent
                  ? "bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20"
                  : "bg-slate-800/30 border-2 border-slate-600/30 hover:border-slate-500/50"
              )}
            >
              {/* Icon Container */}
              <div className={cn(
                "relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                isCompleted
                  ? "bg-green-500 text-white"
                  : isCurrent
                  ? "bg-yellow-500 text-white"
                  : "bg-slate-700 text-slate-400"
              )}>
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <img 
                    src={mode.iconSrc} 
                    alt={mode.name} 
                    className="h-4 w-4 object-contain"
                  />
                )}
              </div>

              {/* Mode Name */}
              <span className={cn(
                "text-xs font-medium text-center leading-tight",
                isCompleted
                  ? "text-green-400"
                  : isCurrent
                  ? "text-yellow-400"
                  : "text-slate-400"
              )}>
                {mode.name}
              </span>

              {/* Completion Badge */}
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedCount === 4 && (
        <div className="text-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg">
          <p className="text-green-400 font-bold text-sm">🎉 All modes completed!</p>
          <p className="text-green-300/80 text-xs">Come back tomorrow for new challenges</p>
        </div>
      )}
    </div>
  );
};

export default DailyModeProgress; 