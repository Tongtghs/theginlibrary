import { getServiceClient } from "./_lib/supabase.js";
import { json, methodNotAllowed } from "./_lib/http.js";

// GET /.netlify/functions/events-list
// Returns upcoming published events with seats_available.
export default async (request) => {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const supabase = getServiceClient();
  const nowIso = new Date().toISOString();

  const { data: events, error } = await supabase
    .from("events")
    .select(
      "id, slug, title_en, title_de, description_en, description_de, starts_at, duration_minutes, capacity, price_cents, currency, image_url"
    )
    .eq("is_published", true)
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("events-list select failed", error);
    return json(500, { error: "Failed to load events" });
  }

  if (events.length === 0) return json(200, { events: [] });

  // Aggregate reserved seats per event in one query.
  const ids = events.map((e) => e.id);
  const { data: reserved, error: rErr } = await supabase
    .from("bookings")
    .select("event_id, seats, status")
    .in("event_id", ids)
    .in("status", ["pending", "paid"]);

  if (rErr) {
    console.error("events-list bookings agg failed", rErr);
    return json(500, { error: "Failed to load availability" });
  }

  const takenByEvent = new Map();
  for (const b of reserved) {
    takenByEvent.set(b.event_id, (takenByEvent.get(b.event_id) || 0) + b.seats);
  }

  const payload = events.map((e) => {
    const taken = takenByEvent.get(e.id) || 0;
    return {
      id: e.id,
      slug: e.slug,
      title_en: e.title_en,
      title_de: e.title_de,
      description_en: e.description_en,
      description_de: e.description_de,
      starts_at: e.starts_at,
      duration_minutes: e.duration_minutes,
      price_cents: e.price_cents,
      currency: e.currency,
      image_url: e.image_url,
      capacity: e.capacity,
      seats_available: Math.max(e.capacity - taken, 0),
    };
  });

  return json(200, { events: payload });
};
