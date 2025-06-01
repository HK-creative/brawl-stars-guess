import React, { useState, useEffect } from 'react';
import { Brawler, getBrawlerDisplayName } from '@/data/brawlers';
import { getPortrait, DEFAULT_PORTRAIT, getPin, DEFAULT_PIN } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { brawlers } from '@/data/brawlers';
import { t, getLanguage } from '@/lib/i18n';

interface BrawlerGuessRowProps {
  guess: Brawler;
  correctAnswer: Brawler;
  isMobile?: boolean;
  gridWidthClass?: string;
  gridTemplateClass?: string;
  isNew?: boolean; // Add a new prop to identify new guesses
}

// Helper function to translate attribute values
const translateAttributeValue = (attribute: string, value: string): string => {
  const attributeMap: { [key: string]: { [value: string]: string } } = {
    rarity: {
      "Starter": "rarity.starter",
      "Starting Brawler": "rarity.starter",
      "Rare": "rarity.rare",
      "Super Rare": "rarity.super.rare",
      "Epic": "rarity.epic",
      "Mythic": "rarity.mythic",
      "Legendary": "rarity.legendary",
      "Ultra Legendary": "rarity.ultra.legendary"
    },
    range: {
      "Short": "range.short",
      "Normal": "range.normal",
      "Long": "range.long",
      "Very Long": "range.very.long"
    },
    wallbreak: {
      "No": "wallbreak.no",
      "Yes": "wallbreak.yes"
    }
  };

  const translationKey = attributeMap[attribute]?.[value];
  return translationKey ? t(translationKey) : value;
};

const BrawlerGuessRow: React.FC<BrawlerGuessRowProps> = ({ 
  guess, 
  correctAnswer,
  isMobile = false,
  gridWidthClass = "w-full",  // Default to full width
  gridTemplateClass = "grid-cols-6",
  isNew = false // Default to false for backward compatibility
}) => {
  const [imageKey, setImageKey] = useState<string>(`${guess.name}-${Date.now()}`);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const currentLanguage = getLanguage();
  const guessDisplayName = getBrawlerDisplayName(guess, currentLanguage);
  
  // Update the animation state when the component mounts or when isNew changes
  useEffect(() => {
    setImageKey(`${guess.name}-${Date.now()}`);
    
    // Only animate for new guesses
    if (isNew) {
      setIsRevealed(false); // Start with not revealed
      
      // Use double requestAnimationFrame to ensure the class removal is processed before re-adding
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsRevealed(true); // Re-add class to trigger animation
        });
      });
    }
  }, [guess.name, isNew]);
  
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
    if (guessValue === correctValue) {
      return 'bg-brawl-green text-white'; // Green for exact match
    }
    
    // For the more nuanced comparisons, you could return different visual cues
    // but for simplicity, we'll just use red for incorrect
    return 'bg-brawl-red text-white'; // Red for incorrect
  };

  // Helper function to get abbreviation and determine text size based on length
  const getTextDisplay = (text: string): { text: string, className: string } => {
    // Short abbreviations for long texts
    const abbrevMap: Record<string, string> = {
      "Very Long": "V.Long",
      "Very Short": "V.Short",
      "Very Fast": "V.Fast",
      "Very Slow": "V.Slow",
      "Ultra legendary": "Ultra",
      "Super Rare": "S.Rare",
      "Damage Dealer": "Damage",
      "Heavyweight": "Heavy",
      // Hebrew abbreviations
      "נדיר במיוחד": "נ.במיוחד",
      "אולטרה אגדי": "אולטרה",
      "ממש רחוק": "מ.רחוק",
      "טווח ירי": "טווח",
      "שובר קירות": "שובר",
    };
    
    // Get abbreviation if it exists, otherwise use original text
    const displayText = abbrevMap[text] || text;
    
    // Determine text size class based on length with better mobile scaling
    let textClass = 'text-2xl';
    if (displayText.length > 8) {
      textClass = isMobile ? 'text-xs' : 'text-lg';
    } else if (displayText.length > 6) {
      textClass = isMobile ? 'text-sm' : 'text-xl';
    } else if (displayText.length > 4) {
      textClass = isMobile ? 'text-base' : 'text-2xl';
    } else {
      textClass = isMobile ? 'text-lg' : 'text-3xl';
    }
    
    return { text: displayText, className: textClass };
  };

  // Get translated values for display
  const translatedGuessRarity = translateAttributeValue('rarity', guess.rarity);
  const translatedCorrectRarity = translateAttributeValue('rarity', correctAnswer.rarity);
  const translatedGuessRange = translateAttributeValue('range', guess.range);
  const translatedCorrectRange = translateAttributeValue('range', correctAnswer.range);
  const translatedGuessWallbreak = translateAttributeValue('wallbreak', guess.wallbreak);
  const translatedCorrectWallbreak = translateAttributeValue('wallbreak', correctAnswer.wallbreak);

  // Get comparison results for each attribute
  const rarityClass = compareAttribute(guess.rarity, correctAnswer.rarity);
  const classClass = guess.class === correctAnswer.class ? 'bg-brawl-green' : 'bg-brawl-red';
  const rangeClass = compareAttribute(guess.range, correctAnswer.range);
  const wallbreakClass = compareAttribute(guess.wallbreak, correctAnswer.wallbreak);
  
  // Release year color
  const guessYear = parseInt(guess.releaseYear?.toString() || '0');
  const correctYear = parseInt(correctAnswer.releaseYear?.toString() || '0');
  let releaseYearClass = 'bg-brawl-red text-white'; // Default to red (incorrect)
  
  if (guessYear === correctYear) releaseYearClass = 'bg-brawl-green text-white'; // Green for exact match
  else if (Math.abs(guessYear - correctYear) === 1) releaseYearClass = 'bg-brawl-yellow text-white';
  
  // Get the portrait image path
  const portraitPath = getPortrait(guess.name);
  
  // Animation delay for each card (in seconds)
  const getDelay = (index: number) => `${0.1 + index * 0.05}s`;

  // Border style for card outlines
  const cardBorderStyle = "border-2 border-[#2a2f6a]";

  // --- ARROW HELPERS ---
  // Order arrays for comparison
  const rarityOrder = ["Starter", "Rare", "Super Rare", "Epic", "Mythic", "Legendary", "Ultra legendary"];
  const rangeOrder = ["Short", "Normal", "Long", "Very Long"];

  // Returns 'up', 'down', or null
  const getArrowDirection = (orderArr: string[], guessVal: string, correctVal: string) => {
    const guessIndex = orderArr.indexOf(guessVal);
    const correctIndex = orderArr.indexOf(correctVal);
    if (guessIndex < correctIndex) return 'up';
    if (guessIndex > correctIndex) return 'down';
    return null;
  };
  // For release year
  const getYearArrowDirection = (guessYear: number, correctYear: number) => {
    if (guessYear < correctYear) return 'up';
    if (guessYear > correctYear) return 'down';
    return null;
  };

  // SVG arrow component (true arrow, not triangle)
  const ArrowBg = ({ direction }: { direction: 'up' | 'down' }) => (
    <svg 
      viewBox="0 0 100 100" 
      className="absolute inset-0 w-full h-full" 
      style={{ zIndex: 0 }}
    >
      {direction === 'up' ? (
        <>
          {/* Arrow shaft */}
          <rect x="44" y="30" width="12" height="45" rx="5" fill="#7f1d1d" />
          {/* Arrow head */}
          <polygon points="50,10 80,40 65,40 65,75 35,75 35,40 20,40" fill="#7f1d1d" />
        </>
      ) : (
        <>
          {/* Arrow shaft */}
          <rect x="44" y="25" width="12" height="45" rx="5" fill="#7f1d1d" />
          {/* Arrow head */}
          <polygon points="50,90 80,60 65,60 65,25 35,25 35,60 20,60" fill="#7f1d1d" />
        </>
      )}
    </svg>
  );

  return (
    <div className="w-full flex justify-center"> 
      <div className={cn(
        "grid",
        gridTemplateClass,
        isMobile ? "gap-2" : "gap-5", // Increased mobile gap from 1 to 2 for better spacing
        "w-full" // Remove px-1 to match the label width exactly
      )}>
          {/* Brawler Portrait */}
          <div className="aspect-square">
            <div 
              style={{ animationDelay: getDelay(0) }}
              className={cn(
                "h-full w-full rounded-lg overflow-hidden",
                "flex items-center justify-center",
                "bg-gray-800/50 backdrop-blur-sm",
                cardBorderStyle,
                "relative",
                isMobile ? "min-h-[60px]" : "min-h-[80px]", // Ensure minimum size on mobile
                isNew && isRevealed && "animate-card-reveal"
              )}
            >
              <Image
                key={imageKey}
                src={portraitPath}
                alt={guessDisplayName}
                fallbackSrc={DEFAULT_PORTRAIT}
                imageType="portrait"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </div>
        
          {/* Rarity card */}
          <div className="aspect-square">
            <div
              style={{ animationDelay: getDelay(1) }}
              className={cn(
                "h-full w-full rounded-lg",
                "flex items-center justify-center",
                "relative", // for arrow
                rarityClass,
                cardBorderStyle, // Add border
                "font-bold",
                isMobile ? "min-h-[60px] px-1" : "min-h-[80px]", // Ensure minimum size and padding
                isNew && isRevealed && "animate-card-reveal" // Only animate if this is a new guess and revealed
              )}
            >
              {/* Arrow background if not green */}
              {rarityClass !== 'bg-brawl-green text-white' && getArrowDirection(rarityOrder, guess.rarity, correctAnswer.rarity) && (
                <ArrowBg direction={getArrowDirection(rarityOrder, guess.rarity, correctAnswer.rarity) as 'up' | 'down'} />
              )}
              <span
                className={cn(
                  // Responsive text size for longer rarity names with better scaling
                  getTextDisplay(translatedGuessRarity).className,
                  'font-bold text-center leading-tight',
                )}
                style={{ position: 'relative', zIndex: 1 }}
              >
                {getTextDisplay(translatedGuessRarity).text}
              </span>
            </div>
          </div>
        
          {/* Class card */}
          <div className="aspect-square">
            <div
              style={{ animationDelay: getDelay(2) }}
              className={cn(
                "h-full w-full rounded-lg",
                "flex items-center justify-center",
                classClass,
                cardBorderStyle, // Add border
                "relative overflow-visible",
                isMobile ? "min-h-[60px]" : "min-h-[80px]", // Ensure minimum size
                isNew && isRevealed && "animate-card-reveal"
              )}
            >
              {/* Portal container ensures the tooltip renders at the top level of the DOM */}
              <div className="relative w-full h-full flex items-center justify-center" style={{ isolation: 'isolate' }}>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={getClassIcon(guess.class)}
                          alt={guess.class}
                          className={cn(
                            isMobile ? 'w-[90%] h-[90%]' : 'w-[65%] h-[65%]', // Increased mobile icon size
                            'object-contain',
                            'cursor-pointer'
                          )}
                          onTouchStart={(e) => {
                            // This adds touch support for mobile
                            const target = e.currentTarget;
                            target.click(); // Simulate click on touch to trigger the tooltip
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      sideOffset={12}
                      className="min-w-[240px] max-w-[380px] p-5 bg-black/95 border-4 border-yellow-400 rounded-2xl shadow-2xl flex flex-col items-center"
                      style={{ 
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45)',
                        position: 'fixed', // Force fixed positioning
                        zIndex: 10000 // Extremely high z-index to ensure it's on top
                      }}
                      onPointerDownOutside={(e) => {
                        // This helps with keeping the tooltip open until clicked elsewhere
                        e.preventDefault();
                      }}
                    >
                      <div className="text-xl font-extrabold text-brawl-yellow text-center mb-4 tracking-wide drop-shadow">
                        {guess.class}
                      </div>
                      <div className="grid grid-cols-4 gap-4 justify-center items-center w-full px-2">
                        {brawlers.filter(b => b.class === guess.class).map(b => {
                          const brawlerDisplayName = getBrawlerDisplayName(b, currentLanguage);
                          return (
                            <div key={b.name} className="flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 bg-black">
                                <Image
                                  src={getPin(b.name)}
                                  alt={brawlerDisplayName}
                                  fallbackSrc={DEFAULT_PIN}
                                  imageType="pin"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        
          {/* Range card */}
          <div className="aspect-square">
            <div
              style={{ animationDelay: getDelay(3) }}
              className={cn(
                "h-full w-full rounded-lg",
                "flex items-center justify-center",
                "relative", // for arrow
                rangeClass,
                cardBorderStyle, // Add border
                "font-bold",
                isMobile ? "min-h-[60px] px-1" : "min-h-[80px]", // Ensure minimum size and padding
                isNew && isRevealed && "animate-card-reveal" // Only animate if this is a new guess and revealed
              )}
            >
              {/* Arrow background if not green */}
              {rangeClass !== 'bg-brawl-green text-white' && getArrowDirection(rangeOrder, guess.range, correctAnswer.range) && (
                <ArrowBg direction={getArrowDirection(rangeOrder, guess.range, correctAnswer.range) as 'up' | 'down'} />
              )}
              <span
                className={cn(
                  getTextDisplay(translatedGuessRange).className,
                  'font-bold text-center leading-tight'
                )}
                style={{ position: 'relative', zIndex: 1 }}
              >
                {getTextDisplay(translatedGuessRange).text}
              </span>
            </div>
          </div>
        
          {/* Wallbreak card */}
          <div className="aspect-square">
            <div
              style={{ animationDelay: getDelay(4) }}
              className={cn(
                "h-full w-full rounded-lg",
                "flex items-center justify-center",
                wallbreakClass,
                cardBorderStyle, // Add border
                "font-bold",
                isMobile ? "min-h-[60px] px-1" : "min-h-[80px]", // Ensure minimum size and padding
                isNew && isRevealed && "animate-card-reveal" // Only animate if this is a new guess and revealed
              )}
            >
              <span
                className={cn(
                  getTextDisplay(translatedGuessWallbreak).className,
                  'font-bold text-center leading-tight'
                )}
              >
                {getTextDisplay(translatedGuessWallbreak).text}
              </span>
            </div>
          </div>
        
          {/* Release Year card (last) */}
          <div className="aspect-square">
            <div
              style={{ animationDelay: getDelay(5) }}
              className={cn(
                "h-full w-full rounded-lg",
                "flex items-center justify-center",
                "relative", // for arrow
                releaseYearClass,
                cardBorderStyle, // Add border
                "font-bold",
                isMobile ? "min-h-[60px]" : "min-h-[80px]", // Ensure minimum size
                isNew && isRevealed && "animate-card-reveal" // Only animate if this is a new guess and revealed
              )}
            >
              {/* Arrow background if not green */}
              {releaseYearClass !== 'bg-brawl-green text-white' && getYearArrowDirection(guessYear, correctYear) && (
                <ArrowBg direction={getYearArrowDirection(guessYear, correctYear) as 'up' | 'down'} />
              )}
              <span
                className={cn(
                  isMobile ? 'text-lg' : 'text-4xl',
                  'font-bold text-center leading-tight'
                )}
                style={{ position: 'relative', zIndex: 1 }}
              >
                {guessYear || '?'}
              </span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default BrawlerGuessRow;
