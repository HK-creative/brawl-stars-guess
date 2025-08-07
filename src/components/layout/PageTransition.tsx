import React, { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

/**
 * PageTransition provides a subtle fade + slide shared animation that
 * is applied to each Daily Mode page. Wrapping the page contents in this
 * component and enabling AnimatePresence at the router level gives the
 * illusion of a seamless single-screen experience while navigating between
 * daily challenge modes.
 */
const variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

const PageTransition: React.FC<PropsWithChildren> = ({ children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="flex flex-col flex-1"
  >
    {children}
  </motion.div>
);

export default PageTransition;
