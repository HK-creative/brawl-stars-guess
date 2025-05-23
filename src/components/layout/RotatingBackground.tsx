import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Use mobile background image for both mobile and PC
const backgroundImage = '/BRAWLDLE-HOME-BACKGROUND-MOBILE.png';

interface RotatingBackgroundProps {
  showNextButton?: boolean;
}

const RotatingBackground: React.FC<RotatingBackgroundProps> = ({ showNextButton = false }) => {
  const [dailyImageIndex, setDailyImageIndex] = useState(0);
  const [currentDay, setCurrentDay] = useState(new Date().getDate());
  
  useEffect(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();

    if (dayOfMonth !== currentDay) {
      setCurrentDay(dayOfMonth);
    }

    const intervalId = setInterval(() => {
      const newDay = new Date().getDate();
      if (newDay !== currentDay) {
        setCurrentDay(newDay);
      }
    }, 60000 * 5);

    return () => clearInterval(intervalId);

  }, [currentDay]);
    
  // Add responsive styles for game mode cards
  const cardStyles = {
    mobile: {
      padding: '8px',
      margin: '4px',
      fontSize: '14px',
    },
    pc: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
  };

  // Apply styles based on screen size
  const isMobile = window.innerWidth <= 768;
  const cardStyle = isMobile ? cardStyles.mobile : cardStyles.pc;
  
  return (
    <div 
      className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Reduced opacity overlay - positioned behind all other elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/40 via-slate-800/30 to-slate-900/50" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-900/10 via-transparent to-purple-900/10" />
      <div className="absolute inset-0 z-0 bg-black/15" />
    </div>
  );
};

export default RotatingBackground;
