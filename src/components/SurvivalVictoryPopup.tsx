import React from 'react';
import PrimaryButton from '@/components/ui/primary-button';
import Image from '@/components/ui/image';
import { getPortrait } from '@/lib/image-helpers';
import { Timer, Award, TrendingUp } from 'lucide-react';
import { t } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SlidingNumber } from '@/components/ui/sliding-number';

interface SurvivalVictoryPopupProps {
  brawlerName: string;
  pointsEarned: number;
  totalScore: number;
  guessesUsed: number;
  timeLeft: number;
  onNextRound: () => void;
}

const SurvivalVictoryPopup: React.FC<SurvivalVictoryPopupProps> = ({
  brawlerName,
  pointsEarned,
  totalScore,
  guessesUsed,
  timeLeft,
  onNextRound,
}) => {
  const { motionOK, transition, spring } = useMotionPrefs();
  // Calculate the bonus info to display - using the correct formula
  // Guess bonus starts at 55 and reduces by 5 for each guess (including the correct one)
  // guessesUsed includes all guesses made (wrong + correct)
  const actualGuessBonus = Math.max(0, 55 - (guessesUsed * 5));
  
  // Time bonus starts at 30 and reduces by 1 for every 5 seconds elapsed
  // Timer starts at 150 seconds, so elapsed time = 150 - timeLeft
  const elapsedTime = 150 - timeLeft;
  const timeBonus = Math.max(0, 30 - Math.floor(elapsedTime / 5));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div
        className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl flex flex-col items-center"
        initial={motionOK ? { opacity: 0, y: 16, scale: 0.98 } : { opacity: 1 }}
        animate={motionOK ? { opacity: 1, y: 0, scale: 1, transition } : { opacity: 1 }}
        exit={motionOK ? { opacity: 0, y: -8, transition } : { opacity: 0 }}
        transition={spring as any}
      >
        {/* Victory header */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-brawl-yellow drop-shadow-glow mb-4 tracking-wide">
          {t('correct.screen.title')}
        </h1>
        
        {/* Brawler portrait */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-yellow-500 glow-yellow">
            <Image
              src={getPortrait(brawlerName)}
              alt={brawlerName}
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <div className="mt-2 text-center text-xl font-bold text-white drop-shadow-md">
            {brawlerName}
          </div>
        </div>
        
        {/* 8-bit Victory GIF above score section */}
        <div className="flex justify-center mb-4">
          <img 
            src="/Brawler_GIFs/8bit_win.gif" 
            alt="8-Bit Victory" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain"
          />
        </div>
        
        {/* Score information */}
        <motion.div
          className="w-full bg-black/30 rounded-lg p-4 mb-6"
          initial={motionOK ? { opacity: 0, y: 8 } : { opacity: 1 }}
          animate={motionOK ? { opacity: 1, y: 0, transition } : { opacity: 1 }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/80">{t('correct.screen.points.earned')}:</span>
            <div className="flex items-center">
              <span className="text-lg font-bold text-green-400 mr-2">+
                <SlidingNumber value={pointsEarned} />
              </span>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
          </div>
          
          {/* Bonus breakdown */}
          <div className="text-sm text-white/70 space-y-1 mb-3">
            <div className="flex justify-between">
              <span>{t('correct.screen.base.points')}:</span>
              <span>100</span>
            </div>
            {actualGuessBonus > 0 && (
              <div className="flex justify-between">
                <span>{t('correct.screen.guess.bonus')} ({guessesUsed} {t('correct.screen.guesses.used')}):</span>
                <span className="text-green-400">+{actualGuessBonus}</span>
              </div>
            )}
            {timeBonus > 0 && (
              <div className="flex justify-between">
                <span>{t('correct.screen.time.bonus')} ({elapsedTime}{t('correct.screen.seconds.elapsed')}):</span>
                <span className="text-green-400">+{timeBonus}</span>
              </div>
            )}
          </div>
          
          {/* Total score */}
          <div className="flex justify-between items-center bg-black/30 p-2 rounded-md mt-4">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-white font-medium">{t('correct.screen.total.score')}</span>
            </div>
            <span className="text-2xl font-bold text-yellow-400">
              <SlidingNumber value={totalScore} />
            </span>
          </div>
        </motion.div>
        
        {/* Continue button */}
        <PrimaryButton
          onClick={onNextRound}
          className="w-full py-6 text-lg rounded-xl"
        >
          {t('correct.screen.next.round')}
        </PrimaryButton>
        
        <div className="mt-4 flex items-center justify-center text-sm text-white/50">
          <Timer className="h-4 w-4 mr-1" />
          <span>{t('correct.screen.get.ready')}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default SurvivalVictoryPopup;
