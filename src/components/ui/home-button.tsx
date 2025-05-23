import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeButtonProps {
  className?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay for the initial animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      onClick={() => navigate('/')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed top-6 left-6 z-[100] group",
        "rounded-2xl p-0.5 transition-all duration-500 ease-out",
        "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500",
        "shadow-lg hover:shadow-2xl hover:shadow-amber-500/30",
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
        className
      )}
      style={{
        '--tw-ring-color': 'rgba(251, 191, 36, 0.5)',
        '--tw-ring-offset-shadow': '0 0 #0000',
        '--tw-ring-shadow': '0 0 #0000',
      } as React.CSSProperties}
      aria-label="Go to Home"
    >
      <div className={cn(
        "relative flex items-center justify-center",
        "w-14 h-14 rounded-2xl bg-gradient-to-br from-brawl-blue to-brawl-dark-blue",
        "transition-all duration-300 group-hover:scale-105 group-hover:shadow-inner",
        "border-2 border-amber-400/50",
        isHovered ? 'shadow-inner shadow-amber-400/20' : ''
      )}>
        <Home 
          size={28} 
          className={cn(
            "text-amber-300 transition-all duration-300",
            isHovered ? 'scale-110 text-amber-200' : 'scale-100',
            "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          )} 
          strokeWidth={2.5}
        />
        
        {/* Animated ring effect on hover */}
        <span className={cn(
          "absolute inset-0 rounded-xl border-2 border-amber-300/0",
          "transition-all duration-500 pointer-events-none",
          isHovered ? 'border-amber-300/40 scale-110 opacity-0' : ''
        )}></span>
        
        {/* Subtle pulse animation */}
        <span className={cn(
          "absolute inset-0 rounded-xl bg-amber-400/0",
          "animate-pulse transition-all duration-1000 pointer-events-none",
          isHovered ? 'bg-amber-400/5' : ''
        )}></span>
      </div>
    </button>
  );
};

export default HomeButton;