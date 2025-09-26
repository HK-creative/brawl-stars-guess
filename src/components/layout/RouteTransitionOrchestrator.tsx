import React, { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

interface Props extends PropsWithChildren {
  routeKey: string | number;
  className?: string;
  // Optional clip-path origin as viewport percentages (0-100)
  originPercent?: { x: number; y: number };
}

/**
 * RouteTransitionOrchestrator
 * - Lightweight wrapper to animate full-page route transitions
 * - Respects prefers-reduced-motion via useMotionPrefs
 * - Distinct blur+scale+slide transition between app <-> daily pages
 * - Background remains static; only the content layer animates
 */
const RouteTransitionOrchestrator: React.FC<Props> = ({ routeKey, className, originPercent, children }) => {
  const { motionOK, transition } = useMotionPrefs();
  const shouldAnimate = motionOK;

  const localDuration = (transition as { duration?: number }).duration ?? 0.28;
  const localTransition = { ...transition, duration: Math.min(localDuration + 0.08, 0.45) };

  if (!shouldAnimate) {
    return (
      <div className={className} style={{ 
        position: 'fixed', 
        inset: 0, 
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        isolation: 'isolate' // Prevent stacking context issues
      }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      key={routeKey}
      initial={
        // Both daily and app groups: clean fade transition without scrolling
        { opacity: 0, scale: 0.985, filter: 'blur(4px)' }
      }
      animate={
        { opacity: 1, scale: 1, filter: 'blur(0px)', transition: localTransition }
      }
      exit={
        // Both groups: simple fade exit
        { opacity: 0, scale: 1.015, filter: 'blur(6px)', transition: { ...localTransition, duration: Math.max(0.2, (localTransition as any).duration - 0.06) } }
      }
      style={{ 
        willChange: 'opacity, transform, filter', 
        position: 'fixed', 
        inset: 0,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        isolation: 'isolate' // Prevent stacking context issues
      }}
    >
      {children}
    </motion.div>
  );
}
;

export default RouteTransitionOrchestrator;
