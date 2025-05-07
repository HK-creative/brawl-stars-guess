
import React, { useState, useEffect } from 'react';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler } from '@/data/brawlers';
import { dailyGadgetChallenge } from '@/data/gadgetChallenges';
import { toast } from 'sonner';

const GadgetMode = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const maxAttempts = 3;

  // Difficulty settings
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Set a random rotation degree when rotation option is toggled on
    if (isRotated) {
      const angles = [90, 180, 270];
      setRotation(angles[Math.floor(Math.random() * angles.length)]);
    } else {
      setRotation(0);
    }
  }, [isRotated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guess.trim()) return;
    
    // Check if already guessed
    if (guesses.includes(guess)) {
      toast.error('You already guessed this brawler!');
      return;
    }
    
    // Process the guess
    const isGuessCorrect = guess.toLowerCase() === dailyGadgetChallenge.brawler.toLowerCase();
    const newAttempts = attempts + 1;
    
    setAttempts(newAttempts);
    setGuesses([...guesses, guess]);
    
    if (isGuessCorrect) {
      setIsCorrect(true);
      setShowResult(true);
      toast.success('Correct! You found the right brawler!');
    } else if (newAttempts >= maxAttempts) {
      setShowResult(true);
      toast.error(`Out of attempts! The correct answer was ${dailyGadgetChallenge.brawler}.`);
    } else {
      toast.error(`Wrong guess! ${maxAttempts - newAttempts} attempts left.`);
    }
    
    setGuess('');
  };
  
  const handleBrawlerSelect = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
  };
  
  const resetGame = () => {
    setGuesses([]);
    setAttempts(0);
    setIsCorrect(false);
    setShowResult(false);
    setGuess('');
    setSelectedBrawler(null);
  };

  return (
    <div>
      <ModeDescription 
        title={t('mode.gadget')} 
        description={t('mode.gadget.description')}
      />
      
      <Card className="brawl-card mb-6 flex flex-col items-center justify-center py-8">
        <div className="flex justify-between w-full px-6 mb-4">
          <div className="flex items-center gap-2">
            <Switch
              id="grayscale"
              checked={isGrayscale}
              onCheckedChange={setIsGrayscale}
            />
            <label htmlFor="grayscale" className="text-sm text-white">Grayscale</label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="rotate"
              checked={isRotated}
              onCheckedChange={setIsRotated}
            />
            <label htmlFor="rotate" className="text-sm text-white">Random Rotation</label>
          </div>
        </div>
        
        <div 
          className="w-32 h-32 rounded-full bg-brawl-blue/30 flex items-center justify-center mb-4"
          style={{
            filter: isGrayscale ? 'grayscale(100%)' : 'none',
            transform: isRotated ? `rotate(${rotation}deg)` : 'none',
            transition: 'transform 0.5s, filter 0.5s'
          }}
        >
          <span className="text-4xl">🛠️</span>
        </div>
        <p className="text-white/80">Guess which brawler uses this gadget</p>
        <div className="mt-4 px-4 py-2 bg-white/10 rounded-lg">
          <p className="text-white font-bold">{isCorrect || showResult ? dailyGadgetChallenge.gadgetName : "??? Gadget"}</p>
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
                <h3 className="text-xl font-bold text-white">{dailyGadgetChallenge.brawler}</h3>
                <p className="text-white/80">{dailyGadgetChallenge.tip}</p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-2">
              <Button className="bg-brawl-yellow text-black hover:bg-brawl-yellow/80" onClick={resetGame}>
                Try Again
              </Button>
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
            className="brawl-button bg-brawl-yellow text-black hover:bg-brawl-yellow/80"
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
                      {pastGuess.toLowerCase() === dailyGadgetChallenge.brawler.toLowerCase() ? (
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

export default GadgetMode;
