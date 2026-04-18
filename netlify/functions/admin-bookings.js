import { getServiceClient } from "./_lib/supabase.js";
import { requireAdmin } from "./_lib/auth.js";
import { json, methodNotAllowed } from "./_lib/http.js";

function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default async (request) => {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const eventId = url.searchParams.get("event_id");
  const status = url.searchParams.get("status");
  const format = url.searchParams.get("format");

  const supabase = getServiceClient();
  let query = supabase
    .from("bookings")
    .select(
      "id, event_id, customer_name, customer_email, customer_phone, seats, total_cents, currency, status, stripe_session_id, locale, created_at, paid_at"
    )
    .order("created_at", { ascending: false });

  if (eventId) query = query.eq("event_id", eventId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return json(500, { error: error.message });

  if (format === "csv") {
    const header = [
      "id",
      "event_id",
      "customer_name",
      "customer_email",
      "customer_phone",
      "seats",
      "total_cents",
      "currency",
      "status",
      "locale",
      "created_at",
      "paid_at",
      "stripe_session_id",
    ];
    const rows = data.map((b) => header.map((h) => csvEscape(b[h])).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const filename = `bookings${eventId ? `-${eventId}` : ""}.csv`;
    return new Response(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return json(200, { bookings: data });
};
