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
  // Slightly longer & eased curve for entering Daily to feel more premium
  const dailyEnterTransition = { ...transition, duration: Math.min(localDuration + 0.18, 0.6), ease: [0.22, 1, 0.36, 1] as any };

  const isDaily = routeKey === 'daily';
  const origin = originPercent
    ? `${Math.max(0, Math.min(100, originPercent.x))}% ${Math.max(0, Math.min(100, originPercent.y))}%`
    : '50% 50%';

  if (!shouldAnimate) {
    return (
      <div className={className} style={{ position: 'relative', minHeight: '100vh' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative', minHeight: '100vh' }}>
      <motion.div
        key={routeKey}
        initial={isDaily
          // Home -> Daily: start from a small (not zero) circle to avoid harsh pop, slightly dim/blurred
          ? { opacity: 0.6, scale: 0.965, filter: 'blur(10px)', clipPath: `circle(6% at ${origin})` }
          // App group: clean zoom-fade, no slide
          : { opacity: 0, scale: 0.985, filter: 'blur(4px)' }
        }
        animate={isDaily
          ? { opacity: 1, scale: 1, filter: 'blur(0px)', clipPath: `circle(160% at ${origin})`, transition: dailyEnterTransition }
          : { opacity: 1, scale: 1, filter: 'blur(0px)', transition: localTransition }
        }
        exit={isDaily
          // Collapse back into a small blurred circle when leaving Daily
          ? { opacity: 0.6, scale: 1.02, filter: 'blur(6px)', clipPath: `circle(0% at ${origin})`, transition: { ...localTransition, duration: Math.max(0.2, (localTransition as any).duration - 0.06) } }
          // App group exit: subtle zoom-out fade
          : { opacity: 0, scale: 1.015, filter: 'blur(6px)', transition: { ...localTransition, duration: Math.max(0.2, (localTransition as any).duration - 0.06) } }
        }
        style={{ willChange: 'opacity, transform, filter, clip-path', transformOrigin: origin, position: 'absolute', inset: 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
;

export default RouteTransitionOrchestrator;
