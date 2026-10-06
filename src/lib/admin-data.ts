import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type DashboardCounts = {
  publishedProjects: number;
  draftProjects: number;
  unreadMessages: number;
};

/**
 * Compteurs du tableau de bord admin. Utilise un client **authentifié** (la RLS
 * du rôle admin laisse voir les brouillons et les messages). Toute erreur
 * ramène 0 : le tableau de bord ne doit jamais planter.
 */
export async function getDashboardCounts(
  supabase: SupabaseClient<Database>,
): Promise<DashboardCounts> {
  const [published, drafts, unread] = await Promise.all([
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("published", false),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return {
    publishedProjects: published.count ?? 0,
    draftProjects: drafts.count ?? 0,
    unreadMessages: unread.count ?? 0,
  };
}
