import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t, getLanguage } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Check, X, Infinity as InfinityIcon, Share2, Clock } from 'lucide-react';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler, getBrawlerDisplayName } from '@/data/brawlers';
import { toast } from 'sonner';
import { fetchDailyChallenge, getTimeUntilNextChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { getPortrait, getPin, DEFAULT_PIN, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import VictorySection from '../components/VictoryPopup';
import ReactConfetti from 'react-confetti';
import { useIsMobile } from "@/hooks/use-mobile";
import GameModeTracker from '@/components/GameModeTracker';
import HomeButton from '@/components/ui/home-button';
import ShareResultModal from '@/components/ShareResultModal';
import PixelatedImage from '@/components/PixelatedImage';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SlidingNumber } from '@/components/ui/sliding-number';

// Helper function to get the next mode key for the VictorySection
const getNextModeKey = (currentMode: string) => {
  const modes = ['classic', 'gadget', 'starPower', 'audio', 'pixels'];
  const currentIndex = modes.indexOf(currentMode);
  return modes[(currentIndex + 1) % modes.length];
};

interface PixelsChallenge {
  brawler: string;
  tip: string;
}

const modeOrder = [
  { name: 'Classic Mode', route: '/classic' },
  { name: 'Audio Mode', route: '/audio' },
  { name: 'Gadget Mode', route: '/gadget' },
  { name: 'Star Power Mode', route: '/starpower' },
  { name: 'Pixels Mode', route: '/pixels' },
];

interface PixelsModeProps {
  brawlerId?: number;
  onRoundEnd?: (result: { success: boolean, brawlerName?: string }) => void;
  maxGuesses?: number;
  isEndlessMode?: boolean;
  isSurvivalMode?: boolean;
  skipVictoryScreen?: boolean;
}

const PixelsMode = ({
  brawlerId,
  onRoundEnd,
  maxGuesses = 6,
  isEndlessMode: propIsEndlessMode = false,
  isSurvivalMode = false,
  skipVictoryScreen = false
}: PixelsModeProps) => {
  const navigate = useNavigate();
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [guessesLeft, setGuessesLeft] = useState(maxGuesses);
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<PixelsChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [portraitImage, setPortraitImage] = useState<string>('');
  const [correctBrawler, setCorrectBrawler] = useState<string>('');
  const [victoryBrawler, setVictoryBrawler] = useState<string>('');
  const [actualBrawlerForPixels, setActualBrawlerForPixels] = useState<Brawler | null>(null);
  const [yesterdayPixels, setYesterdayPixels] = useState<{ image: string, brawler: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [correctBrawlerName, setCorrectBrawlerName] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEndlessMode, setIsEndlessMode] = useState(propIsEndlessMode);
  const [recentlyUsedBrawlers, setRecentlyUsedBrawlers] = useState<string[]>([]);
  const [selectedPixels, setSelectedPixels] = useState<any>(null);
  const victoryRef = useRef<HTMLDivElement>(null);
  const [gameKey, setGameKey] = useState(Date.now().toString());
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const currentLanguage = getLanguage();
  // Motion preferences for consistent, reduced-motion-aware animations
  const { motionOK, transition } = useMotionPrefs();

  // Function to update countdown
  const updateCountdown = () => {
    const nextTime = getTimeUntilNextChallenge();
    setTimeUntilNext({
      hours: nextTime.hours,
      minutes: nextTime.minutes,
      seconds: 0
    });
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGuess();
  };

  // Function to handle selecting a brawler from autocomplete
  const handleBrawlerSelect = (brawler: Brawler | null) => {
    setSelectedBrawler(brawler);
    if (brawler) {
      const displayName = getBrawlerDisplayName(brawler, currentLanguage);
      setGuess(displayName);
      // Immediately submit the guess
      setTimeout(() => handleGuess(), 0);
    }
  };

  // Calculate pixelation level based on guess count
  const getPixelationLevel = () => {
    if (isCorrect) return 6; // Show clearest image when correct
    // Start with maximum pixelation (0) and increase level with each guess to make it clearer
    // Level 0 = most pixelated, Level 6 = least pixelated
    // Use guesses.length to match daily mode exactly
    return Math.min(6, guesses.length); // 0, 1, 2, 3, 4, 5, 6 (gets clearer each guess)
  };

  // Function to handle making a guess
  const handleGuess = () => {
    if (!guess || !dailyChallenge) return;

    // Find the exact brawler from our data to ensure we use the full correct name
    const exactBrawler = selectedBrawler || brawlers.find(b => 
      getBrawlerDisplayName(b, currentLanguage).toLowerCase() === guess.toLowerCase() ||
      b.name.toLowerCase() === guess.toLowerCase() ||
      b.nameHebrew?.toLowerCase() === guess.toLowerCase()
    );
    
    // Only proceed if we have a valid brawler - this ensures we never use partial names
    if (!exactBrawler) {
      toast.error(t('brawler.not.found'));
      return;
    }

    const displayName = getBrawlerDisplayName(exactBrawler, currentLanguage);
    
    // Check if this brawler has already been guessed
    if (guesses.includes(displayName)) {
      toast.error(t('brawler.already.guessed'));
      return;
    }

    const newGuesses = [...guesses, displayName];
    setGuesses(newGuesses);
    setGuessCount(newGuesses.length);
    setGuessesLeft(maxGuesses - newGuesses.length);

    const isCorrectGuess = exactBrawler.name.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    
    if (isCorrectGuess) {
      setIsCorrect(true);
      setCorrectBrawler(exactBrawler.name);
      setVictoryBrawler(exactBrawler.name);
      setShowConfetti(true);
      
      if (!skipVictoryScreen) {
        setShowResult(true);
      }
      
      // Call onRoundEnd for survival mode
      if (onRoundEnd) {
        onRoundEnd({ success: true, brawlerName: exactBrawler.name });
      }
      
      setTimeout(() => setShowConfetti(false), 3000);
    } else if (newGuesses.length >= maxGuesses) {
      setIsGameOver(true);
      setCorrectBrawler(dailyChallenge.brawler);
      
      if (!skipVictoryScreen) {
        setShowResult(true);
      }
      
      // Call onRoundEnd for survival mode
      if (onRoundEnd) {
        onRoundEnd({ success: false, brawlerName: dailyChallenge.brawler });
      }
    }

    // Reset form
    setGuess('');
    setSelectedBrawler(null);
  };

  // Function to reset the game
  const resetGame = () => {
    setGuess('');
    setGuesses([]);
    setIsCorrect(false);
    setSelectedBrawler(null);
    setAttempts(0);
    setGuessesLeft(maxGuesses);
    setShowResult(false);
    setIsGameOver(false);
    setGuessCount(0);
    setShowConfetti(false);
    setCorrectBrawler('');
    setVictoryBrawler('');
    setGameKey(Date.now().toString());
    
    if (isEndlessMode) {
      loadChallenge();
    }
  };

  // Function to load challenge data
  const loadChallenge = async () => {
    setIsLoading(true);
    try {
      let challengeData;
      
      if (brawlerId && isSurvivalMode) {
        // For survival mode, use the provided brawler ID
        const brawler = brawlers.find(b => b.name.toLowerCase() === brawlers[brawlerId - 1]?.name.toLowerCase()) || brawlers[brawlerId - 1];
        if (brawler) {
          challengeData = {
            brawler: brawler.name,
            tip: "Identify the brawler from this pixelated portrait!"
          };
        }
      } else if (isEndlessMode) {
        // For endless mode, pick a random brawler not recently used
        const availableBrawlers = brawlers.filter(b => !recentlyUsedBrawlers.includes(b.name));
        const randomBrawler = availableBrawlers.length > 0 
          ? availableBrawlers[Math.floor(Math.random() * availableBrawlers.length)]
          : brawlers[Math.floor(Math.random() * brawlers.length)];
        
        challengeData = {
          brawler: randomBrawler.name,
          tip: "Identify the brawler from this pixelated portrait!"
        };
        
        // Update recently used brawlers
        const newRecentlyUsed = [randomBrawler.name, ...recentlyUsedBrawlers].slice(0, 5);
        setRecentlyUsedBrawlers(newRecentlyUsed);
      } else {
        // For daily mode, fetch from API
        challengeData = await fetchDailyChallenge('pixels');
      }

      if (challengeData) {
        setDailyChallenge(challengeData);
        setCorrectBrawlerName(challengeData.brawler);
        
        // Set portrait image
        const imagePath = getPortrait(challengeData.brawler.toLowerCase());
        setPortraitImage(imagePath);
        
        // Find the actual brawler object
        const brawlerObj = brawlers.find(b => b.name.toLowerCase() === challengeData.brawler.toLowerCase());
        setActualBrawlerForPixels(brawlerObj || null);
      }
    } catch (error) {
      console.error('Error loading pixels challenge:', error);
      toast.error('Failed to load challenge');
    } finally {
      setIsLoading(false);
    }
  };

  // Load yesterday's challenge for comparison
  const loadYesterdayChallenge = async () => {
    try {
      const yesterdayData = await fetchYesterdayChallenge('pixels');
      if (yesterdayData) {
        const imagePath = getPortrait(yesterdayData.brawler.toLowerCase());
        setYesterdayPixels({
          image: imagePath,
          brawler: yesterdayData.brawler
        });
      }
    } catch (error) {
      console.error('Error loading yesterday\'s pixels challenge:', error);
    }
  };

  // Initialize component
  useEffect(() => {
    loadChallenge();
    if (!isEndlessMode && !isSurvivalMode) {
      loadYesterdayChallenge();
      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);
      return () => clearInterval(interval);
    }
  }, [brawlerId, isEndlessMode, isSurvivalMode]);

  // Reset game state when brawlerId changes (for survival mode)
  useEffect(() => {
    if (isSurvivalMode && brawlerId) {
      // Reset all game state first
      setGuess('');
      setGuesses([]);
      setIsCorrect(false);
      setSelectedBrawler(null);
      setAttempts(0);
      setGuessesLeft(maxGuesses);
      setShowResult(false);
      setIsGameOver(false);
      setGuessCount(0);
      setShowConfetti(false);
      setCorrectBrawler('');
      setVictoryBrawler('');
      setGameKey(Date.now().toString());
      
      // Then load the new challenge
      loadChallenge();
    }
  }, [brawlerId, isSurvivalMode]);

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!correctBrawlerName) {
    return (
      <Card className="brawl-card p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brawl-yellow mb-2">No Challenge Available</h3>
          <p className="text-white/80">Check back later for today's challenge.</p>
        </div>
      </Card>
    );
  }

  const correctBrawlerObj = brawlers.find(b => b.name.toLowerCase() === correctBrawlerName.toLowerCase()) || brawlers[0];
  const portraitPath = getPortrait(correctBrawlerName);

  return (
    <div className="survival-mode-container survival-pixels-theme">
      {/* Confetti effect for correct guesses */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          onConfettiComplete={() => setShowConfetti(false)}
          className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none"
        />
      )}

      {/* Header Section */}
      <div className="survival-mode-header">
        {/* Top Bar - only show if not in survival mode */}
        {!isSurvivalMode && (
          <div className="absolute top-4 right-4 flex items-center gap-4">
            {!isEndlessMode && (
              <div className="flex items-center gap-2 px-2 py-1 text-white/70">
                <Clock className="h-4 w-4 text-white/60" />
                <span className="text-sm font-medium">
                  Next: {timeUntilNext.hours.toString().padStart(2, '0')}:
                  {timeUntilNext.minutes.toString().padStart(2, '0')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">Endless Mode</span>
              <Switch
                checked={isEndlessMode}
                onCheckedChange={setIsEndlessMode}
              />
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className="survival-mode-title-section">
          <h1 className="survival-mode-title">
            {isSurvivalMode ? 'Survival Pixels' : isEndlessMode ? 'Endless Pixels' : 'Daily Pixels Challenge'}
          </h1>
          

        </div>
      </div>

      {/* Main Content */}
      <div className="survival-mode-content">
        {/* Game Card */}
        <motion.div
          className="survival-mode-game-card survival-mode-animate-pulse"
          layout
          initial={motionOK ? { opacity: 0, scale: 0.98, y: 8 } : { opacity: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          <div className="survival-mode-card-content">
            {/* Victory/Game Over Screen */}
            {showResult && !skipVictoryScreen && (
              <div className="text-center space-y-4">
                <h2 className={cn(
                  "text-3xl font-bold mb-4",
                  isCorrect ? "text-indigo-400" : "text-red-400"
                )}>
                  {isCorrect ? t('daily.congratulations') : 'Game Over!'}
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  {isCorrect ? (
                    <>You correctly identified <span className="text-indigo-400 font-bold">{victoryBrawler}</span>!</>
                  ) : (
                    <>The correct brawler was <span className="text-indigo-400 font-bold">{correctBrawler}</span></>
                  )}
                </p>
                <p className="text-white/70">
                  Guesses: {guesses.length}/{maxGuesses}
                </p>

                {/* Clear Portrait Image */}
                {portraitImage && (
                  <div className="flex justify-center mb-6">
                    <div className="w-48 h-48 rounded-xl overflow-hidden animate-award-card">
                      <PixelatedImage
                        src={portraitImage}
                        alt={correctBrawler || 'Brawler'}
                        pixelationLevel={6}
                         
                        fallbackSrc={DEFAULT_PORTRAIT}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4 items-center justify-center">
                  {isEndlessMode ? (
                    <Button
                      onClick={resetGame}
                      className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white py-4 px-12 text-xl font-bold shadow-xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 border-2 border-emerald-300/50 w-full max-w-sm"
                    >
                      Play Again
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => navigate(`/${getNextModeKey('pixels')}`)}
                        className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white py-4 px-12 text-xl font-bold shadow-xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 border-2 border-emerald-300/50 w-full max-w-sm"
                      >
                        Next Mode
                      </Button>
                      <Button
                        onClick={() => navigate('/')}
                        variant="ghost"
                        className="text-white/40 hover:text-white/60 hover:bg-white/5 py-2 px-6 text-sm border border-white/10 hover:border-white/20 transition-all duration-200"
                      >
                        Home
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Game Screen */}
            {!showResult && dailyChallenge && (
              <div className="survival-mode-input-section">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Identify the brawler from this pixelated portrait!
                  </h2>
                </div>

                {/* Pixelated Portrait Display */}
                <div className="flex justify-center mb-2">
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-pink-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                    {portraitImage ? (
                      <PixelatedImage
                        src={portraitImage}
                        alt="Pixelated Brawler Portrait"
                        pixelationLevel={getPixelationLevel()}
                         
                        fallbackSrc={DEFAULT_PORTRAIT}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        Loading...
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Form */}
                {!isGameOver && !isCorrect && (
                  <div className="w-full max-w-md mx-auto">
                    <BrawlerAutocomplete
                      brawlers={brawlers}
                      value={guess}
                      onChange={setGuess}
                      onSelect={handleBrawlerSelect}
                      onSubmit={handleGuess}
                      disabledBrawlers={guesses}
                    />
                  </div>
                )}

                {/* Guess Counter */}
                <div className="w-full flex justify-center gap-4 mt-2">
                  <motion.div
                    className="contents"
                    initial={motionOK ? { opacity: 0, y: 8 } : { opacity: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transition}
                  >
                    {isSurvivalMode ? (
                      <div className="survival-mode-guess-counter">
                        <span className="text-lg font-bold tracking-wide">{t('guesses.left')}</span>
                        <span className={`text-2xl font-extrabold ${guessesLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
                          <SlidingNumber value={Math.max(0, guessesLeft)} />
                        </span>
                      </div>
                    ) : (
                      <div className="survival-mode-guess-counter">
                        <span className="text-base font-semibold mr-2">{t('number.of.guesses')}</span>
                        <span className="text-base font-bold">
                          <SlidingNumber value={guessCount} padStart />
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Previous Guesses */}
        {guesses.length > 0 && (
          <div className="survival-mode-guesses-section">
            <h3 className="text-lg font-semibold text-white text-center mb-4">Previous Guesses</h3>
            <div className="survival-mode-guesses-grid">
              <AnimatePresence initial={false} mode="popLayout">
                {guesses.map((pastGuess, idx) => {
                  const isCorrectGuess = dailyChallenge && pastGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
                  const isNewest = idx === guesses.length - 1;
                  return (
                    <motion.div
                      key={`${pastGuess}-${guesses.length - idx}`}
                      initial={motionOK && isNewest ? { 
                        opacity: 0, 
                        y: 45,
                        scale: 0.9,
                        filter: "blur(2px)"
                      } : { opacity: 0 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        transition: {
                          type: "spring",
                          stiffness: 350,
                          damping: 25,
                          mass: 0.75,
                          duration: 0.5
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.9,
                        y: -18,
                        transition: { duration: 0.28, ease: "easeInOut" }
                      }}
                      layout
                      transition={{
                        layout: {
                          type: "spring",
                          stiffness: 350,
                          damping: 25,
                          mass: 0.75
                        }
                      }}
                      className={cn(
                        "survival-mode-guess-item",
                        isCorrectGuess ? "survival-mode-guess-correct" : "survival-mode-guess-incorrect",
                        !isCorrectGuess && isNewest ? "animate-shake" : ""
                      )}
                    >
                      <img
                        src={getPortrait(pastGuess)}
                        alt={pastGuess}
                        className="survival-mode-guess-portrait"
                      />
                      <span className="survival-mode-guess-name">
                        {pastGuess}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelsMode;
