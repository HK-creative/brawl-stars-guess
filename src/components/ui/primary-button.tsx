import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/**
 * PrimaryButton – a round-edged call-to-action used across the app.
 * Implements the unified purple/yellow gradient fill seen on the Home page
 * with consistent hover, active and disabled states.
 */
const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        className={cn(
          // Base gradient & text
          'relative overflow-hidden isolate text-white font-extrabold uppercase tracking-wide',
          'before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-violet-500 before:to-fuchsia-600 before:transition-opacity before:duration-300',
          'hover:before:opacity-90 active:scale-[0.97]',
          'disabled:opacity-60',
          // Inner glow
          'after:absolute after:inset-0 after:-z-20 after:rounded-full after:bg-white/10 after:blur-xl',
          className,
          buttonVariants({ size: 'lg', variant: 'ghost' }) // Use ghost to avoid default bg, we'll override
        )}
        {...props}
      />
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
