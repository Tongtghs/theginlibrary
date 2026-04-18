// Admin helpers: config loader + session + authenticated fetch.
// All admin pages import from here.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let configPromise = null;
let supabasePromise = null;

export function getPublicConfig() {
  if (!configPromise) {
    configPromise = fetch("/.netlify/functions/public-config").then((r) => {
      if (!r.ok) throw new Error("Failed to load config");
      return r.json();
    });
  }
  return configPromise;
}

export async function getSupabase() {
  if (!supabasePromise) {
    supabasePromise = getPublicConfig().then(({ supabaseUrl, supabaseAnonKey }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: "tgl_admin_supabase" },
      })
    );
  }
  return supabasePromise;
}

// Kept for the login page's initial redirect hint.
const LEGACY_KEY = "tgl_admin_session";
export function saveSession(session) {
  try { localStorage.setItem(LEGACY_KEY, JSON.stringify(session)); } catch {}
}
export function clearSession() {
  try { localStorage.removeItem(LEGACY_KEY); } catch {}
}

export async function getAccessToken() {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

export async function authFetch(input, init = {}) {
  const token = await getAccessToken();
  if (!token) {
    location.href = "/admin/";
    throw new Error("Not signed in");
  }
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const resp = await fetch(input, { ...init, headers });
  if (resp.status === 401) {
    clearSession();
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    location.href = "/admin/";
    throw new Error("Session expired");
  }
  return resp;
}

export async function requireAuth() {
  const token = await getAccessToken();
  if (!token) {
    location.href = "/admin/";
    throw new Error("Redirecting");
  }
}
