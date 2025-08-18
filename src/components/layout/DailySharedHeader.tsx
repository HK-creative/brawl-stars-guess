import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getLanguage, t } from '@/lib/i18n';
import { useStreak } from '@/contexts/StreakContext';
import DailyModeProgress from '@/components/DailyModeProgress';
import ModeTitle from '@/components/ModeTitle';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { DailyGameMode, useDailyStore } from '@/stores/useDailyStore';

interface Props {
  currentMode: DailyGameMode;
  onModeChange: (mode: DailyGameMode) => void;
}

const DailySharedHeader: React.FC<Props> = ({ currentMode, onModeChange }) => {
  const navigate = useNavigate();
  const { streak } = useStreak();
  const { transition } = useMotionPrefs();
  const lang = getLanguage();
  const { getCompletionProgress } = useDailyStore();
  const { completed, total } = getCompletionProgress();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 relative">
      {/* Top Row: Home Icon, Streak */}
      <div className="flex items-center justify-between mb-4">
        {/* Home Icon */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
          aria-label={t('button.go.home')}
        >
          <img src="/bs_home_icon.png" alt={t('button.go.home')} className="w-11 h-11" />
        </button>

        {/* Streak */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold leading-none text-[hsl(var(--daily-mode-primary))]">{streak}</span>
              <div className="text-3xl">🔥</div>
            </div>
          </div>

          {/* Overall Daily Progress */}
          <div
            className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-sm"
            aria-label={t('label.daily_challenge') + ' ' + completed + '/' + total}
            title={`${t('label.daily_challenge')} ${completed}/${total}`}
          >
            {completed}/{total}
          </div>
        </div>
      </div>

      {/* Mode Navigation */}
      <DailyModeProgress currentMode={currentMode} className="mb-6 mt-1" onModeChange={onModeChange} />

      {/* Title (only the title animates) */}
      <div className="text-center mb-6 mt-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentMode}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, transition }}
            exit={{ opacity: 0, y: -4, transition }}
          >
            <ModeTitle title={t(`mode.${currentMode}`)} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailySharedHeader;
