import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Hash } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SlidingNumber } from '@/components/ui/sliding-number';


const DEFAULT_PORTRAIT = '/portraits/shelly.png';

// Helper to get star power image path with fallback variants
const getStarPowerImageVariants = (brawler: string, starPowerName?: string): string[] => {
  if (!brawler) return [];

  // Determine index: support both padded (01/02) and unpadded (1/2)
  let baseNum = '01';
  if (starPowerName) {
    const match = starPowerName.match(/(\d+)/);
    if (match) baseNum = match[1].padStart(2, '0');
    else if (/second/i.test(starPowerName)) baseNum = '02';
  }
  const unpadded = baseNum.replace(/^0+/, '');

  const lower = brawler.toLowerCase();

  // Candidate base names to try, ordered from most specific to generic
  const bases: string[] = [];

  // 1) Known tricky names -> explicit mappings to actual filenames in /public
  if (lower.includes('mr') && lower.includes('p')) bases.push('mrp');
  if (lower.includes('8-bit') || lower.includes('8 bit')) bases.push('8bit');
  if (lower.includes('el primo')) bases.push('elprimo');
  if (lower.includes('larry') && lower.includes('lawrie')) bases.push('larry_lawrie_'); // double underscore before _starpower_
  if (lower === 'r-t' || lower === 'r t' || lower === 'rt') bases.push('rt');
  if (lower.includes('jae-yong')) {
    // Preserve exact case variant used by assets and a lowercase hyphenated variant
    bases.push('Jae-Yong');
    bases.push('jae-yong');
  }

  // 2) Generic transforms
  const underscore = lower.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const compact = lower.replace(/[^a-z0-9]/g, '');
  if (underscore) bases.push(underscore);
  if (compact && compact !== underscore.replace(/_/g, '')) bases.push(compact);

  // Deduplicate while preserving order
  const uniqueBases = Array.from(new Set(bases));

  // Build variants for each base
  const variants: string[] = [];
  uniqueBases.forEach((base) => {
    variants.push(`/${base}_starpower_${baseNum}.png`);
    variants.push(`/${base}_starpower_${unpadded}.png`);
  });

  return variants;
};

interface DailyStarPowerModeContentProps {
  onModeChange: (mode: DailyGameMode) => void;
  suppressHeader?: boolean;
}

const DailyStarPowerModeContent: React.FC<DailyStarPowerModeContentProps> = ({ onModeChange, suppressHeader = false }) => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { streak } = useStreak();
  const { motionOK, transition } = useMotionPrefs();
  const isRTL = currentLanguage === 'he';

  const {
    starpower,
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
  const guesses = starpower.guesses;
  const guessedBrawlerNames = guesses.map((g: any) => g.name);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [starPowerData, setStarPowerData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [starPowerImage, setStarPowerImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageVariants, setImageVariants] = useState<string[]>([]);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
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

  // Load star power data and generate image
  useEffect(() => {
    const loadStarPowerData = async () => {
      try {
        setIsLoading(true);
        const [data, yesterdayChallenge] = await Promise.all([
          fetchDailyChallenge('starpower'),
          fetchYesterdayChallenge('starpower')
        ]);
        
        console.log('Loaded star power data:', data);
        setStarPowerData(data);
        setYesterdayData(yesterdayChallenge);
        
        // Generate star power image variants
        if (data?.brawler) {
          // Start with any server-provided image, then add computed variants
          const computed = getStarPowerImageVariants(data.brawler, data.starPowerName);
          const prefixed: string[] = [];
          if (data.image) prefixed.push(data.image);
          const variants = Array.from(new Set([...prefixed, ...computed]));
          console.log('Generated star power image variants:', variants);
          setImageVariants(variants);
          setCurrentVariantIndex(0);
          if (variants.length > 0) {
            setStarPowerImage(variants[0]);
          } else {
            setStarPowerImage('');
          }
          setImageLoaded(false); // Reset image loaded state
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
      } finally {
        setIsLoading(false);
      }
    };

    loadStarPowerData();
  }, []);

  // Check completion status
  useEffect(() => {
    if (starpower.isCompleted) {
      setIsGameOver(true);
      setShowVictoryScreen(true);
    }
  }, [starpower.isCompleted]);

  const getCorrectBrawler = () => {
    if (starPowerData?.brawler) {
      return brawlers.find(b => b.name.toLowerCase() === starPowerData.brawler.toLowerCase()) || brawlers[0];
    }
    return brawlers.find(b => b.name.toLowerCase() === starpower.brawlerName.toLowerCase()) || brawlers[0];
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

  // Handle brawler selection
  const handleSelectBrawler = (brawler: any) => {
    setSelectedBrawler(brawler);
    setInputValue(getBrawlerDisplayName(brawler, currentLanguage));
  };

  // Handle guess submission
  const handleSubmit = useCallback(() => {
    if (!selectedBrawler || !starPowerData || isSubmitting || guessedBrawlerNames.includes(selectedBrawler.name)) {
      return;
    }
    
    setIsSubmitting(true);
    // Atomic submit to reduce renders and avoid double increments
    const newGuess = selectedBrawler;
    submitGuess('starpower', newGuess);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = selectedBrawler.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('starpower');
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
  }, [selectedBrawler, starPowerData, guessedBrawlerNames, submitGuess, completeMode, currentLanguage, getCorrectBrawler]);

  // Handle next mode navigation
  const handleNextMode = () => {
    onModeChange('audio');
  };

  // Handle play again
  const handlePlayAgain = () => {
    setIsGameOver(false);
    setShowVictoryScreen(false);
    setShowConfetti(false);
    setInputValue('');
    setSelectedBrawler(null);
    resetGuessCount('starpower');
  };

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
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
    <div className="daily-starpower-theme">
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
          <DailyModeProgress currentMode="starpower" className="mb-6 mt-1" onModeChange={onModeChange} />

          {/* Title */}
          <div className="text-center mb-2 mt-2">
            <ModeTitle title={t('mode.starpower')} />
          </div>
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
                  <SecondaryButton
                    onClick={() => navigate('/')}
                  >
                    {t('daily.go.home')}
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleNextMode}
                    className="px-8 py-3"
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
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              // Game Content
              <div className="daily-mode-game-area">
                {/* Star Power Image */}
                <div className="flex justify-center mb-6">
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-purple-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                    {starPowerImage ? (
                      <Image
                        src={starPowerImage}
                        fallbackSrc={imageVariants[currentVariantIndex + 1] || '/shelly_starpower_01.png'}
                        alt="Mystery Star Power"
                        className="w-full h-full object-contain"
                        onLoadComplete={handleImageLoad}
                        onLoadError={() => handleImageError()}
                        priority
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
                    disabled={starpower.isCompleted}
                    disabledBrawlers={guessedBrawlerNames}
                  />
                </div>

                {/* Guesses Counter */}
                <div className="flex justify-center mb-4">
                  <div className="daily-mode-guess-counter flex items-center">
                    <span className="font-bold text-lg mr-1">#</span>
                    <div className="font-bold text-lg">
                      <SlidingNumber value={starpower.guessCount} />
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
                      {t('daily.yesterday.starpower')}{' '}
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyStarPowerModeContent;
