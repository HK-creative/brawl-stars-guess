import tierlistData from './tierlist.json';

export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D';

export interface TierList {
  S: string[];
  A: string[];
  B: string[];
  C: string[];
  D?: string[];
}

export const TIER_ORDER: TierKey[] = ['S', 'A', 'B', 'C', 'D'];

export const tierlist: TierList = tierlistData as TierList;
