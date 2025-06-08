import React from 'react';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import { getPortrait } from '@/lib/image-helpers';
import { Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface SurvivalLossPopupProps {
  correctBrawlerName: string;
  totalScore: number;
  totalRounds: number;
  onRetry: () => void;
  onHome: () => void;
}

const SurvivalLossPopup: React.FC<SurvivalLossPopupProps> = ({
  correctBrawlerName,
  totalScore,
  totalRounds,
  onRetry,
  onHome
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl flex flex-col items-center animate-slide-up">
        {/* Game Over header */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-red-500 drop-shadow-glow mb-4 tracking-wide">
          {t('game.over')}
        </h1>
        
        {/* Correct Brawler */}
        <div className="relative mb-6">
          <p className="text-center text-white/80 mb-2">{t('game.over.correct.brawler')}</p>
          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-red-500 mx-auto">
            <Image
              src={getPortrait(correctBrawlerName)}
              alt={correctBrawlerName}
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <div className="mt-2 text-center text-xl font-bold text-white drop-shadow-md">
            {correctBrawlerName}
          </div>
        </div>
        
        {/* 8-bit Game Over GIF above score section */}
        <div className="flex justify-center mb-4">
          <img 
            src="/Brawler_GIFs/8bit_lose.gif" 
            alt="8-Bit Game Over" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain"
          />
        </div>
        
        {/* Score information */}
        <div className="bg-black/30 rounded-lg p-4 w-full mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-white/80">{t('game.over.final.score')}</div>
            <div className="text-xl font-bold text-yellow-400">{totalScore}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-white/80">{t('game.over.rounds.completed')}</div>
            <div className="text-xl font-bold text-white">{totalRounds}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <Button 
            onClick={onRetry}
            className={cn(
              "flex-1 py-6 text-lg font-bold",
              "bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600"
            )}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            {t('game.over.try.again')}
          </Button>
          <Button 
            onClick={onHome}
            className={cn(
              "flex-1 py-6 text-lg font-bold",
              "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
            )}
          >
            <img 
              src="/bs_home_icon.png"
              alt="Home"
              className="mr-2 h-8 w-8"
            />
            {t('game.over.home')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SurvivalLossPopup;
