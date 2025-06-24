import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Check, X, Infinity as InfinityIcon } from 'lucide-react';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler } from '@/data/brawlers';
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

// Helper function to get the next mode key for the VictorySection
const getNextModeKey = (currentMode: string) => {
  const modes = ['classic', 'gadget', 'starPower', 'audio'];
  const currentIndex = modes.indexOf(currentMode);
  return modes[(currentIndex + 1) % modes.length];
};

// Helper to get gadget image path
const getGadgetImage = (brawler: string, gadgetName?: string): string => {
  // If no brawler provided, use a specific default brawler's gadget instead of generic GadgetIcon
  if (!brawler) {
    // Return a specific brawler's gadget image as fallback
    return `/GadgetImages/shelly_gadget_01.png`;
  }
  
  // Clean up brawler name for file path
  const normalizedBrawler = brawler.toLowerCase().replace(/ /g, '_');
  
  // First, try to determine the base gadget number from the name
  let baseNum = '01';
  if (gadgetName) {
    // Look for numbers in the gadget name
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
  const variant2 = `/GadgetImages/${normalizedBrawler}_gadget_${baseNum.replace(/^0+/, '')}.png`; // Try without leading zeros
  
  // Blacklist check - NEVER return GadgetIcon.png or GadgetIcon (1).png
  const isBannedImage = (path: string) => {
    return path.includes('GadgetIcon.png') || 
           path.includes('GadgetIcon (1).png') || 
           path === '/GadgetIcon.png' || 
           path === '/GadgetIcon (1).png';
  };
  
  // Check if either variant is banned
  if (isBannedImage(variant1) || isBannedImage(variant2)) {
    // If banned, return a known good gadget image
    return `/GadgetImages/shelly_gadget_01.png`;
  }
  
  // Randomly choose between the two variants
  return Math.random() < 0.5 ? variant1 : variant2;
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
    // Only use the daily challenge if not in endless mode or survival mode
    if (!isEndlessMode && !isSurvivalMode) {
      loadChallenge();
    }
    // If in survival mode, the challenge will be loaded by the brawlerId effect
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
              selectedBrawler = brawlers[0] || { 
                id: 1, 
                name: 'Shelly',
                rarity: 'Starter',
                class: 'Damage Dealer',
                movement: 'Fast',
                range: 'Long',
                reload: 'Normal',
                wallbreak: 'No', // must be string
                starPowers: [], // correct property name
                gadgets: []
              };
              console.warn('No valid brawlers found in data, using hardcoded Shelly');
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
      }
    } catch (error) {
      console.error('Error loading gadget challenge:', error);
      setIsLoading(false);
      toast.error('Error loading challenge');
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
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
              {gadgetImage ? (
                <img
                  src={dailyChallenge?.image || '/GadgetImages/shelly_gadget_01.png'}
                  alt="Brawler Gadget"
                  className="w-full h-full object-contain transform transition-all duration-300 hover:scale-105"
                  onError={(e) => {
                    console.log('Image load failed. Using fallback gadget image.');
                    // Use a specific brawler's gadget image instead of generic GadgetIcon
                    e.currentTarget.src = '/GadgetImages/shelly_gadget_01.png';
                    
                    // If that fails too, try another specific brawler's gadget
                    e.currentTarget.onerror = () => {
                      console.log('First fallback failed, trying another brawler gadget');
                      e.currentTarget.src = '/GadgetImages/colt_gadget_01.png';
                      
                      // If all fallbacks fail, hide the image
                      e.currentTarget.onerror = () => {
                        console.log('All fallback images failed, hiding image');
                        e.currentTarget.style.display = 'none';
                      };
                    };
                  }}
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
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mb-4 max-w-md mx-auto px-2">
            <BrawlerAutocomplete
              brawlers={brawlers} 
              value={guess}
              onChange={setGuess}
              onSelect={handleBrawlerSelect}
              onSubmit={handleGuess}
              disabled={showResult}
              disabledBrawlers={guesses}
            />
          </form>

          {/* Guess Counter */}
          <div className="w-full flex justify-center gap-4 mt-4">
            {isSurvivalMode ? (
              <div className="flex items-center gap-2 bg-black/70 border-2 border-brawl-yellow px-6 py-2 rounded-full shadow-xl animate-pulse">
                <span className="text-lg font-bold text-brawl-yellow">
                  {guessesLeft} {guessesLeft === 1 ? 'Guess' : 'Guesses'} Left
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-black/70 border-2 border-brawl-yellow px-6 py-2 rounded-full shadow-xl">
                <span className="text-lg font-bold text-brawl-yellow">
                  {attempts}/{maxGuesses} Guesses
                </span>
              </div>
            )}
          </div>

          {/* Previous Guesses */}
          {guesses.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Previous Guesses:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {guesses.map((prevGuess, index) => (
                  <div key={index} className="flex items-center gap-2 bg-red-900/50 border border-red-500 px-3 py-1 rounded-lg">
                    <img
                      src={getPortrait(prevGuess)}
                      alt={prevGuess}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        console.log(`Failed to load portrait for ${prevGuess}, trying fallback`);
                        e.currentTarget.src = DEFAULT_PORTRAIT;
                        e.currentTarget.onerror = () => {
                          console.log(`Failed to load fallback portrait for ${prevGuess}, hiding image`);
                          e.currentTarget.style.display = 'none';
                        };
                      }}
                    />
                    <span className="text-sm text-white">{prevGuess}</span>
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                ))}
              </div>
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
            {!isSurvivalMode && !skipVictoryScreen && (
              <div ref={victoryRef}>
                <VictorySection
                  isCorrect={isCorrect}
                  correctBrawler={victoryBrawler}
                  attempts={attempts}
                  maxAttempts={maxGuesses}
                  nextModeKey={getNextModeKey('gadget')}
                  gameMode="gadget"
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
