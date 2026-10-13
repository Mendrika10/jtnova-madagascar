import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * UI-ADMIN — lectures du Tableau de bord (vue d'ensemble).
 *
 * Uniquement de la **lecture**, avec le client authentifié : la RLS laisse
 * l'admin voir les brouillons, les messages et les erreurs. Chaque fonction est
 * **tolérante aux pannes** : une requête qui échoue rend une valeur vide, jamais
 * une exception — le tableau de bord ne doit pas planter, et une instance sans
 * migration `error_logs` doit rester utilisable.
 */

export type DayBucket = {
  key: string;
  label: string;
  weekday: string;
  count: number;
};

export type MessageFlow = {
  days: DayBucket[];
  /** Total sur la fenêtre affichée. */
  total: number;
  /** 7 derniers jours, aujourd'hui inclus. */
  thisWeek: number;
  /** Les 7 jours précédents (comparaison de rythme). */
  lastWeek: number;
  delta: number;
};

export type RecentMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  status: string;
  createdAt: string;
};

export type RecentError = {
  id: string;
  level: string;
  message: string;
  source: string;
  createdAt: string;
  resolved: boolean;
};

export type RecentUpdate = {
  id: string;
  title: string;
  published: boolean;
  updatedAt: string;
};

const WEEKDAYS = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

/** Clé locale `AAAA-MM-JJ` (les jours sont ceux du fuseau du serveur). */
function dayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Rythme des demandes sur `days` jours (14 par défaut) : un seau par jour, pour
 * l'histogramme, plus la comparaison semaine courante / semaine précédente.
 */
export async function getMessageFlow(
  supabase: SupabaseClient<Database>,
  days = 14,
): Promise<MessageFlow> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const { data } = await supabase
    .from("contact_messages")
    .select("created_at")
    .gte("created_at", start.toISOString());

  const seen = new Map<string, number>();
  for (const row of data ?? []) {
    const key = dayKey(new Date(row.created_at));
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  const buckets: DayBucket[] = [];
  for (let index = 0; index < days; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dayKey(date);
    buckets.push({
      key,
      label: `${`${date.getDate()}`.padStart(2, "0")}/${`${date.getMonth() + 1}`.padStart(2, "0")}`,
      weekday: WEEKDAYS[date.getDay()] ?? "",
      count: seen.get(key) ?? 0,
    });
  }

  const thisWeek = buckets.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const lastWeek = buckets.slice(0, 7).reduce((sum, day) => sum + day.count, 0);

  return {
    days: buckets,
    total: buckets.reduce((sum, day) => sum + day.count, 0),
    thisWeek,
    lastWeek,
    delta: thisWeek - lastWeek,
  };
}

/** Les derniers messages reçus, du plus récent au plus ancien. */
export async function getRecentMessages(
  supabase: SupabaseClient<Database>,
  limit = 5,
): Promise<RecentMessage[]> {
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
  }));
}

/** Dernières entrées du journal d'erreurs ; `available: false` si la table manque. */
export async function getRecentErrors(
  supabase: SupabaseClient<Database>,
  limit = 3,
): Promise<{ rows: RecentError[]; available: boolean }> {
  const { data, error } = await supabase
    .from("error_logs")
    .select("id, level, message, source, created_at, resolved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { rows: [], available: false };

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      level: row.level,
      message: row.message,
      source: row.source,
      createdAt: row.created_at,
      resolved: row.resolved,
    })),
    available: true,
  };
}

/** Dernières réalisations modifiées (toutes statuts confondus). */
export async function getRecentUpdates(
  supabase: SupabaseClient<Database>,
  limit = 3,
): Promise<RecentUpdate[]> {
  const { data } = await supabase
    .from("projects")
    .select("id, title, published, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    published: row.published,
    updatedAt: row.updated_at,
  }));
}

/** Requête de contrôle chronométrée (`null` si la base ne répond pas). */
export async function pingDatabase(
  supabase: SupabaseClient<Database>,
): Promise<number | null> {
  const startedAt = Date.now();
  const { error } = await supabase
    .from("site_settings")
    .select("key", { count: "exact", head: true });
  return error ? null : Date.now() - startedAt;
}

/** Temps écoulé en français, court : « à l'instant », « il y a 3 h », « hier ». */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const minutes = Math.round((now.getTime() - then.getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(then);
}
