import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash, Volume2, Play, Pause } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
  const { toast } = useToast();

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
  
  // Hint system state
  const [hintAudioElement, setHintAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isHintPlaying, setIsHintPlaying] = useState(false);
  const [hintAudioReady, setHintAudioReady] = useState(false);
  const [hintAudioError, setHintAudioError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Initialize daily modes on component mount
  useEffect(() => {
    initializeDailyModes();
    
    // Update timer immediately and then every minute
    updateTimeUntilNext();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [initializeDailyModes, updateTimeUntilNext]);

  // Load audio data
  useEffect(() => {
    const loadAudioData = async () => {
      console.log('Loading audio data for DailyAudioMode...');
      try {
        const data = await fetchDailyChallenge('audio');
        console.log('Received audio challenge data:', data);
        console.log('Today\'s audio brawler:', data?.brawler);
        console.log('Audio file path:', data?.audioFile);
        console.log('Has hint:', data?.hasHint);
        console.log('Hint audio file:', data?.hintAudioFile);
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
          
          // Create hint audio element if available
          if (data?.hintAudioFile && data?.hasHint) {
            console.log('Creating hint audio element with file:', data.hintAudioFile);
            const hintAudio = new Audio(data.hintAudioFile);
            
            hintAudio.addEventListener('ended', () => {
              console.log('Hint audio playback ended');
              setIsHintPlaying(false);
            });
            
            hintAudio.addEventListener('canplaythrough', () => {
              console.log('Hint audio can play through - hint audio is ready');
              setHintAudioReady(true);
              setHintAudioError(false);
            });
            
            hintAudio.addEventListener('loadeddata', () => {
              console.log('Hint audio data loaded successfully');
              setHintAudioReady(true);
              setHintAudioError(false);
            });
            
            hintAudio.addEventListener('error', (e) => {
              console.error('Hint audio loading error:', e, 'src:', hintAudio.src);
              setHintAudioError(true);
              setHintAudioReady(false);
            });
            
            // Start loading the hint audio
            hintAudio.load();
            setHintAudioElement(hintAudio);
          }
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
      if (hintAudioElement) {
        console.log('Cleaning up hint audio element');
        hintAudioElement.pause();
        hintAudioElement.src = '';
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
    
    // Check if hint should be shown based on saved guesses
    if (savedGuesses.length >= 4 && audioData?.hasHint && !audio.isCompleted) {
      setShowHint(true);
    }
  }, [audio.brawlerName, getGuesses, audioData?.hasHint, audio.isCompleted]);

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
            id: String(Date.now()),
            title: "Audio Error",
            description: "Failed to play audio. Please try refreshing the page.",
          });
        });
    } else if (!audioReady) {
      console.log('Audio not ready yet');
      toast({
        id: String(Date.now()),
        title: "Audio Loading",
        description: "Audio file is still loading. Please wait a moment.",
      });
    } else if (audioError) {
      console.log('Audio has error, attempting to reload');
      toast({
        id: String(Date.now()),
        title: "Audio Error",
        description: "There was an issue with the audio. Please refresh the page.",
      });
    } else {
      console.log('No audio element available');
      toast({
        id: String(Date.now()),
        title: "Audio Error",
        description: "Audio is not available. Please refresh the page.",
      });
    }
  };

  // Handle hint audio play/pause
  const playHintAudio = () => {
    console.log('playHintAudio called', { hintAudioElement: !!hintAudioElement, hintAudioReady, hintAudioError });
    
    if (hintAudioElement && hintAudioReady && !hintAudioError) {
      hintAudioElement.currentTime = 0; // Reset to beginning
      console.log('Attempting to play hint audio:', hintAudioElement.src);
      
      hintAudioElement.play()
        .then(() => {
          console.log('Hint audio play started successfully');
          setIsHintPlaying(true);
        })
        .catch((error) => {
          console.error('Failed to play hint audio:', error);
          setHintAudioError(true);
          toast({
            id: String(Date.now()),
            title: "Hint Audio Error",
            description: "Failed to play hint audio. Please try refreshing the page.",
          });
        });
    } else if (!hintAudioReady) {
      console.log('Hint audio not ready yet');
      toast({
        id: String(Date.now()),
        title: "Hint Audio Loading",
        description: "Hint audio file is still loading. Please wait a moment.",
      });
    } else if (hintAudioError) {
      console.log('Hint audio has error');
      toast({
        id: String(Date.now()),
        title: "Hint Audio Error",
        description: "There was an issue with the hint audio. Please refresh the page.",
      });
    } else {
      console.log('No hint audio element available');
      toast({
        id: String(Date.now()),
        title: "Hint Audio Error",
        description: "Hint audio is not available.",
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
      if (hintAudioElement) {
        hintAudioElement.pause();
        setIsHintPlaying(false);
      }
      
      toast({
        id: String(Date.now()),
        title: "Congratulations! 🎉",
        description: `You found ${getBrawlerDisplayName(correctBrawler, currentLanguage)}!`,
      });
    } else {
      // Check if we should show hint after 4 wrong guesses
      const newGuessCount = audio.guessCount + 1;
      if (newGuessCount >= 4 && audioData?.hasHint && !showHint) {
        setShowHint(true);
        toast({
          id: String(Date.now()),
          title: "Hint Available! 💡",
          description: "A second audio clip is now available to help you!",
        });
      }
    }
    
    // Reset input
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, audio.isCompleted, incrementGuessCount, saveGuess, getCorrectBrawler, completeMode, audioElement, hintAudioElement, currentLanguage, toast, audio.guessCount, audioData?.hasHint, showHint]);

  // Handle brawler selection and immediate submission
  const handleSelectBrawler = useCallback((brawler: any) => {
    setSelectedBrawler(brawler);
    const displayName = getBrawlerDisplayName(brawler, currentLanguage);
    setInputValue(displayName);
    
    // Immediately submit the guess
    handleSubmit(brawler);
  }, [handleSubmit, currentLanguage]);

  // Handle next mode navigation
  const handleNextMode = () => {
    navigate('/daily/pixels');
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
    setShowHint(false);
    resetGuessCount('audio');
    
    // Stop audio
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
    if (hintAudioElement) {
      hintAudioElement.pause();
      setIsHintPlaying(false);
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
      
      {/* Top Navigation Bar */}
      <div className="w-full px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Home Button */}
          <HomeButton />
          
          {/* Mode Navigation - Center */}
          <div className="flex-1 flex justify-center">
            <DailyModeProgress currentMode="audio" />
          </div>
          
          {/* Timer - Right */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-full border border-slate-700/50 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">
              {timeUntilNext.hours}h {timeUntilNext.minutes}m
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Audio Daily
          </h1>
          <p className="text-slate-400 text-lg">
            Guess the brawler by their audio
          </p>
        </div>

        {/* Game Container */}
        <div className="w-full max-w-2xl">
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-blue-500/30 shadow-2xl backdrop-blur-sm">
            <div className="p-6 md:p-8">
              {showVictoryScreen ? (
                // Victory Screen
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-blue-400">
                      🎉 Congratulations! 🎉
                    </h2>
                    <p className="text-xl text-slate-300">
                      You found <span className="text-blue-400 font-bold">{audioData?.brawler}</span> in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!
                    </p>
                  </div>

                  {/* Audio Player */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-blue-400 shadow-xl bg-slate-800/50 flex items-center justify-center">
                      <div className="text-slate-300 text-center">
                        <div className="text-4xl mb-2">🎵</div>
                        <div className="text-sm">Audio Challenge</div>
                        <Button
                          onClick={playAudio}
                          className="mt-3 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg"
                        >
                          {isPlaying ? 'Playing...' : 'Play Audio'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 items-center">
                    <Button
                      onClick={handleNextMode}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-3 px-8 text-lg font-semibold shadow-lg hover:shadow-indigo-500/25 transform hover:scale-105 transition-all duration-200"
                    >
                      <img 
                        src="/PixelsIcon.png" 
                        alt="Next Mode" 
                        className="h-5 w-5 mr-2"
                      />
                      Next Mode
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      variant="ghost"
                      className="text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              ) : (
                // Game Content
                <div className="space-y-6">
                  {/* Audio Player Section */}
                  <div className="flex justify-center mb-8">
                    <div className="w-96 h-96 rounded-3xl overflow-hidden border-4 border-blue-500/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-2xl backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-6">
                        <div className="text-8xl text-blue-400">🎵</div>
                        <div className="space-y-4">
                          <Button
                            onClick={playAudio}
                            disabled={!audioReady || audioError}
                            className={cn(
                              "px-8 py-4 rounded-xl font-semibold transition-all duration-200 text-lg",
                              audioReady && !audioError
                                ? "bg-blue-500 hover:bg-blue-400 text-white shadow-lg hover:shadow-blue-500/25"
                                : "bg-slate-600 text-slate-400 cursor-not-allowed"
                            )}
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="h-5 w-5 mr-2" />
                                Playing...
                              </>
                            ) : (
                              <>
                                <Play className="h-5 w-5 mr-2" />
                                {audioReady ? 'Play Audio' : 'Loading...'}
                              </>
                            )}
                          </Button>
                          
                          {/* Hint Audio Button */}
                          {showHint && audioData?.hasHint && (
                            <Button
                              onClick={playHintAudio}
                              disabled={!hintAudioReady || hintAudioError}
                              className={cn(
                                "px-8 py-4 rounded-xl font-semibold transition-all duration-200 text-lg",
                                hintAudioReady && !hintAudioError
                                  ? "bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-amber-500/25"
                                  : "bg-slate-600 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              {isHintPlaying ? (
                                <>
                                  <Pause className="h-5 w-5 mr-2" />
                                  Playing Hint...
                                </>
                              ) : (
                                <>
                                  <Play className="h-5 w-5 mr-2" />
                                  💡 Play Hint
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        
                        {audioError && (
                          <div className="text-red-400 text-sm">
                            Audio failed to load
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Search Section */}
                  <div className="space-y-6">
                    <BrawlerAutocomplete
                      brawlers={brawlers}
                      value={inputValue}
                      onChange={setInputValue}
                      onSelect={handleSelectBrawler}
                      onSubmit={handleSubmit}
                      disabledBrawlers={guessedBrawlerNames}
                    />
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-full border border-slate-700/50">
                        <Hash className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-300">
                          {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}
                        </span>
                      </div>
                      
                      {guesses.length >= 4 && audioData?.hasHint && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/50">
                          <span className="text-sm font-medium text-amber-300">
                            💡 Hint available!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Game Over Message */}
                  {isGameOver && !showVictoryScreen && (
                    <div className="text-center space-y-4 py-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <h2 className="text-2xl font-bold text-red-400">Game Over!</h2>
                      <p className="text-slate-300">
                        The correct brawler was <span className="text-blue-400 font-bold">{audioData?.brawler}</span>
                      </p>
                      <div className="flex flex-col gap-3 items-center">
                        <Button
                          onClick={handleNextMode}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-3 px-8 text-lg font-semibold"
                        >
                          Next Mode
                        </Button>
                        <Button
                          onClick={() => navigate('/')}
                          variant="ghost"
                          className="text-slate-400 hover:text-slate-300"
                        >
                          Back to Home
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Previous Guesses */}
                  {guesses.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-300 text-center">
                        Previous Guesses
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {guesses.map((guess, idx) => {
                          const isCorrect = audioData && guess.name.toLowerCase() === audioData.brawler.toLowerCase();
                          const isLastGuess = idx === guesses.length - 1;
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300",
                                isCorrect 
                                  ? "bg-green-500/20 border-green-400/50" 
                                  : "bg-red-500/20 border-red-400/50",
                                !isCorrect && isLastGuess ? "animate-pulse" : ""
                              )}
                            >
                              <img
                                src={getPortrait(guess.name)}
                                alt={getBrawlerDisplayName(guess, currentLanguage)}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-slate-600/50"
                                onError={(e) => {
                                  e.currentTarget.src = '/portraits/shelly.png';
                                }}
                              />
                              <span className="text-sm font-medium text-slate-300 text-center mt-2 truncate w-full">
                                {getBrawlerDisplayName(guess, currentLanguage)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Loading State */}
      {!audioData && !isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="text-center space-y-4 p-8 bg-slate-800/90 rounded-2xl border border-slate-700/50">
            <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-300">Loading today's challenge...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAudioMode; 