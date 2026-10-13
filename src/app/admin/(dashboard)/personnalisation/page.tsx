import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  Image,
  Info,
  Layers,
  MessageSquare,
  Search,
  Share2,
  Sparkles,
} from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSetting } from "@/lib/site-settings";
import {
  HeroEditor,
  AboutEditor,
  CtaEditor,
  SeoEditor,
  IdentityEditor,
  ServicesEditor,
  TestimonialsEditor,
  FaqEditor,
  type HeroValues,
  type AboutValues,
  type CtaValues,
  type SeoValues,
  type IdentityValues,
  type ServiceRow,
  type TestimonialRow,
  type FaqRow,
} from "@/components/admin/SettingsEditors";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Personnalisation | Administration Jtnova",
  robots: { index: false, follow: false },
};

/**
 * Onglets de la page, dans l'ordre d'affichage. Chaque section porte l'icône
 * qui la représente (même traitement que les onglets du formulaire de
 * réalisation) : la barre reste lisible d'un coup d'œil.
 */
const SECTIONS = [
  { id: "hero", label: "Hero", icon: Sparkles },
  { id: "about", label: "À propos", icon: Info },
  { id: "services", label: "Services", icon: Layers },
  { id: "testimonials", label: "Témoignages", icon: MessageSquare },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "cta", label: "CTA & réseaux", icon: Share2 },
  { id: "seo", label: "SEO", icon: Search },
  { id: "identity", label: "Identité", icon: Image },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function isSection(value: string | undefined): value is SectionId {
  return SECTIONS.some((s) => s.id === value);
}

/**
 * S5 — Personnalisation du site : un onglet par section éditable.
 * Les réglages simples (hero, about, cta, seo, identity) vivent dans la table
 * `site_settings` (une ligne JSON par clé) ; les listes (services, témoignages,
 * FAQ) vivent dans leurs propres tables. Les valeurs par défaut de la couche
 * `site-settings` garantissent un contenu même si Supabase est vide.
 */
export default async function AdminPersonnalisationPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const params = await searchParams;
  const active: SectionId = isSection(params.section) ? params.section : "hero";

  const supabase = await createSupabaseServerClient();

  const [hero, about, cta, seo, identity, contact] = await Promise.all([
    getSiteSetting("hero"),
    getSiteSetting("about"),
    getSiteSetting("cta"),
    getSiteSetting("seo"),
    getSiteSetting("identity"),
    getSiteSetting("contact_info"),
  ]);

  const servicesRows: ServiceRow[] = [];
  const testimonialRows: TestimonialRow[] = [];
  const faqRows: FaqRow[] = [];

  if (supabase) {
    const [services, testimonials, faqs] = await Promise.all([
      supabase
        .from("services")
        .select("title, description, icon")
        .order("sort_order"),
      supabase
        .from("testimonials")
        .select("name, role, text, linkedin_url, published")
        .order("sort_order"),
      supabase
        .from("faq_items")
        .select("question, answer")
        .order("sort_order"),
    ]);
    for (const s of services.data ?? []) {
      servicesRows.push({
        title: s.title,
        description: s.description,
        icon: s.icon ?? "",
      });
    }
    for (const t of testimonials.data ?? []) {
      testimonialRows.push({
        name: t.name,
        role: t.role ?? "",
        text: t.text,
        linkedin_url: t.linkedin_url ?? "",
        published: t.published,
      });
    }
    for (const f of faqs.data ?? []) {
      faqRows.push({ question: f.question, answer: f.answer });
    }
  }

  const heroValues: HeroValues = {
    badge: hero.badge,
    title: hero.title,
    title_accent: hero.title_accent,
    subtitle: hero.subtitle,
    cta_primary_label: hero.cta_primary.label,
    cta_primary_href: hero.cta_primary.href,
    cta_secondary_label: hero.cta_secondary.label,
    cta_secondary_href: hero.cta_secondary.href,
  };

  const aboutValues: AboutValues = {
    mission_title: about.mission_title,
    mission_text: about.mission_text,
    vision_title: about.vision_title,
    vision_text: about.vision_text,
    stats_lines: about.stats.map((s) => `${s.num} | ${s.label}`).join("\n"),
  };

  const ctaValues: CtaValues = {
    badge: cta.badge,
    title_line1: cta.title_line1,
    title_line2: cta.title_line2,
    button_label: cta.button_label,
    button_href: cta.button_href,
    socials_lines: cta.socials
      .map((s) => `${s.label} | ${s.href}`)
      .join("\n"),
  };

  const seoValues: SeoValues = {
    site_name: seo.site_name,
    title: seo.title,
    description: seo.description,
    locale: seo.locale,
    og_image: seo.og_image,
  };

  const identityValues: IdentityValues = {
    logo_url: identity.logo_url,
    favicon_url: identity.favicon_url,
    accent_color: identity.accent_color,
  };

  return (
    <div className={styles.panel}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <Sparkles size={18} strokeWidth={2} />
          </span>
          <span className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>Personnalisation</h1>
            <p className={styles.subtitle}>
              {SECTIONS.length} sections · le site public est mis à jour à
              l&apos;enregistrement.
            </p>
          </span>
        </div>
      </div>

      <nav
        className={`${styles.tabs} ${styles.segmentedTabs}`}
        aria-label="Sections personnalisables"
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={`/admin/personnalisation?section=${id}`}
            className={`${styles.tab} ${active === id ? styles.tabActive : ""}`}
            aria-current={active === id ? "page" : undefined}
          >
            <Icon size={14} strokeWidth={2} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>

      {/* Carte unique : l'éditeur de la section ouverte, avec son aperçu.
          L'aperçu rend les **vrais composants du site** : il lui faut donc
          aussi les réglages enregistrés qu'il ne modifie pas (liens sociaux,
          coordonnées, valeurs de la page « À propos »). */}
      <div className={styles.settingsCard}>
        {active === "hero" && (
          <HeroEditor values={heroValues} setting={hero} socials={cta.socials} />
        )}
        {active === "about" && (
          <AboutEditor values={aboutValues} setting={about} />
        )}
        {active === "services" && <ServicesEditor initial={servicesRows} />}
        {active === "testimonials" && (
          <TestimonialsEditor initial={testimonialRows} />
        )}
        {active === "faq" && <FaqEditor initial={faqRows} />}
        {active === "cta" && (
          <CtaEditor values={ctaValues} setting={cta} contact={contact} />
        )}
        {active === "seo" && <SeoEditor values={seoValues} />}
        {active === "identity" && <IdentityEditor values={identityValues} />}
      </div>
    </div>
  );
}
