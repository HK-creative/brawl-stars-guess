import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers } from '@/data/brawlers';
import BrawlerGuessRow from '@/components/BrawlerGuessRow';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import HomeButton from '@/components/ui/home-button';
import DailyModeProgress from '@/components/DailyModeProgress';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge } from '@/lib/daily-challenges';

// Helper function to generate star power image path (same as survival mode)
function getStarPowerImagePath(brawlerName: string, starPowerIndex: number): string {
  // Convert brawler name to lowercase and replace spaces with underscores
  let brawlerFileName = brawlerName.toLowerCase().replace(/ /g, '_');
  
  // Handle special cases for brawler names
  if (brawlerName === "8-Bit") {
    brawlerFileName = "8bit";
  } else if (brawlerName === "Mr. P") {
    brawlerFileName = "mrp";
  } else if (brawlerName === "R-T") {
    brawlerFileName = "rt";
  } else if (brawlerName === "Larry & Lawrie") {
    brawlerFileName = "larry_lawrie";
  }
  
  // Try zero-padded format first (_01, _02)
  const paddedNum = starPowerIndex.toString().padStart(2, '0');
  return `/${brawlerFileName}_starpower_${paddedNum}.png`;
}

const DailyStarPowerMode: React.FC = () => {
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

  const navigate = useNavigate();
  const {
    starpower,
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
  const [starPowerData, setStarPowerData] = useState<any>(null);
  const [starPowerImage, setStarPowerImage] = useState<string>('');

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

  // Load star power data and generate image
  useEffect(() => {
    const loadStarPowerData = async () => {
      try {
        const data = await fetchDailyChallenge('starpower');
        setStarPowerData(data);
        
        // Generate star power image path
        if (data?.brawler) {
          // Find the brawler and get a random star power index
          const brawler = brawlers.find(b => b.name.toLowerCase() === data.brawler.toLowerCase());
          if (brawler && brawler.starPowers && brawler.starPowers.length > 0) {
            // Use the first star power or find the matching one
            const starPowerIndex = 1; // Default to first star power
            const imagePath = getStarPowerImagePath(data.brawler, starPowerIndex);
            setStarPowerImage(imagePath);
          }
        }
      } catch (error) {
        console.error('Error loading star power data:', error);
      }
    };
    
    loadStarPowerData();
  }, []);

  // Load saved guesses when component mounts or starpower data changes
  useEffect(() => {
    const savedGuesses = getGuesses('starpower');
    setGuesses(savedGuesses);
    // Extract brawler names from saved guesses to prevent duplicates
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [starpower.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (starpower.isCompleted) {
      setShowVictoryScreen(true);
    }
  }, [starpower.isCompleted]);

  // Find the correct brawler object
  const getCorrectBrawler = useCallback(() => {
    return brawlers.find(b => b.name.toLowerCase() === starpower.brawlerName.toLowerCase()) || brawlers[0];
  }, [starpower.brawlerName]);

  // Handle guess submission
  const handleSubmit = useCallback((brawler?: any) => {
    const brawlerToSubmit = brawler || selectedBrawler;
    
    if (!brawlerToSubmit || starpower.isCompleted) return;

    // Increment guess count in store
    incrementGuessCount('starpower');
    
    // Add guess to store and local state
    const newGuess = brawlerToSubmit;
    saveGuess('starpower', newGuess);
    setGuesses(prev => [...prev, newGuess]);
    setGuessedBrawlerNames(prev => [...prev, brawlerToSubmit.name]);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = brawlerToSubmit.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('starpower');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      
      toast({
        title: "Congratulations! 🎉",
        description: `You found ${correctBrawler.name}!`,
      });
    }
    
    // Reset input
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, starpower.isCompleted, incrementGuessCount, saveGuess, getCorrectBrawler, completeMode]);

  // Handle brawler selection and immediate submission
  const handleSelectBrawler = useCallback((brawler: any) => {
    setSelectedBrawler(brawler);
    setInputValue(brawler.name);
    
    // Immediately submit the guess
    handleSubmit(brawler);
  }, [handleSubmit]);

  // Handle next mode navigation
  const handleNextMode = () => {
    navigate('/daily/audio');
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
    resetGuessCount('starpower');
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
          <DailyModeProgress currentMode="starpower" />
        </div>
        <div className="w-[40px]"></div> {/* Spacer to balance the layout */}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 items-center justify-center relative">
        {/* Header Info */}
        <div className="mb-6 flex flex-col items-center justify-center relative z-10">
          {/* Bigger Centered Headline */}
          <div className="text-center mb-4">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_1px_6px_rgba(255,214,0,0.4)] animate-award-glow">
              Star Power Daily
            </h1>
          </div>
          
          <div className="flex flex-row items-center gap-4 mt-2">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/60 to-purple-400/50 shadow-md border border-blue-300/30 text-lg font-bold text-white">
              <Hash className="h-6 w-6 text-white/80" />
              {starpower.guessCount} guesses
            </span>
          </div>
          
          {/* Redesigned Timer - More Minimal */}
          <div className="mt-4 flex items-center gap-2 px-2 py-1 text-white/70">
            <Clock className="h-4 w-4 text-white/60" />
            <span className="text-sm font-medium">
              Next Brawler In: {timeUntilNext.hours}h {timeUntilNext.minutes}m
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
                  Congratulations!
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  You found <span className="text-yellow-400 font-bold">{starpower.brawlerName}</span> in {starpower.guessCount} guesses!
                </p>
                <p className="text-lg text-white/60 mb-6">
                  Ready for the next challenge?
                </p>
                <div className="flex flex-col gap-4 items-center justify-center">
                  <Button
                    onClick={handleNextMode}
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white py-4 px-12 text-xl font-bold shadow-xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 border-2 border-emerald-300/50 w-full max-w-sm"
                  >
                    <img 
                      src="/AudioIcon.png" 
                      alt="Audio Mode" 
                      className="h-6 w-6 mr-2"
                    />
                    Next Mode
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="text-white/40 hover:text-white/60 hover:bg-white/5 py-2 px-6 text-sm border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            ) : (
              // Game Content
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Guess the Brawler by their Star Power!
                  </h2>
                  <p className="text-white/70 mb-4">
                    Use the clues from your guesses to find the correct brawler
                  </p>
                  
                  {/* Star Power Image Only - No Name or Description */}
                  {starPowerImage && (
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
                        <img
                          src={starPowerImage}
                          alt="Brawler Star Power"
                          className="w-full h-full object-contain transform transition-all duration-300 hover:scale-105"
                          onError={(e) => {
                            console.log(`Failed to load star power image: ${starPowerImage}`);
                            
                            // Try _1 format instead of _01
                            const newSrc = e.currentTarget.src.replace('_starpower_01.png', '_starpower_1.png');
                            console.log(`Trying alternative format: ${newSrc}`);
                            e.currentTarget.src = newSrc;
                            
                            e.currentTarget.onerror = () => {
                              // If that fails, try Shelly as fallback
                              console.log('Alternative format failed, trying Shelly fallback');
                              e.currentTarget.src = '/shelly_starpower_01.png';
                              
                              e.currentTarget.onerror = () => {
                                console.log('All star power images failed, hiding image');
                                e.currentTarget.style.display = 'none';
                              };
                            };
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Form - No Submit Button */}
                <div className="space-y-4">
                  <BrawlerAutocomplete
                    brawlers={brawlers}
                    value={inputValue}
                    onChange={setInputValue}
                    onSelect={handleSelectBrawler}
                    disabled={starpower.isCompleted}
                    disabledBrawlers={guessedBrawlerNames}
                  />
                </div>

                {/* Guesses */}
                <div className="space-y-2">
                  {guesses.map((guess, index) => (
                    <BrawlerGuessRow
                      key={index}
                      guess={guess}
                      correctAnswer={getCorrectBrawler()}
                      isNew={index === guesses.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DailyStarPowerMode; 