import React, { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

interface Props extends PropsWithChildren {
  routeKey: string | number;
  className?: string;
}

/**
 * RouteTransitionOrchestrator
 * - Lightweight wrapper to animate full-page route transitions
 * - Respects prefers-reduced-motion via useMotionPrefs
 * - Opacity-only crossfade so the screen/background never moves
 */
const RouteTransitionOrchestrator: React.FC<Props> = ({ routeKey, className, children }) => {
  const { motionOK, transition } = useMotionPrefs();
  const shouldAnimate = motionOK;

  const localDuration = (transition as { duration?: number }).duration ?? 0.28;
  const localTransition = { ...transition, duration: Math.min(localDuration + 0.06, 0.4) };

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: localTransition }}
      exit={{ opacity: 0, transition: { ...localTransition, duration: Math.max(0.18, (localTransition as any).duration - 0.1) } }}
      style={{ willChange: 'opacity' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default RouteTransitionOrchestrator;
