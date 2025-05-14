import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
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
    <div className="max-h-screen overflow-hidden px-2 pb-2">
      {/* Compact header */}
      <ModeDescription 
        title={t('mode.classic')} 
        description={t('mode.classic.description')}
        className="mb-2 py-2"
      />
      
      {!isBackendConnected && (
        <div className="mb-2 p-1 bg-amber-800/50 border border-amber-600 rounded-md text-white text-xs">
          <p>⚠️ Using fallback data: Connection issue</p>
        </div>
      )}
      
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {/* Game area */}
        <div className="flex-1 flex flex-col justify-between">
          {isGameOver ? (
            <Card className="brawl-card overflow-hidden mb-2">
              <div className="flex items-center p-3">
                {/* Victory display */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden mr-3">
                  <Image
                    src={portraitPath}
                    alt={correctBrawlerName}
                    fallbackSrc={DEFAULT_PORTRAIT}
                    imageType="portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="inline-block px-2 py-0.5 mb-1 rounded-full bg-brawl-green/20 text-brawl-green text-xs font-medium">
                    Victory!
                  </div>
                  <h3 className="text-lg font-bold text-white">{correctBrawlerName}</h3>
                  <p className="text-white/80 text-sm">
                    Found in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}!
                  </p>
                </div>
                
                <Button
                  onClick={handleShare}
                  className="ml-2 bg-brawl-blue hover:bg-brawl-blue/80 h-10 w-10 p-0"
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="brawl-card p-2 mb-2">
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <BrawlerAutocomplete
                  brawlers={brawlers}
                  value={inputValue}
                  onChange={setInputValue}
                  onSelect={handleSelectBrawler}
                  disabled={isGameOver}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-brawl-yellow hover:bg-brawl-yellow/80 text-black font-semibold py-2 h-10"
                  disabled={isGameOver || !selectedBrawler}
                >
                  {t('submit.guess')}
                </Button>
              </form>
            </Card>
          )}
          
          {/* Guesses section */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1 px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white text-sm font-medium">
                  Guesses: {guessCount}
                </h3>
                <div className="text-xs flex items-center text-white/60 gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{timeUntilNext.hours}h {timeUntilNext.minutes}m</span>
                </div>
              </div>
              <div className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                {guessCount}/6
              </div>
            </div>
            
            {/* Guesses display */}
            <Card className="brawl-card p-2 overflow-auto flex-1 max-h-[calc(100vh-320px)]">
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
