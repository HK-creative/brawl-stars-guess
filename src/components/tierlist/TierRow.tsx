import React from 'react';
import BrawlerCard from './BrawlerCard';
import { TierKey } from '@/data/tierlist';

export interface TierRowProps {
  tier: TierKey;
  brawlers: string[];
}

const tierBg: Record<TierKey, string> = {
  S: 'from-rose-400 to-orange-400',
  A: 'from-amber-300 to-amber-500',
  B: 'from-yellow-300 to-yellow-500',
  C: 'from-lime-300 to-green-500',
  D: 'from-green-300 to-emerald-500',
};

const TierRow: React.FC<TierRowProps> = ({ tier, brawlers }) => {
  return (
    <section id={`tier-${tier}`} className="w-full">
      <div className="flex items-start gap-3">
        {/* Left tier label */}
        <div className={`w-10 sm:w-12 shrink-0 rounded-md text-white font-bold text-center py-3 bg-gradient-to-b ${tierBg[tier]}`}>
          <span className="text-lg sm:text-xl leading-none">{tier}</span>
        </div>
        {/* Brawlers grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {brawlers.map((name) => (
            <BrawlerCard key={`${tier}-${name}`} name={name} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TierRow;
