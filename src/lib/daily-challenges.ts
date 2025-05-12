
import { supabase } from "@/integrations/supabase/client";

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
      console.log('Falling back to local fallback data');
      return getFallbackChallengeData(mode);
    }
    
    // Check if we got any data
    if (data && data.length > 0) {
      console.log(`Successfully retrieved ${mode} challenge:`, data[0]);
      // Cache the result
      challengeCache[cacheKey] = data[0];
      return data[0].challenge_data;
    }
    
    console.log(`No data found for ${mode} challenge, using fallback`);
    return getFallbackChallengeData(mode);
  } catch (error) {
    console.error('Exception in fetchDailyChallenge:', error);
    return getFallbackChallengeData(mode);
  }
};

// Provide appropriate fallback data based on the mode
const getFallbackChallengeData = (mode: string): any => {
  console.log(`Using fallback data for ${mode} mode`);
  
  switch (mode) {
    case 'classic':
      return "Spike"; // Fallback brawler name
      
    case 'gadget':
      return {
        brawler: "Spike",
        gadgetName: "Popping Pincushion",
        tip: "This gadget creates a ring of spikes around Spike that damage enemies."
      };
      
    case 'starpower':
      return {
        brawler: "Bo",
        starPowerName: "Circling Eagle",
        tip: "This star power increases Bo's vision range in bushes."
      };
      
    case 'voice':
      return {
        brawler: "Shelly",
        voiceLine: "Let's go get 'em!"
      };
      
    case 'audio':
      return {
        brawler: "Spike",
        audioFile: "/audio/spike_super.mp3"
      };
      
    default:
      return null;
  }
};
