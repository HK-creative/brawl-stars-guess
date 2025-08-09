import React from 'react';
import { t } from '@/lib/i18n';

const TIERS: Array<{ key: 'S'|'A'|'B'|'C'; color: string; labelKey: string }> = [
  { key: 'S', color: 'bg-amber-500', labelKey: 'tier.label.s' },
  { key: 'A', color: 'bg-sky-500', labelKey: 'tier.label.a' },
  { key: 'B', color: 'bg-emerald-500', labelKey: 'tier.label.b' },
  { key: 'C', color: 'bg-violet-500', labelKey: 'tier.label.c' },
];

const TierQuickNav: React.FC = () => {
  const onJump = (tier: string) => {
    const el = document.getElementById(`tier-${tier}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="sticky top-14 z-20 -mx-4 px-4 py-2 md:-mx-6 md:px-6 bg-background/60 backdrop-blur supports-backdrop-blur:shadow">
      <div className="flex items-center gap-2 overflow-auto">
        <span className="text-sm text-muted-foreground mr-2 whitespace-nowrap">
          {t('tier.quickjump')}
        </span>
        {TIERS.map(({ key, color, labelKey }) => (
          <button
            key={key}
            onClick={() => onJump(key)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-white/90 hover:bg-white/10 transition whitespace-nowrap"
          >
            <span className={`h-2 w-2 rounded-full ${color}`} />
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TierQuickNav;
