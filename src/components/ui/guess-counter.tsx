import React from 'react';
import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type GuessCounterProps = {
  isSurvivalMode: boolean;
  guessCount: number;
  guessesLeft?: number;
  maxGuesses?: number;
  lowThreshold?: number;
  className?: string;
};

export function GuessCounter({
  isSurvivalMode,
  guessCount,
  guessesLeft,
  maxGuesses,
  lowThreshold = 3,
  className,
}: GuessCounterProps) {
  const { motionOK, transition } = useMotionPrefs();

  const computedLeft = React.useMemo(() => {
    if (!isSurvivalMode) return undefined;
    if (typeof guessesLeft === 'number') return Math.max(0, guessesLeft);
    if (typeof maxGuesses === 'number') return Math.max(0, maxGuesses - guessCount);
    return 0;
  }, [isSurvivalMode, guessesLeft, maxGuesses, guessCount]);

  return (
    <motion.div
      className={cn('survival-mode-guess-counter', className)}
      initial={motionOK ? { opacity: 0, y: 8 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      {isSurvivalMode ? (
        <>
          <span className="text-lg font-bold tracking-wide">{t('guesses.left')}</span>
          <span className={cn(
            'text-2xl font-extrabold',
            (computedLeft ?? 0) <= lowThreshold ? 'text-red-400' : 'text-white'
          )}>
            <SlidingNumber value={computedLeft ?? 0} />
          </span>
        </>
      ) : (
        <>
          <span className="text-base font-semibold mr-2">{t('number.of.guesses')}</span>
          <span className="text-base font-bold">
            <SlidingNumber value={guessCount} padStart />
          </span>
        </>
      )}
    </motion.div>
  );
}
