
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

interface Brawler {
  name: string;
  // Add any other properties that might be used in the selection process
}

// Type definition for your database tables
type Database = {
  public: {
    Tables: {
      daily_challenges: {
        Row: {
          id: string;
          challenge_data: any;
          date: string;
          created_at: string | null;
          mode: string;
        };
        Insert: {
          id?: string;
          challenge_data: any;
          date: string;
          created_at?: string | null;
          mode: string;
        };
      };
    };
  };
};

// Simple function to get a random item from an array
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Hard-coded list of brawlers, simplified version of brawlers_full.json
const brawlers: Brawler[] = [
  { name: "Shelly" },
  { name: "Colt" },
  { name: "Bull" },
  { name: "Brock" },
  { name: "Rico" },
  { name: "Spike" },
  { name: "Barley" },
  { name: "Jessie" },
  { name: "Nita" },
  { name: "Bo" },
  { name: "El Primo" },
  { name: "Poco" },
  { name: "Mortis" },
  { name: "Crow" },
  { name: "Tara" },
  { name: "Penny" },
  { name: "Frank" },
  { name: "Leon" },
  { name: "Rosa" },
  { name: "Pam" }
  // Add more brawlers as needed
];

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient<Database>(
      // Supabase API URL - env var exported by default when deployed
      Deno.env.get("SUPABASE_URL") || "",
      // Supabase API SERVICE ROLE KEY - env var exported by default when deployed
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get today's date in UTC+2 (as per the app's timezone)
    const now = new Date();
    const utc2Date = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    const todayDate = utc2Date.toISOString().split("T")[0];

    console.log(`Generating challenges for date: ${todayDate}`);

    // Check if we already have challenges for today
    const { data: existingChallenges, error: checkError } = await supabaseClient
      .from("daily_challenges")
      .select("*")
      .eq("date", todayDate);

    if (checkError) {
      console.error("Error checking for existing challenges:", checkError);
      return new Response(JSON.stringify({ error: checkError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If we already have challenges for today, return early
    if (existingChallenges && existingChallenges.length > 0) {
      console.log(`Found ${existingChallenges.length} existing challenges for today`);
      return new Response(
        JSON.stringify({ 
          message: "Daily challenges already exist for today", 
          count: existingChallenges.length 
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Select a random brawler for the classic mode
    const classicBrawler = getRandomItem(brawlers);
    
    // Insert the classic mode challenge
    const { data: classicResult, error: classicError } = await supabaseClient
      .from("daily_challenges")
      .insert({
        mode: "classic",
        challenge_data: classicBrawler.name,
        date: todayDate,
      });

    if (classicError) {
      console.error("Error inserting classic challenge:", classicError);
    } else {
      console.log("Successfully inserted classic challenge");
    }

    // Generate other mode challenges as needed
    // For this example, let's just handle classic mode

    return new Response(
      JSON.stringify({
        message: "Successfully generated daily challenges",
        classic: classicBrawler.name,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating challenges:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
