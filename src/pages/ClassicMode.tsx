import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
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

interface ClassicModeProps {
  brawlerId?: number;
  onRoundEnd?: (result: { success: boolean, brawlerName?: string }) => void;
  maxGuesses?: number;
  isEndlessMode?: boolean;
  isSurvivalMode?: boolean;
  skipVictoryScreen?: boolean;
}

const ClassicMode = ({
  brawlerId,
  onRoundEnd,
  maxGuesses = 6,
  isEndlessMode: propIsEndlessMode = false,
  isSurvivalMode = false,
  skipVictoryScreen = false
}: ClassicModeProps = {}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [guesses, setGuesses] = useState<Brawler[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [guessesLeft, setGuessesLeft] = useState(maxGuesses);
  const [correctBrawlerName, setCorrectBrawlerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0 });
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEndlessMode, setIsEndlessMode] = useState(propIsEndlessMode);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [guessedBrawlerNames, setGuessedBrawlerNames] = useState<string[]>([]);
  const [availableBrawlers, setAvailableBrawlers] = useState<Brawler[]>([]);
  const [lastGuessIndex, setLastGuessIndex] = useState<number | null>(null); // Track the most recent guess
  const [gameKey, setGameKey] = useState(Date.now().toString()); // Key to force re-render
  
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
    setGuessesLeft(maxGuesses);
    setGuessedBrawlerNames([]);
    
    // Reset available brawlers to full set
    setAvailableBrawlers([...brawlers]);
    
    // Reset the last guess index when starting a new game
    setLastGuessIndex(null);

    // For endless mode, we need to pick a new random brawler
    if (isEndlessMode) {
      const randomBrawler = brawlers[Math.floor(Math.random() * brawlers.length)];
      setCorrectBrawlerName(randomBrawler.name);
      // Remove the selected brawler from available brawlers
      setAvailableBrawlers(prev => prev.filter(b => b.name !== randomBrawler.name));
    }
  };

  // CRITICAL: This effect detects when brawlerId changes and resets the game
  useEffect(() => {
    console.log(`ClassicMode: brawlerId changed to ${brawlerId}`);
    
    // Reset game state when brawlerId changes (critical for Survival Mode)
    setInputValue('');
    setSelectedBrawler(null);
    setGuesses([]);
    setIsGameOver(false);
    setGuessCount(0);
    setGuessesLeft(maxGuesses);
    setLastGuessIndex(null);
    setGuessedBrawlerNames([]);
    setAvailableBrawlers([...brawlers]);
    
    // Generate a new key to force complete component re-initialization
    setGameKey(Date.now().toString());
    
    // Load the new challenge with the changed brawlerId
    loadChallenge();
  }, [brawlerId]); // Re-run when brawlerId changes

  // Function to load the challenge
  const loadChallenge = async () => {
    setIsLoading(true);
    
    try {
      // If in survival mode, pick a random brawler (like GadgetMode and StarPowerMode do)
      if (isSurvivalMode) {
        console.log('Loading random brawler for Survival Mode Classic challenge');
        
        // Shuffle the brawlers array to pick a random one
        const shuffledBrawlers = [...brawlers];
        for (let i = shuffledBrawlers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledBrawlers[i], shuffledBrawlers[j]] = [shuffledBrawlers[j], shuffledBrawlers[i]];
        }
        
        // Pick the first brawler from shuffled array
        const randomBrawler = shuffledBrawlers[0] || brawlers[0];
        console.log(`Selected random brawler: ${randomBrawler.name} (ID: ${randomBrawler.id})`);

        setCorrectBrawlerName(randomBrawler.name);
        setIsLoading(false);
        return;
      }
      
      // If we have a specified brawlerId (for non-survival modes), use that brawler
      if (brawlerId !== undefined) {
        // Check if the brawlerId is within a valid range
        if (brawlerId <= 0 || brawlerId > brawlers.length) {
          console.warn(`Brawler ID ${brawlerId} is out of range (1-${brawlers.length}). Using fallback.`);
          // Use a fallback brawler (Shelly or first available)
          const fallbackBrawler = brawlers[0];
          console.log(`Using fallback brawler: ${fallbackBrawler.name} instead of invalid ID: ${brawlerId}`);
          setCorrectBrawlerName(fallbackBrawler.name);
          setIsLoading(false);
          return;
        }
        
        const specifiedBrawler = brawlers.find(b => b.id === brawlerId);
        if (specifiedBrawler) {
          console.log(`Setting correct brawler to: ${specifiedBrawler.name} (ID: ${brawlerId})`);
          setCorrectBrawlerName(specifiedBrawler.name);
          setIsLoading(false);
          return;
        } else {
          // Brawler ID not found - use fallback
          console.error(`Brawler with ID ${brawlerId} not found in data`);
          const fallbackBrawler = brawlers[0];
          console.log(`Using fallback brawler: ${fallbackBrawler.name} after ID not found`);
          setCorrectBrawlerName(fallbackBrawler.name);
          setIsLoading(false);
          return;
        }
      }
      
      // For endless mode, use a random brawler from the available pool
      if (isEndlessMode) {
        const randomBrawler = getRandomBrawler();
        if (randomBrawler) {
          setCorrectBrawlerName(randomBrawler.name);
          setAvailableBrawlers(prev => prev.filter(b => b.name !== randomBrawler.name));
          setIsLoading(false);
          return;
        }
      }
      
      // Try to fetch the daily challenge from the backend
      try {
        const brawlerName = await fetchDailyChallenge('classic'); // Pass 'classic' as the mode parameter
        if (brawlerName && typeof brawlerName === 'string') {
          setCorrectBrawlerName(brawlerName);
          setIsBackendConnected(true);
        } else {
          throw new Error('Failed to fetch daily challenge');
        }
      } catch (error) {
        console.error('Error fetching daily challenge:', error);
        // Use fallback data if the backend is unavailable
        setCorrectBrawlerName(fallbackBrawlerName);
        setIsBackendConnected(false);
        toast({
          id: String(Date.now()),
          title: 'Offline Mode',
          description: 'Could not connect to server. Using offline mode.',
        });
      }
      
      // Update the time until the next challenge
      const timeRemaining = getTimeUntilNextChallenge();
      setTimeUntilNext(timeRemaining);
    } catch (error) {
      console.error('Error in loadChallenge:', error);
      toast({
        id: String(Date.now()),
        title: 'Error',
        description: 'An error occurred while loading the challenge.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update countdown timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilNext(getTimeUntilNextChallenge());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Load the daily challenge on first mount (only if not in endless mode)
  useEffect(() => {
    if (!isEndlessMode) {
      loadChallenge();
    }
  }, [isEndlessMode]);

  // Function to handle brawler selection
  const handleSelectBrawler = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
  };

  // Function to handle sharing
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Function to toggle endless mode
  const toggleEndlessMode = () => {
    // Only allow toggling if not in survival mode
    if (isSurvivalMode) return;
    
    const newEndlessMode = !isEndlessMode;
    setIsEndlessMode(newEndlessMode);
    
    // If switching to endless mode, need to reset and pick a random brawler
    if (newEndlessMode) {
      resetGame();
    } else {
      // If switching back to daily mode, load the daily challenge
      setCorrectBrawlerName('');
      setIsGameOver(false);
      setGuesses([]);
      loadChallenge();
    }
  };

  // Simplified handleSubmit function
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (isGameOver) return;
    
    if (!selectedBrawler) {
      toast({
        id: String(Date.now()),
        title: 'No brawler selected',
        description: 'Please select a brawler to make a guess.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if this brawler has already been guessed
    if (guessedBrawlerNames.includes(selectedBrawler.name)) {
      toast({
        id: String(Date.now()),
        title: 'Already guessed',
        description: `You've already guessed ${selectedBrawler.name}.`,
        variant: 'destructive',
      });
      setInputValue('');
      setSelectedBrawler(null);
      return;
    }
    
    // Add the guess at the beginning of the array (newest first)
    setGuesses(prevGuesses => [selectedBrawler, ...prevGuesses]);
    setGuessedBrawlerNames(prev => [...prev, selectedBrawler.name]);
    setGuessCount(prevCount => prevCount + 1);
    
    if (isSurvivalMode) {
      // In survival mode, don't manage local guesses - let the parent handle it
      // The parent (SurvivalMode) will track guesses through its own state
    } else {
      // Only manage local guesses in non-survival modes
      setGuessesLeft(prevLeft => prevLeft - 1);
    }
    
    setInputValue('');
    setSelectedBrawler(null);
    setLastGuessIndex(0); // Set to 0 since newest guess is now at the top
    
    // Check if correct guess
    const isCorrect = selectedBrawler.name.toLowerCase() === correctBrawlerName.toLowerCase();
    
    if (isCorrect) {
      // For survival mode, defer to the parent component to handle victory
      if (isSurvivalMode && onRoundEnd) {
        // Pass the actual brawler name that was guessed correctly to ensure correct display in victory popup
        onRoundEnd({ success: true, brawlerName: selectedBrawler.name });
        return;
      }
      
      // Standard victory handling
      toast({
        id: String(Date.now()),
        title: 'Correct!',
        description: `You guessed ${correctBrawlerName} in ${guessCount + 1} tries.`,
        variant: 'default',
      });
      
      setIsGameOver(true);
      
      // For endless mode, prepare for the next round after a delay
      if (isEndlessMode) {
        setTimeout(() => {
          resetGame();
        }, 2000);
      }
    }
    // Check if out of guesses
    else {
      const outOfGuesses = isSurvivalMode ? guessCount + 1 >= maxGuesses : guessCount + 1 >= maxGuesses;
      
      if (outOfGuesses) {
        // For survival mode, defer to the parent component to handle loss
        if (isSurvivalMode && onRoundEnd) {
          onRoundEnd({ success: false, brawlerName: correctBrawlerName });
          return;
        }
        
        // Standard game over handling
        toast({
          id: String(Date.now()),
          title: 'Game Over',
          description: `The correct answer was ${correctBrawlerName}.`,
          variant: 'destructive',
        });
        
        setIsGameOver(true);
      }
    }
  };

  // Get the correct brawler object for comparison
  const correctBrawler = getCorrectBrawler();
  
  // Define the structure for the guess grid based on the device type
  const gridWidthClass = isMobile ? "w-full" : "w-full max-w-4xl mx-auto";
  const gridTemplateClass = "grid-cols-6"; // Use 6 columns for all attributes
  
  // Attribute labels for the header
  const attributeLabels = [
    t('attribute.label.brawler'),
    t('attribute.label.rarity'), 
    t('attribute.label.class'),
    t('attribute.label.range'),
    t('attribute.label.wallbreak'),
    t('attribute.label.release.year')
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-[80vh] grid place-items-center">
        <Card className="p-4 text-center animate-pulse">
          <p>Loading challenge...</p>
        </Card>
      </div>
    );
  }

  return (
    <div key={gameKey} className="flex flex-col min-h-[70vh] py-1">
      {!isSurvivalMode && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {!isEndlessMode ? (
              <span className="text-sm text-white/60">Daily Challenge</span>
            ) : (
              <span className="text-sm text-white/60">Endless Mode</span>
            )}
            
            {!isSurvivalMode && (
              <div className="flex items-center gap-1">
                <Switch 
                  checked={isEndlessMode}
                  onCheckedChange={toggleEndlessMode}
                  className="data-[state=checked]:bg-amber-500"
                />
                <Infinity className="h-4 w-4 text-white/60" />
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mb-2 flex flex-col">
        <div className="mb-2">
          <form onSubmit={handleSubmit} className="space-y-2">
            <BrawlerAutocomplete
              brawlers={availableBrawlers}
              value={inputValue}
              onChange={setInputValue}
              onSelect={handleSelectBrawler}
              onSubmit={handleSubmit}
              disabled={isGameOver}
              disabledBrawlers={guessedBrawlerNames}
            />
            
            {/* Guess Button - only show when not in survival mode */}
            {!isSurvivalMode && (
            <Button 
              type="submit" 
              disabled={!selectedBrawler || isGameOver}
              className={cn(
                "w-full bg-gradient-to-r from-amber-600 to-pink-600 hover:from-amber-500 hover:to-pink-500 border-none",
                (!selectedBrawler || isGameOver) && "opacity-50 cursor-not-allowed"
              )}
            >
              Guess
            </Button>
            )}
          </form>
          
          {/* Guess Counter - only show in survival mode */}
          {isSurvivalMode && (
            <div className="w-full flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2 bg-black/70 border-2 border-brawl-yellow px-6 py-2 rounded-full shadow-xl animate-pulse">
                <span className="text-brawl-yellow text-lg font-bold tracking-wide">{t('guesses.left')}</span>
                <span className={`text-2xl font-extrabold ${(maxGuesses - guessCount) <= 3 ? 'text-brawl-red animate-bounce' : 'text-white'}`}>{maxGuesses - guessCount}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className={gridWidthClass}>
          <div className="w-full rounded-lg overflow-hidden flex flex-col">
            {/* Only show header section for non-survival mode */}
            {!isSurvivalMode && (
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
            )}
            
            {/* Attribute labels with glass effect and perfect square aspect ratio */}
            <div className={cn(
              "grid",
              gridTemplateClass,
              isMobile ? "gap-1 mb-1" : "gap-5 mb-2",
              "w-full px-1"
            )}>
              {attributeLabels.map((label, index) => {
                return (
                  <div key={label} className={cn(
                    "w-full relative",
                    isMobile ? "h-6" : "h-10"
                  )}>
                    {/* Yellow accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brawl-yellow"></div>
                    
                    {/* Text with adaptive sizing - positioned near the bottom */}
                    <div className="w-full flex items-end justify-center pb-1">
                      <span className={cn(
                        isMobile ? "text-xs" : "text-sm",
                        "font-extrabold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                      )}>
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Guesses display */}
            <div className="overflow-auto flex-1 min-h-0 max-h-[calc(100vh-250px)]">
              <div className="space-y-3">
                {guesses.map((guess, index) => (
                  <BrawlerGuessRow 
                    key={`${guess.name}-${index}`} 
                    guess={guess} 
                    correctAnswer={correctBrawler} 
                    isMobile={isMobile}
                    gridWidthClass={gridWidthClass}
                    gridTemplateClass={gridTemplateClass}
                    isNew={index === lastGuessIndex} // Only the newest guess gets the animation
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share modal - don't show in survival mode */}
      {!isSurvivalMode && (
        <ShareResultModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          mode="classic"
          success={isGameOver}
          attempts={guessCount}
          maxAttempts={maxGuesses}
          brawlerName={correctBrawlerName}
        />
      )}

      {/* Modified game info display - only show for non-survival mode */}
      {!isSurvivalMode && (
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
      )}
    </div>
  );
};

export default ClassicMode;
