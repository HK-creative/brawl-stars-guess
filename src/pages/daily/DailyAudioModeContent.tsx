import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useDailyStore, DailyGameMode } from '@/stores/useDailyStore';
import { useStreak } from '@/contexts/StreakContext';
import { brawlers, getBrawlerDisplayName, getBrawlerLocalizedName } from '@/data/brawlers';
import { getPortrait } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import PrimaryButton from '@/components/ui/primary-button';
import SecondaryButton from '@/components/ui/secondary-button';
import ModeTitle from '@/components/ModeTitle';
import DailyModeProgress from '@/components/DailyModeProgress';

import usePageTitle from '@/hooks/usePageTitle';

import { Clock, Hash, Flame, Home, Play, Pause, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

const DEFAULT_PORTRAIT = '/portraits/shelly.png';

// Helper to get audio file path with fallback variants
const getAudioFileVariants = (brawler: string, audioType?: string): string[] => {
  if (!brawler) {
    return [];
  }
  
  // Clean up brawler name for file path
  const normalizedBrawler = brawler.toLowerCase().replace(/ /g, '_');
  
  // Handle special cases
  const specialCases: { [key: string]: string } = {
    'el_primo': 'el_primo',
    '8-bit': '8_bit',
    'mr._p': 'mr_p'
  };
  
  const finalBrawlerName = specialCases[normalizedBrawler] || normalizedBrawler;
  
  // Generate possible audio file variants
  const variants = [
    `/AudioFiles/${finalBrawlerName}_voice.mp3`,
    `/AudioFiles/${finalBrawlerName}.mp3`,
    `/AudioFiles/${finalBrawlerName}_audio.mp3`
  ];
  
  return variants;
};

interface DailyAudioModeContentProps {
  onModeChange: (mode: DailyGameMode) => void;
  suppressHeader?: boolean;
}

const DailyAudioModeContent: React.FC<DailyAudioModeContentProps> = ({ onModeChange, suppressHeader = false }) => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { streak } = useStreak();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { motionOK, transition } = useMotionPrefs();
  const isRTL = currentLanguage === 'he';

  const {
    audio,
    timeUntilNext,
    completeMode,
    resetGuessCount,
    updateTimeUntilNext,
    submitGuess,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioVariants, setAudioVariants] = useState<string[]>([]);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [yesterdayData, setYesterdayData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hint system state
  const [showHint, setShowHint] = useState(false);
  const [hintAudioFile, setHintAudioFile] = useState<string>('');
  const [isHintPlaying, setIsHintPlaying] = useState(false);
  const [hintAudioReady, setHintAudioReady] = useState(false);
  const [hintAudioError, setHintAudioError] = useState(false);
  const hintAudioRef = useRef<HTMLAudioElement | null>(null);

  // Update timer immediately and then every minute
  useEffect(() => {
    updateTimeUntilNext();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateTimeUntilNext]);

  // Show hint after 4 guesses
  useEffect(() => {
    if (audio.guessCount >= 4 && hintAudioFile && !audio.isCompleted) {
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  }, [audio.guessCount, hintAudioFile, audio.isCompleted]);

  // Load audio data and generate audio file
  useEffect(() => {
    const loadAudioData = async () => {
      try {
        setIsLoading(true);
        const [data, yesterdayChallenge] = await Promise.all([
          fetchDailyChallenge('audio'),
          fetchYesterdayChallenge('audio')
        ]);
        
        console.log('Loaded audio data:', data);
        setAudioData(data);
        setYesterdayData(yesterdayChallenge);
        
        // Use audio file from data instead of generating wrong paths
        if (data?.brawler && data?.audioFile) {
          console.log('Using audio file from data:', data.audioFile);
          setAudioUrl(data.audioFile);
          setAudioVariants([data.audioFile]);
          setCurrentVariantIndex(0);
          setAudioLoaded(false);
          setAudioError(false);
          
          // Load hint audio from daily challenge data
          if (data.hintAudioFile) {
            console.log('Using hint audio from data:', data.hintAudioFile);
            setHintAudioFile(data.hintAudioFile);
          } else {
            // Fallback: use the same audio file as hint
            setHintAudioFile(data.audioFile);
          }
        } else {
          console.warn('No brawler or audio data found in audio challenge');
          setAudioUrl('/AudioFiles/shelly_audio_01.mp3');
          setAudioVariants([]);
          setCurrentVariantIndex(0);
          setAudioLoaded(false);
          setAudioData(null);
        }
      } catch (error) {
        console.error('Error loading audio data:', error);
        setAudioUrl('/AudioFiles/shelly_audio_01.mp3');
      } finally {
        setIsLoading(false);
      }
    };

    loadAudioData();
  }, []);

  // Load existing guesses from store
  useEffect(() => {
    const existingGuesses = getGuesses('audio');
    setGuesses(existingGuesses);
    setGuessedBrawlerNames(existingGuesses.map((g: any) => g.name));
    
    if (audio.isCompleted) {
      setIsGameOver(true);
      setShowVictoryScreen(true);
    }
  }, [audio, getGuesses]);

  const getCorrectBrawler = () => {
    if (audioData?.brawler) {
      return brawlers.find(b => b.name.toLowerCase() === audioData.brawler.toLowerCase()) || brawlers[0];
    }
    return brawlers.find(b => b.name.toLowerCase() === audio.brawlerName.toLowerCase()) || brawlers[0];
  };

  const handleAudioError = () => {
    console.error('Audio failed to load, trying next variant');
    setAudioError(true);
    if (currentVariantIndex < audioVariants.length - 1) {
      setCurrentVariantIndex(prev => prev + 1);
      setAudioUrl(audioVariants[currentVariantIndex + 1]);
    } else {
      // Try fallback
      setAudioUrl('/AudioFiles/shelly_audio_01.mp3');
    }
  };

  const handleAudioLoad = () => {
    console.log('Audio file loaded successfully:', audioUrl);
    setAudioLoaded(true);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioLoaded) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Play hint audio function
  const playHintAudio = () => {
    if (!hintAudioFile || isHintPlaying || hintAudioError) return;

    console.log(`Attempting to play hint audio: ${hintAudioFile}`);
    setIsHintPlaying(true);
    
    // Clean up any existing hint audio element
    if (hintAudioRef.current) {
      hintAudioRef.current.pause();
      hintAudioRef.current.removeEventListener('ended', () => {});
      hintAudioRef.current.removeEventListener('error', () => {});
      hintAudioRef.current = null;
    }
    
    // Create and configure a new audio element
    hintAudioRef.current = new Audio(hintAudioFile);
    
    // Set up event listeners
    hintAudioRef.current.addEventListener('ended', () => {
      setIsHintPlaying(false);
      console.log('Hint audio playback ended');
    });
    
    hintAudioRef.current.addEventListener('error', (error) => {
      console.error('Hint audio playback error:', error);
      setIsHintPlaying(false);
      setHintAudioError(true);
      toast({
        title: "Error",
        description: `Error playing hint audio: ${hintAudioFile}`,
        variant: "destructive"
      });
    });
    
    // Play the hint audio
    hintAudioRef.current.play().catch(error => {
      console.error('Error playing hint audio:', error);
      setIsHintPlaying(false);
      setHintAudioError(true);
      toast({
        title: "Error",
        description: `Error playing hint audio: ${error.message}`,
        variant: "destructive"
      });
    });
  };

  // Handle brawler selection
  const handleSelectBrawler = (brawler: any) => {
    setSelectedBrawler(brawler);
    setInputValue(getBrawlerDisplayName(brawler, currentLanguage));
  };

  // Handle guess submission
  const handleSubmit = useCallback(() => {
    if (!selectedBrawler || !audioData || isSubmitting || guessedBrawlerNames.includes(selectedBrawler.name)) {
      return;
    }
    
    setIsSubmitting(true);
    // Atomic submit to reduce renders and avoid double increments
    const newGuess = selectedBrawler;
    submitGuess('audio', newGuess);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = selectedBrawler.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('audio');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      
      const displayName = getBrawlerDisplayName(correctBrawler, currentLanguage);
      toast({
        title: t('daily.congratulations'),
        description: `${t('daily.you.found')} ${displayName}!`,
        duration: 3000,
      });
    }
    
    // Clear input
    setInputValue('');
    setSelectedBrawler(null);
    setIsSubmitting(false);
  }, [selectedBrawler, audioData, guessedBrawlerNames, submitGuess, completeMode, currentLanguage, getCorrectBrawler]);

  // Handle next mode navigation
  const handleNextMode = () => {
    onModeChange('pixels');
  };

  // Handle play again
  const handlePlayAgain = () => {
    setGuesses([]);
    setGuessedBrawlerNames([]);
    setIsGameOver(false);
    setShowVictoryScreen(false);
    setShowConfetti(false);
    setInputValue('');
    setSelectedBrawler(null);
    resetGuessCount('audio');
  };

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="daily-audio-theme">
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
      {!suppressHeader && (
        <div className="w-full max-w-4xl mx-auto px-4 py-2 relative">
          {/* Top Row: Home Icon, Streak, Timer */}
          <div className="flex items-center justify-between mb-4">
            {/* Home Icon */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              aria-label={t('button.go.home')}
            >
              <img 
                src="/bs_home_icon.png"
                alt={t('button.go.home')}
                className="w-11 h-11"
              />
            </button>

            {/* Right side: Streak and Timer */}
            <div className="flex items-center gap-3">
              {/* Daily Streak - moved to the right */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="text-3xl font-bold leading-none text-[hsl(var(--daily-mode-primary))]">{streak}</span>
                  <div className="text-3xl">🔥</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Navigation */}
          <DailyModeProgress currentMode="audio" className="mb-6 mt-1" onModeChange={onModeChange} />

          {/* Title */}
          <div className="text-center mb-2 mt-2">
            <ModeTitle title={t('mode.audio')} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 pb-4">
        <motion.div
          className="daily-mode-game-card daily-mode-animate-pulse mt-0 md:mt-0 mb-10 md:mb-12"
          initial={motionOK ? { opacity: 0, scale: 0.98 } : { opacity: 0 }}
          animate={{ opacity: 1, scale: 1, transition }}
          layout
        >
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
                <SecondaryButton
                  onClick={() => navigate('/')}
                >
                  {t('daily.go.home')}
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleNextMode}
                  className="px-8 py-3"
                >
                  <img 
                    src="/PixelsIcon.png" 
                    alt="Pixels Mode" 
                    className="h-6 w-6 mr-2"
                  />
                  {t('daily.next.mode')}
                </PrimaryButton>
              </div>
            </div>
          ) : (
            // Game Content
            <div className="daily-mode-game-area">
              {/* Audio Player */}
              <div className="flex justify-center mb-6">
                <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-blue-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onLoadedData={() => setAudioLoaded(true)}
                      onError={() => setAudioError(true)}
                      onEnded={handleAudioEnded}
                      preload="auto"
                    />
                  )}
                  
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      disabled={!audioLoaded || audioError}
                      className="flex items-center justify-center w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border-2 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-1" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-white/60" />
                      <span className="text-white/80 text-sm">
                        {audioLoaded ? t('daily.audio.ready') : t('daily.audio.loading')}
                      </span>
                    </div>
                    
                    {audioError && (
                      <div className="text-red-400 text-sm text-center">
                        {t('daily.audio.error')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hint Indicator - Show before 4 guesses */}
              {!showHint && hintAudioFile && audio.guessCount < 4 && !audio.isCompleted && (
                <div className="flex items-center justify-center space-x-2 px-3 py-2 rounded-full bg-yellow-500/10 border border-yellow-400/20 mb-4 max-w-md mx-auto">
                  <span className="text-yellow-400/70 text-xs">💡</span>
                  <span className="text-yellow-400/70 text-xs font-medium">
                    {t('audio.hint.available.in')} {4 - audio.guessCount} {(4 - audio.guessCount) === 1 ? t('audio.hint.guess') : t('audio.hint.guesses')}
                  </span>
                </div>
              )}

              {/* Hint System - Show after 4 guesses */}
              {showHint && hintAudioFile && !audio.isCompleted && (
                <div className="flex items-center justify-center gap-3 px-4 py-2 bg-yellow-500/20 rounded-full border border-yellow-400/50 mb-4 max-w-md mx-auto animate-in slide-in-from-top-2 duration-500">
                  <span className="text-yellow-300 text-sm font-medium">{t('ui.need_hint')}</span>
                  <button
                    onClick={playHintAudio}
                    disabled={isHintPlaying || hintAudioError}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all",
                      isHintPlaying ? "bg-yellow-500/30 text-yellow-200" : "bg-yellow-500/50 hover:bg-yellow-500/70 text-yellow-100"
                    )}
                  >
                    <Play size={14} className={isHintPlaying ? "animate-pulse" : ""} />
                    {isHintPlaying ? t('button.playing') : t('button.play.hint')}
                  </button>
                </div>
              )}

              {/* Search Bar */}
              <div className="daily-mode-input-section mb-8 w-full max-w-md mx-auto">
                <BrawlerAutocomplete
                  brawlers={brawlers}
                  value={inputValue}
                  onChange={setInputValue}
                  onSelect={handleSelectBrawler}
                  onSubmit={() => handleSubmit()}
                  disabled={audio.isCompleted}
                  disabledBrawlers={guessedBrawlerNames}
                />
              </div>

              {/* Guesses Counter */}
              <div className="flex justify-center mb-4">
                <div className="daily-mode-guess-counter flex items-center">
                  <span className="font-bold text-lg mr-1">#</span>
                  <div className="font-bold text-lg">
                    <SlidingNumber value={audio.guessCount} />
                  </div>
                  <span className="text-white/90 ml-1">{t('guesses.count')}</span>
                </div>
              </div>

              {/* Guesses Grid */}
              {guesses.length > 0 && (
                <div className="daily-mode-guesses-section">
                  <div className="daily-mode-guesses-grid">
                    <AnimatePresence initial={false}>
                      {guesses.map((guess, index) => {
                        const isCorrect = guess.name.toLowerCase() === getCorrectBrawler().name.toLowerCase();
                        const portraitSrc = getPortrait(guess.name) || DEFAULT_PORTRAIT;

                        return (
                          <motion.div
                            key={index}
                            className={cn(
                              "daily-mode-guess-item",
                              isCorrect ? "daily-mode-guess-correct" : "daily-mode-guess-incorrect"
                            )}
                            initial={motionOK ? { opacity: 0, y: 8, x: isRTL ? 8 : -8 } : { opacity: 0 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              x: 0,
                              transition: { ...transition, delay: motionOK ? Math.min(index * 0.04, 0.3) : 0 },
                            }}
                            exit={{ opacity: 0, y: -4, x: 0, transition }}
                            layout
                          >
                            <img
                              src={portraitSrc}
                              alt={guess.name}
                              className="daily-mode-guess-portrait"
                            />
                            <span className="daily-mode-guess-name">
                              {getBrawlerDisplayName(guess, currentLanguage)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Yesterday's Brawler */}
              {yesterdayData && (
                <div className="flex justify-center mt-4">
                  <span className="text-sm text-white/80">
                    {t('daily.yesterday.audio')}{' '}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={yesterdayData.brawler}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition }}
                        exit={{ opacity: 0, transition }}
                        className="text-[hsl(var(--daily-mode-primary))] font-medium"
                      >
                        {getBrawlerLocalizedName(yesterdayData.brawler || 'Mico', currentLanguage)}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </div>
              )}

              {/* Next Brawler In Timer - moved below yesterday's */}
              <div className="flex justify-center mt-3">
                <div className="flex flex-col items-center text-white/90 px-3">
                  <span className="text-xs text-white/90 font-medium uppercase tracking-wide">{t('daily.next.brawler.in')}</span>
                  <span className="font-mono text-white font-bold text-xl">
                    {formatTime(timeUntilNext)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DailyAudioModeContent;
