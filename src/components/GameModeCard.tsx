import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getLanguage } from '@/lib/i18n';
import { StarBorder } from '@/components/ui/star-border';

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
  const linkPath = customPath || path || (mode
    ? (["classic", "gadget", "starpower", "audio", "pixels"].includes(mode)
        ? `/daily?mode=${mode}`
        : `/${mode}`)
    : '#');
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

  // Survival Mode - ENHANCED COOL DESIGN WITH CUSTOM STAR BORDER
  if (mode === 'survival') {
    return (
      <>
        {/* Mobile layout for Survival Mode - Enhanced with custom star border */}
        <div className="w-full md:hidden">
          <Link 
            to={finalPath} 
            className={cn(
              "block transition-all duration-300 transform",
              !isClickable && "opacity-70 cursor-not-allowed",
              "group"
            )}
          >
            {/* Enhanced Mobile Card with custom star border animation */}
            <div className="relative">
              {/* Subtle glowing floating effect behind card */}
              <div className="absolute inset-0 -z-10">
                {/* Main floating glow */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-red-500/20 rounded-xl blur-xl animate-pulse"
                  style={{ 
                    animationDuration: '4s',
                    clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)'
                  }}
                />
                {/* Secondary floating glow */}
                <div 
                  className="absolute inset-2 bg-gradient-to-br from-amber-400/15 via-orange-400/25 to-red-400/15 rounded-lg blur-lg animate-pulse"
                  style={{ 
                    animationDuration: '3s',
                    animationDelay: '1s'
                  }}
                />
                {/* Tertiary subtle glow */}
                <div 
                  className="absolute inset-1 bg-gradient-to-tr from-amber-300/10 via-orange-300/20 to-red-300/10 rounded-lg blur-md animate-pulse"
                  style={{ 
                    animationDuration: '5s',
                    animationDelay: '2s'
                  }}
                />
              </div>

              {/* Floating sparkles animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-3 left-6 w-1 h-1 bg-amber-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-8 right-8 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-6 left-10 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-4 right-6 w-0.5 h-0.5 bg-amber-300 rounded-full animate-ping opacity-70" style={{ animationDelay: '0.5s' }}></div>
              </div>

              {/* Hexagonal moving lines outline effect with trail - Mobile */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                {/* First comet - Main moving line */}
                <div 
                  className="absolute w-4 h-0.5 bg-amber-400 rounded-full"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 12px rgba(245, 158, 11, 1)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                {/* First comet trail lines */}
                <div 
                  className="absolute w-3 h-0.5 bg-amber-400 rounded-full opacity-70"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-0.15s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 8px rgba(245, 158, 11, 0.7)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-2 h-0.5 bg-amber-400 rounded-full opacity-50"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-0.3s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 6px rgba(245, 158, 11, 0.5)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-1.5 h-0.5 bg-amber-400 rounded-full opacity-30"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-0.45s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 4px rgba(245, 158, 11, 0.3)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-1 h-0.5 bg-amber-400 rounded-full opacity-15"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-0.6s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 2px rgba(245, 158, 11, 0.15)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />

                {/* Second comet - 50% offset (opposite side) */}
                <div 
                  className="absolute w-4 h-0.5 bg-orange-400 rounded-full"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-3s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 12px rgba(251, 146, 60, 1)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                {/* Second comet trail lines */}
                <div 
                  className="absolute w-3 h-0.5 bg-orange-400 rounded-full opacity-70"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-3.15s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 8px rgba(251, 146, 60, 0.7)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-2 h-0.5 bg-orange-400 rounded-full opacity-50"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-3.3s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 6px rgba(251, 146, 60, 0.5)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-1.5 h-0.5 bg-orange-400 rounded-full opacity-30"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-3.45s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 4px rgba(251, 146, 60, 0.3)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-1 h-0.5 bg-orange-400 rounded-full opacity-15"
                  style={{
                    animation: 'moveHexagonOutline 6s ease-in-out infinite',
                    animationDelay: '-3.6s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 2px rgba(251, 146, 60, 0.15)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>

              {/* Subtle edge glow effect - Mobile */}
              <div 
                className="absolute animate-pulse z-0"
                style={{
                  left: '-4px',
                  right: '-4px',
                  top: '-4px',
                  bottom: '-4px',
                  background: 'linear-gradient(45deg, rgba(245, 158, 11, 0.6), rgba(251, 146, 60, 0.4), rgba(239, 68, 68, 0.6))',
                  clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)',
                  filter: 'blur(4px)',
                  animationDuration: '3s'
                }}
              />
              
              {/* Additional outer glow - Mobile */}
              <div 
                className="absolute animate-pulse z-0"
                style={{
                  left: '-8px',
                  right: '-8px',
                  top: '-8px',
                  bottom: '-8px',
                  background: 'radial-gradient(ellipse, rgba(245, 158, 11, 0.3) 0%, rgba(251, 146, 60, 0.2) 50%, transparent 70%)',
                  clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)',
                  filter: 'blur(8px)',
                  animationDuration: '4s',
                  animationDelay: '1s'
                }}
              />

              {/* Main card content */}
              <div 
                className="relative w-full h-28 mx-auto max-w-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/70 shadow-lg shadow-amber-500/30 transition-all duration-500 group-hover:scale-[1.03] overflow-hidden"
                style={{
                  clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)'
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 overflow-hidden"
                    style={{
                       clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)'
                     }}>
                  <img 
                    src="/Survival_card_background.png" 
                    alt="Survival Background" 
                    className="w-full h-full object-cover opacity-70" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/50" />
                  
                  {/* Subtle moving light effect */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/2 left-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-45 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 -rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>

                {/* Enhanced content with larger text */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 uppercase tracking-wide mb-1 drop-shadow-lg animate-pulse" style={{ animationDuration: '2.5s' }}>
                    {t('home.survival.title')}
                  </h3>
                  <p className="text-slate-300 text-xs font-medium opacity-90">
                    {t('home.ultimate.challenge.mode')}
                  </p>
                </div>

                {/* Enhanced shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent transform -skew-x-12 translate-x-[-100%]" />
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop layout for Survival Mode - DRAMATICALLY IMPROVED WITH CUSTOM STAR BORDER */}
        <div className="hidden md:block relative w-full">
          {/* Subtle glowing floating effect behind desktop card */}
          <div className="absolute inset-0 -z-10">
            {/* Main floating glow */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-orange-500/25 to-red-500/15 rounded-2xl blur-2xl animate-pulse"
              style={{ 
                animationDuration: '5s',
                clipPath: 'polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)'
              }}
            />
            {/* Secondary floating glow */}
            <div 
              className="absolute inset-4 bg-gradient-to-br from-amber-400/12 via-orange-400/20 to-red-400/12 rounded-xl blur-xl animate-pulse"
              style={{ 
                animationDuration: '4s',
                animationDelay: '1.5s'
              }}
            />
            {/* Tertiary subtle glow */}
            <div 
              className="absolute inset-2 bg-gradient-to-tr from-amber-300/8 via-orange-300/15 to-red-300/8 rounded-xl blur-lg animate-pulse"
              style={{ 
                animationDuration: '6s',
                animationDelay: '3s'
              }}
            />
            {/* Quaternary ultra-subtle glow */}
            <div 
              className="absolute inset-6 bg-gradient-to-r from-amber-200/5 via-orange-200/10 to-red-200/5 rounded-lg blur-md animate-pulse"
              style={{ 
                animationDuration: '7s',
                animationDelay: '0.5s'
              }}
            />
          </div>

          {/* Enhanced floating sparkles for desktop */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-6 left-16 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-4 right-20 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-8 left-24 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '3s' }}></div>
            <div className="absolute bottom-6 right-16 w-1 h-1 bg-amber-300 rounded-full animate-ping opacity-80" style={{ animationDelay: '0.8s' }}></div>
            <div className="absolute top-16 left-40 w-2 h-2 bg-orange-300 rounded-full animate-ping opacity-65" style={{ animationDelay: '2.2s' }}></div>
            <div className="absolute top-8 right-32 w-1.5 h-1.5 bg-red-300 rounded-full animate-ping opacity-55" style={{ animationDelay: '4s' }}></div>
          </div>

          <Link 
            to={finalPath} 
            className={cn(
              "block w-full transition-all duration-300 relative",
              !isClickable && "opacity-70 cursor-not-allowed",
              "group"
            )}
            style={{ minWidth: 0 }}
          >
            {/* DRAMATICALLY IMPROVED Desktop Card */}
            <div className="relative w-full h-full transition-all duration-500 group-hover:scale-[1.03]">
              {/* Hexagonal moving lines outline effect with trail - Desktop */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                {/* First comet - Main moving line */}
                <div 
                  className="absolute w-6 h-1 bg-amber-400 rounded-full"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 16px rgba(245, 158, 11, 1)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                {/* First comet trail lines */}
                <div 
                  className="absolute w-5 h-1 bg-amber-400 rounded-full opacity-70"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-0.2s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 12px rgba(245, 158, 11, 0.7)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-4 h-1 bg-amber-400 rounded-full opacity-50"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-0.4s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-3 h-1 bg-amber-400 rounded-full opacity-30"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-0.6s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-2 h-1 bg-amber-400 rounded-full opacity-15"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-0.8s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 6px rgba(245, 158, 11, 0.15)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-10"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-1s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 4px rgba(245, 158, 11, 0.1)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />

                {/* Second comet - 50% offset (opposite side) */}
                <div 
                  className="absolute w-6 h-1 bg-orange-400 rounded-full"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-4s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 16px rgba(251, 146, 60, 1)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                {/* Second comet trail lines */}
                <div 
                  className="absolute w-5 h-1 bg-orange-400 rounded-full opacity-70"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-4.2s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 12px rgba(251, 146, 60, 0.7)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-4 h-1 bg-orange-400 rounded-full opacity-50"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-4.4s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 10px rgba(251, 146, 60, 0.5)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-3 h-1 bg-orange-400 rounded-full opacity-30"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-4.6s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 8px rgba(251, 146, 60, 0.3)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-2 h-1 bg-orange-400 rounded-full opacity-15"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-4.8s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 6px rgba(251, 146, 60, 0.15)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-10"
                  style={{
                    animation: 'moveHexagonOutlineDesktop 8s ease-in-out infinite',
                    animationDelay: '-5s',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 4px rgba(251, 146, 60, 0.1)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>

              {/* Subtle edge glow effect - Desktop */}
              <div 
                className="absolute animate-pulse z-0"
                style={{
                  left: '-8px',
                  right: '-8px',
                  top: '-8px',
                  bottom: '-8px',
                  background: 'linear-gradient(45deg, rgba(245, 158, 11, 0.5), rgba(251, 146, 60, 0.3), rgba(239, 68, 68, 0.5))',
                  clipPath: 'polygon(24px 0%, calc(100% - 24px) 0%, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0% calc(100% - 24px), 0% 24px)',
                  filter: 'blur(6px)',
                  animationDuration: '4s'
                }}
              />
              
              {/* Additional outer glow - Desktop */}
              <div 
                className="absolute animate-pulse z-0"
                style={{
                  left: '-16px',
                  right: '-16px',
                  top: '-16px',
                  bottom: '-16px',
                  background: 'radial-gradient(ellipse, rgba(245, 158, 11, 0.25) 0%, rgba(251, 146, 60, 0.15) 50%, transparent 70%)',
                  clipPath: 'polygon(24px 0%, calc(100% - 24px) 0%, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0% calc(100% - 24px), 0% 24px)',
                  filter: 'blur(12px)',
                  animationDuration: '5s',
                  animationDelay: '1.5s'
                }}
              />

              {/* Enhanced inner card with better hexagonal shape */}
              <div 
                className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/70 shadow-2xl shadow-amber-500/50 overflow-hidden"
                style={{
                  clipPath: 'polygon(24px 0%, calc(100% - 24px) 0%, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0% calc(100% - 24px), 0% 24px)'
                }}
              >
                {/* Enhanced background with multiple layers */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img 
                      src="/Survival_card_background.png" 
                      alt="Survival Background" 
                    className="w-full h-full object-cover opacity-80" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/60" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 via-transparent to-red-900/20" />
                  
                  {/* Enhanced animated light rays */}
                  <div className="absolute inset-0 opacity-50">
                    <div className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-45 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 w-36 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 -rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-90 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>

                  {/* Corner accent lights */}
                  <div className="absolute top-4 left-4 w-3 h-3 bg-amber-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute top-4 right-4 w-2 h-2 bg-orange-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                  <div className="absolute bottom-4 left-4 w-2.5 h-2.5 bg-red-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '3s' }}></div>
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-amber-300 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* DRAMATICALLY enhanced content with much larger text */}
                <div className="relative z-10 h-full flex items-center justify-center">
                    <div className="text-center">
                    <h3 className={cn(
                          getLanguage() === 'he' ? 'survival-card-title text-4xl' : 'text-6xl',
                          'font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 uppercase tracking-wider mb-3 drop-shadow-2xl animate-pulse'
                        )} 
                        style={{ 
                          animationDuration: '3s',
                          textShadow: '0 0 30px rgba(245, 158, 11, 0.8), 0 0 60px rgba(245, 158, 11, 0.4)'
                        }}>
                        {t('home.survival.title')}
                      </h3>
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-0.5 bg-amber-400 animate-pulse"></div>
                      <div className="w-3 h-3 bg-amber-400 mx-3 rotate-45 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-8 h-0.5 bg-amber-400 animate-pulse"></div>
                      </div>
                    <p className="text-slate-200 text-base font-semibold opacity-95 animate-pulse tracking-wide" 
                       style={{ animationDelay: '1s', animationDuration: '4s' }}>
                        {t('home.ultimate.challenge.mode')}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced multi-layer shine effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent transform -skew-x-12 translate-x-[-100%]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform skew-x-12 translate-x-[-120%]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/20 to-transparent transform -skew-x-6 translate-x-[-140%]" />
              </div>
            </div>
          </Link>
        </div>
      </>
    );
  }

  // Regular Game Mode Layout
  return (
    <div className="w-full">
      {/* Mobile layout: Icon on left, card on right */}
      <div className="flex items-center md:hidden">
        <div className={cn(
          "flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl mr-4",
          "backdrop-blur-md border-2 shadow-lg transition-all duration-300",
          'bg-black/40 border-white/20 shadow-black/40'
        )}>
          {typeof icon === 'string' && icon.startsWith('/') ? (
            <img src={icon} alt={`${displayTitle} icon`} className="w-12 h-12 object-contain" />
          ) : (
            <span className="text-3xl">{icon}</span>
          )}
        </div>
        
        {/* Use div instead of Link for starpower mode to prevent navigation issues */}
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
              "relative h-20 flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300",
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
                  "text-2xl font-extrabold text-white text-center uppercase tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]",
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
              "relative h-20 flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300",
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
                  "text-2xl font-extrabold text-white text-center uppercase tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]",
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
          "absolute -left-16 z-20 flex items-center justify-center w-18 h-18 rounded-2xl",
          "backdrop-blur-md border-2 shadow-lg transition-all duration-300",
          'bg-black/40 border-white/20 shadow-black/40'
        )}>
          {typeof icon === 'string' && icon.startsWith('/') ? (
            <img src={icon} alt={`${displayTitle} icon`} className="w-14 h-14 object-contain" />
          ) : (
            <span className="text-4xl">{icon}</span>
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
              "relative h-24 flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300 pl-20",
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
                      "text-4xl font-extrabold text-center uppercase tracking-wide",
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
              "relative h-24 flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300 pl-20",
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
                      "text-4xl font-extrabold text-center uppercase tracking-wide",
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
    </div>
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
  const currentLanguage = getLanguage();
  
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
      <div className={cn(
        "relative flex items-center gap-4 z-10 w-full justify-center",
        currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
      )}>
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
