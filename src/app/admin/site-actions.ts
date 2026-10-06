"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  saveSiteSetting,
  type AboutSetting,
} from "@/lib/site-settings";
import {
  heroSettingSchema,
  aboutSettingSchema,
  ctaSettingSchema,
  seoSettingSchema,
  identitySettingSchema,
  serviceSchema,
  testimonialSchema,
  faqSchema,
  parseStatLine,
} from "@/lib/validation";

/**
 * S5 — Server Actions de personnalisation. Même contrat que les actions S4 :
 * validation Zod côté serveur, écritures via le client lié à la session
 * (RLS : les admins seuls écrivent), revalidation des pages publiques puis
 * redirection avec code de résultat (`?section=…&saved=1`).
 */

export type SettingsFormState = {
  errors: Record<string, string>;
  values: Record<string, string>;
};

const SETTINGS_PAGE = "/admin/personnalisation";

function revalidateSite(): void {
  // Next 16 : `updateTag` est l'API immédiate réservée aux Server Actions
  // (read-your-own-writes) — l'éditeur voit son changement dès la redirection.
  updateTag("site-settings");
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/projets");
  revalidatePath("/services");
  revalidatePath("/a-propos");
  revalidatePath("/contact");
  revalidatePath(SETTINGS_PAGE);
}

function str(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

function collectErrors(
  issues: { path: (string | number | symbol)[]; message: string }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join("_") || "_";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function fail(
  errors: Record<string, string>,
  values: Record<string, string>,
): SettingsFormState {
  return { errors, values };
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return supabase;
}

/** Lit les lignes indexées d'un éditeur de liste (rows[i][field]). */
function readRows(
  formData: FormData,
  fields: string[],
): { index: number; values: Record<string, string> }[] {
  const count = Number(formData.get("count") ?? "0");
  const rows: { index: number; values: Record<string, string> }[] = [];
  for (let i = 0; i < count; i += 1) {
    if (formData.get(`deleted_${i}`) === "1") continue;
    const values: Record<string, string> = {};
    for (const field of fields) values[field] = str(formData, `rows_${i}_${field}`);
    rows.push({ index: i, values });
  }
  return rows;
}

/* ── F5.1 — Hero ─────────────────────────────────────────────────────── */

export async function saveHeroAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const raw = {
    badge: str(formData, "badge"),
    title: str(formData, "title"),
    title_accent: str(formData, "title_accent"),
    subtitle: str(formData, "subtitle"),
    cta_primary: {
      label: str(formData, "cta_primary_label"),
      href: str(formData, "cta_primary_href"),
    },
    cta_secondary: {
      label: str(formData, "cta_secondary_label"),
      href: str(formData, "cta_secondary_href"),
    },
  };
  const parsed = heroSettingSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(collectErrors(parsed.error.issues), {
      badge: raw.badge,
      title: raw.title,
      title_accent: raw.title_accent,
      subtitle: raw.subtitle,
      cta_primary_label: raw.cta_primary.label,
      cta_primary_href: raw.cta_primary.href,
      cta_secondary_label: raw.cta_secondary.label,
      cta_secondary_href: raw.cta_secondary.href,
    });
  }
  const error = await saveSiteSetting("hero", parsed.data);
  if (error) return fail({ _: error }, {});
  revalidateSite();
  redirect(`${SETTINGS_PAGE}?section=hero&saved=1`);
}

/* ── F5.2 — À propos ─────────────────────────────────────────────────── */

export async function saveAboutAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const statLines = String(formData.get("stats") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const raw = {
    mission_title: str(formData, "mission_title"),
    mission_text: str(formData, "mission_text"),
    vision_title: str(formData, "vision_title"),
    vision_text: str(formData, "vision_text"),
    stats: statLines,
  };
  const parsed = aboutSettingSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(collectErrors(parsed.error.issues), {
      mission_title: raw.mission_title,
      mission_text: raw.mission_text,
      vision_title: raw.vision_title,
      vision_text: raw.vision_text,
      stats: statLines.join("\n"),
    });
  }

  const stats = statLines
    .map(parseStatLine)
    .filter((s): s is { num: string; label: string } => s !== null);

  const value: AboutSetting = {
    mission_title: parsed.data.mission_title,
    mission_text: parsed.data.mission_text,
    vision_title: parsed.data.vision_title,
    vision_text: parsed.data.vision_text,
    stats,
  };
  const error = await saveSiteSetting("about", value as unknown as Record<string, unknown>);
  if (error) return fail({ _: error }, {});
  revalidateSite();
  redirect(`${SETTINGS_PAGE}?section=about&saved=1`);
}

/* ── F5.6 — CTA + réseaux sociaux ────────────────────────────────────── */

export async function saveCtaAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  // Une ligne par réseau, format « LABEL | href »
  const socials = String(formData.get("socials") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => {
      const [label, ...rest] = l.split("|").map((p) => p.trim());
      return { label: label ?? "", href: rest.join("|").trim() };
    });

  const raw = {
    badge: str(formData, "badge"),
    title_line1: str(formData, "title_line1"),
    title_line2: str(formData, "title_line2"),
    button_label: str(formData, "button_label"),
    button_href: str(formData, "button_href"),
    socials,
  };
  const parsed = ctaSettingSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(collectErrors(parsed.error.issues), {
      badge: raw.badge,
      title_line1: raw.title_line1,
      title_line2: raw.title_line2,
      button_label: raw.button_label,
      button_href: raw.button_href,
      socials: raw.socials.map((s) => `${s.label} | ${s.href}`).join("\n"),
    });
  }
  const error = await saveSiteSetting("cta", parsed.data);
  if (error) return fail({ _: error }, {});
  revalidateSite();
  redirect(`${SETTINGS_PAGE}?section=cta&saved=1`);
}

/* ── F5.7 — SEO ──────────────────────────────────────────────────────── */

export async function saveSeoAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const raw = {
    site_name: str(formData, "site_name"),
    title: str(formData, "title"),
    description: str(formData, "description"),
    locale: str(formData, "locale"),
    og_image: str(formData, "og_image"),
  };
  const parsed = seoSettingSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(collectErrors(parsed.error.issues), raw);
  }
  const error = await saveSiteSetting("seo", parsed.data);
  if (error) return fail({ _: error }, {});
  revalidateSite();
  redirect(`${SETTINGS_PAGE}?section=seo&saved=1`);
}

/* ── F5.8 — Identité ─────────────────────────────────────────────────── */

export async function saveIdentityAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const raw = {
    logo_url: str(formData, "logo_url"),
    favicon_url: str(formData, "favicon_url"),
    accent_color: str(formData, "accent_color"),
  };
  const parsed = identitySettingSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(collectErrors(parsed.error.issues), raw);
  }
  const error = await saveSiteSetting("identity", parsed.data);
  if (error) return fail({ _: error }, {});
  revalidateSite();
  redirect(`${SETTINGS_PAGE}?section=identity&saved=1`);
}

/* ── F5.3 — Services (liste remplacée à chaque enregistrement) ───────── */

const servicesListSchema = serviceSchema.array().min(1).max(30);

export async function saveServicesAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const rows = readRows(formData, ["title", "description", "icon"]);
  const parsed = servicesListSchema.safeParse(
    rows.map((r) => ({
      title: r.values.title,
      description: r.values.description,
      icon: r.values.icon,
    })),
  );
  if (!parsed.success) {
    const errors = collectErrors(
      parsed.error.issues.map((issue) => ({
        ...issue,
        path: ["row", ...issue.path] as (string | number)[],
      })),
    );
    return fail(errors, {});
  }

  const supabase = await requireUser();
  if (!supabase) return fail({ _: "Session expirée, reconnectez-vous." }, {});

  // Remplacement complet (même stratégie que les technologies d'une
  // réalisation) : les identifiants ne sont référencés nulle part ailleurs.
  await supabase.from("services").delete().neq("title", "\u0000");
  const { error } = await supabase.from("services").insert(
    parsed.data.map((s, i) => ({
      title: s.title,
      description: s.description,
      icon: s.icon || null,
      sort_order: i,
      published: true,
    })),
  );
  if (error) return fail({ _: error.message }, {});

  revalidateSite();
  redirect(`${SETTINGS_PAGE}?section=services&saved=1`);
}

/* ── F5.4 — Témoignages (liste + ordre + publication) ────────────────── */

const testimonialsListSchema = testimonialSchema
  .extend({ published: z.boolean() })
  .array()
  .min(1)
  .max(30);

export async function saveTestimonialsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const rows = readRows(formData, ["name", "role", "text", "linkedin_url"]);
  const parsed = testimonialsListSchema.safeParse(
    rows.map((r) => ({
      name: r.values.name,
      role: r.values.role,
      text: r.values.text,
      linkedin_url: r.values.linkedin_url,
      published: formData.get(`published_${r.index}`) === "on",
    })),
  );
  if (!parsed.success) {
    const errors = collectErrors(
      parsed.error.issues.map((issue) => ({
        ...issue,
        path: ["row", ...issue.path] as (string | number)[],
      })),
    );
    return fail(errors, {});
  }

  const supabase = await requireUser();
  if (!supabase) return fail({ _: "Session expirée, reconnectez-vous." }, {});

  await supabase.from("testimonials").delete().neq("name", "\u0000");
  const { error } = await supabase.from("testimonials").insert(
    parsed.data.map((t, i) => ({
      name: t.name,
      role: t.role || null,
      text: t.text,
      linkedin_url: t.linkedin_url || null,
      avatar_text: null,
      sort_order: i,
      published: t.published,
    })),
  );
  if (error) return fail({ _: error.message }, {});

  revalidateSite();
  redirect(`${SETTINGS_PAGE}?section=testimonials&saved=1`);
}

/* ── F5.5 — FAQ (liste remplacée à chaque enregistrement) ────────────── */

const faqListSchema = faqSchema.array().min(1).max(30);

export async function saveFaqsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const rows = readRows(formData, ["question", "answer"]);
  const parsed = faqListSchema.safeParse(
    rows.map((r) => ({
      question: r.values.question,
      answer: r.values.answer,
    })),
  );
  if (!parsed.success) {
    const errors = collectErrors(
      parsed.error.issues.map((issue) => ({
        ...issue,
        path: ["row", ...issue.path] as (string | number)[],
      })),
    );
    return fail(errors, {});
  }

  const supabase = await requireUser();
  if (!supabase) return fail({ _: "Session expirée, reconnectez-vous." }, {});

  await supabase.from("faq_items").delete().neq("question", "\u0000");
  const { error } = await supabase.from("faq_items").insert(
    parsed.data.map((f, i) => ({
      question: f.question,
      answer: f.answer,
      sort_order: i,
      published: true,
    })),
  );
  if (error) return fail({ _: error.message }, {});

  revalidateSite();
  redirect(`${SETTINGS_PAGE}?section=faq&saved=1`);
}
