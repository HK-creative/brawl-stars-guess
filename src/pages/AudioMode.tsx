
import React, { useState } from 'react';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';

const AudioMode = () => {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted guess:', guess);
    setGuess('');
  };

  // This will be replaced with actual audio player logic later
  const handlePlayAudio = () => {
    console.log('Playing audio');
    // Audio playback logic will be implemented later
  };

  return (
    <div>
      <ModeDescription 
        title={t('mode.audio')} 
        description={t('mode.audio.description')}
      />
      
      <Card className="brawl-card mb-6 flex flex-col items-center justify-center py-8">
        <div className="text-6xl mb-4 animate-pulse-glow cursor-pointer" onClick={handlePlayAudio}>
          🔊
        </div>
        <p className="text-white/80">Click to play attack sound</p>
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

export default AudioMode;
