import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateNextGuessesQuota,
  selectNextBrawlerAndMode,
  resetModeSelectionState,
  calculateRemainingHearts,
} from './survival-logic';
import type { SurvivalSettings, GameMode } from '@/stores/useSurvivalStore';

// Mock Brawler data
const mockBrawlers = [
  { id: 1, name: 'Brawler A' },
  { id: 2, name: 'Brawler B' },
  { id: 3, name: 'Brawler C' },
  { id: 4, name: 'Brawler D' },
  { id: 5, name: 'Brawler E' },
];

describe('survival-logic', () => {
  beforeEach(() => {
    resetModeSelectionState(); // Reset cycle state before each test
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore all mocks after each test
  });

  describe('calculateNextGuessesQuota', () => {
    it('should return 10 for round 1', () => {
      expect(calculateNextGuessesQuota(1)).toBe(10);
    });
    it('should return 9 for round 2', () => {
      expect(calculateNextGuessesQuota(2)).toBe(9);
    });
    it('should return 1 for round 10', () => {
      expect(calculateNextGuessesQuota(10)).toBe(1);
    });
    it('should return 1 for rounds greater than 10 (e.g., round 11)', () => {
      expect(calculateNextGuessesQuota(11)).toBe(1);
    });
    it('should return 1 for round 15', () => {
      expect(calculateNextGuessesQuota(15)).toBe(1);
    });
  });

  describe('calculateRemainingHearts', () => {
    it('should return an array of the correct length based on total hearts', () => {
      const result = calculateRemainingHearts(3, 2);
      expect(result.length).toBe(3);
    });

    it('should set correct values based on hearts left (3 total, 2 left)', () => {
      const result = calculateRemainingHearts(3, 2);
      expect(result).toEqual([true, true, false]);
    });

    it('should set all values to true when hearts left equals total hearts', () => {
      const result = calculateRemainingHearts(3, 3);
      expect(result).toEqual([true, true, true]);
    });

    it('should set all values to false when hearts left is 0', () => {
      const result = calculateRemainingHearts(3, 0);
      expect(result).toEqual([false, false, false]);
    });

    it('should handle edge case with 1 total heart', () => {
      const result = calculateRemainingHearts(1, 1);
      expect(result).toEqual([true]);
    });

    it('should properly handle 1 heart left out of 3', () => {
      const result = calculateRemainingHearts(3, 1);
      expect(result).toEqual([true, false, false]);
    });
  });

  describe('selectNextBrawlerAndMode', () => {
    const baseSettings: SurvivalSettings = {
      hearts: 3,
      modes: ['classic', 'gadget'],
      rotation: 'cycle',
    };

    it('should throw an error if no modes are selected', () => {
      const settings: SurvivalSettings = { ...baseSettings, modes: [] };
      expect(() => selectNextBrawlerAndMode(mockBrawlers, settings)).toThrow(
        'Cannot select mode: No game modes selected in settings.'
      );
    });

    it('should throw an error if brawler list is empty', () => {
      expect(() => selectNextBrawlerAndMode([], baseSettings)).toThrow(
        'Cannot select brawler: Empty brawler list.'
      );
    });

    it('should cycle through modes correctly with \'cycle\' rotation', () => {
      const settings: SurvivalSettings = { ...baseSettings, modes: ['classic', 'gadget', 'audio'], rotation: 'cycle' };
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('classic');
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('gadget');
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('audio');
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('classic'); // Wraps around
    });

    it('should pick randomly from selected modes with \'repeat\' rotation', () => {
      const settings: SurvivalSettings = { ...baseSettings, modes: ['classic', 'starpower'], rotation: 'repeat' };
      
      vi.spyOn(Math, 'random').mockReturnValue(0); // Force selection of first mode
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('classic');
      vi.restoreAllMocks(); // Clear the specific mock for the next assertion in the same test
      
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // Force selection of last mode
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('starpower');
    });

    it('should select a brawler from the provided list', () => {
      const result = selectNextBrawlerAndMode(mockBrawlers, baseSettings);
      expect(mockBrawlers.some(b => b.id === result.brawlerId)).toBe(true);
    });

    it('should attempt to select a different brawler than the previous one if multiple brawlers available', () => {
      const previousBrawlerId = mockBrawlers[0].id;
      // Control Math.random to avoid flakiness
      // For this test, the goal is that if Math.random *would* pick the previousBrawlerId,
      // the logic should ideally pick something else if other options exist.
      // Let's say Math.random selects index 0 (previousBrawlerId)
      vi.spyOn(Math, 'random').mockReturnValue(0 / mockBrawlers.length);
      const result = selectNextBrawlerAndMode(mockBrawlers, baseSettings, previousBrawlerId);
      if (mockBrawlers.length > 1) {
        expect(result.brawlerId).not.toBe(previousBrawlerId);
      } else {
        expect(result.brawlerId).toBe(previousBrawlerId); // Must pick same if only one
      }
    });
    
    it('should select the same brawler if only one brawler is available, even if it was previous', () => {
        const singleBrawlerList = [mockBrawlers[0]];
        const previousBrawlerId = mockBrawlers[0].id;
        const result = selectNextBrawlerAndMode(singleBrawlerList, baseSettings, previousBrawlerId);
        expect(result.brawlerId).toBe(previousBrawlerId);
    });

    it('should correctly handle cycle mode reset via resetModeSelectionState', () => {
        const settings: SurvivalSettings = { ...baseSettings, modes: ['classic', 'gadget'], rotation: 'cycle' };
        expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('classic');
        expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('gadget');
        resetModeSelectionState();
        expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('classic');
    });

    it('cycle rotation should handle single mode correctly', () => {
      const settings: SurvivalSettings = { ...baseSettings, modes: ['classic'], rotation: 'cycle' };
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('classic');
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('classic');
    });

    it('repeat rotation should handle single mode correctly', () => {
      const settings: SurvivalSettings = { ...baseSettings, modes: ['audio'], rotation: 'repeat' };
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('audio');
      expect(selectNextBrawlerAndMode(mockBrawlers, settings).mode).toBe('audio');
    });

    it('should pick a brawler correctly when filtering for previousBrawlerId', () => {
        const brawlers = [{ id: 1, name: 'A'}, { id: 2, name: 'B'}];
        
        // Scenario 1: previous was ID 2, Math.random would pick index 0 (ID 1)
        vi.spyOn(Math, 'random').mockReturnValue(0); 
        const result1 = selectNextBrawlerAndMode(brawlers, baseSettings, 2); 
        expect(result1.brawlerId).toBe(1);
        vi.restoreAllMocks();

        // Scenario 2: previous was ID 1, Math.random would pick index 1 (ID 2)
        // (adjusting mock for an array of 1 after filtering, assuming prevBrawlerId=1 makes available = [Brawler B])
        // The availableBrawlers in this case inside the function would be [{id: 2, name: 'B'}] 
        // so random index 0 on this list means brawler with id 2.
        vi.spyOn(Math, 'random').mockReturnValue(0); 
        const result2 = selectNextBrawlerAndMode(brawlers, baseSettings, 1);
        expect(result2.brawlerId).toBe(2);
    });

    it('should hit the reset condition if allBrawlers (length > 1) only contains previousBrawlerId duplicates', () => {
      const duplicateBrawlers = [{ id: 1, name: 'Brawler A Dupe1' }, { id: 1, name: 'Brawler A Dupe2' }];
      const settings: SurvivalSettings = { ...baseSettings, modes: ['classic'], rotation: 'cycle' }; // mode/rotation don't matter here
      const previousBrawlerId = 1;
      
      // We expect it to still pick brawler 1 because the filter will empty the list,
      // then it will be reset to duplicateBrawlers, and one of them will be picked.
      const result = selectNextBrawlerAndMode(duplicateBrawlers, settings, previousBrawlerId);
      expect(result.brawlerId).toBe(1);
    });

  });
}); 