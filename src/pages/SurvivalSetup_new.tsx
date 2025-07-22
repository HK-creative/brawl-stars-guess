import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvivalStore, defaultSurvivalSettings, GameMode, SurvivalSettings } from '@/stores/useSurvivalStore';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { resetModeSelectionState } from '@/lib/survival-logic';
import { Timer, Volume2, Image, Zap } from 'lucide-react';

// Define GameMode details for UI with icons
const gameModeDetails: { id: GameMode; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { 
    id: 'classic', 
    label: 'Classic', 
    description: 'Guess the Brawler from their image.', 
    icon: <Image className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'gadget', 
    label: 'Gadget', 
    description: 'Guess the Brawler from their Gadget icon.', 
    icon: <Zap className="h-6 w-6" />,
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'starpower', 
    label: 'Star Power', 
    description: 'Guess the Brawler from their Star Power icon.', 
    icon: <div className="h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-yellow-600 rounded-full"></div></div>,
    color: 'from-yellow-500 to-yellow-600'
  },
  { 
    id: 'audio', 
    label: 'Audio', 
    description: 'Guess the Brawler from their voice line or attack sound.', 
    icon: <Volume2 className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-600'
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

const SurvivalSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const initializeGame = useSurvivalStore((state) => state.initializeGame);
  const storeSettings = useSurvivalStore((state) => state.settings);
  
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
  const [isValidationPassed, setIsValidationPassed] = useState<boolean>(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings(localSettings);
  }, [localSettings]);

  // Validate whenever settings change - just check if any modes are selected
  useEffect(() => {
    setIsValidationPassed(localSettings.modes.length > 0);
  }, [localSettings.modes]);

  // Handler for toggling game modes
  const handleModeChange = (modeId: GameMode) => {
    const newModes = [...localSettings.modes];
    const index = newModes.indexOf(modeId);
    
    if (index === -1) {
      // Mode not selected, add it
      newModes.push(modeId);
    } else {
      // Mode already selected, remove it
      newModes.splice(index, 1);
    }
    
    setLocalSettings(prev => ({ ...prev, modes: newModes }));
  };

  // Start the game
  const handleStartGame = () => {
    if (localSettings.modes.length === 0) {
      toast.error('Please select at least one game mode.');
      return;
    }
    
    // Initialize the game with the current settings
    initializeGame(localSettings);
    resetModeSelectionState();
    navigate('/survival/play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4 sm:p-6">
      <Card className="border-0 shadow-xl w-full max-w-xl bg-black/40 backdrop-blur-md rounded-xl overflow-hidden border-t border-white/10">
        {/* Title banner with game-like styling */}
        <div className="bg-gradient-to-r from-amber-600 to-pink-600 py-4 px-6 relative">
          <CardTitle className="text-2xl sm:text-3xl text-white font-bold text-center drop-shadow-md">
            Survival Mode
          </CardTitle>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
        
        {/* Header with game info */}
        <CardHeader className="text-center">
          <CardDescription className="text-white/80 text-sm">
            Select the game modes you want to play in survival. 
            Each round has a fixed timer of 150 seconds, and modes will be randomly selected from your choices.
          </CardDescription>
        </CardHeader>
        
        {/* Game mode selection */}
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gameModeDetails.map(mode => (
              <div
                key={mode.id}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 
                           border-2 hover:border-white/40 ${localSettings.modes.includes(mode.id as GameMode) 
                             ? 'border-white/70 shadow-glow' 
                             : 'border-white/10'}`}
                onClick={() => handleModeChange(mode.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-${
                  localSettings.modes.includes(mode.id as GameMode) ? '70' : '20'
                } transition-opacity duration-300`}></div>
                
                <div className="relative p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-black/30 text-white ${
                    localSettings.modes.includes(mode.id as GameMode) ? 'bg-white/30' : ''
                  }`}>
                    {mode.icon}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-white">{mode.label}</h3>
                    <p className="text-xs text-white/70">{mode.description}</p>
                  </div>
                  
                  <div className="ml-auto">
                    <Checkbox 
                      checked={localSettings.modes.includes(mode.id as GameMode)} 
                      className="rounded-full data-[state=checked]:bg-white data-[state=checked]:text-black" 
                      onCheckedChange={() => handleModeChange(mode.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Timer info card */}
          <div className="mt-6 bg-gradient-to-r from-indigo-900/40 to-indigo-700/40 rounded-lg p-3 border border-indigo-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-full">
                <Timer className="h-5 w-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">{t('survival.fixed_timer')}</h3>
                <p className="text-xs text-white/70">{t('survival.same_time_limit')}</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Card Footer */}
        <CardFooter className="flex justify-between pt-6 pb-6 bg-black/30 border-t border-white/5">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-white/20 hover:bg-white/10 text-white"
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleStartGame} 
            disabled={!isValidationPassed}
            className={`${!isValidationPassed ? 'cursor-not-allowed opacity-70' : ''} 
                      bg-gradient-to-r from-amber-600 to-pink-600 hover:from-amber-500 
                      hover:to-pink-500 border-none text-white font-bold`}
          >
            Start Game
          </Button>
        </CardFooter>
      </Card>
      
      {/* Mode selection count */}
      <div className="mt-4 text-sm text-white/60">
        {localSettings.modes.length} mode{localSettings.modes.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
};

export default SurvivalSetupPage;
