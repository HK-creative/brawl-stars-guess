
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

// Fetch today's challenge for a specific mode
export const fetchDailyChallenge = async (mode: string): Promise<any> => {
  // Check if we already have this challenge in cache
  const cacheKey = `${mode}-${getCurrentDateUTC2()}`;
  if (challengeCache[cacheKey]) {
    return challengeCache[cacheKey].challenge_data;
  }
  
  try {
    const currentDate = getCurrentDateUTC2();
    
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('id, mode, challenge_data, date')
      .eq('mode', mode)
      .eq('date', currentDate)
      .single();
      
    if (error) {
      console.error('Error fetching daily challenge:', error);
      // Fallback to local data (will be implemented in each component)
      return null;
    }
    
    if (data) {
      // Cache the result
      challengeCache[cacheKey] = data;
      return data.challenge_data;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchDailyChallenge:', error);
    return null;
  }
};
