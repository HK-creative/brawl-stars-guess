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
          {/* Left - Feedback button with retro style */}
          <div className="retro-header-button-container" style={{ height: isMobile ? '40px' : '36px' }}>
            <div className="retro-header-button-border">
              <div className="retro-header-button-base">
                <button
                  onClick={() => navigate('/feedback', { state: { fromHome: true } })}
                  className="retro-header-button retro-header-button-feedback"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4', 'text-white')} />
                    <span className={cn(isMobile ? 'text-base' : 'text-sm', 'font-semibold text-white')}>{t('home.feedback')}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right - Language + Auth with retro styling */}
          <div className="flex items-center gap-3">
            {/* Language toggle with retro 3D style */}
            <div className="flex gap-1">
              <div className="retro-header-mini-container" style={{ width: isMobile ? '36px' : '32px', height: isMobile ? '36px' : '32px' }}>
                <div className="retro-header-mini-border">
                  <div className="retro-header-mini-base">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={cn(
                        'retro-header-mini-button',
                        language === 'en' ? 'retro-header-mini-active' : 'retro-header-mini-inactive'
                      )}
                    >
                      <Image
                        src="/USAIcon.png"
                        alt="English"
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-full object-contain"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="retro-header-mini-container" style={{ width: isMobile ? '36px' : '32px', height: isMobile ? '36px' : '32px' }}>
                <div className="retro-header-mini-border">
                  <div className="retro-header-mini-base">
                    <button
                      onClick={() => changeLanguage('he')}
                      className={cn(
                        'retro-header-mini-button',
                        language === 'he' ? 'retro-header-mini-active' : 'retro-header-mini-inactive'
                      )}
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
                </div>
              </div>
            </div>

            {/* Auth controls with retro style */}
            {!isLoggedIn ? (
              <div className="retro-header-mini-container" style={{ width: isMobile ? '44px' : '40px', height: isMobile ? '44px' : '40px' }}>
                <div className="retro-header-mini-border">
                  <div className="retro-header-mini-base">
                    <button
                      onClick={handleSignUp}
                      className="retro-header-mini-button retro-header-mini-auth"
                    >
                      <User className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ) : user && (
              <div className="retro-header-button-container" style={{ height: isMobile ? '40px' : '36px' }}>
                <div className="retro-header-button-border">
                  <div className="retro-header-button-base">
                    <button className="retro-header-button retro-header-button-user">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border border-green-300/50 shadow-lg">
                          <User size={12} className="text-white" />
                        </div>
                        <span className="text-white text-sm font-semibold truncate max-w-16">
                          {user.email?.split('@')[0] || 'Player'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
            </div>
            
        {/* Brand block - animated logo */}
        <div className="text-center mb-2 lg:mb-4 flex-shrink-0">
          {/* Brawldle logo image with breathing animation */}
          <Image
            src={language === 'he' ? '/Brawldle%20Hebrew%20Logo.png' : '/Brawldle%20Logo.png'}
            alt="Brawldle Logo"
            className={cn(
              "relative z-10 -mt-4 lg:-mt-12 mb-0 lg:mb-0 select-none block mx-auto logo-breathe",
              isMobile ? 'w-[270px]' : 'w-[355px]'
            )}
            priority
          />
        </div>

        {/* Main content area - mobile-first layout */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 gap-8 md:gap-12 lg:gap-8">
          
          {/* {t('home.daily.challenges')} BUTTON */}
          <div className="w-full max-w-[18.4rem] lg:max-w-[21.2rem] mx-auto relative">
            {/* 3D Rotating Stars Container */}
            <div className="rotating-stars-container absolute inset-0 pointer-events-none">
              <div className="star-orbit star-orbit-1">
                <div className="star star-1">⭐</div>
              </div>
              <div className="star-orbit star-orbit-2">
                <div className="star star-2">✨</div>
              </div>
              <div className="star-orbit star-orbit-3">
                <div className="star star-3">💫</div>
              </div>
              <div className="star-orbit star-orbit-4">
                <div className="star star-4">⭐</div>
              </div>
            </div>
            
            <div className="retro-button-container" style={{ height: isMobile ? '162px' : '167px' }}>
              <div className="retro-button-border">
                <div className="retro-button-base">
                  <button
                    onClick={() => navigate('/daily')}
                    className="retro-button retro-button-daily"
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
                </div>
              </div>
            </div>
            
            {/* Next puzzle countdown - styled container */}
            <div className="text-center mt-4">
              <div className="retro-countdown-container">
                <div className="retro-countdown-border">
                  <div className="retro-countdown-base">
                    <div className="retro-countdown-content">
                      <span 
                        className="text-base md:text-lg font-bold"
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
                </div>
              </div>
            </div>
          </div>

          {/* {t('home.survival.title')} BUTTON */}
          <div className="w-full max-w-[11.5rem] lg:max-w-[12.5rem] mx-auto mb-12 lg:mb-10">
            <div className="retro-button-container" style={{ height: isMobile ? '72px' : '68px' }}>
              <div className="retro-button-border">
                <div className="retro-button-base">
                  <button
                    onClick={() => navigate('/survival')}
                    className="retro-button retro-button-survival"
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
            </div>
          </div>
        </div>

        {/* Footer - SECONDARY BUTTONS ROW - positioned at bottom */}
        <div className="w-full flex justify-center mt-auto mb-4 lg:mb-6">
          <div className="w-full max-w-md bg-[#003d63]/30 backdrop-blur-lg rounded-2xl p-4 flex gap-4 backdrop-blur-sm shadow-none border-b border-b-[#000000]/20">
            <div className="flex w-full max-w-[26rem] mx-auto gap-6 lg:gap-8">
              {/* {t('home.join.community')} */}
              <div className="flex-1">
                <div className="retro-button-container" style={{ height: '60px' }}>
                  <div className="retro-button-border">
                    <div className="retro-button-base">
                      <button
                        onClick={() => navigate('/join-us')}
                        className="retro-button retro-button-join"
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
                    </div>
                  </div>
                </div>
              </div>

              {/* {t('home.tier.list')} */}
              <div className="flex-1">
                <div className="retro-button-container" style={{ height: '60px' }}>
                  <div className="retro-button-border">
                    <div className="retro-button-base">
                      <button
                        onClick={() => navigate('/tier-list')}
                        className="retro-button retro-button-tierlist"
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
              </div>
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

          /* Retro 3D Button Styles */
          .retro-button-container {
            width: 100%;
            position: relative;
          }

          .retro-button-border {
            border: 8px solid #ffae70;
            outline: 4px solid #52333f;
            width: 100%;
            height: 100%;
            border-radius: 20px;
          }

          .retro-button-base {
            background-color: #75221c;
            outline: 2px solid black;
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 12px;
          }

          .retro-button {
            width: 100%;
            height: 100%;
            outline: 2px solid black;
            border: 4px solid;
            border-left-color: rgba(255,255,255,0.6);
            border-top-color: rgba(255,255,255,0.8);
            border-bottom-color: rgba(0,0,0,0.6);
            border-right-color: rgba(0,0,0,0.4);
            cursor: pointer;
            color: #ffee83;
            transform: translateY(-20%);
            transition: transform 0.15s ease;
            border-radius: 8px;
            position: relative;
          }

          .retro-button:hover {
            transform: translateY(-10%);
          }

          .retro-button:active {
            transform: translateY(0);
          }

          /* Daily Challenge Button */
          .retro-button-daily {
            background: linear-gradient(hsl(var(--daily-classic-primary)) 0%, hsl(var(--daily-classic-secondary)) 100%);
          }

          /* Survival Button */
          .retro-button-survival {
            background: linear-gradient(hsl(var(--daily-audio-primary)) 0%, hsl(var(--daily-audio-secondary)) 100%);
          }

          /* Join Community Button */
          .retro-button-join {
            background: linear-gradient(hsl(var(--daily-starpower-primary)) 0%, hsl(var(--daily-starpower-secondary)) 100%);
          }

          /* Tier List Button */
          .retro-button-tierlist {
            background: linear-gradient(hsl(var(--daily-gadget-primary)) 0%, hsl(var(--daily-gadget-secondary)) 100%);
          }

          /* Header Retro Button Styles */
          .retro-header-button-container {
            position: relative;
            display: inline-block;
          }

          .retro-header-button-border {
            border: 4px solid #8B6914;
            outline: 2px solid #3D2914;
            width: 100%;
            height: 100%;
            border-radius: 12px;
          }

          .retro-header-button-base {
            background-color: #5D4A1F;
            outline: 1px solid black;
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 8px;
          }

          .retro-header-button {
            width: 100%;
            height: 100%;
            outline: 1px solid black;
            border: 2px solid;
            border-left-color: rgba(255,255,255,0.4);
            border-top-color: rgba(255,255,255,0.6);
            border-bottom-color: rgba(0,0,0,0.4);
            border-right-color: rgba(0,0,0,0.3);
            cursor: pointer;
            transform: translateY(-15%);
            transition: transform 0.15s ease;
            border-radius: 6px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 12px;
          }

          .retro-header-button:hover {
            transform: translateY(-8%);
          }

          .retro-header-button:active {
            transform: translateY(0);
          }

          .retro-header-button-feedback {
            background: linear-gradient(#6B5B95 0%, #4A4A6D 100%);
          }

          .retro-header-button-user {
            background: linear-gradient(#2D5016 0%, #1A3009 100%);
          }

          /* Mini Header Button Styles */
          .retro-header-mini-container {
            position: relative;
            display: inline-block;
          }

          .retro-header-mini-border {
            border: 3px solid #8B6914;
            outline: 1px solid #3D2914;
            width: 100%;
            height: 100%;
            border-radius: 8px;
          }

          .retro-header-mini-base {
            background-color: #5D4A1F;
            outline: 1px solid black;
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 5px;
          }

          .retro-header-mini-button {
            width: 100%;
            height: 100%;
            outline: 1px solid black;
            border: 2px solid;
            border-left-color: rgba(255,255,255,0.4);
            border-top-color: rgba(255,255,255,0.6);
            border-bottom-color: rgba(0,0,0,0.4);
            border-right-color: rgba(0,0,0,0.3);
            cursor: pointer;
            transform: translateY(-15%);
            transition: transform 0.15s ease;
            border-radius: 3px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .retro-header-mini-button:hover {
            transform: translateY(-8%);
          }

          .retro-header-mini-button:active {
            transform: translateY(0);
          }

          .retro-header-mini-active {
            background: linear-gradient(#FF8C42 0%, #FF6B1A 100%);
          }

          .retro-header-mini-inactive {
            background: linear-gradient(#666666 0%, #444444 100%);
          }

          .retro-header-mini-auth {
            background: linear-gradient(#FF8C42 0%, #FF6B1A 100%);
          }

          /* Countdown Container Styles */
          .retro-countdown-container {
            display: inline-block;
            position: relative;
            margin: 0 auto;
          }

          .retro-countdown-border {
            border: none;
            outline: none;
            border-radius: 16px;
            padding: 0;
          }

          .retro-countdown-base {
            background: transparent;
            border: 1px solid #1A0F08;
            border-radius: 12px;
            position: relative;
          }

          .retro-countdown-content {
            padding: 8px 16px;
            position: relative;
            background: transparent;
            border-radius: 10px;
            border: none;
          }

          /* 3D Rotating Stars Animation */
          .rotating-stars-container {
            width: 100%;
            height: 100%;
            perspective: 1000px;
            transform-style: preserve-3d;
          }

          .star-orbit {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            transform-style: preserve-3d;
          }

          .star-orbit-1 {
            animation: orbit-3d-1 8s linear infinite;
            transform: rotateX(0deg) rotateY(0deg);
          }

          .star-orbit-2 {
            animation: orbit-3d-2 10s linear infinite reverse;
            transform: rotateX(60deg) rotateY(0deg);
          }

          .star-orbit-3 {
            animation: orbit-3d-3 12s linear infinite;
            transform: rotateX(30deg) rotateY(45deg);
          }

          .star-orbit-4 {
            animation: orbit-3d-4 6s linear infinite reverse;
            transform: rotateX(-30deg) rotateY(-45deg);
          }

          .star {
            position: absolute;
            font-size: 20px;
            filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.8));
            animation: star-twinkle 2s ease-in-out infinite alternate;
            transform-style: preserve-3d;
          }

          .star-1 {
            top: 10%;
            left: 50%;
            transform: translateX(-50%) translateZ(50px);
            animation-delay: 0s;
          }

          .star-2 {
            top: 50%;
            right: 10%;
            transform: translateY(-50%) translateZ(30px);
            animation-delay: 0.5s;
          }

          .star-3 {
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%) translateZ(40px);
            animation-delay: 1s;
          }

          .star-4 {
            top: 50%;
            left: 10%;
            transform: translateY(-50%) translateZ(20px);
            animation-delay: 1.5s;
          }

          @keyframes orbit-3d-1 {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            100% { transform: rotateX(0deg) rotateY(360deg) rotateZ(0deg); }
          }

          @keyframes orbit-3d-2 {
            0% { transform: rotateX(60deg) rotateY(0deg) rotateZ(0deg); }
            100% { transform: rotateX(60deg) rotateY(360deg) rotateZ(0deg); }
          }

          @keyframes orbit-3d-3 {
            0% { transform: rotateX(30deg) rotateY(45deg) rotateZ(0deg); }
            100% { transform: rotateX(30deg) rotateY(405deg) rotateZ(0deg); }
          }

          @keyframes orbit-3d-4 {
            0% { transform: rotateX(-30deg) rotateY(-45deg) rotateZ(0deg); }
            100% { transform: rotateX(-30deg) rotateY(315deg) rotateZ(0deg); }
          }

          @keyframes star-twinkle {
            0% { 
              opacity: 0.6; 
              transform: scale(0.8);
              filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
            }
            100% { 
              opacity: 1; 
              transform: scale(1.2);
              filter: drop-shadow(0 0 12px rgba(255, 215, 0, 1));
            }
          }

          /* Logo Breathing Animation */
          .logo-breathe {
            animation: logo-breath 6s ease-in-out infinite;
          }

          @keyframes logo-breath {
            0%, 100% { 
              transform: scale(1); 
              filter: brightness(1);
            }
            50% { 
              transform: scale(1.02); 
              filter: brightness(1.05);
            }
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default Index;
