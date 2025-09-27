import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t, getLanguage } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Check, X, Infinity as InfinityIcon } from 'lucide-react';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler, getBrawlerDisplayName } from '@/data/brawlers';
import { toast } from 'sonner';
import { fetchDailyChallenge, getTimeUntilNextChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { getPortrait, getPin, DEFAULT_PIN, DEFAULT_PORTRAIT, getGadgetImagePath } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import VictorySection from '../components/VictoryPopup';
import ReactConfetti from 'react-confetti';
import { useIsMobile } from "@/hooks/use-mobile";
import GameModeTracker from '@/components/GameModeTracker';
import HomeButton from '@/components/ui/home-button';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SlidingNumber } from '@/components/ui/sliding-number';

// Helper function to get the next mode key for the VictorySection
const getNextModeKey = (currentMode: string) => {
  const modes = ['classic', 'gadget', 'starPower', 'audio'];
  const currentIndex = modes.indexOf(currentMode);
  return modes[(currentIndex + 1) % modes.length];
};

// Helper to get gadget image path (centralized)
const getGadgetImage = (brawler: string, gadgetName?: string): string => {
  if (!brawler) return `/GadgetImages/shelly_gadget_01.png`;
  return getGadgetImagePath(brawler, gadgetName);
};

interface GadgetChallenge {
  brawler: string;
  gadgetName: string;
  tip: string;
  image?: string; // Not always present, so we build it
}

const modeOrder = [
  { name: 'Classic Mode', route: '/classic' },
  { name: 'Audio Mode', route: '/audio' },
  { name: 'Gadget Mode', route: '/gadget' },
  { name: 'Star Power Mode', route: '/starpower' },
];

interface GadgetModeProps {
  brawlerId?: number;
  onRoundEnd?: (result: { success: boolean, brawlerName?: string }) => void;
  maxGuesses?: number;
  isEndlessMode?: boolean;
  isSurvivalMode?: boolean;
  skipVictoryScreen?: boolean;
}

const GadgetMode = ({
  brawlerId,
  onRoundEnd,
  maxGuesses = 6,
  isEndlessMode: propIsEndlessMode = false,
  isSurvivalMode = false,
  skipVictoryScreen = false
}: GadgetModeProps = {}) => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [attempts, setAttempts] = useState(0);
  // Survival Mode: Track guesses left
  const [guessesLeft, setGuessesLeft] = useState(maxGuesses);
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<GadgetChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [gadgetImage, setGadgetImage] = useState<string>('');
  const [correctBrawler, setCorrectBrawler] = useState<string>('');
  // This state variable is exclusively for tracking which brawler was correctly guessed for the victory screen
  const [victoryBrawler, setVictoryBrawler] = useState<string>('');
  const [actualBrawlerForGadget, setActualBrawlerForGadget] = useState<Brawler | null>(null);
  const [yesterdayGadget, setYesterdayGadget] = useState<{ image: string, brawler: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [correctBrawlerName, setCorrectBrawlerName] = useState<string>('');
  const [correctGadgetName, setCorrectGadgetName] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEndlessMode, setIsEndlessMode] = useState(propIsEndlessMode);
  // Track recently used brawlers to prevent repetition within 3 rounds
  const [recentlyUsedBrawlers, setRecentlyUsedBrawlers] = useState<string[]>([]);
  const [selectedGadget, setSelectedGadget] = useState<any>(null);
  const victoryRef = useRef<HTMLDivElement>(null);
  const [gameKey, setGameKey] = useState(Date.now().toString()); // Key to force re-render
  const navigate = useNavigate();
  const { motionOK, transition } = useMotionPrefs();

  // Confetti window size
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CRITICAL: This effect detects when brawlerId changes and resets the game
  useEffect(() => {
    console.log(`BrawlerId changed to: ${brawlerId}`);
    
    // Reset game state for the new brawler
    setGuess('');
    setGuesses([]);
    setIsCorrect(false);
    setSelectedBrawler(null);
    setAttempts(0);
    setShowResult(false);
    setIsGameOver(false);
    setGuessCount(0);
    setShowConfetti(false);
    setGuessesLeft(maxGuesses); // Reset guesses left for new round
    
    // Generate a new key to force complete component re-initialization
    setGameKey(Date.now().toString());
    
    // Load the new challenge with the changed brawlerId
    loadChallenge();
  }, [brawlerId, maxGuesses]); // Also re-run if maxGuesses changes

  // Update countdown for challenges
  useEffect(() => {
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Confetti effect for correct guesses
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Load the challenge on component mount
  useEffect(() => {
    // Load challenge for all modes except when explicitly in survival mode with a brawlerId
    if (!isSurvivalMode || brawlerId === undefined) {
      loadChallenge();
    }
    // If in survival mode with brawlerId, the challenge will be loaded by the brawlerId effect
  }, [isEndlessMode, isSurvivalMode]);

  const loadChallenge = async () => {
    setIsLoading(true);
    
    try {
      // If we're in survival mode, use the brawlerId to determine the challenge
      if (isSurvivalMode && brawlerId !== undefined) {
        console.log(`Loading survival challenge with brawlerId: ${brawlerId}`);
        
        try {
          // Try to find the brawler with the exact ID
          let selectedBrawler = brawlers.find(b => b.id === brawlerId);
          
          // If brawler with the ID doesn't exist, use a fallback
          if (!selectedBrawler) {
            console.error(`Brawler with ID ${brawlerId} not found in data. Using fallback.`);
            
            // Try to find Shelly as a fallback (ID 1)
            selectedBrawler = brawlers.find(b => b.id === 1);
            
            // If even Shelly isn't found, pick a random brawler
            if (!selectedBrawler && brawlers.length > 0) {
              const randomIndex = Math.floor(Math.random() * brawlers.length);
              selectedBrawler = brawlers[randomIndex];
              console.log(`Using random brawler as fallback: ${selectedBrawler.name}`);
            }
            
            if (!selectedBrawler) {
              // Create a fallback brawler if nothing else works
              selectedBrawler = brawlers[0] || brawlers.find(b => b.name === 'Shelly') || brawlers.find(b => b.id === 1);
              
              if (!selectedBrawler && brawlers.length > 0) {
                selectedBrawler = brawlers[0];
              }
              
              console.warn('No valid brawlers found in data, using fallback');
            }
          }
          
          // Set the selected brawler as the correct one
          setVictoryBrawler(selectedBrawler.name);
          setCorrectBrawlerName(selectedBrawler.name);
          
          console.log(`Getting gadget for brawler: ${selectedBrawler.name} (ID: ${selectedBrawler.id})`);
          
          // Always get the brawler object from your data
          const actualBrawler = brawlers.find(b => b.id === selectedBrawler.id);
          let selectedGadget = null;
          let gadgetImage = '';
          if (actualBrawler && actualBrawler.gadgets && actualBrawler.gadgets.length > 0) {
            // Pick a random gadget from the brawler's gadgets
            selectedGadget = actualBrawler.gadgets[Math.floor(Math.random() * actualBrawler.gadgets.length)];
            
            // Get the image for this gadget
            gadgetImage = getGadgetImage(actualBrawler.name, selectedGadget.name);
            console.log(`Using gadget image: ${gadgetImage}`);
          } else {
            console.warn(`No gadgets found for brawler: ${selectedBrawler.name}. Using default.`);
            gadgetImage = getGadgetImage(selectedBrawler.name);
          }
          
          setGadgetImage(gadgetImage);
          setCorrectBrawler(actualBrawler?.name || selectedBrawler.name);
          setActualBrawlerForGadget(actualBrawler);
          setSelectedGadget(selectedGadget);
  
          // Create gadget challenge object
          const gadgetChallenge: GadgetChallenge = {
            brawler: actualBrawler ? actualBrawler.name : selectedBrawler.name,
            gadgetName: selectedGadget ? selectedGadget.name : 'Unknown Gadget',
            tip: selectedGadget && selectedGadget.tip ? selectedGadget.tip : `Special gadget for ${actualBrawler ? actualBrawler.name : selectedBrawler.name}.`,
            image: gadgetImage
          };
  
          setDailyChallenge(gadgetChallenge);
          setVictoryBrawler(gadgetChallenge.brawler);
        } finally {
          setIsLoading(false);
        }
        return; // Exit early for survival mode
      }
      
      // For daily/endless mode, fetch the daily challenge
      if (!isEndlessMode) {
        console.log('Loading daily gadget challenge');
        
        try {
          const challengeData = await fetchDailyChallenge('gadget');
          if (challengeData && typeof challengeData === 'object' && challengeData.brawler) {
            console.log('Daily challenge data:', challengeData);
            
            const gadgetChallenge: GadgetChallenge = {
              brawler: challengeData.brawler,
              gadgetName: challengeData.gadgetName || 'Mystery Gadget',
              tip: challengeData.tip || 'This gadget has special powers.',
              image: challengeData.image || getGadgetImage(challengeData.brawler, challengeData.gadgetName)
            };
            
            setDailyChallenge(gadgetChallenge);
            setCorrectBrawlerName(challengeData.brawler);
            setVictoryBrawler(challengeData.brawler);
            setGadgetImage(gadgetChallenge.image);
            
            // Find the actual brawler object
            const actualBrawler = brawlers.find(b => b.name === challengeData.brawler);
            setActualBrawlerForGadget(actualBrawler || null);
          } else {
            throw new Error('Invalid challenge data received');
          }
        } catch (error) {
          console.error('Error fetching daily gadget challenge:', error);
          toast.error('Error loading daily challenge');
        }
      } else {
        // For endless mode, pick a random brawler
        console.log('Loading random gadget for endless mode');
        
        // Filter out recently used brawlers
        const availableBrawlers = brawlers.filter(b => !recentlyUsedBrawlers.includes(b.name));
        const selectedBrawler = availableBrawlers.length > 0 
          ? availableBrawlers[Math.floor(Math.random() * availableBrawlers.length)]
          : brawlers[Math.floor(Math.random() * brawlers.length)];
          
        if (selectedBrawler && selectedBrawler.gadgets && selectedBrawler.gadgets.length > 0) {
          const selectedGadget = selectedBrawler.gadgets[Math.floor(Math.random() * selectedBrawler.gadgets.length)];
          const gadgetImage = getGadgetImage(selectedBrawler.name, selectedGadget.name);
          
          const gadgetChallenge: GadgetChallenge = {
            brawler: selectedBrawler.name,
            gadgetName: selectedGadget.name,
            tip: selectedGadget.tip || 'This gadget has special powers.',
            image: gadgetImage
          };
          
          setDailyChallenge(gadgetChallenge);
          setCorrectBrawlerName(selectedBrawler.name);
          setVictoryBrawler(selectedBrawler.name);
          setGadgetImage(gadgetImage);
          setActualBrawlerForGadget(selectedBrawler);
          setSelectedGadget(selectedGadget);
        }
      }
    } catch (error) {
      console.error('Error loading gadget challenge:', error);
      toast.error('Error loading challenge');
    } finally {
      setIsLoading(false);
    }
  };

  // Update countdown function
  const updateCountdown = () => {
    const nextTime = getTimeUntilNextChallenge();
    setTimeUntilNext({
      hours: nextTime.hours,
      minutes: nextTime.minutes,
      seconds: 0
    });
  };
  
  const resetGame = () => {
    setGuess('');
    setGuesses([]);
    setIsCorrect(false);
    setSelectedBrawler(null);
    setAttempts(0);
    setShowResult(false);
    setIsGameOver(false);
    setGuessCount(0);
    setShowConfetti(false);
    
    // If a brawler was used in this round, add it to recently used list
    if (correctBrawler) {
      // Add current brawler to recently used and keep only the last 2
      setRecentlyUsedBrawlers(prev => {
        const updated = [correctBrawler, ...prev].slice(0, 2);
        console.log('Recently used brawlers (will be avoided):', updated);
        return updated;
      });
    }
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
      setGuess(brawler.name);
    }
  };

  // Function to handle making a guess
  const handleGuess = () => {
    // Don't process empty guesses
    if (!guess || !dailyChallenge) return;

    // Add the guess to the list
    setGuesses([...guesses, guess]);
    setAttempts(attempts + 1);
    
    // Update guesses left for survival mode
    if (isSurvivalMode) {
      setGuessesLeft(prev => prev - 1);
    }

    // Check if the guess is correct
    const isGuessCorrect = guess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    
    if (isGuessCorrect) {
      setIsCorrect(true);
      setShowResult(true);
      setIsGameOver(true);
      setShowConfetti(true);
      
      // Call the onRoundEnd callback if provided (for survival mode)
      if (onRoundEnd) {
        onRoundEnd({ success: true, brawlerName: dailyChallenge.brawler });
      }
      
      toast.success('Correct! You guessed the brawler!');
    } else {
      // If incorrect and out of guesses, show the result
      const outOfGuesses = isSurvivalMode ? guessesLeft <= 1 : attempts + 1 >= maxGuesses;
      
      if (outOfGuesses) {
        setShowResult(true);
        setIsGameOver(true);
        
        // Call the onRoundEnd callback if provided (for survival mode)
        if (onRoundEnd) {
          onRoundEnd({ success: false, brawlerName: dailyChallenge.brawler });
        }
        
        toast.error(`Game over! The correct brawler was ${dailyChallenge.brawler}.`);
      } else {
        toast.error('Incorrect! Try again.');
      }
    }
    
    // Clear input after guessing
    setGuess('');
    setSelectedBrawler(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brawl-yellow mb-4"></div>
        <p className="text-white text-lg">Loading challenge...</p>
      </div>
    );
  }

  return (
    <div key={gameKey} className="relative">
      {/* Confetti effect for correct guesses */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* Only show the infinite mode toggle if not in survival mode */}
      {!isSurvivalMode && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {!isEndlessMode ? (
              <span className="text-sm text-white/60">Daily Challenge</span>
            ) : (
              <span className="text-sm text-white/60">Endless Mode</span>
            )}
            <div className="flex items-center gap-1">
              <Switch 
                checked={isEndlessMode}
                onCheckedChange={(checked) => {
                  setIsEndlessMode(checked);
                  resetGame();
                }}
                className="data-[state=checked]:bg-amber-500"
              />
              <InfinityIcon className="h-4 w-4 text-white/60" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-[70vh] w-full max-w-2xl mx-auto">
        {/* Main Challenge Content */}
        <div className="flex-1 mb-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-3">
            Guess the Brawler with this Gadget
          </h1>
          
          {/* Gadget Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-green-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl mb-4">
              {dailyChallenge?.image ? (
                <Image
                  src={dailyChallenge?.image || '/GadgetImages/shelly_gadget_01.png'}
                  fallbackSrc="/GadgetImages/colt_gadget_01.png"
                  alt="Brawler Gadget"
                  className="w-full h-full object-contain transform transition-all duration-300 hover:scale-105"
                  priority
                />
              ) : null}
            </div>
            
            {/* Gadget Name (shown if game is over) */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-extrabold text-brawl-yellow mb-2">
                {showResult ? dailyChallenge?.gadgetName : ""}
              </h2>
              {/* Only show the tip when the game is over */}
              {showResult && dailyChallenge && (
                <p className="text-sm md:text-base text-white/80 max-w-md mx-auto italic">
                  "{dailyChallenge.tip}"
                </p>
              )}
            </div>
          </div>
          
          {/* Search Bar - Match Daily Mode exactly */}
          <div className="daily-mode-input-section mb-8 w-full max-w-md mx-auto">
            <BrawlerAutocomplete
              brawlers={brawlers}
              value={guess}
              onChange={setGuess}
              onSelect={handleBrawlerSelect}
              onSubmit={handleGuess}
              disabled={showResult}
              disabledBrawlers={guesses}
            />
          </div>

          {/* Guess Counter */}
          <div className="w-full flex justify-center gap-4 mt-4">
            <motion.div
              className="contents"
              initial={motionOK ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
            >
              {isSurvivalMode ? (
                <div className="daily-mode-guess-counter flex items-center">
                  <span className="font-bold text-sm mr-1">#</span>
                  <div className={cn(
                    "font-bold text-sm",
                    Math.max(0, guessesLeft) <= 3 ? "text-red-300" : "text-white"
                  )}>
                    <SlidingNumber value={Math.max(0, guessesLeft)} />
                  </div>
                  <span className="text-white/90 ml-1 text-sm">{t('guesses.left')}</span>
                </div>
              ) : (
                <div className="daily-mode-guess-counter flex items-center">
                  <span className="font-bold text-sm mr-1">#</span>
                  <div className="font-bold text-sm">
                    <SlidingNumber value={attempts} padStart />
                  </div>
                  <span className="text-white/90 ml-1 text-sm">{t('number.of.guesses')}</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Previous Guesses - Match Daily Mode exactly */}
          {guesses.length > 0 && (
            <div className="daily-mode-guesses-section">
              <motion.div className="daily-mode-guesses-grid" layout>
                {guesses.map((guess, index) => {
                  const isCorrect = guess.toLowerCase() === dailyChallenge?.brawler.toLowerCase();
                  const portraitSrc = getPortrait(guess) || DEFAULT_PORTRAIT;
                  const isNewest = index === 0; // The newest guess is always at index 0
                  const currentLanguage = getLanguage();
                  
                  if (isNewest) {
                    // Only the newest guess gets entrance animation
                    return (
                      <motion.div
                        key={guess} // Use stable key based on name, not index
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
                          alt={guess}
                          className="daily-mode-guess-portrait"
                        />
                        <span className="daily-mode-guess-name">
                          {guess}
                        </span>
                      </motion.div>
                    );
                  } else {
                    // Existing guesses just get layout animations for repositioning
                    return (
                      <motion.div
                        key={guess} // Stable key
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
                          alt={guess}
                          className="daily-mode-guess-portrait"
                        />
                        <span className="daily-mode-guess-name">
                          {guess}
                        </span>
                      </motion.div>
                    );
                  }
                })}
              </motion.div>
            </div>
          )}
        </div>

        {/* Result Section */}
        {showResult && (
          <div className="mt-8">
            {isCorrect ? (
              <div className="text-center">
                <div className="bg-green-900/50 border-2 border-green-500 rounded-lg p-6 mb-4">
                  <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-400 mb-2">Correct!</h2>
                  <p className="text-white">You guessed {dailyChallenge?.brawler} in {attempts} {attempts === 1 ? 'guess' : 'guesses'}!</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-6 mb-4">
                  <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h2>
                  <p className="text-white mb-4">The correct answer was:</p>
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src={getPortrait(dailyChallenge?.brawler || '')}
                      alt={dailyChallenge?.brawler}
                      className="w-12 h-12 rounded-full border-2 border-brawl-yellow"
                    />
                    <span className="text-xl font-bold text-brawl-yellow">{dailyChallenge?.brawler}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Victory Section - only show if not in survival mode or if skipVictoryScreen is false */}
            {!isSurvivalMode && !skipVictoryScreen && isCorrect && (
              <div ref={victoryRef}>
                <VictorySection
                  brawlerName={victoryBrawler}
                  brawlerPortrait={getPortrait(victoryBrawler)}
                  tries={attempts}
                  mode="gadget"
                  nextModeKey={getNextModeKey('gadget')}
                  onNextMode={() => navigate(`/${getNextModeKey('gadget')}`)}
                  nextBrawlerIn={timeUntilNext}
                  yesterdayBrawlerName={yesterdayGadget?.brawler}
                  yesterdayBrawlerPortrait={yesterdayGadget?.brawler ? getPortrait(yesterdayGadget.brawler) : undefined}
                  yesterdayLabel="Yesterday's Gadget"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GadgetMode;
