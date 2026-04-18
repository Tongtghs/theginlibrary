import { getAnonClient } from "./supabase.js";

export async function requireAdmin(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return { error: new Response("Unauthorized", { status: 401 }) };

  const accessToken = match[1];
  const supabase = getAnonClient(accessToken);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return { error: new Response("Unauthorized", { status: 401 }) };
  }
  return { user: data.user, accessToken };
}
