import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers, getBrawlerDisplayName } from '@/data/brawlers';
import { getPortrait } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import HomeButton from '@/components/ui/home-button';
import DailyModeProgress from '@/components/DailyModeProgress';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// Helper to get gadget image path with fallback variants
const getGadgetImageVariants = (brawler: string, gadgetName?: string): string[] => {
  if (!brawler) {
    return [];
  }
  
  // Clean up brawler name for file path
  const normalizedBrawler = brawler.toLowerCase().replace(/ /g, '_');
  
  // Handle special cases
  if (normalizedBrawler === 'mr.p') return [`/GadgetImages/mrp_gadget_01.png`];
  if (normalizedBrawler === 'el primo') return [`/GadgetImages/elprimo_gadget_01.png`];
  if (normalizedBrawler === 'colonel ruffs') return [`/GadgetImages/colonel_ruffs_gadget_01.png`];
  
  // Special case for R-T
  if (brawler.toLowerCase().replace(/[-_ ]/g, '') === 'rt') {
    if (gadgetName && gadgetName.match(/2|second/i)) {
      return ['/GadgetImages/rt_gadget_02.png'];
    }
    return ['/GadgetImages/rt_gadget_01.png'];
  }
  
  // Special case for Jae-Yong
  if (brawler.toLowerCase().replace(/[-_ ]/g, '') === 'jaeyong') {
    if (gadgetName && gadgetName.match(/2|second/i)) {
      return ['/GadgetImages/Jae-Yong_gadget_2.png'];
    }
    return ['/GadgetImages/Jae-Yong_gadget_1.png'];
  }
  
  // First, try to determine the base gadget number from the name
  let baseNum = '01';
  if (gadgetName) {
    const match = gadgetName.match(/(\d+)/);
    if (match) {
      baseNum = match[1].padStart(2, '0');
    } else if (gadgetName.includes('First')) {
      baseNum = '01';
    } else if (gadgetName.includes('Second')) {
      baseNum = '02';
    }
  }
  
  // Generate both possible variants
  const variant1 = `/GadgetImages/${normalizedBrawler}_gadget_${baseNum}.png`;
  const variant2 = `/GadgetImages/${normalizedBrawler}_gadget_${baseNum.replace(/^0+/, '')}.png`;
  
  // Return both variants to try
  return [variant1, variant2];
};

const DailyGadgetMode: React.FC = () => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { toast } = useToast();

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
    gadget,
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
  const [gadgetData, setGadgetData] = useState<any>(null);
  const [gadgetImage, setGadgetImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageVariants, setImageVariants] = useState<string[]>([]);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);

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

  // Load gadget data and generate image
  useEffect(() => {
    const loadGadgetData = async () => {
      try {
        const data = await fetchDailyChallenge('gadget');
        console.log('Loaded gadget data:', data);
        setGadgetData(data);
        
        // Generate gadget image variants
        if (data?.brawler) {
          const variants = getGadgetImageVariants(data.brawler, data.gadgetName);
          console.log('Generated gadget image variants:', variants);
          setImageVariants(variants);
          setCurrentVariantIndex(0);
          if (variants.length > 0) {
            setGadgetImage(variants[0]);
            console.log('Trying first variant:', variants[0]);
          } else {
            setGadgetImage('');
          }
          setImageLoaded(false); // Reset image loaded state
        } else {
          console.warn('No brawler data found in gadget challenge');
          // Don't set any fallback image - just leave it empty
          setGadgetImage('');
          setImageVariants([]);
          setCurrentVariantIndex(0);
          setImageLoaded(false);
        }
              } catch (error) {
          console.error('Error loading gadget data:', error);
          // Don't set any fallback image on error - just leave it empty
          setGadgetImage('');
          setImageVariants([]);
          setCurrentVariantIndex(0);
          setImageLoaded(false);
          setGadgetData(null);
        }
    };
    
    loadGadgetData();
  }, []);

  // Load saved guesses when component mounts or gadget data changes
  useEffect(() => {
    const savedGuesses = getGuesses('gadget');
    setGuesses(savedGuesses);
    // Extract brawler names from saved guesses to prevent duplicates
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [gadget.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (gadget.isCompleted) {
      setShowVictoryScreen(true);
    }
  }, [gadget.isCompleted]);

  // Find the correct brawler object
  const getCorrectBrawler = useCallback(() => {
    return brawlers.find(b => b.name.toLowerCase() === gadget.brawlerName.toLowerCase()) || brawlers[0];
  }, [gadget.brawlerName]);

  // Handle guess submission
  const handleSubmit = useCallback((brawler?: any) => {
    const brawlerToSubmit = brawler || selectedBrawler;
    
    if (!brawlerToSubmit || gadget.isCompleted) return;

    // Increment guess count in store
    incrementGuessCount('gadget');
    
    // Add guess to store and local state
    const newGuess = brawlerToSubmit;
    saveGuess('gadget', newGuess);
    setGuesses(prev => [...prev, newGuess]);
    setGuessedBrawlerNames(prev => [...prev, brawlerToSubmit.name]);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = brawlerToSubmit.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('gadget');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      
      toast({
        id: String(Date.now()),
        title: "Congratulations! 🎉",
        description: `You found ${getBrawlerDisplayName(correctBrawler, currentLanguage)}!`,
      });
    }
    
    // Reset input
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, gadget.isCompleted, incrementGuessCount, saveGuess, getCorrectBrawler, completeMode, currentLanguage, toast]);

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
    navigate('/daily/starpower');
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
    resetGuessCount('gadget');
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
            <DailyModeProgress currentMode="gadget" />
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
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Gadget Daily
          </h1>
          <p className="text-slate-400 text-lg">
            Guess the brawler by their gadget
          </p>
        </div>

        {/* Game Container */}
        <div className="w-full max-w-2xl">
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-emerald-500/30 shadow-2xl backdrop-blur-sm">
            <div className="p-6 md:p-8">
              {showVictoryScreen ? (
                // Victory Screen
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-emerald-400">
                      🎉 Congratulations! 🎉
                    </h2>
                    <p className="text-xl text-slate-300">
                      You found <span className="text-emerald-400 font-bold">{gadgetData?.brawler}</span> in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!
                    </p>
                  </div>

                  {/* Gadget Image */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-emerald-400 shadow-xl bg-slate-800/50 flex items-center justify-center">
                      {gadgetImage ? (
                        <img
                          src={gadgetImage}
                          alt={`${gadgetData?.brawler} Gadget`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/GadgetImages/shelly_gadget_01.png';
                          }}
                        />
                      ) : (
                        <div className="text-slate-400 text-center">
                          <div className="text-4xl mb-2">🔧</div>
                          <div className="text-sm">Gadget Image</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 items-center">
                    <Button
                      onClick={handleNextMode}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white py-3 px-8 text-lg font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200"
                    >
                      <img 
                        src="/StarPowerIcon.png" 
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
                  {/* Gadget Display */}
                  <div className="flex justify-center mb-8">
                    <div className="w-96 h-96 rounded-3xl overflow-hidden border-4 border-emerald-500/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-2xl backdrop-blur-sm flex items-center justify-center">
                      {gadgetImage ? (
                        <img
                          src={gadgetImage}
                          alt="Brawler Gadget"
                          className="w-full h-full object-contain p-8"
                          onLoad={() => setImageLoaded(true)}
                          onError={(e) => {
                            e.currentTarget.src = '/GadgetImages/shelly_gadget_01.png';
                          }}
                        />
                      ) : (
                        <div className="text-slate-400 text-center">
                          <div className="text-6xl mb-4">🔧</div>
                          <div className="text-lg">Loading gadget...</div>
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
                      onSelect={handleSelectBrawler}
                      onSubmit={handleSubmit}
                      disabledBrawlers={guessedBrawlerNames}
                    />
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-full border border-slate-700/50">
                        <Hash className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-slate-300">
                          {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}
                        </span>
                      </div>
                      
                      {guesses.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/50">
                          <span className="text-sm font-medium text-emerald-300">
                            Keep guessing!
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
                        The correct brawler was <span className="text-emerald-400 font-bold">{gadgetData?.brawler}</span>
                      </p>
                      <div className="flex flex-col gap-3 items-center">
                        <Button
                          onClick={handleNextMode}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white py-3 px-8 text-lg font-semibold"
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
                          const isCorrect = gadgetData && guess.name.toLowerCase() === gadgetData.brawler.toLowerCase();
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
      {!gadgetData && !isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="text-center space-y-4 p-8 bg-slate-800/90 rounded-2xl border border-slate-700/50">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-300">Loading today's challenge...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyGadgetMode; 