
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
          toast.error("Couldn't load today's challenge. Using fallback data.");
        }
      } catch (error) {
        console.error("Error loading classic challenge:", error);
        setCorrectBrawlerName(fallbackBrawlerName);
        setIsBackendConnected(false);
        toast.error("Couldn't load today's challenge. Using fallback data.");
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
      toast.error("Please select a valid Brawler");
      return;
    }
    
    // Add the guess to the list
    setGuesses(prev => [selectedBrawler, ...prev]);
    setGuessCount(prev => prev + 1);
    
    // Check if the guess is correct
    if (selectedBrawler.name.toLowerCase() === correctBrawlerName.toLowerCase()) {
      setIsGameOver(true);
      toast.success(`Correct! You found ${correctBrawlerName} in ${guessCount + 1} guesses!`);
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
    <div>
      <ModeDescription 
        title={t('mode.classic')} 
        description={t('mode.classic.description')}
      />
      
      {!isBackendConnected && (
        <div className="mb-4 p-2 bg-amber-800/50 border border-amber-600 rounded-md text-white text-sm">
          <p>⚠️ Using fallback data: Could not connect to the challenge database.</p>
        </div>
      )}
      
      {isGameOver ? (
        <div className="mb-6 animate-fade-in">
          <Card className="brawl-card p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Large image section */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-brawl-blue/20 to-brawl-dark overflow-hidden">
                <Image
                  src={portraitPath}
                  alt={correctBrawlerName}
                  fallbackSrc={DEFAULT_PORTRAIT}
                  imageType="portrait"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content section */}
              <div className="p-6 flex flex-col justify-center w-full md:w-1/2">
                <div className="text-center md:text-left">
                  <div className="inline-block px-3 py-1 mb-4 rounded-full bg-brawl-green/20 text-brawl-green text-sm font-medium">
                    Victory!
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{correctBrawlerName}</h3>
                  <p className="text-white/80 mb-4">
                    You found the correct brawler in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}!
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 flex items-center">
                      <span className="mr-1">🏆</span> {correctBrawler.rarity}
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 flex items-center">
                      <span className="mr-1">👤</span> {correctBrawler.class}
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 flex items-center">
                      <span className="mr-1">🏃</span> {correctBrawler.movement}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleShare}
                    className="w-full bg-brawl-blue hover:bg-brawl-blue/80 text-white flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Result
                  </Button>
                  
                  <div className="flex items-center justify-center mt-4 text-sm text-white/60 gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Next: {timeUntilNext.hours}h {timeUntilNext.minutes}m</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <BrawlerAutocomplete
            brawlers={brawlers}
            value={inputValue}
            onChange={setInputValue}
            onSelect={handleSelectBrawler}
            disabled={isGameOver}
          />
          <Button 
            type="submit" 
            className="brawl-button bg-brawl-yellow hover:bg-brawl-yellow/80 text-black font-semibold"
            disabled={isGameOver || !selectedBrawler}
          >
            {t('submit.guess')}
          </Button>
          
          <div className="flex items-center justify-center gap-1 text-sm text-white/60 mt-2">
            <Clock className="w-4 h-4" />
            <span>Next: {timeUntilNext.hours}h {timeUntilNext.minutes}m</span>
          </div>
        </form>
      )}
      
      <div className="mb-4">
        <h3 className="text-white text-lg font-semibold mb-2">
          Guesses: {guessCount}
        </h3>
      </div>
      
      {/* Guesses display */}
      <div className="space-y-4">
        {guesses.length > 0 ? (
          guesses.map((guess, index) => (
            <BrawlerGuessRow 
              key={index} 
              guess={guess} 
              correctAnswer={correctBrawler} 
            />
          ))
        ) : (
          <Card className="brawl-card p-4">
            <p className="text-white text-center">Make your first guess!</p>
          </Card>
        )}
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
