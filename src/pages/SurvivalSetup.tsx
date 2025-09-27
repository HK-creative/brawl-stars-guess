import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvivalStore, defaultSurvivalSettings, GameMode, SurvivalSettings } from '@/stores/useSurvivalStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { resetModeSelectionState } from '@/lib/survival-logic';
import { Timer, ArrowLeft } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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
        <div className="relative">
          {/* Star icon for Star Power */}
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      ),
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'gadget' as GameMode, 
      label: t('survival.gadget.label'), 
      description: t('survival.gadget.description'), 
      icon: (
        <div className="relative">
          {/* Lightning bolt for Gadget */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
          </svg>
        </div>
      ),
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'audio' as GameMode, 
      label: t('survival.audio.label'), 
      description: t('survival.audio.description'), 
      icon: (
        <div className="relative">
          {/* Volume/Sound icon for Audio */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </div>
      ),
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'classic' as GameMode, 
      label: t('survival.classic.label'), 
      description: t('survival.classic.description'), 
      icon: (
        <div className="relative">
          {/* Circle/Portrait icon for Classic */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      ),
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'pixels' as GameMode, 
      label: t('survival.pixels.label'), 
      description: t('survival.pixels.description'), 
      icon: (
        <div className="relative">
          {/* Grid/Pixels icon */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
          </svg>
        </div>
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with diagonal stripes */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600">
        {/* Diagonal black stripes */}
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 25px,
            rgba(0, 0, 0, 0.35) 25px,
            rgba(0, 0, 0, 0.35) 50px
          )`
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg p-3 mr-4 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
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

        {/* Bottom section */}
        <div className="space-y-4">
          {/* Timer info */}
          <div className="flex items-center justify-center gap-2 text-white/90">
            <Timer className="h-5 w-5" />
            <span className="text-sm font-medium">150 seconds per round</span>
          </div>
          
          {/* Play button */}
          <div className="flex justify-center px-4">
            <button
              onClick={handleStartGame}
              disabled={!isValidationPassed}
              className={cn(
                "bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-black text-xl py-3 px-20 rounded-lg shadow-lg transition-all transform w-full max-w-xs",
                "hover:from-yellow-300 hover:to-yellow-500 hover:scale-105 active:scale-100",
                !isValidationPassed && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
              style={{
                fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)'
              }}
            >
              PLAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurvivalSetupPage;
