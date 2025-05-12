
/**
 * Simple image helper functions that directly reference public folder paths
 */

// Default fallback images when the real images can't be loaded
export const DEFAULT_PIN = "/placeholder.svg";
export const DEFAULT_PORTRAIT = "/placeholder.svg";

// Generate path for pin images - simple and straightforward with no transformations
export function getPin(brawlerName: string): string {
  if (!brawlerName) return DEFAULT_PIN;
  
  // Direct reference to the file with exact name matching
  return `/pins/${brawlerName}_pin.png`;
}

// Generate path for portrait images - simple and straightforward with no transformations
export function getPortrait(brawlerName: string): string {
  if (!brawlerName) return DEFAULT_PORTRAIT;
  
  // Direct reference to the file with exact name matching
  return `/portraits/${brawlerName}_portrait.png`;
}
