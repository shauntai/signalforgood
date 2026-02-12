import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[WEBHOOK] STRIPE_WEBHOOK_SECRET not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("[WEBHOOK] checkout.session.completed", session.id);

    await supabaseAdmin.from("donation_events").insert({
      provider: "stripe",
      provider_event_id: event.id,
      session_id: session.id,
      amount_cents: session.amount_total || 0,
      currency: session.currency || "usd",
      payment_status: session.payment_status || "paid",
    });

    const intentId = session.metadata?.intent_id;
    if (intentId) {
      await supabaseAdmin
        .from("donation_intents")
        .update({ status: "completed" })
        .eq("id", intentId);
    }
  } else if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    console.log("[WEBHOOK] invoice.paid", invoice.id);

    await supabaseAdmin.from("donation_events").insert({
      provider: "stripe",
      provider_event_id: event.id,
      session_id: invoice.subscription as string || null,
      amount_cents: invoice.amount_paid || 0,
      currency: invoice.currency || "usd",
      payment_status: "paid",
    });
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    console.log("[WEBHOOK] customer.subscription.deleted", subscription.id);

    await supabaseAdmin.from("donation_events").insert({
      provider: "stripe",
      provider_event_id: event.id,
      session_id: subscription.id,
      amount_cents: 0,
      currency: "usd",
      payment_status: "canceled",
    });
  } else {
    console.log("[WEBHOOK] Unhandled event type:", event.type);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
