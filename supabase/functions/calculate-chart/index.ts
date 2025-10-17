// Calculate Astrological Chart Edge Function
// Fetches ephemeris data and combines with client-side calculations
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ASTRO_API_URL = Deno.env.get("ASTRO_API_URL") || "http://host.docker.internal:8001";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChartRequest {
  birthDataId: string;
  chartType?: string; // natal, transit, progression
  calculationDate?: string; // For transits/progressions
}

interface When {
  year: number;
  month: number;
  day: number;
  hour: number;
  tz?: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { birthDataId, chartType = "natal", calculationDate }: ChartRequest = await req.json();

    if (!birthDataId) {
      return new Response(
        JSON.stringify({ error: "Missing birthDataId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch birth data from database
    const { data: birthData, error: birthError } = await supabase
      .from("birth_data")
      .select("*")
      .eq("id", birthDataId)
      .single();

    if (birthError || !birthData) {
      return new Response(
        JSON.stringify({ error: "Birth data not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert birth data to When format
    const birthDate = new Date(birthData.birth_date);
    const birthTime = birthData.birth_time || "12:00:00";
    const [hours, minutes] = birthTime.split(":");

    const when: When = {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour: parseFloat(hours) + parseFloat(minutes) / 60,
      tz: birthData.birth_timezone || null,
    };

    // Fetch planetary positions
    const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron"];
    const planetaryData: Record<string, any> = {};

    for (const planet of planets) {
      try {
        const response = await fetch(`${ASTRO_API_URL}/planet/${planet}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(when),
        });

        if (response.ok) {
          planetaryData[planet] = await response.json();
        }
      } catch (error) {
        console.error(`Error fetching ${planet}:`, error);
      }
    }

    // Calculate houses (simplified - would need more complex calc)
    const houses = Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      sign: Math.floor((i * 30) % 360 / 30),
      degree: (i * 30) % 30,
    }));

    // Compile chart data
    const chartData = {
      birthData: {
        name: birthData.name,
        date: birthData.birth_date,
        time: birthData.birth_time,
        location: birthData.birth_location_name,
        lat: birthData.birth_location_lat,
        lng: birthData.birth_location_lng,
      },
      planets: planetaryData,
      houses,
      aspects: [], // Would calculate aspects here
      chartType,
      calculatedAt: new Date().toISOString(),
    };

    // Cache the chart snapshot
    await supabase.from("chart_snapshots").insert({
      birth_data_id: birthDataId,
      chart_type: chartType,
      calculation_date: new Date().toISOString(),
      chart_data: chartData,
    });

    return new Response(JSON.stringify(chartData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in calculate-chart function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/* To invoke locally:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/calculate-chart' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{
      "birthDataId": "your-birth-data-uuid",
      "chartType": "natal"
    }'

*/
