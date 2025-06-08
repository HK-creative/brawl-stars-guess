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
          "-mt-12 md:-mt-16"
        )}>
          <SparklesPreview />
        </div>

        {/* Game Modes Section */}
        <div className={cn(
          "w-full max-w-lg md:max-w-md mx-auto",
          "flex flex-col",
          "gap-4 md:gap-6"
        )}>
          {/* Regular 4 game modes */}
          {regularModes.map((mode, index) => (
            <div key={mode.mode} className={cn(
              index === 0 ? "mt-0 md:mt-4" : ""
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
              {/* Mobile: simplified design */}
              <div className="md:hidden w-full h-px bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />
              
              {/* PC: slightly more prominent */}
              <div className="hidden md:block w-full h-0.5 bg-gradient-to-r from-transparent via-slate-400/50 to-transparent" />
            </div>
          </div>

          {/* Survival Mode with reduced effects and spacing */}
          <div className="relative mb-2 md:mb-0">
            {/* Simplified background glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-64 h-64 md:w-80 md:h-80 rounded-full blur-2xl opacity-40"
                style={{
                  background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, rgba(245,158,11,0.08) 40%, transparent 70%)'
                }}
              />
            </div>
            
            {/* Survival Mode Card */}
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
