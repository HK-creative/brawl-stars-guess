import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { brawlers, Brawler } from '@/data/brawlers';
import BrawlerGuessRow from '@/components/BrawlerGuessRow';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { fetchDailyChallenge, getTimeUntilNextChallenge } from '@/lib/daily-challenges';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import ShareResultModal from '@/components/ShareResultModal';
import Image from '@/components/ui/image';
import { Clock, Share2, Infinity } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const ClassicMode = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [guesses, setGuesses] = useState<Brawler[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [correctBrawlerName, setCorrectBrawlerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0 });
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const isMobile = useIsMobile();
  const [guessedBrawlerNames, setGuessedBrawlerNames] = useState<string[]>([]);
  const [availableBrawlers, setAvailableBrawlers] = useState<Brawler[]>([]);

  // Fallback data in case Supabase fetch fails
  const fallbackBrawlerName = "Spike";
  
  // Find the correct brawler object
  const getCorrectBrawler = () => {
    return brawlers.find(b => b.name.toLowerCase() === correctBrawlerName.toLowerCase()) || brawlers[0];
  };

  // Function to get a random brawler
  const getRandomBrawler = () => {
    // Defensive check
    if (!availableBrawlers || availableBrawlers.length === 0) {
      console.log("No available brawlers to select from!");
      return null;
    }
    
    // Log for debugging
    console.log(`Selecting random brawler from ${availableBrawlers.length} options`);
    
    const randomIndex = Math.floor(Math.random() * availableBrawlers.length);
    return availableBrawlers[randomIndex];
  };

  // Reset game state
  const resetGame = () => {
    // Reset UI states
    setInputValue('');
    setSelectedBrawler(null);
    setGuesses([]);
    setIsGameOver(false);
    setGuessCount(0);
    setGuessedBrawlerNames([]);
    
    // Reset available brawlers to full set
    setAvailableBrawlers([...brawlers]);
    
    // For endless mode, we need to pick a new random brawler
    if (isEndlessMode) {
      const randomBrawler = brawlers[Math.floor(Math.random() * brawlers.length)];
      setCorrectBrawlerName(randomBrawler.name);
      // Remove the selected brawler from available brawlers
      setAvailableBrawlers(prev => prev.filter(b => b.name !== randomBrawler.name));
    }
  };

  // Modified loadChallenge function
  useEffect(() => {
    const loadChallenge = async () => {
      setIsLoading(true);
      try {
        // Initialize available brawlers first
        setAvailableBrawlers([...brawlers]);

        if (!isEndlessMode) {
          // Normal daily challenge mode
          const data = await fetchDailyChallenge('classic');
          
          if (data) {
            setCorrectBrawlerName(data);
            setIsBackendConnected(true);
          } else {
            setCorrectBrawlerName(fallbackBrawlerName);
            setIsBackendConnected(false);
            toast({
              title: "Connection Error",
              description: "Couldn't load today's challenge. Using fallback data.",
              variant: "destructive"
            });
          }
        } else {
          // Endless mode - pick a random brawler
          const randomBrawler = brawlers[Math.floor(Math.random() * brawlers.length)];
          setCorrectBrawlerName(randomBrawler.name);
          setAvailableBrawlers(prev => prev.filter(b => b.name !== randomBrawler.name));
          setIsBackendConnected(true);
        }
      } catch (error) {
        console.error("Error loading classic challenge:", error);
        setCorrectBrawlerName(fallbackBrawlerName);
        setIsBackendConnected(false);
        toast({
          title: "Connection Error",
          description: "Couldn't load today's challenge. Using fallback data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenge();

    if (!isEndlessMode) {
      const updateCountdown = () => {
        setTimeUntilNext(getTimeUntilNextChallenge());
      };
      updateCountdown();
      const intervalId = setInterval(updateCountdown, 60000);
      return () => clearInterval(intervalId);
    }
  }, [isEndlessMode]);

  // Initialize available brawlers when component mounts
  useEffect(() => {
    setAvailableBrawlers([...brawlers]);
  }, []);
  
  // Simplified handleSubmit function
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Basic validation
    if (!selectedBrawler || !correctBrawlerName) {
      toast({
        title: "Error",
        description: "Please select a valid brawler",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate guesses
    if (guessedBrawlerNames.includes(selectedBrawler.name)) {
      toast({
        title: "Already Guessed",
        description: `You've already guessed ${selectedBrawler.name}!`,
        variant: "destructive"
      });
      setInputValue('');
      setSelectedBrawler(null);
      return;
    }

    // Store current values
    const currentBrawler = selectedBrawler;
    const isCorrectGuess = currentBrawler.name.toLowerCase() === correctBrawlerName.toLowerCase();
    const newGuessCount = guessCount + 1;

    // Batch state updates for the current guess
    const updateCurrentGuess = () => {
      setGuesses(prev => [currentBrawler, ...prev]);
      setGuessedBrawlerNames(prev => [...prev, currentBrawler.name]);
      setGuessCount(newGuessCount);
      setInputValue('');
      setSelectedBrawler(null);
    };

    // Handle correct guess
    const handleCorrectGuess = () => {
      if (isEndlessMode) {
        const currentCorrectBrawlerName = correctBrawlerName; // Capture current correct brawler
        const remainingBrawlers = availableBrawlers.filter(
          b => b.name.toLowerCase() !== currentCorrectBrawlerName.toLowerCase()
        );

        if (remainingBrawlers.length > 0) {
          const nextBrawler = remainingBrawlers[Math.floor(Math.random() * remainingBrawlers.length)];
          
          if (nextBrawler && nextBrawler.name) {
            // Update state for the next round directly
            setCorrectBrawlerName(nextBrawler.name);
              setAvailableBrawlers(remainingBrawlers);
            setGuesses([]); // Clear previous guesses for the new round
            // Note: guessCount will continue incrementing for total endless mode stats if desired,
            // or could be reset here if each round is independent.
            // For now, let's assume guessCount is for the current brawler before it resets with setGuesses([])
            // If we need a round counter, that would be a new state variable.

              toast({
                title: "Correct!",
                description: "Here's your next brawler to guess!",
                variant: "default"
              });
          } else {
            // Should not happen if remainingBrawlers is not empty, but good to handle
            setIsGameOver(true);
            toast({
              title: "Game Over",
              description: "Could not select the next brawler. You've guessed them all or an error occurred.",
              variant: "default"
            });
          }
        } else {
          setIsGameOver(true);
          toast({
            title: "Game Over",
            description: "You've guessed all available brawlers!",
            variant: "default"
          });
        }
      } else {
        // Normal mode - game over on correct guess
        setIsGameOver(true);
        toast({
          title: "Success!",
          description: `Correct! You found ${correctBrawlerName} in ${newGuessCount} guesses!`,
          variant: "default"
        });
      }
    };

    // Execute updates in sequence
    updateCurrentGuess();
    if (isCorrectGuess) {
      // Use requestAnimationFrame to ensure state updates are processed
      requestAnimationFrame(() => {
        handleCorrectGuess();
      });
    }
  };
  
  const handleSelectBrawler = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const toggleEndlessMode = () => {
    if (guessCount > 0) {
      toast({
        title: "Cannot Switch Mode",
        description: "You can only switch modes before starting a new game.",
        variant: "destructive"
      });
      return;
    }
    
    // Reset game state before switching modes
    resetGame();
    setIsEndlessMode(!isEndlessMode);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!correctBrawlerName) {
    return (
      <Card className="brawl-card p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brawl-yellow mb-2">No Challenge Available</h3>
          <p className="text-white/80">Check back later for today's challenge.</p>
        </div>
      </Card>
    );
  }

  const correctBrawler = getCorrectBrawler();
  const portraitPath = getPortrait(correctBrawlerName);
  
  // Define column header sizing based on device
  const headerSizeClass = isMobile ? "h-10" : "h-16"; // Taller headers on desktop
  const headerSpacingClass = isMobile ? "gap-1 mb-1" : "gap-3 mb-3"; // Increased spacing on desktop
  
  // Define consistent grid width for both headers and guess rows
  const gridWidthClass = isMobile ? "w-full" : "w-[85%] mx-auto"; // 85% width on desktop/tablet
  
  // Create a grid template to ensure perfect column alignment
  const gridTemplateClass = "grid-cols-6"; // Six equal columns

  // Define attribute labels with adaptive sizing
  const attributeLabels = [
    { name: "Brawler", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Rarity", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Class", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Speed", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Range", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Wallbreak", fontSize: isMobile ? "text-xs" : "text-xl" }
  ];

  return (
    <div className="max-h-[calc(100vh-70px)] overflow-hidden px-1 py-4 md:py-8">
      {/* Header with Integrated Mode Selector - Centered & Transparent Background */}
      <div className="mb-6 md:mb-8 max-w-3xl mx-auto">
        {/* Title and Description - Centered */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-brawl-yellow mb-1 text-center">
            Classic Mode
          </h1>
          <p className="text-neutral-300 text-sm md:text-base text-center">
            Guess the brawler by their attributes. Test your knowledge!
          </p>
          </div>
          
        {/* Mode Selector (Segmented Control) - Centered */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex w-full max-w-xs sm:max-w-sm md:max-w-md border border-neutral-600 rounded-lg p-0.5 bg-neutral-800/30">
            <button
              onClick={() => { if (guessCount === 0) { setIsEndlessMode(false); resetGame(); } }}
              disabled={guessCount > 0}
                  className={cn(
                "flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all duration-200 ease-in-out",
                !isEndlessMode ? "bg-brawl-yellow text-black shadow-md" : "text-neutral-300 hover:bg-neutral-700/50",
                guessCount > 0 && "opacity-60 cursor-not-allowed"
                  )}
            >
              Daily Challenge
            </button>
            <button
              onClick={() => { if (guessCount === 0) { setIsEndlessMode(true); resetGame(); } }}
              disabled={guessCount > 0}
              className={cn(
                "flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-1.5",
                isEndlessMode ? "bg-brawl-yellow text-black shadow-md" : "text-neutral-300 hover:bg-neutral-700/50",
                guessCount > 0 && "opacity-60 cursor-not-allowed"
              )}
            >
              <Infinity className="w-4 h-4" /> Endless Mode
            </button>
          </div>
          {isEndlessMode ? (
             <p className="text-xs text-neutral-400 text-center">
               Play with random brawlers until you guess them all.
             </p>
           ) : (
             <p className="text-xs text-neutral-400 text-center">
               A new brawler to guess, updated daily.
             </p>
           )}
        </div>

        {!isBackendConnected && (
          <div className="mt-4 p-2 bg-red-800/30 border border-red-700 rounded-md text-white text-xs text-center max-w-md mx-auto">
            <p>⚠️ Using fallback data due to a connection issue. Some features might be limited.</p>
          </div>
        )}
      </div>
      
      {/* Autocomplete section */}
      <div className="mb-6 md:mb-8 w-full max-w-xl mx-auto">
        <BrawlerAutocomplete
          brawlers={brawlers}
          value={inputValue}
          onChange={setInputValue}
          onSelect={handleSelectBrawler}
          onSubmit={handleSubmit}
          disabled={isGameOver}
          disabledBrawlers={guessedBrawlerNames}
        />
      </div>
      
      <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-220px)] flex flex-col"> {/* Adjusted height accounting for new header */}
        {/* Game area */}
        <div className="flex-1 flex flex-col space-y-1">
          {isGameOver ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-full max-w-md mx-auto p-8 rounded-3xl border-4 border-[#2a2f6a] shadow-2xl bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide mb-4" style={{ WebkitTextStroke: '2px #222', letterSpacing: '2px' }}>
                  VICTORY!
                </span>
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-brawl-yellow shadow-xl bg-[#181c3a] flex items-center justify-center mb-4">
                  <Image
                    src={portraitPath}
                    alt={correctBrawlerName}
                    fallbackSrc={DEFAULT_PORTRAIT}
                    imageType="portrait"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide mb-2" style={{ WebkitTextStroke: '1px #222' }}>
                  You guessed <span className="text-brawl-yellow">{correctBrawlerName.toUpperCase()}</span>
                </div>
                <div className="text-lg md:text-xl font-semibold text-white mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  Number of tries: <span className="text-brawl-yellow font-extrabold">{guessCount}</span>
                </div>
                <Button
                  onClick={handleShare}
                  className="mt-6 bg-brawl-blue hover:bg-brawl-blue/90 text-white text-lg font-bold px-8 py-3 rounded-xl shadow-md flex items-center gap-2"
                  size="lg"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              </div>
            </div>
          ) : (
            null /* The BrawlerAutocomplete is now handled above, outside this conditional block */
          )}
          
          {/* Guesses section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-1 px-1">
              <div className="flex items-center gap-1.5">
                <div className="text-white text-sm font-medium">
                  Guesses: {guessCount}
                </div>
                <div className="text-xs flex items-center text-white/60 gap-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{timeUntilNext.hours}h {timeUntilNext.minutes}m</span>
                </div>
              </div>
              <div className="text-xs text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">
                {guessCount}/6
              </div>
            </div>
            
            {/* Attribute labels with glass effect and perfect square aspect ratio */}
            <div className={cn(
              "grid",
              gridTemplateClass,
              isMobile ? "gap-1 mb-1" : "gap-5 mb-2", // Reduced bottom margin
              "w-full px-1" // Full width to match guess rows and search bar
            )}>
              {attributeLabels.map((label, index) => {
                return (
                  <div key={label.name} className="w-full relative h-10">
                    {/* Yellow accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brawl-yellow"></div>
                    
                    {/* Text with adaptive sizing - positioned near the bottom */}
                    <div className="w-full flex items-end justify-center pb-2">
                      <span className={cn(
                        label.fontSize,
                        "font-extrabold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                      )}>
                        {label.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Guesses display */}
            <div className="overflow-auto flex-1 min-h-0 max-h-[calc(100vh-250px)] p-1">
              <div className="space-y-3">
                {guesses.map((guess, index) => (
                  <BrawlerGuessRow 
                    key={index} 
                    guess={guess} 
                    correctAnswer={correctBrawler} 
                    isMobile={isMobile}
                    gridWidthClass={gridWidthClass}
                    gridTemplateClass={gridTemplateClass}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share modal */}
      <ShareResultModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        mode="classic"
        success={isGameOver}
        attempts={guessCount}
        maxAttempts={6}
        brawlerName={correctBrawlerName}
      />

      {/* Modified game info display */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          {isEndlessMode ? (
            <div className="text-white/80">
              <span className="font-medium">Brawlers guessed:</span>{' '}
              <span className="text-brawl-yellow">{guessedBrawlerNames.length}</span>
            </div>
          ) : (
            <div className="flex items-center text-white/80">
              <Clock className="w-4 h-4 mr-2" />
              <span>Next in: {timeUntilNext.hours}h {timeUntilNext.minutes}m</span>
            </div>
          )}
        </div>

        {isGameOver && !isEndlessMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="text-white/80 hover:text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClassicMode;
