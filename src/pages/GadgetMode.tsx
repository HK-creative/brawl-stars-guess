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
import { getPortrait, getPin, DEFAULT_PIN } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import VictorySection from '../components/VictoryPopup';
import ReactConfetti from 'react-confetti';
import { useIsMobile } from "@/hooks/use-mobile";
import GameModeTracker from '@/components/GameModeTracker';
import HomeButton from '@/components/ui/home-button';

// Helper to get gadget image path
const getGadgetImage = (brawler: string, gadgetName?: string) => {
  if (!brawler) return '/GadgetIcon.png';
  // Try to find the correct image by convention
  // If gadgetName is provided, try to extract the number from it
  let num = '01';
  if (gadgetName) {
    const match = gadgetName.match(/(\d+)/);
    if (match) {
      num = match[1].padStart(2, '0');
    }
  }
  // Lowercase and underscores for brawler name
  const fileName = `${brawler.toLowerCase().replace(/ /g, '_')}_gadget_${num}.png`;
  return `/GadgetImages/${fileName}`;
};
const DEFAULT_GADGET_IMAGE = '/GadgetIcon.png';

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

const GadgetMode = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<GadgetChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [gadgetImage, setGadgetImage] = useState<string>('');
  const [correctBrawler, setCorrectBrawler] = useState<string>('');
  const [yesterdayGadget, setYesterdayGadget] = useState<{ image: string, brawler: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [correctBrawlerName, setCorrectBrawlerName] = useState<string>('');
  const [correctGadgetName, setCorrectGadgetName] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const victoryRef = useRef<HTMLDivElement>(null);

  // Confetti window size
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Difficulty settings
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [rotation, setRotation] = useState(0);

  const resultRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isRotated) {
      const angles = [90, 180, 270];
      setRotation(angles[Math.floor(Math.random() * angles.length)]);
    } else {
      setRotation(0);
    }
  }, [isRotated]);

  const loadChallenge = async () => {
    setIsLoading(true);
    try {
      let challengeData;
      if (isEndlessMode) {
        challengeData = await fetchDailyChallenge('gadget');
      } else {
        challengeData = await fetchDailyChallenge('gadget');
        const yesterdayData = await fetchYesterdayChallenge('gadget');
        setYesterdayGadget(yesterdayData);
      }

      if (challengeData) {
        setDailyChallenge(challengeData);
        // Build image path
        setGadgetImage(getGadgetImage(challengeData.brawler, challengeData.gadgetName));
        setCorrectBrawler(challengeData.brawler);
      } else {
        toast.error("Failed to load challenge. Please try again.");
        // Handle fallback or error state
      }
    } catch (error) {
      console.error("Error loading gadget challenge:", error);
      toast.error("An error occurred while loading the challenge.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
    // Update the countdown timer
    const update = () => {
      const now = new Date();
      const utc2Now = new Date(now.getTime() + (2 * 60 * 60 * 1000));
      const tomorrow = new Date(utc2Now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diffMs = tomorrow.getTime() - utc2Now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilNext({ hours, minutes, seconds });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showResult]);

  useEffect(() => {
    if (isGameOver && victoryRef.current) {
      victoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowConfetti(true);
      // Dispatch mode completed event
      window.dispatchEvent(new CustomEvent('brawldle-mode-completed', { detail: { mode: 'gadget' } }));
    }
  }, [isGameOver]);

  // Helper to check if guess is a valid brawler
  const isValidBrawler = brawlers.some(b => b.name.toLowerCase() === guess.trim().toLowerCase());
  const isAlreadyGuessed = guesses.some(g => g.toLowerCase() === guess.trim().toLowerCase());

  const handleGuess = () => {
    const trimmedGuess = guess.trim();
    if (!trimmedGuess || !dailyChallenge) return;
    const brawlerMatch = brawlers.find(b => b.name.toLowerCase() === trimmedGuess.toLowerCase());
    if (!brawlerMatch) {
      toast.error('Please enter a valid brawler name!');
      return;
    }
    if (isAlreadyGuessed) {
      toast.error('You already guessed this brawler!');
      return;
    }
    const isGuessCorrect = trimmedGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setGuesses([...guesses, trimmedGuess]);
    if (isGuessCorrect) {
      setIsCorrect(true);
      setShowResult(true);
      setIsGameOver(true);
      setCorrectBrawlerName(dailyChallenge.brawler);
      setGuessCount(newAttempts);
      toast.success('Correct! You found the right brawler!');
    } else {
      toast.error('Wrong guess! Try again.');
    }
    setGuess('');
    setSelectedBrawler(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGuess();
  };

  const handleBrawlerSelect = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
    setGuess(brawler.name);
  };

  const resetGame = () => {
    setGuesses([]);
    setAttempts(0);
    setIsCorrect(false);
    setShowResult(false);
    setGuess('');
    setSelectedBrawler(null);
    setIsGameOver(false);
    setShowConfetti(false);
    setGuessCount(0);
    if (dailyChallenge) {
      loadChallenge();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!dailyChallenge) {
    return (
      <Card className="brawl-card p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brawl-yellow mb-2">No Challenge Available</h3>
          <p className="text-white/80">Check back later for today's challenge.</p>
        </div>
      </Card>
    );
  }

  // Confetti shake animation for wrong guesses
  // (same as StarPowerMode)

  return (
    <div className="min-h-screen flex flex-col px-1 py-4 md:py-8">
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
      <HomeButton />
      
      {/* Game Mode Tracker */}
      <div className="flex justify-center mb-4 animate-fade-in-down">
        <GameModeTracker />
      </div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-brawl-yellow mb-1 text-center">
          {t('mode.gadget') || 'Gadget Mode'}
        </h1>
      </div>
      <div className="flex-1 flex flex-col items-center">
        {/* Gadget Image */}
        <div className="flex flex-col items-center mb-6">
          {gadgetImage ? (
            <img src={gadgetImage} alt="Gadget" className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-xl border-4 border-yellow-400 bg-black/70 shadow-lg" onError={e => { e.currentTarget.src = DEFAULT_GADGET_IMAGE; }} />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 bg-black/30 rounded-xl flex items-center justify-center text-white/60">Loading...</div>
          )}
        </div>
        {/* Autocomplete Guess Input */}
        <div className="mb-6 w-full max-w-xl mx-auto">
          <form onSubmit={handleSubmit}>
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
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-4 py-1 rounded-full shadow-lg">
              <span className="text-white text-base font-semibold">Number of Guesses</span>
              <span className="text-white text-base font-bold">{attempts}</span>
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
                    onError={e => { e.currentTarget.src = DEFAULT_GADGET_IMAGE; }}
                  />
                  <span className="text-base md:text-2xl font-extrabold text-white text-center mt-2 truncate w-full" style={{lineHeight: 1.1}}>
                    {pastGuess}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        {/* Victory popup */}
        {isGameOver && dailyChallenge && (
          <div ref={victoryRef}>
            {(() => {
              try {
                return (
                  <VictorySection
                    brawlerName={correctBrawlerName}
                    brawlerPortrait={getPortrait(correctBrawlerName)}
                    tries={guessCount}
                    mode="gadget"
                    nextModeKey="starpower"
                    onNextMode={() => navigate('/starpower')}
                    nextBrawlerIn={timeUntilNext ? `${timeUntilNext.hours}h ${timeUntilNext.minutes}m ${timeUntilNext.seconds}s` : undefined}
                    yesterdayBrawlerName={yesterdayGadget?.brawler}
                    yesterdayBrawlerPortrait={yesterdayGadget?.image || DEFAULT_GADGET_IMAGE}
                  />
                );
              } catch (error) {
                console.error("Error rendering VictorySection:", error);
                return (
                  <div className="p-6 bg-red-800/30 rounded-xl text-white">
                    <h2 className="text-2xl font-bold mb-4">Victory!</h2>
                    <p>You guessed the brawler: <strong>{correctBrawlerName}</strong></p>
                    <p className="mt-2">Number of tries: {guessCount}</p>
                    <button
                      onClick={() => navigate('/starpower')}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Next Mode: Star Power
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

export default GadgetMode;

