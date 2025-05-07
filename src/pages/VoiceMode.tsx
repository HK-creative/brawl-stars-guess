
import React, { useState } from 'react';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';

const VoiceMode = () => {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted guess:', guess);
    setGuess('');
  };

  // This will be replaced with actual audio player logic later
  const handlePlayVoice = () => {
    console.log('Playing voice line');
    // Voice line playback logic will be implemented later
  };

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
          <p className="text-white/70 italic">"..."</p>
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

export default VoiceMode;
