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
export const getTimeUntilNextChallenge = (): { hours: number; minutes: number; seconds: number } => {
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
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return { hours: diffHrs, minutes: diffMins, seconds: diffSecs };
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

// Helper to pick a seeded brawler without cross-day exclusions
const getSeededBrawler = (mode: string, date: string): Brawler => {
  const seed = `${mode}-${date}`;
  const rnd = new SeededRandom(seed);
  return brawlers[rnd.nextInt(brawlers.length)];
};

// Get deterministic daily brawler for a specific mode and date with 2-day exclusion
const getDailyBrawler = (mode: string, date: string): Brawler => {
  // Get all modes for cross-mode checking
  const allModes = ['classic', 'gadget', 'starpower', 'audio', 'pixels'];
  const selectedBrawlers: string[] = [];
  
  // Check what brawlers have already been selected for other modes today
  for (const otherMode of allModes) {
    if (otherMode !== mode) {
      const otherSeed = `${otherMode}-${date}`;
      const otherRandom = new SeededRandom(otherSeed);
      const otherBrawlerIndex = otherRandom.nextInt(brawlers.length);
      selectedBrawlers.push(brawlers[otherBrawlerIndex].name);
    }
  }
  
  // Create a unique seed for this mode and date
  const seed = `${mode}-${date}`;
  const random = new SeededRandom(seed);
  
  // Try to find a brawler that hasn't been used in other modes
  let attempts = 0;
  let selectedBrawler: Brawler;
  
  do {
    const brawlerIndex = random.nextInt(brawlers.length);
    selectedBrawler = brawlers[brawlerIndex];
    attempts++;
    
    // If we've tried too many times or no conflicts, accept this brawler
    if (attempts > 10 || !selectedBrawlers.includes(selectedBrawler.name)) {
      break;
    }
    
    // Create a new seed with attempt number to get different result
    const newSeed = `${mode}-${date}-attempt-${attempts}`;
    const newRandom = new SeededRandom(newSeed);
    const newBrawlerIndex = newRandom.nextInt(brawlers.length);
    selectedBrawler = brawlers[newBrawlerIndex];
  } while (selectedBrawlers.includes(selectedBrawler.name) && attempts < 10);
  
    return selectedBrawler;
};

// Get available audio files for a specific brawler
const getAudioFilesForBrawler = (brawlerName: string): string[] => {
  const availableAudioFiles = [
    "8bit_atk_02.ogg",
    "amber_atk_01.ogg", "amber_atk_02.ogg", "amber_atk_vo_01.ogg", "amber_atk_vo_02.ogg", "amber_atk_vo_03.ogg", "amber_atk_vo_04.ogg", "amber_atk_vo_05.ogg", "amber_atk_vo_06.ogg",
    "amber_ice_atk_vo_01.ogg", "amber_ice_atk_vo_02.ogg", "amber_ice_atk_vo_03.ogg", "amber_ice_atk_vo_04.ogg", "amber_ice_atk_vo_05.ogg", "amber_ice_atk_vo_06.ogg", "amber_ice_atk_vo_07.ogg",
    "angelo_atk_01.ogg",
    "barley_fire_atk_01.ogg",
    "bea_atk_01.ogg", "bea_atk_hit_01.ogg", "bea_atk_vo_01.ogg", "bea_atk_vo_02.ogg", "bea_atk_vo_03.ogg",
    "bea_mon_atk_vo_01.ogg", "bea_mon_atk_vo_02.ogg", "bea_mon_atk_vo_03.ogg",
    "belle_atk_01.ogg", "buster_atk_01.ogg",
    "buzzilla_atk_vo_01.ogg", "buzzilla_atk_vo_02.ogg", "buzzilla_atk_vo_03.ogg",
    "buzz_atk_01.ogg", "buzz_ulti_atk_01.ogg", "buzz_ulti_dog_atk_01.ogg",
    "carl_atk_01v2.ogg", "carl_atk_hit_return_01.ogg", "carl_atk_return_03.ogg", "carl_atk_vo_01.ogg", "carl_atk_vo_02.ogg", "carl_atk_vo_03.ogg",
    "chester_atk_01.ogg", "chester_atk_hit_01.ogg",
    "chuck_atk_01.ogg", "cordelius_atk_01.ogg",
    "ddracos_atk_vo_01.ogg", "ddracos_atk_vo_02.ogg", "ddracos_atk_vo_03.ogg", "ddracos_atk_vo_04.ogg", "ddracos_atk_vo_05.ogg", "ddracos_atk_vo_06.ogg", "ddracos_atk_vo_07.ogg", "ddracos_atk_vo_08.ogg",
    "doug_atk_sfx_01.ogg",
    "draco_atk_gui_01.ogg", "draco_atk_gui_02.ogg", "draco_atk_gui_03.ogg", "draco_atk_gui_04.ogg", "draco_atk_gui_05.ogg", "draco_atk_gui_06.ogg", "draco_atk_gui_07.ogg", "draco_atk_gui_08.ogg", "draco_atk_gui_09.ogg", "draco_atk_gui_10.ogg", "draco_atk_gui_11.ogg", "draco_atk_gui_12.ogg", "draco_atk_gui_13.ogg", "draco_atk_gui_14.ogg", "draco_atk_gui_15.ogg",
    "draco_atk_sfx_01.ogg", "draco_atk_vo_01.ogg", "draco_atk_vo_02.ogg", "draco_atk_vo_03.ogg", "draco_atk_vo_04.ogg", "draco_atk_vo_05.ogg", "draco_atk_vo_06.ogg", "draco_atk_vo_07.ogg", "draco_atk_vo_08.ogg", "draco_ulti_atk_sfx_01.ogg",
    "elprimo_atk_01.ogg", "elprimo_atk_02.ogg", "elprimo_atk_03.ogg", "elprimo_atk_04.ogg", "elprimo_atk_05.ogg",
    "emz_atk_01.ogg", "emz_atk_vo_01.ogg", "emz_atk_vo_02.ogg", "emz_atk_vo_03.ogg", "emz_atk_vo_04.ogg", "emz_atk_vo_05.ogg",
    "eve_atk_01.ogg",
    "evil_mortis_atk_vo_01.ogg", "evil_mortis_atk_vo_02.ogg", "evil_mortis_atk_vo_03.ogg", "evil_mortis_atk_vo_04.ogg",
    "fang_atk_01.ogg", "fang_atk_hit_01.ogg", "fang_atk_vo_01.ogg", "fang_atk_vo_02.ogg", "fang_atk_vo_03.ogg", "fang_atk_vo_04.ogg", "fang_ulti_atk_01.ogg",
    "gale_atk_01.ogg",
    "gene_atk_02.ogg", "gene_atk_dry_01.ogg", "gene_atk_hit_01.ogg", "gene_atk_hit_02.ogg", "gene_atk_reload_01.ogg", "gene_atk_split_01.ogg", "gene_atk_ulti_01.ogg",
    "gray_atk_01.ogg", "gray_atk_02.ogg", "gray_atk_03.ogg", "gray_atk_04.ogg", "gray_atk_05.ogg", "gray_atk_06.ogg",
    "griff_atk_01.ogg",
    "grom_atk_sfx_01.ogg", "grom_atk_sfx_02.ogg", "grom_atk_sfx_03.ogg", "grom_atk_sfx_04.ogg", "grom_ulti_atk_01.ogg",
    "gus_atk_01.ogg", "gus_atk_02.ogg", "gus_atk_hit_01.ogg", "gus_atk_reachend_01.ogg", "gus_atk_vo_01.ogg", "gus_atk_vo_02.ogg", "gus_atk_vo_03.ogg", "gus_atk_vo_04.ogg",
    "jacky_atk_01.ogg", "jacky_atk_02.ogg", "jacky_atk_ulti_01.ogg", "jacky_atk_ulti_02.ogg", "jacky_atk_ulti_03.ogg", "jacky_summer_atk_01.ogg",
    "jae_atk_1_01.ogg", "jae_atk_2_01.ogg",
    "janet_atk_sfx_01.ogg",
    "juju_earth_atk_01.ogg", "juju_earth_atk_hit_01.ogg", "juju_forest_atk_01.ogg", "juju_forest_atk_hit_01.ogg", "juju_water_atk_01.ogg", "juju_water_atk_hit_01.ogg",
    "kaze_atk_sfx_01.ogg", "kaze_atk_sfx_02.ogg",
    "kenji_atk_sfx_01.ogg", "kenji_atk_sfx_02.ogg", "kenji_atk_vo_01.ogg", "kenji_atk_vo_02.ogg", "kenji_atk_vo_03.ogg", "kenji_atk_vo_04.ogg", "kenji_atk_vo_05.ogg", "kenji_atk_vo_06.ogg", "kenji_atk_vo_07.ogg", "kenji_atk_vo_08.ogg", "kenji_atk_vo_09.ogg",
    "kit_atk_01.ogg", "kit_atk_vo_01.ogg", "kit_atk_vo_02.ogg", "kit_atk_vo_03.ogg", "kit_atk_vo_04.ogg", "kit_ulti_atk_01.ogg",
    "lawrie_win_atk_01.ogg",
    "lily_atk_01.ogg", "lily_ulti_atk_01.ogg",
    "lola_atk_01.ogg",
    "lou_atk_01.ogg", "lou_atk_vo_01.ogg", "lou_atk_vo_02.ogg", "lou_atk_vo_03.ogg", "lou_atk_vo_04.ogg", "lou_atk_vo_05.ogg", "lou_atk_vo_06.ogg", "lou_atk_vo_07.ogg", "lou_atk_vo_08.ogg",
    "maisie_atk_01.ogg", "mandy_atk_01.ogg",
    "max_atk_01.ogg", "max_atk_impact_01.ogg",
    "mecha_mortis_atk_vo_01.ogg", "mecha_mortis_atk_vo_02.ogg", "mecha_mortis_atk_vo_03.ogg", "mecha_mortis_atk_vo_04.ogg",
    "mech_crow_atk_01.ogg", "mech_spike_atk_01.ogg",
    "meeple_atk_01.ogg", "melodie_atk_sfx_01.ogg",
    "mico_atk_01.ogg", "mico_ulti_atk_01.ogg",
    "moe_atk_vo_01.ogg", "moe_atk_vo_02.ogg", "moe_atk_vo_03.ogg", "moe_atk_vo_04.ogg", "moe_atk_vo_05.ogg", "moe_atk_vo_06.ogg",
    "moe_drill_atk_sfx_01.ogg", "moe_drill_atk_vo_01.ogg", "moe_drill_atk_vo_02.ogg", "moe_drill_atk_vo_03.ogg", "moe_drill_atk_vo_04.ogg", "moe_drill_atk_vo_05.ogg", "moe_drill_atk_vo_06.ogg", "moe_rockthrow_atk_01.ogg",
    "mortis_atk_01.ogg", "mortis_atk_vo_01.ogg", "mortis_atk_vo_02.ogg", "mortis_atk_vo_03.ogg", "mortis_atk_vo_04.ogg",
    "mrp_atk_01.ogg", "mrp_atk_vo_01.ogg", "mrp_atk_vo_02.ogg", "mrp_atk_vo_03.ogg", "mrp_atk_vo_04.ogg", "mrp_minip_atk_01.ogg", "mrp_minip_atk_02.ogg",
    "nani_atk_01.ogg",
    "nita_atk_01.ogg", "nita_atk_02.ogg", "nita_atk_03.ogg", "nita_atk_04.ogg", "nita_atk_05.ogg", "nita_earth_atk_01.ogg",
    "otis_atk_01.ogg", "otis_atk_hit_01.ogg",
    "pearl_atk_01.ogg", "pearl_atk_vo_01.ogg", "pearl_atk_vo_02.ogg", "pearl_atk_vo_03.ogg", "pearl_atk_vo_04.ogg", "pearl_atk_vo_05.ogg", "pearl_atk_vo_06.ogg", "pearl_atk_vo_07.ogg", "pearl_atk_vo_08.ogg", "pearl_atk_vo_09.ogg", "pearl_atk_vo_10.ogg",
    "poco_new_atk_01.ogg", "rocket_rose_atk_02.ogg",
    "rt_atk_01.ogg", "ruffs_atk_01.ogg", "ruffs_atk_dryfire_01.ogg", "ruff_atk_01.ogg",
    "sam_atk_vo_01.ogg", "sam_atk_vo_02.ogg", "sam_atk_vo_03.ogg", "sam_atk_vo_04.ogg", "sam_atk_vo_05.ogg", "sam_atk_vo_06.ogg", "sam_atk_vo_07.ogg",
    "sandy_atk_01.ogg",
    "shade_atk_02.ogg", "shade_atk_hit_01.ogg", "shade_atk_vo_01.ogg", "shade_atk_vo_02.ogg", "shade_atk_vo_03.ogg",
    "spike_atk_01.ogg", "sprout_atk_01.ogg", "sprout_atk_explo_01.ogg", "sprout_atk_ulti_01.ogg", "squeak_atk_01.ogg", "stu_atk_01.ogg",
    "surge_atk_01.ogg", "surge_atk_vo_01.ogg", "surge_atk_vo_02.ogg", "surge_atk_vo_03.ogg", "surge_atk_vo_04.ogg", "surge_atk_vo_05.ogg",
    "tara_atk_01.ogg", "tick_atk_01.ogg", "tick_atk_split_02.ogg",
    "water_brock_atk_01.ogg", "water_jessie_atk_01.ogg", "water_nita_atk_01.ogg",
    "willow_atk_01.ogg", "willow_atk_hit_01.ogg"
  ];

  // Create mapping of brawler names to their possible prefixes in audio files
  const brawlerAudioMapping: { [key: string]: string[] } = {
    // New brawlers with multiple sounds
    'Kaze': ['kaze_'],
    'Jae': ['jae_'], 
    'Jae-Yong': ['jae_'],
    'Meeple': ['meeple_'],
    'Shade': ['shade_'],
    'Juju': ['juju_water_', 'juju_forest_', 'juju_earth_'],
    'Kenji': ['kenji_'],
    'Moe': ['moe_drill_', 'moe_rockthrow_', 'moe_atk_'],
    'Draco': ['ddracos_', 'draco_'],
    'Amber': ['amber_ice_', 'amber_'],
    'Lily': ['lily_'],
    'Melodie': ['melodie_'],
    'Angelo': ['angelo_'],
    'Kit': ['kit_'],
    'Larry & Lawrie': ['lawrie_'],
    'Mico': ['mico_'],
    'Chuck': ['chuck_'],
    
    // Classic brawlers with multiple sounds
    '8-Bit': ['8bit_'],
    'Bea': ['bea_atk_', 'bea_mon_'],
    'Buzz': ['buzz_atk_', 'buzz_ulti_', 'buzzilla_'],
    'Carl': ['carl_'],
    'Chester': ['chester_'],
    'El Primo': ['elprimo_'],
    'Emz': ['emz_'],
    'Fang': ['fang_'],
    'Gene': ['gene_'],
    'Gray': ['gray_'],
    'Grom': ['grom_'],
    'Gus': ['gus_'],
    'Jacky': ['jacky_'],
    'Lou': ['lou_'],
    'Max': ['max_'],
    'Mortis': ['mortis_', 'evil_mortis_', 'mecha_mortis_'],
    'Mr. P': ['mrp_'],
    'Nita': ['nita_'],
    'Otis': ['otis_'],
    'Pearl': ['pearl_'],
    'Sam': ['sam_'],
    'Surge': ['surge_'],
    'Willow': ['willow_'],
    
    // Skin variants
    'Crow': ['mech_crow_'],
    'Spike': ['spike_', 'mech_spike_'],
    'Barley': ['barley_fire_'],
    'Jessie': ['water_jessie_'],
    'Brock': ['water_brock_'],
    'Rosa': ['rocket_rose_'],
    // Add some fallback mappings for brawlers without their own audio files
    'Shelly': ['kit_'], // Use Kit's audio as fallback
    'Colt': ['draco_atk_vo_'],
    'Bull': ['moe_atk_'],
    'Dynamike': ['kenji_'],
    'Bo': ['shade_'],
    'Tick': ['meeple_'],
    'Primo': ['moe_drill_'],
    'Poco': ['lily_'],
    'Rico': ['chuck_'],
    'Darryl': ['draco_'],
    'Penny': ['kit_'],
    'Edgar': ['kenji_'],
    'Colette': ['melodie_'],
    'Leon': ['shade_'],
    'Tara': ['lily_'],
    'Sprout': ['juju_'],
    'Byron': ['kenji_'],
    'Squeak': ['melodie_'],
    'Ruffs': ['moe_'],
    'Belle': ['shade_'],
    'Griff': ['draco_'],
    'Ash': ['moe_drill_'],
    'Lola': ['lily_'],
    'Meg': ['melodie_'],
    'Eve': ['juju_'],
    'Janet': ['kit_'],
    'Bonnie': ['shade_'],
    'Buster': ['draco_'],
    'Mandy': ['amber_ice_'],
    'R-T': ['melodie_'],
    'Maisie': ['kit_'],
    'Hank': ['moe_'],
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

// Get a hint audio file for a brawler (different from the main audio file)
const getDailyHintAudioFile = (brawler: Brawler, date: string, mainAudioFile: string): string | null => {
  const audioFiles = getAudioFilesForBrawler(brawler.name);
  
  // If there's only one audio file or no files, no hint available
  if (audioFiles.length <= 1) {
    return null;
  }

  // Filter out the main audio file to get different options for hint
  const hintOptions = audioFiles.filter(file => file !== mainAudioFile);
  
  if (hintOptions.length === 0) {
    return null;
  }

  // Use seeded random to pick the same hint audio file each day for this brawler
  const seed = `hint-audio-${brawler.name}-${date}`;
  const random = new SeededRandom(seed);
  const fileIndex = random.nextInt(hintOptions.length);
  
  return hintOptions[fileIndex];
};

// Check if a brawler has multiple audio files (can provide hints)
const canProvideHint = (brawlerName: string): boolean => {
  const audioFiles = getAudioFilesForBrawler(brawlerName);
  return audioFiles.length > 1;
};

// Get the actual brawler that owns the audio file
const getBrawlerFromAudioFile = (audioFile: string): string => {
  // Extract the prefix from the audio file name
  const prefix = audioFile.split('_')[0].toLowerCase();
  
  // Mapping of audio file prefixes to their actual brawler owners
  const prefixToBrawlerMap: { [key: string]: string } = {
    'kaze': 'Kaze',
    'jae': 'Jae-Yong',
    'meeple': 'Meeple',
    'shade': 'Shade',
    'juju': 'Juju',
    'kenji': 'Kenji',
    'moe': 'Moe',
    'ddracos': 'Draco',
    'draco': 'Draco',
    'amber': 'Amber',
    'lily': 'Lily',
    'melodie': 'Melodie',
    'angelo': 'Angelo',
    'kit': 'Kit',
    'lawrie': 'Larry & Lawrie',
    'mico': 'Mico',
    'chuck': 'Chuck',
    'elprimo': 'El Primo',
    'pearl': 'Pearl',
    'berry': 'Berry',
    'clancy': 'Clancy',
    'hank': 'Hank',
    'mandy': 'Mandy',
    'chester': 'Chester',
    'gray': 'Gray',
    'willow': 'Willow',
    'doug': 'Doug',
    'bonnie': 'Bonnie',
    'grom': 'Grom',
    'fang': 'Fang',
    'eve': 'Eve',
    'janet': 'Janet',
    'otis': 'Otis',
    'sam': 'Sam',
    'buster': 'Buster',
    'chester2': 'Chester',
    'gus': 'Gus'
  };
  
  return prefixToBrawlerMap[prefix] || 'Kit'; // Default to Kit if prefix not found
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
      // Handle special cases for image naming
      let gadgetImageName = brawler.name.toLowerCase().replace(/ /g, '_');
      if (brawler.name === 'Larry & Lawrie') {
        gadgetImageName = 'larry_lawrie_';
      }
      return {
        brawler: brawler.name,
        gadgetName: gadget?.name || "Mystery Gadget",
        tip: gadget?.tip || "This gadget has mysterious powers.",
        image: `/GadgetImages/${gadgetImageName}_gadget_01.png`
      };
      
    case 'starpower':
      // Get the first star power for the brawler
      const starPower = brawler.starPowers?.[0];
      // Handle special cases for image naming
      let imageName = brawler.name.toLowerCase().replace(/ /g, '_');
      // Special case for Larry & Lawrie (double underscore in file name)
      if (brawler.name === 'Larry & Lawrie') {
        imageName = 'larry_lawrie_';
      }
      return {
        brawler: brawler.name,
        starPowerName: starPower?.name || "Mystery Star Power",
        tip: starPower?.tip || "This star power grants mysterious abilities.",
        image: `/${imageName}_starpower_01.png`
      };
      
    case 'voice':
      // Use a generic voice line for the brawler
      return {
        brawler: brawler.name,
        voiceLine: `${brawler.name} is ready for battle!`
      };
      
    case 'audio':
      const audioFile = getDailyAudioFile(brawler, date);
      const actualAudioOwner = getBrawlerFromAudioFile(audioFile);
      const hintAudioFile = getDailyHintAudioFile(brawler, date, audioFile);
      const hasHint = canProvideHint(actualAudioOwner);
      console.log(`Audio challenge: selected brawler ${brawler.name}, audio file ${audioFile}, actual owner ${actualAudioOwner}, hint available: ${hasHint}`);
      return {
        brawler: actualAudioOwner, // Use the actual owner of the audio file
        audioFile: `/AttackSounds/${audioFile}`,
        hintAudioFile: hintAudioFile ? `/AttackSounds/${hintAudioFile}` : null,
        hasHint: hasHint
      };

    case 'pixels':
      return {
        brawler: brawler.name,
        tip: "Identify the brawler from this pixelated portrait!"
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

// Export hint-related functions for use in components
export { getDailyHintAudioFile, canProvideHint, getAudioFilesForBrawler };

// Test function to see today's brawlers for all modes (for debugging)
export const getTodaysBrawlers = (): { [mode: string]: string } => {
  const currentDate = getCurrentDateUTC2();
  return {
    classic: getDailyBrawler('classic', currentDate).name,
    gadget: getDailyBrawler('gadget', currentDate).name,
    starpower: getDailyBrawler('starpower', currentDate).name,
    audio: getDailyBrawler('audio', currentDate).name,
    pixels: getDailyBrawler('pixels', currentDate).name,
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
    pixels: getDailyBrawler('pixels', tomorrowDate).name,
  };
};
