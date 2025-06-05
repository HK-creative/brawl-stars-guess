import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t, getLanguage } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Check, X, Infinity as InfinityIcon, Share2 } from 'lucide-react';
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

// Helper function to get the next mode key for the VictorySection
const getNextModeKey = (currentMode: string) => {
  const modes = ['classic', 'gadget', 'starPower', 'audio'];
  const currentIndex = modes.indexOf(currentMode);
  return modes[(currentIndex + 1) % modes.length];
};

// Helper to get gadget image path
const getGadgetImage = (brawler: string, gadgetName?: string): string => {
  if (!brawler) {
    return `/GadgetImages/shelly_gadget_01.png`;
  }
  
  // Clean up brawler name for file path
  const normalizedBrawler = brawler.toLowerCase().replace(/ /g, '_');
  
  // Handle special cases
  if (normalizedBrawler === 'mr.p') return `/GadgetImages/mrp_gadget_01.png`;
  if (normalizedBrawler === 'el primo') return `/GadgetImages/elprimo_gadget_01.png`;
  if (normalizedBrawler === 'colonel ruffs') return `/GadgetImages/colonel_ruffs_gadget_01.png`;
  // Special case for R-T (use lowercase, no dash, as in asset: rt_gadget_01.png)
  if (brawler.toLowerCase().replace(/[-_ ]/g, '') === 'rt') {
    if (gadgetName && gadgetName.match(/2|second/i)) {
      return '/GadgetImages/rt_gadget_02.png';
    }
    return '/GadgetImages/rt_gadget_01.png';
  }
  // Special case for Jae-Yong (file is capitalized and uses dash)
  if (brawler.toLowerCase().replace(/[-_ ]/g, '') === 'jaeyong') {
    // Try both gadget 1 and gadget 2 based on gadgetName
    if (gadgetName && gadgetName.match(/2|second/i)) {
      return '/GadgetImages/Jae-Yong_gadget_2.png';
    }
    // Default to gadget 1 if not specified
    return '/GadgetImages/Jae-Yong_gadget_1.png';
  }
  
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
    // Return a specific brawler's gadget that matches the actual brawler
    // Try first to return this brawler's gadget instead of defaulting to Shelly
    if (normalizedBrawler !== 'shelly') {
      // Try the base pattern without specific numbering
      const basicVariant = `/GadgetImages/${normalizedBrawler}_gadget.png`;
      return basicVariant;
    }
    return `/GadgetImages/shelly_gadget_01.png`;
  }
  
  // Randomly choose between the two variants
  return Math.random() < 0.5 ? variant1 : variant2;
};

interface GadgetChallenge {
  brawler: string;
  gadgetName: string;
  tip: string;
  image?: string;
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
}: GadgetModeProps) => {
  const navigate = useNavigate();
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [guessesLeft, setGuessesLeft] = useState(maxGuesses);
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<GadgetChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [gadgetImage, setGadgetImage] = useState<string>('');
  const [correctBrawler, setCorrectBrawler] = useState<string>('');
  const [victoryBrawler, setVictoryBrawler] = useState<string>('');
  const [actualBrawlerForGadget, setActualBrawlerForGadget] = useState<Brawler | null>(null);
  const [yesterdayGadget, setYesterdayGadget] = useState<{ image: string, brawler: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [correctBrawlerName, setCorrectBrawlerName] = useState<string>('');
  const [correctGadgetName, setCorrectGadgetName] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEndlessMode, setIsEndlessMode] = useState(propIsEndlessMode);
  const [recentlyUsedBrawlers, setRecentlyUsedBrawlers] = useState<string[]>([]);
  const [selectedGadget, setSelectedGadget] = useState<any>(null);
  const victoryRef = useRef<HTMLDivElement>(null);
  const [gameKey, setGameKey] = useState(Date.now().toString());
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const currentLanguage = getLanguage();

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
    }
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
      toast.error('Please select a valid brawler from the list');
      return;
    }

    // Check if this brawler has already been guessed
    if (guesses.some(g => g.toLowerCase() === exactBrawler.name.toLowerCase())) {
      const displayName = getBrawlerDisplayName(exactBrawler, currentLanguage);
      toast.error(`You've already guessed ${displayName}`);
      return;
    }

    // Add the FULL brawler name to guesses, not the raw input
    const fullBrawlerName = exactBrawler.name;
    setGuesses([...guesses, fullBrawlerName]);
    setAttempts(attempts + 1);
    
    if (isSurvivalMode) {
      setGuessesLeft(prev => prev - 1);
    }

    const isGuessCorrect = fullBrawlerName.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    
    if (isGuessCorrect) {
      setIsCorrect(true);
      setShowResult(true);
      setIsGameOver(true);
      setShowConfetti(true);
      
      if (onRoundEnd) {
        onRoundEnd({ success: true, brawlerName: dailyChallenge.brawler });
      }
      
      toast.success('Correct! You guessed the brawler!');
    } else {
      const outOfGuesses = isSurvivalMode ? guessesLeft <= 1 : attempts + 1 >= maxGuesses;
      
      if (outOfGuesses) {
        setShowResult(true);
        setIsGameOver(true);
        
        if (onRoundEnd) {
          onRoundEnd({ success: false, brawlerName: dailyChallenge.brawler });
        }
        
        const correctBrawlerObj = brawlers.find(b => b.name.toLowerCase() === dailyChallenge.brawler.toLowerCase());
        const correctDisplayName = correctBrawlerObj ? getBrawlerDisplayName(correctBrawlerObj, currentLanguage) : dailyChallenge.brawler;
        toast.error(`Game over! The correct brawler was ${correctDisplayName}.`);
      } else {
        toast.error('Incorrect! Try again.');
      }
    }
    
    setGuess('');
    setSelectedBrawler(null);
  };

  // Reset game state
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
    
    if (correctBrawler) {
      setRecentlyUsedBrawlers(prev => {
        const updated = [correctBrawler, ...prev].slice(0, 2);
        return updated;
      });
    }
  };

  // Load challenge function
  const loadChallenge = async () => {
    setIsLoading(true);
    
    try {
      if (isSurvivalMode) {
        console.log('Loading random brawler for Survival Mode Gadget challenge');
        
        // Get all brawlers that have gadgets
        const brawlersWithGadgets = brawlers.filter(b => 
          b.gadgets && b.gadgets.length > 0 && 
          !recentlyUsedBrawlers.includes(b.name)
        );
        
        // Make sure we have enough eligible brawlers, otherwise use all brawlers with gadgets
        const eligibleBrawlers = brawlersWithGadgets.length >= 5 ?
          brawlersWithGadgets :
          brawlers.filter(b => b.gadgets && b.gadgets.length > 0);
        
        // Shuffle the brawlers array to pick a random one
        const shuffledBrawlers = [...eligibleBrawlers];
        for (let i = shuffledBrawlers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledBrawlers[i], shuffledBrawlers[j]] = [shuffledBrawlers[j], shuffledBrawlers[i]];
        }
        
        // Pick the first brawler from shuffled array
        const randomBrawler = shuffledBrawlers[0] || brawlers[0];
        console.log(`Selected random brawler: ${randomBrawler.name} (ID: ${randomBrawler.id})`);

        // Get a random gadget from the brawler
        let selectedGadget = null;
        let gadgetImage = '';
        
        if (randomBrawler.gadgets && randomBrawler.gadgets.length > 0) {
          // Shuffle gadgets to pick a random one
          const shuffledGadgets = [...randomBrawler.gadgets];
          for (let i = shuffledGadgets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledGadgets[i], shuffledGadgets[j]] = [shuffledGadgets[j], shuffledGadgets[i]];
          }
          
          selectedGadget = shuffledGadgets[0];
          gadgetImage = getGadgetImage(randomBrawler.name, selectedGadget.name);
          console.log(`Selected gadget: ${selectedGadget.name}`);
        } else {
          gadgetImage = getGadgetImage(randomBrawler.name);
          console.log(`No gadgets found for ${randomBrawler.name}, using default image`);
        }

        // Cross-check: ensure the correct brawler is the owner of the shown gadget
        let correctBrawlerName = randomBrawler.name;
        if (selectedGadget) {
          // Find the brawler who owns this gadget (should always be randomBrawler, but double-check)
          const trueOwner = brawlers.find(b => b.gadgets && b.gadgets.some(g => g.name === selectedGadget.name));
          if (trueOwner && trueOwner.name !== randomBrawler.name) {
            console.warn(`Mismatch detected: gadget '${selectedGadget.name}' belongs to ${trueOwner.name}, not ${randomBrawler.name}! Fixing assignment.`);
            correctBrawlerName = trueOwner.name;
          }
        }

        setVictoryBrawler(correctBrawlerName);
        setCorrectBrawlerName(correctBrawlerName);
        setGadgetImage(gadgetImage);
        setCorrectBrawler(correctBrawlerName);
        setActualBrawlerForGadget(brawlers.find(b => b.name === correctBrawlerName) || randomBrawler);
        setSelectedGadget(selectedGadget);
  
        const gadgetChallenge: GadgetChallenge = {
          brawler: randomBrawler.name,
          gadgetName: selectedGadget ? selectedGadget.name : `Unknown Gadget`,
          tip: selectedGadget && selectedGadget.tip ? selectedGadget.tip : `Special gadget for ${randomBrawler.name}.`,
          image: gadgetImage
        };
  
        setDailyChallenge(gadgetChallenge);
        setVictoryBrawler(gadgetChallenge.brawler);
      } else if (!isEndlessMode) {
        const challenge = await fetchDailyChallenge('gadget');
        if (challenge) {
          setDailyChallenge(challenge);
          setGadgetImage(challenge.image || '');
          setCorrectBrawler(challenge.brawler);
          setVictoryBrawler(challenge.brawler);
        }
      }
    } catch (error) {
      console.error('Error loading gadget challenge:', error);
      toast.error('Error loading challenge');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (brawlerId !== undefined) {
      setGuess('');
      setGuesses([]);
      setIsCorrect(false);
      setSelectedBrawler(null);
      setAttempts(0);
      setShowResult(false);
      setIsGameOver(false);
      setGuessCount(0);
      setShowConfetti(false);
      setGuessesLeft(maxGuesses);
      
      setGameKey(Date.now().toString());
      
      loadChallenge();
    }
  }, [brawlerId, maxGuesses]);

  useEffect(() => {
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (!isEndlessMode && !isSurvivalMode) {
      loadChallenge();
    }
  }, [isEndlessMode, isSurvivalMode]);

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
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

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
        <div className="flex-1 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-3">
            {t('survival.guess.gadget')}
          </h1>
          
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
              {dailyChallenge?.image && (
                <img
                  src={dailyChallenge.image}
                  alt={`${dailyChallenge.brawler}'s Gadget`}
                  className="w-full h-full object-contain transform transition-all duration-300 hover:scale-105"
                  onLoad={(e) => {
                    console.log('Gadget image loaded successfully');
                    e.currentTarget.style.display = 'block';
                    // Hide loading state
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const loadingEl = parent.querySelector('.loading-placeholder') as HTMLElement;
                      if (loadingEl) {
                        loadingEl.style.display = 'none';
                      }
                    }
                  }}
                  onError={(e) => {
                    console.log('Gadget image load failed, showing error state');
                          e.currentTarget.style.display = 'none';
                    // Show error state
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const loadingEl = parent.querySelector('.loading-placeholder') as HTMLElement;
                      if (loadingEl) {
                        loadingEl.innerHTML = `
                          <div class="w-full h-full flex flex-col items-center justify-center space-y-4">
                            <div class="text-red-400 text-sm">Failed to load gadget image</div>
                            <button onclick="window.location.reload()" class="text-xs bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white">
                              Refresh Page
                            </button>
                          </div>
                        `;
                      }
                    }
                  }}
                  style={{ display: 'none' }}
                />
              )}
              {/* Loading state */}
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 loading-placeholder">
                <div className="loading-spinner"></div>
                <p className="text-yellow-400 text-sm">Loading gadget...</p>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-extrabold text-brawl-yellow mb-2">
                {showResult && dailyChallenge ? dailyChallenge.gadgetName : ""}
              </h2>
              {showResult && dailyChallenge && (
                <p className="text-sm md:text-base text-white/80 max-w-md mx-auto italic">
                  "{dailyChallenge.tip}"
                </p>
              )}
            </div>
          </div>
          
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

          <div className="w-full flex justify-center gap-4 mt-4">
            {isSurvivalMode ? (
              <div className="flex items-center gap-2 bg-black/70 border-2 border-brawl-yellow px-6 py-2 rounded-full shadow-xl animate-pulse">
                <span className="text-brawl-yellow text-lg font-bold tracking-wide">{t('guesses.left')}</span>
                <span className={`text-2xl font-extrabold ${guessesLeft <= 3 ? 'text-brawl-red animate-bounce' : 'text-white'}`}>{guessesLeft}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-4 py-1 rounded-full shadow-lg">
                <span className="text-white text-base font-semibold">Number of Guesses</span>
                <span className="text-white text-base font-bold">{attempts}</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto mb-6 px-2">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-4 md:gap-y-3">
            {guesses.map((pastGuess, idx) => {
              const isCorrect = dailyChallenge && pastGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
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
                      console.log(`Failed to load portrait for ${pastGuess}, trying fallback`);
                      e.currentTarget.src = DEFAULT_PORTRAIT;
                      e.currentTarget.onerror = () => {
                        console.log(`Failed to load fallback portrait for ${pastGuess}, hiding image`);
                        e.currentTarget.style.display = 'none';
                      };
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
