import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

// Input validation constants
const MAX_PAYLOAD_SIZE = 10 * 1024; // 10KB max payload
const MAX_IP_LENGTH = 45; // IPv6 max length
const MAX_NAME_LENGTH = 50;
const MAX_TYPE_LENGTH = 100;
const MAX_ATTACK_TYPE_LENGTH = 100;
const MAX_PROTOCOL_LENGTH = 20;

// Rate limiting: track requests per API key
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

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

// Validate IPv4 or IPv6 address format
function isValidIP(ip: string): boolean {
  if (!ip || ip.length > MAX_IP_LENGTH) return false;
  
  // IPv4 pattern
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|^::(?:[a-fA-F0-9]{1,4}:){0,6}[a-fA-F0-9]{1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,7}:$|^(?:[a-fA-F0-9]{1,4}:){0,6}::(?:[a-fA-F0-9]{1,4}:){0,5}[a-fA-F0-9]{1,4}$/;
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

// Check rate limit for API key
function checkRateLimit(apiKey: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(apiKey);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(apiKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

// Sanitize string input
function sanitizeString(input: string | undefined, maxLength: number): string | undefined {
  if (!input) return undefined;
  return String(input).slice(0, maxLength).trim();
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
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    if (!checkRateLimit(apiKey)) {
      console.warn("Rate limit exceeded for API key");
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check content length before parsing
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
      console.warn(`Request too large: ${contentLength} bytes`);
      return new Response(
        JSON.stringify({ error: "Request payload too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("Received honeypot data from authorized source");

    // Support both single entry and batch entries
    const entries: HoneypotLogEntry[] = Array.isArray(body) ? body : [body];

    // Limit batch size
    if (entries.length > 100) {
      console.warn(`Batch too large: ${entries.length} entries`);
      return new Response(
        JSON.stringify({ error: "Batch size exceeds maximum of 100 entries" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize entries
    const validatedEntries = [];
    for (const entry of entries) {
      // Validate required fields
      if (!entry.source_ip || !entry.honeypot_name || !entry.honeypot_type) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: source_ip, honeypot_name, honeypot_type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate IP address format
      if (!isValidIP(entry.source_ip)) {
        return new Response(
          JSON.stringify({ error: "Invalid source_ip format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate port range
      if (entry.source_port !== undefined && (entry.source_port < 0 || entry.source_port > 65535)) {
        return new Response(
          JSON.stringify({ error: "Invalid source_port range (0-65535)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sanitize and limit payload size
      let sanitizedPayload = entry.payload;
      if (sanitizedPayload && sanitizedPayload.length > 5000) {
        sanitizedPayload = sanitizedPayload.slice(0, 5000) + "...[truncated]";
      }

      // Limit metadata size
      let sanitizedMetadata = entry.metadata || {};
      const metadataStr = JSON.stringify(sanitizedMetadata);
      if (metadataStr.length > 2000) {
        sanitizedMetadata = { error: "metadata_truncated", original_size: metadataStr.length };
      }

      validatedEntries.push({
        timestamp: entry.timestamp || new Date().toISOString(),
        source_ip: entry.source_ip,
        source_port: entry.source_port,
        honeypot_name: sanitizeString(entry.honeypot_name, MAX_NAME_LENGTH),
        honeypot_type: sanitizeString(entry.honeypot_type, MAX_TYPE_LENGTH),
        attack_type: sanitizeString(entry.attack_type, MAX_ATTACK_TYPE_LENGTH),
        payload: sanitizedPayload,
        protocol: sanitizeString(entry.protocol, MAX_PROTOCOL_LENGTH),
        metadata: sanitizedMetadata,
      });
    }

    // Create Supabase client with service role for inserting logs
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert logs into database
    const { data, error } = await supabase
      .from("honeypot_logs")
      .insert(validatedEntries)
      .select("id");

    if (error) {
      // Log detailed error server-side only
      console.error("Database error:", error.message, error.code, error.details);
      return new Response(
        JSON.stringify({ error: "Failed to store log entries" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully stored ${validatedEntries.length} honeypot log(s)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Stored ${validatedEntries.length} log entry(ies)`,
        ids: data?.map((d) => d.id) 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
