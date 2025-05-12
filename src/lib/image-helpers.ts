
/**
 * Image helper functions for accessing pin and portrait images
 */

// Default fallback images 
export const DEFAULT_PIN = "/brawlers/pins/default.png";
export const DEFAULT_PORTRAIT = "/brawlers/portraits/default.png";

/**
 * Generate path for pin images
 * Format: /brawlers/pins/{brawlerName}_pin.png
 */
export function getPin(name: string): string {
  if (!name) return DEFAULT_PIN;
  return `/brawlers/pins/${encodeURIComponent(name)}_pin.png`;
}

/**
 * Generate path for portrait images
 * Format: /brawlers/portraits/{brawlerName}_portrait.png
 */
export function getPortrait(name: string): string {
  if (!name) return DEFAULT_PORTRAIT;
  return `/brawlers/portraits/${encodeURIComponent(name)}_portrait.png`;
}
