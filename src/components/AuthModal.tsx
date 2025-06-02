import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogIn, Mail, Lock, X } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal } = useAuthModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const currentLanguage = getLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (authModalMode !== 'reset' && (!email || !password)) {
      setError('Please fill in all fields');
      return;
    }
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (authModalMode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (result.error) throw result.error;
        
        if (result.data?.user) {
          toast.success('Check your email to confirm your account!');
          closeAuthModal();
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (result.error) throw result.error;
        
        if (result.data?.user) {
          toast.success('Welcome back!');
          closeAuthModal();
        }
      }
    } catch (error: any) {
      const message = error.message || (authModalMode === 'signup' ? 'Sign up failed' : 'Login failed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const { error: resetApiError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (resetApiError) throw resetApiError;
      setResetSent(true);
    } catch (error: any) {
      const message = error.message || "Failed to send reset instructions.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeAuthModal();
      setEmail('');
      setPassword('');
      setLoading(false);
      setError(null);
      setResetSent(false);
    }
  };
  
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setError(null);
  }, [authModalMode]);


  if (!isAuthModalOpen) return null;

  const currentTitle = authModalMode === 'signin' 
    ? t('auth.signin.email')
    : authModalMode === 'signup' 
      ? t('auth.create.account')
      : t('auth.reset.password.title');

  const currentDescription = authModalMode === 'signin'
    ? t('auth.access.stats')
    : authModalMode === 'signup'
      ? t('auth.join.unlock')
      : t('auth.reset.instructions');
      
  const currentButtonText = authModalMode === 'reset' 
    ? t('auth.reset.link')
    : authModalMode === 'signup' 
      ? t('auth.signup')
      : t('auth.get.started');


  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] sm:w-full sm:max-w-lg bg-white text-gray-900 rounded-xl p-8 shadow-2xl">

        <div className="flex flex-col items-center mb-6">
            <div className="p-2.5 bg-gray-100 rounded-full mb-4">
                <LogIn className="h-6 w-6 text-gray-600" />
            </div>
            <DialogTitle className={cn(
              "font-bold text-center",
              currentLanguage === 'he' ? "text-lg" : "text-2xl"
            )}>
                {currentTitle}
            </DialogTitle>
            {currentDescription && (
                <DialogDescription className={cn(
                  "text-gray-500 pt-2 text-center max-w-xs",
                  currentLanguage === 'he' ? "text-xs" : "text-sm"
                )}>
                {currentDescription}
                </DialogDescription>
            )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {authModalMode === 'reset' && resetSent ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-semibold">Password reset email sent!</p>
            <p className="text-sm text-gray-500 mt-2">Please check your inbox (and spam folder).</p>
            <Button 
              variant="link" 
              onClick={() => openAuthModal('signin')}
              className="mt-4 text-blue-600 hover:text-blue-500"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={authModalMode === 'reset' ? handlePasswordReset : handleSubmit} className="space-y-4">
            <div className="space-y-1.5 relative flex items-center">
              <Label htmlFor="email-modal" className="sr-only">{t('auth.email')}</Label>
              <Mail className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
              <Input
                id="email-modal"
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 h-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400 bg-white text-gray-900"
              />
            </div>
            
            {authModalMode !== 'reset' && (
              <div className="space-y-1.5 relative flex items-center">
                <Label htmlFor="password-modal" className="sr-only">{t('auth.password')}</Label>
                <Lock className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  id="password-modal"
                  type="password"
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 h-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400 bg-white text-gray-900"
                />
              </div>
            )}
            
            {authModalMode === 'signin' && (
                <div className="text-right -mt-2 mb-2">
                    <button 
                      type="button" 
                      onClick={() => openAuthModal('reset')}
                      className="text-xs text-amber-600 hover:text-amber-500 hover:underline focus:outline-none font-medium"
                      disabled={loading}
                    >
                      {t('auth.forgot.password')}
                    </button>
                </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              disabled={loading || (authModalMode === 'reset' && resetSent)}
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : currentButtonText}
            </Button>
          </form>
        )}

        {!(authModalMode === 'reset' && resetSent) && (
            <div className="mt-6 text-center">
            {authModalMode === 'signin' && (
                <p className="text-sm text-gray-500">
                {t('auth.no.account')}{' '}
                <button 
                    onClick={() => openAuthModal('signup')} 
                    className="font-medium text-amber-600 hover:text-amber-500 hover:underline focus:outline-none"
                >
                    {t('auth.signup')}
                </button>
                </p>
            )}
            {authModalMode === 'signup' && (
                <p className="text-sm text-gray-500">
                {t('auth.have.account')}{' '}
                <button 
                    onClick={() => openAuthModal('signin')} 
                    className="font-medium text-amber-600 hover:text-amber-500 hover:underline focus:outline-none"
                >
                    {t('auth.login')}
                </button>
                </p>
            )}
            {authModalMode === 'reset' && !resetSent && (
                <p className="text-sm text-gray-500">
                {t('auth.remember.password')}{' '}
                <button 
                    onClick={() => openAuthModal('signin')} 
                    className="font-medium text-amber-600 hover:text-amber-500 hover:underline focus:outline-none"
                >
                    {t('auth.back.login')}
                </button>
                </p>
            )}
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 