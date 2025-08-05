import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/**
 * SecondaryButton – subtle transparent/ghost button used for less prominent actions
 * like “Go Home”. Consistent rounded shape, white text, and hover glow.
 */
const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        className={cn(
          'border border-white/20 text-white/70 hover:text-white/90 hover:bg-white/5',
          'transition-all duration-200 rounded-xl px-8 py-3',
          className,
          buttonVariants({ variant: 'ghost', size: 'lg' })
        )}
        {...props}
      />
    );
  }
);

SecondaryButton.displayName = 'SecondaryButton';

export default SecondaryButton;
