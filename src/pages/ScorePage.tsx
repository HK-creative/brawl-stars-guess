
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

const ScorePage = () => {
  // Placeholder score data
  const scoreData = {
    date: new Date().toLocaleDateString(),
    classic: 3, // attempts
    audio: 2,
    voice: 4,
    gadget: 1,
    starpower: 'X', // failed
    streakDays: 5,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-brawl-yellow text-center mb-6">
        Brawldle Score
      </h1>
      
      <Card className="brawl-card mb-6">
        <div className="p-4">
          <div className="text-center mb-4">
            <p className="text-white/70">{scoreData.date}</p>
            <p className="text-white/70">Streak: {scoreData.streakDays} days</p>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-6">
            <div className="flex flex-col items-center">
              <div className="text-xl">🎯</div>
              <div className="bg-brawl-blue w-10 h-10 rounded-md flex items-center justify-center font-bold">
                {scoreData.classic}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl">🔊</div>
              <div className="bg-brawl-green w-10 h-10 rounded-md flex items-center justify-center font-bold">
                {scoreData.audio}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl">🗣️</div>
              <div className="bg-brawl-purple w-10 h-10 rounded-md flex items-center justify-center font-bold">
                {scoreData.voice}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl">🛠️</div>
              <div className="bg-brawl-yellow w-10 h-10 rounded-md flex items-center justify-center font-bold">
                {scoreData.gadget}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl">⭐</div>
              <div className="bg-brawl-red w-10 h-10 rounded-md flex items-center justify-center font-bold">
                {scoreData.starpower}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button className="brawl-button-secondary">
              Share
            </Button>
            <Button className="brawl-button">
              Play Again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScorePage;
