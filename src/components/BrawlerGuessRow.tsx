
import React, { useState, useEffect } from 'react';
import { Brawler } from '@/data/brawlers';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BrawlerGuessRowProps {
  guess: Brawler;
  correctAnswer: Brawler;
}

const BrawlerGuessRow: React.FC<BrawlerGuessRowProps> = ({ guess, correctAnswer }) => {
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
    const classMap: Record<string, string> = {
      "Damage Dealer": "icon_class_damage.png",
      "Tank": "icon_class_tank.png",
      "Marksman": "icon_class_marksmen.png",
      "Artillery": "icon_class_artillery.png",
      "Controller": "icon_class_controller.png",
      "Assassin": "icon_class_assassin.png",
      "Support": "icon_class_support.png",
      "Heavyweight": "icon_class_tank.png",
    };
    
    const iconFileName = classMap[className] || "icon_class_damage.png";
    return `/${iconFileName}`;
  };
  
  // Helper function to get movement speed icon and label
  const getMovementSpeedIconsAndLabel = (speed: string) => {
    switch (speed) {
      case 'Very Fast':
        return {
          icons: (
            <div className="flex items-center justify-center">
              <img src="/Rabbit_Fast.png" alt="Very Fast" className="w-full h-full max-w-[90%] max-h-[90%] object-contain" />
            </div>
          ),
          tooltip: "Very Fast",
        };
      case 'Fast':
        return {
          icons: <img src="/Rabbit_Fast.png" alt="Fast" className="w-full h-full max-w-[90%] max-h-[90%] object-contain" />,
          tooltip: "Fast",
        };
      case 'Normal':
        return {
          icons: <img src="/Walking_Normal.png" alt="Normal" className="w-full h-full max-w-[90%] max-h-[90%] object-contain" />,
          tooltip: "Normal",
        };
      case 'Slow':
        return {
          icons: <img src="/Turtle_Slow.png" alt="Slow" className="w-full h-full max-w-[90%] max-h-[90%] object-contain" />,
          tooltip: "Slow",
        };
      case 'Very Slow':
        return {
          icons: (
            <div className="flex items-center justify-center">
              <img src="/Turtle_Slow.png" alt="Very Slow" className="w-full h-full max-w-[90%] max-h-[90%] object-contain" />
            </div>
          ),
          tooltip: "Very Slow",
        };
      default:
        return {
          icons: <img src="/Walking_Normal.png" alt="Normal" className="w-full h-full max-w-[90%] max-h-[90%] object-contain" />,
          tooltip: "Normal",
        };
    }
  };
  
  // Comparison logic for attributes
  const compareAttribute = (guessValue: string, correctValue: string): string => {
    if (guessValue === correctValue) return 'bg-brawl-green text-white';
    
    if (
      (guessValue.includes("Fast") && correctValue.includes("Fast")) ||
      (guessValue.includes("Normal") && correctValue.includes("Normal")) ||
      (guessValue.includes("Slow") && correctValue.includes("Slow")) ||
      (guessValue.includes("Short") && correctValue.includes("Short")) ||
      (guessValue.includes("Medium") && correctValue.includes("Medium")) ||
      (guessValue.includes("Long") && correctValue.includes("Long"))
    ) {
      return 'bg-brawl-yellow text-white';
    }
    
    return 'bg-brawl-red text-white';
  };

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
    if (text === "Normal") return "Nor";
    if (text === "Very Fast") return "V.Fast";
    
    // Default abbreviation (first 3 characters)
    return text.substring(0, 3);
  };

  // Get comparison results for each attribute
  const rarityClass = compareAttribute(guess.rarity, correctAnswer.rarity);
  const classClass = guess.class === correctAnswer.class ? 'bg-brawl-green' : 'bg-brawl-red';
  const movementClass = compareAttribute(guess.movement, correctAnswer.movement);
  const rangeClass = compareAttribute(guess.range, correctAnswer.range);
  const reloadClass = compareAttribute(guess.reload, correctAnswer.reload);

  // Get movement speed icons and tooltip text
  const movementSpeedData = getMovementSpeedIconsAndLabel(guess.movement);

  // Get the portrait image path
  const portraitPath = getPortrait(guess.name);
  
  return (
    <div className={cn(
      "flex flex-row space-x-1 mb-1",
      isAnimating && "animate-fade-in"
    )}>
      {/* All cards with 1:1 aspect ratio */}
      
      {/* Brawler portrait card */}
      <div className="aspect-square h-14 rounded-lg overflow-hidden bg-card">
        <Image
          key={imageKey}
          src={portraitPath}
          alt={guess.name}
          fallbackSrc={DEFAULT_PORTRAIT}
          imageType="portrait"
          className="h-full w-full object-cover"
        />
      </div>
      
      {/* Rarity card */}
      <div className={cn("aspect-square h-14 flex items-center justify-center rounded-lg", rarityClass)}>
        <div className="text-center font-bold text-lg flex items-center justify-center w-[90%] h-[90%]">
          {getAbbreviation(guess.rarity)}
        </div>
      </div>
      
      {/* Class card */}
      <div className={cn("aspect-square h-14 flex items-center justify-center rounded-lg", classClass)}>
        <div className="w-[90%] h-[90%] flex items-center justify-center">
          <img 
            src={getClassIcon(guess.class)}
            alt={guess.class}
            className="w-[90%] h-[90%] object-contain"
          />
        </div>
      </div>
      
      {/* Movement card */}
      <div className={cn("aspect-square h-14 flex items-center justify-center rounded-lg", movementClass)}>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="cursor-help flex items-center justify-center w-[90%] h-[90%]">
                {movementSpeedData.icons}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-black text-white text-xs px-2 py-1 border-none">
              {movementSpeedData.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Range card */}
      <div className={cn("aspect-square h-14 flex items-center justify-center rounded-lg", rangeClass)}>
        <div className="text-center font-bold text-lg flex items-center justify-center w-[90%] h-[90%]">
          {getAbbreviation(guess.range)}
        </div>
      </div>
      
      {/* Reload card */}
      <div className={cn("aspect-square h-14 flex items-center justify-center rounded-lg", reloadClass)}>
        <div className="text-center font-bold text-lg flex items-center justify-center w-[90%] h-[90%]">
          {getAbbreviation(guess.reload)}
        </div>
      </div>
    </div>
  );
};

export default BrawlerGuessRow;
