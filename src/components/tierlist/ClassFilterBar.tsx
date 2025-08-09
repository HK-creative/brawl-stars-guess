import React from 'react';

export type ClassKey =
  | 'damage'
  | 'assassin'
  | 'artillery'
  | 'support'
  | 'marksmen'
  | 'controller'
  | 'tank';

export const CLASS_ICON: Record<ClassKey, string> = {
  damage: '/icon_class_damage.png',
  assassin: '/icon_class_assassin.png',
  artillery: '/icon_class_artillery.png',
  support: '/icon_class_support.png',
  marksmen: '/icon_class_marksmen.png',
  controller: '/icon_class_controller.png',
  tank: '/icon_class_tank.png',
};

// Map data label (e.g., "Damage Dealer", "Marksman") to our ClassKey
export function classLabelToKey(label: string): ClassKey | null {
  const L = label.toLowerCase();
  if (L.includes('damage')) return 'damage';
  if (L.includes('assassin')) return 'assassin';
  if (L.includes('artillery')) return 'artillery';
  if (L.includes('support')) return 'support';
  if (L.includes('marksman')) return 'marksmen';
  if (L.includes('controller')) return 'controller';
  if (L.includes('tank')) return 'tank';
  return null;
}

export interface ClassFilterBarProps {
  selected: ClassKey[];
  onToggle: (key: ClassKey) => void;
  onClear?: () => void;
}

const CLASS_ORDER: ClassKey[] = [
  'damage',
  'assassin',
  'artillery',
  'support',
  'marksmen',
  'controller',
  'tank',
];

const ClassFilterBar: React.FC<ClassFilterBarProps> = ({ selected, onToggle, onClear }) => {
  const isSelected = (k: ClassKey) => selected.includes(k);
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      {CLASS_ORDER.map((k) => (
        <button
          key={k}
          onClick={() => onToggle(k)}
          title={k}
          className={`h-8 w-8 shrink-0 rounded-md border ${isSelected(k) ? 'border-white/50 bg-white/10' : 'border-white/10 hover:border-white/20'} p-1`}
        >
          <img src={CLASS_ICON[k]} alt={k} className="h-full w-full object-contain" />
        </button>
      ))}
      {selected.length > 0 && (
        <button
          onClick={onClear}
          className="ml-1 text-xs text-white/70 underline hover:text-white"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default ClassFilterBar;
