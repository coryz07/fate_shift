// Get Ephemeris Data Edge Function
// Proxies requests to the Python FastAPI ephemeris server
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ASTRO_API_URL = Deno.env.get("ASTRO_API_URL") || "http://host.docker.internal:8001";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EphemerisRequest {
  endpoint: string; // "planet/Chiron" or "asteroid/1"
  when: {
    year: number;
    month: number;
    day: number;
    hour: number;
    tz?: string | null;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, when }: EphemerisRequest = await req.json();

    if (!endpoint || !when) {
      return new Response(
        JSON.stringify({ error: "Missing endpoint or when parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward request to Python ephemeris API
    const url = `${ASTRO_API_URL}/${endpoint}`;
    console.log(`Proxying request to: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(when),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ephemeris API error: ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Failed to calculate ephemeris", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-ephemeris function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/* To invoke locally:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-ephemeris' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{
      "endpoint": "planet/Chiron",
      "when": {"year":2025,"month":9,"day":22,"hour":12.0}
    }'

*/
