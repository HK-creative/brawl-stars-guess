import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const displayTitle = title || (mode ? t(`mode.${mode}`) : '');
  const linkPath = customPath || path || (mode ? `/${mode}` : '#');
  const isClickable = !comingSoon && enabled;
  const gradientColor = bgColor || (mode && modeColors[mode]) || "from-blue-500 to-blue-600";

  // Ensure linkPath is valid
  const finalPath = isClickable && linkPath !== '#' ? linkPath : '#';

  // Manual navigation handler as backup
  const handleCardClick = (e: React.MouseEvent) => {
    if (isClickable && finalPath !== '#') {
      e.preventDefault();
      navigate(finalPath);
    }
  };

  // Survival Mode - CLEAN MOBILE & REVOLUTIONARY PC DESIGN
  if (mode === 'survival') {
    return (
      <>
        {/* Mobile layout for Survival Mode - Enhanced with animations */}
        <div className="w-full md:hidden">
          <Link 
            to={finalPath} 
            className={cn(
              "block transition-all duration-500 transform",
              !isClickable && "opacity-70 cursor-not-allowed",
              "group"
            )}
          >
            {/* Enhanced Mobile Card with breathing and particle effects */}
            <div className="relative">
              {/* Floating particles background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-2 left-4 w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-70"></div>
                <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-orange-400 rounded-full opacity-60"></div>
                <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-red-400 rounded-full opacity-50"></div>
                <div className="absolute bottom-4 right-4 w-0.5 h-0.5 bg-amber-300 rounded-full animate-pulse opacity-80"></div>
                <div className="absolute top-12 left-12 w-1 h-1 bg-orange-300 rounded-full opacity-60"></div>
                <div className="absolute top-4 right-12 w-0.5 h-0.5 bg-red-300 rounded-full opacity-70"></div>
              </div>

              {/* Breathing glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-60">
                <div className="w-full h-32 bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-red-500/20 rounded-xl blur-sm"></div>
              </div>

              {/* Main card with animated border */}
              <div 
                className="relative w-full h-32 mx-auto max-w-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 shadow-[0_8px_32px_rgba(245,158,11,0.25)] transition-all duration-500 group-hover:shadow-[0_12px_48px_rgba(245,158,11,0.6)] group-hover:scale-[1.02] overflow-hidden"
                style={{
                  clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)',
                  borderImage: 'linear-gradient(45deg, #f59e0b, #ea580c, #dc2626, #f59e0b) 1'
                }}
              >
                {/* Animated gradient border overlay */}
                <div className="absolute inset-0 p-0.5 rounded-xl overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'conic-gradient(from 0deg, #f59e0b, #ea580c, #dc2626, #f97316, #f59e0b)',
                      clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)'
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
                    style={{
                      clipPath: 'polygon(15px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px), 0% 15px)'
                    }}
                  ></div>
                </div>

                {/* Background Image with enhanced effects */}
                <div className="absolute inset-1 overflow-hidden">
                  <img 
                    src="/Survival_card_background.png" 
                    alt="Survival Background" 
                    className="w-full h-full object-cover opacity-50 transition-all duration-700 group-hover:scale-110 group-hover:opacity-70" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/70" />
                  
                  {/* Dynamic light rays */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-45 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 -rotate-45 animate-pulse delay-150"></div>
                    <div className="absolute top-1/2 left-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-90 animate-pulse delay-300"></div>
                  </div>
                </div>

                {/* Enhanced content with glow */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 uppercase tracking-wider mb-2 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse">
                    {t('home.survival.title')}
                  </h3>
                  
                  {/* Enhanced decorative line with animation */}
                  <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-3 opacity-80 animate-pulse relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-ping"></div>
                  </div>
                  
                  <p className="text-slate-300 text-xs font-medium leading-relaxed opacity-90">
                    {t('home.ultimate.challenge.mode')}
                  </p>
                </div>

                {/* Enhanced shine effect with multiple layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 translate-x-[-120%] group-hover:translate-x-[320%] transition-transform duration-1200 ease-out delay-100" />
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop layout for Survival Mode - ENHANCED HEXAGONAL DESIGN */}
        <div className="hidden md:block relative w-full">
          {/* Floating particles for desktop */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 left-8 w-2 h-2 bg-amber-400 rounded-full opacity-70"></div>
            <div className="absolute top-12 right-12 w-1 h-1 bg-orange-400 rounded-full opacity-60"></div>
            <div className="absolute bottom-8 left-16 w-3 h-3 bg-red-400 rounded-full opacity-50"></div>
            <div className="absolute bottom-4 right-8 w-1 h-1 bg-amber-300 rounded-full animate-pulse opacity-80"></div>
            <div className="absolute top-20 left-32 w-2 h-2 bg-orange-300 rounded-full opacity-60"></div>
            <div className="absolute top-8 right-24 w-1 h-1 bg-red-300 rounded-full opacity-70"></div>
            <div className="absolute bottom-12 left-24 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-65"></div>
            <div className="absolute top-16 left-48 w-1 h-1 bg-orange-500 rounded-full animate-pulse opacity-75"></div>
          </div>

          {/* Breathing glow effect for desktop */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-48 bg-gradient-to-r from-amber-500/15 via-orange-500/25 to-red-500/15 rounded-3xl blur-xl opacity-80"></div>
          </div>

          <Link 
            to={finalPath} 
            className={cn(
              "block w-full transition-all duration-300",
              !isClickable && "opacity-70 cursor-not-allowed",
              "group"
            )}
            style={{ minWidth: 0 }}
          >
            {/* Enhanced Large Hexagonal Gaming Card */}
            <div className="relative w-full h-48 transition-all duration-500 group-hover:scale-[1.02] mx-auto max-w-5xl">
              
              {/* Animated outer glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div 
                  className="w-full h-full animate-pulse"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.3) 0%, rgba(249,115,22,0.2) 40%, transparent 70%)',
                    clipPath: 'polygon(42px 0%, calc(100% - 42px) 0%, 100% 42px, 100% calc(100% - 42px), calc(100% - 42px) 100%, 42px 100%, 0% calc(100% - 42px), 0% 42px)'
                  }}
                ></div>
              </div>

              {/* Main container with animated border */}
              <div className="relative w-full h-full overflow-hidden">
                {/* Rotating gradient border */}
                <div 
                  className="absolute inset-0 p-1 opacity-80"
                  style={{
                    background: 'conic-gradient(from 0deg, #f59e0b, #ea580c, #dc2626, #f97316, #f59e0b, #ea580c)',
                    clipPath: 'polygon(40px 0%, calc(100% - 40px) 0%, 100% 40px, 100% calc(100% - 40px), calc(100% - 40px) 100%, 40px 100%, 0% calc(100% - 40px), 0% 40px)'
                  }}
                ></div>

                {/* Inner card */}
                <div 
                  className="absolute inset-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-[0_16px_64px_rgba(245,158,11,0.5)] transition-all duration-500 group-hover:shadow-[0_24px_80px_rgba(245,158,11,0.8)] overflow-hidden"
                  style={{
                    clipPath: 'polygon(39px 0%, calc(100% - 39px) 0%, 100% 39px, 100% calc(100% - 39px), calc(100% - 39px) 100%, 39px 100%, 0% calc(100% - 39px), 0% 39px)'
                  }}
                >
                  
                  {/* Enhanced Background with multiple layers */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img 
                      src="/Survival_card_background.png" 
                      alt="Survival Background" 
                      className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/70" />
                    
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/20 to-red-500/10 animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-amber-400/5 to-transparent animate-pulse delay-300"></div>
                    </div>

                    {/* Dynamic light rays for desktop */}
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute top-1/2 left-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-45 animate-pulse"></div>
                      <div className="absolute top-1/2 left-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 -rotate-45 animate-pulse delay-150"></div>
                      <div className="absolute top-1/2 left-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-90 animate-pulse delay-300"></div>
                      <div className="absolute top-1/2 left-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-450"></div>
                    </div>
                  </div>

                  {/* Enhanced centered content */}
                  <div className="relative z-10 h-full flex items-center justify-center px-16">
                    <div className="text-center">
                      <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 uppercase tracking-wider mb-6 drop-shadow-[0_0_40px_rgba(245,158,11,1)] animate-pulse">
                        {t('home.survival.title')}
                      </h3>
                      
                      {/* Enhanced angular decorative elements */}
                      <div className="flex items-center justify-center space-x-4 mb-6">
                        <div className="w-8 h-0.5 bg-amber-400 transform -skew-x-12 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                        <div className="w-4 h-4 bg-amber-400 transform rotate-45 animate-spin-slow shadow-[0_0_15px_rgba(245,158,11,1)]" />
                        <div className="w-8 h-0.5 bg-amber-400 transform skew-x-12 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                      </div>
                      
                      <p className="text-slate-300 text-lg font-medium opacity-90 max-w-2xl drop-shadow-lg">
                        {t('home.ultimate.challenge.mode')}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced multi-layer shine effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent transform -skew-x-45 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-45 translate-x-[-120%] group-hover:translate-x-[320%] transition-transform duration-1200 ease-out delay-100" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/25 to-transparent transform -skew-x-30 translate-x-[-140%] group-hover:translate-x-[340%] transition-transform duration-1400 ease-out delay-200" />
                </div>
              </div>

              {/* Enhanced Coming Soon Overlay */}
              {comingSoon && (
                <div 
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-md"
                  style={{
                    clipPath: 'polygon(40px 0%, calc(100% - 40px) 0%, 100% 40px, 100% calc(100% - 40px), calc(100% - 40px) 100%, 40px 100%, 0% calc(100% - 40px), 0% 40px)'
                  }}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-red-600 border-2 border-amber-300/50 shadow-[0_0_40px_rgba(245,158,11,1.0)] mb-6 transform rotate-45 animate-pulse">
                      <span className="text-3xl transform -rotate-45">🔒</span>
                    </div>
                    <span className="text-xl font-bold text-amber-100 uppercase tracking-wider animate-pulse">
                      {t('coming.soon')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
      </>
    );
  }

  // Default design for all other modes (unchanged)
  return (
    <>
      {/* Mobile layout: flex row, icon 20%, card 70% (increased from 60%), spacing 10% */}
      <div className="w-full flex flex-row items-center md:hidden">
        <div className="flex items-center justify-center w-[20%] h-16" style={{ minWidth: '56px', maxWidth: '80px' }}>
          {typeof icon === 'string' && icon.startsWith('/') ? (
            <img src={icon} alt={`${displayTitle} icon`} className="w-14 h-14 object-contain" />
          ) : (
            <span className="text-4xl">{icon}</span>
          )}
        </div>
        
        {/* Add backup click handler for starpower mode */}
        {mode === 'starpower' ? (
          <div 
            className={cn(
              "w-[70%] ml-2 transition-all duration-300 cursor-pointer",
              !isClickable && "opacity-70 cursor-not-allowed",
              "group"
            )}
            onClick={handleCardClick}
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
                  <img src={cardBackground} alt={`${displayTitle} background`} className="w-full h-full object-cover" />
                ) : previewImage ? (
                  <img src={previewImage} alt={displayTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
                )}
                <div className={cn(
                  "absolute inset-0 transition-all duration-300",
                  "backdrop-blur-sm bg-white/20 border-white/10 group-hover:backdrop-blur-none group-hover:bg-white/10"
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
          </div>
        ) : (
          <Link 
            to={finalPath} 
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
                  <img src={cardBackground} alt={`${displayTitle} background`} className="w-full h-full object-cover" />
                ) : previewImage ? (
                  <img src={previewImage} alt={displayTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
                )}
                <div className={cn(
                  "absolute inset-0 transition-all duration-300",
                  "backdrop-blur-sm bg-white/20 border-white/10 group-hover:backdrop-blur-none group-hover:bg-white/10"
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
        )}
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
        
        {/* Add backup click handler for starpower mode on desktop */}
        {mode === 'starpower' ? (
          <div
            className={cn(
              "block w-full transition-all duration-300 cursor-pointer",
              !isClickable && "opacity-70 cursor-not-allowed",
              "group"
            )}
            onClick={handleCardClick}
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
                  <img src={cardBackground} alt={`${displayTitle} background`} className="w-full h-full object-cover" />
                ) : previewImage ? (
                  <img src={previewImage} alt={displayTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
                )}
                <div className={cn(
                  "absolute inset-0 transition-all duration-300",
                  "backdrop-blur-sm bg-white/20 border-white/10 group-hover:backdrop-blur-none group-hover:bg-white/10"
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
          </div>
        ) : (
          <Link
            to={finalPath} 
            className={cn(
              "block w-full transition-all duration-300",
              !isClickable && "opacity-70 cursor-not-allowed",
              "group"
            )}
            style={{ minWidth: 0 }}
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
                  <img src={cardBackground} alt={`${displayTitle} background`} className="w-full h-full object-cover" />
                ) : previewImage ? (
                  <img src={previewImage} alt={displayTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className={cn("w-full h-full", "bg-gradient-to-br", gradientColor)} />
                )}
                <div className={cn(
                  "absolute inset-0 transition-all duration-300",
                  "backdrop-blur-sm bg-white/20 border-white/10 group-hover:backdrop-blur-none group-hover:bg-white/10"
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
        )}
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
