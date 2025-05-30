import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateNextGuessesQuota,
  selectNextBrawlerAndMode,
  resetModeSelectionState,
  calculateRemainingHearts,
  updateRecentlyUsedBrawlers
} from './survival-logic';
import type { SurvivalSettings } from '@/stores/useSurvivalStore';

// Mock brawlers for testing
const mockBrawlers = [
  { id: 1, name: 'Shelly' },
  { id: 2, name: 'Nita' },
  { id: 3, name: 'Colt' },
  { id: 4, name: 'Bull' },
  { id: 5, name: 'Jessie' },
];

describe('survival-logic', () => {
  beforeEach(() => {
    // Reset any module-level state before each test
    resetModeSelectionState();
    vi.restoreAllMocks();
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

    it('should return 1 for round 10 and beyond', () => {
      expect(calculateNextGuessesQuota(10)).toBe(1);
      expect(calculateNextGuessesQuota(15)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(calculateNextGuessesQuota(0)).toBe(10); // Edge case: round 0
      expect(calculateNextGuessesQuota(-5)).toBe(10); // Edge case: negative round
    });
  });

  describe('calculateRemainingHearts', () => {
    it('should return correct heart display for full hearts', () => {
      expect(calculateRemainingHearts(3, 3)).toEqual([true, true, true]);
    });

    it('should return correct heart display for partial hearts', () => {
      expect(calculateRemainingHearts(3, 2)).toEqual([true, true, false]);
      expect(calculateRemainingHearts(5, 1)).toEqual([true, false, false, false, false]);
    });

    it('should return correct heart display for no hearts', () => {
      expect(calculateRemainingHearts(3, 0)).toEqual([false, false, false]);
    });
  });

  describe('updateRecentlyUsedBrawlers', () => {
    it('should add new brawler to empty list', () => {
      expect(updateRecentlyUsedBrawlers([], 1)).toEqual([1]);
    });

    it('should add new brawler to existing list', () => {
      expect(updateRecentlyUsedBrawlers([2], 1)).toEqual([1, 2]);
    });

    it('should maintain only last 2 brawlers', () => {
      expect(updateRecentlyUsedBrawlers([2, 3], 1)).toEqual([1, 2]);
      expect(updateRecentlyUsedBrawlers([2, 3, 4], 1)).toEqual([1, 2]);
    });

    it('should handle duplicate brawler IDs', () => {
      expect(updateRecentlyUsedBrawlers([1, 2], 1)).toEqual([1, 1]);
    });
  });

  describe('selectNextBrawlerAndMode', () => {
    const baseSettings: SurvivalSettings = {
      modes: ['classic', 'gadget'],
      rotation: 'repeat',
      timer: 150,
    };

    it('should throw an error if no modes are selected', () => {
      const settings: SurvivalSettings = { ...baseSettings, modes: [] };
      expect(() => selectNextBrawlerAndMode(mockBrawlers, settings)).toThrow(
        'No game modes available in settings'
      );
    });

    it('should handle empty brawler list gracefully', () => {
      const result = selectNextBrawlerAndMode([], baseSettings);
      expect(result.brawlerId).toBe(1); // Fallback ID
      expect(baseSettings.modes).toContain(result.mode);
    });

    it('should select a brawler from the provided list', () => {
      const result = selectNextBrawlerAndMode(mockBrawlers, baseSettings);
      expect(mockBrawlers.some(b => b.id === result.brawlerId)).toBe(true);
    });

    it('should avoid recently used brawlers when possible', () => {
      const recentlyUsed = [1, 2]; // Shelly and Nita are in cooldown
      
      // Mock Math.random to select first available brawler (should be Colt, ID 3)
      vi.spyOn(Math, 'random').mockReturnValue(0);
      
      const result = selectNextBrawlerAndMode(mockBrawlers, baseSettings, recentlyUsed);
      
      // Should not select brawlers 1 or 2 (in cooldown)
      expect(result.brawlerId).not.toBe(1);
      expect(result.brawlerId).not.toBe(2);
      expect([3, 4, 5]).toContain(result.brawlerId);
    });

    it('should handle case where all brawlers are in cooldown', () => {
      const singleBrawlerList = [mockBrawlers[0]]; // Only Shelly
      const recentlyUsed = [1]; // Shelly is in cooldown
      
      const result = selectNextBrawlerAndMode(singleBrawlerList, baseSettings, recentlyUsed);
      expect(result.brawlerId).toBe(1); // Should still select Shelly as it's the only option
    });

    it('should work with empty recently used list', () => {
      const result = selectNextBrawlerAndMode(mockBrawlers, baseSettings, []);
      expect(mockBrawlers.some(b => b.id === result.brawlerId)).toBe(true);
    });

    it('should work without recently used parameter', () => {
      const result = selectNextBrawlerAndMode(mockBrawlers, baseSettings);
      expect(mockBrawlers.some(b => b.id === result.brawlerId)).toBe(true);
    });

    it('should select from available modes', () => {
      const result = selectNextBrawlerAndMode(mockBrawlers, baseSettings);
      expect(baseSettings.modes).toContain(result.mode);
    });

    it('should handle single mode correctly', () => {
      const settings: SurvivalSettings = { ...baseSettings, modes: ['classic'] };
      const result = selectNextBrawlerAndMode(mockBrawlers, settings);
      expect(result.mode).toBe('classic');
    });

    it('should properly filter out multiple recently used brawlers', () => {
      const recentlyUsed = [1, 2]; // Two brawlers in cooldown
      
      // Test multiple times to ensure consistent filtering
      for (let i = 0; i < 10; i++) {
        const result = selectNextBrawlerAndMode(mockBrawlers, baseSettings, recentlyUsed);
        expect(result.brawlerId).not.toBe(1);
        expect(result.brawlerId).not.toBe(2);
        expect([3, 4, 5]).toContain(result.brawlerId);
      }
    });

    it('should use random mode selection', () => {
      const settings: SurvivalSettings = { 
        ...baseSettings, 
        modes: ['classic', 'gadget', 'starpower', 'audio'] 
      };
      
      // Test multiple selections to ensure randomness
      const modes = new Set();
      for (let i = 0; i < 20; i++) {
        const result = selectNextBrawlerAndMode(mockBrawlers, settings);
        modes.add(result.mode);
      }
      
      // Should have selected multiple different modes (with high probability)
      expect(modes.size).toBeGreaterThan(1);
    });
  });
}); 