import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Home, Check, X, Infinity as InfinityIcon } from 'lucide-react';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler } from '@/data/brawlers';
import { toast } from 'sonner';
import { fetchDailyChallenge, getTimeUntilNextChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { getPortrait, getPin, DEFAULT_PIN } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import ReactConfetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import VictorySection from '../components/VictoryPopup';
import GameModeTracker from '@/components/GameModeTracker';
import HomeButton from '@/components/ui/home-button';

interface StarPowerChallenge {
  brawler: string;
  starPowerName: string;
  tip: string;
  image: string;
}

// Helper to parse brawler name from star power image filename
function parseBrawlerNameFromStarPower(filename: string): string {
  // Example: "colette_starpower_01.png" => "Colette"
  const match = filename.match(/^([a-z0-9]+)_starpower/i);
  if (!match) return '';
  const raw = match[1];
  // Capitalize first letter, handle special cases if needed
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

const modeOrder = [
  { name: 'Classic Mode', route: '/classic' },
  { name: 'Audio Mode', route: '/audio' },
  { name: 'Gadget Mode', route: '/gadget' },
  { name: 'Star Power Mode', route: '/starpower' },
];

interface StarPowerModeProps {
  brawlerId?: number;
  onRoundEnd?: (result: { success: boolean, brawlerName?: string }) => void;
  maxGuesses?: number;
  isEndlessMode?: boolean;
  isSurvivalMode?: boolean;
  skipVictoryScreen?: boolean;
}

const StarPowerMode = ({
  brawlerId,
  onRoundEnd,
  maxGuesses = 6,
  isEndlessMode: propIsEndlessMode = false,
  isSurvivalMode = false,
  skipVictoryScreen = false
}: StarPowerModeProps = {}) => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<StarPowerChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState<{ hours: number; minutes: number; seconds?: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gameKey, setGameKey] = useState(Date.now().toString()); // Key to force re-render

  // Difficulty settings
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Fallback data in case Supabase fetch fails
  const fallbackChallenge: StarPowerChallenge = {
    brawler: "Bo",
    starPowerName: "Circling Eagle",
    tip: "This star power increases Bo's vision range in bushes.",
    image: "bo_starpower_01.png"
  };

  const [starPowerImage, setStarPowerImage] = useState<string>('');
  const [correctBrawlerForVictory, setCorrectBrawlerForVictory] = useState<string>('');
  const [yesterdayStarPower, setYesterdayStarPower] = useState<{ image: string, brawler: string } | null>(null);

  const victoryRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // New state for game over and confetti
  const [isGameOver, setIsGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [isEndlessMode, setIsEndlessMode] = useState(propIsEndlessMode);

  // Add windowSize state for confetti
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CRITICAL: This effect detects when brawlerId changes and resets the game
  useEffect(() => {
    console.log(`StarPowerMode: brawlerId changed to ${brawlerId}`);
    
    // Reset game state when brawlerId changes (critical for Survival Mode)
    setGuess('');
    setGuesses([]);
    setSelectedBrawler(null);
    setAttempts(0);
    setIsCorrect(false);
    setShowResult(false);
    setIsGameOver(false);
    setShowConfetti(false);
    setGuessCount(0);
    
    // Generate a new key to force complete component re-initialization
    setGameKey(Date.now().toString());
    
    // Load the new challenge with the changed brawlerId
    loadChallengeForCurrentMode();
  }, [brawlerId]); // Re-run when brawlerId changes

  // Helper function to get a random star power for a specific brawler
  const getRandomStarPowerForBrawler = (brawlerName: string): StarPowerChallenge => {
    // Find the brawler in our data
    const brawler = brawlers.find(b => b.name.toLowerCase() === brawlerName.toLowerCase());
    if (!brawler || !brawler.starPowers || brawler.starPowers.length === 0) {
      console.log(`No star powers found for brawler: ${brawlerName}, using fallback`);
      return fallbackChallenge;
    }
    
    // Get a random star power
    const randomIndex = Math.floor(Math.random() * brawler.starPowers.length);
    const starPower = brawler.starPowers[randomIndex];
    
    // Generate image path based on naming convention
    // Example: "bo_starpower_01.png"
    // Get the number from the star power name if possible
    let num = '01';
    const match = starPower.name.match(/(\d+)/);
    if (match) {
      num = match[1].padStart(2, '0');
    }
    
    const imageFileName = `${brawler.name.toLowerCase().replace(/ /g, '_')}_starpower_${num}.png`;
    
    return {
      brawler: brawler.name,
      starPowerName: starPower.name,
      tip: starPower.tip || "No tip available",
      image: `/StarPowerImages/${imageFileName}`
    };
  };

  const loadChallengeDetails = () => {
    if (!dailyChallenge) return;
    
    // Update UI states for the challenge
    setStarPowerImage(dailyChallenge.image);
    setCorrectBrawlerForVictory(dailyChallenge.brawler);
    
    // Set difficulty features
    // For standard mode, every 3rd day is grayscale, every 5th day is rotated
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    const shouldBeGrayscale = dayOfMonth % 3 === 0;
    const shouldBeRotated = dayOfMonth % 5 === 0;
    
    setIsGrayscale(shouldBeGrayscale);
    setIsRotated(shouldBeRotated);
    
    if (shouldBeRotated) {
      // Random rotation between -45 and 45 degrees
      setRotation(Math.floor(Math.random() * 90) - 45);
    } else {
      setRotation(0);
    }
    
    console.log("Challenge loaded:", dailyChallenge);
  };

  // Timer update effect
  useEffect(() => {
    const timer = setInterval(() => {
      update();
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Load challenge on mount if not in survival mode
  useEffect(() => {
    if (!isSurvivalMode) {
      loadChallengeForCurrentMode();
    }
    // In survival mode, the challenge is loaded by the brawlerId effect
  }, [isSurvivalMode, isEndlessMode]);
  
  // Update confetti timeout
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Function to load a challenge specific to the current mode
  const loadChallengeForCurrentMode = async () => {
    setIsLoading(true);
    
    try {
      // If we have a specified brawlerId, use that brawler (for SurvivalMode)
      if (brawlerId !== undefined) {
        // Check if the brawlerId is within a valid range
        if (brawlerId <= 0 || brawlerId > brawlers.length) {
          console.warn(`Brawler ID ${brawlerId} is out of range (1-${brawlers.length}). Using fallback.`);
          // Use a fallback brawler (Shelly or first available)
          const fallbackBrawlerId = 1; // Shelly
          const fallbackBrawler = brawlers.find(b => b.id === fallbackBrawlerId) || brawlers[0];
          
          if (fallbackBrawler) {
            console.log(`Using fallback brawler: ${fallbackBrawler.name} instead of invalid ID: ${brawlerId}`);
            const challenge = getRandomStarPowerForBrawler(fallbackBrawler.name);
            setDailyChallenge(challenge);
            loadChallengeDetails();
            setIsLoading(false);
            return;
          }
        }
        
        // If the ID is valid, proceed normally
        const brawlerForId = brawlers.find(b => b.id === brawlerId);
        if (brawlerForId) {
          console.log(`Getting random star power for brawler: ${brawlerForId.name} (ID: ${brawlerId})`);
          const challenge = getRandomStarPowerForBrawler(brawlerForId.name);
          setDailyChallenge(challenge);
          loadChallengeDetails();
          setIsLoading(false);
          return;
        } else {
          // Brawler ID not found - use fallback
          console.error(`Brawler with ID ${brawlerId} not found in data`);
          const fallbackBrawler = brawlers[0];
          console.log(`Using fallback brawler: ${fallbackBrawler.name} after ID not found`);
          const challenge = getRandomStarPowerForBrawler(fallbackBrawler.name);
          setDailyChallenge(challenge);
          loadChallengeDetails();
          setIsLoading(false);
          return;
        }
      }
      
      // For endless mode, use a random brawler's star power
      if (isEndlessMode) {
        // Select a random brawler
        const randomBrawlerIndex = Math.floor(Math.random() * brawlers.length);
        const randomBrawler = brawlers[randomBrawlerIndex];
        const challenge = getRandomStarPowerForBrawler(randomBrawler.name);
        setDailyChallenge(challenge);
        loadChallengeDetails();
        setIsLoading(false);
        return;
      }
      
      // For standard mode, try to fetch from backend
      try {
        const response = await fetchDailyChallenge('starpower');
        if (response?.success) {
          const starpower = response.starpower;
          const challenge: StarPowerChallenge = {
            brawler: starpower.brawler,
            starPowerName: starpower.name,
            tip: starpower.tip || "No tip available",
            image: `/StarPowerImages/${starpower.image || 'default_starpower.png'}`
          };
          setDailyChallenge(challenge);
          
          // Fetch yesterday's challenge for comparison
          fetchYesterday();
        } else {
          throw new Error("Failed to fetch star power challenge");
        }
      } catch (error) {
        console.error("Error fetching star power challenge:", error);
        setDailyChallenge(fallbackChallenge);
        toast("Offline Mode", {
          description: "Using local fallback data as server could not be reached."
        });
      }
      
      loadChallengeDetails();
    } catch (error) {
      console.error("Error loading challenge:", error);
      toast("Error", {
        description: "Something went wrong loading the challenge."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update time and related state
  const update = () => {
    // Update time till next challenge
    const nextTime = getTimeUntilNextChallenge();
    setTimeUntilNext({
      hours: nextTime.hours,
      minutes: nextTime.minutes,
      seconds: 0 // Default to 0 as getTimeUntilNextChallenge doesn't return seconds
    });
  };

  // Fetch yesterday's challenge if needed
  const fetchYesterday = async () => {
    try {
      const yesterdayData = await fetchYesterdayChallenge('starpower');
      if (yesterdayData?.success) {
        setYesterdayStarPower({
          brawler: yesterdayData.starpower.brawler,
          image: getPortrait(yesterdayData.starpower.brawler)
        });
      }
    } catch (error) {
      console.error("Error fetching yesterday's star power:", error);
    }
  };

  const resetGame = () => {
    setGuess('');
    setGuesses([]);
    setSelectedBrawler(null);
    setAttempts(0);
    setIsCorrect(false);
    setShowResult(false);
    setIsGameOver(false);
    setShowConfetti(false);
    setGuessCount(0);
    
    if (isEndlessMode) {
      loadChallengeForCurrentMode();
    }
  };

  const handleGuess = () => {
    if (!dailyChallenge || showResult || !selectedBrawler) return;

    const currentGuess = selectedBrawler.name;
    
    // Check if already guessed
    if (guesses.includes(currentGuess)) {
      toast('Already guessed', {
        description: `You've already guessed ${currentGuess}!`,
      });
      return;
    }

    // Add to guesses
    setGuesses([...guesses, currentGuess]);
    setGuess('');
    setSelectedBrawler(null);
    setAttempts(attempts + 1);
    setGuessCount(guessCount + 1);
    
    // Check if correct
    const isThisGuessCorrect = currentGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    
    if (isThisGuessCorrect) {
      setIsCorrect(true);
      setShowResult(true);
      setIsGameOver(true);
      setShowConfetti(true);
      
      if (isSurvivalMode && onRoundEnd) {
        // Allow parent component to handle the success, passing the correct brawler name
        onRoundEnd({ 
          success: true,
          brawlerName: currentGuess // Use the brawler name that was just guessed correctly
        });
      } else {
        toast('Correct!', {
          description: `You found ${dailyChallenge.brawler} in ${attempts + 1} guesses!`,
        });
        
        // For endless mode, prepare for the next round after a delay
        if (isEndlessMode) {
          setTimeout(() => {
            resetGame();
          }, 3000);
        }
      }
    } else if (attempts + 1 >= maxGuesses) {
      // Out of guesses
      setShowResult(true);
      setIsGameOver(true);
      
      if (isSurvivalMode && onRoundEnd) {
        // Allow parent component to handle the failure
        onRoundEnd({ success: false });
      } else {
        toast('Game Over', {
          description: `The correct brawler was ${dailyChallenge.brawler}.`,
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGuess();
  };

  const handleBrawlerSelect = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-white/10 rounded-xl"></div>
          <div className="h-6 w-40 bg-white/10 rounded-full"></div>
          <div className="h-4 w-60 bg-white/10 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!dailyChallenge) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Error Loading Challenge</h2>
        <p className="text-gray-300 mb-6">There was a problem loading today's star power challenge.</p>
        <Button onClick={loadChallengeForCurrentMode}>Try Again</Button>
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
            Guess the Brawler with this Star Power
          </h1>
          
          {/* Star Power Image - with difficulty modifiers */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
              <img
                src={starPowerImage}
                alt="Brawler Star Power"
                className={cn(
                  "w-full h-full object-contain transform transition-all duration-300 hover:scale-105",
                  isGrayscale && "grayscale",
                )}
                style={{ transform: isRotated ? `rotate(${rotation}deg)` : 'none' }}
                onError={(e) => {
                  e.currentTarget.src = '/StarPowerImages/default_starpower.png';
                }}
              />
            </div>
            
            {/* Star Power Name (shown if game is over) */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-extrabold text-brawl-yellow mb-2">
                {showResult ? dailyChallenge.starPowerName : "???"}
              </h2>
              <p className="text-sm md:text-base text-white/80 max-w-md mx-auto italic">
                "{dailyChallenge.tip}"
              </p>
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
              disabled={isGameOver}
              disabledBrawlers={guesses}
            />
          </form>
          {/* Guess Counter */}
          <div className="w-full flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-4 py-1 rounded-full shadow-lg">
              <span className="text-white text-base font-semibold">Number of Guesses</span>
              <span className="text-white text-base font-bold">{guessCount}</span>
            </div>
          </div>
        </div>
        {/* Previous Guesses */}
        <div className="w-full max-w-md mx-auto mb-6 px-2">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-4 md:gap-y-3">
            {guesses.map((pastGuess, idx) => {
              const isCorrect = pastGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
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
                    onError={e => { e.currentTarget.src = DEFAULT_PIN; }}
                  />
                  <span className="text-base md:text-2xl font-extrabold text-white text-center mt-2 truncate w-full" style={{lineHeight: 1.1}}>
                    {pastGuess}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        {/* Victory Section - only show if not in survival mode */}
        {isGameOver && dailyChallenge && !skipVictoryScreen && (
          <div ref={victoryRef}>
            {(() => {
              try {
                return (
                  <VictorySection
                    brawlerName={correctBrawlerForVictory}
                    brawlerPortrait={getPortrait(correctBrawlerForVictory)}
                    tries={guessCount}
                    mode="starpower"
                    nextModeKey="classic" 
                    onNextMode={() => navigate('/classic')}
                    nextBrawlerIn={timeUntilNext}
                    yesterdayBrawlerName={yesterdayStarPower?.brawler}
                    yesterdayBrawlerPortrait={yesterdayStarPower?.image}
                  />
                );
              } catch (error) {
                console.error("Error rendering VictorySection:", error);
                return (
                  <div className="p-6 bg-red-800/30 rounded-xl text-white">
                    <h2 className="text-2xl font-bold mb-4">Victory!</h2>
                    <p>You guessed the brawler: <strong>{correctBrawlerForVictory}</strong></p>
                    <p className="mt-2">Number of tries: {guessCount}</p>
                    <button
                      onClick={() => navigate('/classic')}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Next Mode: Classic
                    </button>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarPowerMode;
