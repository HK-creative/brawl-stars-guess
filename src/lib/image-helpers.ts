
/**
 * Helper functions to generate image paths for brawler assets
 */

export function getPortrait(brawlerName: string) {
  const path = `/brawlers/portraits/${brawlerName.toLowerCase()}_portrait.png`;
  console.log('Generated portrait path:', path);
  return path;
}

export function getPin(brawlerName: string) {
  const path = `/brawlers/pins/${brawlerName.toLowerCase()}_pin.png`;
  console.log('Generated pin path:', path);
  return path;
}

// Default fallback images
export const DEFAULT_PIN = "/placeholder.svg";
export const DEFAULT_PORTRAIT = "/placeholder.svg";
