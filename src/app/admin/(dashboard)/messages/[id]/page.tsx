import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getMessage,
  STATUS_LABELS,
  type StatusFilter,
} from "@/lib/admin-messages";
import { setMessageStatusAction, saveMessageNoteAction } from "../actions";
import styles from "../../../admin.module.css";

export const metadata: Metadata = {
  title: "Message | Administration Jtnova",
  robots: { index: false, follow: false },
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fullFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "full",
  timeStyle: "medium",
});

const NEXT_STATUSES = ["read", "replied", "archived"] as const;
const BTN_BY_STATUS: Record<string, string> = {
  read: "pillRead",
  replied: "pillReplied",
  archived: "pillArchived",
};

export default async function MessageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; noted?: string; error?: string }>;
}) {
  const { id } = await params;
  const flags = await searchParams;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const message = await getMessage(supabase, id);
  if (!message) notFound();

  // F6.9 — la première visite d'un message « nouveau » le passe en « lu »
  // (persisté) : le badge de la navigation décrémente. Aucun revalidatePath
  // ici (interdit pendant le rendu) : la navigation suivante reflète l'état.
  if (message.status === "new") {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: "read" })
      .eq("id", id);
    if (error) {
      console.error("[messages] passage en lu :", error.message);
    } else {
      message.status = "read";
    }
  }

  const currentLabel =
    STATUS_LABELS[message.status as StatusFilter] ?? message.status;
  const errorLabels: Record<string, string> = {
    invalid: "Requête invalide — la modification a été refusée.",
    save: "L'enregistrement a échoué. Merci de réessayer.",
    unavailable: "Service indisponible sur cet environnement.",
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <Link href="/admin/messages" className={styles.breadcrumb}>
          ← Boîte de réception
        </Link>
      </div>
      <h1 className={styles.pageTitle}>Message de {message.name}</h1>

      {flags.saved && <p className={styles.notice}>Statut mis à jour.</p>}
      {flags.noted && <p className={styles.notice}>Note enregistrée.</p>}
      {flags.error && (
        <p className={styles.fieldError}>
          {errorLabels[flags.error] ?? "Une erreur est survenue."}
        </p>
      )}

      <div className={styles.detailCard}>
        <dl className={styles.detailMeta}>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>De</dt>
            <dd>{message.name}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>E-mail</dt>
            <dd>
              <a href={`mailto:${message.email}`} className={styles.linkBtn}>
                {message.email}
              </a>
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Reçu le</dt>
            <dd>{fullFmt.format(new Date(message.created_at))}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Statut</dt>
            <dd>
              <span
                className={`${styles.statusPill} ${styles[message.status === "new" ? "pillNew" : (BTN_BY_STATUS[message.status] ?? "pillRead")]}`}
              >
                {currentLabel}
              </span>
            </dd>
          </div>
        </dl>
        <div className={styles.detailBody}>{message.message}</div>
      </div>

      <section className={styles.section} aria-labelledby="status-title">
        <h2 id="status-title" className={styles.sectionTitle}>
          Changer le statut
        </h2>
        <div className={styles.statusActions}>
          {NEXT_STATUSES.map((s) => (
            <form key={s} action={setMessageStatusAction}>
              <input type="hidden" name="id" value={message.id} />
              <input type="hidden" name="status" value={s} />
              <button
                type="submit"
                className={styles.statusBtn}
                disabled={message.status === s}
              >
                {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="notes-title">
        <h2 id="notes-title" className={styles.sectionTitle}>
          Note interne
        </h2>
        <form action={saveMessageNoteAction} className={styles.form}>
          <input type="hidden" name="id" value={message.id} />
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="notes">
              Note interne (visible par les administrateurs uniquement)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              className={styles.textarea}
              defaultValue={message.notes ?? ""}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn}>
              Enregistrer la note
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
