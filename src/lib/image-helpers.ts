
/**
 * Helper functions to generate image paths for brawler assets
 */

// Generate path for pin images
export function getPin(brawlerName: string): string {
  try {
    // Format the brawler name to match file naming (lowercase, no special chars)
    const formattedName = brawlerName.trim();
    const path = `/pins/${formattedName}_pin.png`;
    console.log(`Generated pin path for ${brawlerName}:`, path);
    return path;
  } catch (error) {
    console.error(`Error generating pin path for ${brawlerName}:`, error);
    return DEFAULT_PIN;
  }
}

// Generate path for portrait images
export function getPortrait(brawlerName: string): string {
  try {
    // Format the brawler name to match file naming (lowercase, no special chars)
    const formattedName = brawlerName.trim();
    const path = `/portraits/${formattedName}_portrait.png`;
    console.log(`Generated portrait path for ${brawlerName}:`, path);
    return path;
  } catch (error) {
    console.error(`Error generating portrait path for ${brawlerName}:`, error);
    return DEFAULT_PORTRAIT;
  }
}

// Default fallback images
export const DEFAULT_PIN = "/placeholder.svg";
export const DEFAULT_PORTRAIT = "/placeholder.svg";
