
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

    // Build exclusion list from brawlers that appeared in the last 2 days
    const pastDates: string[] = [];
    for (let offset = 1; offset <= 2; offset++) {
      const past = new Date(utc2Date);
      past.setDate(past.getDate() - offset);
      pastDates.push(past.toISOString().split("T")[0]);
    }

    const { data: pastRows, error: pastErr } = await supabaseClient
      .from("daily_challenges")
      .select("challenge_data")
      .in("date", pastDates);

    const exclusionSet = new Set<string>();
    if (pastErr) {
      console.error("Error fetching past challenges:", pastErr);
    } else if (pastRows) {
      pastRows.forEach((row) => exclusionSet.add((row as any).challenge_data));
    }

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

    // Generate challenges for all modes while respecting exclusion rules
    const modes = ["classic", "gadget", "starpower", "audio", "pixels"] as const;
    const todaysSelected = new Set<string>();
    const inserted: { mode: string; brawler: string }[] = [];

    for (const mode of modes) {
      // Build pool excluding past two days and already chosen today
      const pool = brawlers.filter(
        (b) => !exclusionSet.has(b.name) && !todaysSelected.has(b.name),
      );

      // Fallback if pool empty (unlikely)
      const pickPool = pool.length > 0 ? pool : brawlers.filter((b) => !todaysSelected.has(b.name));
      const selected = getRandomItem(pickPool);
      todaysSelected.add(selected.name);

      const { error: insertErr } = await supabaseClient
        .from("daily_challenges")
        .insert({
          mode,
          challenge_data: selected.name,
          date: todayDate,
        });

      if (insertErr) {
        console.error(`Error inserting ${mode} challenge:`, insertErr);
      } else {
        inserted.push({ mode, brawler: selected.name });
        console.log(`Inserted ${mode} challenge with ${selected.name}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Successfully generated daily challenges",
        challenges: inserted,
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
