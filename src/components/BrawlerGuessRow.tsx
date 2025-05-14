
import React, { useState, useEffect } from 'react';
import { Brawler } from '@/data/brawlers';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';

interface BrawlerGuessRowProps {
  guess: Brawler;
  correctAnswer: Brawler;
}

const BrawlerGuessRow: React.FC<BrawlerGuessRowProps> = ({ guess, correctAnswer }) => {
  // State to hold the unique key for the image to force refreshes
  const [imageKey, setImageKey] = useState<string>(`${guess.name}-${Date.now()}`);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Force image refresh when the guess changes
  useEffect(() => {
    setImageKey(`${guess.name}-${Date.now()}`);
  }, [guess.name]);
  
  // Add animation effect that ends after the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);
  
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
      return { color: 'bg-brawl-red text-white', icon: <ArrowUp className="w-5 h-5" /> };
    } else {
      return { color: 'bg-brawl-red text-white', icon: <ArrowDown className="w-5 h-5" /> };
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

  // Function to create an attribute cell
  const renderAttributeCell = (label: string, value: string, bgClass: string) => {
    return (
      <div className="flex flex-col items-center">
        <div className="text-white text-xs mb-1">{label}</div>
        <div className={cn(
          "w-full h-[90px] flex items-center justify-center rounded-md transition-all overflow-hidden",
          bgClass,
          isAnimating && "animate-scale-in"
        )}>
          <span className="text-xl font-bold">{value}</span>
        </div>
      </div>
    );
  };

  // Function to create a numeric cell with arrow
  const renderNumericCell = (label: string, value: number | undefined, result: { color: string, icon: React.ReactNode | null }) => {
    return (
      <div className="flex flex-col items-center">
        <div className="text-white text-xs mb-1">{label}</div>
        <div className={cn(
          "w-full h-[90px] flex flex-col items-center justify-center rounded-md transition-all overflow-hidden",
          result.color,
          isAnimating && "animate-scale-in"
        )}>
          <span className="text-xl font-bold">{value || "?"}</span>
          {result.icon && <div className="mt-1">{result.icon}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("grid grid-cols-7 gap-2 mb-5", isAnimating && "animate-fade-in")}>
      {/* Brawler portrait cell */}
      <div className="flex flex-col items-center">
        <div className="text-white text-xs mb-1">Brawler</div>
        <div className="bg-blue-500 w-full h-[90px] rounded-md overflow-hidden">
          <Image
            key={imageKey}
            src={portraitPath}
            alt={guess.name}
            fallbackSrc={DEFAULT_PORTRAIT}
            imageType="portrait"
            className="h-full w-full"
          />
        </div>
      </div>
      
      {/* Attribute cells */}
      {renderAttributeCell("Rarity", guess.rarity, rarityClass)}
      {renderAttributeCell("Class", guess.class, classClass)}
      {renderAttributeCell("Movement", guess.movement, movementClass)}
      {renderAttributeCell("Range", guess.range, rangeClass)}
      {renderAttributeCell("Reload", guess.reload, reloadClass)}
      {renderNumericCell("Release", guess.releaseYear, yearResult)}
    </div>
  );
};

export default BrawlerGuessRow;
