
/**
 * Helper functions to generate image paths for brawler assets
 */

// Fix path to point to the pins folder in the project root
export function getPin(brawlerName: string): string {
  // Updated path to use the correct location of pin images
  const path = `/pins/${encodeURIComponent(brawlerName)}_pin.png`;
  console.log('Generated pin path:', path);
  return path;
}

// Fix path to point to the portraits folder in the project root
export function getPortrait(brawlerName: string): string {
  // Updated path to use the correct location of portrait images
  const path = `/portraits/${encodeURIComponent(brawlerName)}_portrait.png`;
  console.log('Generated portrait path:', path);
  return path;
}

// Default fallback images
export const DEFAULT_PIN = "/placeholder.svg";
export const DEFAULT_PORTRAIT = "/placeholder.svg";
