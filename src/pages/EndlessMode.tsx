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
  const isMobile = useIsMobile();

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBrawler || !correctBrawler) {
      toast({
        title: "Error",
        description: "Please select a valid Brawler",
        variant: "destructive"
      });
      return;
    }
    
    // Add the guess to the list
    setGuesses(prev => [selectedBrawler, ...prev]);
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
                  disabled={isGameOver}
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
          
          {/* Guesses section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-0.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <div className="text-white text-xs font-medium">
                  Guesses: {guessCount}
                </div>
                
                <Button
                  onClick={startNewChallenge}
                  className="bg-brawl-green/20 hover:bg-brawl-green/30 text-brawl-green h-6 py-0 px-2 text-xs"
                  size="sm"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  New Challenge
                </Button>
              </div>
              <div className="text-xs text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">
                {guessCount}/∞
              </div>
            </div>
            
            {/* Attribute labels with glass effect and perfect square aspect ratio */}
            <div className={cn(
              "grid",
              gridTemplateClass,
              headerSpacingClass,
              gridWidthClass
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
