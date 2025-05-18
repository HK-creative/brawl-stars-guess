
import React from 'react';
import GameModeCard from '@/components/GameModeCard';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { SparklesPreview } from '@/components/ui/sparkles-preview';
import { useIsMobile } from '@/hooks/use-mobile';

const gameModes = [
  {
    mode: "classic",
    description: "Guess today's mystery brawler",
    icon: "/ClassicIcon.png",
    bgColor: "from-pink-500 to-pink-600",
    previewImage: "/images/modes/classic-preview.jpg",
    cardBackground: "/ClassicMode_Background.png"
  },
  {
    mode: "audio",
    description: "Guess by brawler voice lines",
    icon: "/AudioIcon.png",
    bgColor: "from-orange-500 to-orange-600",
    previewImage: "/images/modes/audio-preview.jpg",
    cardBackground: "/AudioMode_Background.png"
  },
  {
    mode: "gadget",
    description: "Guess by gadget description",
    icon: "/GadgetIcon.png",
    bgColor: "from-purple-500 to-purple-600",
    previewImage: "/images/modes/gadget-preview.jpg",
    cardBackground: "/GadgetMode_Background.png"
  },
  {
    mode: "starpower",
    description: "Guess by star power description",
    icon: "/StarpowerIcon.png",
    bgColor: "from-yellow-500 to-yellow-600",
    previewImage: "/images/modes/starpower-preview.jpg",
    cardBackground: "/StarPowerMode_Background.png"
  }
];

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "container mx-auto px-4", 
      isMobile ? "py-1" : "py-6"
    )}>
      <div className={cn(
        "max-w-4xl mx-auto",
        isMobile ? "space-y-2" : "space-y-8"
      )}>
        {/* Header */}
        {isMobile ? (
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-gradient-primary">
              Brawldle
            </h1>
            <p className="text-sm text-muted-foreground">
              The Ultimate Daily Brawl Stars Challenge
            </p>
          </div>
        ) : (
          <div className="text-center space-y-6 mb-12">
            <SparklesPreview />
          </div>
        )}

        {/* Game Modes Grid */}
        <div className={cn(
          "grid grid-cols-1 gap-2",
          "animate-fade-in"
        )}>
          {gameModes.map((mode) => (
            <GameModeCard 
              key={mode.mode}
              mode={mode.mode}
              description={mode.description}
              icon={mode.icon}
              bgColor={mode.bgColor}
              previewImage={mode.previewImage}
              cardBackground={mode.cardBackground}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
