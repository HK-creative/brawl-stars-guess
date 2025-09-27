import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { brawlers, Brawler, getBrawlerDisplayName } from '@/data/brawlers';
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

import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { GuessCounter } from '@/components/ui/guess-counter';
import { getLanguage } from '@/lib/i18n';

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
  const { motionOK, transition } = useMotionPrefs();
  const [guessedBrawlerNames, setGuessedBrawlerNames] = useState<string[]>([]);
  const [availableBrawlers, setAvailableBrawlers] = useState<Brawler[]>([]);
  const [lastGuessIndex, setLastGuessIndex] = useState<number | null>(null); // Track the most recent guess
  const [gameKey, setGameKey] = useState(Date.now().toString()); // Key to force re-render
  
  // New state for discovered attributes (survival mode only)
  const [discoveredAttributes, setDiscoveredAttributes] = useState<{
    rarity?: string;
    class?: string;
    range?: string;
    wallbreak?: string | null;
    releaseYear?: number;
  }>({});
  
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
    setDiscoveredAttributes({});
    
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
    setDiscoveredAttributes({});
    
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
    
    // Update discovered attributes for survival mode
    if (isSurvivalMode) {
      const correctBrawler = getCorrectBrawler();
      const newDiscovered = { ...discoveredAttributes };
      
      if (selectedBrawler.rarity === correctBrawler.rarity && !newDiscovered.rarity) {
        newDiscovered.rarity = correctBrawler.rarity;
      }
      if (selectedBrawler.class === correctBrawler.class && !newDiscovered.class) {
        newDiscovered.class = correctBrawler.class;
      }
      if (selectedBrawler.range === correctBrawler.range && !newDiscovered.range) {
        newDiscovered.range = correctBrawler.range;
      }
      if (selectedBrawler.wallbreak === correctBrawler.wallbreak && !newDiscovered.wallbreak) {
        newDiscovered.wallbreak = correctBrawler.wallbreak;
      }
      if (selectedBrawler.releaseYear === correctBrawler.releaseYear && !newDiscovered.releaseYear) {
        newDiscovered.releaseYear = correctBrawler.releaseYear;
      }
      
      setDiscoveredAttributes(newDiscovered);
    }
    
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

  const currentLanguage = getLanguage();
  const isRTL = currentLanguage === 'he';
  
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
        {/* Attribute Discovery Card - only show in survival mode, using Daily Mode design */}
        {isSurvivalMode && (
          <div className="flex justify-center mb-6">
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-amber-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
              <div className="flex flex-col justify-center p-2 w-full h-full">
                <div className="flex flex-col gap-1.5 h-full justify-center">
                  {/* Rarity */}
                  <div className={cn(
                    "flex-1 aspect-square flex items-center rounded-lg px-2 py-1.5 min-h-0",
                    discoveredAttributes.rarity 
                      ? "bg-green-500/20 border border-green-500/40" 
                      : "bg-gray-500/20 border border-gray-500/40"
                  )}>
                    <div className={cn(
                      "flex items-center justify-between w-full",
                      currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "text-[10px] font-medium",
                        discoveredAttributes.rarity ? "text-green-400" : "text-gray-400"
                      )}>{t('attribute.label.rarity')}</div>
                      <div className="text-white text-xs font-bold">
                        {discoveredAttributes.rarity ? t(`rarity.${discoveredAttributes.rarity.toLowerCase().replace(' ', '.')}`) : '?'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Class */}
                  <div className={cn(
                    "flex-1 aspect-square flex items-center rounded-lg px-2 py-1.5 min-h-0",
                    discoveredAttributes.class 
                      ? "bg-green-500/20 border border-green-500/40" 
                      : "bg-gray-500/20 border border-gray-500/40"
                  )}>
                    <div className={cn(
                      "flex items-center justify-between w-full",
                      currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "text-[10px] font-medium",
                        discoveredAttributes.class ? "text-green-400" : "text-gray-400"
                      )}>{t('attribute.label.class')}</div>
                      <div className="text-white text-xs font-bold">
                        {discoveredAttributes.class || '?'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Range */}
                  <div className={cn(
                    "flex-1 aspect-square flex items-center rounded-lg px-2 py-1.5 min-h-0",
                    discoveredAttributes.range 
                      ? "bg-green-500/20 border border-green-500/40" 
                      : "bg-gray-500/20 border border-gray-500/40"
                  )}>
                    <div className={cn(
                      "flex items-center justify-between w-full",
                      currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "text-[10px] font-medium",
                        discoveredAttributes.range ? "text-green-400" : "text-gray-400"
                      )}>{t('attribute.label.range')}</div>
                      <div className="text-white text-xs font-bold">
                        {discoveredAttributes.range ? t(`range.${discoveredAttributes.range.toLowerCase().replace(' ', '.')}`) : '?'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Wall Break */}
                  <div className={cn(
                    "flex-1 aspect-square flex items-center rounded-lg px-2 py-1.5 min-h-0",
                    discoveredAttributes.wallbreak !== null 
                      ? "bg-green-500/20 border border-green-500/40" 
                      : "bg-gray-500/20 border border-gray-500/40"
                  )}>
                    <div className={cn(
                      "flex items-center justify-between w-full",
                      currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "text-[9px] font-medium",
                        discoveredAttributes.wallbreak !== null ? "text-green-400" : "text-gray-400"
                      )}>{t('attribute.label.wallbreak')}</div>
                      <div className="text-white text-xs font-bold">
                        {discoveredAttributes.wallbreak !== null ? t(`wallbreak.${discoveredAttributes.wallbreak ? 'yes' : 'no'}`) : '?'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Release Year */}
                  <div className={cn(
                    "flex-1 aspect-square flex items-center rounded-lg px-2 py-1.5 min-h-0",
                    discoveredAttributes.releaseYear 
                      ? "bg-green-500/20 border border-green-500/40" 
                      : "bg-gray-500/20 border border-gray-500/40"
                  )}>
                    <div className={cn(
                      "flex items-center justify-between w-full",
                      currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "text-[10px] font-medium",
                        discoveredAttributes.releaseYear ? "text-green-400" : "text-gray-400"
                      )}>{t('attribute.label.year')}</div>
                      <div className="text-white text-xs font-bold">
                        {discoveredAttributes.releaseYear || '?'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search Bar - Match Daily Mode exactly for survival mode */}
        {isSurvivalMode ? (
          <div className="daily-mode-input-section mb-8 w-full max-w-md mx-auto">
            <BrawlerAutocomplete
              brawlers={availableBrawlers}
              value={inputValue}
              onChange={setInputValue}
              onSelect={handleSelectBrawler}
              onSubmit={handleSubmit}
              disabled={isGameOver}
              disabledBrawlers={guessedBrawlerNames}
            />
          </div>
        ) : (
          <div className="mb-2">
            <form className="space-y-2">
              <div className="w-full max-w-md mx-auto">
                <BrawlerAutocomplete
                  brawlers={availableBrawlers}
                  value={inputValue}
                  onChange={setInputValue}
                  onSelect={handleSelectBrawler}
                  onSubmit={handleSubmit}
                  disabled={isGameOver}
                  disabledBrawlers={guessedBrawlerNames}
                />
              </div>
              
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
            </form>
          </div>
        )}

        {/* Guess Counter - Daily Mode style for survival mode */}
        {isSurvivalMode && (
          <div className="flex justify-center mb-4">
            <motion.div 
              className="daily-mode-guess-counter flex items-center"
              initial={motionOK ? { opacity: 0, y: 10 } : { opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
            >
              <span className="font-bold text-sm mr-1">#</span>
              <div className={cn(
                "font-bold text-sm",
                guessesLeft <= 3 ? "text-red-300" : "text-white"
              )}>
                <SlidingNumber value={guessesLeft} />
              </div>
              <span className="text-white/90 ml-1 text-sm">{t('guesses.left')}</span>
            </motion.div>
          </div>
        )}
        
        <div className={gridWidthClass}>
          <div className="w-full rounded-lg overflow-hidden flex flex-col">
            {/* Only show header section for non-survival mode */}
            {!isSurvivalMode && (
              <div className="flex justify-between items-center mb-1 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="text-white text-sm font-medium">
                    {t('number.of.guesses')}: <span className="inline-block align-middle"><SlidingNumber value={guessCount} padStart /></span>
                  </div>
                  <div className="text-xs flex items-center text-white/60 gap-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{timeUntilNext.hours}h {timeUntilNext.minutes}m</span>
                  </div>
                </div>
                <div className="text-xs text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">
                  <span className="inline-block align-middle"><SlidingNumber value={guessCount} /></span>/{maxGuesses}
                </div>
              </div>
            )}
            
            
{/* Guesses Section - Different for Daily vs Survival */}
            {isSurvivalMode ? (
              /* Simple Guesses Grid for Survival Mode - Match Daily Mode exactly */
              guesses.length > 0 && (
                <div className="daily-mode-guesses-section">
                  <motion.div className="daily-mode-guesses-grid" layout>
                    {guesses.map((guess, index) => {
                      const isCorrect = guess.name.toLowerCase() === getCorrectBrawler().name.toLowerCase();
                      const portraitSrc = getPortrait(guess.name) || DEFAULT_PORTRAIT;
                      const isNewest = index === 0; // The newest guess is always at index 0
                      
                      if (isNewest) {
                        // Only the newest guess gets entrance animation
                        return (
                          <motion.div
                            key={guess.name} // Use stable key based on name, not index
                            initial={motionOK ? { 
                              opacity: 0, 
                              scale: 0.8,
                              y: -20,
                              filter: "blur(3px)"
                            } : { opacity: 0 }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              y: 0,
                              filter: "blur(0px)",
                              transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                mass: 0.8
                              }
                            }}
                            layout
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
                          </motion.div>
                        );
                      } else {
                        // Existing guesses just get layout animations for repositioning
                        return (
                          <motion.div
                            key={guess.name} // Stable key
                            layout
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                              mass: 0.6
                            }}
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
                          </motion.div>
                        );
                      }
                    })}
                  </motion.div>
                </div>
              )
            ) : (
              /* Detailed Attribute Comparison Grid for Daily Mode */
              guesses.length > 0 && (
                <div className="mt-8">
                  <div className="space-y-3">
                    {/* Header Row - Daily Mode style with smaller text */}
                    <div className="grid grid-cols-6 gap-2 text-center text-white/60 text-xs font-medium mb-2">
                      <div className="border-b border-white/20 pb-1">{t('attribute.label.brawler')}</div>
                      <div className="border-b border-white/20 pb-1">{t('attribute.label.rarity')}</div>
                      <div className="border-b border-white/20 pb-1">{t('attribute.label.class')}</div>
                      <div className="border-b border-white/20 pb-1">{t('attribute.label.range')}</div>
                      <div className="border-b border-white/20 pb-1 text-[9px]">{t('attribute.label.wallbreak')}</div>
                      <div className="border-b border-white/20 pb-1">{t('attribute.label.year')}</div>
                    </div>
                    
                    {/* Guess Rows */}
                    <AnimatePresence initial={false} mode="popLayout">
                      {guesses.map((guess, index) => {
                        const isNewest = index === 0; // Newest is first in array
                        return (
                          <motion.div
                            key={`${guess.name}-${guesses.length - index}`}
                            initial={motionOK && isNewest ? { 
                              opacity: 0, 
                              y: 60,
                              scale: 0.95,
                              filter: "blur(4px)"
                            } : { opacity: 0 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              filter: "blur(0px)",
                              transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                                mass: 0.8,
                                duration: 0.6
                              }
                            }}
                            exit={{ 
                              opacity: 0, 
                              scale: 0.95,
                              y: -20,
                              transition: { duration: 0.3, ease: "easeInOut" }
                            }}
                            layout
                            transition={{
                              layout: {
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                                mass: 0.8
                              }
                            }}
                          >
                            <BrawlerGuessRow
                              guess={guess}
                              correctAnswer={correctBrawler}
                              isMobile={window.innerWidth < 768}
                              gridTemplateClass="grid-cols-6"
                              isNew={index === 0}
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )
            )}
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
