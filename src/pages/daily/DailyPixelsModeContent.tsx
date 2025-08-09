import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useDailyStore, DailyGameMode } from '@/stores/useDailyStore';
import { useStreak } from '@/contexts/StreakContext';
import { brawlers, getBrawlerDisplayName, getBrawlerLocalizedName } from '@/data/brawlers';
import { getPortrait } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import PrimaryButton from '@/components/ui/primary-button';
import SecondaryButton from '@/components/ui/secondary-button';
import ModeTitle from '@/components/ModeTitle';
import DailyModeProgress from '@/components/DailyModeProgress';

import Image from '@/components/ui/image';
import usePageTitle from '@/hooks/usePageTitle';
import PixelatedImage from '@/components/PixelatedImage';

import { Clock, Hash, Flame, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SlidingNumber } from '@/components/ui/sliding-number';

const DEFAULT_PORTRAIT = '/shelly_portrait.png';

// Helper to get pixelated portrait with fallback
const getPixelatedPortrait = (brawler: string): string => {
  if (!brawler) {
    return DEFAULT_PORTRAIT;
  }
  
  // Clean up brawler name for file path
  const normalizedBrawler = brawler.toLowerCase().replace(/ /g, '_');
  
  // Handle special cases
  const specialCases: { [key: string]: string } = {
    'el_primo': 'el_primo',
    '8-bit': '8_bit',
    'mr._p': 'mr_p'
  };
  
  const finalBrawlerName = specialCases[normalizedBrawler] || normalizedBrawler;
  
  // Return pixelated portrait path (files are in public root, not subdirectories)
  return `/${finalBrawlerName}_portrait.png`;
};

interface DailyPixelsModeContentProps {
  onModeChange: (mode: DailyGameMode) => void;
  suppressHeader?: boolean;
}

const DailyPixelsModeContent: React.FC<DailyPixelsModeContentProps> = ({ onModeChange, suppressHeader = false }) => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { streak } = useStreak();
  const { motionOK, transition } = useMotionPrefs();
  const isRTL = currentLanguage === 'he';

  const {
    pixels,
    timeUntilNext,
    completeMode,
    resetGuessCount,
    updateTimeUntilNext,
    submitGuess,
    getGuesses,
  } = useDailyStore();

  // Local game state
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<any>(null);
  // Use store state directly instead of local state
  const guesses = pixels.guesses;
  const guessedBrawlerNames = guesses.map((g: any) => g.name);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pixelsData, setPixelsData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixelatedImage, setPixelatedImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pixelLevel, setPixelLevel] = useState(1);
  const [yesterdayData, setYesterdayData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update timer immediately and then every minute
  useEffect(() => {
    updateTimeUntilNext();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateTimeUntilNext]);

  // Load pixels data and generate image
  useEffect(() => {
    const loadPixelsData = async () => {
      try {
        setIsLoading(true);
        const [data, yesterdayChallenge] = await Promise.all([
          fetchDailyChallenge('pixels'),
          fetchYesterdayChallenge('pixels')
        ]);
        
        console.log('Loaded pixels data:', data);
        setPixelsData(data);
        setYesterdayData(yesterdayChallenge);
        
        // Generate pixelated image
        if (data?.brawler) {
          const pixelatedPortrait = getPixelatedPortrait(data.brawler);
          console.log('Generated pixelated portrait:', pixelatedPortrait);
          setPixelatedImage(pixelatedPortrait);
          setImageLoaded(false); // Reset image loaded state
        } else {
          console.warn('No brawler data found in pixels challenge');
          setPixelatedImage(DEFAULT_PORTRAIT);
          setImageLoaded(false);
          setPixelsData(null);
        }
      } catch (error) {
        console.error('Error loading pixels data:', error);
        setPixelatedImage(DEFAULT_PORTRAIT);
        setImageLoaded(false);
        setPixelsData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPixelsData();
  }, []);

  // Check completion status
  useEffect(() => {
    if (pixels.isCompleted) {
      setIsGameOver(true);
      setShowVictoryScreen(true);
    }
  }, [pixels.isCompleted]);

  // Update pixel level based on guess count (more guesses = less pixelated)
  useEffect(() => {
    const guessCount = pixels.guessCount;
    if (guessCount === 0) {
      setPixelLevel(5); // Most pixelated
    } else if (guessCount === 1) {
      setPixelLevel(4);
    } else if (guessCount === 2) {
      setPixelLevel(3);
    } else if (guessCount === 3) {
      setPixelLevel(2);
    } else {
      setPixelLevel(1); // Least pixelated
    }
  }, [pixels.guessCount]);

  const getCorrectBrawler = () => {
    if (pixelsData?.brawler) {
      return brawlers.find(b => b.name.toLowerCase() === pixelsData.brawler.toLowerCase()) || brawlers[0];
    }
    return brawlers.find(b => b.name.toLowerCase() === pixels.brawlerName.toLowerCase()) || brawlers[0];
  };

  const handleImageError = useCallback(() => {
    console.error('Pixelated image failed to load:', pixelatedImage);
    setPixelatedImage(DEFAULT_PORTRAIT);
    setImageLoaded(false);
  }, [pixelatedImage]);

  const handleImageLoad = useCallback(() => {
    console.log('Pixelated image loaded successfully:', pixelatedImage);
    setImageLoaded(true);
  }, [pixelatedImage]);

  // Handle brawler selection
  const handleSelectBrawler = (brawler: any) => {
    setSelectedBrawler(brawler);
    setInputValue(getBrawlerDisplayName(brawler, currentLanguage));
  };

  // Handle guess submission
  const handleSubmit = useCallback(() => {
    if (!selectedBrawler || !pixelsData || isSubmitting || pixels.guesses.map((g: any) => g.name).includes(selectedBrawler.name)) {
      return;
    }
    
    setIsSubmitting(true);
    // Atomic submit to reduce renders and avoid double increments
    const newGuess = selectedBrawler;
    submitGuess('pixels', newGuess);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = selectedBrawler.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('pixels');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      setPixelLevel(1); // Show clear image
      
      const displayName = getBrawlerDisplayName(correctBrawler, currentLanguage);
      toast({
        title: t('daily.congratulations'),
        description: `${t('daily.you.found')} ${displayName}!`,
        duration: 3000,
      });
    } else {
      // Reduce pixelation level for next guess
      const newGuessCount = pixels.guessCount + 1;
      if (newGuessCount === 1) {
        setPixelLevel(4);
      } else if (newGuessCount === 2) {
        setPixelLevel(3);
      } else if (newGuessCount === 3) {
        setPixelLevel(2);
      } else {
        setPixelLevel(1);
      }
    }
    
    // Clear input
    setInputValue('');
    setSelectedBrawler(null);
    setIsSubmitting(false);
  }, [selectedBrawler, pixelsData, pixels.guesses, submitGuess, completeMode, currentLanguage, getCorrectBrawler, pixels.guessCount]);

  // Handle next mode navigation (back to classic)
  const handleNextMode = () => {
    onModeChange('classic');
  };

  // Handle play again
  const handlePlayAgain = () => {
    setIsGameOver(false);
    setShowVictoryScreen(false);
    setShowConfetti(false);
    setInputValue('');
    setSelectedBrawler(null);
    setPixelLevel(5);
    resetGuessCount('pixels');
  };

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  // Calculate pixelation level based on guess count (matches pixels survival mode)
  const getPixelationLevel = () => {
    if (pixels.isCompleted) return 6; // Show clearest image when completed
    // Start with maximum pixelation (0) and increase level with each guess to make it clearer
    // Level 0 = most pixelated, Level 6 = least pixelated
    return Math.min(6, pixels.guessCount); // 0, 1, 2, 3, 4, 5, 6 (gets clearer each guess)
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="daily-pixels-theme">
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
      
      {/* Header Section (suppressed when shared header is used) */}
      {!suppressHeader && (
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
                  <span className="text-3xl font-bold leading-none text-[hsl(var(--daily-mode-primary))]">{streak}</span>
                  <div className="text-3xl">🔥</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Navigation */}
          <DailyModeProgress currentMode="pixels" className="mb-6 mt-1" onModeChange={onModeChange} />

          {/* Title */}
          <div className="text-center mb-6 mt-2">
            <ModeTitle title={t('mode.pixels')} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 pb-4">
        <motion.div
          className="daily-mode-game-card daily-mode-animate-pulse"
          initial={motionOK ? { opacity: 0, scale: 0.98 } : { opacity: 0 }}
          animate={{ opacity: 1, scale: 1, transition }}
          layout
        >
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
                <SecondaryButton
                  onClick={() => navigate('/')}
                >
                  {t('daily.go.home')}
                </SecondaryButton>
              </div>
            </div>
          ) : (
            // Game Content
            <div className="daily-mode-game-area">
              {/* Pixelated Image */}
              <div className="flex justify-center mb-6">
                <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-pink-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                  {pixelatedImage ? (
                    <PixelatedImage
                      src={pixelatedImage}
                      alt="Mystery Pixelated Image"
                      pixelationLevel={getPixelationLevel()}
                      fallbackSrc={DEFAULT_PORTRAIT}
                      className="w-full h-full"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
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
              <div className="daily-mode-input-section mb-8 w-full max-w-md mx-auto">
                <BrawlerAutocomplete
                  brawlers={brawlers}
                  value={inputValue}
                  onChange={setInputValue}
                  onSelect={handleSelectBrawler}
                  onSubmit={() => handleSubmit()}
                  disabled={pixels.isCompleted}
                  disabledBrawlers={guessedBrawlerNames}
                />
              </div>

              {/* Guesses Counter */}
              <div className="flex justify-center mb-4">
                <div className="daily-mode-guess-counter flex items-center">
                  <span className="font-bold text-lg mr-1">#</span>
                  <div className="font-bold text-lg">
                    <SlidingNumber value={pixels.guessCount} />
                  </div>
                  <span className="text-white/90 ml-1">{t('guesses.count')}</span>
                </div>
              </div>

              {/* Guesses Grid */}
              {guesses.length > 0 && (
                <div className="daily-mode-guesses-section">
                  <div className="daily-mode-guesses-grid">
                    <AnimatePresence initial={false}>
                      {guesses.map((guess, index) => {
                        const isCorrect = guess.name.toLowerCase() === getCorrectBrawler().name.toLowerCase();
                        const portraitSrc = getPortrait(guess.name) || DEFAULT_PORTRAIT;
                        
                        return (
                          <motion.div
                            key={`${guess.name}-${index}`}
                            initial={motionOK ? { opacity: 0, y: 8, x: isRTL ? 8 : -8 } : { opacity: 0 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              x: 0,
                              transition: { ...transition, delay: motionOK ? Math.min(index * 0.04, 0.3) : 0 },
                            }}
                            exit={{ opacity: 0, y: -4, x: 0, transition }}
                            layout
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
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Yesterday's Brawler */}
              {yesterdayData && (
                <div className="flex justify-center mt-4">
                  <span className="text-sm text-white/80">
                    {t('daily.yesterday.pixels')}{' '}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={yesterdayData.brawler}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition }}
                        exit={{ opacity: 0, transition }}
                        className="text-[hsl(var(--daily-mode-primary))] font-medium"
                      >
                        {getBrawlerLocalizedName(yesterdayData.brawler || 'Mico', currentLanguage)}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </div>
              )}

              {/* Next Brawler In Timer - moved below yesterday's */}
              <div className="flex justify-center mt-3">
                <div className="flex flex-col items-center text-white/90 px-3">
                  <span className="text-xs text-white/90 font-medium uppercase tracking-wide">{t('daily.next.brawler.in')}</span>
                  <span className="font-mono text-white font-bold text-xl">
                    {formatTime(timeUntilNext)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DailyPixelsModeContent;
