import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash, Volume2, Play, Pause, RotateCcw, Home, Flame } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers, getBrawlerDisplayName } from '@/data/brawlers';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { cn } from '@/lib/utils';
import { t, getLanguage } from '@/lib/i18n';
import { useStreak } from '@/contexts/StreakContext';

const DailyAudioMode: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { streak } = useStreak();
  const currentLanguage = getLanguage();

  // Daily store
  const {
    audio,
    timeUntilNext,
    isLoading,
    initializeDailyModes,
    incrementGuessCount,
    completeMode,
    resetGuessCount,
    updateTimeUntilNext,
    saveGuess,
    getGuesses,
  } = useDailyStore();

  // Local game state
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<any>(null);
  const [guesses, setGuesses] = useState<any[]>([]);
  const [guessedBrawlerNames, setGuessedBrawlerNames] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioData, setAudioData] = useState<any>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [yesterdayData, setYesterdayData] = useState<any>(null);
  
  // Hint system state
  const [hintAudioElement, setHintAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isHintPlaying, setIsHintPlaying] = useState(false);
  const [hintAudioReady, setHintAudioReady] = useState(false);
  const [hintAudioError, setHintAudioError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Mode navigation
  const modes = [
    { key: 'classic', name: 'Classic', path: '/daily/classic' },
    { key: 'gadget', name: 'Gadget', path: '/daily/gadget' },
    { key: 'starpower', name: 'Star Power', path: '/daily/starpower' },
    { key: 'audio', name: 'Audio', path: '/daily/audio' },
    { key: 'pixels', name: 'Pixels', path: '/daily/pixels' },
  ];

  // Initialize daily modes on component mount
  useEffect(() => {
    initializeDailyModes();
    
    // Update timer immediately and then every minute
    updateTimeUntilNext();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [initializeDailyModes]);

  // Load audio data and yesterday's challenge
  useEffect(() => {
    const loadAudioData = async () => {
      try {
        const [data, yesterdayChallenge] = await Promise.all([
          fetchDailyChallenge('audio'),
          fetchYesterdayChallenge('audio')
        ]);
        
        setAudioData(data);
        setYesterdayData(yesterdayChallenge);
        
        // Create audio element
        if (data?.audioFile) {
          const audio = new Audio(data.audioFile);
          
          audio.addEventListener('ended', () => {
            setIsPlaying(false);
          });
          
          audio.addEventListener('canplaythrough', () => {
            setAudioReady(true);
            setAudioError(false);
          });
          
          audio.addEventListener('loadeddata', () => {
            setAudioReady(true);
            setAudioError(false);
          });
          
          audio.addEventListener('error', (e) => {
            setAudioError(true);
            setAudioReady(false);
          });
          
          audio.load();
          setAudioElement(audio);
          
          // Create hint audio element if available
          if (data?.hintAudioFile && data?.hasHint) {
            const hintAudio = new Audio(data.hintAudioFile);
            
            hintAudio.addEventListener('ended', () => {
              setIsHintPlaying(false);
            });
            
            hintAudio.addEventListener('canplaythrough', () => {
              setHintAudioReady(true);
              setHintAudioError(false);
            });
            
            hintAudio.addEventListener('loadeddata', () => {
              setHintAudioReady(true);
              setHintAudioError(false);
            });
            
            hintAudio.addEventListener('error', (e) => {
              setHintAudioError(true);
              setHintAudioReady(false);
            });
            
            hintAudio.load();
            setHintAudioElement(hintAudio);
          }
        } else {
          setAudioError(true);
          setAudioReady(false);
        }
      } catch (error) {
        console.error('Error loading audio data:', error);
        setAudioError(true);
        setAudioReady(false);
        setAudioData(null);
      }
    };
    
    loadAudioData();
  }, []);

  // Load saved guesses when component mounts or audio data changes
  useEffect(() => {
    const savedGuesses = getGuesses('audio');
    setGuesses(savedGuesses);
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [audio.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (audio.isCompleted) {
      setShowVictoryScreen(true);
    }
  }, [audio.isCompleted]);

  const getCorrectBrawler = useCallback(() => {
    return brawlers.find(b => b.name.toLowerCase() === audio.brawlerName.toLowerCase()) || brawlers[0];
  }, [audio.brawlerName]);

  const playAudio = () => {
    if (audioElement && audioReady && !audioError) {
      if (isPlaying) {
        audioElement.pause();
        audioElement.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const playHintAudio = () => {
    if (hintAudioElement && hintAudioReady && !hintAudioError) {
      if (isHintPlaying) {
        hintAudioElement.pause();
        hintAudioElement.currentTime = 0;
        setIsHintPlaying(false);
      } else {
        hintAudioElement.play();
        setIsHintPlaying(true);
      }
    }
  };

  const handleSubmit = useCallback(() => {
    if (!selectedBrawler || !audioData || guessedBrawlerNames.includes(selectedBrawler.name)) {
      return;
    }

    const newGuess = selectedBrawler;
    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setGuessedBrawlerNames([...guessedBrawlerNames, newGuess.name]);
    
    // Save guess to store
    saveGuess('audio', newGuess);
    incrementGuessCount('audio');

    const isCorrect = newGuess.name.toLowerCase() === audioData.brawler.toLowerCase();
    
    if (isCorrect) {
      // Correct guess
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      completeMode('audio');
      
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Unlock hint after first correct guess
      if (guesses.length === 0) {
        setShowHint(true);
      }
    } else if (updatedGuesses.length >= 6) {
      // Game over - max guesses reached
      setIsGameOver(true);
    } else if (updatedGuesses.length >= 3) {
      // Show hint after 3 wrong guesses
      setShowHint(true);
    }

    // Reset form
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, audioData, guessedBrawlerNames, guesses, saveGuess, incrementGuessCount, completeMode]);

  const handleSelectBrawler = useCallback((brawler: any) => {
    setSelectedBrawler(brawler);
    if (brawler) {
      const displayName = getBrawlerDisplayName(brawler, currentLanguage);
      setInputValue(displayName);
    }
  }, [currentLanguage]);

  const formatTime = (time: { hours: number; minutes: number }) => {
    const hours = String(time.hours).padStart(2, '0');
    const minutes = String(time.minutes).padStart(2, '0');
    const seconds = '00'; // Always show 00 for seconds
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleModeClick = (mode: typeof modes[0]) => {
    if (mode.key !== 'audio') {
      navigate(mode.path);
    }
  };

  const handleNextMode = () => {
    navigate('/daily/pixels');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white/20 border-t-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      {showConfetti && <ReactConfetti />}
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Home Button */}
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <Home className="h-6 w-6 text-white" />
          </button>

          {/* Streak */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
              <span className="text-xl font-bold">{streak}</span>
              <Flame className="h-4 w-4 text-yellow-300" />
            </div>
            <span className="text-sm text-white/70 font-medium">daily streak</span>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center px-4 py-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white/90">
            <span className="text-xs text-white/60 font-medium uppercase tracking-wide">Next Brawler In</span>
            <span className="font-mono text-white font-bold text-lg">
              {formatTime(timeUntilNext)}
            </span>
          </div>
        </div>

        {/* Mode Navigation Pills */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {modes.map((mode) => {
            const isCurrent = mode.key === 'audio';
            
            return (
              <button
                key={mode.key}
                onClick={() => handleModeClick(mode)}
                className={cn(
                  "relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300",
                  isCurrent
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-white/10 text-white/60 hover:text-white/80 hover:bg-white/20",
                  !isCurrent && "cursor-pointer"
                )}
                disabled={isCurrent}
              >
                {mode.name}
                
                {/* Current mode indicator dot */}
                {isCurrent && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            Today's Audio
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 pb-4">
        <div className="daily-mode-game-card daily-mode-animate-pulse">
          <div className="daily-mode-card-content">
            {showVictoryScreen ? (
              // Victory Screen
              <div className="daily-mode-victory-section">
                <h2 className="daily-mode-victory-title">
                  GG EZ
                </h2>
                <p className="daily-mode-victory-text">
                  {t('daily.you.found')} <span className="font-bold" style={{ color: 'hsla(var(--daily-mode-primary), 1)' }}>{getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}</span> {t('daily.in.guesses')} {audio.guessCount} {t('daily.guesses.count')}
                </p>
                
                <div className="flex flex-col gap-6 items-center">
                  <Button
                    onClick={handleNextMode}
                    className="daily-mode-next-button"
                  >
                    <img 
                      src="/PixelatedIcon.png" 
                      alt="Pixels Mode" 
                      className={cn(
                        "h-6 w-6",
                        currentLanguage === 'he' ? "ml-2" : "mr-2"
                      )}
                    />
                    {t('daily.next.mode')}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="text-white/60 hover:text-white/80 hover:bg-white/5 py-3 px-8 text-base border border-white/20 hover:border-white/30 transition-all duration-200 rounded-xl"
                  >
                    {t('daily.go.home')}
                  </Button>
                </div>
              </div>
            ) : (
              // Game Content
              <div className="daily-mode-game-area">
                {/* Audio Player */}
                <div className="flex flex-col items-center gap-6 mb-8">
                  {/* Main Audio */}
                  <div className="w-80 h-80 md:w-96 md:h-96 rounded-3xl border-4 border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                    <div className="text-center">
                      <div className="text-8xl mb-6">🎵</div>
                      <div className="text-white/70 mb-6">Mystery Audio</div>
                      
                      <button
                        onClick={playAudio}
                        disabled={!audioReady || audioError}
                        className={cn(
                          "px-8 py-4 rounded-full text-white font-medium transition-all duration-200 flex items-center gap-3 mx-auto",
                          audioReady && !audioError
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                            : "bg-gray-500 cursor-not-allowed opacity-50"
                        )}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-5 w-5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5" />
                            Play Audio
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Hint Audio */}
                  {showHint && hintAudioReady && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-white/50 text-sm">Hint Audio Available</div>
                      <button
                        onClick={playHintAudio}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-medium transition-all duration-200 flex items-center gap-2 hover:from-yellow-600 hover:to-orange-700 shadow-lg"
                      >
                        {isHintPlaying ? (
                          <>
                            <Pause className="h-4 w-4" />
                            Pause Hint
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Play Hint
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Search Bar */}
                <div className="daily-mode-input-section mb-6">
                  <BrawlerAutocomplete
                    brawlers={brawlers}
                    value={inputValue}
                    onChange={setInputValue}
                    onSelect={handleSelectBrawler}
                    onSubmit={handleSubmit}
                    disabled={audio.isCompleted}
                    disabledBrawlers={guessedBrawlerNames}
                  />
                </div>

                {/* Guesses Counter */}
                <div className="flex justify-center mb-6">
                  <div className="daily-mode-guess-counter">
                    <Hash className="h-5 w-5" />
                    <span>{audio.guessCount} {t('guesses.count')}</span>
                  </div>
                </div>

                {/* Guesses Grid */}
                {guesses.length > 0 && (
                  <div className="daily-mode-guesses-section">
                    <div className="daily-mode-guesses-grid">
                      {guesses.map((guess, index) => {
                        const isCorrect = guess.name.toLowerCase() === getCorrectBrawler().name.toLowerCase();
                        const portraitSrc = getPortrait(guess.name) || DEFAULT_PORTRAIT;
                        
                        return (
                          <div
                            key={index}
                            className={cn(
                              "daily-mode-guess-item",
                              isCorrect ? "daily-mode-guess-correct" : "daily-mode-guess-incorrect"
                            )}
                          >
                            <img
                              src={portraitSrc}
                              alt={guess.name}
                              className="daily-mode-guess-portrait"
                            />
                            <span className="daily-mode-guess-name">
                              {getBrawlerDisplayName(guess, currentLanguage)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Yesterday's Audio */}
                {yesterdayData && (
                  <div className="flex justify-center mt-6">
                    <span className="text-sm text-white/50">
                      yesterday's audio was <span className="text-white/70 font-medium">{yesterdayData.brawler || 'Mico'}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAudioMode; 