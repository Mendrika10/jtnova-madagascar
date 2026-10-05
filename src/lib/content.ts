import { getSupabasePublicClient } from "./supabase";

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

// Pont slug → page statique existante, en attendant une route dynamique.
const PROJECT_HREF: Record<string, string> = {
  julia: "/projects/project1",
  vitascore: "/projects/project2",
  feonix: "/projects/project3",
  "vina-io": "/projects/project4",
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
    href: PROJECT_HREF[p.slug] ?? "/projets",
  }));
}
