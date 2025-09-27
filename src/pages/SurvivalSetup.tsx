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

// GameModeCard component for the new design
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
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative overflow-hidden rounded-lg transition-all duration-200 h-20 sm:h-24",
        "border-2",
        isSelected 
          ? "border-yellow-400 shadow-lg shadow-yellow-400/30 scale-105" 
          : "border-yellow-500 hover:border-yellow-400 hover:scale-102"
      )}
    >
      {/* Dark top section - larger portion */}
      <div className="h-2/3 bg-black flex items-center justify-center">
        <div className="text-white text-lg sm:text-xl">
          {mode.icon}
        </div>
      </div>
      
      {/* Golden bottom section - smaller portion */}
      <div className="h-1/3 bg-gradient-to-r from-yellow-600 to-amber-600 flex items-center justify-center">
        <span className="text-white font-bold text-xs sm:text-sm tracking-wider">
          {mode.label.toUpperCase()}
        </span>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-300 rounded-full border border-yellow-600 shadow-sm" />
      )}
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
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
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
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
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
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
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
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
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
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
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
      <div className="relative z-10 min-h-screen flex flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          {/* Custom SVG Back button */}
          <button
            onClick={() => navigate('/')}
            className="transition-all duration-200 transform hover:scale-110 active:scale-95 mr-4"
            aria-label="Go back to home"
          >
            <img
              src="/Survival Pre-Game Screen/Back Button.svg"
              alt="Back"
              className="w-10 h-10 sm:w-12 sm:h-12"
              style={{ pointerEvents: 'none' }}
            />
          </button>
          
          {/* Title */}
          <div className="flex-1">
            <h1 className="text-white text-4xl sm:text-5xl font-black tracking-wide" 
                style={{ 
                  fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                  fontStyle: 'italic',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.7), 1px 1px 2px rgba(0,0,0,0.5)'
                }}>
              SURVIVAL
            </h1>
            <h2 className="text-yellow-100 text-base sm:text-lg font-bold mt-1 tracking-wide"
                style={{
                  fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                }}>
              CHOOSE GAME MODES
            </h2>
          </div>
        </div>

        {/* Game Mode Cards */}
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-4">
          {/* Top row - 2 cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {gameModeDetails.slice(0, 2).map(mode => (
              <GameModeCard 
                key={mode.id}
                mode={mode}
                isSelected={localSettings.modes.includes(mode.id)}
                onToggle={() => handleModeToggle(mode.id)}
              />
            ))}
          </div>
          
          {/* Bottom row - 2 cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {gameModeDetails.slice(2, 4).map(mode => (
              <GameModeCard 
                key={mode.id}
                mode={mode}
                isSelected={localSettings.modes.includes(mode.id)}
                onToggle={() => handleModeToggle(mode.id)}
              />
            ))}
          </div>
          
          {/* Centered Pixels card */}
          <div className="flex justify-center mb-8">
            <div className="w-40">
              <GameModeCard 
                mode={gameModeDetails[4]} // Pixels mode
                isSelected={localSettings.modes.includes(gameModeDetails[4].id)}
                onToggle={() => handleModeToggle(gameModeDetails[4].id)}
              />
            </div>
          </div>
        </div>

        {/* Bottom section - SVG Start Button */}
        <div className="flex justify-center px-4">
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
            {/* SVG Button with language switching */}
            <img
              src={language === 'en' 
                ? '/Survival Pre-Game Screen/Pre-survival Start Button English.svg'
                : '/Survival Pre-Game Screen/Pre-survival Start Button Hebrew.svg'
              }
              alt={language === 'en' ? 'Play - 150 seconds per round' : 'שחק - 150 שניות לסיבוב'}
              className="w-full max-w-xs sm:max-w-sm h-auto"
              style={{ 
                filter: !isValidationPassed ? 'grayscale(0.3) brightness(0.7)' : 'none',
                pointerEvents: 'none' // Prevent image from interfering with button clicks
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurvivalSetupPage;
