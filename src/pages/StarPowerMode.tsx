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

const StarPowerMode = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<StarPowerChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);

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
  const [isEndlessMode, setIsEndlessMode] = useState(false);

  // Add windowSize state for confetti
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Set a random rotation degree when rotation option is toggled on
    if (isRotated) {
      const angles = [90, 180, 270];
      setRotation(angles[Math.floor(Math.random() * angles.length)]);
    } else {
      setRotation(0);
    }
  }, [isRotated]);

  const loadChallengeDetails = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDailyChallenge('starpower');
      if (data) {
        setDailyChallenge(data);
        if (data.image) {
          setStarPowerImage(`/${data.image}`);
          setCorrectBrawlerForVictory(data.brawler);
        }
      } else {
        setDailyChallenge(fallbackChallenge);
        setStarPowerImage(`/${fallbackChallenge.image}`);
        setCorrectBrawlerForVictory(fallbackChallenge.brawler);
        toast.error("Couldn't load today's challenge. Using fallback data.");
      }
      setGuesses([]);
      setGuessCount(0);
      setIsGameOver(false);
      setShowConfetti(false);
      setGuess('');
      setSelectedBrawler(null);
    } catch (error) {
      console.error("Error loading star power challenge:", error);
      setDailyChallenge(fallbackChallenge);
      setStarPowerImage(`/${fallbackChallenge.image}`);
      setCorrectBrawlerForVictory(fallbackChallenge.brawler);
      toast.error("Error loading challenge.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallengeDetails();
  }, [isEndlessMode]);

  useEffect(() => {
    if (isEndlessMode) {
      setTimeUntilNext({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }
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
  }, [isEndlessMode]);

  useEffect(() => {
    const fetchYesterday = async () => {
      try {
        const yest = await fetchYesterdayChallenge('starpower');
        if (yest && yest.image) {
          setYesterdayStarPower({ image: `/${yest.image}`, brawler: yest.brawler });
        }
      } catch (error) {
        console.error("Error fetching yesterday's challenge:", error);
      }
    };
    fetchYesterday();
  }, []);

  useEffect(() => {
    if (isGameOver && victoryRef.current) {
      victoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowConfetti(true);
      // Dispatch mode completed event
      window.dispatchEvent(new CustomEvent('brawldle-mode-completed', { detail: { mode: 'starpower' } }));
    }
  }, [isGameOver]);

  const handleGuess = () => {
    const trimmedGuess = guess.trim();
    if (!trimmedGuess || !dailyChallenge) return;
    const brawlerMatch = brawlers.find(b => b.name.toLowerCase() === trimmedGuess.toLowerCase());
    if (!brawlerMatch) {
      toast.error('Please enter a valid brawler name!');
      return;
    }
    if (guesses.includes(trimmedGuess.toLowerCase())) {
      toast.error('You already guessed this brawler!');
      return;
    }
    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);
    setGuesses([...guesses, trimmedGuess.toLowerCase()]);
    const isGuessCorrect = trimmedGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    
    if (isGuessCorrect) {
      setIsGameOver(true);
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
    setGuess('');
    setSelectedBrawler(null);
    setAttempts(0);
    setIsCorrect(false);
    setShowResult(false);
    setIsGameOver(false);
    setShowConfetti(false);
    setGuessCount(0);
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

  return (
    <div className="min-h-screen flex flex-col px-1 py-4 md:py-8">
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
      <HomeButton />
      
      {/* Game Mode Tracker */}
      <div className="flex justify-center mb-4 animate-fade-in-down">
        <GameModeTracker />
      </div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-brawl-yellow mb-1 text-center">
          {t('mode.starpower') || 'Star Power Mode'}
        </h1>
      </div>
      <div className="flex-1 flex flex-col items-center">
        {/* Star Power Image */}
        <div className="flex flex-col items-center mb-6">
          {starPowerImage ? (
            <img src={starPowerImage} alt="Star Power" className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-xl border-4 border-yellow-400 bg-black/70 shadow-lg" />
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
        {/* Victory Section */}
        {isGameOver && dailyChallenge && (
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
