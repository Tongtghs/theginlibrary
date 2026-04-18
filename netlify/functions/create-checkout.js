import { getServiceClient } from "./_lib/supabase.js";
import { getStripe } from "./_lib/stripe.js";
import { json, methodNotAllowed } from "./_lib/http.js";

const MAX_SEATS_PER_BOOKING = 20;

function cleanString(v, max = 200) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function validEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// POST /.netlify/functions/create-checkout
// Body: { slug, seats, name, email, phone?, locale? }
// Returns: { url } — Stripe Checkout Session URL
export default async (request) => {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const slug = cleanString(body.slug, 120);
  const name = cleanString(body.name, 120);
  const email = cleanString(body.email, 200).toLowerCase();
  const phone = cleanString(body.phone, 40);
  const locale = body.locale === "de" ? "de" : "en";
  const seats = Number.parseInt(body.seats, 10);

  if (!slug) return json(400, { error: "Missing event" });
  if (!name) return json(400, { error: "Missing name" });
  if (!validEmail(email)) return json(400, { error: "Invalid email" });
  if (!Number.isFinite(seats) || seats < 1 || seats > MAX_SEATS_PER_BOOKING) {
    return json(400, { error: "Invalid seat count" });
  }

  const supabase = getServiceClient();

  // Look up the event so we can get its id (the RPC needs a uuid).
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select(
      "id, slug, title_en, title_de, starts_at, price_cents, currency, capacity, is_published"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (eventErr) {
    console.error("create-checkout: event lookup failed", eventErr);
    return json(500, { error: "Could not load event" });
  }
  if (!event || !event.is_published) {
    return json(404, { error: "Event not found", code: "EVENT_NOT_FOUND" });
  }

  // Atomic capacity check + pending insert.
  const { data: rows, error: rpcErr } = await supabase.rpc("create_pending_booking", {
    p_event_id: event.id,
    p_seats: seats,
    p_customer_name: name,
    p_customer_email: email,
    p_customer_phone: phone || null,
    p_locale: locale,
  });

  if (rpcErr) {
    const msg = String(rpcErr.message || "");
    if (msg.includes("SOLD_OUT")) {
      return json(409, { error: "Sold out", code: "SOLD_OUT" });
    }
    if (msg.includes("EVENT_PAST")) {
      return json(410, { error: "Event has started", code: "EVENT_PAST" });
    }
    if (msg.includes("EVENT_NOT_FOUND")) {
      return json(404, { error: "Event not found", code: "EVENT_NOT_FOUND" });
    }
    console.error("create-checkout: rpc failed", rpcErr);
    return json(500, { error: "Could not reserve seats" });
  }

  const result = Array.isArray(rows) ? rows[0] : rows;
  if (!result) {
    return json(500, { error: "Could not reserve seats" });
  }

  const bookingId = result.booking_id;
  const totalCents = result.total_cents;
  const currency = (result.currency || event.currency || "eur").toLowerCase();
  const title = locale === "de" ? result.title_de : result.title_en;

  const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "") || "http://localhost:8888";
  const stripe = getStripe();

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      locale: locale === "de" ? "de" : "en",
      line_items: [
        {
          quantity: seats,
          price_data: {
            currency,
            unit_amount: event.price_cents,
            product_data: {
              name: title,
              description: new Date(event.starts_at).toISOString(),
            },
          },
        },
      ],
      // 30-minute session expiry (Stripe default is ~24h; we tighten it).
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: {
        booking_id: bookingId,
        event_id: event.id,
        seats: String(seats),
      },
      payment_intent_data: {
        metadata: {
          booking_id: bookingId,
          event_id: event.id,
        },
      },
      success_url: `${siteUrl}/booking-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking-cancelled.html?booking_id=${bookingId}`,
    });
  } catch (err) {
    console.error("create-checkout: stripe failed", err);
    // Release the pending hold so the seats aren't locked up by a failed Stripe call.
    await supabase
      .from("bookings")
      .update({ status: "expired" })
      .eq("id", bookingId)
      .eq("status", "pending");
    return json(502, { error: "Payment provider error" });
  }

  const { error: updErr } = await supabase
    .from("bookings")
    .update({ stripe_session_id: session.id })
    .eq("id", bookingId);
  if (updErr) {
    console.error("create-checkout: could not save session id", updErr);
    // Not fatal — the webhook can match on metadata.booking_id too.
  }

  if (Number(totalCents) !== seats * event.price_cents) {
    console.warn("create-checkout: total mismatch", { bookingId, totalCents, expected: seats * event.price_cents });
  }

  return json(200, { url: session.url, booking_id: bookingId });
};
