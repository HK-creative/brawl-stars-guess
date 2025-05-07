
/**
 * Helper functions to generate image paths for brawler assets
 */

export function getPortrait(brawlerName: string) {
  // Handle special characters and preserve case for file name matching
  const path = `/brawlers/portraits/${brawlerName}_portrait.png`;
  console.log('Generated portrait path:', path);
  return path;
}

export function getPin(brawlerName: string) {
  // Handle special characters and preserve case for file name matching
  const path = `/brawlers/pins/${brawlerName}_pin.png`;
  console.log('Generated pin path:', path);
  return path;
}

// Default fallback images
export const DEFAULT_PIN = "/placeholder.svg";
export const DEFAULT_PORTRAIT = "/placeholder.svg";
