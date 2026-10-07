import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * F7.8 — rapport de santé pour la page admin `/admin/sante` : état de la base,
 * volumétrie des contenus et dernières erreurs journalisées.
 *
 * Le rapport est **tolérant aux pannes** : si la table `error_logs` n'existe pas
 * encore (migration additive non appliquée sur une instance), la page reste
 * utilisable et affiche un avertissement explicite au lieu de planter.
 */

export type HealthError = {
  id: string;
  created_at: string;
  level: string;
  source: string;
  message: string;
  path: string | null;
  resolved: boolean;
};

export type HealthReport = {
  checkedAt: string;
  databaseOk: boolean;
  latencyMs: number | null;
  databaseError: string | null;
  /** Message d'erreur si `error_logs` est indisponible (migration manquante). */
  logsError: string | null;
  counts: {
    publishedProjects: number;
    draftProjects: number;
    services: number;
    testimonials: number;
    faqs: number;
    unreadMessages: number;
    totalMessages: number;
  };
  recentErrors: HealthError[];
  unresolvedErrors: number;
};

async function headCount(
  supabase: SupabaseClient<Database>,
  table: "projects" | "services" | "testimonials" | "faq_items" | "contact_messages" | "error_logs",
  filter?: { column: string; value: string | boolean },
): Promise<number> {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  return error ? 0 : (count ?? 0);
}

export async function getHealthReport(
  supabase: SupabaseClient<Database>,
): Promise<HealthReport> {
  const startedAt = Date.now();

  const { error: dbError } = await supabase
    .from("site_settings")
    .select("key", { count: "exact", head: true });

  const [
    publishedProjects,
    draftProjects,
    services,
    testimonials,
    faqs,
    unreadMessages,
    totalMessages,
  ] = await Promise.all([
    headCount(supabase, "projects", { column: "published", value: true }),
    headCount(supabase, "projects", { column: "published", value: false }),
    headCount(supabase, "services", { column: "published", value: true }),
    headCount(supabase, "testimonials", { column: "published", value: true }),
    headCount(supabase, "faq_items", { column: "published", value: true }),
    headCount(supabase, "contact_messages", { column: "status", value: "new" }),
    headCount(supabase, "contact_messages"),
  ]);

  const { data: errorRows, error: logsQueryError } = await supabase
    .from("error_logs")
    .select("id, created_at, level, source, message, path, resolved")
    .order("created_at", { ascending: false })
    .limit(50);

  const unresolvedErrors = await headCount(supabase, "error_logs", {
    column: "resolved",
    value: false,
  });

  return {
    checkedAt: new Date().toISOString(),
    databaseOk: !dbError,
    latencyMs: Date.now() - startedAt,
    databaseError: dbError?.message ?? null,
    logsError: logsQueryError?.message ?? null,
    counts: {
      publishedProjects,
      draftProjects,
      services,
      testimonials,
      faqs,
      unreadMessages,
      totalMessages,
    },
    recentErrors: (errorRows ?? []) as HealthError[],
    unresolvedErrors,
  };
}

/** F7.8 — marque une erreur comme traitée (ou l'inverse). */
export async function setErrorResolved(
  supabase: SupabaseClient<Database>,
  id: string,
  resolved: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("error_logs")
    .update({ resolved })
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
