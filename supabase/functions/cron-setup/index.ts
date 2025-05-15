
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

serve(async (req) => {
  try {
    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // First, set up the pg_cron and pg_net extensions if they're not already enabled
    await supabaseAdmin.rpc('setup_cron', {});

    // Then, set up the cron job to run our function every day at midnight UTC+2 (10:00 PM UTC)
    // This will reset challenges daily
    const cronSetupResult = await supabaseAdmin.rpc('setup_daily_challenge_cron', {});

    return new Response(
      JSON.stringify({
        message: "Cron job set up successfully",
        result: cronSetupResult
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error setting up cron job:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
