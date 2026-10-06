"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Client Supabase côté navigateur, clé publique (anon) uniquement.
 * Retourne null si les variables d'environnement ne sont pas définies :
 * les composants doivent prévoir ce cas (repli gracieux).
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    browserClient = createClient<Database>(url, key);
  } catch {
    return null;
  }
  return browserClient;
}
