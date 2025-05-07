
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { brawlers, correctBrawler, Brawler } from '@/data/brawlers';
import BrawlerGuessRow from '@/components/BrawlerGuessRow';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';

const ClassicMode = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [guesses, setGuesses] = useState<Brawler[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  
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
    if (selectedBrawler.name === correctBrawler.name) {
      setIsGameOver(true);
      toast.success(`Correct! You found ${correctBrawler.name} in ${guessCount + 1} guesses!`);
    }
    
    // Reset the input
    setInputValue('');
    setSelectedBrawler(null);
  };
  
  const handleSelectBrawler = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
  };

  return (
    <div>
      <ModeDescription 
        title={t('mode.classic')} 
        description={t('mode.classic.description')}
      />
      
      {isGameOver ? (
        <div className="mb-6 animate-fade-in">
          <Card className="brawl-card p-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-brawl-yellow mb-2">Congratulations!</h3>
              <p className="text-white mb-4">
                You found the correct brawler in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}!
              </p>
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-gray-600"></div>
              </div>
              <h4 className="text-lg font-semibold text-white">{correctBrawler.name}</h4>
              <p className="text-white/70 text-sm mt-4">
                Come back tomorrow for a new challenge!
              </p>
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
    </div>
  );
};

export default ClassicMode;
