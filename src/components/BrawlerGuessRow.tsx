
import React from 'react';
import { Brawler } from '@/data/brawlers';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';

interface BrawlerGuessRowProps {
  guess: Brawler;
  correctAnswer: Brawler;
}

const BrawlerGuessRow: React.FC<BrawlerGuessRowProps> = ({ guess, correctAnswer }) => {
  // Comparison logic for attributes
  
  const compareAttribute = (guessValue: string, correctValue: string): string => {
    if (guessValue === correctValue) return 'bg-brawl-green text-white'; // Correct
    
    // Partial match logic (simplified for now)
    if (
      (guessValue.includes("Fast") && correctValue.includes("Fast")) ||
      (guessValue.includes("Normal") && correctValue.includes("Normal")) ||
      (guessValue.includes("Slow") && correctValue.includes("Slow")) ||
      (guessValue.includes("Short") && correctValue.includes("Short")) ||
      (guessValue.includes("Medium") && correctValue.includes("Medium")) ||
      (guessValue.includes("Long") && correctValue.includes("Long"))
    ) {
      return 'bg-brawl-yellow text-white'; // Partial match
    }
    
    return 'bg-brawl-red text-white'; // Wrong
  };
  
  // Logic for numeric values with directional hints
  const compareNumeric = (guessValue: number, correctValue: number): { color: string, icon: React.ReactNode | null } => {
    if (guessValue === correctValue) {
      return { color: 'bg-brawl-green text-white', icon: null };
    }
    
    if (guessValue < correctValue) {
      return { color: 'bg-brawl-red text-white', icon: <ArrowUp className="w-4 h-4" /> };
    } else {
      return { color: 'bg-brawl-red text-white', icon: <ArrowDown className="w-4 h-4" /> };
    }
  };
  
  // Get comparison results for each attribute
  const rarityClass = compareAttribute(guess.rarity, correctAnswer.rarity);
  const classClass = compareAttribute(guess.class, correctAnswer.class);
  const movementClass = compareAttribute(guess.movement, correctAnswer.movement);
  const rangeClass = compareAttribute(guess.range, correctAnswer.range);
  const reloadClass = compareAttribute(guess.reload, correctAnswer.reload);
  const yearResult = compareNumeric(guess.releaseYear || 0, correctAnswer.releaseYear || 0);

  // Get portrait image path
  const portraitPath = getPortrait(guess.name);

  return (
    <div className="animate-fade-in mb-5 overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm">
      <div className="flex flex-row items-center">
        {/* Larger portrait on the left */}
        <div className="h-28 w-28 flex-shrink-0 overflow-hidden bg-gray-700">
          <Image
            src={portraitPath}
            alt={guess.name}
            fallbackSrc={DEFAULT_PORTRAIT}
            imageType="portrait"
            className="h-full w-full"
          />
        </div>
        
        <div className="flex flex-1 flex-col p-3">
          {/* Brawler name */}
          <h3 className="mb-2 text-xl font-bold text-white">{guess.name}</h3>
          
          {/* Attributes displayed horizontally */}
          <div className="grid grid-cols-3 gap-2">
            {/* Rarity */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-xs text-white/70">Rarity</span>
              <div className={`${rarityClass} w-full rounded-md px-2 py-1 text-center text-xs`}>
                {guess.rarity}
              </div>
            </div>
            
            {/* Class */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-xs text-white/70">Class</span>
              <div className={`${classClass} w-full rounded-md px-2 py-1 text-center text-xs`}>
                {guess.class}
              </div>
            </div>
            
            {/* Movement */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-xs text-white/70">Movement</span>
              <div className={`${movementClass} w-full rounded-md px-2 py-1 text-center text-xs`}>
                {guess.movement}
              </div>
            </div>
            
            {/* Range */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-xs text-white/70">Range</span>
              <div className={`${rangeClass} w-full rounded-md px-2 py-1 text-center text-xs`}>
                {guess.range}
              </div>
            </div>
            
            {/* Reload */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-xs text-white/70">Reload</span>
              <div className={`${reloadClass} w-full rounded-md px-2 py-1 text-center text-xs`}>
                {guess.reload}
              </div>
            </div>
            
            {/* Release Year */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-xs text-white/70">Year</span>
              <div className={`${yearResult.color} w-full rounded-md px-2 py-1 text-center text-xs flex items-center justify-center`}>
                {guess.releaseYear || "?"} {yearResult.icon}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrawlerGuessRow;
