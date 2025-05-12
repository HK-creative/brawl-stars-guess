/**
 * Image helper functions for accessing pin and portrait images
 */

// Default fallback images 
export const DEFAULT_PIN = "/placeholder.svg";
export const DEFAULT_PORTRAIT = "/placeholder.svg";

/**
 * Generate path for pin images
 * Format: /pins/{brawlerName}_pin.png
 */
export function getPin(brawlerName: string): string {
  if (!brawlerName) return DEFAULT_PIN;
  
  // Sanitize name for direct file access (keep special characters)
  return `/pins/${brawlerName}_pin.png`;
}

/**
 * Generate path for portrait images
 * Format: /portraits/{brawlerName}_portrait.png
 */
export function getPortrait(brawlerName: string): string {
  if (!brawlerName) return DEFAULT_PORTRAIT;
  
  // Sanitize name for direct file access (keep special characters)
  return `/portraits/${brawlerName}_portrait.png`;
}
