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
    <div className="animate-fade-in mb-3 border border-white/20 rounded-lg overflow-hidden">
      <div className="bg-white/10 py-2 px-3 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 mr-2">
            <Image
              src={portraitPath}
              alt={guess.name}
              fallbackSrc={DEFAULT_PORTRAIT}
              imageType="portrait"
            />
          </div>
          <span className="text-white font-bold">{guess.name}</span>
        </div>
      </div>
      
      {/* grid with attributes */}
      <div className="grid grid-cols-2 gap-2 p-2">
        {/* Rarity */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">Rarity</span>
        </div>
        <div className={`${rarityClass} rounded-md p-1 text-center text-sm flex items-center justify-center`}>
          {guess.rarity}
        </div>
        
        {/* Class */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">Class</span>
        </div>
        <div className={`${classClass} rounded-md p-1 text-center text-sm flex items-center justify-center`}>
          {guess.class}
        </div>
        
        {/* Movement */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">Movement</span>
        </div>
        <div className={`${movementClass} rounded-md p-1 text-center text-sm flex items-center justify-center`}>
          {guess.movement}
        </div>
        
        {/* Range */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">Range</span>
        </div>
        <div className={`${rangeClass} rounded-md p-1 text-center text-sm flex items-center justify-center`}>
          {guess.range}
        </div>
        
        {/* Reload */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">Reload</span>
        </div>
        <div className={`${reloadClass} rounded-md p-1 text-center text-sm flex items-center justify-center`}>
          {guess.reload}
        </div>
        
        {/* Release Year */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">Release Year</span>
        </div>
        <div className={`${yearResult.color} rounded-md p-1 text-center text-sm flex items-center justify-center`}>
          {guess.releaseYear || "Unknown"} {yearResult.icon}
        </div>
      </div>
    </div>
  );
};

export default BrawlerGuessRow;
