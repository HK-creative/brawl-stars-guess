import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getLanguage, t } from '@/lib/i18n';
import TierBoard from '@/components/tierlist/TierBoard';
import FiltersBar from '@/components/tierlist/FiltersBar';
import { getBrawlerLocalizedName, brawlers } from '@/data/brawlers';
import ClassFilterBar, { ClassKey, classLabelToKey } from '@/components/tierlist/ClassFilterBar';

const TierListPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [classes, setClasses] = useState<ClassKey[]>([]);
  const lang = getLanguage();

  const { total, shown } = useMemo(() => {
    const totalCount = brawlers.length;
    const term = query.trim().toLowerCase();
    const filtered = brawlers.filter((b) => {
      if (classes.length > 0) {
        const k = classLabelToKey(b.class);
        if (!k || !classes.includes(k)) return false;
      }
      if (!term) return true;
      return getBrawlerLocalizedName(b.name, lang).toLowerCase().includes(term);
    });
    return { total: totalCount, shown: filtered.length };
  }, [lang, query, classes]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          {t('back.to.home')}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-white">
              {t('tier.list.page.title')}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {t('tier.list.description')}
            </p>
          </div>

          <div className="mb-3">
            <ClassFilterBar
              selected={classes}
              onToggle={(k) =>
                setClasses((prev) => (prev.length === 1 && prev[0] === k ? [] : [k]))
              }
              onClear={() => setClasses([])}
            />
          </div>

          <div className="mb-5">
            <FiltersBar value={query} onChange={setQuery} total={total} shown={shown} />
          </div>

          {shown === 0 ? (
            <div className="mt-10 text-center text-white/70">
              {t('tier.no.results')}
            </div>
          ) : (
            <TierBoard searchTerm={query} selectedClasses={classes} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TierListPage;