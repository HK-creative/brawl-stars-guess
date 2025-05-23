import React from 'react';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import { getPortrait } from '@/lib/image-helpers';
import { Timer, Award, TrendingUp } from 'lucide-react';

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
  // Calculate the bonus info to display
  const guessBonus = 10 - guessesUsed; // Each unused guess gives a bonus
  const timeBonus = Math.floor(timeLeft / 10); // Every 10 seconds left gives a bonus point
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl flex flex-col items-center animate-slide-up">
        {/* Victory header */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-brawl-yellow drop-shadow-glow mb-4 tracking-wide">
          CORRECT!
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
        
        {/* Score information */}
        <div className="w-full bg-black/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/80">Points earned:</span>
            <div className="flex items-center">
              <span className="text-lg font-bold text-green-400 mr-2">+{pointsEarned}</span>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
          </div>
          
          {/* Bonus breakdown */}
          <div className="text-sm text-white/70 space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Base points:</span>
              <span>100</span>
            </div>
            {guessBonus > 0 && (
              <div className="flex justify-between">
                <span>Guess bonus ({guessBonus} guesses unused):</span>
                <span className="text-green-400">+{guessBonus * 5}</span>
              </div>
            )}
            {timeBonus > 0 && (
              <div className="flex justify-between">
                <span>Time bonus ({timeLeft}s remaining):</span>
                <span className="text-green-400">+{timeBonus}</span>
              </div>
            )}
          </div>
          
          {/* Total score */}
          <div className="flex justify-between items-center bg-black/30 p-2 rounded-md mt-4">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-white font-medium">Total Score:</span>
            </div>
            <span className="text-2xl font-bold text-yellow-400">{totalScore}</span>
          </div>
        </div>
        
        {/* Continue button */}
        <Button
          onClick={onNextRound}
          className="w-full py-6 text-lg bg-gradient-to-r from-amber-600 to-pink-600 hover:from-amber-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Next Round
        </Button>
        
        <div className="mt-4 flex items-center justify-center text-sm text-white/50">
          <Timer className="h-4 w-4 mr-1" />
          <span>Get ready for the next challenge!</span>
        </div>
      </div>
    </div>
  );
};

export default SurvivalVictoryPopup;
