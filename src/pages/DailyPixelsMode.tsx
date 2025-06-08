import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers, getBrawlerDisplayName } from '@/data/brawlers';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import HomeButton from '@/components/ui/home-button';
import DailyModeProgress from '@/components/DailyModeProgress';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import PixelatedImage from '@/components/PixelatedImage';

const DailyPixelsMode: React.FC = () => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();

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
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const {
    pixels,
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
  const [pixelsData, setPixelsData] = useState<any>(null);
  const [portraitImage, setPortraitImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);

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

  // Load pixels data and generate image
  useEffect(() => {
    const loadPixelsData = async () => {
      try {
        const data = await fetchDailyChallenge('pixels');
        console.log('Loaded pixels data:', data);
        setPixelsData(data);
        
        // Generate portrait image path
        if (data?.brawler) {
          const imagePath = getPortrait(data.brawler.toLowerCase());
          console.log('Generated portrait image path:', imagePath);
          setPortraitImage(imagePath);
          setImageLoaded(false); // Reset image loaded state
        } else {
          console.warn('No brawler data found in pixels challenge');
          setPortraitImage('');
        }
      } catch (error) {
        console.error('Error loading pixels data:', error);
        setPortraitImage('');
        setImageLoaded(false);
        setPixelsData(null);
      }
    };
    
    loadPixelsData();
  }, []);

  // Load saved guesses when component mounts or pixels data changes
  useEffect(() => {
    const savedGuesses = getGuesses('pixels');
    setGuesses(savedGuesses);
    // Extract brawler names from saved guesses to prevent duplicates
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [pixels.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (pixels.isCompleted) {
      setShowVictoryScreen(true);
    }
  }, [pixels.isCompleted]);

  // Calculate pixelation level based on guess count
  const getPixelationLevel = useCallback(() => {
    if (pixels.isCompleted) return 6; // Show clearest image when completed
    // Start with maximum pixelation (0) and increase level with each guess to make it clearer
    // Level 0 = most pixelated, Level 6 = least pixelated
    return Math.min(6, guesses.length); // 0, 1, 2, 3, 4, 5, 6 (gets clearer each guess)
  }, [pixels.isCompleted, guesses.length]);

  const getCorrectBrawler = useCallback(() => {
    return brawlers.find(b => b.name.toLowerCase() === pixels.brawlerName.toLowerCase()) || brawlers[0];
  }, [pixels.brawlerName]);

  const handleSubmit = useCallback((brawler?: any) => {
    const brawlerToSubmit = brawler || selectedBrawler;
    
    if (!brawlerToSubmit || !pixelsData || guessedBrawlerNames.includes(brawlerToSubmit.name)) {
      return;
    }

    const newGuess = brawlerToSubmit;
    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setGuessedBrawlerNames([...guessedBrawlerNames, newGuess.name]);
    
    // Save guess to store
    saveGuess('pixels', newGuess);
    incrementGuessCount('pixels');

    const isCorrect = newGuess.name.toLowerCase() === pixelsData.brawler.toLowerCase();
    
    if (isCorrect) {
      // Correct guess
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      completeMode('pixels');
      
      setTimeout(() => setShowConfetti(false), 3000);
    } else if (updatedGuesses.length >= 6) {
      // Game over - max guesses reached
      setIsGameOver(true);
    }

    // Reset form
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, pixelsData, guessedBrawlerNames, guesses, saveGuess, incrementGuessCount, completeMode]);

  const handleBrawlerSelect = useCallback((brawler: any) => {
    setSelectedBrawler(brawler);
    if (brawler) {
      const displayName = getBrawlerDisplayName(brawler, currentLanguage);
      setInputValue(displayName);
    }
    
    // Immediately submit the guess
    handleSubmit(brawler);
  }, [handleSubmit, currentLanguage]);

  const handleNextMode = () => {
    navigate('/');
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error('Failed to load portrait image:', portraitImage);
  };

  const formatTime = (time: { hours: number; minutes: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  };

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
            <DailyModeProgress currentMode="pixels" />
          </div>
          
          {/* Timer - Right */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-full border border-slate-700/50 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">
              {formatTime(timeUntilNext)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Guess the Pixelated Brawler!
          </h1>
          <p className="text-slate-400 text-lg">
            The image becomes clearer with each guess
          </p>
        </div>

        {/* Game Container */}
        <div className="w-full max-w-2xl">
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-indigo-500/30 shadow-2xl backdrop-blur-sm">
            <div className="p-6 md:p-8">
              {showVictoryScreen ? (
                // Victory Screen
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-indigo-400">
                      🎉 Congratulations! 🎉
                    </h2>
                    <p className="text-xl text-slate-300">
                      You found <span className="text-indigo-400 font-bold">{pixelsData?.brawler}</span> in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!
                    </p>
                  </div>

                  {/* Clear Portrait Image */}
                  {portraitImage && (
                    <div className="flex justify-center">
                      <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-indigo-400 shadow-xl">
                        <PixelatedImage
                          src={portraitImage}
                          alt={pixelsData?.brawler || 'Brawler'}
                          pixelationLevel={6}
                          fallbackSrc={DEFAULT_PORTRAIT}
                          className="w-full h-full"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 items-center">
                    <Button
                      onClick={handleNextMode}
                      className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white py-3 px-8 text-lg font-semibold shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-200"
                    >
                      🏠 Back to Home
                    </Button>
                  </div>
                </div>
              ) : (
                // Game Content
                <div className="space-y-6">
                  {/* Pixelated Portrait Display */}
                  <div className="flex justify-center mb-8">
                    <div className="w-96 h-96 rounded-3xl overflow-hidden border-4 border-indigo-500/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-2xl backdrop-blur-sm">
                      {portraitImage ? (
                        <PixelatedImage
                          src={portraitImage}
                          alt="Pixelated Brawler Portrait"
                          pixelationLevel={getPixelationLevel()}
                          fallbackSrc={DEFAULT_PORTRAIT}
                          className="w-full h-full"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-spin h-8 w-8 border-4 border-indigo-400 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search Section */}
                  <div className="space-y-6">
                    <BrawlerAutocomplete
                      brawlers={brawlers}
                      value={inputValue}
                      onChange={setInputValue}
                      onSelect={handleBrawlerSelect}
                      onSubmit={handleSubmit}
                      disabledBrawlers={guessedBrawlerNames}
                    />
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-full border border-slate-700/50">
                        <Hash className="h-4 w-4 text-indigo-400" />
                        <span className="text-sm font-medium text-slate-300">
                          {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}
                        </span>
                      </div>
                      
                      {guesses.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-500/50">
                          <span className="text-sm font-medium text-indigo-300">
                            Getting clearer...
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
                        The correct brawler was <span className="text-indigo-400 font-bold">{pixelsData?.brawler}</span>
                      </p>
                      <div className="flex flex-col gap-3 items-center">
                        <Button
                          onClick={handleNextMode}
                          className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white py-3 px-8 text-lg font-semibold"
                        >
                          🏠 Back to Home
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
                          const isCorrect = pixelsData && guess.name.toLowerCase() === pixelsData.brawler.toLowerCase();
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
                                  e.currentTarget.src = DEFAULT_PORTRAIT;
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
      {!pixelsData && !isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="text-center space-y-4 p-8 bg-slate-800/90 rounded-2xl border border-slate-700/50">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-300">Loading today's challenge...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPixelsMode; 