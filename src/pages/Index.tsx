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
    cardBackground: "/ClassicMode_Background.png",
    path: "/daily/classic"
  },
  {
    mode: "audio",
    description: "Guess by brawler voice lines",
    icon: "/AudioIcon.png",
    bgColor: "from-orange-500 to-orange-600",
    previewImage: "/images/modes/audio-preview.jpg",
    cardBackground: "/AudioMode_Background.png",
    path: "/daily/audio"
  },
  {
    mode: "gadget",
    description: "Guess by gadget description",
    icon: "/GadgetIcon.png",
    bgColor: "from-purple-500 to-purple-600",
    previewImage: "/images/modes/gadget-preview.jpg",
    cardBackground: "/GadgetMode_Background.png",
    path: "/daily/gadget"
  },
  {
    mode: "starpower",
    description: "Guess by star power description",
    icon: "/StarpowerIcon.png",
    bgColor: "from-yellow-500 to-yellow-600",
    previewImage: "/images/modes/starpower-preview.jpg",
    cardBackground: "/StarPowerMode_Background.png",
    path: "/daily/starpower"
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
        {/* Auth Section - Positioned in document flow, scrolls with content */}
        <div className="absolute -top-1 left-4 md:-top-16 md:left-1/2 md:translate-x-96 z-50">
        {!isLoggedIn ? (
            <div className="relative">
              {/* Background decoration removed */}
              
              {/* Main auth container - Very subtle background */}
              <div className="relative bg-black/10 backdrop-blur-sm rounded-xl border border-white/10 p-3 shadow-sm">
                {/* Desktop design - with text and center aligned buttons */}
                <div className="hidden md:block">
                  <div className="text-center mb-3">
                    <h3 className="text-lg font-bold text-amber-100 mb-1">Ready to Play?</h3>
                    <p className="text-xs text-slate-300">Save progress & compete!</p>
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    <AuthButton 
                      showSignUp={true} 
                      variant="default" 
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300" 
                      hideSubtext={true}
                    />
                    <AuthButton 
                      variant="outline" 
                      size="sm"
                      className="border-amber-400/60 text-amber-100 hover:bg-amber-500/20 hover:border-amber-300 backdrop-blur-sm" 
                      hideSubtext={true}
                    />
                  </div>
                </div>

                {/* Mobile design - buttons only, compact, subtle background */}
                <div className="block md:hidden">
                  <div className="flex gap-2">
                    <AuthButton 
                      showSignUp={true} 
                      variant="default" 
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg text-xs px-3 py-1" 
                      hideSubtext={true}
                    />
                    <AuthButton 
                      variant="outline" 
                      size="sm"
                      className="border-amber-400/60 text-amber-100 hover:bg-amber-500/20 hover:border-amber-300 text-xs px-3 py-1" 
                      hideSubtext={true}
                    />
                  </div>
                </div>
              </div>
          </div>
        ) : user && (
            <div className="relative">
              {/* Background decoration removed */}
              
              {/* Main profile container - No background */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{user.email?.split('@')[0] || 'Player'}</p>
                      <p className="text-slate-300 text-xs">Logged in</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleProfileClick}
                      className="text-white hover:bg-white/10 px-2 py-1 text-xs"
            >
                      Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
                      className="text-red-400 hover:bg-red-500/20 hover:text-red-300 px-2 py-1"
            >
                      <LogOut size={12} />
            </Button>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>

        {/* Header Section with responsive spacing */}
        <div className={cn(
          "text-center",
          "-mt-4 md:-mt-16" // Reduced mobile spacing, keep PC spacing
        )}>
          <SparklesPreview />
        </div>

        {/* Game Modes Section */}
        <div className={cn(
          "w-full max-w-lg mx-auto",
          "flex flex-col",
          "gap-8 md:gap-6"
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
              />
            </div>
          ))}

          {/* Unified separator with reduced opacity for both mobile and PC */}
          <div className="relative my-2 md:my-0 md:-mb-4">
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

          {/* Survival Mode with subtle radial fading glow */}
          <div className="relative">
            {/* Subtle radial glow that fades to transparent */}
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
            
            {/* Survival Mode Card */}
            <div className="relative z-10">
              <GameModeCard 
                mode={survivalMode.mode}
                icon={survivalMode.icon}
                bgColor={survivalMode.bgColor}
                previewImage={survivalMode.previewImage}
                cardBackground={survivalMode.cardBackground}
                customPath={survivalMode.path}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
