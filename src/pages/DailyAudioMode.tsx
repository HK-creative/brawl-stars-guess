import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash, Volume2, Play } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers, getBrawlerDisplayName } from '@/data/brawlers';
import { getPortrait } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import HomeButton from '@/components/ui/home-button';
import DailyModeProgress from '@/components/DailyModeProgress';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, getTodaysBrawlers, getTomorrowsBrawlers } from '@/lib/daily-challenges';
import { cn } from '@/lib/utils';
import { t, getLanguage } from '@/lib/i18n';

const DailyAudioMode: React.FC = () => {
  // Inject custom award styles into the document head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes award-glow {
        0% { text-shadow: 0 0 1.5px rgba(255,214,0,0.09), 0 0 3px rgba(255,214,0,0.09), 0 0 4.5px rgba(255,214,0,0.06); }
        100% { text-shadow: 0 0 2.4px rgba(255,214,0,0.12), 0 0 4.8px rgba(255,214,0,0.09), 0 0 7.2px rgba(255,214,0,0.075); }
      }
      .animate-award-glow { 
        animation: award-glow 3s infinite alternate; 
        will-change: transform, text-shadow;
      }
      @keyframes award-bar {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
      .animate-award-bar { animation: award-bar 3s infinite; }
      @keyframes award-card {
        0% { box-shadow: 0 8px 40px 0 rgba(255,214,0,0.10); }
        50% { box-shadow: 0 16px 64px 0 rgba(255,214,0,0.18); }
        100% { box-shadow: 0 8px 40px 0 rgba(255,214,0,0.10); }
      }
      .animate-award-card { animation: award-card 2.5s infinite alternate; }
      @keyframes ping-slow { 75%, 100% { transform: scale(1.2); opacity: 0; } }
      .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0,0,0.2,1) infinite; }
      @keyframes ping-slow-2 { 75%, 100% { transform: scale(1.4); opacity: 0; } }
      .animate-ping-slow-2 { animation: ping-slow-2 3s cubic-bezier(0,0,0.2,1) infinite; }
    `;
    document.head.appendChild(style);
    
    // Add debug functions to window object in development
    if (process.env.NODE_ENV === 'development') {
      (window as any).getTodaysBrawlers = getTodaysBrawlers;
      (window as any).getTomorrowsBrawlers = getTomorrowsBrawlers;
      console.log('🎯 Debug functions available:');
      console.log('  - getTodaysBrawlers() - Show today\'s brawlers for all modes');
      console.log('  - getTomorrowsBrawlers() - Show tomorrow\'s brawlers for all modes');
    }
    
    return () => { 
      document.head.removeChild(style);
      if (process.env.NODE_ENV === 'development') {
        delete (window as any).getTodaysBrawlers;
        delete (window as any).getTomorrowsBrawlers;
      }
    };
  }, []);

  const navigate = useNavigate();
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

  const currentLanguage = getLanguage();

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

  // Load audio data
  useEffect(() => {
    const loadAudioData = async () => {
      console.log('Loading audio data for DailyAudioMode...');
      try {
        const data = await fetchDailyChallenge('audio');
        console.log('Received audio challenge data:', data);
        console.log('Today\'s audio brawler:', data?.brawler);
        console.log('Audio file path:', data?.audioFile);
        setAudioData(data);
        
        // Create audio element
        if (data?.audioFile) {
          console.log('Creating audio element with file:', data.audioFile);
          const audio = new Audio(data.audioFile);
          
          audio.addEventListener('ended', () => {
            console.log('Audio playback ended');
            setIsPlaying(false);
          });
          
          audio.addEventListener('canplaythrough', () => {
            console.log('Audio can play through - audio is ready');
            setAudioReady(true);
            setAudioError(false);
          });
          
          audio.addEventListener('loadeddata', () => {
            console.log('Audio data loaded successfully');
            setAudioReady(true);
            setAudioError(false);
          });
          
          audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e, 'src:', audio.src);
            setAudioError(true);
            setAudioReady(false);
            
            console.log('Audio failed to load, showing error state');
          });
          
          // Start loading the audio
          audio.load();
          setAudioElement(audio);
        } else {
          // No audio file provided, show error instead of fallback
          console.warn('No audio file in challenge data');
          setAudioError(true);
          setAudioReady(false);
        }
      } catch (error) {
        console.error('Error loading audio data:', error);
        setAudioError(true);
        setAudioReady(false);
      }
    };
    
    loadAudioData();
    
    // Cleanup audio on unmount
    return () => {
      if (audioElement) {
        console.log('Cleaning up audio element');
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, []);

  // Load saved guesses when component mounts or audio data changes
  useEffect(() => {
    const savedGuesses = getGuesses('audio');
    setGuesses(savedGuesses);
    // Extract brawler names from saved guesses to prevent duplicates
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [audio.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (audio.isCompleted) {
      setShowVictoryScreen(true);
    }
  }, [audio.isCompleted]);

  // Find the correct brawler object
  const getCorrectBrawler = useCallback(() => {
    return brawlers.find(b => b.name.toLowerCase() === audio.brawlerName.toLowerCase()) || brawlers[0];
  }, [audio.brawlerName]);

  // Handle audio play/pause (survival mode style)
  const playAudio = () => {
    console.log('playAudio called', { audioElement: !!audioElement, audioReady, audioError });
    
    if (audioElement && audioReady && !audioError) {
      audioElement.currentTime = 0; // Reset to beginning
      console.log('Attempting to play audio:', audioElement.src);
      
      audioElement.play()
        .then(() => {
          console.log('Audio play started successfully');
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Failed to play audio:', error);
          setAudioError(true);
          toast({
            title: "Audio Error",
            description: "Failed to play audio. Please try refreshing the page.",
          });
        });
    } else if (!audioReady) {
      console.log('Audio not ready yet');
      toast({
        title: "Audio Loading",
        description: "Audio file is still loading. Please wait a moment.",
      });
    } else if (audioError) {
      console.log('Audio has error, attempting to reload');
      toast({
        title: "Audio Error",
        description: "There was an issue with the audio. Please refresh the page.",
      });
    } else {
      console.log('No audio element available');
      toast({
        title: "Audio Error",
        description: "Audio is not available. Please refresh the page.",
      });
    }
  };

  // Handle guess submission
  const handleSubmit = useCallback((brawler?: any) => {
    const brawlerToSubmit = brawler || selectedBrawler;
    
    if (!brawlerToSubmit || audio.isCompleted) return;

    // Increment guess count in store
    incrementGuessCount('audio');
    
    // Add guess to store and local state
    const newGuess = brawlerToSubmit;
    saveGuess('audio', newGuess);
    setGuesses(prev => [...prev, newGuess]);
    setGuessedBrawlerNames(prev => [...prev, brawlerToSubmit.name]);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = brawlerToSubmit.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('audio');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      
      // Stop audio
      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }
      
      toast({
        title: "Congratulations! 🎉",
        description: `You found ${getBrawlerDisplayName(correctBrawler, currentLanguage)}!`,
      });
    }
    
    // Reset input
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, audio.isCompleted, incrementGuessCount, saveGuess, getCorrectBrawler, completeMode, audioElement, currentLanguage]);

  // Handle brawler selection and immediate submission
  const handleSelectBrawler = useCallback((brawler: any) => {
    setSelectedBrawler(brawler);
    const displayName = getBrawlerDisplayName(brawler, currentLanguage);
    setInputValue(displayName);
    
    // Immediately submit the guess
    handleSubmit(brawler);
  }, [handleSubmit, currentLanguage]);

  // Handle next mode navigation (back to classic since audio is last)
  const handleNextMode = () => {
    navigate('/daily/classic');
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
    
    // Stop audio
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col">
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

      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-white/5 py-4 px-4 flex items-center justify-between sticky top-0 z-10">
        <HomeButton />
        <div className="flex-1 flex justify-center">
          <DailyModeProgress currentMode="audio" />
        </div>
        <div className="w-[40px]"></div> {/* Spacer to balance the layout */}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 items-center justify-center relative">
        {/* Header Info */}
        <div className="mb-6 flex flex-col items-center justify-center relative z-10">
          {/* Bigger Centered Headline */}
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_1px_6px_rgba(255,214,0,0.4)] animate-award-glow daily-mode-title">
              {t('daily.audio.title')}
            </h1>
          </div>
          
          <div className="flex flex-row items-center gap-4 mt-2">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/60 to-purple-400/50 shadow-md border border-blue-300/30 text-lg font-bold text-white">
              <Hash className="h-6 w-6 text-white/80" />
              {audio.guessCount} {t('guesses.count')}
            </span>
          </div>
          
          {/* Redesigned Timer - More Minimal */}
          <div className="mt-4 flex items-center gap-2 px-2 py-1 text-white/70">
            <Clock className="h-4 w-4 text-white/60" />
            <span className="text-sm font-medium">
              {t('next.brawler.in')}: {timeUntilNext.hours}h {timeUntilNext.minutes}m
            </span>
          </div>
        </div>

        {/* Game Card */}
        <Card className="flex-1 w-full max-w-2xl mx-auto bg-gradient-to-br from-yellow-200/20 via-pink-100/10 to-slate-900/60 border-4 border-yellow-400 shadow-[0_8px_40px_0_rgba(255,214,0,0.10)] rounded-3xl overflow-hidden relative z-10 animate-award-card">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-yellow-300 opacity-80 blur-sm animate-award-bar" />
          <div className="p-4 md:p-8">
            {showVictoryScreen ? (
              // Victory Screen
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                  {t('daily.congratulations')}
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  {t('daily.you.found')} <span className="text-yellow-400 font-bold">{getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}</span> {t('daily.in.guesses')} {audio.guessCount} {t('daily.guesses.count')}
                </p>
                <p className="text-xl text-green-400 font-bold mb-6">
                  {t('daily.all.modes.completed')} 🎊
                </p>
                <div className="flex flex-col gap-4 items-center justify-center">
                  <Button
                    onClick={handleNextMode}
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white py-4 px-12 text-xl font-bold shadow-xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 border-2 border-emerald-300/50 w-full max-w-sm"
                  >
                    <img 
                      src="/ClassicIcon.png" 
                      alt="Classic Mode" 
                      className={cn(
                        "h-6 w-6",
                        currentLanguage === 'he' ? "ml-2" : "mr-2"
                      )}
                    />
                    {t('daily.back.to')} Classic
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="text-white/40 hover:text-white/60 hover:bg-white/5 py-2 px-6 text-sm border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    {t('daily.go.home')}
                  </Button>
                </div>
              </div>
            ) : (
              // Game Content
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2 mode-headline-audio">
                    {t('daily.audio.headline')}
                  </h2>
                  <p className="text-white/70 mb-4">
                    {t('daily.audio.description')}
                  </p>
                  
                  {/* Audio Player - Survival Mode Style */}
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
                            audioError && "bg-red-500 cursor-not-allowed",
                            !audioReady && !audioError && "bg-gray-500 cursor-wait"
                          )}
                        >
                          {!audioReady && !audioError ? (
                            <div className="loading-spinner" />
                          ) : isPlaying ? (
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
                      {audioError ? (
                        <div className="space-y-2">
                          <p className="text-red-400 text-sm">Audio failed to load</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white"
                          >
                            Refresh Page
                          </button>
                        </div>
                      ) : !audioReady ? (
                        <div className="flex flex-col items-center space-y-2">
                          <p className="text-yellow-400 text-sm">Loading audio...</p>
                          <div className="loading-dots">
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                          </div>
                        </div>
                      ) : isPlaying ? (
                        <p className="text-blue-400 text-sm animate-pulse">{t('daily.audio.playing')}</p>
                      ) : (
                        <p className="text-white/70 text-sm">{t('daily.audio.click.play')}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input Form - No Submit Button */}
                <div className="space-y-4">
                  <BrawlerAutocomplete
                    brawlers={brawlers}
                    value={inputValue}
                    onChange={setInputValue}
                    onSelect={handleSelectBrawler}
                    disabled={audio.isCompleted}
                    disabledBrawlers={guessedBrawlerNames}
                  />
                </div>

                {/* Guesses */}
                <div className="space-y-2">
                  <div className="w-full max-w-md mx-auto">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-4 md:gap-y-3">
                      {guesses.map((guess, idx) => {
                        const isCorrect = guess.name.toLowerCase() === getCorrectBrawler().name.toLowerCase();
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
                              src={getPortrait(guess.name.toLowerCase())}
                              alt={getBrawlerDisplayName(guess, currentLanguage)}
                              className="w-14 h-14 md:w-20 md:h-20 rounded-xl object-cover border border-yellow-400 shadow-lg mx-auto"
                              onError={(e) => {
                                e.currentTarget.src = '/portraits/shelly.png';
                              }}
                            />
                            <span className="text-base md:text-2xl font-extrabold text-white text-center mt-2 truncate w-full" style={{lineHeight: 1.1}}>
                              {getBrawlerDisplayName(guess, currentLanguage)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DailyAudioMode; 