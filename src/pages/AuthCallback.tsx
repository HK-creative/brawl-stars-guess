import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        const type = queryParams.get('type');

        // Check if this is a password reset flow
        if (type === 'recovery') {
          setIsPasswordReset(true);
          setLoading(false);
          return;
        }

        // Handle email confirmation
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          toast.success('Email verified successfully!');
          navigate('/');
        } else {
          throw new Error('Failed to verify email');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      navigate('/auth');
    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md text-center p-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Processing...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Authentication Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Please enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthCallback; 