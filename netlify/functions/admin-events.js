import { getServiceClient } from "./_lib/supabase.js";
import { requireAdmin } from "./_lib/auth.js";
import { json, methodNotAllowed } from "./_lib/http.js";

const EDITABLE_FIELDS = [
  "slug",
  "title_en",
  "title_de",
  "description_en",
  "description_de",
  "starts_at",
  "duration_minutes",
  "capacity",
  "price_cents",
  "currency",
  "image_url",
  "is_published",
];

function pick(body) {
  const out = {};
  for (const k of EDITABLE_FIELDS) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

function validate(payload, { requireAll }) {
  const errs = [];
  if (requireAll) {
    for (const f of ["slug", "title_en", "title_de", "description_en", "description_de", "starts_at", "capacity", "price_cents"]) {
      if (payload[f] === undefined || payload[f] === null || payload[f] === "") errs.push(`${f} required`);
    }
  }
  if (payload.capacity !== undefined && (!Number.isInteger(payload.capacity) || payload.capacity < 1)) errs.push("capacity must be a positive integer");
  if (payload.price_cents !== undefined && (!Number.isInteger(payload.price_cents) || payload.price_cents < 0)) errs.push("price_cents must be a non-negative integer");
  if (payload.duration_minutes !== undefined && (!Number.isInteger(payload.duration_minutes) || payload.duration_minutes < 1)) errs.push("duration_minutes must be a positive integer");
  if (payload.starts_at !== undefined && Number.isNaN(new Date(payload.starts_at).getTime())) errs.push("starts_at must be a valid ISO timestamp");
  if (payload.slug !== undefined && !/^[a-z0-9][a-z0-9-]{1,119}$/.test(payload.slug)) errs.push("slug must be lowercase letters, digits, and hyphens");
  return errs;
}

export default async (request) => {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = getServiceClient();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (request.method === "GET") {
    if (id) {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      if (error) return json(500, { error: error.message });
      if (!data) return json(404, { error: "Not found" });
      return json(200, { event: data });
    }
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) return json(500, { error: error.message });
    return json(200, { events: data });
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
    const payload = pick(body);
    const errs = validate(payload, { requireAll: true });
    if (errs.length) return json(400, { error: errs.join(", ") });
    const { data, error } = await supabase.from("events").insert(payload).select("*").single();
    if (error) return json(400, { error: error.message });
    return json(201, { event: data });
  }

  if (request.method === "PUT" || request.method === "PATCH") {
    if (!id) return json(400, { error: "id query param required" });
    let body;
    try { body = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
    const payload = pick(body);
    const errs = validate(payload, { requireAll: false });
    if (errs.length) return json(400, { error: errs.join(", ") });
    const { data, error } = await supabase.from("events").update(payload).eq("id", id).select("*").maybeSingle();
    if (error) return json(400, { error: error.message });
    if (!data) return json(404, { error: "Not found" });
    return json(200, { event: data });
  }

  if (request.method === "DELETE") {
    if (!id) return json(400, { error: "id query param required" });
    // Don't allow deleting an event that has paid bookings.
    const { count, error: countErr } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id)
      .eq("status", "paid");
    if (countErr) return json(500, { error: countErr.message });
    if ((count || 0) > 0) return json(409, { error: "Event has paid bookings; unpublish instead of deleting" });

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return json(400, { error: error.message });
    return json(204, {});
  }

  return methodNotAllowed(["GET", "POST", "PUT", "PATCH", "DELETE"]);
};
