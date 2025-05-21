import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeButtonProps {
  className?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className={cn(
        "fixed top-4 left-4 z-[100]", // Changed from fixed to fixed and increased z-index
        "brawl-button border-4 border-yellow-400",
        "shadow-xl hover:shadow-yellow-400/80 hover:scale-110 hover:shadow-2xl hover-glow",
        "text-white bg-brawl-yellow !rounded-full p-3 transition-all duration-300",
        className
      )}
      style={{ boxShadow: '0 4px 24px 0 #000, 0 0 12px 2px #FFD600' }}
      aria-label="Go to Home"
    >
      <Home size={32} className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] text-brawl-blue" />
    </button>
  );
};

export default HomeButton; 