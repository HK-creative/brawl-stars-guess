import type { SurvivalSettings, GameMode } from '@/stores/useSurvivalStore';

/**
 * Calculates the number of guesses for the upcoming round.
 * Quota starts at 10 and decrements by 1 after each successful round (min 1).
 * Note: roundNumber here is the number of the round *about to start*.
 */
export const calculateNextGuessesQuota = (currentRoundNumber: number): number => {
  // If currentRoundNumber is 1 (first round), quota is 10.
  // If currentRoundNumber is 2, quota is 9, etc.
  return Math.max(1, 10 - (currentRoundNumber - 1));
};

/**
 * Helper function to render heart display in UI
 * Returns an array like [true, true, false] for 2/3 hearts
 */
export const calculateRemainingHearts = (totalHearts: number, heartsLeft: number): boolean[] => {
  return Array(totalHearts).fill(false).map((_, index) => index < heartsLeft);
};

interface Brawler {
  id: number;
  name: string; // Assuming brawlers have at least an id and name
  // Add other properties if needed for logic, e.g. rarity for weighted selection
}

interface SelectionResult {
  brawlerId: number;
  mode: GameMode;
}

let lastSelectedModeIndex = -1; // State for 'cycle' rotation within this module

/**
 * Selects the next brawler and game mode for a survival round.
 * - Tries to avoid picking the same brawler consecutively if possible.
 * - Handles 'cycle' and 'repeat' rotation for game modes.
 */
export const selectNextBrawlerAndMode = (
  allBrawlers: Brawler[],
  settings: SurvivalSettings,
  previousBrawlerId?: number,
  // previousMode?: GameMode, // Not strictly needed for brawler/mode selection here, but for cycle state
  currentRoundNumberForModeSelection?: number // To help reset cycle if needed, or use static index
): SelectionResult => {
  if (settings.modes.length === 0) {
    throw new Error('Cannot select mode: No game modes selected in settings.');
  }
  if (allBrawlers.length === 0) {
    throw new Error('Cannot select brawler: Empty brawler list.');
  }

  // 1. Select Next Game Mode
  let nextMode: GameMode;
  if (settings.rotation === 'cycle') {
    lastSelectedModeIndex = (lastSelectedModeIndex + 1) % settings.modes.length;
    nextMode = settings.modes[lastSelectedModeIndex];
  } else { // 'repeat' (random)
    const randomIndex = Math.floor(Math.random() * settings.modes.length);
    nextMode = settings.modes[randomIndex];
  }

  // 2. Select Next Brawler
  let availableBrawlers = [...allBrawlers];
  if (previousBrawlerId !== undefined && availableBrawlers.length > 1) {
    availableBrawlers = availableBrawlers.filter(b => b.id !== previousBrawlerId);
    // If filtering leaves no brawlers (e.g., only one brawler in total and it was previous),
    // then reset to full list to allow picking the same one.
    if (availableBrawlers.length === 0) {
        availableBrawlers = [...allBrawlers];
    }
  }
  
  const randomBrawlerIndex = Math.floor(Math.random() * availableBrawlers.length);
  const nextBrawlerId = availableBrawlers[randomBrawlerIndex].id;

  return {
    brawlerId: nextBrawlerId,
    mode: nextMode,
  };
};

/**
 * Resets any internal state for mode selection (e.g., for 'cycle' rotation).
 * Call this when a new survival game instance starts.
 */
export const resetModeSelectionState = () => {
    lastSelectedModeIndex = -1;
}; 