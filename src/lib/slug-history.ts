import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.types";

/**
 * Historique des slugs renommés, stocké dans `site_settings` (clé
 * `slug_history`, valeur = { ancien-slug: nouveau-slug }). Évite une migration
 * tout en permettant une redirection permanente des anciennes URL (F4.7).
 */
const KEY = "slug_history";

export async function getSlugRedirect(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object") return null;
  const map = data.value as Record<string, unknown>;
  const target = map[slug];
  return typeof target === "string" ? target : null;
}

export async function recordSlugChange(
  supabase: SupabaseClient<Database>,
  oldSlug: string,
  newSlug: string,
): Promise<void> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();

  const current =
    data?.value && typeof data.value === "object"
      ? (data.value as Record<string, unknown>)
      : {};

  // L'ancien slug pointe vers le nouveau ; on suit la chaîne si un slug
  // avait déjà été redirigé vers `oldSlug`.
  const next: Record<string, unknown> = { ...current, [oldSlug]: newSlug };
  for (const [k, v] of Object.entries(next)) {
    if (v === oldSlug) next[k] = newSlug;
  }

  await supabase
    .from("site_settings")
    .upsert(
      { key: KEY, value: next as unknown as NonNullable<Json> },
      { onConflict: "key" },
    );
}
