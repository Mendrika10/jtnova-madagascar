import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * UI-ADMIN — lecture réservée au Tableau de bord.
 *
 * Deux besoins, deux fonctions : la recherche (composer de la capture et
 * champ de la barre latérale) et les cartes de réalisations publiées.
 * Toutes les requêtes passent par le client **authentifié** : la RLS laisse
 * l'admin voir les brouillons et les messages, un visiteur anonyme n'obtient
 * rien.
 */

export type SearchKind = "projet" | "message";

/** Portée choisie dans le composer : les deux listes, ou une seule. */
export type SearchScope = "projets" | "messages" | "tout";

export type AdminSearchResult = {
  kind: SearchKind;
  id: string;
  href: string;
  title: string;
  detail: string;
  stamp: string;
};

/** Le terme saisi ne doit pas pouvoir écrire la syntaxe de filtre PostgREST. */
export function sanitizeQuery(raw: string): string {
  return raw
    .replace(/[%,()*\\"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function readScope(raw: unknown): SearchScope {
  return raw === "projets" || raw === "messages" ? raw : "tout";
}

const MESSAGE_STAMPS: Record<string, string> = {
  new: "Nouveau",
  read: "Lu",
  replied: "Répondu",
  archived: "Archivé",
};

/** Le seuil évite qu'une frappe d'une lettre ramène toute la base. */
export const MIN_QUERY_LENGTH = 2;

export async function searchAdmin(
  supabase: SupabaseClient<Database>,
  rawQuery: string,
  scope: SearchScope = "tout",
): Promise<AdminSearchResult[]> {
  const q = sanitizeQuery(rawQuery);
  if (q.length < MIN_QUERY_LENGTH) return [];

  const pattern = `%${q}%`;
  const results: AdminSearchResult[] = [];

  if (scope !== "messages") {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title, slug, category, client_name, published")
      .or(
        `title.ilike.${pattern},slug.ilike.${pattern},category.ilike.${pattern},client_name.ilike.${pattern}`,
      )
      .order("sort_order")
      .limit(6);

    for (const project of projects ?? []) {
      results.push({
        kind: "projet",
        id: project.id,
        href: `/admin/realisations/${project.id}`,
        title: project.title,
        detail:
          [project.category, project.client_name].filter(Boolean).join(" · ") ||
          project.slug,
        stamp: project.published ? "Publiée" : "Brouillon",
      });
    }
  }

  if (scope !== "projets") {
    const { data: messages } = await supabase
      .from("contact_messages")
      .select("id, name, email, subject, status, created_at")
      .or(
        `name.ilike.${pattern},email.ilike.${pattern},subject.ilike.${pattern},message.ilike.${pattern}`,
      )
      .order("created_at", { ascending: false })
      .limit(6);

    for (const message of messages ?? []) {
      results.push({
        kind: "message",
        id: message.id,
        href: `/admin/messages/${message.id}`,
        title: message.subject || message.name,
        detail: `${message.name} · ${message.email}`,
        stamp: MESSAGE_STAMPS[message.status] ?? message.status,
      });
    }
  }

  return results;
}

export type ProjectCard = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  image: string | null;
};

/**
 * Les cartes du Tableau de bord : réalisations **publiées**, dans l'ordre
 * d'affichage du site public. La vignette est l'image de couverture ; à
 * défaut, la première image de la galerie (une seule requête pour toutes les
 * réalisations concernées, jamais une requête par carte).
 */
export async function getProjectCards(
  supabase: SupabaseClient<Database>,
  limit = 6,
): Promise<ProjectCard[]> {
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug, category, tag, year, client_name, cover_image")
    .eq("published", true)
    .order("sort_order")
    .limit(limit);

  const rows = projects ?? [];
  if (rows.length === 0) return [];

  const missing = rows.filter((p) => !p.cover_image).map((p) => p.id);
  const covers = new Map<string, string>();
  if (missing.length > 0) {
    const { data: images } = await supabase
      .from("project_images")
      .select("project_id, url, sort_order")
      .in("project_id", missing)
      .order("sort_order");
    for (const image of images ?? []) {
      if (!covers.has(image.project_id)) covers.set(image.project_id, image.url);
    }
  }

  return rows.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    subtitle:
      [project.category ?? project.tag, project.client_name ?? project.year]
        .filter(Boolean)
        .join(" · ") || "Réalisation",
    image: project.cover_image ?? covers.get(project.id) ?? null,
  }));
}
