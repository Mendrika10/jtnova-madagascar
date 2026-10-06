import { getSupabasePublicClient } from "./supabase/server";
import type { Database } from "./database.types";
import type { ProjectData } from "@/components/projets/ProjectDetail";

/**
 * Couche d'accès aux contenus (côté serveur uniquement).
 * Toutes les fonctions retournent `null` si Supabase n'est pas configuré
 * ou en cas d'erreur : les composants affichent alors leurs données de
 * repli locales (build CI, stack arrêtée…). Rien ne doit jeter ici.
 */

export type ServiceItem = {
  title: string;
  description: string;
  tag: string;
};

export type TestimonialItem = {
  name: string;
  role: string;
  avatar: string;
  text: string;
  linkedin: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type TechItem = {
  name: string;
};

export type ProjectCardItem = {
  title: string;
  category: string;
  year: string;
  tag: string;
  image: string;
  href: string;
};

export async function getServices(): Promise<ServiceItem[] | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("services")
    .select("title, description, icon")
    .eq("published", true)
    .order("sort_order");

  if (error || !data || data.length === 0) return null;

  return data.map((s) => ({
    title: s.title,
    description: s.description,
    tag: s.icon ?? "",
  }));
}

export async function getTestimonials(): Promise<TestimonialItem[] | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("testimonials")
    .select("name, role, avatar_text, text, linkedin_url")
    .eq("published", true)
    .order("sort_order");

  if (error || !data || data.length === 0) return null;

  return data.map((t) => ({
    name: t.name,
    role: t.role ?? "",
    avatar:
      t.avatar_text ??
      t.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    text: t.text,
    linkedin: t.linkedin_url ?? "",
  }));
}

export async function getFaqs(): Promise<FaqItem[] | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("faq_items")
    .select("question, answer")
    .eq("published", true)
    .order("sort_order");

  if (error || !data || data.length === 0) return null;

  return data;
}

export async function getTechBanner(): Promise<TechItem[] | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("tech_banner")
    .select("name")
    .order("sort_order");

  if (error || !data || data.length === 0) return null;

  return data;
}

export async function getPublishedProjects(): Promise<
  ProjectCardItem[] | null
> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("slug, title, tag, category, year, cover_image")
    .eq("published", true)
    .order("sort_order");

  if (error || !data || data.length === 0) return null;

  return data.map((p) => ({
    title: p.title,
    category: p.category ?? "",
    year: p.year ?? "",
    tag: p.tag ?? "",
    image: p.cover_image ?? "",
    href: `/projects/${p.slug}`,
  }));
}

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

/**
 * Transforme une ligne `projects` (avec ses listes) en la forme attendue
 * par le composant public `ProjectDetail`. Pur, sans accès réseau.
 * F2.8 : les listes sont toujours des tableaux (jamais undefined).
 */
export function toProjectDetail(
  project: ProjectRow,
  images: { url: string }[],
  tech: { label: string }[],
  highlights: { text: string }[],
): ProjectData {
  return {
    title: project.title,
    tag: project.tag ?? undefined,
    year: project.year ?? undefined,
    category: project.category ?? undefined,
    description: project.description,
    presentation: project.presentation ?? undefined,
    explication: project.explication ?? undefined,
    security: project.security ?? undefined,
    performance: project.performance ?? undefined,
    tech: tech.map((t) => t.label),
    highlights: highlights.map((h) => h.text),
    images: images.map((i) => i.url),
    video: project.video_url
      ? { src: project.video_url, poster: project.video_poster ?? undefined }
      : undefined,
    liveUrl: project.live_url ?? undefined,
    repoUrl: project.repo_url ?? undefined,
  };
}

/**
 * Récupère une réalisation publiée par son slug, avec ses images, technologies
 * et points forts ordonnés. Retourne `null` si absente, non publiée, ou si
 * Supabase n'est pas configuré (l'appelant affiche alors un 404).
 */
export async function getProjectBySlug(
  slug: string,
): Promise<ProjectData | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !project) return null;

  const [imagesRes, techRes, highlightsRes] = await Promise.all([
    supabase
      .from("project_images")
      .select("url")
      .eq("project_id", project.id)
      .order("sort_order"),
    supabase
      .from("project_tech")
      .select("label")
      .eq("project_id", project.id)
      .order("sort_order"),
    supabase
      .from("project_highlights")
      .select("text")
      .eq("project_id", project.id)
      .order("sort_order"),
  ]);

  return toProjectDetail(
    project,
    imagesRes.data ?? [],
    techRes.data ?? [],
    highlightsRes.data ?? [],
  );
}
