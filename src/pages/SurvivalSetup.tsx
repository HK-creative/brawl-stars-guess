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
  
  // Add CSS animations for border glow for each mode
  React.useEffect(() => {
    if (!document.getElementById('borderGlowAnimations')) {
      const style = document.createElement('style');
      style.id = 'borderGlowAnimations';
      style.textContent = `
        @keyframes borderGlow-gadget {
          0% { box-shadow: 0 0 12px #9C3EF466, 0 0 25px #9C3EF433, inset 0 0 8px #9C3EF422; }
          100% { box-shadow: 0 0 20px #9C3EF488, 0 0 40px #9C3EF455, inset 0 0 15px #9C3EF433; }
        }
        @keyframes borderGlow-starpower {
          0% { box-shadow: 0 0 12px #00CFFF66, 0 0 25px #00CFFF33, inset 0 0 8px #00CFFF22; }
          100% { box-shadow: 0 0 20px #00CFFF88, 0 0 40px #00CFFF55, inset 0 0 15px #00CFFF33; }
        }
        @keyframes borderGlow-classic {
          0% { box-shadow: 0 0 12px #82D72466, 0 0 25px #82D72433, inset 0 0 8px #82D72422; }
          100% { box-shadow: 0 0 20px #82D72488, 0 0 40px #82D72455, inset 0 0 15px #82D72433; }
        }
        @keyframes borderGlow-pixels {
          0% { box-shadow: 0 0 12px #F9831E66, 0 0 25px #F9831E33, inset 0 0 8px #F9831E22; }
          100% { box-shadow: 0 0 20px #F9831E88, 0 0 40px #F9831E55, inset 0 0 15px #F9831E33; }
        }
        @keyframes borderGlow-audio {
          0% { box-shadow: 0 0 12px #8EA0E166, 0 0 25px #8EA0E133, inset 0 0 8px #8EA0E122; }
          100% { box-shadow: 0 0 20px #8EA0E188, 0 0 40px #8EA0E155, inset 0 0 15px #8EA0E133; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  // Get unique colors for each game mode
  const getGameModeColors = (modeId: string) => {
    const colorMap = {
      'gadget': { 
        main: '#9C3EF4', 
        gradient: 'from-purple-500/70 via-violet-500/60 to-purple-600/70', // Less transparent
        border: 'border-purple-500', // Match gradient colors
        glow: 'shadow-lg shadow-purple-500/30' // Stronger glow
      },
      'starpower': { 
        main: '#00CFFF', 
        gradient: 'from-cyan-400/70 via-blue-400/60 to-cyan-500/70', 
        border: 'border-cyan-400', 
        glow: 'shadow-lg shadow-cyan-400/30' 
      },
      'classic': { 
        main: '#82D724', 
        gradient: 'from-green-400/70 via-lime-400/60 to-green-500/70', 
        border: 'border-green-400', 
        glow: 'shadow-lg shadow-green-400/30' 
      },
      'pixels': { 
        main: '#F9831E', 
        gradient: 'from-orange-400/70 via-amber-400/60 to-orange-500/70', 
        border: 'border-orange-400', 
        glow: 'shadow-lg shadow-orange-400/30' 
      },
      'audio': { 
        main: '#8EA0E1', 
        gradient: 'from-blue-300/70 via-indigo-300/60 to-blue-400/70', 
        border: 'border-blue-300', 
        glow: 'shadow-lg shadow-blue-300/30' 
      }
    };
    return colorMap[modeId as keyof typeof colorMap] || colorMap['classic'];
  };
  
  const modeColors = getGameModeColors(mode.id);
  
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative transition-all duration-500 transform", // Removed overflow-hidden
        "w-full group",
        "hover:shadow-2xl shadow-black/20"
      )}
      style={{
        transform: 'skewX(-8deg)',
        transformOrigin: 'center',
        height: 'clamp(80px, 12vh, 128px)' // Responsive height that scales with viewport
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'skewX(-8deg) scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'skewX(-8deg) scale(1)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'skewX(-8deg) scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'skewX(-8deg) scale(1.02)';
      }}
    >
      {/* Card Background with Integrated Text Area */}
      <div className={cn(
        "absolute inset-0 transition-all duration-500",
        "border-2" // Always have border
      )}
      style={{
        borderColor: modeColors.main, // Always use the mode's main color
        boxShadow: `0 0 8px ${modeColors.main}88, 0 0 16px ${modeColors.main}44`, // Always visible glow
        animation: isSelected ? `borderGlow-${mode.id} 2s ease-in-out infinite alternate` : undefined,
        overflow: 'visible' // Don't clip the checkmark
      }}>
        {/* Main card background */}
        <div className={cn(
          "absolute inset-0 transition-all duration-500",
          isSelected 
            ? `bg-gradient-to-br ${modeColors.gradient}` // Unique gradient when selected
            : "bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-md"
        )} />
        
        {/* Integrated dark text area at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm transition-all duration-500"
             style={{ height: 'clamp(24px, 4vh, 32px)' }} />
        
        {/* Content Container */}
        <div 
          className="relative z-10 flex flex-col items-center justify-between h-full p-4"
          style={{
            transform: 'skewX(8deg)', // Counter-skew to keep content upright
            transformOrigin: 'center'
          }}
        >
          {/* Responsive Icon - Centered in middle of card */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isSelected ? "text-cyan-100" : "text-white/90 group-hover:text-white"
          )}
               style={{ 
                 paddingBottom: 'clamp(24px, 4vh, 32px)' // Account for text area height
               }}>
            <div 
              className="flex items-center justify-center"
              style={{
                width: 'clamp(40px, 6.5vh, 80px)', // Bigger and more responsive scaling
                height: 'clamp(40px, 6.5vh, 80px)', // Scales with card size
                fontSize: 'clamp(20px, 4vh, 40px)' // Make icon content scale too
              }}
            >
              {mode.icon}
            </div>
          </div>
          
          {/* Text Label in integrated dark area - perfectly centered */}
          <div className="w-full flex items-center justify-center absolute bottom-0 z-30"
               style={{ height: 'clamp(24px, 4vh, 32px)' }}>
            <span 
              className={cn(
                "font-bold uppercase tracking-wider text-center leading-none transition-all duration-300 whitespace-nowrap relative z-30",
                language === 'he' ? "font-normal" : "",
                "text-white" // Always white text, unaffected by card colors
              )}
              style={{
                fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                fontSize: mode.label === 'STAR POWER' 
                  ? 'clamp(8px, 1.8vh, 14px)' // Smaller on small screens, fits in 90% width
                  : language === 'he' 
                    ? 'clamp(12px, 2.8vh, 22px)' // Bigger size for Hebrew text
                    : 'clamp(12px, 2.5vh, 20px)', // Bigger responsive size for English
                maxWidth: mode.label === 'STAR POWER' ? '90%' : '100%', // Constraint for Star Power
                textShadow: language === 'he' 
                  ? '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.6), 0px 0px 8px rgba(0,0,0,0.3)'
                  : '2px 2px 4px rgba(0,0,0,0.7)'
              }}
            >
              {mode.label}
            </span>
          </div>
        </div>
        
      {/* Selection indicator - checkmark FULLY ON TOP and NEVER cut off */}
      {isSelected && (
        <div 
          className="fixed z-[9999] w-24 h-24 flex items-center justify-center pointer-events-none"
          style={{ 
            top: `${-12}px`, // Position relative to card
            right: `${-12}px`,
            transform: 'translate(0, 0)', // Reset any inherited transforms
            position: 'absolute' // Use absolute but ensure it's outside all containers
          }}>
          <img
            src="/Survival Pre-Game Screen/Checkmark-BS.svg"
            alt="Selected"
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{ 
              filter: 'drop-shadow(0 4px 8px rgba(24, 254, 16, 0.8)) drop-shadow(0 0 16px rgba(24, 254, 16, 0.6))',
              maxWidth: 'none',
              maxHeight: 'none'
            }}
          />
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
      
      {/* Content */}
      <div className="px-4 flex flex-col overflow-x-hidden relative z-10" style={{ minHeight: '100%', maxHeight: '100%', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        
        {/* Top header bar - Back button and title at same Y-axis */}
        <div className="flex items-center justify-between w-full px-4" 
             style={{
               paddingTop: 'clamp(8px, 2vh, 16px)',
               paddingBottom: 'clamp(4px, 1vh, 8px)',
               paddingLeft: 'max(20px, env(safe-area-inset-left, 20px))',
               paddingRight: 'max(20px, env(safe-area-inset-right, 20px))'
             }}>
          {/* Back Button - Left side */}
          <button
            onClick={() => navigate('/')}
            className="transition-all duration-200 transform hover:scale-110 active:scale-95"
            aria-label="Go back to home"
            style={{
              width: 'clamp(40px, 8vw, 50px)',
              height: 'clamp(35px, 7vw, 44px)',
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'inline-block',
              lineHeight: 0,
              marginTop: language === 'he' 
                ? 'clamp(-15px, -3vh, -5px)' // Hebrew: higher position
                : 'clamp(-10px, -2vh, 0px)' // English: original position
            }}
          >
            <img
              src="/Survival Pre-Game Screen/Back Button.svg"
              alt="Back"
              className="w-full h-full object-contain"
              style={{
                transform: language === 'he' ? 'rotate(180deg)' : 'none' // Hebrew: rotate 180 degrees
              }}
            />
          </button>
          
          {/* Title and Subtitle - Center */}
          <div className="flex-1 text-center" style={{ marginTop: '12px' }}>
            <h1 className={cn(
              "text-white font-black tracking-wide mb-3 sm:mb-4 lg:mb-6", // Increased spacing between title and subtitle
              language === 'en' ? "text-3xl sm:text-4xl lg:text-5xl" : "text-4xl sm:text-5xl lg:text-6xl" // REVERTED: Back to original breakpoint classes
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
            {/* English Subtitle */}
            {language === 'en' && (
              <h2 className="text-yellow-100 font-bold tracking-wide text-xs sm:text-sm lg:text-base"
                  style={{
                    fontFamily: "'Lilita One', cursive",
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                  }}>
                CHOOSE GAME MODES
              </h2>
            )}
            
            {/* Hebrew Subtitle - Recreated from scratch with tiny size */}
            {language === 'he' && (
              <div style={{ 
                fontSize: '5vw',
                fontFamily: "'Abraham', sans-serif",
                color: '#fef3c7', // text-yellow-100
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.6), 0px 0px 8px rgba(0,0,0,0.3)'
              }}>
                בחר סוגי משחק
              </div>
            )}
          </div>
          
          {/* Spacer to balance the layout */}
          <div style={{ width: 'clamp(40px, 8vw, 50px)', height: 'clamp(35px, 7vw, 44px)' }}></div>
        </div>

        {/* Main content area - Fully responsive without scrolling */}
        <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4 flex-1"
             style={{
               paddingLeft: 'max(20px, env(safe-area-inset-left, 20px))',
               paddingRight: 'max(20px, env(safe-area-inset-right, 20px))',
               justifyContent: 'space-between',
               height: 'calc(100dvh - clamp(80px, 15vh, 120px))', // Account for header height
               overflow: 'hidden'
             }}>
          
          {/* Game Mode Cards Section - Fully responsive grid */}
          <section className="flex flex-col w-full" aria-label="Game mode selection" style={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Top row - 2 cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-5 lg:mb-6 w-full">
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-5 lg:mb-6 w-full">
              {gameModeDetails.slice(2, 4).map(mode => (
                <GameModeCard 
                  key={mode.id}
                  mode={mode}
                  isSelected={localSettings.modes.includes(mode.id)}
                  onToggle={() => handleModeToggle(mode.id)}
                />
              ))}
            </div>
            
            {/* Bottom centered card - Pixels (properly centered) */}
            <div className="flex justify-center w-full">
              <div style={{ width: 'calc(50% - 6px)' }}> {/* Match the width of grid items */}
                <GameModeCard 
                  mode={gameModeDetails[4]} // Pixels mode
                  isSelected={localSettings.modes.includes(gameModeDetails[4].id)}
                  onToggle={() => handleModeToggle(gameModeDetails[4].id)}
                />
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="flex justify-center w-full mt-4 sm:mt-6 lg:mt-8" aria-label="Start game">
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
                className="h-auto"
                style={{ 
                  width: 'clamp(150px, 28vw, 180px)', // Even smaller on PC: max 180px, 28vw instead of 30vw
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
