
import React, { useState } from 'react';
import ModeDescription from '@/components/ModeDescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';

const ClassicMode = () => {
  const [guess, setGuess] = useState('');
  
  // Mock data for placeholder attributes
  const attributes = [
    { name: 'Rarity', value: '?', color: 'bg-brawl-purple' },
    { name: 'Gender', value: '?', color: 'bg-brawl-blue' },
    { name: 'Class', value: '?', color: 'bg-brawl-green' },
    { name: 'Range', value: '?', color: 'bg-brawl-red' },
    { name: 'Chromatic Season', value: '?', color: 'bg-brawl-yellow' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted guess:', guess);
    // Will implement actual logic later
    setGuess('');
  };

  return (
    <div>
      <ModeDescription 
        title={t('mode.classic')} 
        description={t('mode.classic.description')}
      />
      
      <div className="mb-6">
        <Card className="brawl-card">
          <div className="space-y-3 p-2">
            {attributes.map((attr, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <div className="flex items-center font-semibold text-white">{attr.name}</div>
                <div className={`${attr.color} rounded-md p-2 text-center font-medium`}>
                  {attr.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
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

export default ClassicMode;
