import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/stores/useSurvivalStore';
import { Image, Volume2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

interface SurvivalModeSelectionPopupProps {
  availableModes: GameMode[];
  onSelectMode: (mode: GameMode) => void;
}

// Define GameMode details for UI with icons
const getGameModeDetails = (): { id: GameMode; labelKey: string; descriptionKey: string; icon: React.ReactNode; color: string }[] => [
  { 
    id: 'classic', 
    labelKey: 'survival.classic.label', 
    descriptionKey: 'survival.classic.description', 
    icon: <Image className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'gadget', 
    labelKey: 'survival.gadget.label', 
    descriptionKey: 'survival.gadget.description', 
    icon: <Zap className="h-6 w-6" />,
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'starpower', 
    labelKey: 'survival.starpower.label', 
    descriptionKey: 'survival.starpower.description', 
    icon: <div className="h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-yellow-600 rounded-full"></div></div>,
    color: 'from-yellow-500 to-yellow-600'
  },
  { 
    id: 'audio', 
    labelKey: 'survival.audio.label', 
    descriptionKey: 'survival.audio.description', 
    icon: <Volume2 className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-600'
  },
  { 
    id: 'pixels', 
    labelKey: 'survival.pixels.label', 
    descriptionKey: 'survival.pixels.description', 
    icon: <div className="h-5 w-5 grid grid-cols-2 gap-0.5"><div className="bg-white rounded-sm"></div><div className="bg-white/70 rounded-sm"></div><div className="bg-white/70 rounded-sm"></div><div className="bg-white rounded-sm"></div></div>,
    color: 'from-pink-500 to-pink-600'
  },
];

const SurvivalModeSelectionPopup: React.FC<SurvivalModeSelectionPopupProps> = ({
  availableModes,
  onSelectMode
}) => {
  const { motionOK, transition, spring } = useMotionPrefs();
  const { language } = useLanguage();
  const gameModeDetails = getGameModeDetails();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div
        className={cn(
          "bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 p-6 max-w-lg w-full shadow-2xl flex flex-col items-center",
          language === 'he' ? 'text-right' : 'text-left'
        )}
        initial={motionOK ? { opacity: 0, y: 16, scale: 0.98 } : { opacity: 1 }}
        animate={motionOK ? { opacity: 1, y: 0, scale: 1, transition } : { opacity: 1 }}
        exit={motionOK ? { opacity: 0, y: -8, transition } : { opacity: 0 }}
        transition={spring as any}
      >
        <h2 className={cn(
          "text-2xl md:text-3xl font-bold text-white mb-2 text-center",
          language === 'he' ? "font-['Abraham']" : ""
        )}>
          {t('survival.mode.selection.title')}
        </h2>
        <p className={cn(
          "text-white/70 text-center mb-6",
          language === 'he' ? "font-['Abraham']" : ""
        )}>
          {t('survival.mode.selection.subtitle')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-4">
          {gameModeDetails
            .filter(mode => availableModes.includes(mode.id))
            .map((mode, idx) => (
              <motion.div
                key={mode.id}
                initial={motionOK ? { opacity: 0, y: 6 } : { opacity: 1 }}
                animate={motionOK ? { opacity: 1, y: 0, transition } : { opacity: 1 }}
                transition={{ ...(spring as any), delay: motionOK ? idx * 0.03 : 0 }}
                whileHover={motionOK ? { scale: 1.02 } : undefined}
              >
                <Button
                  onClick={() => onSelectMode(mode.id)}
                  className={cn(
                    "h-auto py-4 flex flex-col items-center justify-center text-white font-bold",
                    "bg-gradient-to-r",
                    mode.color,
                    "hover:opacity-90 transition-all w-full",
                    language === 'he' ? "font-['Abraham']" : ""
                  )}
                >
                  <div className="flex items-center justify-center h-12 w-12 bg-white/20 rounded-full mb-2">
                    {mode.icon}
                  </div>
                  <span className="text-lg">{t(mode.labelKey)}</span>
                  <span className={cn(
                    "text-xs text-white/80 font-normal mt-1 text-center leading-tight px-2",
                    language === 'he' ? "font-['Abraham']" : ""
                  )}>
                    {t(mode.descriptionKey)}
                  </span>
                </Button>
              </motion.div>
            ))}
        </div>
        
        {/* Description of how to play */}
        <div className="bg-black/30 rounded-lg p-3 w-full">
          <p className={cn(
            "text-white/90 text-sm leading-relaxed",
            language === 'he' ? "font-['Abraham'] text-right" : "text-left"
          )}>
            {t('survival.mode.selection.help')}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SurvivalModeSelectionPopup;
