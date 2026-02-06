import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

interface HoneypotLogEntry {
  timestamp?: string;
  source_ip: string;
  source_port?: number;
  honeypot_name: string;
  honeypot_type: string;
  attack_type?: string;
  payload?: string;
  protocol?: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = Deno.env.get("HONEYPOT_API_KEY");

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error("Unauthorized: Invalid or missing API key");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("Received honeypot data:", JSON.stringify(body));

    // Support both single entry and batch entries
    const entries: HoneypotLogEntry[] = Array.isArray(body) ? body : [body];

    // Validate required fields
    for (const entry of entries) {
      if (!entry.source_ip || !entry.honeypot_name || !entry.honeypot_type) {
        return new Response(
          JSON.stringify({ 
            error: "Missing required fields: source_ip, honeypot_name, honeypot_type" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create Supabase client with service role for inserting logs
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert logs into database
    const { data, error } = await supabase
      .from("honeypot_logs")
      .insert(
        entries.map((entry) => ({
          timestamp: entry.timestamp || new Date().toISOString(),
          source_ip: entry.source_ip,
          source_port: entry.source_port,
          honeypot_name: entry.honeypot_name,
          honeypot_type: entry.honeypot_type,
          attack_type: entry.attack_type,
          payload: entry.payload,
          protocol: entry.protocol,
          metadata: entry.metadata || {},
        }))
      )
      .select();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to store log entry", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully stored ${entries.length} honeypot log(s)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Stored ${entries.length} log entry(ies)`,
        ids: data?.map((d) => d.id) 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
