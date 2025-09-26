import React, { PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getLanguage } from '@/lib/i18n';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

export type OrchestratorAxis = 'x' | 'y';

interface Props extends PropsWithChildren {
  modeKey: string | number;
  className?: string;
  disabled?: boolean;
  axis?: OrchestratorAxis; // default 'x' for RTL-aware slide
}

/**
 * DailyModeTransitionOrchestrator
 * - Centralized wrapper for mode content transitions
 * - Respects prefers-reduced-motion
 * - Flips slide direction for RTL languages when axis === 'x'
 * - Provides a single place to evolve toward element-level orchestration later
 */
const DailyModeTransitionOrchestrator: React.FC<Props> = ({
  modeKey,
  className,
  disabled = false,
  axis = 'x',
  children,
}) => {
  const { motionOK, transition } = useMotionPrefs();
  const lang = getLanguage();
  const isRTL = lang === 'he';
  const shouldAnimate = motionOK && !disabled;

  // Apple-style smooth animation parameters
  const delta = 24; // More pronounced slide for better visual feedback
  
  // Slower, more elegant spring configuration - Apple's signature feel but relaxed
  const appleSpring = {
    type: "spring" as const,
    stiffness: 280,
    damping: 28,
    mass: 1.0,
    restSpeed: 0.01,
    restDelta: 0.01
  };

  // Layered transitions with slower, more deliberate timing
  const fastTransition = { ...appleSpring, stiffness: 350, damping: 30 }; // For opacity - still quickest
  const mediumTransition = { ...appleSpring, stiffness: 280, damping: 28 }; // For transforms - moderate
  const slowTransition = { ...appleSpring, stiffness: 220, damping: 25 }; // For scale - slowest

  const initial = shouldAnimate
    ? axis === 'x'
      ? { 
          opacity: 0, 
          x: isRTL ? delta : -delta, 
          scale: 0.96,
          filter: "blur(1px)"
        }
      : { 
          opacity: 0, 
          y: 20, 
          scale: 0.96,
          filter: "blur(1px)"
        }
    : { opacity: 0 };

  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      opacity: fastTransition,
      x: mediumTransition,
      y: mediumTransition,
      scale: slowTransition,
      filter: fastTransition,
      staggerChildren: 0.08, // More pronounced stagger - elements appear one by one
      delayChildren: 0.1 // Small delay before children start animating
    }
  };

  const exit = shouldAnimate
    ? axis === 'x'
      ? {
          opacity: 0,
          x: isRTL ? -delta : delta,
          scale: 1.04,
          filter: "blur(1px)",
          transition: {
            opacity: { ...fastTransition, stiffness: 600, damping: 35 },
            x: { ...mediumTransition, stiffness: 450 },
            scale: { ...slowTransition, stiffness: 350 },
            filter: { ...fastTransition, stiffness: 600 }
          }
        }
      : {
          opacity: 0,
          y: -20,
          scale: 1.04,
          filter: "blur(1px)",
          transition: {
            opacity: { ...fastTransition, stiffness: 600, damping: 35 },
            y: { ...mediumTransition, stiffness: 450 },
            scale: { ...slowTransition, stiffness: 350 },
            filter: { ...fastTransition, stiffness: 600 }
          }
        }
    : { opacity: 0, transition: fastTransition };

  // If animations are disabled or motion is not OK, render children statically
  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  // Variants for child elements to use - creates beautiful staggered animations
  const childVariants = {
    initial: {
      opacity: 0,
      y: 12,
      scale: 0.97
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        opacity: { duration: 0.4, ease: "easeOut" },
        y: mediumTransition,
        scale: slowTransition
      }
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className={className} style={{ isolation: 'isolate' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div 
          key={modeKey} 
          initial={initial} 
          animate={animate} 
          exit={exit}
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
              }
            }
          }}
          style={{ 
            willChange: 'transform, opacity, filter',
            backfaceVisibility: 'hidden', // Prevents visual glitches on Safari
            WebkitFontSmoothing: 'antialiased', // Maintains text quality during animation
            transformStyle: 'preserve-3d' // Better performance for layered animations
          }}
        >
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                ...child.props,
                // Pass down the child variants so components can use them
                childVariants,
                // Add a custom prop to indicate stagger index
                staggerIndex: index
              } as any);
            }
            return child;
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DailyModeTransitionOrchestrator;
