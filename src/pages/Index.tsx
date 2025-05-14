
import React from 'react';
import { Question, Music, Star, Zap } from 'lucide-react';
import { t } from '@/lib/i18n';

const Index = () => {
  // Define our game modes
  const gameModes = [
    {
      mode: 'classic',
      description: 'Get clues on every try',
      icon: <Question size={32} />,
      comingSoon: false,
    },
    {
      mode: 'audio',
      description: 'Guess with in-game sounds',
      icon: <Music size={32} />,
      comingSoon: false,
    },
    {
      mode: 'starpower',
      description: 'One star power, one brawler to find',
      icon: <Star size={32} />,
      comingSoon: false,
    },
    {
      mode: 'gadget',
      description: 'Guess from gadget description',
      icon: <Zap size={32} />,
      comingSoon: false,
    },
  ];

  return (
    <div 
      className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('/placeholder.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-lg">
        {/* Logo and title */}
        <div className="mb-12 text-center">
          <h1 
            className="mb-3 text-5xl font-bold text-brawl-yellow"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              fontWeight: 800,
            }}
          >
            Brawldle
          </h1>
          <p className="text-xl text-white">Guess Brawl Stars characters</p>
        </div>

        {/* Game modes */}
        <div className="space-y-4">
          {gameModes.map((mode) => (
            <GameModeCard
              key={mode.mode}
              mode={mode.mode}
              description={mode.description}
              icon={mode.icon}
              comingSoon={mode.comingSoon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
