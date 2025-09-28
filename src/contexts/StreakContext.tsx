import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getStreak,
  incrementStreak,
  setStreak,
  getTodayInIsrael,
  checkAndResetStreak,
} from '@/lib/streakStorage';
import { supabase } from '@/integrations/supabase/client';
import { onAuthStateChange, signOut } from '@/lib/auth';
import { useDailyStore } from '@/stores/useDailyStore';

interface StreakContextType {
  streak: number;
  lastCompleted: string | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => Promise<void>;
  user: any;
  loading: boolean;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const [streak, setStreakState] = useState(0);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const areAllModesCompleted = useDailyStore((state) => state.areAllModesCompleted);

  // Effect for initializing and syncing streak
  useEffect(() => {
    const fetchAndSyncStreak = async (authedUser: any) => {
      setLoading(true);
      // 1. Check and reset local streak based on date
      const initialStreak = checkAndResetStreak();
      setStreakState(initialStreak.streak);
      setLastCompleted(initialStreak.lastCompleted);

      if (authedUser) {
        // 2. Fetch from DB if logged in
        const { data, error } = await supabase
          .from('profiles')
          .select('current_streak, last_completed_date')
          .eq('id', authedUser.id)
          .single();

        if (data) {
          const local = getStreak(); // Re-get local after reset check
          const dbStreak = data.current_streak || 0;
          const dbDate = data.last_completed_date || '';

          // 3. Merge logic: local vs. DB
          if (local.streak > dbStreak || (local.lastCompleted || '') > dbDate) {
            // Local is ahead, push to DB
            setStreakState(local.streak);
            setLastCompleted(local.lastCompleted);
            await supabase.from('profiles').upsert({
              id: authedUser.id,
              current_streak: local.streak,
              last_completed_date: local.lastCompleted,
            });
          } else {
            // DB is ahead, overwrite local
            setStreak(dbStreak, dbDate);
            setStreakState(dbStreak);
            setLastCompleted(dbDate);
          }
        } else if (error) {
          console.error('Error fetching profile for streak sync:', error.message);
        }
      }
      setLoading(false);
    };

    // Initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchAndSyncStreak(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange((session) => {
      const authedUser = session?.user ?? null;
      setUser(authedUser);
      fetchAndSyncStreak(authedUser);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Effect for handling streak increment when all modes are completed
  useEffect(() => {
    if (areAllModesCompleted()) {
      const today = getTodayInIsrael();
      // Prevent multiple increments on the same day
      if (lastCompleted !== today) {
        console.log('All modes completed! Incrementing streak.');
        const newStreak = incrementStreak();
        setStreakState(newStreak);
        setLastCompleted(today);

        if (user) {
          supabase.from('profiles').upsert({
            id: user.id,
            current_streak: newStreak,
            last_completed_date: today,
          }).then(({ error }) => {
            if (error) {
              console.error('Failed to update streak in Supabase:', error.message);
            }
          });
        }
      }
    }
  }, [areAllModesCompleted, lastCompleted, user]);

  const login = () => {
    window.location.href = '/auth';
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    // On logout, just rely on the local storage streak which should be up-to-date
    const local = getStreak();
    setStreakState(local.streak);
    setLastCompleted(local.lastCompleted);
  };

  return (
    <StreakContext.Provider
      value={{
        streak,
        lastCompleted,
        isLoggedIn: !!user,
        login,
        logout,
        user,
        loading,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within StreakProvider');
  return ctx;
};
 