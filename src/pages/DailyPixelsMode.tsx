import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash, Home, Flame } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers, getBrawlerDisplayName } from '@/data/brawlers';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import PixelatedImage from '@/components/PixelatedImage';
import { useStreak } from '@/contexts/StreakContext';

const DailyPixelsMode: React.FC = () => {
  const navigate = useNavigate();
  const { streak } = useStreak();
  const currentLanguage = getLanguage();

  // Daily store
  const {
    pixels,
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
  const [pixelsData, setPixelsData] = useState<any>(null);
  const [portraitImage, setPortraitImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [yesterdayData, setYesterdayData] = useState<any>(null);

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

  // Load pixels data and yesterday's challenge
  useEffect(() => {
    const loadPixelsData = async () => {
      try {
        const [data, yesterdayChallenge] = await Promise.all([
          fetchDailyChallenge('pixels'),
          fetchYesterdayChallenge('pixels')
        ]);
        
        setPixelsData(data);
        setYesterdayData(yesterdayChallenge);
        
        // Generate portrait image path
        if (data?.brawler) {
          const imagePath = getPortrait(data.brawler.toLowerCase());
          setPortraitImage(imagePath);
          setImageLoaded(false);
        } else {
          setPortraitImage('');
        }
      } catch (error) {
        console.error('Error loading pixels data:', error);
        setPortraitImage('');
        setImageLoaded(false);
        setPixelsData(null);
      }
    };
    
    loadPixelsData();
  }, []);

  // Load saved guesses when component mounts or pixels data changes
  useEffect(() => {
    const savedGuesses = getGuesses('pixels');
    setGuesses(savedGuesses);
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [pixels.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (pixels.isCompleted) {
      setShowVictoryScreen(true);
    }
  }, [pixels.isCompleted]);

  // Calculate pixelation level based on guess count
  const getPixelationLevel = useCallback(() => {
    if (pixels.isCompleted) return 6; // Show clearest image when completed
    // Start with maximum pixelation (0) and increase level with each guess to make it clearer
    // Level 0 = most pixelated, Level 6 = least pixelated
    return Math.min(6, guesses.length); // 0, 1, 2, 3, 4, 5, 6 (gets clearer each guess)
  }, [pixels.isCompleted, guesses.length]);

  const getCorrectBrawler = useCallback(() => {
    return brawlers.find(b => b.name.toLowerCase() === pixels.brawlerName.toLowerCase()) || brawlers[0];
  }, [pixels.brawlerName]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrawler || !pixelsData || guessedBrawlerNames.includes(selectedBrawler.name)) {
      return;
    }

    const newGuess = selectedBrawler;
    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setGuessedBrawlerNames([...guessedBrawlerNames, newGuess.name]);
    
    // Save guess to store
    saveGuess('pixels', newGuess);
    incrementGuessCount('pixels');

    const isCorrect = newGuess.name.toLowerCase() === pixelsData.brawler.toLowerCase();
    
    if (isCorrect) {
      // Correct guess
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      completeMode('pixels');
      
      setTimeout(() => setShowConfetti(false), 3000);
    } else if (updatedGuesses.length >= 6) {
      // Game over - max guesses reached
      setIsGameOver(true);
    }

    // Reset form
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, pixelsData, guessedBrawlerNames, guesses, saveGuess, incrementGuessCount, completeMode]);

  const handleBrawlerSelect = useCallback((brawler: any) => {
    setSelectedBrawler(brawler);
    if (brawler) {
      const displayName = getBrawlerDisplayName(brawler, currentLanguage);
      setInputValue(displayName);
    }
  }, [currentLanguage]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(false);
  };

  const formatTime = (time: { hours: number; minutes: number }) => {
    const hours = String(time.hours).padStart(2, '0');
    const minutes = String(time.minutes).padStart(2, '0');
    const seconds = '00'; // Always show 00 for seconds
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleModeClick = (mode: typeof modes[0]) => {
    if (mode.key !== 'pixels') {
      navigate(mode.path);
    }
  };

  const handleNextMode = () => {
    navigate('/daily/classic');
  };

  if (isLoading) {
    return (
      <div className="daily-mode-container daily-pixels-theme">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-mode-container daily-pixels-theme">
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
            const isCurrent = mode.key === 'pixels';
            
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
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            {t('daily.today.pixels')}
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
                  {t('daily.you.found')} <span className="font-bold" style={{ color: 'hsla(var(--daily-mode-primary), 1)' }}>{getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}</span> {t('daily.in.guesses')} {pixels.guessCount} {t('daily.guesses.count')}
                </p>

                <div className="flex flex-col gap-6 items-center">
                  <Button
                    onClick={handleNextMode}
                    className="daily-mode-next-button"
                  >
                    <img 
                      src="/ClassicIcon.png" 
                      alt="Classic Mode" 
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
                          {/* Pixelated Image */}
          <div className="flex justify-center mb-6">
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-blue-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                    {portraitImage && pixelsData ? (
                      <PixelatedImage
                        src={portraitImage}
                        alt="Mystery Brawler"
                        pixelationLevel={getPixelationLevel()}
                        className="w-full h-full object-contain"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="text-white/40 text-center">
                        <div className="text-6xl mb-4">🖼️</div>
                        <div>Mystery Pixels</div>
                      </div>
                    )}
                    
                    {/* Loading overlay */}
                    {portraitImage && !imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="animate-spin h-8 w-8 border-4 border-white/20 border-t-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pixelation Info */}
                <div className="flex justify-center mb-6">
                  <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-sm">
                    Pixelation Level: {6 - getPixelationLevel()}/6
                  </div>
                </div>

                          {/* Search Bar */}
          <div className="daily-mode-input-section mb-8">
                      <BrawlerAutocomplete
                        brawlers={brawlers}
                        value={inputValue}
                        onChange={setInputValue}
                        onSelect={handleBrawlerSelect}
                        onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={pixels.isCompleted}
                        disabledBrawlers={guessedBrawlerNames}
                      />
                    </div>

                {/* Guesses Counter */}
                <div className="flex justify-center mb-4">
                  <div className="daily-mode-guess-counter">
                    <span className="font-bold text-lg">#{pixels.guessCount}</span>
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

                {/* Yesterday's Pixels */}
                {yesterdayData && (
                  <div className="flex justify-center mt-4">
                    <span className="text-sm text-white/50">
                      {t('daily.yesterday.pixels')} <span className="text-yellow-500 font-medium">{yesterdayData.brawler || 'Mico'}</span>
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

export default DailyPixelsMode; 