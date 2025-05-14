
import React, { useState, useEffect } from 'react';
import { Brawler } from '@/data/brawlers';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';

interface BrawlerGuessRowProps {
  guess: Brawler;
  correctAnswer: Brawler;
}

const BrawlerGuessRow: React.FC<BrawlerGuessRowProps> = ({ guess, correctAnswer }) => {
  // State to hold the unique key for the image to force refreshes
  const [imageKey, setImageKey] = useState<string>(`${guess.name}-${Date.now()}`);
  
  // Force image refresh when the guess changes
  useEffect(() => {
    setImageKey(`${guess.name}-${Date.now()}`);
  }, [guess.name]);
  
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

  // Get the portrait image path
  const portraitPath = getPortrait(guess.name);
  console.log(`BrawlerGuessRow: Using portrait path for ${guess.name}:`, portraitPath);

  // Updated UI based on the provided image with horizontal layout
  return (
    <div className="animate-fade-in mb-5 overflow-hidden rounded-lg bg-indigo-900 border border-indigo-700">
      <div className="flex flex-row items-center p-3">
        {/* Larger portrait on the left */}
        <div className="h-48 w-48 flex-shrink-0 overflow-hidden bg-gray-800">
          <Image
            key={imageKey} // Add a unique key to force re-render
            src={portraitPath}
            alt={guess.name}
            fallbackSrc={DEFAULT_PORTRAIT}
            imageType="portrait"
            className="h-full w-full"
          />
        </div>
        
        <div className="flex flex-1 flex-col pl-6">
          {/* Brawler name */}
          <h3 className="mb-6 text-4xl font-bold text-white">{guess.name}</h3>
          
          {/* Attributes displayed horizontally in two rows */}
          <div className="grid grid-cols-3 gap-4">
            {/* First row */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-md text-white/80">Rarity</span>
              <div className={`${rarityClass} w-full rounded-full px-6 py-2 text-center text-lg font-medium`}>
                {guess.rarity}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="mb-1 text-md text-white/80">Class</span>
              <div className={`${classClass} w-full rounded-full px-6 py-2 text-center text-lg font-medium`}>
                {guess.class}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="mb-1 text-md text-white/80">Movement</span>
              <div className={`${movementClass} w-full rounded-full px-6 py-2 text-center text-lg font-medium`}>
                {guess.movement}
              </div>
            </div>
            
            {/* Second row */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-md text-white/80">Range</span>
              <div className={`${rangeClass} w-full rounded-full px-6 py-2 text-center text-lg font-medium`}>
                {guess.range}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="mb-1 text-md text-white/80">Reload</span>
              <div className={`${reloadClass} w-full rounded-full px-6 py-2 text-center text-lg font-medium`}>
                {guess.reload}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="mb-1 text-md text-white/80">Year</span>
              <div className={`${yearResult.color} w-full rounded-full px-6 py-2 text-center text-lg font-medium flex items-center justify-center`}>
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
