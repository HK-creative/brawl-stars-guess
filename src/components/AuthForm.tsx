import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export type AuthFormMode = 'signin' | 'signup' | 'reset';

interface AuthFormProps {
  mode: AuthFormMode;
  onModeChange: (newMode: AuthFormMode) => void;
  onSuccess?: () => void; 
  displayInModal?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onModeChange, onSuccess, displayInModal = false }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form states when mode changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setResetSent(false);
    setError(null);
  }, [mode]);

  const handleAuthOp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (mode === 'signup') {
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
          if (onModeChange) onModeChange('signin');
          if (onSuccess) onSuccess();
        }
      } else { // mode === 'signin'
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (result.error) throw result.error;
        if (result.data?.user) {
          toast.success('Welcome back!');
          if (onSuccess) onSuccess();
          else navigate('/'); 
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, onModeChange, onSuccess, navigate]);

  const handlePasswordResetOp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast.success('Password reset instructions sent to your email!');
      if (onSuccess && displayInModal) onSuccess();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset instructions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, onSuccess, displayInModal]);

  const handleModeChange = useCallback((newMode: AuthFormMode) => {
    if (onModeChange) {
      try {
        onModeChange(newMode);
      } catch (error) {
        console.error("Error changing auth mode:", error);
      }
    }
  }, [onModeChange]);

  return (
    <div className={displayInModal ? "p-1" : "pt-2"}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center">
          <span className="mr-2">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={mode === 'reset' ? handlePasswordResetOp : handleAuthOp} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor={`email-authform-${mode}`}>Email</Label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Input
              id={`email-authform-${mode}`}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 pr-3 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white rounded-md transition duration-150 ease-in-out"
              required
            />
          </div>
        </div>
        
        {/* Password Input (not for reset mode) */}
        {mode !== 'reset' && (
          <div className="space-y-2">
            <Label htmlFor={`password-authform-${mode}`}>Password</Label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <Input
                id={`password-authform-${mode}`}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-3 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white rounded-md transition duration-150 ease-in-out"
                required
                minLength={6}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full py-3 text-base font-semibold bg-primary hover:bg-primary/90 text-white dark:bg-primary dark:hover:bg-primary/80 rounded-md shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center"
          disabled={loading || (mode === 'reset' && resetSent)}
        >
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {mode === 'reset' 
            ? (resetSent ? 'Reset Link Sent ✔️' : 'Send Reset Instructions')
            : mode === 'signup' 
              ? 'Create Account' 
              : 'Sign In'
          }
        </Button>
      </form>

      {/* Footer links for switching modes */}
      <div className="mt-6 text-center text-sm">
        {mode === 'signin' && (
          <div className="space-x-1">
            <Button variant="link" onClick={() => handleModeChange('reset')} className="p-1 text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Forgot password?</Button>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <Button variant="link" onClick={() => handleModeChange('signup')} className="p-1 text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Don't have an account?</Button>
          </div>
        )}
        {mode === 'signup' && (
          <Button variant="link" onClick={() => handleModeChange('signin')} className="p-1 text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Already have an account? Sign In</Button>
        )}
        {mode === 'reset' && (
          <Button variant="link" onClick={() => handleModeChange('signin')} className="p-1 text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Back to Sign In</Button>
        )}
      </div>
    </div>
  );
}; 