import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Update the background image path to match case-sensitive filenames and lowercase extensions
const pcBackgroundImage = '/BRAWLDLE-HOME-BACKGROUND.png';
const mobileBackgroundImage = '/BRAWLDLE-HOME-BACKGROUND-MOBILE.png';

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

  const currentBackgroundImage = isMobile ? mobileBackgroundImage : pcBackgroundImage;
  
  return (
    <div 
      className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `url('${currentBackgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay with increased opacity */}
      <div className="absolute inset-0 bg-black/50" /> {/* 50% opacity black overlay */}
    </div>
  );
};

export default RotatingBackground;
