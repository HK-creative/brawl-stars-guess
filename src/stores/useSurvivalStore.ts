import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateNextGuessesQuota, selectNextBrawlerAndMode, resetModeSelectionState } from '@/lib/survival-logic';
import { brawlers } from '@/data/brawlers';

// Define the available game modes explicitly based on existing pages
export type GameMode = 'classic' | 'starpower' | 'gadget' | 'audio';

export interface SurvivalSettings {
  hearts: 1 | 2 | 3;
  modes: GameMode[]; // Array of selected game modes
  rotation: 'repeat' | 'cycle'; // How to rotate through selected modes
  timer?: number; // Optional timer in seconds for each round
}

export interface SurvivalRoundState {
  roundNumber: number;
  currentBrawlerId: number | null; // ID of the brawler for the current round
  currentMode: GameMode | null; // Sub-mode for the current round
  guessesQuota: number; // Total guesses allowed for this round
  guessesLeft: number; // Guesses remaining for the current round
  timerLeft?: number; // Timer remaining for the current round (if timer is enabled)
  isRoundActive: boolean;
}

export interface SurvivalGameState {
  settings: SurvivalSettings | null;
  heartsLeft: number;
  currentRound: number; // Overall round number in the survival game
  gameStatus: 'setup' | 'playing' | 'paused' | 'gameover';
  // Individual round state could be part of this or separate
  activeRoundState: SurvivalRoundState | null;
  // Potentially an array to store history of rounds if needed for summary
  // roundHistory: SurvivalRoundState[]; 
}

// Define actions for the store
interface SurvivalActions {
  // Setup actions
  initializeGame: (settings: SurvivalSettings) => void;
  updateSettings: (newSettings: Partial<SurvivalSettings>) => void;
  // Gameplay actions
  startNextRound: () => void; // Logic to set up brawler, mode, quota
  decrementGuess: () => void;
  decrementHeart: () => void;
  setTimerLeft: (time: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitGame: () => void; // Resets state, navigates away
  gameOver: () => void;
  // Utility/reset
  resetSurvivalStore: () => void;
}

const initialSettings: SurvivalSettings = {
  hearts: 3,
  modes: ['classic', 'gadget', 'starpower', 'audio'], // Default to all modes
  rotation: 'cycle',
  timer: undefined,
};

const initialRoundState: SurvivalRoundState = {
  roundNumber: 0,
  currentBrawlerId: null,
  currentMode: null,
  guessesQuota: 10,
  guessesLeft: 10,
  timerLeft: undefined,
  isRoundActive: false,
};

const initialGameState: SurvivalGameState = {
  settings: null, // Initialized by player
  heartsLeft: 0,
  currentRound: 0,
  gameStatus: 'setup',
  activeRoundState: null,
};

export const useSurvivalStore = create<SurvivalGameState & SurvivalActions>()(
  persist(
    (set, get) => ({
      // Initial state from SurvivalGameState interface
      ...initialGameState,

      // Actions implementation
      initializeGame: (settings) => set((state) => ({
        ...initialGameState, // Reset most game state fields
        settings: settings,
        heartsLeft: settings.hearts,
        gameStatus: 'playing', // Or 'setup' if first round needs explicit start
        currentRound: 0, // Will be incremented by startNextRound
        // activeRoundState will be set by startNextRound
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: state.settings ? { ...state.settings, ...newSettings } : null,
      })),

      startNextRound: () => {
        set((state) => {
          if (!state.settings) return {}; // Should not happen if game is initialized
          
          const newRoundNumber = state.currentRound + 1;
          
          // Calculate next round's guesses quota
          const newGuessesQuota = calculateNextGuessesQuota(newRoundNumber);
          
          // Convert brawlers to format expected by selectNextBrawlerAndMode
          const brawlersWithId = brawlers.map((b, index) => ({
            id: index + 1, // Generate sequential IDs
            name: b.name
          }));
          
          // Select next brawler and mode based on current state and settings
          const { brawlerId, mode } = selectNextBrawlerAndMode(
            brawlersWithId,
            state.settings,
            state.activeRoundState?.currentBrawlerId
          );

          return {
            currentRound: newRoundNumber,
            gameStatus: 'playing',
            activeRoundState: {
              roundNumber: newRoundNumber,
              currentBrawlerId: brawlerId,
              currentMode: mode,
              guessesQuota: newGuessesQuota,
              guessesLeft: newGuessesQuota,
              timerLeft: state.settings?.timer, // Reset timer if enabled
              isRoundActive: true,
            }
          };
        });
      },

      decrementGuess: () => set((state) => {
        if (!state.activeRoundState || state.activeRoundState.guessesLeft <= 0) return {};
        const newGuessesLeft = state.activeRoundState.guessesLeft - 1;
        return {
          activeRoundState: {
            ...state.activeRoundState,
            guessesLeft: newGuessesLeft,
          }
        };
      }),

      decrementHeart: () => set((state) => {
        if (state.heartsLeft <= 0) return {};
        const newHeartsLeft = state.heartsLeft - 1;
        if (newHeartsLeft === 0) {
          // Game over will be called separately
        }
        return {
          heartsLeft: newHeartsLeft,
        };
      }),

      setTimerLeft: (time) => set((state) => {
        if (!state.activeRoundState) return {};
        return {
          activeRoundState: {
            ...state.activeRoundState,
            timerLeft: time,
          }
        };
      }),

      pauseGame: () => set({ gameStatus: 'paused' }),
      resumeGame: () => set({ gameStatus: 'playing' }),
      
      quitGame: () => set((state) => ({
        ...initialGameState, // Reset to initial setup state
        settings: state.settings, // Optionally keep settings for quick restart setup
      })),

      gameOver: () => set({ 
        gameStatus: 'gameover', 
        activeRoundState: { ...get().activeRoundState!, isRoundActive: false } 
      }),

      resetSurvivalStore: () => set(initialGameState),
    }),
    {
      name: 'survival_v1', // Name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
);

// Initial default settings (can be used in setup page)
export { initialSettings as defaultSurvivalSettings }; 