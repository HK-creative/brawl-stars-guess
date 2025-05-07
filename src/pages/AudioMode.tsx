
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Volume2, Play, Check, X } from 'lucide-react';
import ModeDescription from '@/components/ModeDescription';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { getBrawlerByName } from '@/data/audioChallenges';
import { Brawler, brawlers } from '@/data/brawlers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchDailyChallenge, getTimeUntilNextChallenge } from '@/lib/daily-challenges';

const MAX_GUESSES = 3;

interface AudioChallenge {
  brawler: string;
  audioFile: string;
}

const AudioMode = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<AudioChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Fallback data in case Supabase fetch fails
  const fallbackChallenge: AudioChallenge = {
    brawler: "Spike",
    audioFile: "/audio/spike_super.mp3"
  };
  
  // In a real implementation, we would check if today's challenge was already solved
  const remainingGuesses = MAX_GUESSES - guesses.length;
  const isGameOver = isCorrect || remainingGuesses <= 0;

  useEffect(() => {
    const loadChallenge = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDailyChallenge('audio');
        if (data) {
          setDailyChallenge(data);
        } else {
          // Fallback to local data
          setDailyChallenge(fallbackChallenge);
          toast.error("Couldn't load today's challenge. Using fallback data.");
        }
      } catch (error) {
        console.error("Error loading audio challenge:", error);
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
  
  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Audio playback error:", error);
          toast.error("Failed to play audio. Please try again.");
        });
    } else {
      // Mock audio playback for now
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
      toast.info("Audio would play here. This is a placeholder.");
    }
  };
  
  const handleSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dailyChallenge) return;
    
    if (guess.trim() === '') {
      toast.error("Please enter a brawler name");
      return;
    }
    
    if (guesses.includes(guess)) {
      toast.error("You've already guessed this brawler");
      return;
    }

    if (isGameOver) {
      return;
    }
    
    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    
    // Check if correct
    const isCorrectGuess = guess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    
    if (isCorrectGuess) {
      setIsCorrect(true);
      toast.success("Correct! You got it!");
      setShowResult(true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      toast.error(`Game over! The brawler was ${dailyChallenge.brawler}`);
      setShowResult(true);
    } else {
      toast.error(`Wrong guess! ${remainingGuesses - 1} ${remainingGuesses - 1 === 1 ? 'guess' : 'guesses'} left`);
    }
    
    setGuess('');
  };
  
  const handleBrawlerSelect = (brawler: Brawler) => {
    setGuess(brawler.name);
  };
  
  const handleReset = () => {
    setGuess('');
    setGuesses([]);
    setIsCorrect(false);
    setShowResult(false);
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
  
  // Get the correct brawler data
  const correctBrawler = getBrawlerByName(dailyChallenge.brawler);

  return (
    <div>
      <ModeDescription 
        title={t('mode.audio')} 
        description={t('mode.audio.description')}
      />
      
      {/* Audio player */}
      <Card className="brawl-card mb-6 flex flex-col items-center justify-center py-8">
        <button 
          className="text-6xl mb-4 relative cursor-pointer transform transition-transform hover:scale-105 active:scale-95"
          onClick={handlePlayAudio}
          disabled={isGameOver}
        >
          <div className={`absolute inset-0 bg-brawl-yellow/20 rounded-full ${isPlaying ? 'animate-ping' : ''}`}></div>
          <div className="relative z-10 bg-brawl-yellow/30 p-6 rounded-full">
            {isPlaying ? <Volume2 size={48} className="text-white animate-pulse" /> : <Play size={48} className="text-white ml-2" />}
          </div>
        </button>
        <p className="text-white/80">Click to play attack sound</p>
        
        {/* Hidden audio element */}
        <audio 
          ref={audioRef}
          src={dailyChallenge.audioFile} 
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
        
        <div className="mt-6 text-sm text-white/60">
          Next challenge in: {timeUntilNext.hours}h {timeUntilNext.minutes}m
        </div>
      </Card>
      
      {/* Guess form */}
      <form onSubmit={handleSubmitGuess} className="flex flex-col gap-4">
        <BrawlerAutocomplete
          brawlers={brawlers}
          value={guess}
          onChange={setGuess}
          onSelect={handleBrawlerSelect}
          disabled={isGameOver}
        />
        
        <Button 
          type="submit" 
          className="brawl-button"
          disabled={isGameOver || guess.trim() === ''}
        >
          {t('submit.guess')}
        </Button>
      </form>
      
      {/* Previous guesses */}
      {guesses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-white/80 mb-2">Your guesses ({guesses.length}/{MAX_GUESSES}):</h3>
          <div className="space-y-2">
            {guesses.map((guessName, index) => {
              const isGuessCorrect = guessName.toLowerCase() === dailyChallenge.brawler.toLowerCase();
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-md flex items-center justify-between ${
                    isGuessCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
                  } animate-fade-in`}
                >
                  <span className="text-white">{guessName}</span>
                  {isGuessCorrect ? 
                    <Check className="text-green-500" size={20} /> : 
                    <X className="text-red-500" size={20} />
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Result modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-center text-brawl-yellow">
              {isCorrect ? "Congratulations!" : "Game Over!"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center pt-4">
            {correctBrawler && (
              <>
                <div className="w-24 h-24 rounded-full bg-gray-800 mb-4 overflow-hidden border-4 border-brawl-yellow flex items-center justify-center">
                  <img 
                    src={correctBrawler.image || '/placeholder.svg'}
                    alt={correctBrawler.name}
                    className="max-w-full max-h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{correctBrawler.name}</h3>
                <p className="text-white/80 text-center mb-6">
                  {correctBrawler.class} - {correctBrawler.rarity}
                </p>
                <p className="text-sm text-white/60 text-center mb-4">
                  Released in {correctBrawler.releaseYear}
                </p>
              </>
            )}
            
            <Button onClick={handleReset} className="brawl-button mt-4">
              Play Again (Demo)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AudioMode;
