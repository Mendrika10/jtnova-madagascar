import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { MESSAGE_STATUSES, type MessageStatus } from "./validation";

export type ContactMessage =
  Database["public"]["Tables"]["contact_messages"]["Row"];

export type StatusFilter = MessageStatus | "all";

export const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Tous",
  new: "Nouveau",
  read: "Lu",
  replied: "Répondu",
  archived: "Archivé",
};

export function parseStatusFilter(value: string | undefined): StatusFilter {
  return (MESSAGE_STATUSES as readonly string[]).includes(value ?? "")
    ? (value as MessageStatus)
    : "all";
}

/**
 * F6.2 — boîte de réception : messages les plus récents d'abord (limite 200).
 * Le statut est filtré **en base** (correct au-delà de la limite) ; la
 * recherche est filtrée **en mémoire** (volumes faibles, aucune requête
 * PostgREST construite dynamiquement → zéro injection).
 */
export async function getInbox(
  supabase: SupabaseClient<Database>,
  { status, q }: { status: StatusFilter; q?: string },
): Promise<ContactMessage[]> {
  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error(
      "[admin-messages] lecture boîte de réception :",
      error.message,
    );
    return [];
  }
  const needle = q?.trim().toLowerCase();
  if (!needle) return data ?? [];
  return (data ?? []).filter((m) =>
    [m.name, m.email, m.subject ?? "", m.message].some((v) =>
      v.toLowerCase().includes(needle),
    ),
  );
}

/** F6.3 — un message par identifiant (null si absent ou erreur). */
export async function getMessage(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ContactMessage | null> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data;
}

/** Compteurs exacts par statut (requêtes `head` — aucune ligne transférée). */
export async function getStatusCounts(
  supabase: SupabaseClient<Database>,
): Promise<Record<StatusFilter, number>> {
  const keys: StatusFilter[] = ["all", ...MESSAGE_STATUSES];
  const results = await Promise.all(
    keys.map((key) =>
      key === "all"
        ? supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true })
        : supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true })
            .eq("status", key),
    ),
  );
  const counts = {} as Record<StatusFilter, number>;
  keys.forEach((key, i) => {
    counts[key] = results[i]?.count ?? 0;
  });
  return counts;
}
