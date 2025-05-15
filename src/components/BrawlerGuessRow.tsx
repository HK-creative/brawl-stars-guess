
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
          icons: <img src="/Rabbit_Fast.png" alt="Very Fast" className="w-full h-full object-contain" />,
          tooltip: "Very Fast",
        };
      case 'Fast':
        return {
          icons: <img src="/Rabbit_Fast.png" alt="Fast" className="w-full h-full object-contain" />,
          tooltip: "Fast",
        };
      case 'Normal':
        return {
          icons: <img src="/Walking_Normal.png" alt="Normal" className="w-full h-full object-contain" />,
          tooltip: "Normal",
        };
      case 'Slow':
        return {
          icons: <img src="/Turtle_Slow.png" alt="Slow" className="w-full h-full object-contain" />,
          tooltip: "Slow",
        };
      case 'Very Slow':
        return {
          icons: <img src="/Turtle_Slow.png" alt="Very Slow" className="w-full h-full object-contain" />,
          tooltip: "Very Slow",
        };
      default:
        return {
          icons: <img src="/Walking_Normal.png" alt="Normal" className="w-full h-full object-contain" />,
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

  // Helper function to get abbreviation and determine text size based on length
  const getTextDisplay = (text: string): { text: string, className: string } => {
    // Special abbreviations based on Brawl Stars conventions
    if (text === "Mythic") return { text: "Myt", className: "text-lg" };
    if (text === "Super Rare") return { text: "Sup", className: "text-lg" };
    if (text === "Legendary") return { text: "Leg", className: "text-lg" };
    if (text === "Epic") return { text: "Epi", className: "text-lg" };
    if (text === "Rare") return { text: "Rar", className: "text-lg" };
    if (text === "Chromatic") return { text: "Chr", className: "text-lg" };
    if (text === "Short") return { text: "Short", className: "text-lg" };
    if (text === "Medium") return { text: "Med", className: "text-lg" };
    if (text === "Long") return { text: "Long", className: "text-lg" };
    if (text === "Very Long") return { text: "V.Long", className: "text-base" };
    if (text === "Normal") return { text: "Nor", className: "text-lg" };
    if (text === "Very Fast") return { text: "V.Fast", className: "text-base" };
    if (text === "Fast") return { text: "Fast", className: "text-lg" };
    if (text === "Slow") return { text: "Slow", className: "text-lg" };
    if (text === "Yes") return { text: "Yes", className: "text-lg" };
    if (text === "No") return { text: "No", className: "text-lg" };
    
    // Dynamic sizing based on text length
    if (text.length <= 3) return { text, className: "text-lg" };
    if (text.length <= 5) return { text, className: "text-base" };
    if (text.length <= 7) return { text, className: "text-sm" };
    return { text: text.substring(0, 6), className: "text-sm" };
  };

  // Get comparison results for each attribute
  const rarityClass = compareAttribute(guess.rarity, correctAnswer.rarity);
  const classClass = guess.class === correctAnswer.class ? 'bg-brawl-green' : 'bg-brawl-red';
  const movementClass = compareAttribute(guess.movement, correctAnswer.movement);
  const rangeClass = compareAttribute(guess.range, correctAnswer.range);
  
  // For wallbreak attribute - default to "No" for now
  const wallbreakValue = guess.wallbreak || "No";
  const correctWallbreakValue = correctAnswer.wallbreak || "No";
  const wallbreakClass = wallbreakValue === correctWallbreakValue ? 'bg-brawl-green text-white' : 'bg-brawl-red text-white';

  // Get movement speed icons and tooltip text
  const movementSpeedData = getMovementSpeedIconsAndLabel(guess.movement);

  // Get text display for each attribute
  const rarityDisplay = getTextDisplay(guess.rarity);
  const rangeDisplay = getTextDisplay(guess.range);
  const wallbreakDisplay = getTextDisplay(wallbreakValue);
  
  // Get the portrait image path
  const portraitPath = getPortrait(guess.name);
  
  // Define card size and spacing based on device
  const cardSizeClass = isMobile 
    ? "h-14" // Keep mobile size the same
    : "h-20"; // Bigger cards for desktop/tablet
    
  const rowSpacingClass = isMobile
    ? "gap-1 mb-1" // Keep mobile spacing the same
    : "gap-3 mb-2"; // More spacing for desktop/tablet
    
  const cardFramingClass = isMobile
    ? "" // No additional framing on mobile
    : "border-2 border-white/10 shadow-md"; // Better framing for desktop/tablet
  
  return (
    <div className={cn(
      "flex flex-row",
      rowSpacingClass,
      isAnimating && "animate-fade-in"
    )}>
      {/* All cards with fixed same size */}
      
      {/* Brawler portrait card */}
      <div className={cn(
        "aspect-square rounded-lg overflow-hidden bg-card",
        cardSizeClass,
        cardFramingClass
      )}>
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
      <div className={cn(
        "aspect-square flex items-center justify-center rounded-lg",
        cardSizeClass,
        cardFramingClass,
        rarityClass
      )}>
        <div className={cn(
          "text-center font-bold flex items-center justify-center w-[95%] h-[95%]",
          rarityDisplay.className,
          !isMobile && "text-2xl" // Larger text for desktop
        )}>
          {rarityDisplay.text}
        </div>
      </div>
      
      {/* Class card */}
      <div className={cn(
        "aspect-square flex items-center justify-center rounded-lg",
        cardSizeClass,
        cardFramingClass,
        classClass
      )}>
        <div className="w-[95%] h-[95%] flex items-center justify-center">
          <img 
            src={getClassIcon(guess.class)}
            alt={guess.class}
            className={cn(
              "w-[95%] h-[95%] object-contain",
              !isMobile && "scale-125" // Larger icon for desktop
            )}
          />
        </div>
      </div>
      
      {/* Movement card */}
      <div className={cn(
        "aspect-square flex items-center justify-center rounded-lg",
        cardSizeClass,
        cardFramingClass,
        movementClass
      )}>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className={cn(
                "cursor-help flex items-center justify-center w-[95%] h-[95%]",
                !isMobile && "scale-125" // Larger icon for desktop
              )}>
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
      <div className={cn(
        "aspect-square flex items-center justify-center rounded-lg",
        cardSizeClass,
        cardFramingClass,
        rangeClass
      )}>
        <div className={cn(
          "text-center font-bold flex items-center justify-center w-[95%] h-[95%]",
          rangeDisplay.className,
          !isMobile && "text-2xl" // Larger text for desktop
        )}>
          {rangeDisplay.text}
        </div>
      </div>
      
      {/* Wallbreak card */}
      <div className={cn(
        "aspect-square flex items-center justify-center rounded-lg",
        cardSizeClass,
        cardFramingClass,
        wallbreakClass
      )}>
        <div className={cn(
          "text-center font-bold flex items-center justify-center w-[95%] h-[95%]",
          wallbreakDisplay.className,
          !isMobile && "text-2xl" // Larger text for desktop
        )}>
          {wallbreakDisplay.text}
        </div>
      </div>
    </div>
  );
};

export default BrawlerGuessRow;
