import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  type?: 'fade' | 'slideUp' | 'slideDown' | 'scale' | 'slideLeft' | 'slideRight';
  duration?: number;
}

/**
 * AnimatedElement - A reusable component for staggered animations
 * Automatically integrates with DailyModeTransitionOrchestrator's timing
 */
export const AnimatedElement: React.FC<AnimatedElementProps> = ({ 
  children, 
  className,
  delay = 0,
  type = 'slideUp',
  duration = 0.5
}) => {
  const variants = {
    initial: () => {
      switch (type) {
        case 'fade':
          return { opacity: 0 };
        case 'slideUp':
          return { opacity: 0, y: 20, scale: 0.98 };
        case 'slideDown':
          return { opacity: 0, y: -20, scale: 0.98 };
        case 'slideLeft':
          return { opacity: 0, x: 20, scale: 0.98 };
        case 'slideRight':
          return { opacity: 0, x: -20, scale: 0.98 };
        case 'scale':
          return { opacity: 0, scale: 0.95 };
        default:
          return { opacity: 0, y: 20, scale: 0.98 };
      }
    },
    animate: () => {
      const baseAnimation = {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8,
          delay,
          duration
        }
      };
      return baseAnimation;
    },
    exit: () => {
      switch (type) {
        case 'fade':
          return { 
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" }
          };
        case 'slideUp':
          return { 
            opacity: 0, 
            y: -10, 
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeIn" }
          };
        case 'slideDown':
          return { 
            opacity: 0, 
            y: 10, 
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeIn" }
          };
        case 'slideLeft':
          return { 
            opacity: 0, 
            x: -20, 
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeIn" }
          };
        case 'slideRight':
          return { 
            opacity: 0, 
            x: 20, 
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeIn" }
          };
        case 'scale':
          return { 
            opacity: 0, 
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeIn" }
          };
        default:
          return { 
            opacity: 0, 
            y: -10, 
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeIn" }
          };
      }
    }
  };

  return (
    <motion.div
      className={cn(className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedElement;
