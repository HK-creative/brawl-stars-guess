import React, { useState, useEffect } from 'react';
import { useSurvivalStore, defaultSurvivalSettings, GameMode, SurvivalSettings } from '@/stores/useSurvivalStore';
import { Button } from '@/components/ui/button';
import PrimaryButton from '@/components/ui/primary-button';
import { toast } from 'sonner';
import { resetModeSelectionState } from '@/lib/survival-logic';
import { Timer } from 'lucide-react';
import { t } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

// Game mode images mapping
const gameModeImages = {
  classic: '/ClassicIcon.png',
  gadget: '/GadgetIcon.png',
  starpower: '/StarpowerIcon.png',
  audio: '/AudioIcon.png',
  pixels: '/PixelsIcon.png'
} as const;

// Function to get GameMode details with translations
const getGameModeDetails = (): { id: GameMode; label: string; image: string; color: string }[] => [
  { 
    id: 'classic', 
    label: t('survival.classic.label'),
    image: gameModeImages.classic,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'gadget', 
    label: t('survival.gadget.label'),
    image: gameModeImages.gadget,
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'starpower', 
    label: t('survival.starpower.label'),
    image: gameModeImages.starpower,
    color: 'from-yellow-500 to-yellow-600'
  },
  { 
    id: 'audio', 
    label: t('survival.audio.label'),
    image: gameModeImages.audio,
    color: 'from-purple-500 to-purple-600'
  },
  { 
    id: 'pixels', 
    label: t('survival.pixels.label'),
    image: gameModeImages.pixels,
    color: 'from-indigo-500 to-indigo-600'
  },
];

const SETTINGS_STORAGE_KEY = 'survival_last_settings';

// Helper function to get saved settings from localStorage
const getSavedSettings = (): SurvivalSettings | null => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading saved survival settings:', error);
  }
  return null;
};

// Helper function to save settings to localStorage
const saveSettings = (settings: SurvivalSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving survival settings:', error);
  }
};

interface SurvivalSetupPopupProps {
  onStart: (settings: SurvivalSettings) => void;
  onCancel: () => void;
}

const SurvivalSetupPopup: React.FC<SurvivalSetupPopupProps> = ({ onStart, onCancel }) => {
  const { motionOK, transition, spring } = useMotionPrefs();
  const initializeGame = useSurvivalStore((state) => state.initializeGame);
  const storeSettings = useSurvivalStore((state) => state.settings);
  
  // Get translated game mode details
  const gameModeDetails = getGameModeDetails();
  
  // Initialize settings with fixed values for timer and rotation
  const [localSettings, setLocalSettings] = useState<SurvivalSettings>(() => {
    // If active game exists in store, use those settings
    if (storeSettings && 
        useSurvivalStore.getState().gameStatus !== 'gameover' && 
        useSurvivalStore.getState().gameStatus !== 'setup') {
      return {
        ...storeSettings,
        timer: 150,  // Fixed timer value
        rotation: 'repeat'  // Fixed rotation value
      };
    }
    
    // Otherwise try to get saved settings from localStorage
    const savedSettings = getSavedSettings();
    if (savedSettings) {
      return {
        ...savedSettings,
        timer: 150,  // Fixed timer value
        rotation: 'repeat'  // Fixed rotation value
      };
    }
    
    // Fall back to defaults with our fixed values
    return {
      ...defaultSurvivalSettings,
      timer: 150,
      rotation: 'repeat'
    };
  });
  
  // Validation state
  const [isValidationPassed, setIsValidationPassed] = useState(false);
  
  // Check if settings are valid
  useEffect(() => {
    setIsValidationPassed(localSettings.modes.length > 0);
  }, [localSettings.modes]);
  
  // Toggle mode selection
  const toggleMode = (mode: GameMode) => {
    setLocalSettings(current => {
      const isModeSelected = current.modes.includes(mode);
      
      if (isModeSelected) {
        // Remove mode if it's already selected
        return {
          ...current,
          modes: current.modes.filter(m => m !== mode)
        };
      } else {
        // Add mode if not already selected
        return {
          ...current,
          modes: [...current.modes, mode]
        };
      }
    });
  };
  
  // Handle starting the game
  const handleStartGame = () => {
    if (!isValidationPassed) {
      toast(t('survival.select.required'));
      return;
    }
    
    // Save settings to localStorage for next time
    saveSettings(localSettings);
    
    // Initialize game and navigate to play
    initializeGame(localSettings);
    resetModeSelectionState();
    
    // Call onStart callback
    onStart(localSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div
        className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-amber-400/20 max-w-md w-full shadow-2xl flex flex-col overflow-hidden"
        initial={motionOK ? { opacity: 0, y: 16, scale: 0.98 } : { opacity: 1 }}
        animate={motionOK ? { opacity: 1, y: 0, scale: 1, transition } : { opacity: 1 }}
        exit={motionOK ? { opacity: 0, y: -8, transition } : { opacity: 0 }}
        transition={spring as any}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-400/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Header with gradient border */}
        <div className="relative px-6 py-5 border-b border-amber-400/10 bg-gradient-to-r from-amber-500/5 to-pink-500/5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAxKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]">
          </div>
          <h1 className="relative text-3xl font-black text-center bg-gradient-to-r from-amber-300 to-pink-300 text-transparent bg-clip-text font-brawl">
            {t('survival.mode.title')}
          </h1>
          <p className="relative text-center text-amber-100/80 text-sm mt-2 font-medium">
            {t('survival.select.challenge.modes')}
          </p>
        </div>
        
        {/* Content */}
        <div className="relative p-6">
          <div className="grid grid-cols-2 gap-4">
            {gameModeDetails.map(mode => (
              <button
                key={mode.id}
                onClick={() => toggleMode(mode.id)}
                className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 group
                  ${localSettings.modes.includes(mode.id) 
                    ? 'bg-gradient-to-br from-amber-500/10 to-pink-500/10 border-2 border-amber-400/30 scale-[1.02]' 
                    : 'bg-slate-800/50 border border-slate-700/50 hover:border-amber-400/20 hover:scale-[1.02]'}
                  hover:shadow-lg hover:shadow-amber-400/10`}
              >
                {/* Selection indicator removed */}
                
                <div className={`flex flex-col items-center transition-all duration-300 ${
                  localSettings.modes.includes(mode.id) 
                    ? 'opacity-100' 
                    : 'opacity-80 group-hover:opacity-100'
                }`}>
                  <div className={`relative flex items-center justify-center mb-3 transition-all duration-300 ${
                    localSettings.modes.includes(mode.id) 
                      ? 'transform scale-110' 
                      : 'group-hover:scale-105'
                  }`}>
                    <img 
                      src={mode.image} 
                      alt={`${mode.label} icon`} 
                      className={`w-16 h-16 object-contain transition-all duration-300 ${
                        localSettings.modes.includes(mode.id) 
                          ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]' 
                          : 'drop-shadow-[0_0_8px_rgba(251,191,36,0.2)] group-hover:drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                      }`}
                    />
                    {localSettings.modes.includes(mode.id) && (
                      <div className="absolute inset-0 rounded-full border-2 border-amber-300/50 animate-ping-slow"></div>
                    )}
                  </div>
                  <span className={`text-sm font-bold tracking-wide transition-all duration-300 ${
                    localSettings.modes.includes(mode.id) ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {mode.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Timer and How to Play */}
          <div className="mt-4 py-3 px-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 animate-ping"></div>
                <Timer className="h-4 w-4 text-amber-300" />
              </div>
              <span className="text-xs font-medium text-amber-200">{t('time.per.round.seconds')}</span>
            </div>
            
            {/* Mode Description */}
            <div className="text-center text-amber-200/80 text-sm font-medium">
              <p>{t('survival.how.many')}</p>
              
            </div>
          </div>
        </div>
        
        {/* Footer with buttons */}
        <div className="relative p-5 pt-0 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors px-6 py-2 rounded-lg font-medium"
          >
            {t('button.cancel')}
          </Button>
          <PrimaryButton 
            onClick={handleStartGame}
            disabled={!isValidationPassed}
            className="px-8 py-2 rounded-lg font-bold"
          >
            {isValidationPassed ? t('button.start.game') : t('survival.select.required')}
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
};

export default SurvivalSetupPopup;
