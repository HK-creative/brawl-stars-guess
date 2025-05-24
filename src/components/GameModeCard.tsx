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
  survival: "from-red-600 via-amber-600 to-amber-400",
};

export const modeIcons: Record<string, string> = {
  classic: "/ClassicIcon.png",
  endless: "/EndlessIcon.png",
  audio: "/AudioIcon.png",
  gadget: "/GadgetIcon.png",
  starpower: "/StarpowerIcon.png",
  survival: "/images/icons/flame-icon.png",
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
  survival: "Survival Mode",
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

  // Survival Mode - CLEAN MOBILE & REVOLUTIONARY PC DESIGN
  if (mode === 'survival') {
    return (
      <>
        {/* Mobile layout for Survival Mode - Clean Centered Design with Hexagonal Shape */}
        <div className="w-full md:hidden">
          <Link 
            to={isClickable ? linkPath : "#"} 
            className={cn(
              "block transition-all duration-500 transform",
              !isClickable && "opacity-70 cursor-not-allowed",
              "group"
            )}
          >
            {/* Clean Centered Card for Mobile with Hexagonal Shape */}
            <div 
              className="relative w-full h-32 mx-auto max-w-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/40 shadow-[0_8px_32px_rgba(245,158,11,0.25)] transition-all duration-500 group-hover:border-amber-400/60 group-hover:shadow-[0_12px_48px_rgba(245,158,11,0.4)] group-hover:scale-[1.02] overflow-hidden"
              style={{
                clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)'
              }}
            >

              {/* Background Image */}
              <div className="absolute inset-0.5 overflow-hidden">
                <img 
                  src="/Survival_card_background.png" 
                  alt="Survival Background" 
                  className="w-full h-full object-cover opacity-50 transition-all duration-700 group-hover:scale-105 group-hover:opacity-70" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/70" />
              </div>

              {/* Centered Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 uppercase tracking-wider [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] mb-2">
                  SURVIVAL
                </h3>
                
                {/* Decorative Line (like below Brawldle) */}
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-3 opacity-80" />
                
                <p className="text-slate-300 text-xs font-medium leading-relaxed opacity-90">
                  Test your skills in the ultimate challenge
                </p>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
            </div>
          </Link>
        </div>

        {/* Desktop layout for Survival Mode - MINIMAL HEXAGONAL DESIGN */}
        <div className="hidden md:block relative w-full">
          {/* Extra spacing and visual separation */}
          <div className="py-6">
            <Link
              to={isClickable ? linkPath : "#"}
              className={cn(
                "block transition-all duration-500",
                !isClickable && "opacity-70 cursor-not-allowed",
                "group"
              )}
            >
              {/* Large Separated Hexagonal Gaming Card - Increased Size */}
              <div className="relative w-full h-48 transition-all duration-500 group-hover:scale-[1.02] mx-auto max-w-5xl">
                
                {/* Large Hexagonal Shape Container */}
                <div 
                  className="relative w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/50 shadow-[0_16px_64px_rgba(245,158,11,0.5)] transition-all duration-500 group-hover:border-amber-400/70 group-hover:shadow-[0_24px_80px_rgba(245,158,11,0.7)] overflow-hidden"
                  style={{
                    clipPath: 'polygon(40px 0%, calc(100% - 40px) 0%, 100% 40px, 100% calc(100% - 40px), calc(100% - 40px) 100%, 40px 100%, 0% calc(100% - 40px), 0% 40px)'
                  }}
                >
                  
                  {/* Background Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img 
                      src="/Survival_card_background.png" 
                      alt="Survival Background" 
                      className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/70" />
                  </div>

                  {/* Centered Content */}
                  <div className="relative z-10 h-full flex items-center justify-center px-16">
                    <div className="text-center">
                      <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 uppercase tracking-wider [text-shadow:_0_8px_32px_rgba(0,0,0,0.8)] mb-6">
                        SURVIVAL
                      </h3>
                      
                      {/* Angular decorative elements */}
                      <div className="flex items-center justify-center space-x-4 mb-6">
                        <div className="w-8 h-0.5 bg-amber-400 transform -skew-x-12" />
                        <div className="w-4 h-4 bg-amber-400 transform rotate-45" />
                        <div className="w-8 h-0.5 bg-amber-400 transform skew-x-12" />
                      </div>
                      
                      <p className="text-slate-300 text-lg font-medium opacity-90 max-w-2xl">
                        Ultimate Challenge Mode
                      </p>
                    </div>
                  </div>

                  {/* Angular shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent transform -skew-x-45 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                </div>

                {/* Coming Soon Overlay with Large Hexagonal Shape */}
                {comingSoon && (
                  <div 
                    className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-md"
                    style={{
                      clipPath: 'polygon(40px 0%, calc(100% - 40px) 0%, 100% 40px, 100% calc(100% - 40px), calc(100% - 40px) 100%, 40px 100%, 0% calc(100% - 40px), 0% 40px)'
                    }}
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-red-600 border-2 border-amber-300/50 shadow-[0_0_40px_rgba(245,158,11,1.0)] mb-6 transform rotate-45">
                        <span className="text-3xl transform -rotate-45">🔒</span>
                      </div>
                      <span className="text-xl font-bold text-amber-100 uppercase tracking-wider">
                        {t('coming.soon')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Default design for all other modes (unchanged)
  return (
    <>
      {/* Mobile layout: flex row, icon 20%, card 70% (increased from 60%), spacing 10% */}
      <div className="w-full flex flex-row items-center md:hidden">
        <div className="flex items-center justify-center w-[20%] h-16 rounded-3xl bg-black/40 backdrop-blur-md border-2 border-white/20 shadow-lg" style={{ minWidth: '56px', maxWidth: '80px' }}>
          {typeof icon === 'string' && icon.startsWith('/') ? (
            <img src={icon} alt={`${displayTitle} icon`} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-3xl">{icon}</span>
          )}
        </div>
    <Link 
      to={isClickable ? linkPath : "#"} 
      className={cn(
            "w-[70%] ml-2 transition-all duration-300",
        !isClickable && "opacity-70 cursor-not-allowed",
        "group"
      )}
          style={{ minWidth: 0 }}
    >
      <Card className={cn(
            "relative h-24 flex items-center justify-center overflow-hidden rounded-3xl transition-all duration-300",
        'border border-white/30 bg-black/20 backdrop-blur-lg shadow-xl shadow-black/40',
        isClickable && [
          "hover:scale-[1.02]",
          "hover:shadow-2xl",
          "hover:shadow-black/50",
          "hover:border-white/40",
          "hover:bg-black/30"
        ]
      )}>
        <div className="absolute inset-0">
          {cardBackground ? (
                <img src={cardBackground} alt={`${displayTitle} background`} className="w-full h-full object-cover opacity-60" />
          ) : previewImage ? (
                <img src={previewImage} alt={displayTitle} className="w-full h-full object-cover opacity-60" />
          ) : (
                <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
              )}
              <div className={cn(
                "absolute inset-0 transition-all duration-300",
                "bg-gradient-to-r from-black/50 via-black/30 to-black/50 group-hover:from-black/40 group-hover:via-black/20 group-hover:to-black/40"
              )} />
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
        <div className="w-[10%]" />
      </div>
      {/* Desktop layout: icon absolutely positioned, card full width with left padding */}
      <div className="hidden md:block relative w-full">
        <div className={cn(
          "absolute -left-16 z-20 flex items-center justify-center w-20 h-20 rounded-3xl",
          "backdrop-blur-md border-2 shadow-xl transition-all duration-300",
          'bg-black/40 border-white/20 shadow-black/40'
        )}>
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
            "relative h-28 flex items-center justify-center overflow-hidden rounded-3xl transition-all duration-300 pl-24",
            'border border-white/30 bg-black/20 backdrop-blur-lg shadow-xl shadow-black/40',
            isClickable && [
              "hover:scale-[1.02]",
              "hover:shadow-2xl",
              "hover:shadow-black/50",
              "hover:border-white/40",
              "hover:bg-black/30"
            ]
          )}>
            <div className="absolute inset-0">
              {cardBackground ? (
                <img src={cardBackground} alt={`${displayTitle} background`} className="w-full h-full object-cover opacity-60" />
              ) : previewImage ? (
                <img src={previewImage} alt={displayTitle} className="w-full h-full object-cover opacity-60" />
            ) : (
                <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
              )}
              <div className={cn(
                "absolute inset-0 transition-all duration-300",
                "bg-gradient-to-r from-black/50 via-black/30 to-black/50 group-hover:from-black/40 group-hover:via-black/20 group-hover:to-black/40"
              )} />
          </div>
            <div className="relative w-full flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <h3 className={cn(
                    "text-5xl font-extrabold text-center uppercase tracking-wide",
                    "drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]",
                    "[text-shadow:_0_2px_8px_rgba(0,0,0,0.8),_0_0_2px_#000,0_0_8px_#000]",
                    'text-white'
                  )}>
                    {displayTitle}
                  </h3>
                </div>
              </div>
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
        <div className={cn(
          "absolute inset-0 transition-all duration-300",
          "bg-black/70 group-hover:bg-black/50"
        )} />
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
