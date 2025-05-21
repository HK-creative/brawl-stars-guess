import { supabase } from '@/integrations/supabase/client';

export const handleAuthRedirect = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Handle auth redirect
  const params = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    
    if (error) {
      console.error('Error setting auth session:', error.message);
      return null;
    }
    
    return data.session;
  }
  
  return session;
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    return false;
  }
  return true;
};

// Listen for auth state changes
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
};

// Initialize auth state
export const initAuth = async () => {
  const session = await handleAuthRedirect();
  return session;
}; 