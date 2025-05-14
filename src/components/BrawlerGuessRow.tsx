
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
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  const getMovementSpeedIconsAndLabel = (speed: string) => {
    switch (speed) {
      case 'Very Fast':
        return {
          icons: (
            <div className="flex items-center justify-center">
              <img src="/Rabbit_Fast.png" alt="Very Fast" className="w-4 h-4 sm:w-5 sm:h-5" />
              <img src="/Rabbit_Fast.png" alt="Very Fast" className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            </div>
          ),
          tooltip: "Very Fast",
        };
      case 'Fast':
        return {
          icons: <img src="/Rabbit_Fast.png" alt="Fast" className="w-5 h-5 sm:w-6 sm:h-6" />,
          tooltip: "Fast",
        };
      case 'Normal':
        return {
          icons: <img src="/Walking_Normal.png" alt="Normal" className="w-5 h-5 sm:w-6 sm:h-6" />,
          tooltip: "Normal",
        };
      case 'Slow':
        return {
          icons: <img src="/Turtle_Slow.png" alt="Slow" className="w-5 h-5 sm:w-6 sm:h-6" />,
          tooltip: "Slow",
        };
      case 'Very Slow':
        return {
          icons: (
            <div className="flex items-center justify-center">
              <img src="/Turtle_Slow.png" alt="Very Slow" className="w-4 h-4 sm:w-5 sm:h-5" />
              <img src="/Turtle_Slow.png" alt="Very Slow" className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            </div>
          ),
          tooltip: "Very Slow",
        };
      default:
        return {
          icons: <img src="/Walking_Normal.png" alt="Normal" className="w-5 h-5 sm:w-6 sm:h-6" />,
          tooltip: "Normal",
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
    <div className={cn("w-full relative rounded-lg overflow-hidden mb-3", isAnimating && "animate-fade-in")}>
      <div className="flex items-stretch w-full">
        {/* Brawler portrait */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16">
            <Image
              key={imageKey}
              src={portraitPath}
              alt={guess.name}
              fallbackSrc={DEFAULT_PORTRAIT}
              imageType="portrait"
              aspectRatio={1}
              className="rounded-l-lg h-full"
            />
          </div>
        </div>
        
        {/* Attributes grid - with larger 1:1 aspect ratio cells */}
        <div className="flex flex-grow h-full">
          {/* Rarity */}
          <div className={cn("flex-1 relative", rarityClass)}>
            <AspectRatio ratio={1} className="w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center font-semibold text-sm sm:text-base">
                  {isMobile ? getAbbreviation(guess.rarity) : guess.rarity.substring(0, 7)}
                </div>
              </div>
            </AspectRatio>
          </div>
          
          {/* Class - Showing icon instead of text */}
          <div className={cn("flex-1 relative", classClass)}>
            <AspectRatio ratio={1} className="w-full">
              <div className="absolute inset-0 flex items-center justify-center">
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
            </AspectRatio>
          </div>
          
          {/* Movement - Showing animal icons with tooltip */}
          <div className={cn("flex-1 relative", movementClass)}>
            <AspectRatio ratio={1} className="w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="cursor-help flex items-center justify-center">
                        {movementSpeedData.icons}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black text-white text-xs px-2 py-1 border-none">
                      {movementSpeedData.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AspectRatio>
          </div>
          
          {/* Range */}
          <div className={cn("flex-1 relative", rangeClass)}>
            <AspectRatio ratio={1} className="w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center font-semibold text-sm sm:text-base">
                  {isMobile ? getAbbreviation(guess.range) : guess.range.substring(0, 7)}
                </div>
              </div>
            </AspectRatio>
          </div>
          
          {/* Reload - Now with rounded-right for last column */}
          <div className={cn("flex-1 relative", reloadClass, "rounded-r-lg")}>
            <AspectRatio ratio={1} className="w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center font-semibold text-sm sm:text-base">
                  {isMobile ? getAbbreviation(guess.reload) : guess.reload.substring(0, 7)}
                </div>
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrawlerGuessRow;
