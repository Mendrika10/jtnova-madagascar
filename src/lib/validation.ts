import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximum ${max} caractères`)
    .optional()
    .default("");

const optionalUrl = z
  .string()
  .trim()
  .max(1000, "URL trop longue")
  .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "URL invalide (http:// ou https://)")
  .optional()
  .default("");

/** Champs du formulaire admin d'une réalisation (F4.9). */
export const projectFormSchema = z.object({
  title: z.string().trim().min(2, "Titre trop court").max(200, "Titre trop long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug obligatoire")
    .max(120, "Slug trop long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide : minuscules, chiffres et tirets uniquement"),
  tag: optionalText(80),
  category: optionalText(80),
  year: optionalText(20),
  description: z
    .string()
    .trim()
    .min(10, "Description trop courte")
    .max(600, "Description trop longue"),
  presentation: optionalText(4000),
  explication: optionalText(6000),
  security: optionalText(4000),
  performance: optionalText(4000),
  client_name: optionalText(120),
  live_url: optionalUrl,
  repo_url: optionalUrl,
  video_url: optionalUrl,
  video_poster: optionalText(1000),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

/** Découpe un textarea « une ligne = un élément » en liste nettoyée. */
export function parseLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/* ── S5 : réglages du site et sections éditables ──────────────────────── */

const requiredText = (max: number, label: string) =>
  z.string().trim().min(1, `${label} obligatoire`).max(max, `${label} : maximum ${max} caractères`);

/** Lien interne ou externe (les deux acceptés, vide = lien retiré). */
const anyHref = z
  .string()
  .trim()
  .max(1000, "Lien trop long")
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\/\S+$/.test(v),
    "Lien invalide (chemin /... ou URL http(s)://)",
  );

const ctaLink = z.object({
  label: requiredText(80, "Libellé"),
  href: anyHref,
});

/** F5.1 — éditeur Hero. */
export const heroSettingSchema = z.object({
  badge: requiredText(120, "Badge"),
  title: requiredText(200, "Titre"),
  title_accent: optionalText(200),
  subtitle: requiredText(400, "Sous-titre"),
  cta_primary: ctaLink,
  cta_secondary: ctaLink,
});

/** F5.2 — éditeur À propos (mission, vision, chiffres clés). */
export const aboutSettingSchema = z.object({
  mission_title: requiredText(160, "Titre de mission"),
  mission_text: requiredText(1200, "Texte de mission"),
  vision_title: requiredText(160, "Titre de vision"),
  vision_text: requiredText(1200, "Texte de vision"),
  /** Une ligne par chiffre, format « 50+ | Projets livrés ». */
  stats: z
    .array(z.string().trim().max(120, "Chiffre trop long"))
    .max(8, "8 chiffres maximum"),
});

/** F5.3 — éditeur Services (une carte = un bloc de 3 lignes). */
export const serviceSchema = z.object({
  title: requiredText(120, "Titre du service"),
  description: requiredText(400, "Description du service"),
  icon: optionalText(80),
});

/** F5.4 — éditeur Témoignages. */
export const testimonialSchema = z.object({
  name: requiredText(120, "Nom"),
  role: optionalText(160),
  text: requiredText(800, "Témoignage"),
  linkedin_url: optionalUrl,
});

/** F5.5 — éditeur FAQ. */
export const faqSchema = z.object({
  question: requiredText(240, "Question"),
  answer: requiredText(1200, "Réponse"),
});

/** F5.6 — éditeur CTA + réseaux sociaux. */
export const ctaSettingSchema = z.object({
  badge: requiredText(120, "Badge"),
  title_line1: requiredText(120, "Titre (ligne 1)"),
  title_line2: optionalText(120),
  button_label: requiredText(80, "Libellé du bouton"),
  button_href: anyHref,
  socials: z
    .array(
      z.object({
        label: requiredText(40, "Libellé du réseau"),
        href: anyHref,
      }),
    )
    .max(8, "8 réseaux maximum"),
});

/** F5.7 — réglages SEO globaux. */
export const seoSettingSchema = z.object({
  site_name: requiredText(80, "Nom du site"),
  title: requiredText(120, "Titre SEO"),
  description: requiredText(300, "Description SEO"),
  locale: z
    .string()
    .trim()
    .max(10)
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Locale invalide (ex. fr, fr-FR)"),
  /** Chemin interne (/images/...) ou URL http(s) complète. */
  og_image: requiredText(1000, "Image de partage"),
});

/** F5.8 — identité : logo, favicon, couleur d'accent. */
export const identitySettingSchema = z.object({
  logo_url: requiredText(1000, "URL du logo"),
  favicon_url: requiredText(1000, "URL du favicon"),
  accent_color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (format #rrggbb)"),
});

/**
 * Analyse une ligne « num | label » (chiffres clés). Retourne null si la
 * ligne est vide ou mal formée — les lignes invalides sont ignorées.
 */
export function parseStatLine(line: string): { num: string; label: string } | null {
  const [num, ...rest] = line.split("|").map((p) => p.trim());
  if (!num || rest.length === 0 || !rest.join("|")) return null;
  return { num, label: rest.join("|").trim() };
}
