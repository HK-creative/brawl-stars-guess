import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GameModeCardProps {
  mode?: string;
  title?: string;
  description: string;
  icon: string;
  path?: string;
  comingSoon?: boolean;
  enabled?: boolean;
  bgColor?: string;
  previewImage?: string;
  cardBackground?: string;
}

const modeColors = {
  classic: "from-pink-500 to-pink-600",
  endless: "from-orange-500 to-orange-600",
  audio: "from-purple-500 to-purple-600",
  gadget: "from-yellow-500 to-yellow-600",
};

const GameModeCard: React.FC<GameModeCardProps> = ({ 
  mode, 
  title, 
  description, 
  icon, 
  path, 
  comingSoon = false,
  enabled = true,
  bgColor,
  previewImage,
  cardBackground
}) => {
  const displayTitle = title || (mode ? t(`mode.${mode}`) : '');
  const linkPath = path || (mode ? `/${mode}` : '#');
  const isClickable = !comingSoon && enabled;
  const gradientColor = bgColor || (mode && modeColors[mode]) || "from-blue-500 to-blue-600";

  return (
    <Link 
      to={isClickable ? linkPath : "#"} 
      className={cn(
        "block w-full",
        "transition-all duration-300",
        !isClickable && "opacity-70 cursor-not-allowed",
        "group"
      )}
    >
      <Card className={cn(
        "relative w-full h-32 md:h-48",
        "overflow-hidden",
        "rounded-xl",
        "border-2 border-white/10",
        "transition-all duration-300",
        isClickable && [
          "hover:scale-[1.02]",
          "hover:shadow-xl",
          "hover:shadow-black/20",
          "hover:border-white/30"
        ]
      )}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {cardBackground ? (
            <img 
              src={cardBackground} 
              alt={`${displayTitle} background`} 
              className="w-full h-full object-cover"
            />
          ) : previewImage ? (
            <img 
              src={previewImage} 
              alt={displayTitle} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={cn(
              "w-full h-full",
              "bg-gradient-to-br",
              gradientColor
            )} />
          )}
          <div className={cn(
            "absolute inset-0",
            "bg-black/60"
          )} />
        </div>

        {/* Content */}
        <div className="relative h-full p-4 md:p-6 flex items-center z-10">
          {/* Icon Container */}
          <div className={cn(
            "flex-shrink-0 mr-4 md:mr-6",
            "w-16 h-16 md:w-24 md:h-24",
            "rounded-xl",
            "bg-black/40 backdrop-blur-md",
            "flex items-center justify-center",
            "border-2 border-white/20",
            "shadow-lg",
            "transition-transform duration-300",
            "group-hover:scale-110",
            "overflow-hidden"
          )}>
            {typeof icon === 'string' && icon.startsWith('/') ? (
              <img src={icon} alt={`${displayTitle} icon`} className="w-full h-full object-contain p-1 md:p-2" />
            ) : (
              <span className="text-3xl md:text-5xl">{icon}</span>
            )}
          </div>

          {/* Text Content */}
          <div className="flex flex-col">
            <h3 className={cn(
              "text-xl md:text-4xl font-black text-white",
              "tracking-wide",
              "drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]"
            )}>
              {displayTitle}
            </h3>
          </div>
        </div>

        {comingSoon && (
          <div className={cn(
            "absolute inset-0 z-20",
            "flex items-center justify-center",
            "bg-black/70 backdrop-blur-md",
            "animate-fade-in"
          )}>
            <div className={cn(
              "px-6 py-3",
              "bg-white/10",
              "border-2 border-white/30",
              "rounded-lg",
              "shadow-lg"
            )}>
              <span className="text-xl font-bold text-white animate-pulse">
                {t('coming.soon')}
              </span>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
};

export default GameModeCard;
