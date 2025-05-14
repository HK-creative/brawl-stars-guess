
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
 * Handles spaces in filenames
 */
export function getPin(name: string): string {
  if (!name) return DEFAULT_PIN;
  // Don't encode, use the name directly as it appears in the filenames
  return `/${name}_pin.png`;
}

/**
 * Generate path for portrait images
 * Format: /{brawlerName}_portrait.png
 * Handles spaces in filenames
 */
export function getPortrait(name: string): string {
  if (!name) return DEFAULT_PORTRAIT;
  // Don't encode, use the name directly as it appears in the filenames
  return `/${name}_portrait.png`;
}
