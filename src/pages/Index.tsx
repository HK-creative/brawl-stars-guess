import React from 'react';
import GameModeCard from '@/components/GameModeCard';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { SparklesPreview } from '@/components/ui/sparkles-preview';
import { useStreak } from '@/contexts/StreakContext';
import AuthButton from '@/components/ui/auth-button';
import { Button } from '@/components/ui/button';
import { User, LogOut, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const gameModes = [
  {
    mode: "classic",
    descriptionKey: "mode.classic.description",
    icon: "/ClassicIcon.png",
    bgColor: "from-pink-500 to-pink-600",
    previewImage: "/images/modes/classic-preview.jpg",
    cardBackground: "/ClassicMode_Background.png",
    path: "/daily/classic"
  },
  {
    mode: "audio",
    descriptionKey: "mode.audio.description",
    icon: "/AudioIcon.png",
    bgColor: "from-orange-500 to-orange-600",
    previewImage: "/images/modes/audio-preview.jpg",
    cardBackground: "/AudioMode_Background.png",
    path: "/daily/audio"
  },
  {
    mode: "gadget",
    descriptionKey: "mode.gadget.description",
    icon: "/GadgetIcon.png",
    bgColor: "from-purple-500 to-purple-600",
    previewImage: "/images/modes/gadget-preview.jpg",
    cardBackground: "/GadgetMode_Background.png",
    path: "/daily/gadget"
  },
  {
    mode: "starpower",
    descriptionKey: "mode.starpower.description",
    icon: "/StarpowerIcon.png",
    bgColor: "from-yellow-500 to-yellow-600",
    previewImage: "/images/modes/starpower-preview.jpg",
    cardBackground: "/StarPowerMode_Background.png",
    path: "/daily/starpower"
  },
  {
    mode: "survival",
    descriptionKey: "mode.survival.description",
    icon: "/images/icons/heart-icon.png",
    bgColor: "from-red-500 to-red-600",
    previewImage: "/images/modes/survival-preview.jpg",
    cardBackground: "/SurvivalMode_Background.png",
    path: "/survival"
  }
];

const Index = () => {
  const { isLoggedIn, user, logout } = useStreak();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    await logout();
  };

  // Separate regular modes from survival
  const regularModes = gameModes.slice(0, 4);
  const survivalMode = gameModes[4];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Main content container */}
      <div className={cn(
        "flex-1 flex flex-col",
        "px-4 md:px-6",
        "pt-0",
        "pb-8 md:pb-12"
      )}>
        {/* Header Section with drastically reduced mobile spacing */}
        <div className={cn(
          "text-center",
          "-mt-12 md:-mt-16" // Drastically reduced mobile spacing - negative margin to pull it up
        )}>
          <SparklesPreview />
        </div>

        {/* Game Modes Section */}
        <div className={cn(
          "w-full max-w-lg mx-auto",
          "flex flex-col",
          "gap-4 md:gap-6" // Reduced mobile gap from 8 to 4
        )}>
          {/* Regular 4 game modes */}
          {regularModes.map((mode, index) => (
            <div key={mode.mode} className={cn(
              index === 0 ? "mt-0 md:mt-4" : "" // A bit more spacing above first (classic) card on PC only
            )}>
              <GameModeCard 
                mode={mode.mode}
                icon={mode.icon}
                bgColor={mode.bgColor}
                previewImage={mode.previewImage}
                cardBackground={mode.cardBackground}
                customPath={mode.path}
                enabled={true}
                comingSoon={false}
              />
            </div>
          ))}

          {/* Reduced separator spacing for mobile */}
          <div className="relative my-1 md:my-0 md:-mb-4">
            {/* Subtle background glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-2 bg-gradient-to-r from-amber-500/10 via-orange-500/20 to-red-500/10 rounded-full blur-sm" />
            </div>
            
            {/* Unified separator line design */}
            <div className="relative flex items-center justify-center">
              {/* Mobile: simplified design without circle, reduced opacity */}
              <div className="md:hidden w-full h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
              
              {/* PC: reduced opacity line without circle */}
              <div className="hidden md:block w-full h-1 bg-gradient-to-r from-transparent via-slate-400/30 to-transparent shadow-sm" />
            </div>
          </div>

          {/* Survival Mode with enhanced animated effects and reduced bottom spacing */}
          <div className="relative mb-2 md:mb-0">
            {/* Enhanced floating particles background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-4 left-8 w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute top-16 right-12 w-0.5 h-0.5 bg-orange-400 rounded-full opacity-50"></div>
              <div className="absolute bottom-8 left-16 w-1.5 h-1.5 bg-red-400 rounded-full opacity-40"></div>
              <div className="absolute bottom-12 right-8 w-0.5 h-0.5 bg-amber-300 rounded-full animate-pulse opacity-70"></div>
              <div className="absolute top-24 left-24 w-1 h-1 bg-orange-300 rounded-full opacity-55"></div>
              <div className="absolute top-8 right-20 w-0.5 h-0.5 bg-red-300 rounded-full opacity-65"></div>
              <div className="absolute bottom-4 left-12 w-1 h-1 bg-amber-500 rounded-full opacity-45"></div>
              <div className="absolute top-20 right-16 w-0.5 h-0.5 bg-orange-500 rounded-full animate-pulse opacity-60"></div>
            </div>

            {/* Enhanced multi-layer radial glows with breathing effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-96 h-96 rounded-full blur-3xl opacity-70"
                style={{
                  background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(245,158,11,0.10) 40%, rgba(249,115,22,0.08) 60%, transparent 100%)'
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-64 h-64 rounded-full blur-2xl opacity-60"
                style={{
                  background: 'radial-gradient(circle, rgba(245,158,11,0.20) 0%, rgba(249,115,22,0.12) 50%, transparent 100%)'
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-48 h-48 rounded-full blur-xl opacity-50"
                style={{
                  background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, rgba(234,88,12,0.15) 40%, transparent 70%)'
                }}
              />
            </div>
            
            {/* Survival Mode Card with enhanced positioning */}
            <div className="relative z-10">
              <GameModeCard 
                mode={survivalMode.mode}
                icon={survivalMode.icon}
                bgColor={survivalMode.bgColor}
                previewImage={survivalMode.previewImage}
                cardBackground={survivalMode.cardBackground}
                customPath={survivalMode.path}
                enabled={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
