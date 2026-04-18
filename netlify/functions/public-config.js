import { json, methodNotAllowed } from "./_lib/http.js";

// Exposes only non-secret config values needed by the admin login page.
// (The Supabase anon key is designed to be public — RLS protects data.)
export default async (request) => {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);
  return json(200, {
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  });
};
