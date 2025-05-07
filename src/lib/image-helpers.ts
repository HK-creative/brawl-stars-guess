
/**
 * Helper functions to generate image paths for brawler assets
 */

export function getPortrait(brawlerName: string) {
  return `/brawlers/portraits/${brawlerName.toLowerCase().replace(/\s+/g, '-')}_portrait.png`;
}

export function getPin(brawlerName: string) {
  return `/brawlers/pins/${brawlerName.toLowerCase().replace(/\s+/g, '-')}_pin.png`;
}

// Default fallback images
export const DEFAULT_PIN = "/placeholder.svg";
export const DEFAULT_PORTRAIT = "/placeholder.svg";
