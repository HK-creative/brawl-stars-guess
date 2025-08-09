import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyStore, DailyGameMode } from '@/stores/useDailyStore';
import { t } from '@/lib/i18n';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

interface DailyModeProgressProps {
  currentMode?: DailyGameMode;
  className?: string;
  onModeChange?: (mode: DailyGameMode) => void;
}

const DailyModeProgress: React.FC<DailyModeProgressProps> = ({ 
  currentMode, 
  className,
  onModeChange
}) => {
  const { classic, gadget, starpower, audio, pixels } = useDailyStore();
  const { motionOK, transition } = useMotionPrefs();
  
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
    if (mode.key !== currentMode && onModeChange) {
      onModeChange(mode.key);
    }
  };

  const MotionButton = motion.button;

  return (
    <div className={cn("flex items-center justify-center gap-3 md:gap-4 px-4", className)}>
      {/* Enhanced Mode Icons */}
      {modes.map((mode, index) => {
        const isCompleted = mode.state.isCompleted;
        const isCurrent = mode.key === currentMode;
        
        return (
          <div key={mode.key} className="flex flex-col items-center">
            <MotionButton
              onClick={() => handleModeClick(mode)}
              whileTap={motionOK ? { scale: 0.96 } : undefined}
              whileHover={motionOK ? { scale: 1.03 } : undefined}
              className={cn(
                "relative w-[3.25rem] h-[3.25rem] md:w-[3.6rem] md:h-[3.6rem] rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg",
                isCompleted
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/30 hover:shadow-green-500/50"
                  : isCurrent
                  ? `bg-gradient-to-br ${mode.color} text-white shadow-xl hover:shadow-2xl`
                  : `${mode.bgColor} ${mode.borderColor} border-2 text-white/70 hover:text-white hover:bg-opacity-30 shadow-md hover:shadow-lg`,
                !isCurrent && "cursor-pointer"
              )}
              disabled={isCurrent}
              title={mode.name}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {/* Active halo using shared layout for smooth slide between items */}
              {isCurrent && (
                motionOK ? (
                  <motion.span
                    layoutId="modeActiveHalo"
                    className="absolute inset-0 rounded-full ring-2 ring-white/30 shadow-[0_0_24px_rgba(255,255,255,0.25)]"
                    transition={transition}
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="absolute inset-0 rounded-full ring-2 ring-white/30"
                    aria-hidden="true"
                  />
                )
              )}
              {isCompleted ? (
                <Check className="h-7 w-7 md:h-8 md:w-8 drop-shadow-sm" />
              ) : (
                <img 
                  src={mode.iconSrc} 
                  alt={mode.name} 
                  className="h-7 w-7 md:h-8 md:w-8 object-contain drop-shadow-sm"
                />
              )}
              
              {/* Current mode indicator (bottom dot) using shared layout for slide */}
              <AnimatePresence initial={false}>
                {isCurrent && (
                  motionOK ? (
                    <motion.span
                      layoutId="modeActiveDot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-lg"
                      transition={transition}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white"
                      aria-hidden="true"
                    />
                  )
                )}
              </AnimatePresence>
              
              {/* Completion indicator */}
              {isCompleted && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-slate-900" />
                </div>
              )}
              <span className="sr-only">{mode.name}</span>
            </MotionButton>
            
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