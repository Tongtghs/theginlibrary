import { getServiceClient } from "./_lib/supabase.js";
import { getStripe } from "./_lib/stripe.js";
import { sendBookingConfirmation, sendAdminNotification } from "./_lib/email.js";

// POST /.netlify/functions/stripe-webhook
// Stripe signature verification requires the raw request body.
export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
  }

  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Missing signature", { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.warn("stripe-webhook: signature verification failed", err.message);
    return new Response(`Webhook signature error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCompleted(event.data.object);
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await handleExpired(event.data.object);
    }
  } catch (err) {
    console.error("stripe-webhook: handler failed", err);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

async function handleCompleted(session) {
  const supabase = getServiceClient();
  const bookingId = session.metadata?.booking_id;

  // Idempotent: if we've already marked this paid, stop.
  const { data: existing, error: lookupErr } = await supabase
    .from("bookings")
    .select("id, status, event_id, customer_email, customer_name, customer_phone, seats, total_cents, currency, locale, stripe_session_id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (lookupErr) {
    console.error("stripe-webhook: lookup failed", lookupErr);
    throw lookupErr;
  }

  let bookingRow = existing;

  if (!bookingRow && bookingId) {
    const { data: byId } = await supabase
      .from("bookings")
      .select("id, status, event_id, customer_email, customer_name, customer_phone, seats, total_cents, currency, locale, stripe_session_id")
      .eq("id", bookingId)
      .maybeSingle();
    bookingRow = byId || null;
  }

  if (!bookingRow) {
    console.warn("stripe-webhook: no booking row for session", session.id);
    return;
  }

  if (bookingRow.status === "paid") {
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const { data: updated, error: updErr } = await supabase
    .from("bookings")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", bookingRow.id)
    .neq("status", "paid")
    .select("id, event_id, customer_email, customer_name, customer_phone, seats, total_cents, currency, locale, stripe_session_id, stripe_payment_intent_id, status, paid_at")
    .maybeSingle();

  if (updErr) {
    console.error("stripe-webhook: update failed", updErr);
    throw updErr;
  }

  if (!updated) {
    // Another webhook delivery already marked it paid.
    return;
  }

  const { data: eventRow, error: evErr } = await supabase
    .from("events")
    .select("id, title_en, title_de, starts_at")
    .eq("id", updated.event_id)
    .maybeSingle();

  if (evErr || !eventRow) {
    console.error("stripe-webhook: event lookup failed", evErr);
    return;
  }

  try {
    await sendBookingConfirmation({ booking: updated, event: eventRow });
  } catch (err) {
    console.error("stripe-webhook: customer email failed", err);
  }
  try {
    await sendAdminNotification({ booking: updated, event: eventRow });
  } catch (err) {
    console.error("stripe-webhook: admin email failed", err);
  }
}

async function handleExpired(session) {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("stripe_session_id", session.id)
    .eq("status", "pending");
  if (error) console.error("stripe-webhook: expire update failed", error);
}
