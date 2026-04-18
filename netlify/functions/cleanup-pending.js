import { getServiceClient } from "./_lib/supabase.js";

// Scheduled by netlify.toml: every 15 minutes.
// Safety net in case a Stripe webhook is missed: expire `pending` bookings
// older than 60 minutes so their reserved seats are released.
export default async () => {
  const supabase = getServiceClient();
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    console.error("cleanup-pending failed", error);
    return new Response("error", { status: 500 });
  }

  return new Response(JSON.stringify({ expired: data?.length || 0 }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
