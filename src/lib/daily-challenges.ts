import { supabase } from "@/integrations/supabase/client";
import { brawlers, Brawler } from "@/data/brawlers";

// Interface for daily challenge data structure
export interface DailyChallenge {
  id: string;
  mode: string;
  challenge_data: any;
  date: string;
}

// Cache for daily challenges to prevent multiple requests
const challengeCache: Record<string, DailyChallenge> = {};

// Helper to get current date in UTC+2 (CEST) timezone
export const getCurrentDateUTC2 = (): string => {
  const now = new Date();
  const utc2Date = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // UTC+2
  return utc2Date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Get time remaining until next challenge (midnight UTC+2)
export const getTimeUntilNextChallenge = (): { hours: number; minutes: number } => {
  const now = new Date();
  const utc2Now = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // Current time in UTC+2
  
  // Set target to next midnight UTC+2
  const tomorrow = new Date(utc2Now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds
  const diffMs = tomorrow.getTime() - utc2Now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours: diffHrs, minutes: diffMins };
};

// Helper to get yesterday's date in UTC+2 (CEST) timezone
export const getYesterdayDateUTC2 = (): string => {
  const now = new Date();
  const utc2Date = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // UTC+2
  utc2Date.setDate(utc2Date.getDate() - 1); // Go back 1 day
  return utc2Date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Seeded random number generator for deterministic "random" selection
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// Get deterministic daily brawler for a specific mode and date
const getDailyBrawler = (mode: string, date: string): Brawler => {
  // Create a unique seed for this mode and date
  const seed = `${mode}-${date}`;
  const random = new SeededRandom(seed);
  
  // Select a random brawler using the seeded random
  const brawlerIndex = random.nextInt(brawlers.length);
  return brawlers[brawlerIndex];
};

// Get available audio files for a specific brawler
const getAudioFilesForBrawler = (brawlerName: string): string[] => {
  const availableAudioFiles = [
    'kaze_atk_sfx_01.ogg', 'kaze_atk_sfx_02.ogg',
    'jae_atk_2_01.ogg', 'jae_atk_1_01.ogg',
    'meeple_atk_01.ogg',
    'shade_atk_vo_03.ogg', 'shade_atk_vo_01.ogg', 'shade_atk_vo_02.ogg', 'shade_atk_02.ogg',
    'juju_water_atk_01.ogg', 'juju_forest_atk_01.ogg', 'juju_earth_atk_01.ogg',
    'kenji_atk_vo_09.ogg', 'kenji_atk_vo_07.ogg', 'kenji_atk_vo_08.ogg', 'kenji_atk_vo_06.ogg',
    'kenji_atk_vo_04.ogg', 'kenji_atk_vo_05.ogg', 'kenji_atk_vo_02.ogg', 'kenji_atk_vo_03.ogg',
    'kenji_atk_vo_01.ogg', 'kenji_atk_sfx_01.ogg', 'kenji_atk_sfx_02.ogg',
    'moe_drill_atk_vo_06.ogg', 'moe_rockthrow_atk_01.ogg', 'moe_drill_atk_vo_05.ogg',
    'moe_drill_atk_vo_03.ogg', 'moe_drill_atk_vo_04.ogg', 'moe_drill_atk_vo_01.ogg',
    'moe_drill_atk_vo_02.ogg', 'moe_drill_atk_sfx_01.ogg', 'moe_atk_vo_05.ogg',
    'moe_atk_vo_06.ogg', 'moe_atk_vo_03.ogg', 'moe_atk_vo_04.ogg', 'moe_atk_vo_02.ogg', 'moe_atk_vo_01.ogg',
    'ddracos_atk_vo_07.ogg', 'ddracos_atk_vo_08.ogg', 'ddracos_atk_vo_06.ogg', 'ddracos_atk_vo_04.ogg',
    'ddracos_atk_vo_05.ogg', 'ddracos_atk_vo_03.ogg', 'ddracos_atk_vo_01.ogg', 'ddracos_atk_vo_02.ogg',
    'amber_ice_atk_vo_02.ogg', 'amber_ice_atk_vo_03.ogg', 'amber_ice_atk_vo_01.ogg',
    'amber_ice_atk_vo_06.ogg', 'amber_ice_atk_vo_05.ogg', 'amber_ice_atk_vo_04.ogg', 'amber_ice_atk_vo_07.ogg',
    'lily_atk_01.ogg', 'lily_ulti_atk_01.ogg',
    'draco_atk_vo_08.ogg', 'draco_atk_gui_08.ogg', 'draco_atk_gui_09.ogg', 'draco_atk_gui_14.ogg',
    'draco_atk_gui_15.ogg', 'draco_atk_gui_02.ogg', 'draco_atk_gui_03.ogg', 'draco_atk_gui_01.ogg',
    'draco_atk_gui_12.ogg', 'draco_atk_gui_13.ogg', 'draco_atk_gui_11.ogg', 'draco_atk_gui_06.ogg',
    'draco_atk_gui_07.ogg', 'draco_atk_gui_05.ogg', 'draco_atk_vo_03.ogg', 'draco_atk_gui_10.ogg',
    'draco_atk_gui_04.ogg', 'draco_ulti_atk_sfx_01.ogg', 'draco_atk_vo_06.ogg', 'draco_atk_vo_07.ogg',
    'draco_atk_vo_05.ogg', 'draco_atk_vo_02.ogg', 'draco_atk_vo_04.ogg', 'draco_atk_vo_01.ogg', 'draco_atk_sfx_01.ogg',
    'melodie_atk_sfx_01.ogg', 'angelo_atk_01.ogg',
    'kit_ulti_atk_01.ogg', 'kit_atk_vo_03.ogg', 'kit_atk_vo_04.ogg', 'kit_atk_vo_02.ogg', 'kit_atk_vo_01.ogg', 'kit_atk_01.ogg',
    'lawrie_win_atk_01.ogg', 'mico_ulti_atk_01.ogg', 'chuck_atk_01.ogg', 'mico_atk_01.ogg'
  ];

  // Create mapping of brawler names to their possible prefixes in audio files
  const brawlerAudioMapping: { [key: string]: string[] } = {
    'Kaze': ['kaze_'],
    'Jae': ['jae_'], 
    'Jae-Yong': ['jae_'],
    'Meeple': ['meeple_'],
    'Shade': ['shade_'],
    'Juju': ['juju_water_', 'juju_forest_', 'juju_earth_'],
    'Kenji': ['kenji_'],
    'Moe': ['moe_drill_', 'moe_rockthrow_', 'moe_atk_'],
    'Draco': ['ddracos_', 'draco_'],
    'Amber': ['amber_ice_'],
    'Lily': ['lily_'],
    'Melodie': ['melodie_'],
    'Angelo': ['angelo_'],
    'Kit': ['kit_'],
    'Larry & Lawrie': ['lawrie_'],
    'Mico': ['mico_'],
    'Chuck': ['chuck_'],
    // Add some fallback mappings for popular brawlers
    'Shelly': ['kit_'], // Use Kit's audio as fallback
    'Colt': ['draco_atk_vo_'],
    'Bull': ['moe_atk_'],
    'Jessie': ['melodie_'],
    'Brock': ['angelo_'],
    'Dynamike': ['kenji_'],
    'Bo': ['shade_'],
    'Tick': ['meeple_'],
    'Primo': ['moe_drill_'],
    'El Primo': ['moe_drill_'],
    'Poco': ['lily_'],
    'Rosa': ['juju_'],
    'Rico': ['chuck_'],
    'Darryl': ['draco_'],
    'Penny': ['kit_'],
    'Carl': ['moe_'],
    'Jacky': ['shade_'],
    'Gus': ['angelo_'],
    'Edgar': ['kenji_'],
    'Colette': ['melodie_'],
    'Leon': ['shade_'],
    'Crow': ['kaze_'],
    'Spike': ['meeple_'],
    'Mortis': ['draco_'],
    'Tara': ['lily_'],
    'Gene': ['jae_'],
    'Max': ['kit_'],
    'Mr. P': ['angelo_'],
    'Sprout': ['juju_'],
    'Byron': ['kenji_'],
    'Squeak': ['melodie_'],
    'Lou': ['amber_ice_'],
    'Ruffs': ['moe_'],
    'Belle': ['shade_'],
    'Buzz': ['chuck_'],
    'Griff': ['draco_'],
    'Ash': ['moe_drill_'],
    'Lola': ['lily_'],
    'Meg': ['melodie_'],
    'Grom': ['angelo_'],
    'Fang': ['kenji_'],
    'Eve': ['juju_'],
    'Janet': ['kit_'],
    'Bonnie': ['shade_'],
    'Otis': ['meeple_'],
    'Sam': ['moe_'],
    'Buster': ['draco_'],
    'Chester': ['chuck_'],
    'Mandy': ['amber_ice_'],
    'R-T': ['melodie_'],
    'Willow': ['lily_'],
    'Maisie': ['kit_'],
    'Hank': ['moe_'],
    'Pearl': ['juju_'],
    'Larry': ['lawrie_'],
    'Lawrie': ['lawrie_']
  };

  // Find audio files for this brawler
  const prefixes = brawlerAudioMapping[brawlerName] || [];
  const matchingFiles = availableAudioFiles.filter(file => 
    prefixes.some(prefix => file.toLowerCase().startsWith(prefix.toLowerCase()))
  );

  return matchingFiles;
};

// Get a random audio file for a brawler using seeded random
const getDailyAudioFile = (brawler: Brawler, date: string): string => {
  const audioFiles = getAudioFilesForBrawler(brawler.name);
  
  if (audioFiles.length === 0) {
    // Fallback to a generic audio file if no specific ones found
    return 'kit_atk_vo_01.ogg';
  }

  // Use seeded random to pick the same audio file each day for this brawler
  const seed = `audio-${brawler.name}-${date}`;
  const random = new SeededRandom(seed);
  const fileIndex = random.nextInt(audioFiles.length);
  
  return audioFiles[fileIndex];
};

// Check if Supabase connection is working
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('daily_challenges').select('id').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful:', data);
    return true;
  } catch (err) {
    console.error('Exception checking Supabase connection:', err);
    return false;
  }
};

// Fetch today's challenge for a specific mode
export const fetchDailyChallenge = async (mode: string): Promise<any> => {
  console.log(`Fetching daily challenge for mode: ${mode}`);
  
  // Check if we already have this challenge in cache
  const currentDate = getCurrentDateUTC2();
  const cacheKey = `${mode}-${currentDate}`;
  
  if (challengeCache[cacheKey]) {
    console.log(`Using cached challenge for ${mode}`);
    return challengeCache[cacheKey].challenge_data;
  }
  
  try {
    console.log(`Querying database for ${mode} challenge on ${currentDate}`);
    
    // Important: We're removing the .single() to avoid 406 errors when no rows are returned
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('id, mode, challenge_data, date')
      .eq('mode', mode)
      .eq('date', currentDate);
      
    if (error) {
      console.error('Error fetching daily challenge:', error);
      console.log('Falling back to deterministic daily challenge');
      return getDeterministicDailyChallenge(mode, currentDate);
    }
    
    // Check if we got any data
    if (data && data.length > 0) {
      console.log(`Successfully retrieved ${mode} challenge:`, data[0]);
      // Cache the result
      challengeCache[cacheKey] = data[0];
      return data[0].challenge_data;
    }
    
    console.log(`No data found for ${mode} challenge, using deterministic fallback`);
    return getDeterministicDailyChallenge(mode, currentDate);
  } catch (error) {
    console.error('Exception in fetchDailyChallenge:', error);
    return getDeterministicDailyChallenge(mode, currentDate);
  }
};

// Generate deterministic daily challenge based on date and mode
const getDeterministicDailyChallenge = (mode: string, date: string): any => {
  console.log(`Generating deterministic daily challenge for ${mode} on ${date}`);
  
  const brawler = getDailyBrawler(mode, date);
  console.log(`Selected brawler for ${mode}: ${brawler.name}`);
  
  switch (mode) {
    case 'classic':
      return brawler.name;
      
    case 'endless':
      return brawler.name;
      
    case 'gadget':
      // Get the first gadget for the brawler (most brawlers have at least one)
      const gadget = brawler.gadgets?.[0];
      return {
        brawler: brawler.name,
        gadgetName: gadget?.name || "Mystery Gadget",
        tip: gadget?.tip || "This gadget has mysterious powers."
      };
      
    case 'starpower':
      // Get the first star power for the brawler
      const starPower = brawler.starPowers?.[0];
      return {
        brawler: brawler.name,
        starPowerName: starPower?.name || "Mystery Star Power",
        tip: starPower?.tip || "This star power grants mysterious abilities.",
        image: `${brawler.name.toLowerCase().replace(/ /g, '_')}_starpower_01.png`
      };
      
    case 'voice':
      // Use a generic voice line for the brawler
      return {
        brawler: brawler.name,
        voiceLine: `${brawler.name} is ready for battle!`
      };
      
    case 'audio':
      const audioFile = getDailyAudioFile(brawler, date);
      return {
        brawler: brawler.name,
        audioFile: `/AttackSounds/${audioFile}`
      };
      
    default:
      return null;
  }
};

// Fallback data for yesterday's challenge
const getYesterdayFallbackData = (mode: string): any => {
  const yesterdayDate = getYesterdayDateUTC2();
  return getDeterministicDailyChallenge(mode, yesterdayDate);
};

// Fetch yesterday's challenge for a specific mode
export const fetchYesterdayChallenge = async (mode: string): Promise<any> => {
  console.log(`Fetching yesterday's challenge for mode: ${mode}`);
  
  // Calculate yesterday's date
  const yesterdayDate = getYesterdayDateUTC2();
  const cacheKey = `${mode}-${yesterdayDate}-day-offset-1`;
  
  if (challengeCache[cacheKey]) {
    console.log(`Using cached yesterday's challenge for ${mode}`);
    return challengeCache[cacheKey].challenge_data;
  }
  
  try {
    console.log(`Querying database for ${mode} challenge on ${yesterdayDate}`);
    
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('id, mode, challenge_data, date')
      .eq('mode', mode)
      .eq('date', yesterdayDate);
      
    if (error) {
      console.error('Error fetching yesterday\'s daily challenge:', error);
      return getYesterdayFallbackData(mode);
    }
    
    // Check if we got any data
    if (data && data.length > 0) {
      console.log(`Successfully retrieved yesterday's ${mode} challenge:`, data[0]);
      // Cache the result
      challengeCache[cacheKey] = data[0];
      return data[0].challenge_data;
    }
    
    console.log(`No data found for yesterday's ${mode} challenge, using deterministic fallback`);
    return getYesterdayFallbackData(mode);
  } catch (error) {
    console.error('Exception in fetchYesterdayChallenge:', error);
    return getYesterdayFallbackData(mode);
  }
};

// Get a random brawler for endless mode
export const getRandomBrawler = (): Brawler => {
  const randomIndex = Math.floor(Math.random() * brawlers.length);
  return brawlers[randomIndex];
};

// Test function to see today's brawlers for all modes (for debugging)
export const getTodaysBrawlers = (): { [mode: string]: string } => {
  const currentDate = getCurrentDateUTC2();
  return {
    classic: getDailyBrawler('classic', currentDate).name,
    gadget: getDailyBrawler('gadget', currentDate).name,
    starpower: getDailyBrawler('starpower', currentDate).name,
    audio: getDailyBrawler('audio', currentDate).name,
  };
};

// Test function to preview tomorrow's brawlers (for debugging)
export const getTomorrowsBrawlers = (): { [mode: string]: string } => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  
  return {
    classic: getDailyBrawler('classic', tomorrowDate).name,
    gadget: getDailyBrawler('gadget', tomorrowDate).name,
    starpower: getDailyBrawler('starpower', tomorrowDate).name,
    audio: getDailyBrawler('audio', tomorrowDate).name,
  };
};
