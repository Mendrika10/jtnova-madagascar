"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import About from "@/components/a-propos/About";
import Hero from "@/components/accueil/Hero";
import CTA from "@/components/cta/CTA";
import FAQ from "@/components/faq/FAQ";
import Services from "@/components/services/Services";
import Testimonials from "@/components/temoignages/Testimonials";
import styles from "@/app/admin/admin.module.css";
import type {
  AboutSetting,
  ContactInfoSetting,
  CtaSetting,
  HeroSetting,
  SocialLink,
} from "@/lib/site-settings";
import type {
  AboutValues,
  CtaValues,
  FaqRow,
  HeroValues,
  IdentityValues,
  SeoValues,
  ServiceRow,
  TestimonialRow,
} from "@/components/admin/SettingsEditors";

/**
 * S5 — Aperçus « live » des sections éditables.
 *
 * **Ce sont les composants du site public eux-mêmes** (`Hero`, `About`,
 * `Services`, `Témoignages`, `FAQ`, `CTA`), pas des maquettes : l'aperçu est
 * donc le rendu réel du client, à l'identique, alimenté par les valeurs en
 * cours de saisie — la valeur brouillon est posée **par-dessus** les réglages
 * enregistrés, si bien que les parties non éditables (valeurs de la page
 * « À propos », liens sociaux, coordonnées) restent celles du site.
 *
 * Faute de place dans la colonne latérale, le bloc n'est pas comprimé : il est
 * rendu à la **largeur d'un écran de bureau** (1024–1440 px, la largeur de la
 * fenêtre de l'admin) puis **réduit à l'échelle de la colonne** (`zoom`). La
 * mise en page, les media queries et les unités `vw`/`vh` restent donc celles
 * d'un vrai visiteur sur ordinateur : l'aperçu en est la miniature fidèle.
 *
 * Deux sections n'existent pas comme bloc du site public — le référencement
 * (balises) et l'identité (logo, favicon, couleur) — et gardent un aperçu
 * explicatif.
 */

/** « 50+ | Projets livrés » → { num, label } (lignes invalides ignorées). */
function parseStats(lines: string): { num: string; label: string }[] {
  return lines
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [num, ...rest] = line.split("|").map((p) => p.trim());
      if (!num || rest.length === 0 || !rest.join("|").trim()) return null;
      return { num, label: rest.join("|").trim() };
    })
    .filter((s): s is { num: string; label: string } => s !== null);
}

/** « LINKEDIN | https://… » → { label, href } (lignes sans lien ignorées). */
function parseSocials(lines: string): { label: string; href: string }[] {
  return lines
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|").map((p) => p.trim());
      return { label: label ?? "", href: rest.join("|").trim() };
    })
    .filter((s) => s.label && s.href);
}

/** Initiales d'un nom, pour la pastille d'avatar des témoignages. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Cadre de l'aperçu : une tête discrète (titre + état « synchronisé » ou
 * « modifications non enregistrées ») puis la fenêtre.
 *
 * `full` : le contenu est un **bloc du site public**, miniature de l'écran de
 * bureau (fenêtre défilante). Sinon (référencement, identité) le contenu est un
 * aperçu explicatif rembourré.
 *
 * `note` : information d'administration affichée **sous** la miniature (elle ne
 * fait pas partie du site et ne doit donc pas être réduite avec lui).
 */

/** Largeur de l'écran de référence : un écran de bureau, jamais moins. */
const FRAME_MIN = 1024;
const FRAME_MAX = 1440;

export function PreviewPanel({
  title,
  dirty,
  full = false,
  note,
  children,
}: {
  title: string;
  /** Vrai dès qu'un champ diffère des valeurs enregistrées. */
  dirty?: boolean;
  full?: boolean;
  /** Note d'administration, hors de la miniature. */
  note?: string;
  children: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: FRAME_MAX, scale: 1, height: 0 });

  /**
   * Le cadre du site prend la largeur d'un écran de bureau — celle de la
   * fenêtre de l'admin, bornée à 1024–1440 px pour que les unités `vw`/`vh` et
   * les media queries du site restent celles d'un vrai visiteur — puis il est
   * réduit à la largeur utile de la colonne. La mesure est refaite quand la
   * colonne, la fenêtre ou la hauteur du site changent.
   *
   * La réduction passe par `transform: scale` (et non `zoom`) : une mise à
   * l'échelle garde les proportions exactes du site, là où le `zoom` de Chrome
   * arrondit chaque boîte au pixel et dérive de quelques pour cent sur une page
   * longue. La hauteur du bloc réserve donc exactement la place de la miniature.
   */
  useEffect(() => {
    if (!full) return;
    const stage = stageRef.current;
    const page = pageRef.current;
    if (!stage || !page) return;
    const measure = () => {
      const width = Math.min(FRAME_MAX, Math.max(FRAME_MIN, window.innerWidth));
      const scale = Math.min(1, stage.clientWidth / width);
      const height = page.offsetHeight;
      setFrame((previous) =>
        previous.width === width &&
        previous.height === height &&
        Math.abs(previous.scale - scale) < 0.0005
          ? previous
          : { width, scale, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(page);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [full]);

  return (
    <aside
      className={styles.previewPanel}
      aria-label={`Aperçu de la section ${title}`}
    >
      <div className={styles.previewHead}>
        <span>
          {full
            ? `Aperçu — écran ${frame.width} px, réduit à ${Math.round(frame.scale * 100)} %`
            : "Aperçu"}
        </span>
        <span
          className={`${styles.previewHint} ${dirty ? styles.previewHintDirty : ""}`}
          role="status"
        >
          {dirty ? "modifications non enregistrées" : "synchronisé"}
        </span>
      </div>
      {full ? (
        <>
          <div className={styles.previewStage} ref={stageRef}>
            {/* La perspective réserve la place de la miniature réduite ; le
                cadre, lui, garde ses dimensions de site et n'est réduit qu'à
                l'affichage.

                L'aperçu est une **image** du site : aucun clic ne doit partir
                d'ici (lien, accordéon, formulaire de contact). Le défilement de
                la fenêtre, lui, reste possible. */}
            <div
              className={styles.previewViewport}
              style={{ height: `${Math.round(frame.height * frame.scale)}px` }}
            >
              <div
                className={styles.previewWindow}
                ref={pageRef}
                style={{
                  width: `${frame.width}px`,
                  transform: `scale(${frame.scale})`,
                }}
              >
                {children}
              </div>
            </div>
          </div>
          {note && <p className={styles.previewNote}>{note}</p>}
        </>
      ) : (
        <div className={styles.previewBody}>{children}</div>
      )}
    </aside>
  );
}

/* ── Sections du site public ─────────────────────────────────────────────── */

export function HeroPreview({
  values,
  setting,
  socials,
}: {
  values: HeroValues;
  setting: HeroSetting;
  socials: SocialLink[];
}) {
  const hero: HeroSetting = {
    ...setting,
    badge: values.badge,
    title: values.title,
    title_accent: values.title_accent,
    subtitle: values.subtitle,
    cta_primary: {
      label: values.cta_primary_label,
      href: values.cta_primary_href,
    },
    cta_secondary: {
      label: values.cta_secondary_label,
      href: values.cta_secondary_href,
    },
  };
  return <Hero hero={hero} socials={socials} />;
}

export function AboutPreview({
  values,
  setting,
}: {
  values: AboutValues;
  setting: AboutSetting;
}) {
  const about: AboutSetting = {
    ...setting,
    mission_title: values.mission_title,
    mission_text: values.mission_text,
    vision_title: values.vision_title,
    vision_text: values.vision_text,
    stats: parseStats(values.stats_lines),
  };
  return <About setting={about} />;
}

export function CtaPreview({
  values,
  setting,
  contact,
}: {
  values: CtaValues;
  setting: CtaSetting;
  contact: ContactInfoSetting;
}) {
  const cta: CtaSetting = {
    ...setting,
    badge: values.badge,
    title_line1: values.title_line1,
    title_line2: values.title_line2,
    button_label: values.button_label,
    button_href: values.button_href,
    socials: parseSocials(values.socials_lines),
  };
  return <CTA setting={cta} contact={contact} />;
}

/**
 * Un aperçu de liste rend **le bloc du site** plus, s'il y a lieu, une note
 * d'administration : la note est affichée par `PreviewPanel` sous la miniature
 * (texte lisible), jamais réduite avec le site.
 */
type ListPreview = { block: ReactNode; note?: string };

export function buildServicesPreview(rows: ServiceRow[]): ListPreview {
  // Une ligne entièrement vide n'afficherait pas de carte sur le site : on ne
  // la montre pas ici non plus (elle n'est pas encore un service).
  const filled = rows.filter((r) => r.title.trim() || r.description.trim());
  return {
    block: (
      <Services
        items={filled.map((r) => ({
          title: r.title,
          description: r.description,
          tag: r.icon,
        }))}
      />
    ),
    note:
      filled.length === 0
        ? "Aucun service : le site affiche son contenu de remplacement."
        : undefined,
  };
}

export function buildTestimonialsPreview(
  rows: TestimonialRow[],
): ListPreview {
  const published = rows.filter((r) => r.published);
  const hidden = rows.length - published.length;
  const s = hidden > 1 ? "s" : "";
  const notes: string[] = [];
  if (hidden > 0) {
    notes.push(`${hidden} témoignage${s} non publié${s} — masqué${s} sur le site.`);
    if (published.length === 0) {
      notes.push(
        "Sans témoignage publié, le site affiche son contenu de remplacement.",
      );
    }
  }
  return {
    block: (
      <Testimonials
        items={published.map((r) => ({
          name: r.name,
          role: r.role,
          avatar: initials(r.name),
          text: r.text,
          linkedin: r.linkedin_url,
        }))}
      />
    ),
    note: notes.length ? notes.join(" ") : undefined,
  };
}

export function buildFaqPreview(rows: FaqRow[]): ListPreview {
  const filled = rows.filter((r) => r.question.trim() || r.answer.trim());
  return {
    block: <FAQ items={filled} />,
    note:
      filled.length === 0
        ? "Aucune question : le site affiche son contenu de remplacement."
        : undefined,
  };
}

/* ── Réglages sans bloc public : aperçu explicatif ───────────────────────── */

export function SeoPreview({ values }: { values: SeoValues }) {
  return (
    <>
      <div className={styles.previewCard}>
        <p className={styles.previewCode}>
          {values.site_name || "Site"} · {values.locale}
        </p>
        <p className={styles.previewTitle}>
          {values.title || <span className={styles.previewMuted}>Titre SEO…</span>}
        </p>
        <p className={styles.previewText}>{values.description}</p>
      </div>
      {values.og_image && (
        <div
          className={`${styles.previewImg} ${styles.previewOgImage}`}
          style={{ backgroundImage: `url("${values.og_image}")` }}
          aria-hidden="true"
        />
      )}
      <pre className={styles.previewCode}>{`<title>${values.title}</title>`}</pre>
      <pre className={styles.previewCode}>
        {`<meta property="og:title" content="${values.title}">`}
      </pre>
      <pre className={styles.previewCode}>
        {`<meta property="og:image" content="${values.og_image}">`}
      </pre>
    </>
  );
}

export function IdentityPreview({ values }: { values: IdentityValues }) {
  return (
    <>
      <div className={styles.previewRow}>
        {values.logo_url && (
          <span
            className={`${styles.previewImg} ${styles.previewLogo}`}
            style={{ backgroundImage: `url("${values.logo_url}")` }}
            aria-hidden="true"
          />
        )}
        {values.favicon_url && (
          <span
            className={`${styles.previewImg} ${styles.previewFavicon}`}
            style={{ backgroundImage: `url("${values.favicon_url}")` }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className={styles.previewSwatch}>
        <span
          className={styles.previewSwatchChip}
          style={{ backgroundColor: values.accent_color }}
          aria-hidden="true"
        />
        <span className={styles.previewText}>
          Accent <code className={styles.code}>{values.accent_color}</code>
        </span>
      </div>
      <p className={`${styles.previewText} ${styles.previewMuted}`}>
        Le logo remplace celui de la navbar et du pied de page ; la couleur
        d&apos;accent est appliquée à tout le site.
      </p>
    </>
  );
}
