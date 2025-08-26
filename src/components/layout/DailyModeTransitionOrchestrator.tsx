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

  // Slightly smaller offset and slightly longer duration for smoother feel
  const delta = 18; // subtle slide distance
  const localDuration = (transition as { duration?: number }).duration ?? 0.28;
  const localTransition = { ...transition, duration: Math.min(localDuration + 0.1, 0.42) };
  const initial = shouldAnimate
    ? axis === 'x'
      ? { opacity: 0, x: isRTL ? delta : -delta, scale: 0.995 }
      : { opacity: 0, y: 16, scale: 0.995 }
    : { opacity: 0 };

  const animate = { opacity: 1, x: 0 as number | undefined, y: 0 as number | undefined, scale: 1, transition: localTransition } as const;

  const exit = shouldAnimate
    ? axis === 'x'
      ? { opacity: 0, x: isRTL ? -delta : delta, scale: 1.005, transition: localTransition }
      : { opacity: 0, y: -16, scale: 1.005, transition: localTransition }
    : { opacity: 0, transition: localTransition };

  // If animations are disabled or motion is not OK, render children statically
  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={modeKey} initial={initial} animate={animate} exit={exit} style={{ willChange: 'transform, opacity' }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DailyModeTransitionOrchestrator;
