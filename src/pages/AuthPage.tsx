import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuthForm, AuthFormMode } from '@/components/AuthForm';
import { useAuthModal } from '@/contexts/AuthModalContext';

// This page can now be a fallback or primarily for handling specific redirects 
// if the modal doesn't cover all cases (e.g., email verification link landing).
const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openAuthModal, closeAuthModal } = useAuthModal();
  
  // Local state for AuthForm mode when page is used directly
  const [pageAuthMode, setPageAuthMode] = useState<AuthFormMode>(() => {
    return (searchParams.get('mode') as AuthFormMode) || 'signin';
  });

  useEffect(() => {
    const modeParam = searchParams.get('mode') as AuthFormMode;
    if (modeParam && (modeParam === 'signin' || modeParam === 'signup' || modeParam === 'reset')) {
      // If page is loaded with a mode, primarily try to open modal with this mode.
      // This avoids showing page content if modal is preferred.
      openAuthModal(modeParam);
      // Consider navigating away to prevent page content from briefly showing or staying in history
      // navigate('/', { replace: true });
    } else {
      // If no specific mode for modal, ensure pageAuthMode is set from param for direct form use
      setPageAuthMode(modeParam || 'signin');
    }
  }, [searchParams, openAuthModal, navigate]);

  const handlePageAuthSuccess = () => {
    closeAuthModal(); // Ensure modal is closed if it was somehow open
    navigate('/');
  };

  const handlePageAuthModeChange = (newMode: AuthFormMode) => {
    setPageAuthMode(newMode);
    // Update URL search param if desired, for bookmarkability of direct page mode
    // navigate(`/auth?mode=${newMode}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brawl-blue via-blue-600 to-blue-700 dark:from-brawl-blue dark:via-blue-800 dark:to-gray-900 selection:bg-primary/40">
      <Card className="w-full max-w-md shadow-2xl rounded-xl animate-card-reveal">
        <CardHeader className="p-6 sm:p-8">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit mb-2"
            onClick={() => { closeAuthModal(); navigate('/'); }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          {/* Title can reflect pageAuthMode if AuthForm is visible directly */}
          <CardTitle className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            {pageAuthMode === 'reset' ? 'Reset Password' : pageAuthMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400 pt-1">
            {pageAuthMode === 'reset' ? 'Enter your email to receive reset instructions.' 
              : pageAuthMode === 'signup' ? 'Join Brawldle and save your amazing progress!' 
              : 'Sign in to continue your Brawldle adventure.'
            }
            Or click "Back to Home" and use the popup.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0">
          <AuthForm 
            mode={pageAuthMode} // Use local page state for mode
            onModeChange={handlePageAuthModeChange} // Handle mode changes locally
            onSuccess={handlePageAuthSuccess}
            displayInModal={false} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage; 