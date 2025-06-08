import type { SurvivalSettings, GameMode } from '@/stores/useSurvivalStore';
import { Brawler } from '@/data/brawlers';

/**
 * Calculates the number of guesses for the upcoming round.
 * Quota starts at 9 and decrements by 1 after each successful round (min 1).
 * Note: roundNumber here is the number of the round *about to start*.
 */
export const calculateNextGuessesQuota = (roundNumber: number): number => {
  if (roundNumber <= 3) return 9;
  if (roundNumber <= 6) return 8;
  if (roundNumber <= 9) return 7;
  if (roundNumber <= 12) return 6;
  if (roundNumber <= 15) return 5;
  if (roundNumber <= 18) return 4;
  return 3;
};

/**
 * Helper function to render heart display in UI
 * Returns an array like [true, true, false] for 2/3 hearts
 */
export const calculateRemainingHearts = (totalHearts: number, heartsLeft: number): boolean[] => {
  return Array(totalHearts).fill(false).map((_, index) => index < heartsLeft);
};

interface SelectionResult {
  brawlerId: number;
  mode: GameMode;
}

let lastSelectedModeIndex = -1; // State for 'cycle' rotation within this module
let lastSelectedMode: GameMode | null = null; // Track the last selected mode to prevent consecutive repeats

/**
 * Selects the next brawler and game mode for a survival round.
 * - Implements a 2-round cooldown system: brawlers cannot be selected for 2 rounds after being picked
 * - Ensures truly random selection from available brawlers (excluding those in cooldown)
 * - Prevents the same mode from being selected consecutively
 */
export const selectNextBrawlerAndMode = (
  allBrawlers: Brawler[],
  settings: SurvivalSettings,
  recentlyUsedBrawlerIds?: number[], // Array of brawler IDs used in recent rounds (last 2)
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
  
  // Select next mode based on rotation setting with consecutive prevention
  let nextMode: GameMode;
  
  // Since rotation is always 'repeat' (random), prevent consecutive same modes
  let availableModes = [...settings.modes];
  
  // If we have more than one mode and there was a previous mode, exclude it
  if (settings.modes.length > 1 && lastSelectedMode) {
    availableModes = availableModes.filter(mode => mode !== lastSelectedMode);
  }
  
  // If filtering left us with no modes (shouldn't happen), use all modes
  if (availableModes.length === 0) {
    availableModes = [...settings.modes];
  }
  
  const randomModeIndex = Math.floor(Math.random() * availableModes.length);
  nextMode = availableModes[randomModeIndex];
  
  // Update the last selected mode for next round
  lastSelectedMode = nextMode;
  
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
  
  console.log(`Mode selection: Selected ${nextMode} (previous: ${lastSelectedMode})`);
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
export const updateRecentlyUsedBrawlers = (currentList: number[], newBrawlerId: number): number[] => {
  const newList = [newBrawlerId, ...currentList];
  // Keep only the last 2 brawlers (for 2-round cooldown)
  return newList.slice(0, 2);
};

/**
 * Resets any internal state for mode selection (e.g., for 'cycle' rotation).
 * Call this when a new survival game instance starts.
 */
export const resetModeSelectionState = () => {
  lastSelectedModeIndex = -1;
  lastSelectedMode = null; // Reset the last selected mode tracking as well
}; 