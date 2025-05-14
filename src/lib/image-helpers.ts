
/**
 * Image helper functions for accessing pin and portrait images
 * Updated to work with images directly in the public folder
 */

// Default fallback images 
export const DEFAULT_PIN = "/default_pin.png";
export const DEFAULT_PORTRAIT = "/default_portrait.png";

/**
 * Generate path for pin images
 * Format: /{brawlerName}_pin.png
 */
export function getPin(name: string): string {
  if (!name) return DEFAULT_PIN;
  // Direct path to the pin image in the public folder
  return `/${name.toLowerCase()}_pin.png`;
}

/**
 * Generate path for portrait images
 * Format: /{brawlerName}_portrait.png
 */
export function getPortrait(name: string): string {
  if (!name) return DEFAULT_PORTRAIT;
  // Direct path to the portrait image in the public folder
  return `/${name.toLowerCase()}_portrait.png`;
}
