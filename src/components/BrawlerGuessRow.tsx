import React, { useState, useEffect } from 'react';
import { Brawler } from '@/data/brawlers';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BrawlerGuessRowProps {
  guess: Brawler;
  correctAnswer: Brawler;
  isMobile?: boolean;
  gridWidthClass?: string;
  gridTemplateClass?: string;
}

const BrawlerGuessRow: React.FC<BrawlerGuessRowProps> = ({ 
  guess, 
  correctAnswer,
  isMobile = false,
  gridWidthClass = "w-[85%] mx-auto",
  gridTemplateClass = "grid-cols-6"
}) => {
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
            <div className="flex justify-center items-center w-full h-full">
              <div className="w-1/2 h-full flex items-center justify-center">
                <img src="/Rabbit_Fast.png" alt="Very Fast" className="w-[85%] h-[85%] object-contain" />
              </div>
              <div className="w-1/2 h-full flex items-center justify-center">
                <img src="/Rabbit_Fast.png" alt="Very Fast" className="w-[85%] h-[85%] object-contain" />
              </div>
            </div>
          ),
          tooltip: "Very Fast",
        };
      case 'Fast':
        return {
          icons: <img src="/Rabbit_Fast.png" alt="Fast" className="w-[85%] h-[85%] object-contain" />,
          tooltip: "Fast",
        };
      case 'Normal':
        return {
          icons: <img src="/Walking_Normal.png" alt="Normal" className="w-[85%] h-[85%] object-contain" />,
          tooltip: "Normal",
        };
      case 'Slow':
        return {
          icons: <img src="/Turtle_Slow.png" alt="Slow" className="w-[85%] h-[85%] object-contain" />,
          tooltip: "Slow",
        };
      case 'Very Slow':
        return {
          icons: (
            <div className="flex justify-center items-center w-full h-full">
              <div className="w-1/2 h-full flex items-center justify-center">
                <img src="/Turtle_Slow.png" alt="Very Slow" className="w-[85%] h-[85%] object-contain" />
              </div>
              <div className="w-1/2 h-full flex items-center justify-center">
                <img src="/Turtle_Slow.png" alt="Very Slow" className="w-[85%] h-[85%] object-contain" />
              </div>
            </div>
          ),
          tooltip: "Very Slow",
        };
      default:
        return {
          icons: <img src="/Walking_Normal.png" alt="Normal" className="w-[85%] h-[85%] object-contain" />,
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
    if (text === "Mythic") return { text: "Myt", className: "text-2xl" };
    if (text === "Super Rare") return { text: "Sup", className: "text-2xl" };
    if (text === "Legendary") return { text: "Leg", className: "text-2xl" };
    if (text === "Epic") return { text: "Epi", className: "text-2xl" };
    if (text === "Rare") return { text: "Rar", className: "text-2xl" };
    if (text === "Chromatic") return { text: "Chr", className: "text-2xl" };
    if (text === "Short") return { text: "Short", className: "text-2xl" };
    if (text === "Medium") return { text: "Med", className: "text-2xl" };
    if (text === "Long") return { text: "Long", className: "text-2xl" };
    if (text === "Very Long") return { text: "V.Long", className: "text-xl" };
    if (text === "Normal") return { text: "Nor", className: "text-2xl" };
    if (text === "Very Fast") return { text: "V.Fast", className: "text-xl" };
    if (text === "Fast") return { text: "Fast", className: "text-2xl" };
    if (text === "Slow") return { text: "Slow", className: "text-2xl" };
    if (text === "Yes") return { text: "Yes", className: "text-2xl" };
    if (text === "No") return { text: "No", className: "text-2xl" };
    
    // Dynamic sizing based on text length
    if (text.length <= 3) return { text, className: "text-2xl" };
    if (text.length <= 5) return { text, className: "text-xl" };
    if (text.length <= 7) return { text, className: "text-lg" };
    return { text: text.substring(0, 6), className: "text-base" };
  };

  // Get comparison results for each attribute
  const rarityClass = compareAttribute(guess.rarity, correctAnswer.rarity);
  const classClass = guess.class === correctAnswer.class ? 'bg-brawl-green' : 'bg-brawl-red';
  const movementClass = compareAttribute(guess.movement, correctAnswer.movement);
  const rangeClass = compareAttribute(guess.range, correctAnswer.range);
  
  // For wallbreak attribute
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
  
  // Now cards are perfect squares taking their full allotted width/height
  const rowSpacingClass = isMobile ? "gap-1 mb-1" : "gap-3 mb-2"; // Spacing between rows
  
  return (
    <div className={cn(
      "grid",
      gridTemplateClass,
      rowSpacingClass,
      isAnimating && "animate-fade-in",
      gridWidthClass // Use the same width as the headers
    )}>
      {/* Brawler portrait - removed extra div wrapper */}
      <div className="w-full aspect-square bg-card rounded-lg flex items-center justify-center">
        <Image
          key={imageKey}
          src={portraitPath}
          alt={guess.name}
          fallbackSrc={DEFAULT_PORTRAIT}
          imageType="portrait"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Rarity card */}
      <div className="w-full aspect-square">
        <div className={cn(
          "w-full h-full flex items-center justify-center rounded-lg",
          rarityClass
        )}>
          <div className={cn(
            "text-center font-bold flex items-center justify-center w-[85%] h-[85%]",
            rarityDisplay.className,
            !isMobile && "text-3xl" // Larger text for desktop
          )}>
            {rarityDisplay.text}
          </div>
        </div>
      </div>
      
      {/* Class card */}
      <div className="w-full aspect-square">
        <div className={cn(
          "w-full h-full flex items-center justify-center rounded-lg",
          classClass
        )}>
          <div className="w-[85%] h-[85%] flex items-center justify-center">
            <img 
              src={getClassIcon(guess.class)}
              alt={guess.class}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
      
      {/* Movement card */}
      <div className="w-full aspect-square">
        <div className={cn(
          "w-full h-full flex items-center justify-center rounded-lg",
          movementClass
        )}>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="cursor-help flex items-center justify-center w-[85%] h-[85%]">
                  {movementSpeedData.icons}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white text-xs px-2 py-1 border-none">
                {movementSpeedData.tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Range card */}
      <div className="w-full aspect-square">
        <div className={cn(
          "w-full h-full flex items-center justify-center rounded-lg",
          rangeClass
        )}>
          <div className={cn(
            "text-center font-bold flex items-center justify-center w-[85%] h-[85%]",
            rangeDisplay.className,
            !isMobile && "text-3xl" // Larger text for desktop
          )}>
            {rangeDisplay.text}
          </div>
        </div>
      </div>
      
      {/* Wallbreak card */}
      <div className="w-full aspect-square">
        <div className={cn(
          "w-full h-full flex items-center justify-center rounded-lg",
          wallbreakClass
        )}>
          <div className={cn(
            "text-center font-bold flex items-center justify-center w-[85%] h-[85%]",
            wallbreakDisplay.className,
            !isMobile && "text-3xl" // Larger text for desktop
          )}>
            {wallbreakDisplay.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrawlerGuessRow;
