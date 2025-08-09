import React from 'react';
import TierRow from './TierRow';
import { TIER_ORDER, TierKey } from '@/data/tierlist';
import { getLanguage } from '@/lib/i18n';
import { brawlers, getBrawlerLocalizedName, getBrawlerByName } from '@/data/brawlers';
import { classLabelToKey, ClassKey } from '@/components/tierlist/ClassFilterBar';

export interface TierBoardProps {
  searchTerm?: string;
  selectedClasses?: ClassKey[];
}

const TierBoard: React.FC<TierBoardProps> = ({ searchTerm = '', selectedClasses = [] }) => {
  const lang = getLanguage();
  const term = searchTerm.trim().toLowerCase();

  const filterNames = (names: string[]): string[] => {
    let list = names;
    if (selectedClasses.length > 0) {
      list = list.filter((en) => {
        const cls = getBrawlerByName(en)?.class || '';
        const key = classLabelToKey(cls);
        return key ? selectedClasses.includes(key) : false;
      });
    }
    if (!term) return list;
    return list.filter((en) => getBrawlerLocalizedName(en, lang).toLowerCase().includes(term));
  };

  // Build mock tiers that include ALL brawlers, distributed round-robin
  const allNames = React.useMemo(() => brawlers.map((b) => b.name).sort(), []);
  const mockTiers = React.useMemo(() => {
    const res: Record<TierKey, string[]> = {
      S: [], A: [], B: [], C: [], D: [] as string[],
    } as Record<TierKey, string[]>;
    allNames.forEach((name, idx) => {
      const key = TIER_ORDER[idx % TIER_ORDER.length];
      (res[key] ||= []).push(name);
    });
    return res;
  }, [allNames]);

  return (
    <div className="w-full flex flex-col gap-6">
      {TIER_ORDER.map((tier: TierKey) => {
        const filtered = filterNames(mockTiers[tier] || []);
        if (filtered.length === 0) return null;
        return (
          <TierRow key={tier} tier={tier} brawlers={filtered} />
        );
      })}
    </div>
  );
};

export default TierBoard;
