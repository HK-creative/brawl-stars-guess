
import React from 'react';
import { t } from '@/lib/i18n';
import GameModeCard from '@/components/GameModeCard';

const Index = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-brawl-yellow my-4 animate-bounce-slight">
          {t('app.title')}
        </h1>
        <p className="text-white/80 text-lg">{t('home.tagline')}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <GameModeCard mode="classic" icon="🎯" />
        <GameModeCard mode="audio" icon="🔊" />
        <GameModeCard mode="voice" icon="🗣️" />
        <GameModeCard mode="gadget" icon="🛠️" />
        <GameModeCard mode="starpower" icon="⭐" />
        
        {/* Placeholder for future modes */}
        <GameModeCard mode="classic" icon="🏆" comingSoon={true} />
      </div>
    </div>
  );
};

export default Index;
