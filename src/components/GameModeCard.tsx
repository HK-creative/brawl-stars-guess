import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GameModeCardProps {
  mode?: string;
  title?: string;
  icon: string;
  path?: string;
  customPath?: string;
  comingSoon?: boolean;
  enabled?: boolean;
  bgColor?: string;
  previewImage?: string;
  cardBackground?: string;
}

export const modeColors = {
  classic: "from-pink-500 to-pink-600",
  endless: "from-orange-500 to-orange-600",
  audio: "from-purple-500 to-purple-600",
  gadget: "from-yellow-500 to-yellow-600",
  starpower: "from-yellow-500 to-yellow-600",
  survival: "from-red-500 to-red-600",
};

export const modeIcons: Record<string, string> = {
  classic: "/ClassicIcon.png",
  endless: "/EndlessIcon.png",
  audio: "/AudioIcon.png",
  gadget: "/GadgetIcon.png",
  starpower: "/StarpowerIcon.png",
  survival: "/images/icons/heart-icon.png",
};

export const modeCardBackgrounds: Record<string, string> = {
  classic: "/ClassicMode_Background.png",
  endless: "/EndlessMode_Background.png",
  audio: "/AudioMode_Background.png",
  gadget: "/GadgetMode_Background.png",
  starpower: "/StarPowerMode_Background.png",
  survival: "/SurvivalMode_Background.png",
};

export const modeDisplayNames: Record<string, string> = {
  classic: "Classic Mode",
  endless: "Endless Mode",
  audio: "Audio Mode",
  gadget: "Gadget Mode",
  starpower: "Star Power Mode",
  survival: "Survival / Hard Mode",
};

export const modeOrder = [
  'classic',
  'audio',
  'gadget',
  'starpower',
  'survival',
];

export const modePreviewImages: Record<string, string> = {
  classic: "/images/modes/classic-preview.jpg",
  audio: "/images/modes/audio-preview.jpg",
  gadget: "/images/modes/gadget-preview.jpg",
  starpower: "/images/modes/starpower-preview.jpg",
  survival: "/images/modes/survival-preview.jpg",
};

const GameModeCard: React.FC<GameModeCardProps> = ({ 
  mode, 
  title, 
  icon, 
  path,
  customPath,
  comingSoon = false,
  enabled = true,
  bgColor,
  previewImage,
  cardBackground
}) => {
  const displayTitle = title || (mode ? t(`mode.${mode}`) : '');
  const linkPath = customPath || path || (mode ? `/${mode}` : '#');
  const isClickable = !comingSoon && enabled;
  const gradientColor = bgColor || (mode && modeColors[mode]) || "from-blue-500 to-blue-600";

  return (
    <>
      {/* Mobile layout: flex row, icon 20%, card 60%, spacing 20% */}
      <div className="w-full flex flex-row items-center md:hidden">
        <div className="flex items-center justify-center w-[20%] h-16 rounded-2xl bg-black/60 backdrop-blur-md border-2 border-white/30 shadow-lg" style={{ minWidth: '56px', maxWidth: '80px' }}>
          {typeof icon === 'string' && icon.startsWith('/') ? (
            <img src={icon} alt={`${displayTitle} icon`} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-3xl">{icon}</span>
          )}
        </div>
    <Link 
      to={isClickable ? linkPath : "#"} 
      className={cn(
            "w-[60%] ml-2 transition-all duration-300",
        !isClickable && "opacity-70 cursor-not-allowed",
        "group"
      )}
          style={{ minWidth: 0 }}
    >
      <Card className={cn(
            "relative h-24 flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 transition-all duration-300",
        isClickable && [
          "hover:scale-[1.02]",
          "hover:shadow-xl",
          "hover:shadow-black/20",
          "hover:border-white/30"
        ]
      )}>
        <div className="absolute inset-0">
          {cardBackground ? (
                <img src={cardBackground} alt={`${displayTitle} background`} className="w-full h-full object-cover" />
          ) : previewImage ? (
                <img src={previewImage} alt={displayTitle} className="w-full h-full object-cover" />
          ) : (
                <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
              )}
              <div className={cn("absolute inset-0", "bg-black/60")} />
            </div>
            <div className="relative w-full flex items-center justify-center z-10">
              <h3 className={cn(
                "text-3xl font-extrabold text-white text-center uppercase tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]",
                "[text-shadow:_0_2px_8px_rgba(0,0,0,0.8),_0_0_2px_#000,0_0_8px_#000]"
              )}>
                {displayTitle}
              </h3>
            </div>
            {comingSoon && (
          <div className={cn(
                "absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
              )}>
                <div className={cn(
                  "px-4 py-2 bg-white/10 border border-white/30 rounded-xl shadow-lg"
                )}>
                  <span className="text-sm font-bold text-white animate-pulse">
                    {t('coming.soon')}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </Link>
        <div className="w-[20%]" />
      </div>
      {/* Desktop layout: icon absolutely positioned, card full width with left padding */}
      <div className="hidden md:block relative w-full">
        <div className="absolute -left-16 z-20 flex items-center justify-center w-20 h-20 rounded-2xl bg-black/60 backdrop-blur-md border-2 border-white/30 shadow-lg">
          {typeof icon === 'string' && icon.startsWith('/') ? (
            <img src={icon} alt={`${displayTitle} icon`} className="w-16 h-16 object-contain" />
          ) : (
            <span className="text-5xl">{icon}</span>
          )}
        </div>
        <Link
          to={isClickable ? linkPath : "#"}
          className={cn(
            "block w-full transition-all duration-300",
            !isClickable && "opacity-70 cursor-not-allowed",
            "group"
          )}
        >
          <Card className={cn(
            "relative h-28 flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 transition-all duration-300 pl-24",
            isClickable && [
              "hover:scale-[1.02]",
              "hover:shadow-xl",
              "hover:shadow-black/20",
              "hover:border-white/30"
            ]
          )}>
            <div className="absolute inset-0">
              {cardBackground ? (
                <img src={cardBackground} alt={`${displayTitle} background`} className="w-full h-full object-cover" />
              ) : previewImage ? (
                <img src={previewImage} alt={displayTitle} className="w-full h-full object-cover" />
            ) : (
                <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
              )}
              <div className={cn("absolute inset-0", "bg-black/60")} />
          </div>
            <div className="relative w-full flex items-center justify-center z-10">
            <h3 className={cn(
                "text-5xl font-extrabold text-white text-center uppercase tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]",
                "[text-shadow:_0_2px_8px_rgba(0,0,0,0.8),_0_0_2px_#000,0_0_8px_#000]"
            )}>
              {displayTitle}
            </h3>
          </div>
        {comingSoon && (
          <div className={cn(
                "absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
          )}>
            <div className={cn(
                  "px-4 py-2 bg-white/10 border border-white/30 rounded-xl shadow-lg"
            )}>
                  <span className="text-base font-bold text-white animate-pulse">
                {t('coming.soon')}
              </span>
            </div>
          </div>
        )}
      </Card>
    </Link>
      </div>
    </>
  );
};

export const GameModeCardButton: React.FC<{
  title: string;
  icon: string;
  onClick?: () => void;
  bgColor?: string;
  cardBackground?: string;
  previewImage?: string;
  className?: string;
}> = ({ title, icon, onClick, bgColor, cardBackground, previewImage, className }) => {
  const gradientColor = bgColor || "from-blue-500 to-blue-600";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 transition-all duration-300 h-20 md:h-24 px-4 md:px-8 group cursor-pointer",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 hover:border-white/30",
        className
      )}
      style={{ minWidth: 0 }}
    >
      <div className="absolute inset-0">
        {cardBackground ? (
          <img src={cardBackground} alt={`${title} background`} className="w-full h-full object-cover" />
        ) : previewImage ? (
          <img src={previewImage} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
        )}
        <div className={cn("absolute inset-0", "bg-black/60")} />
      </div>
      <div className="relative flex items-center gap-4 z-10 w-full justify-center">
        <span className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black/60 border-2 border-white/30 shadow-lg">
          {typeof icon === 'string' && icon.startsWith('/') ? (
            <img src={icon} alt={`${title} icon`} className="w-8 h-8 md:w-12 md:h-12 object-contain" />
          ) : (
            <span className="text-3xl md:text-4xl">{icon}</span>
          )}
        </span>
        <span className="text-2xl md:text-3xl font-extrabold text-white text-center uppercase tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] [text-shadow:_0_2px_8px_rgba(0,0,0,0.8),_0_0_2px_#000,0_0_8px_#000]">
          {title}
        </span>
      </div>
    </button>
  );
};

export default GameModeCard;
