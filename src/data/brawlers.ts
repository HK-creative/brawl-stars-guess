
import brawlersData from './brawlers_full.json';

export interface Brawler {
  name: string;
  rarity: string;
  class: string;
  movement: string;
  range: string;
  reload: string;
  wallbreak: string;  // Wallbreak property is now required
  releaseYear?: number;
  released?: string;
  image?: string;
}

// List of brawlers that have wallbreak ability
const wallbreakBrawlers = [
  "Bull", 
  "El Primo", 
  "Frank", 
  "Stu", 
  "Ruffs", 
  "Bo", 
  "Griff", 
  "Gene", 
  "Shelly", 
  "Colt", 
  "Tara", 
  "Brock", 
  "Piper", 
  "Nani", 
  "Dynamike", 
  "Tick", 
  "Grom"  // Assuming "groom" was meant to be "Grom"
];

// Convert the imported data to match our Brawler interface
export const brawlers: Brawler[] = brawlersData.map((brawler) => {
  // Check if this brawler is in the wallbreak list
  const hasWallbreak = wallbreakBrawlers.includes(brawler.name);
  
  return {
    name: brawler.name,
    rarity: brawler.rarity,
    class: brawler.class,
    movement: brawler.movement,
    range: brawler.range,
    reload: brawler.reload,
    wallbreak: hasWallbreak ? "Yes" : "No",
    releaseYear: parseInt(brawler.released || '2023'),
    released: brawler.released,
    // Default image path that can be overridden for specific brawlers
    image: `/images/brawlers/${brawler.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
  };
});

// We'll keep a few brawlers with specific image paths for the challenges
const specificImagePaths = {
  "Shelly": "/shelly.png",
  "Spike": "/spike.png",
  "Colt": "/colt.png",
  "Poco": "/poco.png",
  "El Primo": "/el_primo.png"
};

// Apply specific image paths where available
brawlers.forEach(brawler => {
  if (specificImagePaths[brawler.name]) {
    brawler.image = specificImagePaths[brawler.name];
  }
});

// Get a random brawler for challenges
export const getRandomBrawler = (): Brawler => {
  const randomIndex = Math.floor(Math.random() * brawlers.length);
  return brawlers[randomIndex];
};

// Hardcoded correct answer for testing
export const correctBrawler = brawlers.find(b => b.name === "Spike") || brawlers[0];

// Helper function to get brawler details by name
export function getBrawlerByName(name: string): Brawler | undefined {
  return brawlers.find(brawler => brawler.name.toLowerCase() === name.toLowerCase());
}
