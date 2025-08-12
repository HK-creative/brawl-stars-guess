import React from 'react';
import { t } from '@/lib/i18n';
import ModeTitle from '@/components/ModeTitle';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useNavigate } from 'react-router-dom';
import type { GameModeName } from '@/types/gameModes';

interface Props {
  currentRound: number;
  currentMode: GameModeName | null;
}

const SurvivalSharedHeader: React.FC<Props> = ({ currentRound, currentMode }) => {
  const { transition } = useMotionPrefs();
  const navigate = useNavigate();

  const title = currentMode
    ? `${t('survival.round')} ${currentRound} — ${t(`mode.${currentMode}`)}`
    : t('survival.mode.title');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 relative z-10">
      {/* Top Row: Home */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
          aria-label={t('button.go.home')}
        >
          <img 
            src="/bs_home_icon.png" 
            alt={t('button.go.home')} 
            className="w-11 h-11" 
          />
        </button>
        {/* Spacer to keep title centered visually */}
        <div className="w-14 h-14" aria-hidden />
      </div>

      {/* Title (animated like daily) */}
      <div className="text-center mb-4 mt-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${currentMode ?? 'survival'}-${currentRound}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, transition }}
            exit={{ opacity: 0, y: -4, transition }}
          >
            <ModeTitle title={title} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SurvivalSharedHeader;
