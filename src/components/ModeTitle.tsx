import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModeTitleProps {
  /**
   * Translated title for the current daily mode.
   */
  title: string;
}

/**
 * ModeTitle animates the daily mode headline with
 * a subtle cross-fade + slide transition.
 *
 * Because each title is keyed by its text, Framer-motion
 * applies exit/enter animations when navigating between
 * daily modes, giving the illusion of a single persistent
 * headline element.
 */
const ModeTitle: React.FC<ModeTitleProps> = ({ title }) => (
  <AnimatePresence mode="wait">
    <motion.h1
      key={title}
      className="daily-mode-title"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } }}
    >
      {title}
    </motion.h1>
  </AnimatePresence>
);

export default ModeTitle;
