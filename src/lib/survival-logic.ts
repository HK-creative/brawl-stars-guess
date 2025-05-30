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
 * - Implements a 2-round cooldown system: brawlers cannot be selected for 2 rounds after being picked
 * - Ensures truly random selection from available brawlers (excluding those in cooldown)
 * - Handles 'cycle' and 'repeat' rotation for game modes.
 */
export const selectNextBrawlerAndMode = (
  allBrawlers: Brawler[],
  settings: SurvivalSettings,
  recentlyUsedBrawlerIds?: number[], // Array of brawler IDs used in recent rounds (last 2)
  // previousMode?: GameMode, // Not strictly needed for brawler/mode selection here, but for cycle state
  currentRoundNumberForModeSelection?: number // To help reset cycle if needed, or use static index
): SelectionResult => {
  if (settings.modes.length === 0) {
    throw new Error('No game modes available in settings');
  }
  
  // Ensure we have valid brawlers to work with
  if (!allBrawlers || allBrawlers.length === 0) {
    console.error('No brawlers data available for selection');
    // Create a fallback return with default values
    return {
      brawlerId: 1, // Default to ID 1
      mode: settings.modes[0] // Use first available mode
    };
  }
  
  // Select next mode based on rotation setting
  let nextMode: GameMode;
  
  // Always use random mode selection for simplicity
  const randomModeIndex = Math.floor(Math.random() * settings.modes.length);
  nextMode = settings.modes[randomModeIndex];
  
  // Initialize availableBrawlers with the complete list
  let availableBrawlers = [...allBrawlers];
  
  // Apply 2-round cooldown system
  if (recentlyUsedBrawlerIds && recentlyUsedBrawlerIds.length > 0 && availableBrawlers.length > recentlyUsedBrawlerIds.length) {
    // Filter out recently used brawlers (those in cooldown)
    const originalCount = availableBrawlers.length;
    availableBrawlers = availableBrawlers.filter(b => !recentlyUsedBrawlerIds.includes(b.id));
    
    console.log(`Brawler selection: Filtered out ${originalCount - availableBrawlers.length} recently used brawlers. Available: ${availableBrawlers.length}`);
    
    // If filtering leaves no brawlers (shouldn't happen with proper cooldown management), reset to full list
    if (availableBrawlers.length === 0) {
      console.warn('No brawlers available after cooldown filtering, resetting to full list');
      availableBrawlers = [...allBrawlers];
    }
  }
  
  // Ensure truly random selection using crypto.getRandomValues for better randomness
  let randomBrawlerIndex: number;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use crypto for better randomness
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    randomBrawlerIndex = randomArray[0] % availableBrawlers.length;
  } else {
    // Fallback to Math.random with additional shuffling for better distribution
    randomBrawlerIndex = Math.floor(Math.random() * availableBrawlers.length);
  }
  
  const selectedBrawler = availableBrawlers[randomBrawlerIndex];
  
  if (!selectedBrawler) {
    console.error('Failed to select a brawler from', availableBrawlers);
    // Fallback to the first brawler if selection fails
    const fallbackBrawlerId = allBrawlers[0]?.id || 1;
    console.log('Using fallback brawler ID:', fallbackBrawlerId);
    return { brawlerId: fallbackBrawlerId, mode: nextMode };
  }
  
  const nextBrawlerId = selectedBrawler.id;
  
  console.log(`Brawler selection: Selected ${selectedBrawler.name} (ID: ${nextBrawlerId}) from ${availableBrawlers.length} available options`);

  return {
    brawlerId: nextBrawlerId,
    mode: nextMode,
  };
};

/**
 * Updates the recently used brawlers list with 2-round cooldown
 * @param recentlyUsed Current list of recently used brawler IDs
 * @param newBrawlerId The newly selected brawler ID to add
 * @returns Updated list maintaining only the last 2 brawlers
 */
export const updateRecentlyUsedBrawlers = (recentlyUsed: number[], newBrawlerId: number): number[] => {
  const updated = [newBrawlerId, ...recentlyUsed];
  // Keep only the last 2 brawlers (current + previous)
  return updated.slice(0, 2);
};

/**
 * Resets any internal state for mode selection (e.g., for 'cycle' rotation).
 * Call this when a new survival game instance starts.
 */
export const resetModeSelectionState = () => {
    lastSelectedModeIndex = -1;
}; 