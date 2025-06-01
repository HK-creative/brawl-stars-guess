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
  nameHebrew: string;  // Hebrew translation of the name
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

// Hebrew translations for all brawler names
const hebrewNames: { [key: string]: string } = {
  "Shelly": "שלי",
  "Colt": "קולט",
  "Bull": "בול",
  "Brock": "ברוק",
  "Rico": "ריקו",
  "Spike": "ספייק",
  "Barley": "ברלי",
  "Jessie": "ג'סי",
  "Nita": "ניטה",
  "Dynamike": "דינ-מייק",
  "El Primo": "אל פרימו",
  "Mortis": "מורטיס",
  "Crow": "קרואו",
  "Poco": "פוקו",
  "Bo": "בו",
  "Piper": "פייפר",
  "Pam": "פאם",
  "Tara": "טארה",
  "Darryl": "דאריל",
  "Penny": "פני",
  "Frank": "פרנק",
  "Gene": "ג'ין",
  "Tick": "טיק",
  "Leon": "ליאון",
  "Rosa": "רוזה",
  "Carl": "קרל",
  "Bibi": "ביבי / באבל",
  "8-Bit": "8 ביט",
  "Sandy": "סנדי",
  "Bea": "בי",
  "Emz": "אמז",
  "Mr. P": "מר פי",
  "Max": "מקס",
  "Jacky": "ג'קי",
  "Gale": "גייל",
  "Nani": "נאני",
  "Sprout": "ספראוט",
  "Surge": "סרג'",
  "Colette": "קולט",
  "Amber": "אמבר",
  "Lou": "לו",
  "Byron": "ביירון",
  "Edgar": "אדגר",
  "Ruffs": "ראפס",
  "Stu": "סטו",
  "Belle": "בל",
  "Squeak": "סקוויק",
  "Grom": "גרום",
  "Buzz": "באז",
  "Griff": "גריף",
  "Ash": "אש",
  "Meg": "מג",
  "Lola": "לולה",
  "Fang": "פאנג",
  "Eve": "איב",
  "Janet": "ג'נט",
  "Bonnie": "בוני",
  "Otis": "אוטיס",
  "Sam": "סאם",
  "Gus": "גאס",
  "Buster": "באסטר",
  "Chester": "צ'סטר",
  "Gray": "גריי",
  "Mandy": "מנדי",
  "R-T": "אר טי",
  "Willow": "וילו",
  "Maisie": "מייזי",
  "Hank": "האנק",
  "Cordelius": "קורדליוס",
  "Doug": "דאג",
  "Pearl": "פרל",
  "Chuck": "צ'אק",
  "Charlie": "צ'רלי",
  "Mico": "מיקו",
  "Kit": "קיט",
  "Larry & Lawrie": "לארי ולורי",
  "Melodie": "מלודי",
  "Angelo": "אנג'לו",
  "Draco": "דרקו",
  "Lily": "לילי",
  "Berry": "ברי",
  "Clancy": "קלאנסי",
  "Moe": "מו",
  "Kenji": "קנג'י",
  "Shade": "צל",
  "Juju": "ג'וג'ו",
  "Meeple": "מיפל",
  "Ollie": "אולי",
  "Finx": "פינקס",
  "Lumi": "לומי",
  "Jae-Yong": "ג'יי יונג",
  "Kaze": "קייז"
};

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
    nameHebrew: hebrewNames[brawler.name] || brawler.name, // Fallback to English name if Hebrew not found
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

// Helper function to get brawler by either English or Hebrew name
export function getBrawlerByDisplayName(name: string): Brawler | undefined {
  return brawlers.find(brawler => 
    brawler.name.toLowerCase() === name.toLowerCase() ||
    brawler.nameHebrew.toLowerCase() === name.toLowerCase()
  );
}

// Helper function to get the display name based on current language
export function getBrawlerDisplayName(brawler: Brawler, language: 'en' | 'he'): string {
  return language === 'he' ? brawler.nameHebrew : brawler.name;
}

// Helper function to get localized brawler name by English name
export function getBrawlerLocalizedName(englishName: string, language: 'en' | 'he'): string {
  const brawler = getBrawlerByName(englishName);
  if (!brawler) return englishName;
  return getBrawlerDisplayName(brawler, language);
}

// Helper function to filter brawlers by search term in current language
export function filterBrawlersByName(searchTerm: string, language: 'en' | 'he'): Brawler[] {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return brawlers.filter(brawler => {
    const displayName = getBrawlerDisplayName(brawler, language);
    return displayName.toLowerCase().includes(lowerSearchTerm);
  });
}
