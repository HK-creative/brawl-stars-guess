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

  // Mode navigation data
  const modes = [
    { 
      key: 'classic', 
      name: 'Classic', 
      path: '/daily/classic',
      icon: '/ClassicIcon.png',
      color: 'from-amber-800 to-yellow-900',
      bgColor: 'bg-amber-800/30',
      borderColor: 'border-amber-600'
    },
    { 
      key: 'gadget', 
      name: 'Gadget', 
      path: '/daily/gadget',
      icon: '/GadgetIcon.png',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-600/30',
      borderColor: 'border-green-500'
    },
    { 
      key: 'starpower', 
      name: 'Star Power', 
      path: '/daily/starpower',
      icon: '/StarpowerIcon.png',
      color: 'from-orange-500 to-yellow-600',
      bgColor: 'bg-orange-600/30',
      borderColor: 'border-orange-500'
    },
    { 
      key: 'audio', 
      name: 'Audio', 
      path: '/daily/audio',
      icon: '/AudioIcon.png',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-600/30',
      borderColor: 'border-purple-500'
    },
    { 
      key: 'pixels', 
      name: 'Pixels', 
      path: '/daily/pixels',
      icon: '/PixelsIcon.png',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-600/30',
      borderColor: 'border-blue-500'
    },
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
      <div className="daily-mode-container daily-audio-theme">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-mode-container daily-audio-theme">
      {/* Confetti Animation */}
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
      
      {/* Header Section */}
      <div className="w-full max-w-4xl mx-auto px-4 py-2 relative">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Button */}
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <img 
              src="/bs_home_icon.png"
              alt="Home"
              className="h-8 w-8"
            />
          </button>

          {/* Right side: Streak and Timer */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold leading-none text-yellow-500">{streak}</span>
                <div className="text-2xl">🔥</div>
              </div>
              <span className="text-xs text-white/70 font-medium mt-1">daily streak</span>
            </div>

            {/* Timer */}
            <div className="flex flex-col items-center px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white/90">
              <span className="text-[8px] text-white/60 font-medium uppercase tracking-wide">Next Brawler In</span>
              <span className="font-mono text-white font-bold text-xs">
                {formatTime(timeUntilNext)}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Navigation Pills */}
        <div className="flex items-center justify-center gap-1.5 mb-4 mt-3">
          {modes.map((mode) => {
            const isCurrent = mode.key === 'audio';
            
            return (
              <button
                key={mode.key}
                onClick={() => handleModeClick(mode)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                  isCurrent
                    ? `bg-gradient-to-r ${mode.color} text-white shadow-lg shadow-${mode.color.split(' ')[1]}/30`
                    : `${mode.bgColor} ${mode.borderColor} text-white/70 hover:text-white/90 border-2 opacity-40 hover:opacity-70`,
                  !isCurrent && "cursor-pointer"
                )}
                disabled={isCurrent}
              >
                <img 
                  src={mode.icon}
                  alt={`${mode.name} Icon`}
                  className="w-6 h-6"
                />
                
                {/* Current mode indicator dot */}
                {isCurrent && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-800"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Title */}
        <div className="text-center mb-6">
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
                <div className="flex flex-col items-center gap-6 mb-6">
                  {/* Main Audio */}
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-white/20 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden shadow-2xl p-6">
                    <div className="text-center flex-1 flex flex-col justify-center gap-6">
                      {/* Main Play Button - Cool Circle Design */}
                      <button
                        onClick={playAudio}
                        disabled={!audioReady || audioError}
                        className={cn(
                          "w-20 h-20 rounded-full text-white font-medium transition-all duration-300 flex items-center justify-center mx-auto relative overflow-hidden",
                          audioReady && !audioError
                            ? "bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 hover:from-blue-600 hover:via-purple-700 hover:to-blue-800 shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105"
                            : "bg-gray-500 cursor-not-allowed opacity-50"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                        {isPlaying ? (
                          <Pause className="h-8 w-8 relative z-10" />
                        ) : (
                          <Play className="h-8 w-8 relative z-10 ml-1" />
                        )}
                      </button>
                      
                      {/* Hint Button - Always Visible */}
                      <button
                        onClick={playHintAudio}
                        disabled={!showHint || !hintAudioReady}
                        className={cn(
                          "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 mx-auto",
                          showHint && hintAudioReady
                            ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-lg transform hover:scale-105"
                            : "bg-gray-600/50 text-white/50 cursor-not-allowed"
                        )}
                      >
                        {showHint && hintAudioReady ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/50"></div>
                            Hint available in {Math.max(0, 4 - audio.guessCount)} guesses
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="daily-mode-input-section mb-8">
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
                <div className="flex justify-center mb-4">
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
                  <div className="flex justify-center mt-4">
                    <span className="text-sm text-white/50">
                      yesterday's audio was <span className="text-yellow-500 font-medium">{yesterdayData.brawler || 'Mico'}</span>
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