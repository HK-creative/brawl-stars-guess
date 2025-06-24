import React, { useEffect, useState, useRef } from 'react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useStreak } from '@/contexts/StreakContext';
import { Button } from '@/components/ui/button';
import { Flame, Check, Users, Trophy, MessageSquare, User, ChevronDown, ChevronRight, Play, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Image from '@/components/ui/image';
import GameModeCard from '@/components/GameModeCard';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthButton from '@/components/ui/auth-button';
import { useAuthModal } from '@/contexts/AuthModalContext';

const Index = () => {
  const { isLoggedIn, user, logout, streak, completedModes } = useStreak();
  const { language, changeLanguage } = useLanguage();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const [showDailyCard, setShowDailyCard] = useState(false);
  const [timeUntilNextPuzzle, setTimeUntilNextPuzzle] = useState('');
  const streakBadgeRef = useRef<HTMLDivElement>(null);

  // Trigger Daily Challenge card entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDailyCard(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for next puzzle
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeDiff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeUntilNextPuzzle(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);



  const handleLogout = async () => {
    await logout();
  };

  const handleSignUp = () => {
    openAuthModal('signup');
  };

  const handleLogIn = () => {
    openAuthModal('signin');
  };

  // Calculate completed daily modes count (only modes that count towards streak)
  const completedCount = Object.values(completedModes).filter(Boolean).length;
  const totalModes = 4; // classic, audio, gadget, starpower (pixels not included in streak)

  const dailyModeIcons = [
    { name: 'classic', icon: '/ClassicIcon.png', countsTowardsStreak: true, color: '#FFD700' },
    { name: 'audio', icon: '/AudioIcon.png', countsTowardsStreak: true, color: '#FF6B35' },
    { name: 'gadget', icon: '/GadgetIcon.png', countsTowardsStreak: true, color: '#00FF88' },
    { name: 'starpower', icon: '/StarpowerIcon.png', countsTowardsStreak: true, color: '#FF1493' },
    { name: 'pixels', icon: '/PixelsIcon.png', countsTowardsStreak: false, color: '#8A2BE2' }
  ];

  // Check if a mode is completed (with safe access)
  const isModeCompleted = (modeName: string) => {
    return completedModes[modeName as keyof typeof completedModes] === true;
  };

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-black text-white overflow-hidden flex flex-col relative">
      {/* Subtle parallax stars background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-8 w-1 h-1 bg-white/20 rounded-full animate-pulse opacity-40" />
        <div className="absolute top-40 right-12 w-0.5 h-0.5 bg-blue-200/30 rounded-full animate-pulse opacity-30" style={{ animationDelay: '2s' }} />
        <div className="absolute top-80 left-16 w-0.5 h-0.5 bg-purple-200/25 rounded-full animate-pulse opacity-25" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-32 right-20 w-1 h-1 bg-white/15 rounded-full animate-pulse opacity-35" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-64 left-24 w-0.5 h-0.5 bg-yellow-200/20 rounded-full animate-pulse opacity-30" style={{ animationDelay: '3s' }} />
        </div>

      <div className="px-4 flex flex-col h-full relative z-10">
        
        {/* Header utilities - fixed top bar flush to top edge */}
        <div className="flex items-center justify-between pt-2 pb-2 flex-shrink-0">
          {/* Left - Feedback pill */}
          <button
            onClick={() => navigate('/feedback')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 hover:from-slate-700/80 hover:to-slate-600/80 rounded-full border border-slate-500/30 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <MessageSquare className="w-4 h-4 text-slate-300" />
            <span className="text-sm font-semibold text-slate-200">Feedback</span>
          </button>

          {/* Right - Language + Auth with balanced flag halo */}
          <div className="flex items-center gap-3">
            {/* Language toggle - balanced glow matching Sign up button */}
            <div className="flex bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-full p-1 border border-slate-500/40 backdrop-blur-sm" style={{ padding: '4px' }}>
              <button
                onClick={() => changeLanguage('en')}
                className={cn(
                  'rounded-full flex items-center justify-center transition-all duration-300 border-2',
                  language === 'en' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 border-orange-300 shadow-lg shadow-orange-500/20 scale-110' 
                    : 'border-transparent hover:bg-slate-600/50 hover:scale-105'
                )}
                style={{ width: '28px', height: '28px' }}
              >
                <Image
                  src="/USAIcon.png"
                  alt="English"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full object-contain"
                />
              </button>
              <button
                onClick={() => changeLanguage('he')}
                className={cn(
                  'rounded-full flex items-center justify-center transition-all duration-300 border-2',
                  language === 'he' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 border-orange-300 shadow-lg shadow-orange-500/20 scale-110' 
                    : 'border-transparent hover:bg-slate-600/50 hover:scale-105'
                )}
                style={{ width: '28px', height: '28px' }}
              >
                <Image
                  src="/IsraelIcon.png"
                  alt="Hebrew"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full object-contain"
                />
              </button>
            </div>

            {/* Auth controls - single pill for sign-up flow */}
            {!isLoggedIn ? (
              <button
                onClick={handleSignUp}
                className="w-10 h-10 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 border border-orange-300/50 flex items-center justify-center"
              >
                <User className="w-5 h-5 text-white" />
              </button>
            ) : user && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/70 to-slate-700/70 rounded-full border border-slate-500/40 backdrop-blur-sm">
                <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border border-green-300/50 shadow-lg">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-white text-sm font-semibold truncate max-w-16">
                  {user.email?.split('@')[0] || 'Player'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>
            </div>
            
        {/* Brand block - removed spacing below underline */}
        <div className="text-center mt-1 flex-shrink-0">
          {/* Brawldle wordmark */}
          <div className="relative">
            <h1 
              className="text-2xl font-black mb-2 relative z-10 brawldle-title" 
              style={{ 
                background: 'linear-gradient(135deg, #FF9900 0%, #FFB800 50%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(255, 153, 0, 0.5))',
                fontSize: '1.5rem !important'
              }}
            >
              Brawldle
            </h1>
            {/* Glow effect behind text */}
            <div 
              className="absolute inset-0 text-2xl font-black blur-lg opacity-50 brawldle-title"
              style={{ 
                background: 'linear-gradient(135deg, #FF9900 0%, #FFB800 50%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem !important'
              }}
            >
              Brawldle
            </div>
          </div>

          {/* Underline - removed bottom margin */}
          <div className="relative flex justify-center">
            <div 
              className="w-24 h-1 rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(255, 153, 0, 0.6)' }}
            />
          </div>
        </div>

        {/* Main content area - removed flex-1 and justify-center that was causing the spacing */}
        <div className="flex flex-col items-center pt-8 pb-0" style={{ gap: '24px' }}>
          
          {/* DAILY CHALLENGE CARD - increased width */}
          <div className="flex justify-center relative" style={{ width: '90vw', maxWidth: '380px' }}>
            {/* Subtle streak indicator with fire icon */}
            {streak > 0 && (
              <div 
                ref={streakBadgeRef}
                className="absolute z-30 flex items-center justify-center rounded-full group/streak transition-all duration-300"
                style={{ 
                  padding: '5px 9px',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: `
                    0 2px 6px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1) rotate(0deg)',
                  filter: 'brightness(1)'
                }}
                title="Daily challenge streak!"
              >
                <Flame className="w-3.5 h-3.5 text-orange-200 mr-1 transition-all duration-300" style={{ opacity: 0.8 }} />
                <span className="text-white text-sm font-medium">{streak}</span>
              </div>
            )}

            <div className="relative w-full">
              {/* Enhanced glow with deeper shadow */}
              <div 
                className="absolute -inset-3 rounded-3xl blur-lg opacity-80"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 140, 0, 0.4), rgba(255, 107, 107, 0.4))',
                  filter: 'blur(12px)'
                }}
              />

              {/* Always 3D Daily Challenge card with layered depth */}
              <div className="relative w-full">
                {/* 3D Shadow layers for permanent depth */}
                <div 
                  className="absolute inset-0 rounded-3xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 25%, #FF6B6B 50%, #FF1493 75%, #8A2BE2 100%)',
                    transform: 'translateY(8px) translateX(4px)',
                    opacity: 0.3,
                    filter: 'blur(2px)'
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-3xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 25%, #FF6B6B 50%, #FF1493 75%, #8A2BE2 100%)',
                    transform: 'translateY(4px) translateX(2px)',
                    opacity: 0.5,
                    filter: 'blur(1px)'
                  }}
                />
                
                {/* Main card - always 3D positioned */}
                <button
                  onClick={() => navigate('/daily/classic')}
                  className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] w-full group"
                  style={{
                    height: '343px', // Increased by ~10%
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 25%, #FF6B6B 50%, #FF1493 75%, #8A2BE2 100%)',
                    boxShadow: `
                      0 12px 40px rgba(0, 0, 0, 0.4),
                      0 6px 20px rgba(0, 0, 0, 0.3),
                      inset 0 2px 0 rgba(255, 255, 255, 0.3),
                      inset 0 -2px 0 rgba(0, 0, 0, 0.2),
                      0 0 25px rgba(255, 215, 0, 0.3)
                    `,
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    // Always positioned with 3D effect
                    transform: showDailyCard ? 'translateY(-2px) translateX(-1px)' : 'translateY(-2px) translateX(-1px) scale(1.01)',
                    opacity: showDailyCard ? 1 : 0,
                    transition: 'transform 300ms ease-out, opacity 300ms ease-out, box-shadow 300ms ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) translateX(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `
                      0 20px 60px rgba(0, 0, 0, 0.5),
                      0 10px 30px rgba(0, 0, 0, 0.4),
                      inset 0 3px 0 rgba(255, 255, 255, 0.4),
                      inset 0 -3px 0 rgba(0, 0, 0, 0.3),
                      0 0 35px rgba(255, 215, 0, 0.4)
                    `;
                    // Sync streak badge animation
                    if (streakBadgeRef.current) {
                      streakBadgeRef.current.style.transform = 'scale(1.15) rotate(5deg)';
                      streakBadgeRef.current.style.filter = 'brightness(1.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) translateX(-1px)';
                    e.currentTarget.style.boxShadow = `
                      0 12px 40px rgba(0, 0, 0, 0.4),
                      0 6px 20px rgba(0, 0, 0, 0.3),
                      inset 0 2px 0 rgba(255, 255, 255, 0.3),
                      inset 0 -2px 0 rgba(0, 0, 0, 0.2),
                      0 0 25px rgba(255, 215, 0, 0.3)
                    `;
                    // Reset streak badge animation
                    if (streakBadgeRef.current) {
                      streakBadgeRef.current.style.transform = 'scale(1) rotate(0deg)';
                      streakBadgeRef.current.style.filter = 'brightness(1)';
                    }
                  }}
                >
                {/* Inner content with proper spacing */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-8">
                  {/* Clean text styling - solid white with light dark outline */}
                  <div className="text-center mb-12">
                    <h2 
                      className="font-black text-white leading-tight"
                      style={{ 
                        fontSize: '28px',
                        letterSpacing: '0.5px',
                        color: '#FFFFFF',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      Daily Challenge
                    </h2>
                  </div>
                  
                  {/* Challenge icons with gentle warm glow on hover and full-color when completed */}
                  <div className="flex justify-center items-center" style={{ gap: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
                    {dailyModeIcons.map((mode) => {
                      const isCompleted = isModeCompleted(mode.name);
                      
                      return (
                        <div
                          key={mode.name}
                          className="relative rounded-full flex items-center justify-center transition-all duration-200 group-hover:shadow-lg"
                          style={{ 
                            width: '48px', 
                            height: '48px',
                            background: 'rgba(255, 255, 255, 0.25)',
                            boxShadow: `
                              0 2px 8px rgba(0, 0, 0, 0.2),
                              inset 0 1px 0 rgba(255, 255, 255, 0.4),
                              inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                            `,
                            border: isCompleted 
                              ? `2px solid ${mode.color}`
                              : '2px solid rgba(128, 128, 128, 0.4)',
                            backdropFilter: 'blur(10px)',
                            // Gentle warm glow on hover for untouched rings
                            filter: !isCompleted ? 'drop-shadow(0 0 0 rgba(255, 153, 0, 0))' : 'none',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isCompleted) {
                              e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(255, 153, 0, 0.6))';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCompleted) {
                              e.currentTarget.style.filter = 'drop-shadow(0 0 0 rgba(255, 153, 0, 0))';
                            }
                          }}
                        >
                          {isCompleted ? (
                            <Image
                              src={mode.icon}
                              alt={mode.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 object-contain"
                              style={{ 
                                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                              }}
                            />
                          ) : (
                            <Image
                              src={mode.icon}
                              alt={mode.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 object-contain"
                              style={{ 
                                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                                opacity: 0.6 // Lightened incomplete mode overlay
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Premium countdown timer */}
                  <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
                    <div 
                      className="px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <span 
                        className="text-white text-sm font-semibold tracking-wide"
                        style={{ 
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                          letterSpacing: '0.02em'
                        }}
                      >
                        Next puzzle in {timeUntilNextPuzzle}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
              </div>
            </div>
          </div>

          {/* SURVIVAL CARD - increased width with subtle glow */}
          <div className="flex justify-center" style={{ width: '90vw', maxWidth: '380px' }}>
            <div className="relative w-full">
              {/* Premium outer glow effect */}
              <div className="absolute inset-0 -z-10">
                {/* Enhanced outer glow */}
                <div 
                  className="absolute -inset-4 rounded-3xl blur-xl opacity-30 transition-opacity duration-500 hover:opacity-50"
                  style={{ 
                    background: 'radial-gradient(ellipse, rgba(245, 158, 11, 0.4) 0%, rgba(251, 146, 60, 0.3) 40%, rgba(245, 158, 11, 0.2) 70%, transparent 90%)'
                  }}
                />
              </div>

              {/* Minimal floating sparkles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-4 left-8 w-0.5 h-0.5 bg-amber-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-6 right-8 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping opacity-25" style={{ animationDelay: '2s' }}></div>
              </div>

              {/* Modern sleek survival card with premium design */}
              <button
                onClick={() => navigate('/survival')}
                className="relative w-full transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl overflow-hidden group"
                style={{
                  height: '141px', // Increased by ~10%
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
                  border: '3px solid transparent',
                  backgroundImage: `
                    linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%),
                    linear-gradient(135deg, rgba(245, 158, 11, 0.8) 0%, rgba(251, 146, 60, 0.9) 50%, rgba(245, 158, 11, 0.8) 100%)
                  `,
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  boxShadow: `
                    0 8px 32px rgba(245, 158, 11, 0.2),
                    0 4px 16px rgba(0, 0, 0, 0.4),
                    inset 0 2px 0 rgba(255, 255, 255, 0.1),
                    inset 0 -2px 0 rgba(0, 0, 0, 0.3),
                    0 0 20px rgba(245, 158, 11, 0.15)
                  `
                }}
              >
                {/* Premium inner glow effect */}
                <div 
                  className="absolute inset-2 opacity-20 transition-opacity duration-500 group-hover:opacity-30"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.3) 0%, rgba(251, 146, 60, 0.2) 30%, rgba(245, 158, 11, 0.1) 60%, transparent 80%)',
                    borderRadius: '17px',
                    filter: 'blur(4px)'
                  }}
                />

                {/* Background Image with modern rounded corners */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    borderRadius: '17px'
                  }}
                >
                  <img 
                    src="/Survival_card_background.png" 
                    alt="Survival Background" 
                    className="w-full h-full object-cover opacity-70" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/50" />
                </div>

                {/* Premium content styling */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                  <h3 
                    className="text-3xl font-black uppercase tracking-wider mb-2 transition-all duration-500 group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #d97706 50%, #f59e0b 75%, #fbbf24 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 2px 8px rgba(245, 158, 11, 0.5)',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                    }}
                  >
                    SURVIVAL
                  </h3>
                  <p 
                    className="text-amber-200/90 text-sm font-semibold tracking-wide transition-all duration-500 group-hover:text-amber-100"
                    style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    Ultimate Challenge Mode
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Premium action buttons */}
          <div className="flex items-center justify-center" style={{ gap: '16px', width: '90vw', maxWidth: '380px' }}>
            {/* JOIN COMMUNITY - premium design */}
            <button
              onClick={() => navigate('/join-us')}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all duration-400 hover:scale-105 backdrop-blur-md flex-1 group"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 107, 53, 0.08))',
                borderColor: 'rgba(255, 107, 53, 0.4)',
                boxShadow: '0 4px 16px rgba(255, 107, 53, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 53, 0.25), rgba(255, 107, 53, 0.15))';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 107, 53, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 107, 53, 0.08))';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 53, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              <Users className="w-5 h-5 text-orange-300 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-orange-200 font-semibold text-sm tracking-wide">Join Community</span>
            </button>

            {/* TIER LIST - premium design */}
            <button
              onClick={() => navigate('/tier-list')}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all duration-400 hover:scale-105 backdrop-blur-md flex-1 group"
              style={{
                background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15), rgba(148, 163, 184, 0.08))',
                borderColor: 'rgba(148, 163, 184, 0.4)',
                boxShadow: '0 4px 16px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(148, 163, 184, 0.25), rgba(148, 163, 184, 0.15))';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(148, 163, 184, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(148, 163, 184, 0.15), rgba(148, 163, 184, 0.08))';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              <Trophy className="w-5 h-5 text-slate-300 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-slate-300 font-semibold text-sm tracking-wide">Tier List</span>
            </button>
          </div>
        </div>

        {/* Premium CSS animations */}
        <style>
          {`
          @keyframes gentle-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default Index;
