
import brawlersData from './brawlers_full.json';

// Define interfaces for gadgets and star powers
export interface Gadget {
  name: string;
  tip?: string;
}

export interface StarPower {
  name: string;
  tip?: string;
}

export interface Brawler {
  id?: number;   // Adding optional id field for use in Survival Mode
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
  gadgets?: Gadget[];
  starPowers?: StarPower[];
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
  
  // Add some sample gadgets and star powers for common brawlers
  // This ensures we have data for the game modes
  if (brawler.name === "Shelly") {
    brawler.gadgets = [
      { name: "Fast Forward", tip: "Shelly dashes forward a short distance." },
      { name: "Clay Pigeons", tip: "Shelly's next attack has a longer range but narrower spread." }
    ];
    brawler.starPowers = [
      { name: "Shell Shock", tip: "Shelly's Super slows down enemies for 3.0 seconds." },
      { name: "Band-Aid", tip: "When Shelly falls below 40% health, she instantly heals for 2000 health. Band-Aid recharges in 15.0 seconds." }
    ];
  }
  else if (brawler.name === "Colt") {
    brawler.gadgets = [
      { name: "Speedloader", tip: "Colt immediately reloads 2 ammo." },
      { name: "Silver Bullet", tip: "Colt fires a high damage bullet that destroys walls." }
    ];
    brawler.starPowers = [
      { name: "Slick Boots", tip: "Colt moves 10% faster." },
      { name: "Magnum Special", tip: "Colt's attack range and bullet speed are increased by 11%." }
    ];
  }
  else if (brawler.name === "Spike") {
    brawler.gadgets = [
      { name: "Popping Pincushion", tip: "Spike's next attack will shoot a burst of 5 spikes in all directions." },
      { name: "Life Plant", tip: "Spike plants a healing cactus that heals nearby allies for 1000 health over 5 seconds." }
    ];
    brawler.starPowers = [
      { name: "Fertilize", tip: "Spike heals 800 health per second when near his Super." },
      { name: "Curveball", tip: "Spike's spike projectiles curve slightly in flight." }
    ];
  }
  else {
    // For other brawlers, add some generic gadgets and star powers as fallback
    brawler.gadgets = [
      { name: `${brawler.name}'s First Gadget`, tip: `A special gadget for ${brawler.name}.` },
      { name: `${brawler.name}'s Second Gadget`, tip: `Another special gadget for ${brawler.name}.` }
    ];
    brawler.starPowers = [
      { name: `${brawler.name}'s First Star Power`, tip: `A special ability for ${brawler.name}.` },
      { name: `${brawler.name}'s Second Star Power`, tip: `Another special ability for ${brawler.name}.` }
    ];
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
