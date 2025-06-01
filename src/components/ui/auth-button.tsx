import React from 'react';
// import { useNavigate } from 'react-router-dom'; // No longer needed for direct navigation
import { Button } from '@/components/ui/button';
import { useStreak } from '@/contexts/StreakContext';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/contexts/AuthModalContext'; // Import useAuthModal
import { toast } from 'sonner';
import { t } from '@/lib/i18n';

interface AuthButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showSignUp?: boolean;
  hideSubtext?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
  variant = 'default',
  size = 'default',
  className = '',
  showSignUp = false,
  hideSubtext = false
}) => {
  // const navigate = useNavigate(); // Not needed now
  const { isLoggedIn, user } = useStreak();
  const { openAuthModal } = useAuthModal(); // Get modal control

  const handleAuth = (e: React.MouseEvent) => {
    try {
      // Prevent any default behavior
      e.preventDefault();
      e.stopPropagation();

      // Ensure we're not already logged in
      if (isLoggedIn || user) {
        return;
      }

      // Open the auth modal with the appropriate mode
      openAuthModal(showSignUp ? 'signup' : 'signin');
    } catch (error) {
      console.error("Error handling auth button click:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  // Don't render if already logged in
  if (isLoggedIn && user) {
    return null;
  }

  return (
    <div className={cn("flex items-center", !hideSubtext && showSignUp && "gap-2")} >
      <Button
        variant={variant}
        size={size}
        className={cn(
          "font-bold transition-all duration-300",
          variant === 'default' && !showSignUp && "bg-brawl-yellow hover:bg-brawl-yellow/90 text-black shadow-lg hover:shadow-xl",
          variant === 'default' && showSignUp && "bg-brawl-green hover:bg-brawl-green/90 text-white shadow-lg hover:shadow-xl", 
          variant === 'outline' && "border-2 border-brawl-yellow text-brawl-yellow hover:bg-brawl-yellow/10",
          className
        )}
        onClick={handleAuth} // This now opens the modal
      >
        {showSignUp ? t('auth.signup') : t('auth.login')}
      </Button>
      {showSignUp && !hideSubtext && (
        <span className="text-sm text-white/80 font-medium">
          {t('auth.save.subtext')}
        </span>
      )}
    </div>
  );
};

export default AuthButton; 