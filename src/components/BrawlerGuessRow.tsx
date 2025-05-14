import React, { useState, useEffect } from 'react';
import { Brawler } from '@/data/brawlers';
import { ArrowUp, ArrowDown, Gauge, Snail, User, PersonStanding } from 'lucide-react';
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
    // Maps speed categories to numeric values for the gauge
    const speedValues = {
      'Very Fast': 5,
      'Fast': 4,
      'Normal': 3,
      'Slow': 2,
      'Very Slow': 1,
    };
    
    // Maps speed categories to colors
    const speedColors = {
      'Very Fast': '#ff3b30',    // Red
      'Fast': '#ff9500',         // Orange
      'Normal': '#ffcc00',       // Yellow
      'Slow': '#34c759',         // Light Green
      'Very Slow': '#007aff',    // Blue
    };
    
    const value = speedValues[speed] || 3;
    const color = speedColors[speed] || '#ffcc00';
    
    // Calculate what segments of the speedometer to light up
    const segments = [];
    for (let i = 1; i <= 5; i++) {
      segments.push(i <= value);
    }
    
    return {
      icons: (
        <div className="flex flex-col items-center justify-center">
          {/* Custom Speedometer */}
          <div className="relative w-8 h-4">
            {/* Speedometer Background Arc */}
            <svg viewBox="0 0 100 50" className="w-full h-full">
              {/* Background segments */}
              <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e0e0e0" strokeWidth="12" strokeLinecap="round" />
              
              {/* Colored segments based on speed */}
              {segments[0] && <path d="M10,50 A40,40 0 0,1 26,34" fill="none" stroke={speedColors['Very Slow']} strokeWidth="12" strokeLinecap="round" />}
              {segments[1] && <path d="M26,34 A40,40 0 0,1 50,26" fill="none" stroke={speedColors['Slow']} strokeWidth="12" strokeLinecap="round" />}
              {segments[2] && <path d="M50,26 A40,40 0 0,1 74,34" fill="none" stroke={speedColors['Normal']} strokeWidth="12" strokeLinecap="round" />}
              {segments[3] && <path d="M74,34 A40,40 0 0,1 90,50" fill="none" stroke={speedColors['Fast']} strokeWidth="12" strokeLinecap="round" />}
              
              {/* Needle */}
              <g transform={`rotate(${-90 + (value - 1) * 45}, 50, 50)`}>
                <line x1="50" y1="50" x2="50" y2="20" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                <circle cx="50" cy="50" r="5" fill="#333" />
              </g>
            </svg>
          </div>
          
          {/* Speed Value */}
          <div className="text-[10px] font-bold mt-0.5 text-white">
            {value}
          </div>
        </div>
      ),
      tooltip: speed,
    };
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

  // Get movement speed icons and tooltip text
  const movementSpeedData = getMovementSpeedIconsAndLabel(guess.movement);

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
          
          {/* Class - Showing icon instead of text */}
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
          
          {/* Movement - Showing icon with tooltip */}
          <div className={cn("flex-1 h-12 sm:h-14 flex items-center justify-center", movementClass)}>
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
