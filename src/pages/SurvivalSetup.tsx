import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvivalStore, defaultSurvivalSettings, GameMode, SurvivalSettings } from '@/stores/useSurvivalStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { resetModeSelectionState } from '@/lib/survival-logic';
// No longer need lucide-react imports - using custom SVGs
import { t } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import StarField from '@/components/StarField';

const SETTINGS_STORAGE_KEY = 'survival_last_settings';

// Completely redesigned GameModeCard component - Modern glassmorphism style
interface GameModeCardProps {
  mode: {
    id: GameMode;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ mode, isSelected, onToggle }) => {
  const { language } = useLanguage();
  
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative overflow-hidden rounded-3xl transition-all duration-500 transform",
        "h-36 sm:h-40 lg:h-36 w-full group",
        "hover:scale-[1.02] active:scale-98",
        "hover:shadow-2xl shadow-black/20"
      )}
    >
      {/* Card Background - Outline when off, Fill when on */}
      <div className={cn(
        "absolute inset-0 rounded-3xl transition-all duration-500",
        isSelected 
          ? "bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-purple-500/40 border-2 border-cyan-400"
          : "bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-md border-2 border-cyan-400/60 group-hover:border-cyan-400/80"
      )}>
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
          {/* Extra Large Icon - No background */}
          <div className={cn(
            "mb-4 transition-all duration-300",
            isSelected ? "text-cyan-100" : "text-white/90 group-hover:text-white"
          )}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-16 lg:h-16 flex items-center justify-center">
              {mode.icon}
            </div>
          </div>
          
          {/* Extra Large Text Label - No background */}
          <span 
            className={cn(
              "text-lg sm:text-xl lg:text-lg font-bold uppercase tracking-wider text-center leading-none transition-all duration-300",
              language === 'he' ? "font-normal" : "",
              isSelected ? "text-cyan-100" : "text-white/90 group-hover:text-white"
            )}
            style={{
              fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
              textShadow: language === 'he' 
                ? '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.6), 0px 0px 8px rgba(0,0,0,0.3)'
                : '2px 2px 4px rgba(0,0,0,0.7)'
            }}
          >
            {mode.label}
          </span>
        </div>
        
        {/* Selection indicator - glowing dot */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50">
            <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75" />
          </div>
        )}
        
        {/* Subtle shimmer effect on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
          "bg-gradient-to-r from-transparent via-white/5 to-transparent",
          "translate-x-[-100%] group-hover:translate-x-[100%] duration-1000"
        )} />
      </div>
    </button>
  );
};

// Helper functions for localStorage
const saveSettingsToStorage = (settings: SurvivalSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving survival settings:', error);
  }
};

const loadSettingsFromStorage = (): SurvivalSettings | null => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading saved survival settings:', error);
    return null;
  }
};

const SurvivalSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const initializeGame = useSurvivalStore((state) => state.initializeGame);
  const storeSettings = useSurvivalStore((state) => state.settings);
  
  // Use the LanguageContext instead of manual tracking
  const { language } = useLanguage();
  
  // Force update of translations by recreating the array when language changes
  const gameModeDetails = React.useMemo(() => [
    { 
      id: 'starpower' as GameMode, 
      label: t('survival.starpower.label'), 
      description: t('survival.starpower.description'), 
      icon: (
        <img 
          src="/StarpowerIcon.png" 
          alt="Star Power" 
          className="w-full h-full object-contain"
        />
      ),
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'gadget' as GameMode, 
      label: t('survival.gadget.label'), 
      description: t('survival.gadget.description'), 
      icon: (
        <img 
          src="/GadgetIcon.png" 
          alt="Gadget" 
          className="w-full h-full object-contain"
        />
      ),
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'audio' as GameMode, 
      label: t('survival.audio.label'), 
      description: t('survival.audio.description'), 
      icon: (
        <img 
          src="/AudioIcon.png" 
          alt="Audio" 
          className="w-full h-full object-contain"
        />
      ),
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'classic' as GameMode, 
      label: t('survival.classic.label'), 
      description: t('survival.classic.description'), 
      icon: (
        <img 
          src="/ClassicIcon.png" 
          alt="Classic" 
          className="w-full h-full object-contain"
        />
      ),
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'pixels' as GameMode, 
      label: t('survival.pixels.label'), 
      description: t('survival.pixels.description'), 
      icon: (
        <img 
          src="/PixelsIcon.png" 
          alt="Pixels" 
          className="w-full h-full object-contain"
        />
      ),
      color: 'from-indigo-500 to-indigo-600'
    },
  ], [language]); // Re-create when language changes
  
  // Initialize settings with fixed values for timer and rotation
  const [localSettings, setLocalSettings] = useState<SurvivalSettings>(() => {
    const savedSettings = loadSettingsFromStorage();
    
    // Check if user was in the middle of a game
    if (savedSettings && 
        useSurvivalStore.getState().gameStatus !== 'gameover' && 
        useSurvivalStore.getState().gameStatus !== 'setup') {
      return {
        ...savedSettings,
        timer: 150,  // Fixed timer value
        rotation: 'repeat'  // Fixed rotation value
      };
    }
    
    return {
      modes: savedSettings?.modes || [],
      timer: 150,  // Fixed timer value
      rotation: 'repeat'  // Fixed rotation value
    };
  });
  
  const [isValidationPassed, setIsValidationPassed] = useState(false);

  // Initialize state
  useEffect(() => {
    const initSettings: SurvivalSettings = {
      modes: [],
      timer: 150,
      rotation: 'repeat' as const
    };
    setLocalSettings(initSettings);
  }, []);

  // Validation effect
  useEffect(() => {
    setIsValidationPassed(localSettings.modes.length > 0);
  }, [localSettings]);

  const handleModeToggle = (modeId: GameMode) => {
    setLocalSettings(prev => ({
      ...prev,
      modes: prev.modes.includes(modeId)
        ? prev.modes.filter(id => id !== modeId)
        : [...prev.modes, modeId]
    }));
  };

  const handleStartGame = async () => {
    if (!isValidationPassed) {
      toast.error(t('survival.select.required'));
      return;
    }
    
    // Save settings before starting
    saveSettingsToStorage(localSettings);
    
    // Initialize the game with the selected settings
    await initializeGame(localSettings);
    
    // Navigate to survival mode
    navigate('/survival/game');
  };

  return (
    <div 
      className="min-h-screen text-white flex flex-col relative home-background-overlay"
      style={{
        minHeight: '100dvh', // Dynamic viewport height for better mobile support
        maxHeight: '100dvh',
        overflow: 'auto'
      }}
    >
      {/* Starfield overlay above background, below UI */}
      <StarField shootingStars />
      
      {/* Content */}
      <div className="px-4 flex flex-col overflow-x-hidden relative z-10" style={{ minHeight: '100%', maxHeight: '100%', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        
        {/* Back button - positioned independently at original Y location */}
        <div className="pt-4 pb-2 flex-shrink-0 w-full relative"
            style={{
              paddingTop: 'max(16px, env(safe-area-inset-top, 16px))'
            }}>
          <button
            onClick={() => navigate('/')}
            className="absolute left-4 sm:left-32 lg:left-40 top-4 transition-all duration-200 transform hover:scale-110 active:scale-95"
            aria-label="Go back to home"
            style={{
              width: '50px',
              height: '44px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'inline-block',
              lineHeight: 0,
            }}
          >
            <img
              src="/Survival Pre-Game Screen/Back Button.svg"
              alt="Back"
              className="w-full h-full object-contain"
              style={{ pointerEvents: 'none' }}
            />
          </button>
        </div>
            
        {/* Brand block - Title and Subtitle with better spacing */}
        <div className="text-center mt-4 mb-6 flex-shrink-0">
          <div className="relative z-10 select-none block mx-auto">
            <h1 className={cn(
              "text-white text-5xl sm:text-7xl font-black tracking-wide mb-4",
              language === 'en' ? "lg:text-6xl" : "lg:text-8xl"
            )} 
                style={{ 
                  fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                  fontStyle: 'italic',
                  textShadow: language === 'he' 
                    ? '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.6), 0px 0px 8px rgba(0,0,0,0.3)'
                    : '3px 3px 6px rgba(0,0,0,0.7), 1px 1px 2px rgba(0,0,0,0.5)'
                }}>
              {language === 'he' ? 'הישרדות' : 'SURVIVAL'}
            </h1>
            <h2 className={cn(
              "text-yellow-100 font-bold tracking-wide",
              language === 'he' ? "text-[8px] sm:text-[10px]" : "text-base sm:text-lg"
            )}
                style={{
                  fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                  textShadow: language === 'he' 
                    ? '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.6), 0px 0px 8px rgba(0,0,0,0.3)'
                    : '2px 2px 4px rgba(0,0,0,0.7)',
                  fontSize: language === 'he' ? 'clamp(8px, 2vw, 10px)' : undefined // Force override CSS !important
                }}>
              {language === 'he' ? 'בחר סוגי משחק' : 'CHOOSE GAME MODES'}
            </h2>
          </div>
        </div>

        {/* Main content area - UX optimized spacing */}
        <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4 flex-1"
             style={{
               paddingLeft: 'max(20px, env(safe-area-inset-left, 20px))',
               paddingRight: 'max(20px, env(safe-area-inset-right, 20px))',
               justifyContent: 'flex-start',
               minHeight: 0
             }}>
          
          {/* Game Mode Cards Section - Redesigned Layout */}
          <section className="flex flex-col w-full mb-8" aria-label="Game mode selection">
            {/* Top row - 2 cards */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              {gameModeDetails.slice(0, 2).map(mode => (
                <GameModeCard 
                  key={mode.id}
                  mode={mode}
                  isSelected={localSettings.modes.includes(mode.id)}
                  onToggle={() => handleModeToggle(mode.id)}
                />
              ))}
            </div>
            
            {/* Middle row - 2 cards */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              {gameModeDetails.slice(2, 4).map(mode => (
                <GameModeCard 
                  key={mode.id}
                  mode={mode}
                  isSelected={localSettings.modes.includes(mode.id)}
                  onToggle={() => handleModeToggle(mode.id)}
                />
              ))}
            </div>
            
            {/* Bottom centered card - Pixels */}
            <div className="flex justify-center">
              <div className="w-40 sm:w-44">
                <GameModeCard 
                  mode={gameModeDetails[4]} // Pixels mode
                  isSelected={localSettings.modes.includes(gameModeDetails[4].id)}
                  onToggle={() => handleModeToggle(gameModeDetails[4].id)}
                />
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="flex justify-center w-full mt-2" aria-label="Start game">
            <button
              onClick={handleStartGame}
              disabled={!isValidationPassed}
              className={cn(
                "transition-all duration-200 transform",
                "hover:scale-105 active:scale-95",
                !isValidationPassed && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
              aria-label={language === 'en' ? 'Start Game' : 'התחל משחק'}
            >
              <img
                src={language === 'en' 
                  ? '/Survival Pre-Game Screen/Pre-survival Start Button English.svg'
                  : '/Survival Pre-Game Screen/Pre-survival Start Button Hebrew.svg'
                }
                alt={language === 'en' ? 'Play - 150 seconds per round' : 'שחק - 150 שניות לסיבוב'}
                className="w-full max-w-xs sm:max-w-md lg:max-w-xl h-auto"
                style={{ 
                  filter: !isValidationPassed ? 'grayscale(0.3) brightness(0.7)' : 'none',
                  pointerEvents: 'none'
                }}
              />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SurvivalSetupPage;
