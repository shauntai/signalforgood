import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount_cents, donor_email } = await req.json();

    if (typeof amount_cents !== "number" || amount_cents < 500 || amount_cents > 2500000) {
      throw new Error("amount_cents must be between 500 and 2500000");
    }

    const ua = req.headers.get("user-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "";

    const uaHash = ua ? await sha256(ua) : null;
    const ipHash = ip ? await sha256(ip) : null;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Insert intent
    const { data: intent, error: intentErr } = await supabaseAdmin
      .from("donation_intents")
      .insert({
        method: "card",
        amount_cents,
        page_path: "/donate",
        user_agent_hash: uaHash,
        ip_hash: ipHash,
        status: "intent",
      })
      .select("id")
      .single();

    if (intentErr) {
      console.error("[DONATE] Intent insert error:", intentErr);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://signalforgood.com";

    const sessionParams: any = {
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Donation to Signal For Good" },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/donate?success=1`,
      cancel_url: `${origin}/donate?canceled=1`,
      metadata: {
        amount_cents: String(amount_cents),
        page: "donate",
        project: "signalforgood",
        intent_id: intent?.id || "",
      },
    };

    if (donor_email) {
      sessionParams.customer_email = donor_email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update intent with session ID
    if (intent?.id) {
      await supabaseAdmin
        .from("donation_intents")
        .update({ stripe_session_id: session.id })
        .eq("id", intent.id);
    }

    return new Response(JSON.stringify({ session_url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[DONATE] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
