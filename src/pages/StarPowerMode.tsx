
import React, { useState } from 'react';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';

const StarPowerMode = () => {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted guess:', guess);
    setGuess('');
  };

  return (
    <div>
      <ModeDescription 
        title={t('mode.starpower')} 
        description={t('mode.starpower.description')}
      />
      
      <Card className="brawl-card mb-6 flex flex-col items-center justify-center py-8">
        <div className="w-24 h-24 rounded-full bg-brawl-yellow/30 flex items-center justify-center mb-4">
          <span className="text-4xl">⭐</span>
        </div>
        <p className="text-white/80">Guess which brawler has this star power</p>
        <div className="mt-4 px-4 py-2 bg-white/10 rounded-lg">
          <p className="text-white font-bold">??? Star Power</p>
        </div>
      </Card>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Type brawler name..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Button type="submit" className="brawl-button">
          {t('submit.guess')}
        </Button>
      </form>
    </div>
  );
};

export default StarPowerMode;
