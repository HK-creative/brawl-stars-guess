
import React, { useState, useEffect } from 'react';
import { Brawler } from '@/data/brawlers';
import { ArrowUp, ArrowDown, Snail, MoveHorizontal, ChevronRight, ChevronRightCircle, Gauge } from 'lucide-react';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BrawlerGuessRowProps {
  guess: Brawler;
  correctAnswer: Brawler;
}

const BrawlerGuessRow: React.FC<BrawlerGuessRowProps> = ({ guess, correctAnswer }) => {
  // State to hold the unique key for the image to force refreshes
  const [imageKey, setImageKey] = useState<string>(`${guess.name}-${Date.now()}`);
  const [isAnimating, setIsAnimating] = useState(true);
  const isMobile = useIsMobile();
  
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
  
  // Helper function to get class icon path
  const getClassIcon = (className: string): string => {
    // Map the class names to their corresponding icon file names
    const classMap: Record<string, string> = {
      "Damage Dealer": "icon_class_damage.png",
      "Tank": "icon_class_tank.png",
      "Marksman": "icon_class_marksmen.png",
      "Artillery": "icon_class_artillery.png",
      "Controller": "icon_class_controller.png",
      "Assassin": "icon_class_assassin.png",
      "Support": "icon_class_support.png",
      "Heavyweight": "icon_class_tank.png", // Map Heavyweight to tank icon
    };
    
    const iconFileName = classMap[className] || "icon_class_damage.png"; // Default fallback
    return `/${iconFileName}`;
  };
  
  // Helper function to get movement speed icon and label
  const getMovementSpeedIconAndLabel = (speed: string) => {
    switch (speed) {
      case 'Very Fast':
        return {
          icon: <Gauge className="w-5 h-5" />,
          label: "V.Fast",
          className: "text-xs font-bold"
        };
      case 'Fast':
        return {
          icon: <ChevronRightCircle className="w-5 h-5" />,
          label: "Fast",
          className: "text-xs"
        };
      case 'Very Slow':
        return {
          icon: <Snail className="w-5 h-5" />,
          label: "V.Slow",
          className: "text-xs font-bold"
        };
      case 'Slow':
        return {
          icon: <Snail className="w-5 h-5 opacity-70" />,
          label: "Slow",
          className: "text-xs"
        };
      case 'Normal':
      default:
        return {
          icon: <MoveHorizontal className="w-5 h-5" />,
          label: "Norm",
          className: "text-xs"
        };
    }
  };
  
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
  const classClass = guess.class === correctAnswer.class ? 'bg-brawl-green' : 'bg-brawl-red';
  const movementClass = compareAttribute(guess.movement, correctAnswer.movement);
  const rangeClass = compareAttribute(guess.range, correctAnswer.range);
  const reloadClass = compareAttribute(guess.reload, correctAnswer.reload);
  const yearResult = compareNumeric(guess.releaseYear || 0, correctAnswer.releaseYear || 0);

  // Get the portrait image path
  const portraitPath = getPortrait(guess.name);
  
  // Helper function to get abbreviated text
  const getAbbreviation = (text: string): string => {
    // Special abbreviations based on Brawl Stars conventions
    if (text === "Mythic") return "Myt";
    if (text === "Super Rare") return "Sup";
    if (text === "Legendary") return "Leg";
    if (text === "Epic") return "Epi";
    if (text === "Rare") return "Rar";
    if (text === "Chromatic") return "Chr";
    if (text === "Short") return "Shrt";
    if (text === "Medium") return "Med";
    if (text === "Long") return "Long";
    if (text === "Very Long") return "V.Long";
    
    // Default abbreviation (first 3 characters)
    return text.substring(0, 3);
  };

  // Get movement speed icon and label
  const movementSpeedData = getMovementSpeedIconAndLabel(guess.movement);

  return (
    <div className={cn("w-full relative rounded-lg overflow-hidden mb-2", isAnimating && "animate-fade-in")}>
      <div className="flex items-center w-full">
        {/* Brawler portrait */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14">
            <Image
              key={imageKey}
              src={portraitPath}
              alt={guess.name}
              fallbackSrc={DEFAULT_PORTRAIT}
              imageType="portrait"
              aspectRatio={1}
              className="rounded-l-lg"
            />
          </div>
        </div>
        
        {/* Attributes grid */}
        <div className="flex flex-grow">
          {/* Rarity */}
          <div className={cn("flex-1 h-12 sm:h-14 flex items-center justify-center", rarityClass)}>
            <div className="text-center font-semibold text-xs sm:text-sm">
              {isMobile ? getAbbreviation(guess.rarity) : guess.rarity.substring(0, 3)}
            </div>
          </div>
          
          {/* Class - Now showing icon instead of text */}
          <div className={cn("flex-1 h-12 sm:h-14 flex items-center justify-center", classClass)}>
            <div className="w-6 h-6 sm:w-8 sm:h-8">
              <Image 
                src={getClassIcon(guess.class)}
                alt={guess.class}
                fallbackSrc="/icon_class_damage.png"
                aspectRatio={1}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Movement - Now showing icon with label */}
          <div className={cn("flex-1 h-12 sm:h-14 flex items-center justify-center flex-col", movementClass)}>
            <div className="flex items-center justify-center">
              {movementSpeedData.icon}
            </div>
            <div className={cn("mt-0.5", movementSpeedData.className)}>
              {movementSpeedData.label}
            </div>
          </div>
          
          {/* Range */}
          <div className={cn("flex-1 h-12 sm:h-14 flex items-center justify-center", rangeClass)}>
            <div className="text-center font-semibold text-xs sm:text-sm">
              {isMobile ? getAbbreviation(guess.range) : guess.range.substring(0, 3)}
            </div>
          </div>
          
          {/* Reload */}
          <div className={cn("flex-1 h-12 sm:h-14 flex items-center justify-center", reloadClass)}>
            <div className="text-center font-semibold text-xs sm:text-sm">
              {isMobile ? getAbbreviation(guess.reload) : guess.reload.substring(0, 3)}
            </div>
          </div>
          
          {/* Year */}
          <div className={cn("flex-1 h-12 sm:h-14 flex items-center justify-center", yearResult.color, "rounded-r-lg")}>
            <div className="text-center font-semibold text-xs sm:text-sm flex flex-col items-center">
              <span>{guess.releaseYear || "?"}</span>
              {yearResult.icon && <div className="mt-0.5">{yearResult.icon}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrawlerGuessRow;
