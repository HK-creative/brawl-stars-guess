
import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Card } from '@/components/ui/card';

interface GameModeCardProps {
  mode?: string;
  title?: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
  comingSoon?: boolean;
  enabled?: boolean;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ 
  mode, 
  title, 
  description, 
  icon, 
  path, 
  comingSoon = false,
  enabled = true
}) => {
  // Use mode to look up title via i18n, or use provided title directly
  const displayTitle = title || (mode ? t(`mode.${mode}`) : '');
  
  // Use mode to construct path, or use provided path
  const linkPath = path || (mode ? `/${mode}` : '#');
  
  // Card is not clickable if it's coming soon or not enabled
  const isClickable = !comingSoon && enabled;

  return (
    <div className="relative mb-4 w-full animate-fade-in">
      <div className="flex items-center">
        <div className="mr-4 flex-shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brawl-yellow bg-brawl-dark/80 text-brawl-yellow">
            {icon}
          </div>
        </div>
        <Link 
          to={isClickable ? linkPath : "#"} 
          className="block w-full"
        >
          <Card className="w-full cursor-pointer overflow-hidden border-transparent bg-brawl-blue/20 p-0 transition-all hover:bg-brawl-blue/30">
            <div className="flex items-center px-6 py-4 text-white">
              <div>
                <h3 className="text-xl font-bold text-brawl-yellow">{displayTitle}</h3>
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
