
import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GameModeCardProps {
  mode: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ mode, icon, comingSoon = false }) => {
  const title = t(`mode.${mode}`);
  const description = t(`mode.${mode}.description`);
  const path = `/${mode}`;

  return (
    <Card className="brawl-card hover:scale-[1.03] transition-transform">
      <div className="flex flex-col items-center">
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="text-xl font-bold text-brawl-yellow mb-1">{title}</h3>
        <p className="text-sm text-white/80 mb-4">{description}</p>
        {comingSoon ? (
          <Button className="brawl-button-outline w-full" disabled>
            {t('coming.soon')}
          </Button>
        ) : (
          <Button asChild className="brawl-button w-full">
            <Link to={path}>Play</Link>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default GameModeCard;
