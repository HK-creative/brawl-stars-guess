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

interface AudioModeProps {
  brawlerId?: number;
  onRoundEnd?: (result: { success: boolean, brawlerName?: string }) => void;
  maxGuesses?: number;
  isEndlessMode?: boolean;
  isSurvivalMode?: boolean;
  skipVictoryScreen?: boolean;
}

const AudioMode = ({
  brawlerId,
  onRoundEnd,
  maxGuesses = 6,
  isEndlessMode: propIsEndlessMode = false,
  isSurvivalMode = false,
  skipVictoryScreen = false
}: AudioModeProps = {}) => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<AudioChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState<{ hours: number; minutes: number; seconds?: number }>({ hours: 0, minutes: 0, seconds: 0 });
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
  const [gameKey, setGameKey] = useState(Date.now().toString()); // Key to force re-render
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

  // CRITICAL: This effect detects when brawlerId changes and resets the game
  useEffect(() => {
    console.log(`AudioMode: brawlerId changed to ${brawlerId}`);
    
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
    setIsPlaying(false);
    
    // Generate a new key to force complete component re-initialization
    setGameKey(Date.now().toString());
    
    if (brawlerId !== undefined) {
      // Load the new audio challenge for this specific brawler
      loadSurvivalModeAudio(brawlerId);
    }
  }, [brawlerId]); // Re-run when brawlerId changes

  // Load all audio file names from the AttackSounds folder (client-side fetch)
  useEffect(() => {
    // Simulate fetch of audio files (replace with your actual audio file list or API)
    const mockAudioFiles = [
      'shelly_attack_1.mp3', 'shelly_attack_2.mp3',
      'colt_attack_1.mp3', 'colt_attack_2.mp3',
      'brock_attack_1.mp3', 'brock_attack_2.mp3',
      'jessie_attack_1.mp3', 'jessie_attack_2.mp3',
      'nita_attack_1.mp3', 'nita_attack_2.mp3',
      'bo_attack_1.mp3', 'bo_attack_2.mp3',
      'spike_attack_1.mp3', 'spike_attack_2.mp3',
      'crow_attack_1.mp3', 'crow_attack_2.mp3',
      'poco_attack_1.mp3', 'poco_attack_2.mp3',
      'el_primo_attack_1.mp3', 'el_primo_attack_2.mp3',
      'barley_attack_1.mp3', 'barley_attack_2.mp3',
      'dynamike_attack_1.mp3', 'dynamike_attack_2.mp3',
      'bull_attack_1.mp3', 'bull_attack_2.mp3',
    ];
    
    setAudioFiles(mockAudioFiles);
    
    // Initial load for non-survival mode
    if (!isSurvivalMode && !brawlerId) {
      loadChallenge();
    }
    
    // Load previous day's challenge
    fetchYesterday();
    
    // Set up timer for next challenge countdown
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Confetti effect timer
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Function to load a specific audio for a brawler in Survival Mode
  const loadSurvivalModeAudio = (requestedBrawlerId: number) => {
    setIsLoading(true);
    
    try {
      // Validate the requested brawler ID is within range
      if (requestedBrawlerId <= 0 || requestedBrawlerId > brawlers.length) {
        console.warn(`Brawler ID ${requestedBrawlerId} is out of range (1-${brawlers.length}). Using fallback.`);
        // Use a fallback brawler instead of throwing an error
        const fallbackBrawler = brawlers[0]; // Use first brawler as fallback
        const fallbackAudio = getRandomAudioFile(fallbackBrawler.name, audioFiles);
        
        const challenge: AudioChallenge = {
          brawler: fallbackBrawler.name,
          audioFile: fallbackAudio
        };
        
        setDailyChallenge(challenge);
        setAudioFile(fallbackAudio);
        setCorrectBrawlerName(fallbackBrawler.name);
        setIsLoading(false);
        setAudioError(false);
        setAudioReady(true);
        return;
      }
      
      // Find the specified brawler
      const brawler = brawlers.find(b => b.id === requestedBrawlerId);
      if (!brawler) {
        console.error(`Brawler with ID ${requestedBrawlerId} not found in data array`);
        // Use a default brawler as fallback
        const fallbackBrawlerId = 1; // Shelly
        const fallbackBrawler = brawlers.find(b => b.id === fallbackBrawlerId) || brawlers[0];
        const fallbackAudio = getRandomAudioFile(fallbackBrawler.name, audioFiles);
        
        const challenge: AudioChallenge = {
          brawler: fallbackBrawler.name,
          audioFile: fallbackAudio
        };
        
        setDailyChallenge(challenge);
        setAudioFile(fallbackAudio);
        setCorrectBrawlerName(fallbackBrawler.name);
        setIsLoading(false);
        setAudioError(false);
        setAudioReady(true);
        return;
      }
      
      console.log(`Loading audio for brawler: ${brawler.name} (ID: ${requestedBrawlerId})`);
      
      // Get a random audio file for this brawler
      const audio = getRandomAudioFile(brawler.name, audioFiles);
      
      // If no audio found, use a fallback
      if (!audio) {
        console.warn(`No audio found for ${brawler.name}, using fallback`);
        // Use a generic sound effect as fallback
        const fallbackAudio = '/audio/shelly_01.mp3'; // Default audio file
        
        const challenge: AudioChallenge = {
          brawler: brawler.name,
          audioFile: fallbackAudio
        };
        
        setDailyChallenge(challenge);
        setAudioFile(fallbackAudio);
        setCorrectBrawlerName(brawler.name);
        setIsLoading(false);
        setAudioError(false);
        setAudioReady(true);
        return;
      }
      
      // Set the challenge with the found audio
      const challenge: AudioChallenge = {
        brawler: brawler.name,
        audioFile: audio
      };
      
      setDailyChallenge(challenge);
      setAudioFile(audio);
      setCorrectBrawlerName(brawler.name);
      setIsLoading(false);
      setAudioError(false);
      setAudioReady(true);
    } catch (error) {
      console.error('Error loading survival mode audio:', error);
      setIsLoading(false);
      setAudioError(true);
    }
  };

  // Master function to load the appropriate challenge
  const loadChallenge = async () => {
    setIsLoading(true);
    
    try {
      // For survival mode, the audio is loaded by the specific brawlerId effect
      if (isSurvivalMode && brawlerId !== undefined) {
        await loadSurvivalModeAudio(brawlerId);
        return;
      }
      
      // Fetch daily challenge from backend
      try {
        const data = await fetchDailyChallenge('audio');
        if (data?.success) {
          const audio = data.audio;
          const challenge: AudioChallenge = {
            brawler: audio.brawler,
            audioFile: audio.file || getRandomAudioFile(audio.brawler, audioFiles)
          };
          
          setDailyChallenge(challenge);
          setAudioFile(challenge.audioFile || '');
          setCorrectBrawlerName(challenge.brawler);
        } else {
          throw new Error('Failed to fetch audio challenge');
        }
      } catch (error) {
        console.error('Error fetching audio challenge:', error);
        
        // Use a fallback brawler and audio
        const fallbackBrawler = "Shelly";
        const fallbackAudio = getRandomAudioFile(fallbackBrawler, audioFiles);
        
        const challenge: AudioChallenge = {
          brawler: fallbackBrawler,
          audioFile: fallbackAudio
        };
        
        setDailyChallenge(challenge);
        setAudioFile(fallbackAudio);
        setCorrectBrawlerName(fallbackBrawler);
        
        toast("Offline Mode", {
          description: "Using local fallback data as server could not be reached."
        });
      }
    } catch (error) {
      console.error('Error in loadChallenge:', error);
      setAudioError(true);
    } finally {
      setIsLoading(false);
      setAudioReady(true);
    }
  };

  // Fetch yesterday's audio
  const fetchYesterday = async () => {
    try {
      const yesterdayData = await fetchYesterdayChallenge('audio');
      if (yesterdayData?.success) {
        const yesterdayBrawler = yesterdayData.audio.brawler;
        const audioFile = getRandomAudioFile(yesterdayBrawler, audioFiles);
        setYesterdayAudio({
          brawler: yesterdayBrawler,
          audio: audioFile
        });
      }
    } catch (error) {
      console.error('Error fetching yesterday audio:', error);
      // No need to display toast for this, it's not critical
    }
  };

  // Reset the game
  const resetGame = () => {
    setGuess('');
    setGuesses([]);
    setSelectedBrawler(null);
    setAttempts(0);
    setIsCorrect(false);
    setShowResult(false);
    setIsGameOver(false);
    setGuessCount(0);
    setShowConfetti(false);
    
    // For endless mode, we need to generate a new random challenge
    if (propIsEndlessMode) {
      // Choose a random brawler
      const randomBrawlerIndex = Math.floor(Math.random() * brawlers.length);
      const randomBrawler = brawlers[randomBrawlerIndex];
      
      const randomAudio = getRandomAudioFile(randomBrawler.name, audioFiles);
      
      const challenge: AudioChallenge = {
        brawler: randomBrawler.name,
        audioFile: randomAudio
      };
      
      setDailyChallenge(challenge);
      setAudioFile(randomAudio);
      setCorrectBrawlerName(randomBrawler.name);
      setAudioReady(true);
    }
  };

  const playAudio = () => {
    if (!audioFile || isPlaying) return;
    
    setIsPlaying(true);
    
    // Create and configure an audio element
    if (!audioRef.current) {
      audioRef.current = new Audio(audioFile);
      
      // Set up event listeners
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('error', () => {
        setIsPlaying(false);
        setAudioError(true);
        toast.error('Error playing audio');
      });
    }
    
    // Play the audio
    audioRef.current.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setAudioError(true);
      toast.error('Error playing audio');
    });
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
        if (propIsEndlessMode) {
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

  const update = () => {
    // Update time till next challenge
    const nextTime = getTimeUntilNextChallenge();
    setTimeUntilNext({
      hours: nextTime.hours,
      minutes: nextTime.minutes,
      seconds: 0 // Default to 0 as getTimeUntilNextChallenge doesn't return seconds
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <Volume2 size={36} className="text-white/30" />
          </div>
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
        <p className="text-gray-300 mb-6">There was a problem loading today's audio challenge.</p>
        <Button onClick={loadChallenge}>Try Again</Button>
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

      <div className="flex flex-col min-h-[70vh] w-full max-w-2xl mx-auto">
        {/* Main Challenge Content */}
        <div className="flex-1 mb-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-3">
            Guess the Brawler by Sound
          </h1>
          
          {/* Audio Player */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 flex items-center justify-center">
              {/* Sound Icon Background */}
              <div className={cn(
                "w-full h-full rounded-full flex items-center justify-center transition-all duration-300",
                isPlaying ? "bg-blue-500/20 animate-pulse" : "bg-white/10",
                audioError && "bg-red-500/20"
              )}>
                {/* Play Button */}
                <button
                  onClick={playAudio}
                  disabled={isPlaying || !audioReady || audioError}
                  className={cn(
                    "w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full shadow-lg transition-all",
                    isPlaying ? "bg-blue-500 scale-95" : "bg-blue-600 hover:bg-blue-500",
                    "border-4 border-white",
                    audioError && "bg-red-500 cursor-not-allowed"
                  )}
                >
                  {isPlaying ? (
                    <Volume2 size={40} className="text-white animate-pulse" />
                  ) : (
                    <Play size={40} className="text-white ml-2" />
                  )}
                </button>
                
                {/* Audio visualization rings (show during playback) */}
                {isPlaying && (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-400/40 animate-ping-slow"></div>
                    <div className="absolute inset-[-15px] rounded-full border-2 border-blue-300/30 animate-ping-slow-2"></div>
                  </>
                )}
              </div>
            </div>
            
            {/* Status Text */}
            <div className="text-center">
              <p className="text-sm md:text-base text-white/80 max-w-md mx-auto italic">
                {audioError 
                  ? "Error playing audio. Please try again later." 
                  : isPlaying 
                    ? "Now playing..." 
                    : "Click to play attack sound"
                }
              </p>
              
              {/* Show brawler name if game is over */}
              {showResult && (
                <h2 className="text-xl md:text-2xl font-extrabold text-brawl-yellow mt-4">
                  {dailyChallenge.brawler}
                </h2>
              )}
            </div>
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mb-4 max-w-md mx-auto px-2">
            <BrawlerAutocomplete
              brawlers={brawlers} // Use the imported brawlers array
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
        {/* Victory popup - only show if not in survival mode */}
        {isGameOver && !skipVictoryScreen && (
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
