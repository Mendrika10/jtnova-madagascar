import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * Client Supabase côté serveur, clé publique (anon) uniquement, **sans session**.
 * Pour la lecture publique du contenu (pages publiques). La RLS décide de ce qui
 * est visible : jamais de clé service_role ici.
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

/**
 * Client Supabase côté serveur, **lié à la session de l'utilisateur** via les
 * cookies. À utiliser pour l'admin (auth + lectures/écritures soumises à la RLS
 * du rôle `admin`). Retourne null si Supabase n'est pas configuré.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : l'écriture des cookies est
          // interdite. Le middleware rafraîchit la session à la place.
        }
      },
    },
  });
}
