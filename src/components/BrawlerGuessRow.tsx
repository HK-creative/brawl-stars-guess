
import React, { useState, useEffect } from 'react';
import { Brawler } from '@/data/brawlers';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { Table, TableCell, TableRow } from '@/components/ui/table';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
      return { color: 'bg-brawl-red text-white', icon: <ArrowUp className="w-3 h-3" /> };
    } else {
      return { color: 'bg-brawl-red text-white', icon: <ArrowDown className="w-3 h-3" /> };
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

  return (
    <div className={cn("w-full mb-4 overflow-x-auto", isAnimating && "animate-fade-in")}>
      <Table>
        <TableRow className="whitespace-nowrap border-0">
          {/* Brawler portrait cell */}
          <TableCell className="p-1 align-middle">
            <div className="w-10 h-10 overflow-hidden rounded-md">
              <AspectRatio ratio={1}>
                <Image
                  key={imageKey}
                  src={portraitPath}
                  alt={guess.name}
                  fallbackSrc={DEFAULT_PORTRAIT}
                  imageType="portrait"
                  className="h-full w-full"
                />
              </AspectRatio>
            </div>
          </TableCell>
          
          {/* Rarity */}
          <TableCell className={cn("p-1 text-center text-xs font-medium", rarityClass)}>
            <div className="rounded-md p-1 min-w-10 h-10 flex items-center justify-center">
              {guess.rarity.substring(0, 3)}
            </div>
          </TableCell>
          
          {/* Class */}
          <TableCell className={cn("p-1 text-center text-xs font-medium", classClass)}>
            <div className="rounded-md p-1 min-w-10 h-10 flex items-center justify-center">
              {guess.class.substring(0, 3)}
            </div>
          </TableCell>
          
          {/* Movement */}
          <TableCell className={cn("p-1 text-center text-xs font-medium", movementClass)}>
            <div className="rounded-md p-1 min-w-10 h-10 flex items-center justify-center">
              {guess.movement.substring(0, 3)}
            </div>
          </TableCell>
          
          {/* Range */}
          <TableCell className={cn("p-1 text-center text-xs font-medium", rangeClass)}>
            <div className="rounded-md p-1 min-w-10 h-10 flex items-center justify-center">
              {guess.range.substring(0, 3)}
            </div>
          </TableCell>
          
          {/* Reload */}
          <TableCell className={cn("p-1 text-center text-xs font-medium", reloadClass)}>
            <div className="rounded-md p-1 min-w-10 h-10 flex items-center justify-center">
              {guess.reload.substring(0, 3)}
            </div>
          </TableCell>
          
          {/* Release Year */}
          <TableCell className={cn("p-1 text-center text-xs font-medium", yearResult.color)}>
            <div className="rounded-md p-1 min-w-10 h-10 flex flex-col items-center justify-center">
              <span>{guess.releaseYear || "?"}</span>
              {yearResult.icon && <div className="mt-0.5">{yearResult.icon}</div>}
            </div>
          </TableCell>
        </TableRow>
      </Table>
    </div>
  );
};

export default BrawlerGuessRow;
