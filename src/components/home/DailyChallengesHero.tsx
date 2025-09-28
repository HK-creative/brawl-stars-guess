import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

// Memoized Play Now text to avoid frequent re-renders from carousel state updates
const PlayNowText: React.FC<{ language: string }> = React.memo(({ language }) => (
  <span
    dir={language === 'he' ? 'rtl' : undefined}
    style={{
      fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
      fontWeight: '900',
      fontSize: 'clamp(27px, 5.5vw, 30px)',
      lineHeight: '1',
      letterSpacing: '0.02em',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      textShadow:
        '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 6px 6px rgba(0,0,0,0.35)',
      display: 'block',
      whiteSpace: 'nowrap',
      position: 'relative',
      zIndex: 2,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility',
      transform: language === 'he' ? 'translateZ(0) translateY(-16%)' : 'translateZ(0)'
    }}
  >
    {language === 'he' ? 'שחק עכשיו' : 'PLAY NOW'}
  </span>
));
PlayNowText.displayName = 'PlayNowText';

const DailyChallengesHero: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isDesktop, setIsDesktop] = useState(false);
  const dailyScale = isDesktop ? 0.9775 : 0.935;
  useEffect(() => {
    // Desktop breakpoint detection to allow PC-specific typography without affecting mobile
    const mq = window.matchMedia('(min-width: 1024px), (hover: hover) and (pointer: fine)');
    const update = () => setIsDesktop(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else {
      // Fallback for older browsers
      // @ts-ignore
      mq.addListener(update);
      return () => {
        // @ts-ignore
        mq.removeListener(update);
      };
    }
  }, []);
  
  const modes = useMemo(
    () => [
      { name: 'classic', icon: '/ClassicIcon.png' },
      { name: 'audio', icon: '/AudioIcon.png' },
      { name: 'gadget', icon: '/GadgetIcon.png' },
      { name: 'starpower', icon: '/StarpowerIcon.png' },
      { name: 'pixels', icon: '/PixelsIcon.png' },
    ],
    []
  );

  // Auto-slide animation with state management
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % modes.length);
    }, 1400);

    return () => clearInterval(timer);
  }, [modes.length]);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const navigateWithOrigin = (clientX?: number, clientY?: number) => {
    let xPct = 50;
    let yPct = 50;
    if (typeof clientX === 'number' && typeof clientY === 'number' && clientX > 0 && clientY > 0) {
      xPct = Math.max(0, Math.min(100, (clientX / window.innerWidth) * 100));
      yPct = Math.max(0, Math.min(100, (clientY / window.innerHeight) * 100));
    } else if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      xPct = Math.max(0, Math.min(100, (cx / window.innerWidth) * 100));
      yPct = Math.max(0, Math.min(100, (cy / window.innerHeight) * 100));
    }
    navigate('/daily', { state: { dailyOrigin: { x: xPct, y: yPct } } });
  };

  return (
    <div className="w-full select-none" aria-label="Daily Challenges section">
      <div className="relative w-full flex justify-center overflow-visible">
        {/* Scale wrapper to enlarge the entire section responsively */}
        <div style={{ transform: `scale(${dailyScale})`, transformOrigin: 'center' }}>
        {/* Container using exact SVG file with responsive sizing */}
        <motion.div
          role="button"
          tabIndex={0}
          ref={cardRef}
          onClick={(e) => navigateWithOrigin(e.clientX, e.clientY)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigateWithOrigin();
            }
          }}
          aria-label="Open Daily Challenges"
          className="relative mx-auto cursor-pointer focus:outline-none"
          style={{ 
            width: 'clamp(266px, 33vw, 306px)', 
            height: 'clamp(239px, 28.4vw, 262px)',
            maxWidth: '306px',
            aspectRatio: '219/193'
          }}
          initial={{ y: 0, scale: 1 }}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ y: 1, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.35 }}
        >
          {/* Button micro-interactions handled via whileHover/whileTap; no click ripple */}
          <img 
            src="/NewDailyUI/Daily's section container.png"
            alt="Daily Challenges Container"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'fill'
            }}
          />
          
          {/* Header text overlay centered vertically within the gray band */}
          <div
            style={{
              position: 'absolute',
              top: '1.75%',
              left: 0,
              transform: 'none',
              zIndex: 5,
              width: '100%',
              height: '21%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <h2 
              dir={language === 'he' ? 'rtl' : undefined}
              style={{
                fontFamily: language === 'he' ? "'Abraham', sans-serif" : "'Lilita One', cursive",
                fontWeight: '900',
                fontSize: language === 'he'
                  ? (isDesktop
                      // Noticeably smaller on desktop only; mobile remains as tuned
                      ? 'clamp(12px, 0.6vw, 15px)'
                      : 'clamp(19px, 1.1vw, 22px)')
                  : 'clamp(21px, 3.1vw, 24px)',
                lineHeight: '1',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                textShadow:
                  '0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 6px 6px rgba(0,0,0,0.35)',
                display: 'inline-block',
                transform: language === 'he' && isDesktop ? 'translateY(-7%) scale(0.86)' : 'translateY(-7%)',
                margin: 0,
                padding: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {language === 'he' ? 'אתגרי היום' : 'DAILY CHALLENGES'}
            </h2>
          </div>

          {/* Mission icon - top-right overlay inside the section */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-3%',
              right: '-1.5%',
              width: isDesktop ? 'clamp(40px, 13%, 64px)' : 'clamp(30px, 12%, 46px)',
              height: 'auto',
              zIndex: 28,
              pointerEvents: 'none'
            }}
          >
            <img
              src="/NewDailyUI/MissionIcon.svg"
              alt=""
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))'
              }}
              draggable={false}
            />
          </div>

          {/* Icons carousel positioned within SVG container */}
          <div 
            className="relative"
            style={{
              position: 'absolute',
              left: '50%',
              top: '45%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(186px, 75%, 218px)',
              height: 'clamp(53px, 25%, 66px)',
              zIndex: 10
            }}
          >
              {modes.map((mode, index) => {
                const position = (index - currentIndex + modes.length) % modes.length;
                let transform = 'translate(-50%, -50%)';
                let opacity = 0.4;
                let width = 45;
                let height = 45;
                let zIndex = 41;
                
                if (position === 0) {
                  // Active center item
                  opacity = 1;
                  width = 59;
                  height = 59;
                  transform += ' scale(1.1)';
                } else if (position === 1) {
                  // Next item (right)
                  transform += ' translateX(70px) scale(0.8)';
                  opacity = 0.3;
                } else if (position === modes.length - 1) {
                  // Previous item (left)
                  transform += ' translateX(-70px) scale(0.8)';
                  opacity = 0.3;
                } else if (position === 2) {
                  // Far next item
                  transform += ' translateX(140px) scale(0.6)';
                  opacity = 0;
                } else {
                  // Hidden items
                  transform += ' translateX(-140px) scale(0.6)';
                  opacity = 0;
                }

                return (
                  <div
                    key={mode.name}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform,
                      width: `${width}px`,
                      height: `${height}px`,
                      opacity,
                      transition: 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out, width 0.8s ease-in-out, height 0.8s ease-in-out',
                      zIndex
                    }}
                  >
                    <img 
                      src={mode.icon} 
                      alt="" 
                      aria-hidden="true"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: position === 0 
                          ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' 
                          : 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))',
                        transition: 'filter 0.8s ease-in-out'
                      }}
                    />
                  </div>
                );
              })}
            </div>

          {/* Play button visuals (non-interactive; container is clickable) */}
          <div 
            aria-hidden="true"
            className="border-none cursor-pointer transition-transform duration-100 ease-in-out hover:-translate-y-1 active:translate-y-1 hover:scale-105 active:scale-95"
            style={{
              position: 'absolute',
              width: 'clamp(173px, 70%, 196px)',
              height: 'clamp(60px, 25%, 71px)',
              left: '50%',
              top: 'clamp(154px, 68%, 166px)',
              transform: 'translateX(-50%) translateZ(0)', // promote to own layer
              background: 'transparent',
              zIndex: 20
            }}
          >
            {/* Shared animation wrapper so image and text are perfectly in sync */}
            <div className="logo-breathe-strong-fast" style={{ width: '100%', height: '100%' }}>
              <img 
                src="/NewDailyUI/Daily's Play Button.svg"
                alt="Play Now Button"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill'
                }}
              />
              {/* Button text overlay positioned exactly */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) translateZ(0)', // own layer for text wrapper
                  zIndex: 1,
                  width: '90%',
                  textAlign: 'center',
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  isolation: 'isolate',
                  contain: 'paint style'
                }}
              >
                <PlayNowText language={language} />
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengesHero;
