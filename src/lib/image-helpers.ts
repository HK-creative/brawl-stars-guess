
/**
 * Helper functions to generate image paths for brawler assets
 */

// Generate path for pin images
export function getPin(brawlerName: string): string {
  // Format the path to ensure correct case sensitivity
  const formattedName = encodeURIComponent(brawlerName);
  const path = `/pins/${formattedName}_pin.png`;
  console.log(`Generated pin path for ${brawlerName}:`, path);
  return path;
}

// Generate path for portrait images
export function getPortrait(brawlerName: string): string {
  // Format the path to ensure correct case sensitivity
  const formattedName = encodeURIComponent(brawlerName);
  const path = `/portraits/${formattedName}_portrait.png`;
  console.log(`Generated portrait path for ${brawlerName}:`, path);
  return path;
}

// Default fallback images
export const DEFAULT_PIN = "/placeholder.svg";
export const DEFAULT_PORTRAIT = "/placeholder.svg";
