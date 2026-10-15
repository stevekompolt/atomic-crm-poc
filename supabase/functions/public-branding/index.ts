import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=60",
};

const publicImageUrl = (value: unknown): string | null =>
  typeof value === "string" &&
  value.length <= 4096 &&
  (value.startsWith("https://") || value.startsWith("data:image/png;base64,") ||
    value.startsWith("data:image/webp;base64,") || value.startsWith("data:image/svg+xml;base64,"))
    ? value
    : null;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405, headers });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return new Response("Unavailable", { status: 503, headers });

  try {
    const client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Deliberately query only the installation-wide singleton. Never return
    // raw configuration: it may gain private fields in future versions.
    const { data, error } = await client
      .from("configuration")
      .select("config")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    const config = data?.config ?? {};
    const branding = {
      title: typeof config.title === "string" && config.title.length <= 120
        ? config.title : "Atomic CRM",
      darkModeLogo: publicImageUrl(config.darkModeLogo),
      lightModeLogo: publicImageUrl(config.lightModeLogo),
    };
    return new Response(JSON.stringify(branding), { headers });
  } catch (error) {
    console.error("Unable to read public branding", error);
    return new Response("Unavailable", { status: 503, headers: {
      ...headers, "Cache-Control": "no-store",
    } });
  }
});
