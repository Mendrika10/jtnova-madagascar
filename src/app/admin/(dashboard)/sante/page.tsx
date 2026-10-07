import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getHealthReport } from "@/lib/admin-health";
import { toggleErrorResolvedAction } from "./actions";
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

/** Couleur de pastille par niveau, réutilise les styles existants. */
const LEVEL_PILL: Record<string, string> = {
  error: "pillNew",
  warn: "pillReplied",
  info: "pillRead",
};

/**
 * F7.8 — « Santé » : état de la base, volumétrie des contenus et dernières
 * erreurs journalisées. C'est le tableau de bord qui rend visible une erreur
 * de production (remontée par `logError` ou par la frontière d'erreur).
 */
export default async function AdminHealthPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");

  const report = await getHealthReport(supabase);
  const { counts } = report;

  return (
    <div className={styles.section}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Santé du site</h1>
      </div>

      {!report.databaseOk && (
        <p className={styles.error} role="alert">
          Base injoignable : {report.databaseError}
        </p>
      )}

      {report.logsError && (
        <p className={styles.notice}>
          Le journal d&apos;erreurs est indisponible ({report.logsError}).
          Appliquez la migration <code>20261007090000_error_logs.sql</code> sur
          cette instance pour activer le suivi.
        </p>
      )}

      {/* ── État ── */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Base de données</span>
          <span className={styles.cardValue}>
            {report.databaseOk ? "Connectée" : "Hors ligne"}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Temps de réponse</span>
          <span className={styles.cardValue}>
            {report.latencyMs === null ? "—" : `${report.latencyMs} ms`}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Erreurs non traitées</span>
          <span className={styles.cardValue}>{report.unresolvedErrors}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Messages non lus</span>
          <span className={styles.cardValue}>{counts.unreadMessages}</span>
        </div>
      </div>

      {/* ── Volumétrie ── */}
      <h2 className={styles.sectionTitle}>Contenus</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Réalisations publiées</span>
          <span className={styles.cardValue}>{counts.publishedProjects}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Brouillons</span>
          <span className={styles.cardValue}>{counts.draftProjects}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Services</span>
          <span className={styles.cardValue}>{counts.services}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Témoignages</span>
          <span className={styles.cardValue}>{counts.testimonials}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Questions FAQ</span>
          <span className={styles.cardValue}>{counts.faqs}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Messages reçus</span>
          <span className={styles.cardValue}>{counts.totalMessages}</span>
        </div>
      </div>

      {/* ── Erreurs récentes ── */}
      <h2 className={styles.sectionTitle}>
        Erreurs récentes{" "}
        {report.unresolvedErrors > 0 && (
          <span className={styles.badgeDraft}>
            {report.unresolvedErrors} à traiter
          </span>
        )}
      </h2>

      {report.recentErrors.length === 0 ? (
        <p className={styles.notice}>
          Aucune erreur enregistrée. Contrôle effectué le{" "}
          {dateFmt.format(new Date(report.checkedAt))}.
        </p>
      ) : (
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
              <tr key={row.id}>
                <td className={styles.orderCell}>
                  {dateFmt.format(new Date(row.created_at))}
                </td>
                <td>
                  <span
                    className={`${styles.statusPill} ${
                      styles[LEVEL_PILL[row.level] ?? "pillRead"]
                    }`}
                  >
                    {LEVEL_LABELS[row.level] ?? row.level}
                  </span>
                </td>
                <td className={styles.orderCell}>{row.source}</td>
                <td>
                  <code className={styles.code}>{row.message}</code>
                  {row.path && (
                    <span className={styles.detailMeta}> — {row.path}</span>
                  )}
                </td>
                <td className={styles.actionsCell}>
                  <form action={toggleErrorResolvedAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <input
                      type="hidden"
                      name="resolved"
                      value={row.resolved ? "0" : "1"}
                    />
                    <button type="submit" className={styles.statusBtn}>
                      {row.resolved ? "Rouvrir" : "Marquer traité"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
