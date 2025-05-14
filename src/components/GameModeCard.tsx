
import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { Question, Music, Star, Zap } from 'lucide-react';

interface GameModeCardProps {
  mode: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ mode, description, icon, comingSoon = false }) => {
  const title = t(`mode.${mode}`);
  const path = `/${mode}`;

  return (
    <div className="relative mb-4 w-full animate-fade-in">
      <div className="flex items-center">
        <div className="mr-4 flex-shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brawl-yellow bg-brawl-dark/80 text-brawl-yellow">
            {icon}
          </div>
        </div>
        <Link 
          to={comingSoon ? "#" : path} 
          className="block w-full"
        >
          <Card className="w-full cursor-pointer overflow-hidden border-transparent bg-brawl-blue/20 p-0 transition-all hover:bg-brawl-blue/30">
            <div className="flex items-center px-6 py-4 text-white">
              <div>
                <h3 className="text-xl font-bold text-brawl-yellow">{title}</h3>
                <p className="text-sm text-white/80">{description}</p>
              </div>
            </div>
            {comingSoon && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-brawl-yellow">
                {t('coming.soon')}
              </div>
            )}
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default GameModeCard;
