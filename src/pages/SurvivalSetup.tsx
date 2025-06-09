import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvivalStore, defaultSurvivalSettings, GameMode, SurvivalSettings } from '@/stores/useSurvivalStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { resetModeSelectionState } from '@/lib/survival-logic';
import { Timer, Volume2, Image, Zap } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

const SETTINGS_STORAGE_KEY = 'survival_last_settings';

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
      id: 'classic' as GameMode, 
      label: t('survival.classic.label'), 
      description: t('survival.classic.description'), 
      icon: <Image className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'gadget' as GameMode, 
      label: t('survival.gadget.label'), 
      description: t('survival.gadget.description'), 
      icon: <Zap className="h-6 w-6" />,
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'starpower' as GameMode, 
      label: t('survival.starpower.label'), 
      description: t('survival.starpower.description'), 
      icon: <div className="h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-yellow-600 rounded-full"></div></div>,
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'audio' as GameMode, 
      label: t('survival.audio.label'), 
      description: t('survival.audio.description'), 
      icon: <Volume2 className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'pixels' as GameMode, 
      label: t('survival.pixels.label'), 
      description: t('survival.pixels.description'), 
      icon: <div className="h-5 w-5 bg-indigo-400 rounded-sm flex items-center justify-center"><div className="h-2 w-2 bg-indigo-600 rounded-sm"></div></div>,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black flex flex-col items-center justify-center p-4">
      <div className="bg-black/60 backdrop-blur-md rounded-xl overflow-hidden w-full max-w-lg border border-white/5 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-pink-600 py-3 px-4">
          <h1 className="text-xl text-white font-bold text-center">{t('survival.mode.title')}</h1>
        </div>
        
        {/* Subtitle */}
        <div className="px-4 pt-4 pb-2 text-center">
          <p className="text-white/70 text-sm">{t('survival.select.challenge.modes')}</p>
        </div>
        
        {/* Additional descriptions */}
        <div className="px-4 pb-2 text-center space-y-1">
          <p className="text-white/80 text-xs">{t('survival.how.many')}</p>
          
        </div>
        
        {/* Mode Selection */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {gameModeDetails.map(mode => (
              <button 
                key={mode.id}
                onClick={() => handleModeToggle(mode.id)}
                className={`relative rounded-lg border transition-all duration-200 ${
                  localSettings.modes.includes(mode.id) 
                             ? 'border-white/50 bg-white/10' 
                             : 'border-white/10 bg-black/40 hover:bg-black/30'}`}
              >
                <div className={`p-3 flex flex-col items-center text-center gap-2 ${
                  localSettings.modes.includes(mode.id) 
                    ? 'bg-gradient-to-br ' + mode.color + ' text-white'
                    : 'bg-black/40 text-white/60'}`}
                  >
                  <div className="text-lg">
                    {mode.icon}
                  </div>
                    <h3 className="font-medium text-white text-sm">{mode.label}</h3>
                </div>
              </button>
            ))}
          </div>
          
          {/* Timer info */}
          <div className="mt-5 py-3 border-t border-white/5 flex items-center justify-center gap-2 text-white/60">
            <Timer className="h-4 w-4" />
            <span className="text-xs">{t('time.per.round.seconds')}</span>
          </div>
        </div>
        
        {/* Footer with just the buttons */}
        <div className="p-4 flex justify-between border-t border-white/5">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white hover:bg-white/5"
            size="sm"
          >
            {t('button.cancel')}
          </Button>
          
          <Button 
            onClick={handleStartGame} 
            disabled={!isValidationPassed}
            size="sm"
            className={`${!isValidationPassed ? 'opacity-50' : ''} 
                      bg-gradient-to-r from-amber-600 to-pink-600 hover:from-amber-500 
                      hover:to-pink-500 text-white`}
          >
            {t('button.start.game')}
          </Button>
        </div>
      </div>
      
      {/* Minimal mode selection indicator */}
      {localSettings.modes.length > 0 && (
        <div className="mt-3 px-3 py-1 rounded-full bg-white/10 text-xs text-white/60">
          {localSettings.modes.length} {t('game.selected')}
        </div>
      )}
    </div>
  );
};

export default SurvivalSetupPage;
