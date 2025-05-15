
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { brawlers, Brawler } from '@/data/brawlers';
import BrawlerGuessRow from '@/components/BrawlerGuessRow';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { getRandomBrawler } from '@/lib/daily-challenges';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import ShareResultModal from '@/components/ShareResultModal';
import Image from '@/components/ui/image';
import { RefreshCw, Share2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const EndlessMode = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [guesses, setGuesses] = useState<Brawler[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [correctBrawler, setCorrectBrawler] = useState<Brawler | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [guessedBrawlers, setGuessedBrawlers] = useState<string[]>([]);
  const isMobile = useIsMobile();

  // Define attribute labels with adaptive sizing - Added this missing definition
  const attributeLabels = [
    { name: "Brawler", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Rarity", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Class", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Speed", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Range", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Wallbreak", fontSize: isMobile ? "text-xs" : "text-xl" }
  ];

  // Load a random brawler for the endless challenge
  useEffect(() => {
    startNewChallenge();
  }, []);
  
  const startNewChallenge = () => {
    setIsLoading(true);
    try {
      // Get a random brawler
      const randomBrawler = getRandomBrawler();
      setCorrectBrawler(randomBrawler);
      
      // Reset the game state
      setGuesses([]);
      setGuessCount(0);
      setIsGameOver(false);
      setInputValue('');
      setSelectedBrawler(null);
      setGuessedBrawlers([]);
    } catch (error) {
      console.error("Error starting new challenge:", error);
      toast({
        title: "Error",
        description: "Couldn't start a new challenge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!selectedBrawler || !correctBrawler) {
      toast({
        title: "Error",
        description: "Please select a valid Brawler",
        variant: "destructive"
      });
      return;
    }
    
    // Prevent guessing the same brawler twice
    if (guessedBrawlers.includes(selectedBrawler.name)) {
      toast({
        title: "Already Guessed",
        description: `You've already guessed ${selectedBrawler.name}!`,
        variant: "destructive"
      });
      return;
    }
    
    // Add the guess to the list and track guessed brawlers
    setGuesses(prev => [selectedBrawler, ...prev]);
    setGuessedBrawlers(prev => [...prev, selectedBrawler.name]);
    setGuessCount(prev => prev + 1);
    
    // Check if the guess is correct
    if (selectedBrawler.name.toLowerCase() === correctBrawler.name.toLowerCase()) {
      setIsGameOver(true);
      toast({
        title: "Success!",
        description: `Correct! You found ${correctBrawler.name} in ${guessCount + 1} guesses!`,
        variant: "default"
      });
    }
    
    // Reset the input
    setInputValue('');
    setSelectedBrawler(null);
  };
  
  const handleSelectBrawler = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!correctBrawler) {
    return (
      <Card className="brawl-card p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brawl-yellow mb-2">Error Loading Challenge</h3>
          <p className="text-white/80">Try refreshing the page.</p>
        </div>
      </Card>
    );
  }

  const portraitPath = getPortrait(correctBrawler.name);
  
  return (
    <div className="max-h-[calc(100vh-70px)] overflow-hidden px-1">
      {/* Ultra-compact header */}
      <ModeDescription 
        title={t('mode.endless')} 
        description="Play as many rounds as you want with random brawlers."
        className="mb-1 py-1"
      />
      
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Game area */}
        <div className="flex-1 flex flex-col space-y-1">
          {isGameOver ? (
            <Card className="brawl-card overflow-hidden mb-1 p-2">
              <div className="flex items-center">
                {/* Victory display */}
                <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden mr-2">
                  <Image
                    src={portraitPath}
                    alt={correctBrawler.name}
                    fallbackSrc={DEFAULT_PORTRAIT}
                    imageType="portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="inline-block px-1 py-0.5 mb-0.5 rounded-full bg-brawl-green/20 text-brawl-green text-xs font-medium">
                    Victory!
                  </div>
                  <h3 className="text-base font-bold text-white">{correctBrawler.name}</h3>
                  <p className="text-white/80 text-xs">
                    Found in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}!
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    onClick={handleShare}
                    className="ml-1 bg-brawl-blue hover:bg-brawl-blue/80 h-8 w-8 p-0"
                    size="sm"
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={startNewChallenge}
                    className="ml-1 bg-brawl-green hover:bg-brawl-green/80 h-8 w-8 p-0"
                    size="sm"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="brawl-card p-2 mb-1">
              <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                <BrawlerAutocomplete
                  brawlers={brawlers}
                  value={inputValue}
                  onChange={setInputValue}
                  onSelect={handleSelectBrawler}
                  onSubmit={handleSubmit}
                  disabled={isGameOver}
                  disabledBrawlers={guessedBrawlers}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-brawl-yellow hover:bg-brawl-yellow/80 text-black font-semibold py-1 h-8"
                  disabled={isGameOver || !selectedBrawler}
                >
                  {t('submit.guess')}
                </Button>
              </form>
            </Card>
          )}
          
          {/* Guesses section with redesigned header */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* New redesigned header */}
            <div className="bg-gradient-to-r from-purple-800/80 via-purple-900/90 to-purple-800/80 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-white leading-tight">
                    Endless Challenge
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="bg-purple-700/50 text-white/90 text-xs px-2 py-1 rounded-full">
                      {guessCount} {guessCount === 1 ? 'attempt' : 'attempts'}
                    </div>
                    <Button
                      onClick={startNewChallenge}
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-2 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white/90 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      New Brawler
                    </Button>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  ∞
                </div>
              </div>
            </div>
            
            {/* Attribute labels with glass effect and perfect square aspect ratio */}
            <div className={cn(
              "grid",
              "grid-cols-6",
              isMobile ? "gap-1 mb-1" : "gap-3 mb-3",
              isMobile ? "w-full" : "w-[85%] mx-auto"
            )}>
              {attributeLabels.map((label, index) => {
                return (
                  <div key={label.name} className="w-full aspect-square">
                    <div className={cn(
                      "relative overflow-hidden w-full h-full"
                    )}>
                      {/* Transparent glass effect */}
                      <div className="absolute inset-0 backdrop-blur-sm border-b-2 border-brawl-blue rounded-t-lg"></div>
                      
                      {/* Yellow accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brawl-yellow"></div>
                      
                      {/* Text with adaptive sizing - now using 85% of container */}
                      <div className="relative z-10 h-full w-full flex items-center justify-center">
                        <span className={cn(
                          label.fontSize,
                          "font-extrabold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] w-[85%] h-[85%] flex items-center justify-center"
                        )}>
                          {label.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Guesses display */}
            <div className="overflow-auto flex-1 min-h-0 max-h-[calc(100vh-250px)] p-1">
              <div className="space-y-1">
                {guesses.map((guess, index) => (
                  <BrawlerGuessRow 
                    key={index} 
                    guess={guess} 
                    correctAnswer={correctBrawler} 
                    isMobile={isMobile}
                    gridWidthClass={isMobile ? "w-full" : "w-[85%] mx-auto"}
                    gridTemplateClass="grid-cols-6"
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
        mode="endless"
        success={isGameOver}
        attempts={guessCount}
        maxAttempts={0} // Endless mode has no max attempts
        brawlerName={correctBrawler.name}
      />
    </div>
  );
};

export default EndlessMode;
