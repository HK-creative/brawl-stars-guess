import React from 'react';
import Image from '@/components/ui/image';
import { getPortrait } from '@/lib/image-helpers';
import { getBrawlerByName, getBrawlerDisplayName } from '@/data/brawlers';
import { getLanguage } from '@/lib/i18n';

export interface BrawlerCardProps {
  name: string; // English name as in data
}

const BrawlerCard: React.FC<BrawlerCardProps> = ({ name }) => {
  const brawler = getBrawlerByName(name);
  const language = getLanguage();
  const displayName = brawler ? getBrawlerDisplayName(brawler, language) : name;
  const src = getPortrait(name);

  return (
    <div className="rounded-xl overflow-hidden transition hover:opacity-90">
      <Image
        src={src}
        alt={displayName}
        imageType="portrait"
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover"
      />
    </div>
  );
};

export default BrawlerCard;
