import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getStreak,
  incrementStreak,
  resetStreak,
  setStreak,
  getTodayInIsrael,
} from '@/lib/streakStorage';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { onAuthStateChange, signOut } from '@/lib/auth';

export interface GameModeCompletion {
  classic: boolean;
  starpower: boolean;
  gadget: boolean;
  audio: boolean;
  voice?: boolean;
  endless?: boolean;
}

interface StreakContextType {
  streak: number;
  lastCompleted: string | null;
  completedModes: GameModeCompletion;
  markModeCompleted: (mode: keyof GameModeCompletion) => Promise<void>;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => Promise<void>;
  user: any;
  loading: boolean;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const getInitialCompletedModes = (): GameModeCompletion => {
  const stored = localStorage.getItem('completedModes');
  if (stored) {
    const { date, modes } = JSON.parse(stored);
    if (date === getTodayInIsrael()) {
      return modes;
    }
  }
  return {
    classic: false,
    starpower: false,
    gadget: false,
    audio: false,
  };
};

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const [streak, setStreakState] = useState(0);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedModes, setCompletedModes] = useState<GameModeCompletion>(getInitialCompletedModes());

  // Load streak from localStorage or Supabase
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const local = getStreak();
        setStreakState(local.streak);
        setLastCompleted(local.lastCompleted);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Fetch from DB
          const { data, error } = await supabase
            .from('profiles')
            .select('current_streak,last_completed_date')
            .eq('id', session.user.id)
            .single();
          if (!error && data) {
            // Merge logic: prefer longer/more recent streak
            const localDate = local.lastCompleted || '';
            const dbDate = data.last_completed_date || '';
            if (
              (local.streak > data.current_streak) ||
              (localDate > dbDate)
            ) {
              // Push local up
              await supabase.from('profiles').upsert({
                id: session.user.id,
                current_streak: local.streak,
                last_completed_date: local.lastCompleted,
              });
            } else {
              // Overwrite local
              setStreak(data.current_streak, data.last_completed_date);
              setStreakState(data.current_streak);
              setLastCompleted(data.last_completed_date);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching streak:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();

    // Listen for auth changes
    const { data: listener } = onAuthStateChange((session) => {
      if (session?.user) {
        setUser(session.user);
        fetchStreak();
      } else {
        setUser(null);
        // Load local streak only
        const local = getStreak();
        setStreakState(local.streak);
        setLastCompleted(local.lastCompleted);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Reset completed modes at midnight Israel time
  useEffect(() => {
    const checkDate = () => {
      const stored = localStorage.getItem('completedModes');
      if (stored) {
        const { date } = JSON.parse(stored);
        if (date !== getTodayInIsrael()) {
          setCompletedModes({
            classic: false,
            starpower: false,
            gadget: false,
            audio: false,
          });
          localStorage.setItem('completedModes', JSON.stringify({
            date: getTodayInIsrael(),
            modes: {
              classic: false,
              starpower: false,
              gadget: false,
              audio: false,
            }
          }));
        }
      }
    };

    checkDate();
    const interval = setInterval(checkDate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const markModeCompleted = async (mode: keyof GameModeCompletion) => {
    try {
      // Guards against invalid modes
      if (!completedModes.hasOwnProperty(mode)) {
        console.warn(`Invalid mode: ${mode}`);
        return;
      }
      
      // Don't do anything if this mode was already completed
      if (completedModes[mode] === true) {
        return;
      }
      
      const today = getTodayInIsrael();
      const newCompletedModes = { ...completedModes, [mode]: true };
      setCompletedModes(newCompletedModes);
      
      localStorage.setItem('completedModes', JSON.stringify({
        date: today,
        modes: newCompletedModes
      }));

      // Check if all modes are completed
      if (Object.values(newCompletedModes).filter(value => typeof value === 'boolean').every(Boolean)) {
        const newStreak = incrementStreak(today);
        setStreakState(newStreak);
        setLastCompleted(today);
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            current_streak: newStreak,
            last_completed_date: today,
          });
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const login = () => {
    window.location.href = '/auth';
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      // Keep local streak
      const local = getStreak();
      setStreakState(local.streak);
      setLastCompleted(local.lastCompleted);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <StreakContext.Provider
      value={{
        streak,
        lastCompleted,
        completedModes,
        markModeCompleted,
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