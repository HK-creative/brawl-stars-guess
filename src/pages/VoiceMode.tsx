
import React, { useState, useEffect } from 'react';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import { fetchDailyChallenge, getTimeUntilNextChallenge } from '@/lib/daily-challenges';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler } from '@/data/brawlers';
import { Check, X } from 'lucide-react';

interface VoiceChallenge {
  brawler: string;
  voiceLine: string;
}

const VoiceMode = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<VoiceChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0 });
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  
  const maxAttempts = 3;

  // Fallback data in case Supabase fetch fails
  const fallbackChallenge: VoiceChallenge = {
    brawler: "Shelly",
    voiceLine: "Let's go!"
  };

  useEffect(() => {
    const loadChallenge = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDailyChallenge('voice');
        if (data) {
          setDailyChallenge(data);
        } else {
          // Fallback to local data
          setDailyChallenge(fallbackChallenge);
          toast.error("Couldn't load today's challenge. Using fallback data.");
        }
      } catch (error) {
        console.error("Error loading voice challenge:", error);
        setDailyChallenge(fallbackChallenge);
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
    
    if (!guess.trim() || !dailyChallenge) return;
    
    // Check if already guessed
    if (guesses.includes(guess)) {
      toast.error('You already guessed this brawler!');
      return;
    }
    
    // Process the guess
    const isGuessCorrect = guess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    const newAttempts = attempts + 1;
    
    setAttempts(newAttempts);
    setGuesses([...guesses, guess]);
    
    if (isGuessCorrect) {
      setIsCorrect(true);
      setShowResult(true);
      toast.success('Correct! You found the right brawler!');
    } else if (newAttempts >= maxAttempts) {
      setShowResult(true);
      toast.error(`Out of attempts! The correct answer was ${dailyChallenge.brawler}.`);
    } else {
      toast.error(`Wrong guess! ${maxAttempts - newAttempts} attempts left.`);
    }
    
    setGuess('');
    setSelectedBrawler(null);
  };

  const handlePlayVoice = () => {
    console.log('Playing voice line');
    // Voice line playback logic will be implemented later
    toast.info("Voice playback would happen here. Coming soon!");
  };

  const handleBrawlerSelect = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
    setGuess(brawler.name);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!dailyChallenge) {
    return (
      <Card className="brawl-card p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brawl-yellow mb-2">No Challenge Available</h3>
          <p className="text-white/80">Check back later for today's challenge.</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <ModeDescription 
        title={t('mode.voice')} 
        description={t('mode.voice.description')}
      />
      
      <Card className="brawl-card mb-6 flex flex-col items-center justify-center py-8">
        <div className="text-6xl mb-4 animate-pulse-glow cursor-pointer" onClick={handlePlayVoice}>
          🗣️
        </div>
        <p className="text-white/80">Click to play voice line</p>
        <div className="mt-4 px-4 py-2 bg-white/10 rounded-lg">
          <p className="text-white/70 italic">
            {isCorrect || showResult ? `"${dailyChallenge.voiceLine}"` : `"..."`}
          </p>
        </div>
        
        <div className="mt-6 text-sm text-white/60">
          Next challenge in: {timeUntilNext.hours}h {timeUntilNext.minutes}m
        </div>
      </Card>
      
      {showResult ? (
        <div className="animate-fade-in">
          <Card className="brawl-card p-6 mb-4 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{dailyChallenge.brawler}</h3>
              </div>
            </div>
          </Card>
          
          <div className="text-center text-white/80 mt-4">
            <p>You got it {isCorrect ? 'right' : 'wrong'} in {attempts} {attempts === 1 ? 'guess' : 'guesses'}!</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <BrawlerAutocomplete
            brawlers={brawlers}
            value={guess}
            onChange={setGuess}
            onSelect={handleBrawlerSelect}
            disabled={showResult}
          />
          
          <Button 
            type="submit" 
            className="brawl-button"
            disabled={showResult || !guess}
          >
            {t('submit.guess')}
          </Button>
          
          {guesses.length > 0 && (
            <div className="mt-4">
              <h3 className="text-white font-medium mb-2">Previous Guesses:</h3>
              <div className="space-y-2">
                {guesses.map((pastGuess, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 rounded bg-white/10"
                  >
                    <span className="mr-2">
                      {pastGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase() ? (
                        <Check className="w-5 h-5 text-brawl-green" />
                      ) : (
                        <X className="w-5 h-5 text-brawl-red" />
                      )}
                    </span>
                    <span className="text-white">{pastGuess}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default VoiceMode;
