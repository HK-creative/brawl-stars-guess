import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useDailyStore, DailyGameMode } from '@/stores/useDailyStore';
import { useStreak } from '@/contexts/StreakContext';
import { brawlers, getBrawlerDisplayName, getBrawlerLocalizedName } from '@/data/brawlers';
import { getPortrait, getGadgetImagePath, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

import Image from '@/components/ui/image';
import usePageTitle from '@/hooks/usePageTitle';
import PrimaryButton from '@/components/ui/primary-button';
import SecondaryButton from '@/components/ui/secondary-button';
import ModeTitle from '@/components/ModeTitle';
import DailyModeProgress from '@/components/DailyModeProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SlidingNumber } from '@/components/ui/sliding-number';
import AnimatedElement from '@/components/ui/animated-element';

// Helper to get gadget image path with robust fallbacks (padded and unpadded)
const getGadgetImageVariants = (brawler: string, gadgetName?: string): string[] => {
  if (!brawler) return [];

  // Primary path using centralized helper (handles specials like 8-bit, Mr. P, El Primo, Ruffs, Larry & Lawrie, RT, Jae-Yong)
  const primary = getGadgetImagePath(brawler, gadgetName);

  // Unpadded fallback (e.g., _01 -> _1)
  const unpadded = primary.replace(/_gadget_0?(\d)\.png$/i, (_m, d: string) => `_gadget_${d}.png`);

  // Padded fallback (e.g., _1 -> _01) to cover assets with padded numbering
  const padded = primary.replace(/_gadget_(\d)\.png$/i, (_m, d: string) => `_gadget_${String(d).padStart(2, '0')}.png`);

  // Ensure uniqueness and stable order
  const variants = [primary];
  if (!variants.includes(unpadded)) variants.push(unpadded);
  if (!variants.includes(padded)) variants.push(padded);
  return variants;
};

interface DailyGadgetModeContentProps {
  onModeChange: (mode: DailyGameMode) => void;
  suppressHeader?: boolean;
}

const DailyGadgetModeContent: React.FC<DailyGadgetModeContentProps> = ({ onModeChange, suppressHeader = false }) => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { streak } = useStreak();
  const { motionOK, transition } = useMotionPrefs();
  const isRTL = currentLanguage === 'he';

  const {
    gadget,
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
  const guesses = gadget.guesses;
  const guessedBrawlerNames = guesses.map((g: any) => g.name);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gadgetData, setGadgetData] = useState<any>(null);
  const [gadgetImage, setGadgetImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageVariants, setImageVariants] = useState<string[]>([]);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yesterdayData, setYesterdayData] = useState<any>(null);

  // Update timer immediately and then every minute
  useEffect(() => {
    updateTimeUntilNext();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateTimeUntilNext]);

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

  // Check completion status
  useEffect(() => {
    if (gadget.isCompleted) {
      setIsGameOver(true);
      setShowVictoryScreen(true);
    }
  }, [gadget.isCompleted]);

  const getCorrectBrawler = () => {
    if (gadgetData?.brawler) {
      return brawlers.find(b => b.name.toLowerCase() === gadgetData.brawler.toLowerCase()) || brawlers[0];
    }
    return brawlers.find(b => b.name.toLowerCase() === gadget.brawlerName.toLowerCase()) || brawlers[0];
  };

  const handleImageError = useCallback((_err?: Error) => {
    console.error('Gadget image failed to load at index:', currentVariantIndex, imageVariants[currentVariantIndex]);
    // advance one-by-one through variants; no forced placeholder
    const nextIndex = currentVariantIndex + 1;
    if (nextIndex < imageVariants.length) {
      setCurrentVariantIndex(nextIndex);
      setGadgetImage(imageVariants[nextIndex]);
      setImageLoaded(false);
      console.log('Trying next variant:', imageVariants[nextIndex]);
    } else {
      console.warn('All gadget image variants exhausted. Showing error UI (no fallback image).');
      // keep last failed src so Image shows error state; do not change to any placeholder
      setImageLoaded(false);
    }
  }, [currentVariantIndex, imageVariants]);

  const handleImageLoad = useCallback(() => {
    console.log('Gadget image loaded successfully:', gadgetImage);
    setImageLoaded(true);
  }, [gadgetImage]);

  // Handle brawler selection
  const handleSelectBrawler = (brawler: any) => {
    setSelectedBrawler(brawler);
    setInputValue(getBrawlerDisplayName(brawler, currentLanguage));
  };

  // Handle guess submission
  const handleSubmit = useCallback(() => {
    if (!selectedBrawler || !gadgetData || isSubmitting || guessedBrawlerNames.includes(selectedBrawler.name)) {
      return;
    }
    
    setIsSubmitting(true);
    // Atomic submit to reduce renders and avoid double increments
    const newGuess = selectedBrawler;
    submitGuess('gadget', newGuess);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = selectedBrawler.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('gadget');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      
      const displayName = getBrawlerDisplayName(correctBrawler, currentLanguage);
      toast({
        title: t('daily.congratulations'),
        description: `${t('daily.you.found')} ${displayName}!`,
        duration: 3000,
      });
    }
    
    // Clear input
    setInputValue('');
    setSelectedBrawler(null);
    setIsSubmitting(false);
  }, [selectedBrawler, gadgetData, guessedBrawlerNames, submitGuess, completeMode, currentLanguage, getCorrectBrawler]);

  // Handle next mode navigation
  const handleNextMode = () => {
    onModeChange('starpower');
  };

  // Handle play again
  const handlePlayAgain = () => {
    setIsGameOver(false);
    setShowVictoryScreen(false);
    setShowConfetti(false);
    setInputValue('');
    setSelectedBrawler(null);
    resetGuessCount('gadget');
  };

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="daily-gadget-theme">
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
          <DailyModeProgress currentMode="gadget" className="mb-6 mt-1" onModeChange={onModeChange} />

          {/* Title */}
          <AnimatedElement type="slideUp" delay={0} className="text-center mb-2 mt-2">
            <ModeTitle title={t('mode.gadget')} />
          </AnimatedElement>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 pb-4">
        <motion.div
          className="daily-mode-game-card daily-mode-animate-pulse mt-0 md:mt-0 mb-10 md:mb-12"
          initial={motionOK ? { opacity: 0, scale: 0.98 } : { opacity: 0 }}
          animate={{ opacity: 1, scale: 1, transition }}
          layout
        >
          {showVictoryScreen ? (
            // Redesigned Victory Screen
            <AnimatedElement type="fade" delay={0} className="daily-mode-victory-section">
              <div className="victory-container">
                {/* Success Icon & Title */}
                <AnimatedElement type="scale" delay={0.1} className="victory-header">
                  <div className="success-icon-container">
                    <div className="success-icon">
                      <svg className="checkmark" viewBox="0 0 52 52">
                        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                        <path className="checkmark-check" fill="none" d="m15.5,26.5l7.5,7.5l13.5,-13.5"/>
                      </svg>
                    </div>
                  </div>
                  <h2 className="victory-title">
                    {t('daily.victory.title')}
                  </h2>
                </AnimatedElement>

                {/* Brawler & Performance Stats */}
                <AnimatedElement type="slideUp" delay={0.2} className="victory-stats">
                  <div className="found-brawler">
                    <div className="brawler-portrait">
                      <Image 
                        src={getPortrait(getCorrectBrawler().name)} 
                        alt={getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}
                        className="portrait-image"
                        fallbackSrc={DEFAULT_PORTRAIT}
                      />
                    </div>
                    <div className="brawler-info">
                      <p className="found-text">{t('daily.you.found')}</p>
                      <h3 className="brawler-name">
                        {getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}
                      </h3>
                    </div>
                  </div>

                  <div className="performance-grid">
                    <div className="stat-card guess-count">
                      <div className="stat-icon">🎯</div>
                      <div className="stat-value">
                        <SlidingNumber value={gadget.guessCount} />
                      </div>
                      <div className="stat-label">{t('daily.guesses.used')}</div>
                    </div>
                    
                    <div className="stat-card accuracy">
                      <div className="stat-icon">📈</div>
                      <div className="stat-value">
                        {Math.round((1 / gadget.guessCount) * 100)}%
                      </div>
                      <div className="stat-label">{t('daily.accuracy')}</div>
                    </div>
                    
                    <div className="stat-card streak">
                      <div className="stat-icon">🔥</div>
                      <div className="stat-value">
                        <SlidingNumber value={streak} />
                      </div>
                      <div className="stat-label">{t('daily.streak')}</div>
                    </div>
                  </div>
                </AnimatedElement>

                {/* Action Buttons */}
                <AnimatedElement type="slideUp" delay={0.3} className="victory-actions">
                  <div className="action-buttons">
                    <PrimaryButton
                      onClick={handleNextMode}
                      className="next-mode-btn"
                    >
                      <img 
                        src="/StarPowerIcon.png" 
                        alt="Star Power Mode" 
                        className={cn(
                          "btn-icon",
                          currentLanguage === 'he' ? "ml-2" : "mr-2"
                        )}
                      />
                      {t('daily.next.mode')}
                      <div className="btn-arrow">→</div>
                    </PrimaryButton>
                    
                    <div className="secondary-actions">
                      <SecondaryButton
                        onClick={() => navigate('/')}
                        className="home-btn"
                      >
                        <svg className="home-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                        {t('daily.go.home')}
                      </SecondaryButton>
                    </div>
                  </div>
                </AnimatedElement>
              </div>
            </AnimatedElement>
          ) : (
            // Game Content
            <div className="daily-mode-game-area">
              {/* Gadget Image */}
              <AnimatedElement type="slideUp" delay={0.1} className="flex justify-center mb-6">
                <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-green-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                  {(() => {
                    const primarySrc = imageVariants[currentVariantIndex];
                    const activeSrc = gadgetImage || primarySrc;
                    // Avoid rendering the Image component with an empty src, which would
                    // cause it to momentarily use the default portrait (Shelly) internally.
                    if (!activeSrc) {
                      return (
                        <div className="text-center w-full h-full flex items-center justify-center">
                          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
                        </div>
                      );
                    }
                    console.debug('Gadget image attempt:', { activeSrc, currentVariantIndex });
                    return (
                      <Image
                        src={activeSrc}
                        alt="Mystery Gadget"
                        className="w-full h-full object-contain"
                        priority
                        disableFallback
                        onLoadComplete={handleImageLoad}
                        onLoadError={handleImageError}
                      />
                    );
                  })()}
                </div>
              </AnimatedElement>

              {/* Search Bar */}
              <AnimatedElement type="slideUp" delay={0.2} className="daily-mode-input-section mb-8 w-full max-w-md mx-auto">
                <BrawlerAutocomplete
                  brawlers={brawlers}
                  value={inputValue}
                  onChange={setInputValue}
                  onSelect={handleSelectBrawler}
                  onSubmit={() => handleSubmit()}
                  disabled={gadget.isCompleted}
                  disabledBrawlers={guessedBrawlerNames}
                />
              </AnimatedElement>

              {/* Guesses Counter */}
              <div className="flex justify-center mb-4">
                <div className="daily-mode-guess-counter flex items-center">
                  <span className="font-bold text-lg mr-1">#</span>
                  <div className="font-bold text-lg">
                    <SlidingNumber value={gadget.guessCount} />
                  </div>
                  <span className="text-white/90 ml-1">{t('guesses.count')}</span>
                </div>
              </div>

              {/* Guesses Grid */}
              {guesses.length > 0 && (
                <div className="daily-mode-guesses-section">
                  <motion.div className="daily-mode-guesses-grid" layout>
                    {guesses.map((guess, index) => {
                      const isCorrect = guess.name.toLowerCase() === getCorrectBrawler().name.toLowerCase();
                      const portraitSrc = getPortrait(guess.name) || DEFAULT_PORTRAIT;
                      const isNewest = index === 0; // The newest guess is always at index 0
                      
                      if (isNewest) {
                        // Only the newest guess gets entrance animation
                        return (
                          <motion.div
                            key={guess.name} // Use stable key based on name, not index
                            initial={motionOK ? { 
                              opacity: 0, 
                              scale: 0.8,
                              y: -20,
                              filter: "blur(3px)"
                            } : { opacity: 0 }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              y: 0,
                              filter: "blur(0px)",
                              transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                mass: 0.8
                              }
                            }}
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
                      } else {
                        // Existing guesses just get layout animations for repositioning
                        return (
                          <motion.div
                            key={guess.name} // Stable key
                            layout
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                              mass: 0.6
                            }}
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
                      }
                    })}
                  </motion.div>
                </div>
              )}

              {/* Yesterday's Gadget */}
              {yesterdayData && (
                <AnimatedElement type="slideUp" delay={0.3} className="flex justify-center mt-4">
                  <span className="text-sm text-white/80">
                    {t('daily.yesterday.gadget')}{' '}
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
                </AnimatedElement>
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

export default DailyGadgetModeContent;
