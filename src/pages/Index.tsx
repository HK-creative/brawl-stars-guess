import React, { useEffect, useState, useRef } from 'react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useStreak } from '@/contexts/StreakContext';
import { Button } from '@/components/ui/button';
import { Flame, Check, Users, Trophy, User, ChevronDown, ChevronRight, Play, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Image from '@/components/ui/image';
import GameModeCard from '@/components/GameModeCard';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthButton from '@/components/ui/auth-button';
import { useAuthModal } from '@/contexts/AuthModalContext';
import DailyChallengesHero from '@/components/home/DailyChallengesHero';
import { motion } from 'framer-motion';
import StarField from '@/components/StarField';

const Index = () => {
  const { isLoggedIn, user, logout, streak, completedModes } = useStreak();
  const { language, changeLanguage } = useLanguage();
  // Determine if the viewport is mobile-sized (client-side only)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const [topBarScale, setTopBarScale] = useState(1);
  // Scale top bar: larger across the board, especially on mobile; still adapt for very small phones
  useEffect(() => {
    const calcScale = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      const isMobileViewport = w < 640;
      if (isMobileViewport) {
        // For very small phones (<410px), keep a slight adaptive curve but with a higher base
        // Map 320px->0.8 to 410px->1, then boost with a mobile base multiplier
        const ratio = w >= 410 ? 1 : Math.max(0.8, (w - 320) / (410 - 320));
        const mobileBase = 1.30; // stronger boost on mobile
        setTopBarScale(ratio * mobileBase);
      } else {
        const desktopBase = 1.12; // subtle boost on desktop
        setTopBarScale(desktopBase);
      }
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);
  // Ref to control the Survival shimmer lottie (white diagonal sweep)
  const survivalShimmerRef = useRef<HTMLElement | null>(null);
  // Ref to bind hover/focus events on the Survival button
  const survivalButtonRef = useRef<HTMLButtonElement | null>(null);
  
  // Shimmer: randomized delay (1.5–2.8s) between loops + hover/focus immediate trigger with cooldown
  useEffect(() => {
    const el = survivalShimmerRef.current as any;
    const btn = survivalButtonRef.current;
    if (!el) return;
    const nextDelayMs = () => 1500 + Math.floor(Math.random() * 1300); // 1.5s–2.8s
    let timer: ReturnType<typeof setTimeout> | null = null;
    let boot: ReturnType<typeof setTimeout> | null = null;
    let cooldown: ReturnType<typeof setTimeout> | null = null;
    let cooldownActive = false;

    const applySettingsAndPlay = () => {
      try { el.loop = false; } catch { /* no-op */ }
      try { el.setSpeed ? el.setSpeed(4) : (el.speed = 4); } catch { /* no-op */ }
      try { el.stop?.(); } catch { /* no-op */ }
      try { el.seek?.(0); } catch { /* no-op */ }
      try { el.play?.(); } catch { /* no-op */ }
    };

    const scheduleReplay = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try { el.stop?.(); el.seek?.(0); el.play?.(); } catch { /* no-op */ }
      }, nextDelayMs());
    };

    const triggerImmediate = () => {
      if (cooldownActive) return;
      cooldownActive = true;
      try { el.stop?.(); el.seek?.(0); el.play?.(); } catch { /* no-op */ }
      if (timer) { clearTimeout(timer); timer = null; }
      // brief cooldown (~1.2s) to avoid spam
      if (cooldown) clearTimeout(cooldown);
      cooldown = setTimeout(() => { cooldownActive = false; }, 1200);
    };

    const onReady = () => applySettingsAndPlay();
    const onComplete = () => scheduleReplay();
    const onLoopComplete = () => scheduleReplay();

    el.addEventListener?.('ready', onReady);
    el.addEventListener?.('load', onReady);
    el.addEventListener?.('complete', onComplete);
    el.addEventListener?.('loopComplete', onLoopComplete);

    // Hover/focus immediate shimmer trigger
    btn?.addEventListener('mouseenter', triggerImmediate);
    btn?.addEventListener('focus', triggerImmediate);

    // Fallback boot in case 'ready' doesn't fire in some browsers
    boot = setTimeout(() => applySettingsAndPlay(), 150);

    return () => {
      el.removeEventListener?.('ready', onReady);
      el.removeEventListener?.('load', onReady);
      el.removeEventListener?.('complete', onComplete);
      el.removeEventListener?.('loopComplete', onLoopComplete);
      btn?.removeEventListener('mouseenter', triggerImmediate);
      btn?.removeEventListener('focus', triggerImmediate);
      if (timer) clearTimeout(timer);
      if (boot) clearTimeout(boot);
      if (cooldown) clearTimeout(cooldown);
    };
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

  // Daily state is managed in the store; no per-mode UI here in the hero container.

  return (
    <div 
      className="min-h-screen text-white flex flex-col relative home-background-overlay"
      style={{
        minHeight: '100dvh', // Dynamic viewport height for better mobile support
        maxHeight: '100dvh',
        overflow: 'auto'
      }}
    >
      {/* Starfield overlay above background, below UI */}
      <StarField shootingStars />
      <div className="px-4 flex flex-col overflow-x-hidden relative z-10"
           style={{
             minHeight: '100%',
             maxHeight: '100%',
             paddingBottom: 'env(safe-area-inset-bottom, 16px)'
           }}>
        
        {/* Header utilities - responsive top bar */}
        <div className="flex items-center justify-between pt-2 pb-1 flex-shrink-0 w-full max-w-[42rem] mx-auto top-bar"
            style={{
              transform: isMobile ? 'none' : `scale(${topBarScale})`,
              transformOrigin: 'top center',
              paddingLeft: isMobile ? '8px' : undefined,
              paddingRight: isMobile ? '8px' : undefined,
              paddingTop: 'max(8px, env(safe-area-inset-top, 8px))'
            }}>
          {/* Left - Feedback button (new SVG as the whole button) */}
          <motion.button
            onClick={() => navigate('/feedback', { state: { fromHome: true } })}
            aria-label={t('home.feedback')}
            title={t('home.feedback')}
            style={{
              width: isMobile ? '50px' : '56px',
              height: isMobile ? '44px' : '48px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'inline-block',
              lineHeight: 0,
            }}
            className="focus:outline-none"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ y: 1, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.35 }}
          >
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 42 36" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="select-none pointer-events-none"
            >
              <g filter="url(#filter0_di_2044_4369)">
                <mask id="path-1-outside-1_2044_4369" maskUnits="userSpaceOnUse" x="2" y="0" width="38" height="32" fill="black">
                  <rect fill="white" x="2" width="38" height="32"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M13 1C7.47715 1 3 5.47714 3 11V16.6127C3 22.1356 7.47715 26.6127 13 26.6127H17.9766L21.622 31L25.4643 26.6127H29C34.5228 26.6127 39 22.1356 39 16.6127V11C39 5.47715 34.5228 1 29 1H13Z"/>
                </mask>
                <path fillRule="evenodd" clipRule="evenodd" d="M13 1C7.47715 1 3 5.47714 3 11V16.6127C3 22.1356 7.47715 26.6127 13 26.6127H17.9766L21.622 31L25.4643 26.6127H29C34.5228 26.6127 39 22.1356 39 16.6127V11C39 5.47715 34.5228 1 29 1H13Z" fill="white"/>
                <path d="M17.9766 26.6127L18.3611 26.2932L18.2112 26.1127H17.9766V26.6127ZM21.622 31L21.2375 31.3195L21.612 31.7703L21.9982 31.3294L21.622 31ZM25.4643 26.6127V26.1127H25.2375L25.0881 26.2833L25.4643 26.6127ZM3 11H3.5C3.5 5.75329 7.75329 1.5 13 1.5V1V0.5C7.20101 0.5 2.5 5.201 2.5 11H3ZM3 16.6127H3.5V11H3H2.5V16.6127H3ZM13 26.6127V26.1127C7.7533 26.1127 3.5 21.8594 3.5 16.6127H3H2.5C2.5 22.4117 7.20101 27.1127 13 27.1127V26.6127ZM17.9766 26.6127V26.1127H13V26.6127V27.1127H17.9766V26.6127ZM21.622 31L22.0066 30.6805L18.3611 26.2932L17.9766 26.6127L17.592 26.9323L21.2375 31.3195L21.622 31ZM25.4643 26.6127L25.0881 26.2833L21.2459 30.6706L21.622 31L21.9982 31.3294L25.8404 26.9421L25.4643 26.6127ZM29 26.6127V26.1127H25.4643V26.6127V27.1127H29V26.6127ZM39 16.6127H38.5C38.5 21.8594 34.2467 26.1127 29 26.1127V26.6127V27.1127C34.799 27.1127 39.5 22.4117 39.5 16.6127H39ZM39 11H38.5V16.6127H39H39.5V11H39ZM29 1V1.5C34.2467 1.5 38.5 5.7533 38.5 11H39H39.5C39.5 5.20101 34.799 0.5 29 0.5V1ZM13 1V1.5H29V1V0.5H13V1Z" fill="black" mask="url(#path-1-outside-1_2044_4369)"/>
              </g>
              <ellipse cx="12.0094" cy="19.1584" rx="3.52701" ry="3.47702" fill="#040513"/>
              <ellipse cx="20.9015" cy="19.1584" rx="3.52701" ry="3.47702" fill="#040513"/>
              <ellipse cx="29.9904" cy="19.1584" rx="3.52701" ry="3.47702" fill="#040513"/>
              <defs>
                <filter id="filter0_di_2044_4369" x="0.5" y="0.5" width="41" height="35.2703" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="2"/>
                  <feGaussianBlur stdDeviation="1"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2044_4369"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2044_4369" result="shape"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="2"/>
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
                  <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2044_4369"/>
                </filter>
              </defs>
            </svg>
          </motion.button>

          {/* Right - Language + Auth with retro styling */}
          <div className="flex items-center gap-4">
            {/* Language toggle - show only active language */}
          <button
            onClick={() => changeLanguage(language === 'en' ? 'he' : 'en')}
            onTouchStart={() => {}} // Ensures touch events are properly handled on mobile
            aria-label={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
            title={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
            style={{
              // Increased minimum touch target size for better mobile accessibility
              width: isMobile ? '44px' : '40px', // Increased from 32px to 44px on mobile
              height: isMobile ? '44px' : '40px', // Increased from 32px to 44px on mobile
              minWidth: '44px', // iOS Human Interface Guidelines minimum
              minHeight: '44px', // iOS Human Interface Guidelines minimum
              background: 'transparent',
              border: 'none',
              padding: isMobile ? '6px' : '0', // Added padding on mobile for better touch area
              display: 'inline-flex', // Changed to flex for better centering
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '8px',
              boxShadow: isMobile ? '0 0 0 1px rgba(255,255,255,0.65)' : '0 0 0 2px rgba(255,255,255,0.55)',
              transition: 'box-shadow 120ms ease, transform 120ms ease, background-color 120ms ease',
              // Better mobile touch feedback
              WebkitTapHighlightColor: 'rgba(255, 255, 255, 0.1)',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              // Ensure proper z-index for touch events
              position: 'relative',
              zIndex: 10
            }}
            className={cn(
              "hover:scale-105 active:scale-95", // Added active state for touch feedback
              isMobile && "active:bg-white/10" // Background feedback on mobile
            )}
          >
            <Image
              src={language === 'en' ? '/NewDailyUI/united-states-icon.png' : '/NewDailyUI/israel-icon.png'}
              alt={language === 'en' ? 'English' : 'Hebrew'}
              width={isMobile ? 32 : 20} // Increased mobile icon size to better fill the button
              height={isMobile ? 32 : 20}
              className="select-none pointer-events-none"
              style={{ 
                width: isMobile ? '32px' : '100%', 
                height: isMobile ? '32px' : '100%', 
                objectFit: 'contain',
                // Ensure the image doesn't interfere with touch events
                touchAction: 'none'
              }}
            />
          </button>

            {/* Auth controls — unauthenticated shows icon only (no plate) */}
            {!isLoggedIn ? (
              <motion.button
                onClick={handleSignUp}
                aria-label="Account"
                title="Account"
                style={{
                  width: isMobile ? '64px' : '76px',
                  height: isMobile ? '64px' : '76px',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  display: 'inline-block',
                  lineHeight: 0,
                }}
                className="focus:outline-none"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ y: 1, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.35 }}
              >
                <img
                  src="/NewDailyUI/AccountIcon.svg"
                  alt=""
                  draggable={false}
                  className="select-none pointer-events-none"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </motion.button>
            ) : user && (
              <div className="retro-header-button-container" style={{ height: isMobile ? '54px' : '70px' }}>
                <div className="retro-header-button-border">
                  <div className="retro-header-button-base">
                    <button className="retro-header-button retro-header-button-user">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border border-green-300/50 shadow-lg">
                          <User size={14} className="text-white" />
                        </div>
                        <span className="text-white text-base font-semibold truncate max-w-16">
                          {user.email?.split('@')[0] || 'Player'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
            </div>
            
        {/* Brand block - animated logo */}
        <div className="text-center mb-0 lg:mb-2 flex-shrink-0">
          {/* Brawldle logo image with breathing animation */}
          <Image
            src={language === 'he' ? '/Brawldle%20Hebrew%20Logo.png' : '/Brawldle%20Logo.png'}
            alt="Brawldle Logo"
            className={cn(
              "relative z-10 -mt-16 lg:-mt-24 mb-0 lg:mb-0 select-none block mx-auto logo-breathe",
              // Balanced mobile size, further reduced PC logo size
              isMobile ? 'w-[190px]' : 'w-[230px]'
            )}
            priority
          />
        </div>

        {/* Main content area - mobile-first layout with safe spacing */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 flex-1 main-content-tablet"
             style={{
               paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
               paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
               gap: isMobile ? '1rem' : '2rem', // Tighter spacing on mobile to fit everything
               justifyContent: 'flex-start', // Start from top, we'll control spacing manually
               minHeight: 0 // Allow shrinking
             }}>
          
          {/* Daily Challenges Hero */}
          <div 
            className="daily-hero-container"
            style={{ 
              marginTop: isMobile ? '1rem' : '0' // Reduced spacing above daily button for mobile
            }}>
            <DailyChallengesHero />
          </div>

          {/* Next puzzle countdown - minimal container */}
          <div className="text-center -mt-6 md:-mt-10 lg:-mt-8">
            <span 
              className="text-base md:text-lg font-bold"
              style={{ 
                color: '#C9C9C9',
                fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                display: 'inline-block',
                transform: `translateY(${isMobile ? 10 : 20}px)`
              }}
            >
              {t('home.next.puzzle.in')} {timeUntilNextPuzzle}
            </span>
          </div>

          {/* {t('home.survival.title')} BUTTON */}
          <div
            className="mx-auto survival-button-tablet"
            style={{ 
              marginTop: isMobile ? '1.25rem' : '1rem', // Mobile spacing transferred from logo-to-daily gap
              width: isMobile ? 'clamp(250px, 75vw, 285px)' : 'clamp(185px,30vw,270px)' // Balanced mobile increase, PC slight increase
            }}
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ y: 1, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.35 }}
            >
            <button
              ref={survivalButtonRef}
              onClick={() => navigate('/survival')}
              className="block w-full relative focus:outline-none"
              aria-label={t('home.survival.title')}
            >
              <div className="logo-breathe" style={{ width: '100%', height: '100%' }}>
                <img
                  src="/NewDailyUI/NewSurvivalButtonDesign.svg"
                  alt=""
                  className="w-full h-auto select-none pointer-events-none"
                  draggable={false}
                />
                {/* Bottom gradient animation (dotLottie) — full button width, above stroke */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: 0,
                    right: 0,
                    bottom: '12%', // higher to sit above the black outline
                    height: '26%',
                    zIndex: 10, // under the text label
                    borderRadius: '14px',
                    overflow: 'hidden',
                  }}
                >
                  <dotlottie-player
                    src="/NewDailyUI/Gradient%20Footer.lottie"
                    autoplay
                    loop
                    mode="normal"
                    background="transparent"
                    style={{
                      width: '100%',
                      height: '100%',
                      // widen horizontally to match visual width of plate
                      transform: 'translateZ(0) scaleX(3)',
                      transformOrigin: 'center',
                    }}
                  ></dotlottie-player>
                </div>
                {/* White shimmer effect overlay (masked to interior only, excluding stroke) */}
                <div
                  className="absolute pointer-events-none"
                  style={{ left: 0, right: 0, top: 0, bottom: 0, zIndex: 15 }}
                >
                  <svg
                    viewBox="0 0 205 67"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ display: 'block' }}
                  >
                    <defs>
                      {/* Mask: interior path filled white, with a thin black stroke to carve out the outline area */}
                      <mask id="survival-shimmer-mask" maskUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="205" height="67" fill="black" />
                        <path
                          d="M10.0748 6.8152C10.1702 5.78665 11.0332 5 12.0662 5H197.736C198.914 5 199.837 6.01229 199.728 7.1848L194.856 59.6858C194.76 60.7143 193.897 61.501 192.864 61.501H7.19418C6.01663 61.501 5.09394 60.4887 5.20275 59.3162L10.0748 6.8152Z"
                          fill="white"
                          stroke="black"
                          strokeWidth="1.8" /* thinner to let shimmer reach closer to the top interior without touching the outline */
                          strokeLinejoin="round"
                        />
                      </mask>
                      {/* Subtle glow to make the white lines shine */}
                      <filter id="shimmer-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Use foreignObject to host the dotlottie-player, apply the mask, and filter for shine */}
                    <g filter="url(#shimmer-glow)">
                      <foreignObject x="0" y="0" width="205" height="67" mask="url(#survival-shimmer-mask)">
                        <div style={{ width: '100%', height: '100%' }}>
                          <dotlottie-player
                            src="/NewDailyUI/White%20Shimmer%20Effect%20for%20Buttons.lottie"
                            /* manual loop with delay via onComplete handler */
                            mode="normal"
                            background="transparent"
                            speed={4}
                            ref={survivalShimmerRef as any}
                            style={{
                              width: '100%',
                              height: '100%',
                              // Mobile-corrected positioning: neutralize offset on small screens
                              transform: isMobile 
                                ? 'translateY(0%) translateZ(0) scale(1.0, 1.0)' // Mobile: exact alignment
                                : 'translateY(-3.0%) translateZ(0) scale(1.02, 1.06)', // Desktop: original positioning
                              transformOrigin: 'center',
                              mixBlendMode: 'screen',
                              filter: 'drop-shadow(0 0 9px rgba(255,255,255,0.45)) brightness(1.1)',
                              opacity: 0.18,
                            }}
                          ></dotlottie-player>
                        </div>
                      </foreignObject>
                    </g>
                  </svg>
                </div>
                {/* Overlay label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 20 }}>
                  <h3
                    className={language === 'he' ? 'survival-home-button-title' : ''}
                    style={{
                      fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                      fontWeight: 900,
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      lineHeight: 1,
                      textShadow:
                        '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 6px 6px rgba(0,0,0,0.35)',
                      fontSize: 'clamp(24px, 6.4vw, 42px)'
                    }}
                  >
                    {t('home.survival.title')}
                  </h3>
                </div>
              </div>
            </button>
            </motion.div>
          </div>
        </div>

        {/* Footer - SECONDARY BUTTONS ROW - positioned at bottom with safe area */}
        <div className="w-full flex justify-center mt-auto bottom-buttons-tablet"
             style={{
               marginTop: isMobile ? '14rem' : '4rem', // Mobile unchanged, PC buttons moved lower
               marginBottom: isMobile ? '0.75rem' : '1rem', // Small space from bottom edge
               paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))'
             }}>
          <div className="w-full max-w-md lg:max-w-lg rounded-2xl">
            <div className="flex w-full max-w-[28rem] lg:max-w-[34rem] mx-auto gap-6 lg:gap-8 relative">
              {language === 'he' ? (
                <>
                  {/* {t('home.join.community')} (hebrew: placed first/left in DOM for RTL) */}
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ y: 1, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.35 }}
                      className="w-full"
                    >
                      <div className="secondary-cta-container">
                        <button
                          onClick={() => navigate('/join-us')}
                          className="secondary-cta-button block w-full h-full relative focus:outline-none"
                          style={{ zIndex: 1 }}
                          aria-label={t('home.join.community')}
                        >
                          <img
                            src="/NewDailyUI/JoinUsButton.svg"
                            alt=""
                            className="w-full h-full object-contain select-none pointer-events-none"
                            draggable={false}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                            <span 
                              className="text-lg md:text-xl lg:text-2xl"
                              style={{
                                fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                                fontWeight: '900',
                                color: '#FFFFFF',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 6px 6px rgba(0,0,0,0.35)',
                                transform: language === 'he' ? 'translateY(-20%)' : 'translateY(-5%)',
                                transformOrigin: 'center'
                              }}
                            >
                              {t('home.join.community')}
                            </span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  {/* {t('home.tier.list')} (hebrew: placed second/right in DOM for RTL) */}
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ y: 1, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.35 }}
                      className="w-full"
                    >
                      <div className="secondary-cta-container">
                        <button
                          onClick={() => navigate('/tier-list')}
                          className="secondary-cta-button block w-full h-full relative focus:outline-none"
                          style={{ zIndex: 1 }}
                          aria-label={t('home.tier.list')}
                        >
                          <img
                            src="/NewDailyUI/TierListButton.svg"
                            alt=""
                            className="w-full h-full object-contain select-none pointer-events-none"
                            draggable={false}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                            <span 
                              className="text-lg md:text-xl lg:text-2xl"
                              style={{
                                fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                                fontWeight: '900',
                                color: '#FFFFFF',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 6px 6px rgba(0,0,0,0.35)',
                                transform: language === 'he' ? 'translateY(-20%)' : 'translateY(-5%)',
                                transformOrigin: 'center'
                              }}
                            >
                              {t('home.tier.list')}
                            </span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </>
              ) : (
                <>
                  {/* {t('home.tier.list')} (english: left) */}
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ y: 1, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.35 }}
                      className="w-full"
                    >
                      <div className="secondary-cta-container">
                        <button
                          onClick={() => navigate('/tier-list')}
                          className="secondary-cta-button block w-full h-full relative focus:outline-none"
                          style={{ zIndex: 1 }}
                          aria-label={t('home.tier.list')}
                        >
                          <img
                            src="/NewDailyUI/TierListButton.svg"
                            alt=""
                            className="w-full h-full object-contain select-none pointer-events-none"
                            draggable={false}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                            <span 
                              className="text-lg md:text-xl lg:text-2xl"
                              style={{
                                fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                                fontWeight: '900',
                                color: '#FFFFFF',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 6px 6px rgba(0,0,0,0.35)',
                                transform: language === 'he' ? 'translateY(-20%)' : 'translateY(-5%)',
                                transformOrigin: 'center'
                              }}
                            >
                              {t('home.tier.list')}
                            </span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  {/* {t('home.join.community')} (english: right) */}
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ y: 1, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.35 }}
                      className="w-full"
                    >
                      <div className="secondary-cta-container">
                        <button
                          onClick={() => navigate('/join-us')}
                          className="secondary-cta-button block w-full h-full relative focus:outline-none"
                          style={{ zIndex: 1 }}
                          aria-label={t('home.join.community')}
                        >
                          <img
                            src="/NewDailyUI/JoinUsButton.svg"
                            alt=""
                            className="w-full h-full object-contain select-none pointer-events-none"
                            draggable={false}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                            <span 
                              className="text-lg md:text-xl lg:text-2xl"
                              style={{
                                fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                                fontWeight: '900',
                                color: '#FFFFFF',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 6px 6px rgba(0,0,0,0.35)',
                                transform: language === 'he' ? 'translateY(-20%)' : 'translateY(-5%)',
                                transformOrigin: 'center'
                              }}
                            >
                              {t('home.join.community')}
                            </span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
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

          /* Secondary CTA (Join Us, Tier List) image-based buttons */
          .secondary-cta-container {
            width: 100%;
            position: relative;
            height: 72px; /* further increased mobile height */
          }
          @media (min-width: 768px) and (max-width: 1023px) { /* tablet only */
            .secondary-cta-container { height: 75px; } /* tablet height between mobile and desktop */
          }
          @media (min-width: 1024px) { /* lg */
            .secondary-cta-container { height: 78px; } /* desktop height */
          }
          .secondary-cta-button {
            cursor: pointer;
            transform: translateY(-16%);
            transition: transform 0.15s ease;
          }
          .secondary-cta-button:active {
            transform: translateY(0);
          }

          /* Shared CTA plate responsive transforms */
          .cta-shared-plate {
            transform: translateY(-16%) scaleX(2.35) scaleY(1.18);
          }
          @media (min-width: 1024px) { /* lg and up */
            .cta-shared-plate {
              transform: translateY(-16%) scaleX(2.57) scaleY(1.18);
            }
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
            /* Palette centered on #353C52 */
            background: linear-gradient(180deg, #4A5470 0%, #353C52 55%, #262C3D 100%);
          }

          .retro-header-button-user {
            background: linear-gradient(#2D5016 0%, #1A3009 100%);
          }

          /* Mini header retro styles removed (icon-only language toggles) */

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

          /* Breathing for Play Now button (subtler and a bit slower) */
          .logo-breathe-strong-fast {
            animation: logo-breath-strong-fast 5.5s ease-in-out infinite;
          }
          @keyframes logo-breath-strong-fast {
            0%, 100% {
              transform: scale(1);
              filter: brightness(1);
            }
            50% {
              transform: scale(1.03);
              filter: brightness(1.05);
            }
          }

          /* Secondary CTA label size adjustments per language */
          html[lang='en'] .secondary-cta-container > button > div > span {
            transform: translateY(-5%) scale(1.38) !important; /* ~+15% from 1.20 */
            transform-origin: center;
          }
          html[lang='he'] .secondary-cta-container > button > div > span {
            transform: translateY(-22%) scale(1.5) !important; /* further increased size for Hebrew labels: "בראולרים" and "קהילה" */
            transform-origin: center;
          }

          /* ===== TABLET-SPECIFIC IMPROVEMENTS (768px - 1023px) ===== */
          
          /* iPad Mini (768px-819px) - Base tablet size */
          @media (min-width: 768px) and (max-width: 819px) {
            .daily-hero-container {
              transform: scale(1.02) !important;
              margin-top: 1rem !important;
            }
            .survival-button-tablet {
              width: 320px !important;
              margin-top: 1.5rem !important;
            }
            .bottom-buttons-tablet {
              margin-top: 3.5rem !important;
            }
            .secondary-cta-container {
              height: 70px !important;
            }
            .main-content-tablet {
              gap: 1.5rem !important;
              padding-bottom: 2rem !important;
            }
            .flex.w-full.max-w-\\[28rem\\] {
              max-width: 24rem !important;
            }
          }

          /* iPad Air (820px-999px) - Scaled up to match iPad Mini */
          @media (min-width: 820px) and (max-width: 999px) {
            .daily-hero-container {
              transform: scale(1.12) !important; /* 10% larger than iPad Mini */
              margin-top: 1.2rem !important;
            }
            .survival-button-tablet {
              width: 360px !important; /* Larger for iPad Air */
              margin-top: 1.7rem !important;
            }
            .bottom-buttons-tablet {
              margin-top: 4rem !important;
            }
            .secondary-cta-container {
              height: 78px !important; /* Larger buttons */
            }
            .main-content-tablet {
              gap: 1.8rem !important;
              padding-bottom: 2.4rem !important;
            }
            .flex.w-full.max-w-\\[28rem\\] {
              max-width: 27rem !important;
            }
          }

          /* iPad Pro (1000px-1023px) - Scaled up significantly to match iPad Mini */
          @media (min-width: 1000px) and (max-width: 1023px) {
            .daily-hero-container {
              transform: scale(1.45) !important; /* 45% larger than iPad Mini for much bigger appearance */
              margin-top: 2rem !important;
            }
            .survival-button-tablet {
              width: 480px !important; /* Much larger for iPad Pro */
              margin-top: 2.5rem !important;
            }
            .bottom-buttons-tablet {
              margin-top: 6.5rem !important; /* Much more spacing */
            }
            .secondary-cta-container {
              height: 95px !important; /* Much larger buttons */
            }
            .main-content-tablet {
              gap: 2.8rem !important; /* Larger gaps */
              padding-bottom: 4rem !important; /* More padding */
            }
            .flex.w-full.max-w-\\[28rem\\] {
              max-width: 36rem !important; /* Much wider container */
            }
          }

          /* Common tablet rules for all sizes */
          @media (min-width: 768px) and (max-width: 1023px) {
            .flex-1 {
              justify-content: space-between !important;
            }
          }

          /* Darker background overlay for all devices */
          .home-background-overlay::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.2); /* Dark overlay - increase opacity for more darkness */
            z-index: 1;
            pointer-events: none;
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default Index;
