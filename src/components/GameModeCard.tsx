
import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
        "relative w-full",
        "h-14", 
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
        <div className="relative h-full px-3 flex items-center justify-between z-10">
          {/* Left Side: Icon + Mode Name */}
          <div className="flex items-center space-x-2">
            {/* Icon Container */}
            <div className={cn(
              "flex-shrink-0",
              "w-8 h-8", 
              "rounded-lg",
              "bg-black/40 backdrop-blur-md",
              "flex items-center justify-center",
              "border border-white/20",
              "shadow-lg",
              "transition-transform duration-300",
              "group-hover:scale-110",
              "overflow-hidden"
            )}>
              {typeof icon === 'string' && icon.startsWith('/') ? (
                <img src={icon} alt={`${displayTitle} icon`} className="w-6 h-6 object-contain" />
              ) : (
                <span className="text-lg">{icon}</span>
              )}
            </div>
            
            {/* Mode Name */}
            <div>
              <h3 className={cn(
                "text-lg font-bold text-white",
                "tracking-wide",
                "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              )}>
                {displayTitle}
              </h3>
            </div>
          </div>
          
          {/* Right side with language-appropriate direction */}
          <div className={cn(
            "flex items-center",
            "text-white text-xl font-bold"
          )}>
            {mode === "classic" && "🏆"}
            {mode === "audio" && "🎵"}
            {mode === "gadget" && "🛠️"}
            {mode === "starpower" && "⭐"}
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
              "px-3 py-1",
              "bg-white/10",
              "border border-white/30",
              "rounded-lg",
              "shadow-lg"
            )}>
              <span className="text-sm font-bold text-white animate-pulse">
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
