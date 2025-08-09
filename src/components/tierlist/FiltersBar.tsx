import React from 'react';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { t } from '@/lib/i18n';

export interface FiltersBarProps {
  value: string;
  onChange: (val: string) => void;
  total: number;
  shown: number;
  showSummary?: boolean;
}

const FiltersBar: React.FC<FiltersBarProps> = ({ value, onChange, total, shown, showSummary = false }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('tier.search.placeholder')}
          className="pl-9 pr-9"
        />
        {value && (
          <button
            aria-label={t('tier.search.clear')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showSummary && (
        <div className="text-sm text-muted-foreground">
          {t('tier.search.results')}: {shown}/{total}
        </div>
      )}
    </div>
  );
};

export default FiltersBar;
