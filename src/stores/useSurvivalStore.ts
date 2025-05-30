import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateNextGuessesQuota, selectNextBrawlerAndMode, resetModeSelectionState, updateRecentlyUsedBrawlers } from '@/lib/survival-logic';
import { brawlers } from '@/data/brawlers';

// Define the available game modes explicitly based on existing pages
export type GameMode = 'classic' | 'starpower' | 'gadget' | 'audio';

export interface SurvivalSettings {
  // Only modes are configurable now
  modes: GameMode[]; // Array of selected game modes
  // Fixed settings
  rotation: 'repeat'; // Always randomly pick from selected modes
  timer: 150; // Always 150 seconds timer
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
  currentRound: number; // Overall round number in the survival game
  gameStatus: 'setup' | 'playing' | 'paused' | 'gameover';
  // Individual round state could be part of this or separate
  activeRoundState: SurvivalRoundState | null;
  // Track recently used brawlers for 2-round cooldown system
  recentlyUsedBrawlers: number[]; // Array of brawler IDs used in recent rounds (max 2)
  // Potentially an array to store history of rounds if needed for summary
  // roundHistory: SurvivalRoundState[]; 
}

// Define actions for the store
interface SurvivalActions {
  // Setup actions
  initializeGame: (settings: SurvivalSettings) => void;
  updateSettings: (newSettings: Partial<SurvivalSettings>) => void;
  // Gameplay actions
  startNextRound: (specificMode?: GameMode) => void; // Logic to set up brawler, mode, quota (can specify a mode)
  decrementGuess: () => void;
  setTimerLeft: (time: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitGame: () => void; // Resets state, navigates away
  gameOver: () => void;
  // Utility/reset
  resetSurvivalStore: () => void;
}

const initialSettings: SurvivalSettings = {
  modes: ['classic', 'gadget', 'starpower', 'audio'], // Default to all modes
  rotation: 'repeat', // Fixed setting - always random
  timer: 150, // Fixed setting - always 150 seconds
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
  currentRound: 0,
  gameStatus: 'setup',
  activeRoundState: null,
  recentlyUsedBrawlers: [], // Initialize empty cooldown list
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
        gameStatus: 'playing', // Or 'setup' if first round needs explicit start
        currentRound: 0, // Will be incremented by startNextRound
        recentlyUsedBrawlers: [], // Reset cooldown list for new game
        // activeRoundState will be set by startNextRound
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: state.settings ? { ...state.settings, ...newSettings } : null,
      })),
      
      startNextRound: (specificMode?: GameMode) => {
        set((state) => {
          if (!state.settings) {
            console.error('Cannot start next round: Settings not initialized');
            return {}; // Should not happen if game is initialized
          }
          
          try {
            const newRoundNumber = state.currentRound + 1;
            console.log(`Starting round ${newRoundNumber} in Survival Mode`);
            
            // Calculate next round's guesses quota
            const newGuessesQuota = calculateNextGuessesQuota(newRoundNumber);
            console.log(`Guesses quota for round ${newRoundNumber}: ${newGuessesQuota}`);
            
            // Convert brawlers to format expected by selectNextBrawlerAndMode
            // IMPORTANT: Preserve each brawler's original ID if it exists, or assign a valid one
            const brawlersWithId = brawlers.map((b) => ({
              id: b.id || brawlers.indexOf(b) + 1, // Use existing ID or generate sequential IDs
              name: b.name || `Unknown Brawler ${brawlers.indexOf(b) + 1}` // Ensure name is present
            }));
            
            // Log the valid brawler IDs for debugging
            console.log(`Valid brawler IDs range: 1 to ${brawlersWithId.length}`);
            if (brawlersWithId.length > 0) {
              console.log(`Sample brawler: ${brawlersWithId[0].name} with ID ${brawlersWithId[0].id}`);
            }
            
            // Ensure we have at least one valid brawler
            if (brawlersWithId.length === 0) {
              console.error('No brawlers available for selection');
              // Create at least one fallback brawler to prevent errors
              brawlersWithId.push({
                id: 1,
                name: 'Shelly' // Default brawler as fallback
              });
            }
            
            console.log(`Prepared ${brawlersWithId.length} brawlers for selection`);
            console.log(`Recently used brawlers (in cooldown): [${state.recentlyUsedBrawlers.join(', ')}]`);
            
            // Ensure we have a valid array of modes
            if (!state.settings.modes || state.settings.modes.length === 0) {
              console.error('No game modes available in settings');
              return {
                gameStatus: 'setup',
              };
            }
            
            let selectedBrawlerId: number;
            let selectedMode: GameMode;
            
            try {
              if (specificMode) {
                // If a specific mode is requested, use it directly
                selectedMode = specificMode;
                console.log(`Using specified mode: ${selectedMode}`);
                
                // Apply cooldown filtering for specific mode selection too
                const filteredBrawlers = brawlersWithId.filter(
                  b => !state.recentlyUsedBrawlers.includes(b.id)
                );
                
                // Make sure we have brawlers to select from
                if (filteredBrawlers.length === 0) {
                  console.warn('No brawlers available after cooldown filtering, using all brawlers');
                  const randomBrawlerIndex = Math.floor(Math.random() * brawlersWithId.length);
                  selectedBrawlerId = brawlersWithId[randomBrawlerIndex].id;
                } else {
                  const randomBrawlerIndex = Math.floor(Math.random() * filteredBrawlers.length);
                  selectedBrawlerId = filteredBrawlers[randomBrawlerIndex].id;
                }
              } else {
                // Use the standard selection logic with cooldown system
                console.log('Using standard brawler and mode selection logic with cooldown system');
                const { brawlerId, mode } = selectNextBrawlerAndMode(
                  brawlersWithId,
                  state.settings,
                  state.recentlyUsedBrawlers // Pass the cooldown array instead of single previous ID
                );
                selectedBrawlerId = brawlerId;
                selectedMode = mode;
              }
              
              console.log(`Selected: Brawler ID ${selectedBrawlerId}, Mode: ${selectedMode}`);
            } catch (error) {
              // Fallback if selection fails
              console.error('Error selecting brawler or mode:', error);
              selectedBrawlerId = 1; // Use first brawler as fallback
              selectedMode = state.settings.modes[0]; // Use first mode as fallback
              console.log(`Using fallback selection: Brawler ID ${selectedBrawlerId}, Mode: ${selectedMode}`);
            }
            
            // Update the recently used brawlers list with the new selection
            const updatedRecentlyUsed = updateRecentlyUsedBrawlers(state.recentlyUsedBrawlers, selectedBrawlerId);
            console.log(`Updated recently used brawlers: [${updatedRecentlyUsed.join(', ')}]`);
            
            return {
              currentRound: newRoundNumber,
              gameStatus: 'playing',
              recentlyUsedBrawlers: updatedRecentlyUsed, // Update the cooldown list
              activeRoundState: {
                roundNumber: newRoundNumber,
                currentBrawlerId: selectedBrawlerId,
                currentMode: selectedMode,
                guessesQuota: newGuessesQuota,
                guessesLeft: newGuessesQuota,
                timerLeft: state.settings.timer, // Reset timer if enabled
                isRoundActive: true,
              }
            };
          } catch (error) {
            console.error('Fatal error in startNextRound:', error);
            // Return to setup if something goes wrong
            return {
              gameStatus: 'setup',
              currentRound: 0,
              activeRoundState: null
            };
          }

          // The return statement has been moved inside the try block to fix scope issues
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
        recentlyUsedBrawlers: [], // Reset cooldown list when quitting
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