import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t, getLanguage } from '@/lib/i18n';
import { toast } from 'sonner';
import { fetchDailyChallenge, getTimeUntilNextChallenge } from '@/lib/daily-challenges';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler, getBrawlerDisplayName } from '@/data/brawlers';
import { Check, X, Volume2, Share2 } from 'lucide-react';
import ShareResultModal from '@/components/ShareResultModal';
import { getPortrait, DEFAULT_PIN } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import ReactConfetti from 'react-confetti';
import VictorySection from '../components/VictoryPopup';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import GameModeTracker from '@/components/GameModeTracker';
import HomeButton from '@/components/ui/home-button';

interface VoiceChallenge {
  brawler: string;
  voiceLine: string;
}

const VoiceMode = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<VoiceChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState<{ hours: number, minutes: number, seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const maxAttempts = 3;

  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const victoryRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [correctBrawlerNameForVictory, setCorrectBrawlerNameForVictory] = useState<string>("");
  
  const currentLanguage = getLanguage();

  useEffect(() => {
    const loadChallenge = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDailyChallenge('voice');
        if (data) {
          setDailyChallenge(data);
        } else {
          toast.error(t('error.load.challenge'));
        }
      } catch (error) {
        console.error("Error loading voice challenge:", error);
        toast.error(t('error.load.challenge'));
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenge();

    const update = () => {
      const now = new Date();
      const utc2Now = new Date(now.getTime() + (2 * 60 * 60 * 1000));
      const tomorrow = new Date(utc2Now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diffMs = tomorrow.getTime() - utc2Now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilNext({ hours, minutes, seconds });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isGameOver && victoryRef.current) {
      victoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowConfetti(true);
      window.dispatchEvent(new CustomEvent('brawldle-mode-completed', { detail: { mode: 'voice' } }));
    }
  }, [isGameOver]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guess.trim() || !dailyChallenge) return;
    if (guesses.includes(guess.toLowerCase())) {
      toast.error(t('error.already.guessed'));
      return;
    }
    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);
    setGuesses([...guesses, guess.toLowerCase()]);
    const isGuessCorrect = guess.toLowerCase() === dailyChallenge.brawler.toLowerCase();

    if (isGuessCorrect) {
      setCorrectBrawlerNameForVictory(dailyChallenge.brawler);
      setIsGameOver(true);
      toast.success(t('success.correct.guess'));
    } else if (newGuessCount >= maxAttempts) {
      setCorrectBrawlerNameForVictory(dailyChallenge.brawler);
      setIsGameOver(true);
      toast.error(`${t('message.out.of.attempts')} ${dailyChallenge.brawler}.`);
    } else {
      toast.error(`${t('message.wrong.guess')} ${maxAttempts - newGuessCount} ${t('message.attempts.left')}`);
    }
    setGuess('');
    setSelectedBrawler(null);
  };

  const resetGame = () => {
    setGuess('');
    setGuesses([]);
    setIsGameOver(false);
    setGuessCount(0);
    setShowConfetti(false);
    setSelectedBrawler(null);
    toast.info(t('game.reset.manual'));
  };

  const handlePlayVoice = () => {
    setIsPlaying(true);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
    
    toast.info(`"${dailyChallenge?.voiceLine}"`, {
      description: t('voice.coming.soon')
    });
  };

  const handleBrawlerSelect = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
    const displayName = getBrawlerDisplayName(brawler, currentLanguage);
    setGuess(displayName);
  };
  
  const handleShareResult = () => {
    if (!isGameOver || !dailyChallenge) return;
    setIsShareModalOpen(true);
  };

  const generateGuessResults = () => {
    if (!dailyChallenge) return [];
    
    return guesses.map(
      guess => guess.toLowerCase() === dailyChallenge.brawler.toLowerCase()
    );
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
          <h3 className="text-xl font-bold text-brawl-yellow mb-2">{t('error.no.challenge')}</h3>
          <p className="text-white/80">{t('error.check.later')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-1 py-4 md:py-8 bg-brawl-background">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          onConfettiComplete={() => setShowConfetti(false)}
          className="fixed top-0 left-0 w-full h-full z-[100] pointer-events-none"
        />
      )}
      <HomeButton />

      <div className="flex justify-center mb-4 animate-fade-in-down">
        <GameModeTracker />
      </div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-brawl-yellow mb-1 text-center pt-10">
          {t('mode.voice.title')}
        </h1>
      </div>
      
      <Card className="brawl-card mb-6 flex flex-col items-center justify-center py-8">
        <div 
          className={`text-6xl mb-4 ${isPlaying ? 'animate-pulse' : 'animate-pulse-glow'} cursor-pointer`} 
          onClick={handlePlayVoice}
        >
          {isPlaying ? '🔊' : '🗣️'}
        </div>
        <Button 
          variant="outline" 
          className="gap-2 bg-white/10 border-white/20 hover:bg-white/20"
          onClick={handlePlayVoice}
        >
          <Volume2 className="w-4 h-4" />
          <span>{t('voice.play_line')}</span>
        </Button>
        
        <div className="mt-4 px-4 py-2 bg-white/10 rounded-lg">
          <p className="text-white/70 italic">
            {isGameOver ? `"${dailyChallenge.voiceLine}"` : `"${t('voice.guess.prompt')}"`}
          </p>
        </div>
        
        <div className="mt-6 text-sm text-white/60">
          {t('timer.next_in')
              .replace('{hours}', String(timeUntilNext.hours))
              .replace('{minutes}', String(timeUntilNext.minutes))} {timeUntilNext.seconds}s
        </div>
      </Card>
      
      {!isGameOver && (
        <>
          <BrawlerAutocomplete
            brawlers={brawlers.filter(b => !guesses.includes(b.name.toLowerCase()))}
            value={guess}
            onChange={setGuess}
            onSelect={handleBrawlerSelect}
            onSubmit={handleSubmit}
            disabled={isGameOver}
          />
          
          {selectedBrawler && (
            <Button onClick={() => handleSubmit()} className="mt-3 bg-brawl-green hover:bg-brawl-green/90 text-white w-full max-w-xs mx-auto">
              Confirm Guess: {getBrawlerDisplayName(selectedBrawler, currentLanguage)}
            </Button>
          )}
          
          <p className="text-center text-white mt-2">{t('game.attempts')}: {guessCount}/{maxAttempts}</p>
        </>
      )}
      
      {!isGameOver && guesses.length > 0 && (
        <div className="mt-4 w-full max-w-md mx-auto px-2">
          <h3 className="text-white font-medium mb-2">{t('game.previous.guesses')}</h3>
          <div className="space-y-2">
            {guesses.map((pastGuess, index) => (
              <div 
                key={index} 
                className={cn("flex items-center p-2 rounded bg-white/10", 
                            dailyChallenge && pastGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase() ? 'border border-green-500' : 'border border-red-500')}>
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
      
      {isGameOver && (
        <div ref={victoryRef} className="mt-6 w-full max-w-xl mx-auto px-2">
          <VictorySection
            brawlerName={correctBrawlerNameForVictory}
            brawlerPortrait={getPortrait(correctBrawlerNameForVictory)}
            tries={guessCount}
            mode="voice"
            nextModeKey="classic"
            onNextMode={() => { navigate('/classic'); resetGame(); }}
            onShare={handleShareResult}
          />
          <Button onClick={resetGame} className="mt-4 w-full bg-brawl-blue hover:bg-brawl-blue/90">
            {t('button.reset.game')}
          </Button>
        </div>
      )}
      
      {isShareModalOpen && (
      <ShareResultModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        mode="voice"
          success={guesses.includes(dailyChallenge.brawler.toLowerCase())}
        attempts={guessCount}
        maxAttempts={maxAttempts}
          brawlerName={dailyChallenge.brawler}
      />
      )}
    </div>
  );
};

export default VoiceMode;
