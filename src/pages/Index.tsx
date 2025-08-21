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
      className="h-screen text-white overflow-hidden flex flex-col relative"
      style={{
        backgroundImage: 'url(/BRAWLDLE-HOME-BACKGROUND-MOBILE.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Starfield overlay above background, below UI */}
      <StarField shootingStars />
      <div className="px-4 flex flex-col min-h-screen overflow-x-hidden overflow-y-hidden relative z-10">
        
        {/* Header utilities - fixed top bar flush to top edge */}
        <div className="flex items-center justify-between pt-2 pb-1 flex-shrink-0 w-full lg:w-[42rem] mx-auto lg:px-0 top-bar"
            style={{
              transform: `scale(${topBarScale})`,
              transformOrigin: 'top center',
              paddingLeft: isMobile ? '2px' : undefined,
              paddingRight: isMobile ? '2px' : undefined
            }}>
          {/* Left - Feedback button (new SVG as the whole button) */}
          <motion.button
            onClick={() => navigate('/feedback', { state: { fromHome: true } })}
            aria-label={t('home.feedback')}
            title={t('home.feedback')}
            style={{
              width: isMobile ? '50px' : '48px',
              height: isMobile ? '48px' : '44px',
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
              src="/NewDailyUI/FeedbackButton.svg"
              alt=""
              draggable={false}
              className="select-none pointer-events-none"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </motion.button>

          {/* Right - Language + Auth with retro styling */}
          <div className="flex items-center gap-4">
            {/* Language toggle with retro 3D style */}
            <div className="flex gap-1">
              <div className="retro-header-mini-container" style={{ width: isMobile ? '44px' : '40px', height: isMobile ? '44px' : '40px' }}>
                <div className="retro-header-mini-border">
                  <div className="retro-header-mini-base">
                    <button
                      onClick={() => { if (language !== 'en') changeLanguage('en'); }}
                      disabled={language === 'en'}
                      aria-disabled={language === 'en'}
                      className={cn(
                        'retro-header-mini-button',
                        language === 'en' ? 'retro-header-mini-active cursor-not-allowed' : 'retro-header-mini-inactive'
                      )}
                      tabIndex={language === 'en' ? -1 : 0}
                    >
                      <Image
                        src="/USAIcon.png"
                        alt="English"
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full object-contain"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="retro-header-mini-container" style={{ width: isMobile ? '44px' : '40px', height: isMobile ? '44px' : '40px' }}>
                <div className="retro-header-mini-border">
                  <div className="retro-header-mini-base">
                    <button
                      onClick={() => { if (language !== 'he') changeLanguage('he'); }}
                      disabled={language === 'he'}
                      aria-disabled={language === 'he'}
                      className={cn(
                        'retro-header-mini-button',
                        language === 'he' ? 'retro-header-mini-active cursor-not-allowed' : 'retro-header-mini-inactive'
                      )}
                      tabIndex={language === 'he' ? -1 : 0}
                    >
                      <Image
                        src="/IsraelIcon.png"
                        alt="Hebrew"
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full object-contain"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth controls — unauthenticated shows icon only (no plate) */}
            {!isLoggedIn ? (
              <motion.button
                onClick={handleSignUp}
                aria-label="Account"
                title="Account"
                style={{
                  width: isMobile ? '52px' : '48px',
                  height: isMobile ? '52px' : '48px',
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
              <div className="retro-header-button-container" style={{ height: isMobile ? '48px' : '44px' }}>
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
        <div className="text-center mb-2 lg:mb-4 flex-shrink-0">
          {/* Brawldle logo image with breathing animation */}
          <Image
            src={language === 'he' ? '/Brawldle%20Hebrew%20Logo.png' : '/Brawldle%20Logo.png'}
            alt="Brawldle Logo"
            className={cn(
              "relative z-10 -mt-8 lg:-mt-16 mb-0 lg:mb-0 select-none block mx-auto logo-breathe",
              // Reduced ~17% on mobile (270px -> 224px) and ~6% on desktop (355px -> 334px)
              isMobile ? 'w-[224px]' : 'w-[334px]'
            )}
            priority
          />
        </div>

        {/* Main content area - mobile-first layout */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 gap-8 md:gap-12 lg:gap-8">
          
          {/* Daily Challenges Hero */}
          <DailyChallengesHero />

          {/* Next puzzle countdown - minimal container */}
          <div className="text-center -mt-8 md:-mt-10 lg:-mt-8">
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
            className="mx-auto mb-12 lg:mb-10 w-[clamp(252px,43.2vw,396px)] lg:w-[clamp(230px,35.4vw,335px)]"
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
                              // Slight upscale and upward nudge so the animation reaches the top interior without touching the stroke
                              transform: 'translateY(-3.0%) translateZ(0) scale(1.02, 1.06)',
                              transformOrigin: 'center',
                              mixBlendMode: 'screen',
                              filter: 'drop-shadow(0 0 9px rgba(255,255,255,0.45)) brightness(1.1)',
                              opacity: 0.22,
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
                        '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)',
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

        {/* Footer - SECONDARY BUTTONS ROW - positioned at bottom */}
        <div className="w-full flex justify-center mt-auto mb-4 lg:mb-6">
          <div className="w-full max-w-md lg:max-w-lg rounded-2xl">
            <div className="flex w-full max-w-[26rem] lg:max-w-[32rem] mx-auto gap-6 lg:gap-8 relative">
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
                                textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)',
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
                                textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)',
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
                                textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)',
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
                                textShadow: '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 4px 4px rgba(0,0,0,0.25)',
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
            height: 60px; /* mobile/tablet default */
          }
          @media (min-width: 1024px) { /* lg */
            .secondary-cta-container { height: 72px; }
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

          /* Make the currently selected language look half-pressed (same as hover) */
          .retro-header-mini-button.retro-header-mini-active {
            transform: translateY(-8%);
          }

          /* When clicking the active language, allow full press */
          .retro-header-mini-button.retro-header-mini-active:active {
            transform: translateY(0);
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
            transform: translateY(-20%) scale(1.27) !important; /* ~+15% from 1.10 base */
            transform-origin: center;
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default Index;
