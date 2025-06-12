import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash, Flame, Home } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers, getBrawlerDisplayName } from '@/data/brawlers';
import { getPortrait } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import BrawlerGuessRow from '@/components/BrawlerGuessRow';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useStreak } from '@/contexts/StreakContext';

const DEFAULT_PORTRAIT = '/portraits/shelly.png';

const DailyClassicMode: React.FC = () => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { streak } = useStreak();

  const {
    classic,
    timeUntilNext,
    isLoading,
    initializeDailyModes,
    incrementGuessCount,
    completeMode,
    resetGuessCount,
    updateTimeUntilNext,
    saveGuess,
    getGuesses,
  } = useDailyStore();

  // Local game state
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<any>(null);
  const [guesses, setGuesses] = useState<any[]>([]);
  const [guessedBrawlerNames, setGuessedBrawlerNames] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [yesterdayData, setYesterdayData] = useState<string | null>(null);
  
  // New state for discovered attributes
  const [discoveredAttributes, setDiscoveredAttributes] = useState<{
    rarity?: string;
    class?: string;
    range?: string;
    wallbreak?: string;
    releaseYear?: number;
  }>({});

  // Initialize daily modes on component mount
  useEffect(() => {
    initializeDailyModes();
    
    // Update timer immediately and then every minute
    updateTimeUntilNext();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [initializeDailyModes]);

  // Load yesterday's challenge
  useEffect(() => {
    const loadYesterdayData = async () => {
      try {
        const yesterdayChallenge = await fetchYesterdayChallenge('classic');
        setYesterdayData(yesterdayChallenge);
      } catch (error) {
        console.error('Error loading yesterday data:', error);
      }
    };
    
    loadYesterdayData();
  }, []);

  // Load saved guesses when component mounts or classic data changes
  useEffect(() => {
    const savedGuesses = getGuesses('classic');
    setGuesses(savedGuesses);
    // Extract brawler names from saved guesses to prevent duplicates
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
    
    // Update discovered attributes based on saved guesses
    if (savedGuesses.length > 0) {
      const correctBrawler = brawlers.find(b => b.name.toLowerCase() === classic.brawlerName.toLowerCase()) || brawlers[0];
      const newDiscovered: typeof discoveredAttributes = {};
      
      savedGuesses.forEach(guess => {
        if (guess.rarity === correctBrawler.rarity && !newDiscovered.rarity) {
          newDiscovered.rarity = correctBrawler.rarity;
        }
        if (guess.class === correctBrawler.class && !newDiscovered.class) {
          newDiscovered.class = correctBrawler.class;
        }
        if (guess.range === correctBrawler.range && !newDiscovered.range) {
          newDiscovered.range = correctBrawler.range;
        }
        if (guess.wallbreak === correctBrawler.wallbreak && !newDiscovered.wallbreak) {
          newDiscovered.wallbreak = correctBrawler.wallbreak;
        }
        if (guess.releaseYear === correctBrawler.releaseYear && !newDiscovered.releaseYear) {
          newDiscovered.releaseYear = correctBrawler.releaseYear;
        }
      });
      
      setDiscoveredAttributes(newDiscovered);
    }
  }, [classic.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (classic.isCompleted) {
      setShowVictoryScreen(true);
      setIsGameOver(true);
    }
  }, [classic.isCompleted]);

  const getCorrectBrawler = () => {
    return brawlers.find(b => b.name.toLowerCase() === classic.brawlerName.toLowerCase()) || brawlers[0];
  };

  // Function to check and update discovered attributes
  const updateDiscoveredAttributes = useCallback((guessedBrawler: any) => {
    const correctBrawler = getCorrectBrawler();
    const newDiscovered = { ...discoveredAttributes };
    
    // Check each attribute
    if (guessedBrawler.rarity === correctBrawler.rarity && !newDiscovered.rarity) {
      newDiscovered.rarity = correctBrawler.rarity;
    }
    if (guessedBrawler.class === correctBrawler.class && !newDiscovered.class) {
      newDiscovered.class = correctBrawler.class;
    }
    if (guessedBrawler.range === correctBrawler.range && !newDiscovered.range) {
      newDiscovered.range = correctBrawler.range;
    }
    if (guessedBrawler.wallbreak === correctBrawler.wallbreak && !newDiscovered.wallbreak) {
      newDiscovered.wallbreak = correctBrawler.wallbreak;
    }
    if (guessedBrawler.releaseYear === correctBrawler.releaseYear && !newDiscovered.releaseYear) {
      newDiscovered.releaseYear = correctBrawler.releaseYear;
    }
    
    setDiscoveredAttributes(newDiscovered);
  }, [discoveredAttributes, getCorrectBrawler]);

  // Handle guess submission
  const handleSubmit = useCallback((brawler?: any) => {
    const brawlerToSubmit = brawler || selectedBrawler;
    
    if (!brawlerToSubmit || classic.isCompleted) return;

    // Increment guess count in store
    incrementGuessCount('classic');
    
    // Add guess to store and local state
    const newGuess = brawlerToSubmit;
    saveGuess('classic', newGuess);
    setGuesses(prev => [...prev, newGuess]);
    setGuessedBrawlerNames(prev => [...prev, brawlerToSubmit.name]);
    
    // Update discovered attributes
    updateDiscoveredAttributes(brawlerToSubmit);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = brawlerToSubmit.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('classic');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      
      const displayName = getBrawlerDisplayName(correctBrawler, currentLanguage);
      toast({
        title: "Congratulations! 🎉",
        description: `You found ${displayName}!`,
      });
    }
    
    // Reset input
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, classic.isCompleted, incrementGuessCount, saveGuess, getCorrectBrawler, completeMode]);

  // Handle brawler selection and immediate submission
  const handleSelectBrawler = useCallback((brawler: any) => {
    setSelectedBrawler(brawler);
    const displayName = getBrawlerDisplayName(brawler, currentLanguage);
    setInputValue(displayName);
    
    // Immediately submit the guess
    handleSubmit(brawler);
  }, [handleSubmit, currentLanguage]);

  // Handle next mode navigation
  const handleNextMode = () => {
    navigate('/daily/gadget');
  };

  // Handle play again
  const handlePlayAgain = () => {
    setGuesses([]);
    setGuessedBrawlerNames([]);
    setIsGameOver(false);
    setShowVictoryScreen(false);
    setShowConfetti(false);
    setInputValue('');
    setSelectedBrawler(null);
    resetGuessCount('classic');
  };

  const formatTime = (time: { hours: number; minutes: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:00`;
  };

  // Mode navigation data
  const modes = [
    { 
      key: 'classic', 
      name: 'Classic', 
      path: '/daily/classic',
      icon: '/ClassicIcon.png',
      color: 'from-amber-800 to-yellow-900',
      bgColor: 'bg-amber-800/30',
      borderColor: 'border-amber-600'
    },
    { 
      key: 'gadget', 
      name: 'Gadget', 
      path: '/daily/gadget',
      icon: '/GadgetIcon.png',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-600/30',
      borderColor: 'border-green-500'
    },
    { 
      key: 'starpower', 
      name: 'Star Power', 
      path: '/daily/starpower',
      icon: '/StarpowerIcon.png',
      color: 'from-orange-500 to-yellow-600',
      bgColor: 'bg-orange-600/30',
      borderColor: 'border-orange-500'
    },
    { 
      key: 'audio', 
      name: 'Audio', 
      path: '/daily/audio',
      icon: '/AudioIcon.png',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-600/30',
      borderColor: 'border-purple-500'
    },
    { 
      key: 'pixels', 
      name: 'Pixels', 
      path: '/daily/pixels',
      icon: '/PixelsIcon.png',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-600/30',
      borderColor: 'border-blue-500'
    },
  ];

  const handleModeClick = (mode: typeof modes[0]) => {
    if (mode.key !== 'classic') {
      navigate(mode.path);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="daily-mode-container daily-classic-theme">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-mode-container daily-classic-theme">
      {/* Confetti Animation */}
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          onConfettiComplete={() => setShowConfetti(false)}
          className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none"
        />
      )}
      
      {/* Header Section */}
      <div className="w-full max-w-4xl mx-auto px-4 py-2 relative">
        {/* Top Row: Home Icon, Streak, Timer */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Icon */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
            aria-label="Go to Home"
          >
            <img 
              src="/bs_home_icon.png"
              alt="Home"
              className="w-8 h-8"
            />
          </button>

          {/* Right side: Streak and Timer */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold leading-none text-yellow-500">{streak}</span>
                <div className="text-2xl">🔥</div>
              </div>
              <span className="text-xs text-white/70 font-medium mt-1">daily streak</span>
            </div>

            {/* Timer */}
            <div className="flex flex-col items-center px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white/90">
              <span className="text-[8px] text-white/60 font-medium uppercase tracking-wide">Next Brawler In</span>
              <span className="font-mono text-white font-bold text-xs">
                {formatTime(timeUntilNext)}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Navigation Pills */}
        <div className="flex items-center justify-center gap-1.5 mb-4 mt-3">
          {modes.map((mode) => {
            const isCurrent = mode.key === 'classic';
            
            return (
              <button
                key={mode.key}
                onClick={() => handleModeClick(mode)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                  isCurrent
                    ? `bg-gradient-to-r ${mode.color} text-white shadow-lg shadow-${mode.color.split(' ')[1]}/30`
                    : `${mode.bgColor} ${mode.borderColor} text-white/70 hover:text-white/90 border-2 opacity-40 hover:opacity-70`,
                  !isCurrent && "cursor-pointer"
                )}
                disabled={isCurrent}
              >
                <img 
                  src={mode.icon}
                  alt={`${mode.name} Icon`}
                  className="w-6 h-6"
                />
                
                {/* Current mode indicator dot */}
                {isCurrent && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-800"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            Today's Classic
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 pb-4">
        <div className="daily-mode-game-card daily-mode-animate-pulse">
          <div className="daily-mode-card-content">
            {showVictoryScreen ? (
              // Victory Screen
              <div className="daily-mode-victory-section">
                <h2 className="daily-mode-victory-title">
                  GG EZ
                </h2>
                <p className="daily-mode-victory-text">
                  {t('daily.you.found')} <span className="font-bold" style={{ color: 'hsla(var(--daily-mode-primary), 1)' }}>{getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}</span> {t('daily.in.guesses')} {classic.guessCount} {t('daily.guesses.count')}
                </p>
                
                <div className="flex flex-col gap-6 items-center">
                  <Button
                    onClick={handleNextMode}
                    className="daily-mode-next-button"
                  >
                    <img 
                      src="/GadgetIcon.png" 
                      alt="Gadget Mode" 
                      className={cn(
                        "h-6 w-6",
                        currentLanguage === 'he' ? "ml-2" : "mr-2"
                      )}
                    />
                    {t('daily.next.mode')}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="text-white/60 hover:text-white/80 hover:bg-white/5 py-3 px-8 text-base border border-white/20 hover:border-white/30 transition-all duration-200 rounded-xl"
                  >
                    {t('daily.go.home')}
                  </Button>
                </div>
              </div>
            ) : (
              // Game Content
              <div className="daily-mode-game-area">
                {/* Attribute Discovery Box for Classic Mode */}
                <div className="flex justify-center mb-6">
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                    <div className="flex flex-col justify-center p-3 w-full h-full">
                      <div className="flex flex-col gap-2 h-full justify-center">
                        {/* Rarity */}
                        <div className="flex-1 aspect-square flex items-center bg-green-500/20 border border-green-500/40 rounded-lg px-3 py-2 min-h-0">
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className="text-green-400 text-xs font-medium">Rarity</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.rarity || '?'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Class */}
                        <div className="flex-1 aspect-square flex items-center bg-blue-500/20 border border-blue-500/40 rounded-lg px-3 py-2 min-h-0">
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className="text-blue-400 text-xs font-medium">Class</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.class || '?'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Range */}
                        <div className="flex-1 aspect-square flex items-center bg-purple-500/20 border border-purple-500/40 rounded-lg px-3 py-2 min-h-0">
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className="text-purple-400 text-xs font-medium">Range</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.range || '?'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Wall Break */}
                        <div className="flex-1 aspect-square flex items-center bg-orange-500/20 border border-orange-500/40 rounded-lg px-3 py-2 min-h-0">
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className="text-orange-400 text-[10px] font-medium">Wall Break</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.wallbreak || '?'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Release Year */}
                        <div className="flex-1 aspect-square flex items-center bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-3 py-2 min-h-0">
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className="text-yellow-400 text-xs font-medium">Year</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.releaseYear || '?'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="daily-mode-input-section mb-8">
                  <BrawlerAutocomplete
                    brawlers={brawlers}
                    value={inputValue}
                    onChange={setInputValue}
                    onSelect={handleSelectBrawler}
                    onSubmit={() => handleSubmit()}
                    disabled={classic.isCompleted}
                    disabledBrawlers={guessedBrawlerNames}
                  />
                </div>

                {/* Guesses Counter */}
                <div className="flex justify-center mb-4">
                  <div className="daily-mode-guess-counter">
                    <Hash className="h-5 w-5" />
                    <span>{classic.guessCount} {t('guesses.count')}</span>
                  </div>
                </div>

                {/* Detailed Attribute Comparison Grid */}
                {guesses.length > 0 && (
                  <div className="mt-8">
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="grid grid-cols-6 gap-2 text-center text-white/60 text-sm font-medium mb-2">
                        <div className="border-b border-white/20 pb-1">Brawler</div>
                        <div className="border-b border-white/20 pb-1">Rarity</div>
                        <div className="border-b border-white/20 pb-1">Class</div>
                        <div className="border-b border-white/20 pb-1">Range</div>
                        <div className="border-b border-white/20 pb-1">Wall Break</div>
                        <div className="border-b border-white/20 pb-1">Year</div>
                      </div>
                      
                      {/* Guess Rows */}
                      {guesses.map((guess, index) => (
                        <BrawlerGuessRow
                          key={`${guess.name}-${index}`}
                          guess={guess}
                          correctAnswer={getCorrectBrawler()}
                          isMobile={false}
                          gridTemplateClass="grid-cols-6"
                          isNew={index === guesses.length - 1} // Only animate the newest guess
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Yesterday's Brawler */}
                {yesterdayData && (
                  <div className="flex justify-center mt-4">
                    <span className="text-sm text-white/50">
                      yesterday's classic was <span className="text-yellow-500 font-medium">{yesterdayData || 'Mico'}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyClassicMode; 