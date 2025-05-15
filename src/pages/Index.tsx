
import React from 'react';
import GameModeCard from '@/components/GameModeCard';
import { t } from '@/lib/i18n';
import { Activity, Book, Headphones, Clock, Music, Infinity } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-brawl-yellow drop-shadow-md">
        {t('app.name')}
      </h1>
      
      <Card className="brawl-card p-4 mb-6">
        <p className="text-white text-center">
          {t('app.description')}
        </p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <GameModeCard 
          mode="classic"
          description={t('mode.classic.description')}
          icon={<Clock className="h-6 w-6" />}
        />
        
        <GameModeCard 
          title="Endless Mode" 
          description="Play as many rounds as you want with random brawlers."
          icon={<Infinity className="h-6 w-6" />}
          path="/endless"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GameModeCard 
          mode="gadget"
          description={t('mode.gadget.description')}
          icon={<Activity className="h-6 w-6" />}
        />
        
        <GameModeCard 
          mode="starpower"
          description={t('mode.starpower.description')}
          icon={<Book className="h-6 w-6" />}
        />
        
        <GameModeCard 
          mode="voice"
          description={t('mode.voice.description')}
          icon={<Headphones className="h-6 w-6" />}
          comingSoon={true}
        />
        
        <GameModeCard 
          mode="audio"
          description={t('mode.audio.description')}
          icon={<Music className="h-6 w-6" />}
          comingSoon={true}
        />
      </div>
    </div>
  );
};

export default Index;
