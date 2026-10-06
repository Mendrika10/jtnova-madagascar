"use client";

import styles from "@/app/admin/admin.module.css";
import type {
  HeroValues,
  AboutValues,
  CtaValues,
  SeoValues,
  IdentityValues,
  ServiceRow,
  TestimonialRow,
  FaqRow,
} from "@/components/admin/SettingsEditors";

/**
 * S5 — Aperçus « live » des sections éditables. Ce sont des rendus **légers**
 * (sans les animations ni les effets du site public) : leur but est de montrer
 * le contenu tel qu'il apparaîtra, pendant la saisie et **avant** l'enregistrement.
 * Les images sont posées en `background-image` (pas de <img>) pour rester
 * compatibles avec les URL arbitraires saisies par l'admin.
 */

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

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

export function PreviewPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className={styles.previewPanel} aria-label={`Aperçu de la section ${title}`}>
      <div className={styles.previewHead}>
        <span>Aperçu</span>
        <span className={styles.previewHint}>non enregistré · direct</span>
      </div>
      <div className={styles.previewBody}>{children}</div>
    </aside>
  );
}

export function HeroPreview({ values }: { values: HeroValues }) {
  const accent = new Set(
    values.title_accent.split(/\s+/).map(normalizeWord).filter(Boolean),
  );
  const words = values.title.split(/\s+/).filter(Boolean);

  return (
    <>
      {values.badge && <span className={styles.previewBadge}>{values.badge}</span>}
      <h3 className={styles.previewTitle}>
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className={accent.has(normalizeWord(word)) ? styles.previewAccent : undefined}
          >
            {word}{" "}
          </span>
        ))}
      </h3>
      {values.subtitle && <p className={styles.previewText}>{values.subtitle}</p>}
      <div className={styles.previewRow}>
        {values.cta_primary_label && (
          <span className={`${styles.previewPill} ${styles.previewPillAccent}`}>
            {values.cta_primary_label}
          </span>
        )}
        {values.cta_secondary_label && (
          <span className={styles.previewPill}>{values.cta_secondary_label}</span>
        )}
      </div>
    </>
  );
}

export function AboutPreview({ values }: { values: AboutValues }) {
  const stats = parseStats(values.stats_lines);
  return (
    <>
      <div className={styles.previewStack}>
        <div className={styles.previewCard}>
          <p className={styles.previewCardTitle}>
            {values.mission_title || <span className={styles.previewMuted}>Titre de mission…</span>}
          </p>
          <p className={styles.previewText}>{values.mission_text}</p>
        </div>
        <div className={styles.previewCard}>
          <p className={styles.previewCardTitle}>
            {values.vision_title || <span className={styles.previewMuted}>Titre de vision…</span>}
          </p>
          <p className={styles.previewText}>{values.vision_text}</p>
        </div>
      </div>
      {stats.length > 0 && (
        <div className={styles.previewRow}>
          {stats.map((s, i) => (
            <span key={`${s.num}-${i}`} className={styles.previewStat}>
              <span className={styles.previewStatNum}>{s.num}</span>
              <span className={styles.previewStatLabel}>{s.label}</span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export function CtaPreview({ values }: { values: CtaValues }) {
  const links = parseSocials(values.socials_lines);
  return (
    <>
      {values.badge && <span className={styles.previewBadge}>{values.badge}</span>}
      <h3 className={styles.previewTitle}>
        {values.title_line1}
        {values.title_line2 && (
          <>
            {" "}
            <span className={styles.previewAccent}>{values.title_line2}</span>
          </>
        )}
      </h3>
      {values.button_label && (
        <div className={styles.previewRow}>
          <span className={`${styles.previewPill} ${styles.previewPillAccent}`}>
            {values.button_label}
          </span>
        </div>
      )}
      <div className={styles.previewSocials}>
        {links.length === 0 ? (
          <span className={`${styles.previewSocial} ${styles.previewMuted}`}>
            Aucun réseau (pied de page vide)
          </span>
        ) : (
          links.map((s, i) => (
            <span key={`${s.label}-${i}`} className={styles.previewSocial}>
              {s.label}
            </span>
          ))
        )}
      </div>
    </>
  );
}

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

export function ServicesPreview({ rows }: { rows: ServiceRow[] }) {
  const filled = rows.filter((r) => r.title || r.description);
  if (filled.length === 0) {
    return <p className={styles.previewText}>Aucun service.</p>;
  }
  return (
    <div className={styles.previewStack}>
      {filled.map((r, i) => (
        <div key={i} className={styles.previewCard}>
          <p className={styles.previewCardTitle}>
            {r.title || <span className={styles.previewMuted}>Titre…</span>}
          </p>
          {r.description && <p className={styles.previewText}>{r.description}</p>}
          {r.icon && <span className={styles.previewSocial}>{r.icon}</span>}
        </div>
      ))}
    </div>
  );
}

export function TestimonialsPreview({ rows }: { rows: TestimonialRow[] }) {
  if (rows.length === 0) {
    return <p className={styles.previewText}>Aucun témoignage.</p>;
  }
  return (
    <div className={styles.previewStack}>
      {rows.map((r, i) => (
        <div key={i} className={`${styles.previewCard} ${r.published ? "" : styles.previewDraft}`}>
          <p className={styles.previewText}>« {r.text || "…"} »</p>
          <p className={`${styles.previewCardTitle} ${styles.previewMuted}`}>
            {r.name || "Nom"} {r.role && `· ${r.role}`}
            {!r.published && " · non publié"}
          </p>
        </div>
      ))}
    </div>
  );
}

export function FaqPreview({ rows }: { rows: FaqRow[] }) {
  if (rows.length === 0) {
    return <p className={styles.previewText}>Aucune question.</p>;
  }
  return (
    <div className={styles.previewStack}>
      {rows.map((r, i) => (
        <div key={i} className={styles.previewCard}>
          <p className={styles.previewCardTitle}>
            {r.question || <span className={styles.previewMuted}>Question…</span>}
          </p>
          {r.answer && <p className={styles.previewText}>{r.answer}</p>}
        </div>
      ))}
    </div>
  );
}
