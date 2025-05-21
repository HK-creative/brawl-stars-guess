import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvivalStore, defaultSurvivalSettings, GameMode, SurvivalSettings } from '@/stores/useSurvivalStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { resetModeSelectionState } from '@/lib/survival-logic';

// Define GameMode details for UI
const gameModeDetails: { id: GameMode; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic', description: 'Guess the Brawler from their image.' },
  { id: 'gadget', label: 'Gadget', description: 'Guess the Brawler from their Gadget icon.' },
  { id: 'starpower', label: 'Star Power', description: 'Guess the Brawler from their Star Power icon.' },
  { id: 'audio', label: 'Audio', description: 'Guess the Brawler from their voice line or attack sound.' },
];

const MAX_STEPS = 3;
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
  
  // First check for settings in store, then in localStorage, then use defaults
  const [localSettings, setLocalSettings] = useState<SurvivalSettings>(() => {
    // If active game or setup exists in store, use those settings
    if (storeSettings && useSurvivalStore.getState().gameStatus !== 'gameover' && useSurvivalStore.getState().gameStatus !== 'setup') {
      return storeSettings;
    }
    
    // Otherwise try to get saved settings from localStorage
    const savedSettings = getSavedSettings();
    if (savedSettings) {
      return savedSettings;
    }
    
    // Fall back to defaults
    return defaultSurvivalSettings;
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [enableTimer, setEnableTimer] = useState<boolean>(!!localSettings.timer && localSettings.timer > 0);
  const [isValidationPassed, setIsValidationPassed] = useState<boolean>(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings(localSettings);
  }, [localSettings]);

  useEffect(() => {
    // If timer is not enabled, ensure timer value is undefined in settings
    if (!enableTimer) {
      setLocalSettings(prev => ({ ...prev, timer: undefined }));
    }
  }, [enableTimer]);

  // Validate current step whenever settings change
  useEffect(() => {
    if (currentStep === MAX_STEPS) {
      setIsValidationPassed(validateStep(currentStep));
    }
  }, [localSettings, currentStep, enableTimer]);

  const handleSettingChange = <K extends keyof SurvivalSettings>(key: K, value: SurvivalSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (modeId: GameMode) => {
    setLocalSettings(prev => {
      const newModes = prev.modes.includes(modeId)
        ? prev.modes.filter(m => m !== modeId)
        : [...prev.modes, modeId];
      return { ...prev, modes: newModes };
    });
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) { // Hearts validation (implicitly valid by UI)
      return true;
    }
    if (step === 2) { // Modes validation
      if (localSettings.modes.length === 0) {
        return false;
      }
      return true;
    }
    if (step === 3) { // Rotation & Timer validation
      if (enableTimer && (!localSettings.timer || localSettings.timer <= 0)) {
        return false;
      }
      if (enableTimer && localSettings.timer && localSettings.timer > 300) { // Example max timer
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < MAX_STEPS) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      showStepValidationError(currentStep);
    }
  };

  const showStepValidationError = (step: number) => {
    if (step === 2 && localSettings.modes.length === 0) {
      toast.error('Please select at least one game mode.');
    }
    if (step === 3) {
      if (enableTimer && (!localSettings.timer || localSettings.timer <= 0)) {
        toast.error('Timer must be a positive number if enabled.');
      }
      if (enableTimer && localSettings.timer && localSettings.timer > 300) {
        toast.error('Timer cannot exceed 300 seconds.');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStartGame = () => {
    if (validateStep(MAX_STEPS)) {
      // Ensure timer value is correctly set based on enableTimer checkbox
      const finalSettings = { ...localSettings, timer: enableTimer ? localSettings.timer : undefined };
      resetModeSelectionState(); // Reset the mode selection cycle state
      initializeGame(finalSettings);
      saveSettings(finalSettings); // Save final settings to localStorage
      navigate('/survival/play');
    } else {
      showStepValidationError(currentStep);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Hearts
        return (
          <CardContent className="space-y-6">
            <div className="text-center">
              <CardTitle className="text-2xl">Choose Your Lifeline</CardTitle>
              <CardDescription>How many hearts will you start with?</CardDescription>
            </div>
            <RadioGroup
              value={String(localSettings.hearts)}
              onValueChange={(value) => handleSettingChange('hearts', parseInt(value, 10) as 1 | 2 | 3)}
              className="grid grid-cols-3 gap-4 pt-4"
            >
              {[1, 2, 3].map(h => (
                <Label 
                  key={h} 
                  htmlFor={`hearts-${h}`}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all
                              ${localSettings.hearts === h ? 'border-primary ring-2 ring-primary bg-primary/10' : 'border-muted hover:border-primary/70'}`}
                >
                  <RadioGroupItem value={String(h)} id={`hearts-${h}`} className="sr-only" />
                  <span className={`text-4xl font-bold ${localSettings.hearts === h ? 'text-primary' : 'text-foreground'}`}>{h}</span>
                  <span className={`mt-1 text-sm ${localSettings.hearts === h ? 'text-primary' : 'text-muted-foreground'}`}>Heart{h > 1 ? 's' : ''}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        );
      case 2: // Modes
        return (
          <CardContent className="space-y-6">
             <div className="text-center">
              <CardTitle className="text-2xl">Select Game Modes</CardTitle>
              <CardDescription>Choose which challenges to include. At least one is required.</CardDescription>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {gameModeDetails.map(mode => (
                <Label 
                  key={mode.id} 
                  htmlFor={`mode-${mode.id}`}
                  className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all 
                              ${localSettings.modes.includes(mode.id) ? 'border-primary ring-2 ring-primary bg-primary/10' : 'border-muted hover:border-primary/70'}`}
                >
                  <Checkbox 
                    id={`mode-${mode.id}`} 
                    checked={localSettings.modes.includes(mode.id)}
                    onCheckedChange={() => handleModeChange(mode.id)}
                    className="mr-3 mt-1 h-5 w-5"
                  />
                  <div className="flex-1">
                    <span className={`font-semibold ${localSettings.modes.includes(mode.id) ? 'text-primary' : 'text-foreground'}`}>{mode.label}</span>
                    <p className={`text-xs ${localSettings.modes.includes(mode.id) ? 'text-primary/80' : 'text-muted-foreground'}`}>{mode.description}</p>
                  </div>
                </Label>
              ))}
            </div>
          </CardContent>
        );
      case 3: // Rotation & Timer
        return (
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="text-left">
                <Label className="text-xl font-semibold">Mode Rotation</Label>
                <p className="text-sm text-muted-foreground">How should game modes change after each round?</p>
              </div>
              <RadioGroup
                value={localSettings.rotation}
                onValueChange={(value) => handleSettingChange('rotation', value as 'repeat' | 'cycle')}
                className="flex space-x-4 pt-2"
              >
                <Label htmlFor="rotation-cycle" className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center 
                                 ${localSettings.rotation === 'cycle' ? 'border-primary ring-2 ring-primary bg-primary/10' : 'border-muted hover:border-primary/70'}`}>
                  <RadioGroupItem value="cycle" id="rotation-cycle" className="sr-only" />
                  <span className="block font-medium">Cycle</span>
                  <span className="text-xs text-muted-foreground block">Rotate through selected modes.</span>
                </Label>
                <Label htmlFor="rotation-repeat" className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center 
                                 ${localSettings.rotation === 'repeat' ? 'border-primary ring-2 ring-primary bg-primary/10' : 'border-muted hover:border-primary/70'}`}>
                  <RadioGroupItem value="repeat" id="rotation-repeat" className="sr-only" />
                  <span className="block font-medium">Repeat</span>
                  <span className="text-xs text-muted-foreground block">Randomly pick from selected modes, can repeat.</span>
                </Label>
              </RadioGroup>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="text-left">
                <Label className="text-xl font-semibold">Optional Timer</Label>
                <p className="text-sm text-muted-foreground">Set a time limit for each guess.</p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox 
                  id="enable-timer" 
                  checked={enableTimer}
                  onCheckedChange={(checked) => setEnableTimer(checked as boolean)}
                />
                <Label htmlFor="enable-timer">Enable timer</Label>
              </div>
              {enableTimer && (
                <div className="flex items-center space-x-2 pt-2">
                  <Input 
                    id="timer-seconds"
                    type="number"
                    min="1"
                    max="300"
                    placeholder="Time in seconds"
                    value={localSettings.timer || ''}
                    onChange={(e) => handleSettingChange('timer', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-32"
                  />
                  <Label htmlFor="timer-seconds">seconds</Label>
                </div>
              )}
            </div>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl">Survival Mode Setup</CardTitle>
          <CardDescription>Configure your survival challenge</CardDescription>
        </CardHeader>
        
        {renderStepContent()}
        
        <CardFooter className="flex justify-between pt-6">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
          )}
          
          {currentStep < MAX_STEPS ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleStartGame} 
              disabled={!isValidationPassed}
              className={!isValidationPassed ? 'cursor-not-allowed opacity-70' : ''}
            >
              Start Game
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SurvivalSetupPage; 