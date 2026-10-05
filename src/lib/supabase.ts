import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * Client Supabase côté serveur, clé publique (anon) uniquement.
 * La RLS décide de ce qui est visible : jamais de clé service_role ici.
 * Retourne null si les variables d'environnement ne sont pas définies
 * (ex. build CI sans stack Supabase) — les appelants doivent retomber
 * sur les données de repli locales.
 */
export function getSupabasePublicClient(): SupabaseClient<Database> | null {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
  return client;
}
