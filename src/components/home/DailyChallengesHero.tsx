import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const DailyChallengesHero: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : true
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onResize = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

  const onOpenDaily = () => navigate('/daily');

  return (
    <div className="w-full select-none" aria-label="Daily Challenges section">
      <div className="relative w-full flex justify-center overflow-visible">
        {/* Main container with SVG background */}
        <div 
          className="relative flex flex-col items-center justify-between"
          style={{
            width: '320px',
            height: '285px',
            backgroundImage: "url('/NewDailyUI/Daily\'s section container.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            filter: 'drop-shadow(0px 6px 6px rgba(0, 0, 0, 0.25))',
            padding: '28px 21px 35px 21px'
          }}
        >
          {/* Header bar background */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '0.84%',
              right: '0.88%',
              top: '0.78%',
              bottom: '77.2%',
              background: '#2A3147'
            }}
          />
          
          {/* Content area background with kaiju image and overlay */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '0.84%',
              right: '0.88%',
              top: '18%',
              bottom: '15%',
              background: "linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/NewDailyUI/background_kaiju.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Title */}
          <div className="absolute" style={{ top: '21px', left: '50%', transform: 'translateX(-50%)' }}>
            <h2 
              className="text-white text-center"
              style={{
                fontFamily: "'Lilita One', cursive",
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '18px',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                margin: 0,
                padding: 0
              }}
            >
              DAILY CHALLENGES
            </h2>
          </div>

          {/* Icons carousel area */}
          <div 
            className="relative"
            style={{
              width: '280px',
              height: '100px',
              marginTop: '60px',
              marginBottom: '20px'
            }}
          >
            {modes.map((mode, index) => {
              const position = (index - currentIndex + modes.length) % modes.length;
              let transform = 'translate(-50%, -50%)';
              let opacity = 0.4;
              let width = 50;
              let height = 50;
              let zIndex = 41;
              
              if (position === 0) {
                // Active center item
                opacity = 1;
                width = 62;
                height = 62;
                transform += ' scale(1.1)';
              } else if (position === 1) {
                // Next item (right)
                transform += ' translateX(91px) scale(0.8)';
                opacity = 0.3;
              } else if (position === modes.length - 1) {
                // Previous item (left)
                transform += ' translateX(-91px) scale(0.8)';
                opacity = 0.3;
              } else if (position === 2) {
                // Far next item
                transform += ' translateX(182px) scale(0.6)';
                opacity = 0;
              } else {
                // Hidden items
                transform += ' translateX(-182px) scale(0.6)';
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

          {/* Play button */}
          <div className="absolute" style={{ bottom: '35px', left: '50%', transform: 'translateX(-50%)' }}>
            <button 
              onClick={onOpenDaily}
              aria-label="Play Daily Challenges"
              className="relative border-none cursor-pointer flex items-center justify-center transition-transform duration-100 ease-in-out hover:-translate-y-px active:translate-y-px"
              style={{
                width: '220px',
                height: '71px',
                backgroundImage: "url('/NewDailyUI/Daily\'s Play Button.svg')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundColor: 'transparent',
                overflow: 'hidden'
              }}
            >
              <span 
                style={{
                  fontFamily: "'Lilita One', cursive",
                  fontWeight: 400,
                  fontSize: '22px',
                  lineHeight: '25px',
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: '#000000',
                  textShadow: 'none',
                  margin: 0,
                  padding: 0
                }}
              >
                PLAY NOW
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive adjustments for mobile */}
      <style>{`
        @media (max-width: 640px) {
          .daily-challenges-mobile {
            width: 280px !important;
            height: 250px !important;
            padding: 24px 18px 30px 18px !important;
          }
          
          .daily-challenges-mobile h2 {
            font-size: 14px !important;
            line-height: 16px !important;
          }
          
          .daily-challenges-mobile .icons-area {
            width: 240px !important;
            height: 80px !important;
            margin-top: 50px !important;
            margin-bottom: 15px !important;
          }
          
          .daily-challenges-mobile button {
            width: 180px !important;
            height: 58px !important;
          }
          
          .daily-challenges-mobile button span {
            font-size: 18px !important;
            line-height: 20px !important;
          }
          .dc-slide-item.dc-far-next { transform: translate(-50%, -50%) translateX(140px) scale(0.6); }
          .dc-slide-item.dc-hidden { transform: translate(-50%, -50%) translateX(-140px) scale(0.6); }
        }
        
        @media (min-width: 1024px) {
          .dc-new-container {
            width: 380px;
            height: 340px;
            padding: 33px 25px 42px 25px;
          }
          .dc-title {
            top: 25px;
          }
          .dc-title-text {
            font-size: 26px;
          }
          .dc-list { 
            height: 100px;
          }
          .dc-slide-item { width: 58px; height: 58px; }
          .dc-slide-item.dc-act { width: 72px; height: 72px; }
          .dc-slide-item.dc-prev { transform: translate(-50%, -50%) translateX(-105px) scale(0.8); }
          .dc-slide-item.dc-next { transform: translate(-50%, -50%) translateX(105px) scale(0.8); }
          .dc-slide-item.dc-far-next { transform: translate(-50%, -50%) translateX(210px) scale(0.6); }
          .dc-slide-item.dc-hidden { transform: translate(-50%, -50%) translateX(-210px) scale(0.6); }
        }

        /* Reduced motion: static row */
        @media (prefers-reduced-motion: reduce) {
          .dc-list { display: none; }
          .dc-row-fallback { display: flex; justify-content: center; gap: 10px; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .dc-row-fallback { display: none; }
        }
      `}</style>
    </div>
  );
};

export default DailyChallengesHero;
