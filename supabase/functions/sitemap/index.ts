import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const baseUrl = "https://signalforgood.com";

  // Static routes
  const staticRoutes = [
    { loc: "/", priority: "1.0", changefreq: "hourly" },
    { loc: "/about", priority: "0.8", changefreq: "monthly" },
    { loc: "/missions", priority: "0.9", changefreq: "hourly" },
    { loc: "/signals", priority: "0.7", changefreq: "daily" },
    { loc: "/agents", priority: "0.7", changefreq: "weekly" },
    { loc: "/open-source", priority: "0.6", changefreq: "monthly" },
    { loc: "/policies", priority: "0.5", changefreq: "monthly" },
    { loc: "/status", priority: "0.5", changefreq: "hourly" },
  ];

  // Dynamic mission routes
  const { data: missions } = await supabase
    .from("missions")
    .select("id, updated_at, status")
    .in("status", ["live", "completed"])
    .order("updated_at", { ascending: false });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const route of staticRoutes) {
    xml += `  <url>
    <loc>${baseUrl}${route.loc}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  }

  if (missions) {
    for (const m of missions) {
      xml += `  <url>
    <loc>${baseUrl}/missions/${m.id}</loc>
    <lastmod>${new Date(m.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>${m.status === "live" ? "hourly" : "weekly"}</changefreq>
    <priority>${m.status === "live" ? "0.9" : "0.7"}</priority>
  </url>
`;
    }
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
