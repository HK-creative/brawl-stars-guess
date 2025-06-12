import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash, Flame, Home } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers, getBrawlerDisplayName } from '@/data/brawlers';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useStreak } from '@/contexts/StreakContext';

// Helper to get star power image path with fallback variants
const getStarPowerImageVariants = (brawler: string, starPowerName?: string): string[] => {
  if (!brawler) {
    return [];
  }
  
  // Clean up brawler name for file path
  const normalizedBrawler = brawler.toLowerCase().replace(/ /g, '_');
  
  // Handle special cases
  if (normalizedBrawler === 'mr.p') return [`/StarPowerImages/mrp_starpower_01.png`];
  if (normalizedBrawler === 'el primo') return [`/StarPowerImages/elprimo_starpower_01.png`];
  if (normalizedBrawler === 'colonel ruffs') return [`/StarPowerImages/colonel_ruffs_starpower_01.png`];
  
  // Special case for R-T
  if (brawler.toLowerCase().replace(/[-_ ]/g, '') === 'rt') {
    if (starPowerName && starPowerName.match(/2|second/i)) {
      return ['/StarPowerImages/rt_starpower_02.png'];
    }
    return ['/StarPowerImages/rt_starpower_01.png'];
  }
  
  // First, try to determine the base star power number from the name
  let baseNum = '01';
  if (starPowerName) {
    const match = starPowerName.match(/(\d+)/);
    if (match) {
      baseNum = match[1].padStart(2, '0');
    } else if (starPowerName.includes('First')) {
      baseNum = '01';
    } else if (starPowerName.includes('Second')) {
      baseNum = '02';
    }
  }
  
  // Generate both possible variants
  const variant1 = `/StarPowerImages/${normalizedBrawler}_starpower_${baseNum}.png`;
  const variant2 = `/StarPowerImages/${normalizedBrawler}_starpower_${baseNum.replace(/^0+/, '')}.png`;
  
  // Return both variants to try
  return [variant1, variant2];
};

const DailyStarPowerMode: React.FC = () => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { streak } = useStreak();

  const {
    starpower,
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
  const [starPowerData, setStarPowerData] = useState<any>(null);
  const [starPowerImage, setStarPowerImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageVariants, setImageVariants] = useState<string[]>([]);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [yesterdayData, setYesterdayData] = useState<any>(null);

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

  // Load star power data and generate image
  useEffect(() => {
    const loadStarPowerData = async () => {
      try {
        const [data, yesterdayChallenge] = await Promise.all([
          fetchDailyChallenge('starpower'),
          fetchYesterdayChallenge('starpower')
        ]);
        
        console.log('Loaded star power data:', data);
        setStarPowerData(data);
        setYesterdayData(yesterdayChallenge);
        
        // Generate star power image variants
        if (data?.brawler) {
          const variants = getStarPowerImageVariants(data.brawler, data.starPowerName);
          console.log('Generated star power image variants:', variants);
          setImageVariants(variants);
          setCurrentVariantIndex(0);
          if (variants.length > 0) {
            setStarPowerImage(variants[0]);
            console.log('Trying first variant:', variants[0]);
          } else {
            setStarPowerImage('');
          }
          setImageLoaded(false);
        } else {
          console.warn('No brawler data found in star power challenge');
          setStarPowerImage('');
          setImageVariants([]);
          setCurrentVariantIndex(0);
          setImageLoaded(false);
          setStarPowerData(null);
        }
      } catch (error) {
        console.error('Error loading star power data:', error);
        setStarPowerImage('');
        setImageVariants([]);
        setCurrentVariantIndex(0);
        setImageLoaded(false);
        setStarPowerData(null);
      }
    };
    
    loadStarPowerData();
  }, []);

  // Load saved guesses when component mounts or star power data changes
  useEffect(() => {
    const savedGuesses = getGuesses('starpower');
    setGuesses(savedGuesses);
    // Extract brawler names from saved guesses to prevent duplicates
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [starpower.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (starpower.isCompleted) {
      setShowVictoryScreen(true);
      setIsGameOver(true);
    }
  }, [starpower.isCompleted]);

  const getCorrectBrawler = () => {
    if (starPowerData?.brawler) {
      return brawlers.find(b => b.name.toLowerCase() === starPowerData.brawler.toLowerCase()) || brawlers[0];
    }
    return brawlers.find(b => b.name.toLowerCase() === starpower.brawlerName.toLowerCase()) || brawlers[0];
  };

  // Handle guess submission
  const handleSubmit = useCallback((brawler?: any) => {
    const brawlerToSubmit = brawler || selectedBrawler;
    
    if (!brawlerToSubmit || starpower.isCompleted) return;

    // Increment guess count in store
    incrementGuessCount('starpower');
    
    // Add guess to store and local state
    const newGuess = brawlerToSubmit;
    saveGuess('starpower', newGuess);
    setGuesses(prev => [...prev, newGuess]);
    setGuessedBrawlerNames(prev => [...prev, brawlerToSubmit.name]);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = brawlerToSubmit.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('starpower');
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
  }, [selectedBrawler, starpower.isCompleted, incrementGuessCount, saveGuess, getCorrectBrawler, completeMode]);

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
    navigate('/daily/audio');
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
    resetGuessCount('starpower');
  };

  const handleImageError = () => {
    console.error('Image failed to load:', starPowerImage);
    // Try next variant if available
    if (currentVariantIndex < imageVariants.length - 1) {
      const nextIndex = currentVariantIndex + 1;
      setCurrentVariantIndex(nextIndex);
      setStarPowerImage(imageVariants[nextIndex]);
      console.log('Trying next variant:', imageVariants[nextIndex]);
    } else {
      console.warn('All star power image variants failed to load');
      setStarPowerImage('');
      setImageLoaded(false);
    }
  };

  const handleImageLoad = () => {
    console.log('Star power image loaded successfully:', starPowerImage);
    setImageLoaded(true);
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
    if (mode.key !== 'starpower') {
      navigate(mode.path);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="daily-mode-container daily-starpower-theme">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-mode-container daily-starpower-theme">
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
            const isCurrent = mode.key === 'starpower';
            
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
            Today's Star Power
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
                  {t('daily.you.found')} <span className="font-bold" style={{ color: 'hsla(var(--daily-mode-primary), 1)' }}>{getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}</span> {t('daily.in.guesses')} {starpower.guessCount} {t('daily.guesses.count')}
                </p>
                
                <div className="flex flex-col gap-6 items-center">
                  <Button
                    onClick={handleNextMode}
                    className="daily-mode-next-button"
                  >
                    <img 
                      src="/AudioIcon.png" 
                      alt="Audio Mode" 
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
                {/* Star Power Image */}
                <div className="flex justify-center mb-6">
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                    {starPowerImage && imageLoaded ? (
                      <img
                        src={starPowerImage}
                        alt="Mystery Star Power"
                        className="w-full h-full object-contain"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(false)}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
                        <div className="text-white/50 text-sm">Loading...</div>
                      </div>
                    )}
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
                    disabled={starpower.isCompleted}
                    disabledBrawlers={guessedBrawlerNames}
                  />
                </div>

                {/* Guesses Counter */}
                <div className="flex justify-center mb-4">
                  <div className="daily-mode-guess-counter">
                    <Hash className="h-5 w-5" />
                    <span>{starpower.guessCount} {t('guesses.count')}</span>
                  </div>
                </div>

                {/* Guesses Grid */}
                {guesses.length > 0 && (
                  <div className="daily-mode-guesses-section">
                    <div className="daily-mode-guesses-grid">
                      {guesses.map((guess, index) => {
                        const isCorrect = guess.name.toLowerCase() === getCorrectBrawler().name.toLowerCase();
                        const portraitSrc = getPortrait(guess.name) || DEFAULT_PORTRAIT;
                        
                        return (
                          <div
                            key={index}
                            className={cn(
                              "daily-mode-guess-item",
                              isCorrect ? "daily-mode-guess-correct" : "daily-mode-guess-incorrect"
                            )}
                          >
                            <img
                              src={portraitSrc}
                              alt={guess.name}
                              className="daily-mode-guess-portrait"
                            />
                            <span className="daily-mode-guess-name">
                              {getBrawlerDisplayName(guess, currentLanguage)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Yesterday's Star Power */}
                {yesterdayData && (
                  <div className="flex justify-center mt-4">
                    <span className="text-sm text-white/50">
                      yesterday's star power was <span className="text-yellow-500 font-medium">{yesterdayData.brawler || 'Mico'}</span>
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

export default DailyStarPowerMode; 