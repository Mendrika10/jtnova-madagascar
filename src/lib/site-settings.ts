import { unstable_cache } from "next/cache";
import { getSupabasePublicClient } from "./supabase/server";
import { createSupabaseServerClient } from "./supabase/server";

/**
 * S5 — Couche de lecture/écriture des réglages du site (`site_settings`).
 * Une ligne = une clé, `value` est un objet JSON typé ici.
 *
 * F5.x : chaque section éditable a (1) un type TS, (2) des valeurs par défaut
 * identiques au contenu actuel du site (fallback si Supabase est absent, en
 * erreur, ou si la clé n'existe pas encore — le premier enregistrement admin
 * crée la ligne par upsert, cf. saveSiteSetting).
 */

export type HeroSetting = {
  badge: string;
  title: string;
  /** Mots du titre à mettre en accent, séparés par des espaces. */
  title_accent: string;
  subtitle: string;
  cta_primary: { label: string; href: string };
  cta_secondary: { label: string; href: string };
};

export type AboutSetting = {
  mission_title: string;
  mission_text: string;
  vision_title: string;
  vision_text: string;
  stats: { num: string; label: string }[];
};

export type CtaSetting = {
  badge: string;
  title_line1: string;
  title_line2: string;
  button_label: string;
  button_href: string;
  socials: SocialLink[];
};

export type SocialLink = { label: string; href: string };

export type SeoSetting = {
  site_name: string;
  title: string;
  description: string;
  locale: string;
  og_image: string;
};

export type ContactInfoSetting = {
  location: string;
  email: string;
  availability: string;
  github: string;
  linkedin: string;
};

export type IdentitySetting = {
  logo_url: string;
  favicon_url: string;
  accent_color: string;
};

export const DEFAULT_HERO: HeroSetting = {
  badge: "Jtnova — Agence Web & Digital",
  title: "Nous créons des expériences digitales qui propulsent votre business.",
  title_accent: "expériences digitales",
  subtitle:
    "Jtnova accompagne les entreprises dans leur transformation numérique avec des sites web performants, un design moderne et des solutions sur mesure qui génèrent des résultats concrets.",
  cta_primary: { label: "Découvrir nos services", href: "/services" },
  cta_secondary: { label: "Démarrer un projet", href: "/contact" },
};

export const DEFAULT_ABOUT: AboutSetting = {
  mission_title: "Transformer les idées en produits digitaux qui comptent",
  mission_text:
    "Permettre à chaque entreprise — startup ou grand groupe — de disposer d'une présence digitale puissante, esthétique et performante. Nous transformons vos ambitions en produits numériques concrets qui génèrent une valeur mesurable.",
  vision_title: "Devenir la référence de l'excellence digitale",
  vision_text:
    "S'imposer comme la référence des agences numériques pour les entreprises qui veulent croître vite et bien. Prouver que l'excellence technique et la créativité peuvent coexister sans le moindre compromis.",
  stats: [
    { num: "50+", label: "Projets livrés" },
    { num: "3+", label: "Années d'expérience" },
    { num: "98%", label: "Clients satisfaits" },
    { num: "15+", label: "Technologies maîtrisées" },
  ],
};

export const DEFAULT_CTA: CtaSetting = {
  badge: "Disponible pour des projets",
  title_line1: "Créons votre prochaine",
  title_line2: "grande idée.",
  button_label: "Me contacter",
  button_href: "/contact",
  socials: [
    { label: "LINKEDIN", href: "#" },
    { label: "GITHUB", href: "#" },
    { label: "BEHANCE", href: "#" },
    { label: "CONTACT", href: "/contact" },
  ],
};

export const DEFAULT_SEO: SeoSetting = {
  site_name: "Jtnova",
  title: "Jtnova | Agence Web & Digital",
  description:
    "Jtnova — Agence web spécialisée en création de sites, design UI/UX et applications web sur mesure.",
  locale: "fr",
  og_image: "/images/logo.png",
};

export const DEFAULT_CONTACT_INFO: ContactInfoSetting = {
  location: "Madagascar — disponible à distance",
  email: "contact@jtnova.com",
  availability: "Ouvert aux nouveaux projets",
  github: "",
  linkedin: "",
};

export const DEFAULT_IDENTITY: IdentitySetting = {
  logo_url: "/images/logo.png",
  favicon_url: "/favicon.ico",
  accent_color: "#00b4d8",
};

const DEFAULTS = {
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  cta: DEFAULT_CTA,
  seo: DEFAULT_SEO,
  identity: DEFAULT_IDENTITY,
  contact_info: DEFAULT_CONTACT_INFO,
} as const;

export type SettingKey = keyof typeof DEFAULTS;

/**
 * Lecture brute mise en cache (ISR 60 s, tag « site-settings ») pour que les
 * pages publiques restent statiques entre les éditions. `revalidateTag` est
 * appelé par les Server Actions après chaque enregistrement.
 */
const readSettingCached = unstable_cache(
  async (key: SettingKey): Promise<Record<string, unknown> | null> => {
    const supabase = getSupabasePublicClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (!data?.value || typeof data.value !== "object") return null;
    return data.value as Record<string, unknown>;
  },
  ["site-settings-read"],
  { revalidate: 60, tags: ["site-settings"] },
);

/**
 * Lecture d'une clé de réglage côté serveur. Retourne la valeur en base
 * fusionnée par-dessus les défauts (les champs absents restent à défaut),
 * ou les défauts purs si Supabase est absent/en erreur/clé inexistante.
 */
export async function getSiteSetting<K extends SettingKey>(
  key: K,
): Promise<(typeof DEFAULTS)[K]> {
  const fallback = DEFAULTS[key] as (typeof DEFAULTS)[K];
  const stored = await readSettingCached(key);
  if (!stored) return fallback;
  return { ...fallback, ...stored } as (typeof DEFAULTS)[K];
}

/**
 * Écriture d'une clé de réglage (côté Server Action, session admin requise
 * par la RLS). Upsert : crée la ligne au premier enregistrement.
 * Retourne `null` si OK, sinon le message d'erreur.
 */
export async function saveSiteSetting(
  key: SettingKey,
  value: Record<string, unknown>,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return "Supabase n'est pas configuré.";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Session expirée, reconnectez-vous.";

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: value as never }, { onConflict: "key" });

  return error ? error.message : null;
}
