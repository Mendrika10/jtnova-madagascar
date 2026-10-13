import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Database,
  FileText,
  Folder,
  Heart,
  Info,
  Mail,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  Zap,
} from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getHealthReport } from "@/lib/admin-health";
import ResolveButton from "./ResolveButton";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Santé | Administration Jtnova",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

const LEVEL_LABELS: Record<string, string> = {
  error: "Erreur",
  warn: "Avertissement",
  info: "Info",
};

/** Couleur de pastille par niveau (variantes claires, scopées `.panel`). */
const LEVEL_PILL: Record<string, string> = {
  error: "pillError",
  warn: "pillReplied",
  info: "pillRead",
};

/** Temps de réponse → verdict, comme les jauges des plateformes de monitoring. */
function latencyVerdict(ms: number | null): {
  tone: "toneOk" | "toneWarn" | "toneBad";
  note: "vitalNoteOk" | "vitalNoteWarn" | "vitalNoteBad";
  text: string;
  zone: 0 | 1 | 2;
} {
  if (ms === null) {
    return { tone: "toneWarn", note: "vitalNoteWarn", text: "Non mesuré", zone: 1 };
  }
  if (ms < 200) {
    return { tone: "toneOk", note: "vitalNoteOk", text: "Réactif — moins de 200 ms", zone: 0 };
  }
  if (ms < 500) {
    return { tone: "toneWarn", note: "vitalNoteWarn", text: "Correct — moins de 500 ms", zone: 1 };
  }
  return { tone: "toneBad", note: "vitalNoteBad", text: "Lent — 500 ms ou plus", zone: 2 };
}

/**
 * F7.8 — « Santé » : état de la base, volumétrie des contenus et dernières
 * erreurs journalisées, dans le langage d'une **page de statut** professionnelle
 * : verdict global en tête (vert / ambre / rouge), indicateurs vitaux, registre
 * des contenus et journal d'erreurs traitable ligne à ligne.
 */
export default async function AdminHealthPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");

  const report = await getHealthReport(supabase);
  const { counts } = report;

  const lat = latencyVerdict(report.latencyMs);
  const openErrors = report.unresolvedErrors;

  // Verdict global : la base prime, puis les incidents ouverts.
  const verdict = !report.databaseOk
    ? {
        banner: "statusBannerBad",
        icon: "statusIconBad",
        chip: "statusChipBad",
        chipLabel: "Service dégradé",
        Icon: AlertCircle,
        title: "Base de données injoignable",
        text: report.databaseError
          ? `La requête de contrôle a échoué : ${report.databaseError}`
          : "La requête de contrôle a échoué. L'administration et le site public peuvent servir des données obsolètes.",
      }
    : openErrors > 0
      ? {
          banner: "statusBannerWarn",
          icon: "statusIconWarn",
          chip: "statusChipWarn",
          chipLabel: "Incidents ouverts",
          Icon: AlertTriangle,
          title: "Site fonctionnel, incidents à traiter",
          text: `Le journal consigne ${openErrors} incident${openErrors > 1 ? "s" : ""} non traité${openErrors > 1 ? "s" : ""}. Le reste du site répond normalement.`,
        }
      : {
          banner: "statusBannerOk",
          icon: "statusIconOk",
          chip: "statusChipOk",
          chipLabel: "Opérationnel",
          Icon: Check,
          title: "Tous les systèmes opérationnels",
          text: "Base de données joignable, journal d'erreurs sans incident ouvert, contenus servis sans erreur.",
        };

  const stamp = `Contrôle à ${dateFmt.format(new Date(report.checkedAt))}`;

  return (
    <div className={`${styles.panel} ${styles.santePage}`}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <Heart size={18} strokeWidth={2} />
          </span>
          <span className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>Santé du site</h1>
            <p className={styles.subtitle}>
              État des systèmes, contenus publiés et journal d&apos;erreurs
            </p>
          </span>
        </div>
        <a href="/admin/sante" className={styles.secondaryBtn}>
          <RefreshCw size={14} strokeWidth={2} aria-hidden />
          Recontrôler
        </a>
      </div>

      {/* ── Verdict global : bandeau à rail de ton ── */}
      <div className={`${styles.statusBanner} ${styles[verdict.banner]}`}>
        <span className={styles.statusRail} aria-hidden />
        <span className={`${styles.statusIcon} ${styles[verdict.icon]}`} aria-hidden>
          <verdict.Icon size={18} strokeWidth={2} />
        </span>
        <span className={styles.statusBody}>
          <span className={styles.statusTitle}>{verdict.title}</span>
          <span className={styles.statusText}>{verdict.text}</span>
        </span>
        <span className={styles.statusMeta}>
          <span className={`${styles.statusChip} ${styles[verdict.chip]}`}>
            <span className={styles.statusDot} aria-hidden />
            {verdict.chipLabel}
          </span>
          <span className={styles.statusStamp}>
            <Clock size={11} strokeWidth={2} aria-hidden />
            {stamp}
          </span>
        </span>
      </div>

      {report.logsError && (
        <p className={styles.warnNote}>
          <AlertTriangle size={14} strokeWidth={2} aria-hidden />
          <span>
            Le journal d&apos;erreurs est indisponible ({report.logsError}).
            Appliquez la migration{" "}
            <code className={styles.inlineCode}>
              20261007090000_error_logs.sql
            </code>{" "}
            sur cette instance pour activer le suivi.
          </span>
        </p>
      )}

      {/* ── Indicateurs vitaux ── */}
      <div className={styles.vitalGrid}>
        <div
          className={`${styles.vitalCard} ${styles[report.databaseOk ? "toneOk" : "toneBad"]}`}
        >
          <span className={styles.vitalHead}>
            <span className={styles.vitalIcon} aria-hidden>
              <Database size={15} strokeWidth={2} />
            </span>
            <span className={styles.vitalLabel}>Base de données</span>
          </span>
          <span className={styles.vitalValue}>
            {report.databaseOk ? "Connectée" : "Hors ligne"}
          </span>
          <span
            className={`${styles.vitalNote} ${report.databaseOk ? styles.vitalNoteOk : styles.vitalNoteBad}`}
          >
            {report.databaseOk
              ? "Requête de contrôle aboutie"
              : (report.databaseError ?? "Requête de contrôle échouée")}
          </span>
        </div>

        <div className={`${styles.vitalCard} ${styles[lat.tone]}`}>
          <span className={styles.vitalHead}>
            <span className={styles.vitalIcon} aria-hidden>
              <Zap size={15} strokeWidth={2} />
            </span>
            <span className={styles.vitalLabel}>Temps de réponse</span>
          </span>
          <span className={styles.vitalValue}>
            {report.latencyMs === null ? "—" : `${report.latencyMs} ms`}
          </span>
          {/* Jauge à 3 zones vert / ambre / rouge : seule la zone atteinte est
              colorée — le repère visuel des pages de statut. */}
          <span
            className={styles.latGauge}
            role="img"
            aria-label={`Temps de réponse : ${lat.text}`}
          >
            <span
              className={`${styles.latSeg} ${lat.zone === 0 ? styles.latSegOk : ""}`}
            />
            <span
              className={`${styles.latSeg} ${lat.zone === 1 ? styles.latSegWarn : ""}`}
            />
            <span
              className={`${styles.latSeg} ${lat.zone === 2 ? styles.latSegBad : ""}`}
            />
          </span>
          <span className={`${styles.vitalNote} ${styles[lat.note]}`}>
            {lat.text}
          </span>
        </div>

        <Link
          href="#journal"
          className={`${styles.vitalCard} ${styles[openErrors > 0 ? "toneBad" : "toneOk"]}`}
        >
          <span className={styles.vitalHead}>
            <span className={styles.vitalIcon} aria-hidden>
              <AlertTriangle size={15} strokeWidth={2} />
            </span>
            <span className={styles.vitalLabel}>Erreurs non traitées</span>
          </span>
          <span className={styles.vitalValue}>{openErrors}</span>
          <span className={styles.vitalNote}>
            {openErrors > 0
              ? "Ouvrir le journal d'erreurs"
              : "Aucun incident ouvert"}
          </span>
        </Link>

        <Link
          href="/admin/messages"
          className={`${styles.vitalCard} ${styles[counts.unreadMessages > 0 ? "toneInfo" : "toneOk"]}`}
        >
          <span className={styles.vitalHead}>
            <span className={styles.vitalIcon} aria-hidden>
              <Mail size={15} strokeWidth={2} />
            </span>
            <span className={styles.vitalLabel}>Messages non lus</span>
          </span>
          <span className={styles.vitalValue}>{counts.unreadMessages}</span>
          <span className={styles.vitalNote}>
            {counts.unreadMessages > 0
              ? "Ouvrir la boîte de réception"
              : "Boîte de réception à jour"}
          </span>
        </Link>
      </div>

      {/* ── Registre des contenus ── */}
      <section aria-labelledby="contents-title">
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionIcon} aria-hidden>
            <Folder size={14} strokeWidth={2} />
          </span>
          <h2 id="contents-title" className={styles.sectionTitle}>
            Contenus servis par le site
          </h2>
        </div>
        <div className={styles.regCard}>
          <p className={styles.regHead}>
            <Folder size={13} strokeWidth={2} aria-hidden />
            {counts.publishedProjects + counts.draftProjects} réalisations ·{" "}
            {counts.totalMessages} message
            {counts.totalMessages > 1 ? "s" : ""} reçu
            {counts.totalMessages > 1 ? "s" : ""}
          </p>
          <div className={styles.regGrid}>
            <div className={styles.regItem}>
              <span className={styles.regIcon} aria-hidden>
                <Folder size={14} strokeWidth={2} />
              </span>
              <span className={styles.regBody}>
                <span className={styles.regLabel}>Réalisations publiées</span>
                <span className={styles.regValue}>{counts.publishedProjects}</span>
              </span>
            </div>
            <div className={styles.regItem}>
              <span className={styles.regIcon} aria-hidden>
                <FileText size={14} strokeWidth={2} />
              </span>
              <span className={styles.regBody}>
                <span className={styles.regLabel}>Brouillons</span>
                <span className={styles.regValue}>{counts.draftProjects}</span>
              </span>
            </div>
            <div className={styles.regItem}>
              <span className={styles.regIcon} aria-hidden>
                <Sparkles size={14} strokeWidth={2} />
              </span>
              <span className={styles.regBody}>
                <span className={styles.regLabel}>Services</span>
                <span className={styles.regValue}>{counts.services}</span>
              </span>
            </div>
            <div className={styles.regItem}>
              <span className={styles.regIcon} aria-hidden>
                <ThumbsUp size={14} strokeWidth={2} />
              </span>
              <span className={styles.regBody}>
                <span className={styles.regLabel}>Témoignages</span>
                <span className={styles.regValue}>{counts.testimonials}</span>
              </span>
            </div>
            <div className={styles.regItem}>
              <span className={styles.regIcon} aria-hidden>
                <Info size={14} strokeWidth={2} />
              </span>
              <span className={styles.regBody}>
                <span className={styles.regLabel}>Questions FAQ</span>
                <span className={styles.regValue}>{counts.faqs}</span>
              </span>
            </div>
            <div className={styles.regItem}>
              <span className={styles.regIcon} aria-hidden>
                <Mail size={14} strokeWidth={2} />
              </span>
              <span className={styles.regBody}>
                <span className={styles.regLabel}>Messages reçus</span>
                <span className={styles.regValue}>{counts.totalMessages}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Journal d'erreurs ── */}
      <section aria-labelledby="journal-title" id="journal">
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionIcon} aria-hidden>
            <AlertTriangle size={14} strokeWidth={2} />
          </span>
          <h2 id="journal-title" className={styles.sectionTitle}>
            Journal d&apos;erreurs
          </h2>
          {openErrors > 0 && (
            <span className={`${styles.statusPill} ${styles.pillError}`}>
              {openErrors} à traiter
            </span>
          )}
          <span className={styles.sectionHintRight}>
            50 dernières entrées · contrôle à{" "}
            {dateFmt.format(new Date(report.checkedAt))}
          </span>
        </div>

        {report.recentErrors.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={`${styles.emptyIcon} ${styles.emptyIconOk}`} aria-hidden>
              <Check size={22} strokeWidth={2} />
            </span>
            <p className={styles.emptyTitle}>Aucune erreur journalisée</p>
            <p className={styles.emptyText}>
              Rien à signaler au contrôle de{" "}
              {dateFmt.format(new Date(report.checkedAt))}. Les prochaines
              erreurs de production apparaîtront ici automatiquement.
            </p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Quand</th>
                    <th>Niveau</th>
                    <th>Source</th>
                    <th>Message</th>
                    <th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {report.recentErrors.map((row) => (
                    <tr
                      key={row.id}
                      className={row.resolved ? styles.rowResolved : undefined}
                    >
                      <td className={`${styles.orderCell} ${styles.journalDate}`}>
                        {dateFmt.format(new Date(row.created_at))}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusPill} ${styles[LEVEL_PILL[row.level] ?? "pillRead"]}`}
                        >
                          <span className={styles.pillDot} aria-hidden />
                          {LEVEL_LABELS[row.level] ?? row.level}
                        </span>
                      </td>
                      <td className={styles.orderCell}>
                        <code className={styles.code}>{row.source}</code>
                      </td>
                      <td>
                        {row.message}
                        {row.path && (
                          <span className={styles.journalPath}>{row.path}</span>
                        )}
                      </td>
                      <td className={styles.actionsCell}>
                        <span className={styles.actionsFlex}>
                          <span
                            className={`${styles.statusPill} ${row.resolved ? styles.pillOk : styles.pillError}`}
                          >
                            {row.resolved ? "Traité" : "À traiter"}
                          </span>
                          <ResolveButton id={row.id} resolved={row.resolved} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
