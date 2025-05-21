import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler } from '@/data/brawlers';
import { toast } from 'sonner';
import { fetchDailyChallenge, getTimeUntilNextChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { Play, Volume2, Home } from 'lucide-react';
import { getPortrait } from '@/lib/image-helpers';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import VictoryPopup from '@/components/VictoryPopup';
import ReactConfetti from 'react-confetti';
import VictorySection from '../components/VictoryPopup';
import GameModeTracker from '@/components/GameModeTracker';
import HomeButton from '@/components/ui/home-button';

// Helper to get a random audio file for a brawler from the AttackSounds folder
const getRandomAudioFile = (brawler: string, files: string[]) => {
  if (!brawler) return '';
  const normalized = brawler.toLowerCase().replace(/ /g, '');
  // Find all files that start with the brawler's name (case-insensitive)
  const matches = files.filter(f => f.toLowerCase().startsWith(normalized));
  if (matches.length === 0) return '';
  return `/AttackSounds/${matches[Math.floor(Math.random() * matches.length)]}`;
};

const DEFAULT_AUDIO = '';

interface AudioChallenge {
  brawler: string;
  audioFile?: string;
}

const modeOrder = [
  { name: 'Classic Mode', route: '/classic' },
  { name: 'Audio Mode', route: '/audio' },
  { name: 'Gadget Mode', route: '/gadget' },
  { name: 'Star Power Mode', route: '/starpower' },
];

const AudioMode = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<AudioChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [audioFile, setAudioFile] = useState<string>('');
  const [yesterdayAudio, setYesterdayAudio] = useState<{ audio: string, brawler: string } | null>(null);
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [correctBrawlerName, setCorrectBrawlerName] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const victoryRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Confetti window size
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resultRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load all audio file names from the AttackSounds folder (client-side fetch)
  useEffect(() => {
    // This requires a manifest or API in production, but for dev, we can try to fetch a static list
    fetch('/AttackSounds/manifest.json')
      .then(res => res.json())
      .then(list => setAudioFiles(list))
      .catch(() => setAudioFiles([]));
  }, []);

  useEffect(() => {
    const loadChallenge = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDailyChallenge('audio');
        let file = '';
        if (data) {
          setDailyChallenge(data);
          // Always use a valid .ogg file from the manifest for the brawler
          if (data.audioFile && audioFiles.includes(data.audioFile.replace('/AttackSounds/', ''))) {
            file = data.audioFile.startsWith('/') ? data.audioFile : `/AttackSounds/${data.audioFile}`;
          } else if (data.brawler && audioFiles.length > 0) {
            file = getRandomAudioFile(data.brawler, audioFiles);
          }
        }
        if (!file) {
          // Fallback to a real .ogg file from the manifest
          file = audioFiles.find(f => f.toLowerCase().includes('spike')) ? `/AttackSounds/${audioFiles.find(f => f.toLowerCase().includes('spike'))}` : '';
          setDailyChallenge({ brawler: 'Spike', audioFile: file });
          toast.error("Couldn't load today's challenge. Using fallback data.");
        }
        setAudioFile(file);
      } catch (error) {
        console.error("Error loading audio challenge:", error);
        // Fallback to a real .ogg file from the manifest
        const file = audioFiles.find(f => f.toLowerCase().includes('spike')) ? `/AttackSounds/${audioFiles.find(f => f.toLowerCase().includes('spike'))}` : '';
        setDailyChallenge({ brawler: 'Spike', audioFile: file });
        setAudioFile(file);
        toast.error("Couldn't load today's challenge. Using fallback data.");
      } finally {
        setIsLoading(false);
      }
    };
    if (audioFiles.length > 0) {
      loadChallenge();
    }
  }, [audioFiles]);

  useEffect(() => {
    // Fetch yesterday's audio
    const fetchYesterday = async () => {
      const yest = await fetchYesterdayChallenge('audio');
      if (yest && yest.brawler) {
        let yestAudio = yest.audioFile;
        if (!yestAudio && audioFiles.length > 0) {
          yestAudio = getRandomAudioFile(yest.brawler, audioFiles);
        }
        setYesterdayAudio({ audio: yestAudio, brawler: yest.brawler });
      }
    };
    if (audioFiles.length > 0) {
      fetchYesterday();
    }
  }, [audioFiles]);

  useEffect(() => {
    if (showResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showResult]);

  useEffect(() => {
    setAudioReady(false);
    setAudioError(false);
  }, [audioFile]);

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
      toast.success('Correct! You found the right brawler!');
      setCorrectBrawlerName(dailyChallenge.brawler);
      setGuessCount(newAttempts);
      setIsGameOver(true);
    } else {
      toast.error('Wrong guess! Try again.');
    }
    setGuess('');
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
  };

  const playAudio = () => {
    if (audioRef.current && audioFile && audioReady) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setAudioError(true);
          toast.error('Failed to play audio.');
        });
    } else if (!audioReady) {
      toast.error('Audio file is not ready yet.');
    }
  };

  useEffect(() => {
    if (isGameOver && victoryRef.current) {
      victoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowConfetti(true);
      // Dispatch mode completed event
      window.dispatchEvent(new CustomEvent('brawldle-mode-completed', { detail: { mode: 'audio' } }));
    }
  }, [isGameOver]);

  // Add a live timer for next brawler (with seconds, like ClassicMode)
  useEffect(() => {
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
          {t('mode.audio') || 'Audio Mode'}
        </h1>
      </div>
      <div className="flex-1 flex flex-col items-center">
        {/* Audio Play Button */}
        <div className="flex flex-col items-center mb-6">
          <button
            className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center rounded-full border-4 border-yellow-400 bg-black/70 shadow-lg text-brawl-yellow text-6xl hover:scale-105 active:scale-95 transition-all relative"
            onClick={playAudio}
            disabled={!audioFile || !audioReady || audioError}
            style={{ outline: 'none' }}
          >
            <div className={`absolute inset-0 rounded-full ${isPlaying ? 'animate-ping' : ''}`}></div>
            {isPlaying ? <Volume2 size={80} className="text-brawl-yellow animate-pulse" /> : <Play size={80} className="text-brawl-yellow" />}
            <audio
              ref={audioRef}
              src={audioFile}
              onCanPlayThrough={() => { setAudioReady(true); setAudioError(false); }}
              onError={() => { setAudioError(true); setAudioReady(false); toast.error('Audio file could not be loaded.'); }}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          </button>
          {audioError && (
            <div className="text-red-500 mt-2 text-center text-sm">Audio file could not be loaded. Please try again later or contact support.</div>
          )}
          {!audioReady && !audioError && audioFile && (
            <div className="text-yellow-400 mt-2 text-center text-sm">Loading audio...</div>
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
        {isGameOver && (
          <div ref={victoryRef}>
            {(() => {
              try {
                return (
                  <VictorySection
                    brawlerName={correctBrawlerName}
                    brawlerPortrait={getPortrait(correctBrawlerName)}
                    tries={guessCount}
                    mode="audio"
                    nextModeKey="gadget"
                    onNextMode={() => navigate('/gadget')}
                    nextBrawlerIn={timeUntilNext ? `${timeUntilNext.hours}h ${timeUntilNext.minutes}m ${timeUntilNext.seconds}s` : undefined}
                    yesterdayBrawlerName={yesterdayAudio?.brawler}
                    yesterdayBrawlerPortrait={yesterdayAudio?.audio ? undefined : undefined}
                    onShare={undefined}
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
                      onClick={() => navigate('/gadget')}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Next Mode: Gadget
                    </button>
                  </div>
                );
              }
            })()}
          </div>
        )}
        {/* Yesterday's Audio */}
        {yesterdayAudio && yesterdayAudio.audio && (
          <div className="w-full flex flex-col items-center justify-center mt-8">
            <div className="text-white text-lg md:text-xl font-bold mb-2 mt-2" style={{textShadow: '2px 2px 0 #222'}}>Yesterday's Attack Sound</div>
            <div className="flex items-center gap-2 mb-2">
              <button
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-yellow-400 bg-black/70 shadow text-brawl-yellow text-2xl"
                onClick={() => {
                  const audio = new Audio(yesterdayAudio.audio);
                  audio.play();
                }}
                style={{ outline: 'none' }}
              >
                <Play size={24} className="text-brawl-yellow" />
              </button>
              <span className="text-brawl-green text-lg md:text-2xl font-extrabold drop-shadow-sm" style={{textShadow: '2px 2px 0 #222'}}>
                {yesterdayAudio.brawler}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioMode;
