import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional className passed to the outer wrapper. Useful for sizing or additional styles.
   */
  className?: string;
}

/**
 * GradientCard – A glossy yellow/orange card with bevel, border-radius, and inner shadow
 * matching the "DAILY CHALLENGES" card on the Home page.
 *
 * Usage:
 * ```tsx
 * <GradientCard className="max-w-md mx-auto">
 *   <h2 className="text-3xl font-extrabold uppercase mb-4">Title</h2>
 *   ...content...
 * </GradientCard>
 * ```
 */
export const GradientCard: React.FC<GradientCardProps> = ({ className, children, ...rest }) => {
  return (
    <div className={cn('relative rounded-2xl', className)} {...rest}>
      {/* Background gradient layer */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-yellow-500 shadow-lg" />

      {/* Gloss overlay & inner shadow to simulate glossy bevel */}
      <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm mix-blend-luminosity" />
      <div className="absolute inset-0 rounded-2xl shadow-[inset_0_4px_6px_rgba(0,0,0,0.2)]" />

      {/* Actual card content */}
      <Card className="relative bg-white/10 backdrop-blur-md border-white/20 text-white rounded-2xl p-6">
        {children}
      </Card>
    </div>
  );
};

export default GradientCard;
