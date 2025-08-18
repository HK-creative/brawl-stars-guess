import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchDailyChallenge, getCurrentDateUTC2, getTimeUntilNextChallenge } from '@/lib/daily-challenges';

export type DailyGameMode = 'classic' | 'gadget' | 'starpower' | 'audio' | 'pixels';

export interface DailyModeState {
  brawlerName: string;
  guessCount: number;
  isCompleted: boolean;
  lastCompletedDate: string | null;
  guesses: any[]; // Store the user's guesses for this mode
}

export interface DailyGameState {
  // Current date for tracking daily resets
  currentDate: string;
  
  // State for each daily mode
  classic: DailyModeState;
  gadget: DailyModeState;
  starpower: DailyModeState;
  audio: DailyModeState;
  pixels: DailyModeState;
  
  // Time until next brawler reset
  timeUntilNext: { hours: number; minutes: number; seconds: number };
  
  // Loading states
  isLoading: boolean;
  lastFetchDate: string | null;
}

interface DailyActions {
  // Initialize daily challenges for the current date
  initializeDailyModes: () => Promise<void>;
  
  // Update guess count for a specific mode
  incrementGuessCount: (mode: DailyGameMode) => void;
  
  // Mark a mode as completed
  completeMode: (mode: DailyGameMode) => void;
  
  // Reset guess count for a mode (when starting a new attempt)
  resetGuessCount: (mode: DailyGameMode) => void;
  
  // Submit a guess (batched): increments guessCount and saves non-duplicate guess atomically
  submitGuess: (mode: DailyGameMode, guess: any) => void;

  // Save a guess for a specific mode
  saveGuess: (mode: DailyGameMode, guess: any) => void;
  
  // Get guesses for a specific mode
  getGuesses: (mode: DailyGameMode) => any[];
  
  // Update time until next challenge
  updateTimeUntilNext: () => void;
  
  // Check if all modes are completed
  areAllModesCompleted: () => boolean;
  
  // Get completion progress (number of completed modes out of 5)
  getCompletionProgress: () => { completed: number; total: number };
  
  // Force refresh daily challenges
  refreshDailyChallenges: () => Promise<void>;
}

const initialModeState: DailyModeState = {
  brawlerName: '',
  guessCount: 0,
  isCompleted: false,
  lastCompletedDate: null,
  guesses: [],
};

const initialState: DailyGameState = {
  currentDate: getCurrentDateUTC2(),
  classic: { ...initialModeState },
  gadget: { ...initialModeState },
  starpower: { ...initialModeState },
  audio: { ...initialModeState },
  pixels: { ...initialModeState },
  timeUntilNext: { hours: 0, minutes: 0, seconds: 0 },
  isLoading: false,
  lastFetchDate: null,
};

export const useDailyStore = create<DailyGameState & DailyActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeDailyModes: async () => {
        const currentDate = getCurrentDateUTC2();
        const state = get();
        
        // Check if we need to reset for a new day
        if (state.currentDate !== currentDate) {
          console.log('New day detected, resetting daily modes');
          set({
            currentDate,
            classic: { ...initialModeState },
            gadget: { ...initialModeState },
            starpower: { ...initialModeState },
            audio: { ...initialModeState },
            pixels: { ...initialModeState },
            lastFetchDate: null,
          });
        }
        
        // Only fetch if we haven't fetched today or if forced
        if (state.lastFetchDate !== currentDate) {
          set({ isLoading: true });
          
          try {
            // Fetch daily challenges for all modes
            const [classicData, gadgetData, starpowerData, audioData, pixelsData] = await Promise.all([
              fetchDailyChallenge('classic'),
              fetchDailyChallenge('gadget'),
              fetchDailyChallenge('starpower'),
              fetchDailyChallenge('audio'),
              fetchDailyChallenge('pixels'),
            ]);
            
            set((state) => ({
              classic: {
                ...state.classic,
                brawlerName: typeof classicData === 'string' ? classicData : classicData?.brawlerName || 'Spike',
              },
              gadget: {
                ...state.gadget,
                brawlerName: gadgetData?.brawler || 'Spike',
              },
              starpower: {
                ...state.starpower,
                brawlerName: starpowerData?.brawler || 'Spike',
              },
              audio: {
                ...state.audio,
                brawlerName: audioData?.brawler || 'Spike',
              },
              pixels: {
                ...state.pixels,
                brawlerName: pixelsData?.brawler || 'Spike',
              },
              lastFetchDate: currentDate,
              isLoading: false,
            }));
            
            console.log('Daily challenges loaded successfully');
          } catch (error) {
            console.error('Error loading daily challenges:', error);
            set({ isLoading: false });
          }
        }
        
        // Update time until next challenge
        get().updateTimeUntilNext();
      },

      incrementGuessCount: (mode) => {
        set((state) => ({
          [mode]: {
            ...state[mode],
            guessCount: state[mode].guessCount + 1,
          },
        }));
      },

      completeMode: (mode) => {
        const currentDate = getCurrentDateUTC2();
        set((state) => ({
          [mode]: {
            ...state[mode],
            isCompleted: true,
            lastCompletedDate: currentDate,
          },
        }));
      },

      resetGuessCount: (mode) => {
        set((state) => ({
          [mode]: {
            ...state[mode],
            guessCount: 0,
            isCompleted: false,
            guesses: [],
          },
        }));
      },

      submitGuess: (mode, guess) => {
        set((state) => {
          const current = state[mode];
          const existing = current.guesses;
          const incomingName = (guess?.name ?? '').toString().toLowerCase();
          const isDup = incomingName
            ? existing.some((g: any) => (g?.name ?? '').toString().toLowerCase() === incomingName)
            : false;

          if (isDup) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`[daily-store] Duplicate guess ignored for ${mode}:`, incomingName);
            }
            // No state change on duplicates
            return { [mode]: current } as any;
          }

          return {
            [mode]: {
              ...current,
              guessCount: current.guessCount + 1,
              guesses: [...existing, guess],
            },
          } as any;
        });
      },

      saveGuess: (mode, guess) => {
        set((state) => {
          const existing = state[mode].guesses;
          const incomingName = (guess?.name ?? '').toString().toLowerCase();
          const isDup = incomingName
            ? existing.some((g: any) => (g?.name ?? '').toString().toLowerCase() === incomingName)
            : false;

        	if (isDup) {
            // Guard against duplicate guess entries
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`[daily-store] Duplicate guess ignored for ${mode}:`, incomingName);
            }
            return { [mode]: state[mode] } as any;
          }

          return {
            [mode]: {
              ...state[mode],
              guesses: [...existing, guess],
            },
          } as any;
        });
      },

      getGuesses: (mode) => {
        const state = get();
        return state[mode].guesses;
      },

      updateTimeUntilNext: () => {
        const timeUntilNext = getTimeUntilNextChallenge();
        set({ timeUntilNext });
      },

      areAllModesCompleted: () => {
        const state = get();
        return state.classic.isCompleted && 
               state.gadget.isCompleted && 
               state.starpower.isCompleted && 
               state.audio.isCompleted &&
               state.pixels.isCompleted;
      },

      getCompletionProgress: () => {
        const state = get();
        const completed = [
          state.classic.isCompleted,
          state.gadget.isCompleted,
          state.starpower.isCompleted,
          state.audio.isCompleted,
          state.pixels.isCompleted,
        ].filter(Boolean).length;
        
        return { completed, total: 5 };
      },

      refreshDailyChallenges: async () => {
        set({ lastFetchDate: null });
        await get().initializeDailyModes();
      },
    }),
    {
      name: 'daily-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 