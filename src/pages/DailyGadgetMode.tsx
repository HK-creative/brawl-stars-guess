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
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useStreak } from '@/contexts/StreakContext';

const DEFAULT_PORTRAIT = '/portraits/shelly.png';

// Helper to get gadget image path with fallback variants
const getGadgetImageVariants = (brawler: string, gadgetName?: string): string[] => {
  if (!brawler) {
    return [];
  }
  
  // Clean up brawler name for file path
  const normalizedBrawler = brawler.toLowerCase().replace(/ /g, '_');
  
  // Handle special cases
  if (normalizedBrawler === 'mr.p') return [`/GadgetImages/mrp_gadget_01.png`];
  if (normalizedBrawler === 'el primo') return [`/GadgetImages/elprimo_gadget_01.png`];
  if (normalizedBrawler === 'colonel ruffs') return [`/GadgetImages/colonel_ruffs_gadget_01.png`];
  
  // Special case for R-T
  if (brawler.toLowerCase().replace(/[-_ ]/g, '') === 'rt') {
    if (gadgetName && gadgetName.match(/2|second/i)) {
      return ['/GadgetImages/rt_gadget_02.png'];
    }
    return ['/GadgetImages/rt_gadget_01.png'];
  }
  
  // Special case for Jae-Yong
  if (brawler.toLowerCase().replace(/[-_ ]/g, '') === 'jaeyong') {
    if (gadgetName && gadgetName.match(/2|second/i)) {
      return ['/GadgetImages/Jae-Yong_gadget_2.png'];
    }
    return ['/GadgetImages/Jae-Yong_gadget_1.png'];
  }
  
  // First, try to determine the base gadget number from the name
  let baseNum = '01';
  if (gadgetName) {
    const match = gadgetName.match(/(\d+)/);
    if (match) {
      baseNum = match[1].padStart(2, '0');
    } else if (gadgetName.includes('First')) {
      baseNum = '01';
    } else if (gadgetName.includes('Second')) {
      baseNum = '02';
    }
  }
  
  // Generate both possible variants
  const variant1 = `/GadgetImages/${normalizedBrawler}_gadget_${baseNum}.png`;
  const variant2 = `/GadgetImages/${normalizedBrawler}_gadget_${baseNum.replace(/^0+/, '')}.png`;
  
  // Return both variants to try
  return [variant1, variant2];
};

const DailyGadgetMode: React.FC = () => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { streak } = useStreak();

  const {
    gadget,
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
  const [gadgetData, setGadgetData] = useState<any>(null);
  const [gadgetImage, setGadgetImage] = useState<string>('');
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

  // Load gadget data and generate image
  useEffect(() => {
    const loadGadgetData = async () => {
      try {
        const [data, yesterdayChallenge] = await Promise.all([
          fetchDailyChallenge('gadget'),
          fetchYesterdayChallenge('gadget')
        ]);
        
        console.log('Loaded gadget data:', data);
        setGadgetData(data);
        setYesterdayData(yesterdayChallenge);
        
        // Generate gadget image variants
        if (data?.brawler) {
          const variants = getGadgetImageVariants(data.brawler, data.gadgetName);
          console.log('Generated gadget image variants:', variants);
          setImageVariants(variants);
          setCurrentVariantIndex(0);
          if (variants.length > 0) {
            setGadgetImage(variants[0]);
            console.log('Trying first variant:', variants[0]);
          } else {
            setGadgetImage('');
          }
          setImageLoaded(false); // Reset image loaded state
        } else {
          console.warn('No brawler data found in gadget challenge');
          setGadgetImage('');
          setImageVariants([]);
          setCurrentVariantIndex(0);
          setImageLoaded(false);
          setGadgetData(null);
        }
              } catch (error) {
          console.error('Error loading gadget data:', error);
          setGadgetImage('');
          setImageVariants([]);
          setCurrentVariantIndex(0);
          setImageLoaded(false);
          setGadgetData(null);
        }
    };
    
    loadGadgetData();
  }, []);

  // Load saved guesses when component mounts or gadget data changes
  useEffect(() => {
    const savedGuesses = getGuesses('gadget');
    setGuesses(savedGuesses);
    // Extract brawler names from saved guesses to prevent duplicates
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [gadget.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (gadget.isCompleted) {
      setShowVictoryScreen(true);
      setIsGameOver(true);
    }
  }, [gadget.isCompleted]);

  const getCorrectBrawler = () => {
    if (gadgetData?.brawler) {
      return brawlers.find(b => b.name.toLowerCase() === gadgetData.brawler.toLowerCase()) || brawlers[0];
    }
    return brawlers.find(b => b.name.toLowerCase() === gadget.brawlerName.toLowerCase()) || brawlers[0];
  };

  // Handle guess submission
  const handleSubmit = useCallback((brawler?: any) => {
    const brawlerToSubmit = brawler || selectedBrawler;
    
    if (!brawlerToSubmit || gadget.isCompleted) return;

    // Increment guess count in store
    incrementGuessCount('gadget');
    
    // Add guess to store and local state
    const newGuess = brawlerToSubmit;
    saveGuess('gadget', newGuess);
    setGuesses(prev => [...prev, newGuess]);
    setGuessedBrawlerNames(prev => [...prev, brawlerToSubmit.name]);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = brawlerToSubmit.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('gadget');
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
  }, [selectedBrawler, gadget.isCompleted, incrementGuessCount, saveGuess, getCorrectBrawler, completeMode]);

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
    navigate('/daily/starpower');
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
    resetGuessCount('gadget');
  };

  const handleImageError = () => {
    console.error('Image failed to load:', gadgetImage);
    // Try next variant if available
    if (currentVariantIndex < imageVariants.length - 1) {
    const nextIndex = currentVariantIndex + 1;
      setCurrentVariantIndex(nextIndex);
      setGadgetImage(imageVariants[nextIndex]);
      console.log('Trying next variant:', imageVariants[nextIndex]);
    } else {
      console.warn('All gadget image variants failed to load');
      setGadgetImage('');
      setImageLoaded(false);
    }
  };

  const handleImageLoad = () => {
    console.log('Gadget image loaded successfully:', gadgetImage);
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
    if (mode.key !== 'gadget') {
      navigate(mode.path);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="daily-mode-container daily-gadget-theme">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-mode-container daily-gadget-theme">
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
            className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
            aria-label={t('button.go.home')}
          >
            <img 
              src="/bs_home_icon.png"
              alt={t('button.go.home')}
              className="w-11 h-11"
            />
          </button>

          {/* Right side: Streak and Timer */}
          <div className="flex items-center gap-3">
            {/* Daily Streak - moved to the right */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="text-3xl font-bold leading-none text-yellow-500">{streak}</span>
                <div className="text-3xl">🔥</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Navigation Pills */}
        <div className="flex items-center justify-center gap-2.5 mb-4 mt-3">
          {modes.map((mode) => {
            const isCurrent = mode.key === 'gadget';
            
            return (
              <button
                key={mode.key}
                onClick={() => handleModeClick(mode)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300",
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
                  className="w-7 h-7"
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
        <div className="text-center mb-6 mt-2">
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">
            {t('daily.today.gadget')}
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
                  {t('daily.you.found')} <span className="font-bold" style={{ color: 'hsla(var(--daily-mode-primary), 1)' }}>{getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}</span> {t('daily.in.guesses')} {gadget.guessCount} {t('daily.guesses.count')}
                </p>
                
                <div className="flex flex-col gap-6 items-center">
                  <Button
                    onClick={handleNextMode}
                    className="daily-mode-next-button"
                  >
                    <img 
                      src="/StarpowerIcon.png" 
                      alt="Star Power Mode" 
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
                {/* Gadget Image */}
                <div className="flex justify-center mb-6">
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-green-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                    {gadgetImage && imageLoaded ? (
                      <img
                        src={gadgetImage}
                        alt="Mystery Gadget"
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
                    disabled={gadget.isCompleted}
                        disabledBrawlers={guessedBrawlerNames}
                      />
                    </div>

                {/* Guesses Counter */}
                <div className="flex justify-center mb-4">
                  <div className="daily-mode-guess-counter">
                    <span className="font-bold text-lg">#{gadget.guessCount}</span>
                    <span className="text-white/80 ml-1">{t('guesses.count')}</span>
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

                {/* Yesterday's Gadget */}
                {yesterdayData && (
                  <div className="flex justify-center mt-4">
                    <span className="text-sm text-white/50">
                      {t('daily.yesterday.gadget')} <span className="text-yellow-500 font-medium">{yesterdayData.brawler || 'Mico'}</span>
                    </span>
                  </div>
                )}

                {/* Next Brawler In Timer - moved below yesterday's */}
                <div className="flex justify-center mt-3">
                  <div className="flex flex-col items-center text-white/90 px-3">
                    <span className="text-xs text-white/60 font-medium uppercase tracking-wide">{t('daily.next.brawler.in')}</span>
                    <span className="font-mono text-white font-bold text-xl">
                      {formatTime(timeUntilNext)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyGadgetMode; 