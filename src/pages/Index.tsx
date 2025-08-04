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
  // Determine if the viewport is mobile-sized (client-side only)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const [topBarScale, setTopBarScale] = useState(1);
  // Dynamically shrink top bar items up to 20% on very small phones
  useEffect(() => {
    const calcScale = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w >= 410) {
        setTopBarScale(1);
      } else {
        // Linear map 320px->0.8  to 410px->1
        const ratio = Math.max(0.8, (w - 320) / (410 - 320));
        setTopBarScale(ratio);
      }
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);
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
    <div 
      className="h-screen text-white overflow-hidden flex flex-col relative"
      style={{
        backgroundImage: 'url(/BRAWLDLE-HOME-BACKGROUND-MOBILE.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="px-4 flex flex-col min-h-screen overflow-x-hidden overflow-y-hidden relative z-10">
        
        {/* Header utilities - fixed top bar flush to top edge */}
        <div className="flex items-center justify-between pt-2 pb-2 flex-shrink-0 w-full lg:w-[42rem] mx-auto lg:px-0 top-bar"
            style={{
              transform: isMobile ? `scale(${topBarScale})` : undefined,
              transformOrigin: 'top center',
              paddingLeft: isMobile ? '2px' : undefined,
              paddingRight: isMobile ? '2px' : undefined
            }}>
          {/* Left - Feedback pill */}
          <button
            onClick={() => navigate('/feedback')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 hover:from-slate-700/80 hover:to-slate-600/80 rounded-full border border-slate-500/30 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <MessageSquare className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4', 'text-slate-300')} />
            <span className={cn(isMobile ? 'text-base' : 'text-sm', 'font-semibold text-slate-200')}>{t('home.feedback')}</span>
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
                style={{ width: isMobile ? '32px' : '28px', height: isMobile ? '32px' : '28px' }}
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
                style={{ width: isMobile ? '32px' : '28px', height: isMobile ? '32px' : '28px' }}
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
            
        {/* Brand block - simplified flat design */}
        <div className="text-center mb-2 lg:mb-4 flex-shrink-0">
          {/* Brawldle logo image */}
          <Image
            src={language === 'he' ? '/Brawldle%20Hebrew%20Logo.png' : '/Brawldle%20Logo.png'}
            alt="Brawldle Logo"
            className={cn(
              "relative z-10 -mt-4 lg:-mt-12 mb-0 lg:mb-0 select-none block mx-auto",
              isMobile ? 'w-[270px]' : 'w-[355px]'
            )}
            priority
          />
        </div>

        {/* Main content area - mobile-first layout */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 gap-8 md:gap-12 lg:gap-8">
          
          {/* {t('home.daily.challenges')} BUTTON */}
          <div className="w-full max-w-[18.4rem] lg:max-w-[21.2rem] mx-auto">
            <button
              onClick={() => navigate('/daily/classic')}
              className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                height: isMobile ? '162px' : '167px',
                borderRadius: '20px',
                background: 'linear-gradient(#fcb410 0%, #d9960d 100%)',
                border: 'none',
                boxShadow: '0 0 0 1px #000, inset 0 6px 0 rgba(255,255,255,0.6), inset 0 -10px 0 rgba(0,0,0,0.45)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div className="flex flex-col items-center justify-center h-full px-6 py-8">
                {/* Title */}
                <h2 
                  className="text-[27px] md:text-[32px] lg:text-[32px] mb-6 whitespace-nowrap"
                  style={{ 
                    fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                    fontWeight: '900',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    lineHeight: '1',
                    textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)'
                  }}
                >
                  {t('home.daily.challenges')}
                </h2>
                
                {/* Challenge icons - with colors */}
                <div className="flex items-center justify-center gap-4 md:gap-5">
                  {dailyModeIcons.map((mode) => {
                    const isCompleted = isModeCompleted(mode.name);
                    return (
                      <div key={mode.name} className="relative">
                        <img 
                          src={mode.icon}
                          alt={`${mode.name} Icon`}
                          className="h-10 w-auto md:h-18 md:w-auto"
                          style={{
                            filter: 'none'
                          }}
                        />
                        {isCompleted && (
                          <div 
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center"
                            style={{ backgroundColor: '#00FF00' }}
                          >
                            <span style={{ fontSize: '12px', color: '#000000', fontWeight: 'bold' }}>✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </button>
            
            {/* Next puzzle countdown - outside button */}
            <div className="text-center mt-4">
              <span 
                className="text-base md:text-lg"
                style={{ 
                  color: '#FFFFFF',
                  fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                  textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)'
                }}
              >
                {t('home.next.puzzle.in')} {timeUntilNextPuzzle}
              </span>
            </div>
          </div>

          {/* {t('home.survival.title')} BUTTON */}
          <div className="w-full max-w-[11.5rem] lg:max-w-[12.5rem] mx-auto mb-12 lg:mb-10">
            <button
              onClick={() => navigate('/survival')}
              className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                height: isMobile ? '72px' : '68px',
                borderRadius: '20px',
                background: 'linear-gradient(#4d37ca 0%, #392599 100%)',
                border: 'none',
                boxShadow: '0 0 0 1px #000, inset 0 4px 0 rgba(255,255,255,0.6), inset 0 -8px 0 rgba(0,0,0,0.45)',
                cursor: 'pointer'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <h3 
                  className={language === 'he' ? 'survival-home-button-title text-xl md:text-base lg:text-base' : 'text-2xl md:text-3xl lg:text-3xl'}
                  style={{
                    fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                    fontWeight: '900',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    lineHeight: '1',
                    textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)'
                  }}
                >
                  {t('home.survival.title')}
                </h3>
              </div>
            </button>
          </div>
        </div>

        {/* Footer - SECONDARY BUTTONS ROW - positioned at bottom */}
        <div className="w-full flex justify-center mt-auto mb-4 lg:mb-6">
          <div className="w-full max-w-md bg-[#003d63]/30 backdrop-blur-lg rounded-2xl p-4 flex gap-4 backdrop-blur-sm shadow-none border-b border-b-[#000000]/20">
            <div className="flex w-full max-w-[26rem] mx-auto gap-6 lg:gap-8">
              {/* {t('home.join.community')} */}
              <button
                onClick={() => navigate('/join-us')}
                className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(#e92a7a 0%, #b71f5c 100%)',
                  border: 'none',
                  boxShadow: '0 0 0 1px #000, inset 0 4px 0 rgba(255,255,255,0.6), inset 0 -8px 0 rgba(0,0,0,0.45)',
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-center justify-center h-full px-2">
                  <span 
                    className="text-lg md:text-xl lg:text-2xl"
                    style={{
                      fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                      fontWeight: '900',
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)'
                    }}
                  >
                    {t('home.join.community')}
                  </span>
                </div>
              </button>

              {/* {t('home.tier.list')} */}
              <button
                onClick={() => navigate('/tier-list')}
                className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(#01abc2 0%, #018599 100%)',
                  border: 'none',
                  boxShadow: '0 0 0 1px #000, inset 0 4px 0 rgba(255,255,255,0.6), inset 0 -8px 0 rgba(0,0,0,0.45)',
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-center justify-center h-full px-2">
                  <span 
                    className="text-lg md:text-xl lg:text-2xl"
                    style={{
                      fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                      fontWeight: '900',
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)'
                    }}
                  >
                    {t('home.tier.list')}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom padding to account for fixed footer */}
        <div className="hidden"></div>

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
