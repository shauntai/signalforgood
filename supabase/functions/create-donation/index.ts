import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const amount = Number(body.amount ?? 25);
    const email = body.email || undefined;
    const isMonthly = Boolean(body.isMonthly);

    const amountInCents = Math.round(amount * 100);
    if (!Number.isFinite(amountInCents) || amountInCents < 100) {
      return new Response(
        JSON.stringify({ error: "Minimum donation is $1.00" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://signalforgood.com";

    const priceData: any = {
      currency: "usd",
      product_data: { name: "BRIDGEGOOD Donation" },
      unit_amount: amountInCents,
    };

    if (isMonthly) {
      priceData.recurring = { interval: "month" };
    }

    const sessionParams: any = {
      line_items: [{ price_data: priceData, quantity: 1 }],
      mode: isMonthly ? "subscription" : "payment",
      success_url: `${origin}/donation-success`,
      cancel_url: `${origin}/donation-canceled`,
      metadata: {
        amount_cents: String(amountInCents),
        project: "signalforgood",
      },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-DONATION] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
