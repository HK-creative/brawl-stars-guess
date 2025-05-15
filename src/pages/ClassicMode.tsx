
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
import { Clock, Share2 } from 'lucide-react';

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

  // Fallback data in case Supabase fetch fails
  const fallbackBrawlerName = "Spike";
  
  // Find the correct brawler object
  const getCorrectBrawler = () => {
    return brawlers.find(b => b.name.toLowerCase() === correctBrawlerName.toLowerCase()) || brawlers[0];
  };

  useEffect(() => {
    const loadChallenge = async () => {
      setIsLoading(true);
      try {
        // Log the attempt to fetch data
        console.log("ClassicMode: Attempting to load challenge data");
        
        const data = await fetchDailyChallenge('classic');
        console.log("ClassicMode: Received data:", data);
        
        if (data) {
          setCorrectBrawlerName(data);
          setIsBackendConnected(true);
        } else {
          // Fallback to local data
          console.log("ClassicMode: No data received, using fallback");
          setCorrectBrawlerName(fallbackBrawlerName);
          setIsBackendConnected(false);
          toast({
            title: "Connection Error",
            description: "Couldn't load today's challenge. Using fallback data.",
            variant: "destructive"
          });
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

    // Update the countdown timer
    const updateCountdown = () => {
      setTimeUntilNext(getTimeUntilNextChallenge());
    };

    // Update countdown immediately and then every minute
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60000);

    return () => clearInterval(intervalId);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBrawler) {
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
    if (selectedBrawler.name.toLowerCase() === correctBrawlerName.toLowerCase()) {
      setIsGameOver(true);
      toast({
        title: "Success!",
        description: `Correct! You found ${correctBrawlerName} in ${guessCount + 1} guesses!`,
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

  return (
    <div className="max-h-[calc(100vh-70px)] overflow-hidden px-1">
      {/* Ultra-compact header */}
      <ModeDescription 
        title={t('mode.classic')} 
        description={t('mode.classic.description')}
        className="mb-1 py-1"
      />
      
      {!isBackendConnected && (
        <div className="mb-1 p-0.5 bg-amber-800/50 border border-amber-600 rounded-md text-white text-xs">
          <p>⚠️ Using fallback data: Connection issue</p>
        </div>
      )}
      
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
                    alt={correctBrawlerName}
                    fallbackSrc={DEFAULT_PORTRAIT}
                    imageType="portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="inline-block px-1 py-0.5 mb-0.5 rounded-full bg-brawl-green/20 text-brawl-green text-xs font-medium">
                    Victory!
                  </div>
                  <h3 className="text-base font-bold text-white">{correctBrawlerName}</h3>
                  <p className="text-white/80 text-xs">
                    Found in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}!
                  </p>
                </div>
                
                <Button
                  onClick={handleShare}
                  className="ml-1 bg-brawl-blue hover:bg-brawl-blue/80 h-8 w-8 p-0"
                  size="sm"
                >
                  <Share2 className="w-3 h-3" />
                </Button>
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
                <div className="text-xs flex items-center text-white/60 gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{timeUntilNext.hours}h {timeUntilNext.minutes}m</span>
                </div>
              </div>
              <div className="text-xs text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">
                {guessCount}/6
              </div>
            </div>
            
            {/* Column labels for the guess cards */}
            <div className="flex flex-row gap-1 mb-0.5 px-0.5 text-[10px] text-white/70">
              <div className="aspect-square h-4 flex items-center justify-center">
                <span>Brawler</span>
              </div>
              <div className="aspect-square h-4 flex items-center justify-center">
                <span>Rarity</span>
              </div>
              <div className="aspect-square h-4 flex items-center justify-center">
                <span>Class</span>
              </div>
              <div className="aspect-square h-4 flex items-center justify-center">
                <span>Speed</span>
              </div>
              <div className="aspect-square h-4 flex items-center justify-center">
                <span>Range</span>
              </div>
              <div className="aspect-square h-4 flex items-center justify-center">
                <span>Reload</span>
              </div>
            </div>
            
            {/* Guesses display */}
            <Card className="brawl-card p-1 overflow-auto flex-1 min-h-0 max-h-[calc(100vh-250px)]">
              <div className="space-y-1">
                {guesses.map((guess, index) => (
                  <BrawlerGuessRow 
                    key={index} 
                    guess={guess} 
                    correctAnswer={correctBrawler} 
                  />
                ))}
              </div>
            </Card>
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
    </div>
  );
};

export default ClassicMode;
