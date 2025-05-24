import { useNavigate } from 'react-router-dom';

/**
 * Epic animated Survival card with lava glow and ember particles.
 * Premium mode that stands out from other game modes.
 */
export default function SurvivalCardAnimated() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/survival');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Main animated card container */}
      <div 
        className="group relative overflow-hidden rounded-[24px] transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 cursor-pointer w-full max-w-[680px]"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Play Survival Mode - Ultimate Challenge"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Layer 1: Lava glow background */}
        <div className="absolute inset-0 z-0 lava-glow" />
        
        {/* Layer 2: Dark vignette edges */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        
        {/* Layer 3: Floating ember particles */}
        <div className="absolute inset-0 z-0 lava-particles overflow-hidden rounded-[24px]">
          {Array.from({ length: 15 }, (_, i) => (
            <span 
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full animate-pulse"
              style={{ 
                bottom: '-10px',
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              } as React.CSSProperties} 
            />
          ))}
        </div>
        
        {/* Layer 4: Card content */}
        <div className="relative z-10 bg-[url(/Survival_card_background.png)] bg-cover bg-center rounded-[24px] p-8 py-12 flex items-center justify-center min-h-[180px] border border-orange-500/30">
          <h3 className="survival-title text-center text-6xl font-extrabold tracking-wider text-yellow-200 drop-shadow-lg">
            SURVIVAL
          </h3>
        </div>
        
        {/* Enhanced glow on hover */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-orange-400/20 via-yellow-400/30 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-[24px]" />
      </div>
      
      {/* Description below the card */}
      <p className="mt-4 text-center text-lg font-bold text-white drop-shadow-md max-w-md">
        Test your skills in the ultimate challenge
      </p>
    </div>
  );
} 