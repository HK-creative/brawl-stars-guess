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
    description: "Guess today's mystery brawler",
    icon: "/ClassicIcon.png",
    bgColor: "from-pink-500 to-pink-600",
    previewImage: "/images/modes/classic-preview.jpg",
    cardBackground: "/ClassicMode_Background.png"
  },
  {
    mode: "audio",
    description: "Guess by brawler voice lines",
    icon: "/AudioIcon.png",
    bgColor: "from-orange-500 to-orange-600",
    previewImage: "/images/modes/audio-preview.jpg",
    cardBackground: "/AudioMode_Background.png"
  },
  {
    mode: "gadget",
    description: "Guess by gadget description",
    icon: "/GadgetIcon.png",
    bgColor: "from-purple-500 to-purple-600",
    previewImage: "/images/modes/gadget-preview.jpg",
    cardBackground: "/GadgetMode_Background.png"
  },
  {
    mode: "starpower",
    description: "Guess by star power description",
    icon: "/StarpowerIcon.png",
    bgColor: "from-yellow-500 to-yellow-600",
    previewImage: "/images/modes/starpower-preview.jpg",
    cardBackground: "/StarPowerMode_Background.png"
  },
  {
    mode: "survival",
    description: "Test your skills in hard mode",
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

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Top-left section for Auth or Profile - Made Fixed */}
      <div className={cn(
        "fixed top-4 left-4 z-50",
        "flex flex-col items-start gap-1.5"
      )}>
        {!isLoggedIn ? (
          <div className="flex flex-row gap-2">
            <AuthButton variant="outline" size="sm" className="text-xs py-1.5 bg-black/50 backdrop-blur-sm" hideSubtext={true} />
            <AuthButton showSignUp={true} variant="outline" size="sm" className="text-xs py-1.5 bg-black/50 backdrop-blur-sm" hideSubtext={true} />
          </div>
        ) : user && (
          <div className="flex flex-col items-start gap-1.5 w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleProfileClick}
              className="text-white hover:bg-white/10 flex items-center gap-2 w-full justify-start text-xs sm:text-sm px-2 py-1.5"
            >
              <User size={16} />
              <span>Profile/Settings</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-2 w-full justify-start text-xs sm:text-sm px-2 py-1.5"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main content container with adjusted spacing */}
      <div className={cn(
        "flex-1 flex flex-col",
        "px-4 md:px-6",
        "pt-0",
        "pb-8 md:pb-12"
      )}>
        {/* Header Section */}
        <div className={cn(
          "text-center",
          "mt-4"
        )}>
          <SparklesPreview />
        </div>

        {/* Game Modes Section - Increased mobile spacing */}
        <div className={cn(
          "w-full max-w-lg mx-auto",
          "flex flex-col",
          "gap-8 md:gap-6",
          "[&>*:not(:first-child)]:mt-4 md:[&>*:not(:first-child)]:mt-0"
        )}>
          {gameModes.map((mode, index) => (
            <div 
              key={mode.mode}
              className={cn(
                index > 0 && "mt-8 md:mt-0"
              )}
            >
              <GameModeCard 
                mode={mode.mode}
                icon={mode.icon}
                bgColor={mode.bgColor}
                previewImage={mode.previewImage}
                cardBackground={mode.cardBackground}
                customPath={mode.path}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
