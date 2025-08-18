import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const DailyChallengesHero: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
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
        {/* Container using exact SVG file with responsive sizing */}
        <div className="relative mx-auto" style={{ 
          width: 'clamp(200px, 30vw, 280px)', 
          height: 'clamp(180px, 26vw, 240px)',
          maxWidth: '280px',
          aspectRatio: '219/193'
        }}>
          <img 
            src="/NewDailyUI/Daily's section container.svg"
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
          
          {/* Header text overlay positioned in middle of gray background */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
              width: '100%',
              height: 'clamp(25px, 12%, 35px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <h2 
              style={{
                fontFamily: "'Lilita One', cursive",
                fontWeight: '900',
                fontSize: 'clamp(16px, 4vw, 22px)',
                lineHeight: '1.1',
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: '#FFECD2',
                WebkitTextStroke: 'clamp(0.5px, 0.8px, 1px) #000000',
                textShadow: '0px 1px 0px #000000',
                margin: 0,
                padding: 0,
                whiteSpace: 'nowrap'
              }}
            >
              DAILY CHALLENGES
            </h2>
          </div>
          
          {/* Icons carousel positioned within SVG container */}
          <div 
            className="relative"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(140px, 75%, 200px)',
              height: 'clamp(40px, 25%, 60px)',
              zIndex: 10
            }}
          >
              {modes.map((mode, index) => {
                const position = (index - currentIndex + modes.length) % modes.length;
                let transform = 'translate(-50%, -50%)';
                let opacity = 0.4;
                let width = 32;
                let height = 32;
                let zIndex = 41;
                
                if (position === 0) {
                  // Active center item
                  opacity = 1;
                  width = 42;
                  height = 42;
                  transform += ' scale(1.1)';
                } else if (position === 1) {
                  // Next item (right)
                  transform += ' translateX(50px) scale(0.8)';
                  opacity = 0.3;
                } else if (position === modes.length - 1) {
                  // Previous item (left)
                  transform += ' translateX(-50px) scale(0.8)';
                  opacity = 0.3;
                } else if (position === 2) {
                  // Far next item
                  transform += ' translateX(100px) scale(0.6)';
                  opacity = 0;
                } else {
                  // Hidden items
                  transform += ' translateX(-100px) scale(0.6)';
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

          {/* Play button using exact SVG file */}
          <button 
            onClick={onOpenDaily}
            aria-label="Play Daily Challenges"
            className="border-none cursor-pointer transition-transform duration-100 ease-in-out hover:-translate-y-1 active:translate-y-1 hover:scale-105 active:scale-95"
            style={{
              position: 'absolute',
              width: 'clamp(130px, 70%, 180px)',
              height: 'clamp(45px, 25%, 65px)',
              left: '50%',
              top: 'clamp(105px, 62%, 140px)',
              transform: 'translateX(-50%)',
              background: 'transparent',
              zIndex: 20
            }}
          >
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
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                width: '90%',
                textAlign: 'center'
              }}
            >
              <span 
                style={{
                  fontFamily: "'Lilita One', cursive",
                  fontWeight: '900',
                  fontSize: 'clamp(20px, 5vw, 28px)',
                  lineHeight: '1.1',
                  letterSpacing: '-0.01em',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  WebkitTextStroke: 'clamp(0.8px, 1px, 1.2px) #000000',
                  textShadow: '0px 1px 0px #000000',
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}
              >
                PLAY NOW
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengesHero;
