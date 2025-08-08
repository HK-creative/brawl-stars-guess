import { useEffect, useMemo, useState } from 'react';

/**
 * useMotionPrefs
 * - Detects user's prefers-reduced-motion setting and exposes convenient flags
 * - Provides sensible default transitions that respect accessibility
 */
export function useMotionPrefs() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion('matches' in e ? e.matches : (e as MediaQueryList).matches);
    };

    // Initial sync and attribute for CSS hooks if needed
    handler(mql);
    document.documentElement.setAttribute('data-reduced-motion', mql.matches ? 'true' : 'false');

    // Modern browsers
    try {
      mql.addEventListener('change', handler as EventListener);
      return () => mql.removeEventListener('change', handler as EventListener);
    } catch {
      // Safari < 14
      // @ts-ignore
      mql.addListener(handler);
      return () => {
        // @ts-ignore
        mql.removeListener(handler);
      };
    }
  }, []);

  const motionOK = !prefersReducedMotion;

  // Provide default transitions tuned for both modes
  const transition = useMemo(() => {
    return prefersReducedMotion
      ? { duration: 0.18, ease: 'linear' as const }
      : { duration: 0.28, ease: 'easeOut' as const };
  }, [prefersReducedMotion]);

  const spring = useMemo(() => {
    return prefersReducedMotion
      ? { type: 'tween' as const, duration: 0.2, ease: 'linear' as const }
      : { type: 'spring' as const, stiffness: 360, damping: 32, mass: 0.7 };
  }, [prefersReducedMotion]);

  return { prefersReducedMotion, motionOK, transition, spring };
}

export default useMotionPrefs;
