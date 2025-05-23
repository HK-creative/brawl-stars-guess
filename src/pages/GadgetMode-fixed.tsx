import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Check, X, Home, Infinity as InfinityIcon } from 'lucide-react';
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
// No default gadget image for the guessing game; only show image if it exists.

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
          onRoundEnd({ success: false });
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

          {/* Guess Counter (moved here) */}
          <div className="w-full flex justify-center gap-4 mt-4">
            {isSurvivalMode ? (
              <div className="flex items-center gap-2 bg-black/70 border-2 border-brawl-yellow px-6 py-2 rounded-full shadow-xl animate-pulse">
                <span className="text-brawl-yellow text-lg font-bold tracking-wide">Guesses Left</span>
                <span className={`text-2xl font-extrabold ${guessesLeft <= 2 ? 'text-brawl-red animate-bounce' : 'text-white'}`}>{guessesLeft}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-4 py-1 rounded-full shadow-lg">
                <span className="text-white text-base font-semibold">Number of Guesses</span>
                <span className="text-white text-base font-bold">{attempts}</span>
              </div>
            )}
          </div>
        </div>

        {/* Previous Guesses */}
        <div className="w-full max-w-md mx-auto mb-6 px-2">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-4 md:gap-y-3">
            {guesses.map((pastGuess, idx) => {
              const isCorrect = pastGuess.toLowerCase() === dailyChallenge?.brawler.toLowerCase();
              const isLastGuess = idx === guesses.length - 1;
              return (
                <li
                  key={idx}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 md:py-4 rounded-2xl border-2 transition-all duration-300 animate-fade-in w-36 md:w-40 mx-auto md:min-h-[120px]",
                    isCorrect ? "bg-brawl-green border-yellow-400" : "bg-brawl-red border-yellow-400",
                    !isCorrect && isLastGuess ? "animate-shake" : ""
                  )}
                  style={{ minHeight: '81px' }}
                >
                  <img
                    src={getPortrait(pastGuess)}
                    alt={pastGuess}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-xl object-cover border border-yellow-400 shadow-lg mx-auto"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-base md:text-2xl font-extrabold text-white text-center mt-2 truncate w-full" style={{ lineHeight: 1.1 }}>
                    {pastGuess}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Victory popup - only show if not in survival mode */}
        {isGameOver && dailyChallenge && !skipVictoryScreen && (
          <div ref={victoryRef} className="w-full">
            <VictorySection
              brawlerName={victoryBrawler || correctBrawler || correctBrawlerName || dailyChallenge.brawler}
              brawlerPortrait={getPortrait(victoryBrawler || correctBrawler || correctBrawlerName || dailyChallenge.brawler)}
              tries={guesses.length}
              mode="gadget"
              nextModeKey={getNextModeKey('gadget')}
              onNextMode={() => {
                const nextMode = getNextModeKey('gadget');
                navigate(`/${nextMode}`);
              }}
              nextBrawlerIn={timeUntilNext}
              onShare={() => {
                const shareText = `I guessed the correct brawler in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Brawl Stars Guess',
                    text: shareText,
                    url: window.location.href,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
                  toast.success('Link copied to clipboard!');
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GadgetMode;
