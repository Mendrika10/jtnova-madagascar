import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, Eye, FileText, Send } from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getMessage,
  STATUS_LABELS,
  type StatusFilter,
} from "@/lib/admin-messages";
import { setMessageStatusAction, saveMessageNoteAction } from "../actions";
import { initialsOf, toneOf } from "../avatar";
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

/**
 * Une icône par suite possible, comme les onglets de la liste : la barre de
 * statut se lit d'un coup d'œil.
 */
const STATUS_ICONS = {
  read: Eye,
  replied: Send,
  archived: Archive,
} as const;

const NEXT_STATUSES = ["read", "replied", "archived"] as const;
const BTN_BY_STATUS: Record<string, string> = {
  read: "pillRead",
  replied: "pillReplied",
  archived: "pillArchived",
};

/**
 * S6 — Fiche d'un message, en vue « conversation » : la carte du message à
 * gauche (expéditeur, corps, provenance), une colonne d'actions à droite
 * (statut segmenté, note interne). La lecture d'un message « nouveau » le
 * passe en « lu » (F6.9) ; le changement de statut et la note interne restent
 * inchangés.
 */
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
  const pillClass =
    message.status === "new"
      ? "pillNew"
      : (BTN_BY_STATUS[message.status] ?? "pillRead");
  const tone = styles[toneOf(message.name + message.email)];
  const errorLabels: Record<string, string> = {
    invalid: "Requête invalide — la modification a été refusée.",
    save: "L'enregistrement a échoué. Merci de réessayer.",
    unavailable: "Service indisponible sur cet environnement.",
  };

  return (
    <div className={`${styles.panel} ${styles.inboxPanel}`}>
      <p className={styles.breadcrumb}>
        <Link href="/admin/messages">← Boîte de réception</Link>
      </p>

      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={`${styles.inboxAvatar} ${styles.inboxAvatarLg} ${tone}`} aria-hidden>
            {initialsOf(message.name)}
          </span>
          <span className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>{message.name}</h1>
            <p className={styles.subtitle}>
              {message.email} · reçu le{" "}
              {fullFmt.format(new Date(message.created_at))}
            </p>
          </span>
        </div>
        <a href={`mailto:${message.email}`} className={styles.primaryBtn}>
          <Send size={14} strokeWidth={2} aria-hidden />
          Répondre
        </a>
      </div>

      {flags.saved && <p className={styles.notice}>Statut mis à jour.</p>}
      {flags.noted && <p className={styles.notice}>Note enregistrée.</p>}
      {flags.error && (
        <p className={styles.fieldError}>
          {errorLabels[flags.error] ?? "Une erreur est survenue."}
        </p>
      )}

      <div className={styles.inboxDetail}>
        {/* ── Carte du message ── */}
        <article className={styles.detailCard}>
          <header className={styles.detailHead}>
            <span
              className={`${styles.inboxAvatar} ${styles.inboxAvatarLg} ${tone}`}
              aria-hidden
            >
              {initialsOf(message.name)}
            </span>
            <span className={styles.detailIdent}>
              <span className={styles.detailName}>{message.name}</span>
              <a
                href={`mailto:${message.email}`}
                className={styles.detailMail}
              >
                {message.email}
              </a>
            </span>
            <span className={styles.detailStamp}>
              <span className={`${styles.statusPill} ${styles[pillClass]}`}>
                {currentLabel}
              </span>
              <time
                className={styles.detailDate}
                dateTime={message.created_at}
              >
                {fullFmt.format(new Date(message.created_at))}
              </time>
            </span>
          </header>

          <div className={styles.detailBody}>{message.message}</div>

          <footer className={styles.detailFoot}>
            <FileText size={13} strokeWidth={2} aria-hidden />
            Reçu depuis le formulaire de contact du site
            {message.subject ? ` · ${message.subject}` : ""}
          </footer>
        </article>

        {/* ── Colonne d'actions ── */}
        <div className={styles.detailSide}>
          <section className={styles.sideCard} aria-labelledby="status-title">
            <div className={styles.sideCardHead}>
              <span className={styles.sectionIcon} aria-hidden>
                <Eye size={14} strokeWidth={2} />
              </span>
              <h2 id="status-title" className={styles.sideCardTitle}>
                Statut
              </h2>
              <span
                className={`${styles.statusPill} ${styles[pillClass]}`}
              >
                {currentLabel}
              </span>
            </div>
            <div className={styles.statusGroup} role="group" aria-label="Changer le statut">
              {NEXT_STATUSES.map((s) => {
                const Icon = STATUS_ICONS[s];
                const on = message.status === s;
                return (
                  <form key={s} action={setMessageStatusAction} className={styles.statusForm}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      className={`${styles.statusChoice} ${on ? styles.statusChoiceOn : ""}`}
                      disabled={on}
                      aria-pressed={on}
                    >
                      <Icon size={13} strokeWidth={2} aria-hidden />
                      {STATUS_LABELS[s]}
                    </button>
                  </form>
                );
              })}
            </div>
            <p className={styles.sideHint}>
              La lecture de l&apos;e-mail de notification passe le message en
              « Lu » automatiquement.
            </p>
          </section>

          <section className={styles.sideCard} aria-labelledby="notes-title">
            <div className={styles.sideCardHead}>
              <span className={styles.sectionIcon} aria-hidden>
                <FileText size={14} strokeWidth={2} />
              </span>
              <h2 id="notes-title" className={styles.sideCardTitle}>
                Note interne
              </h2>
            </div>
            <form action={saveMessageNoteAction} className={styles.form}>
              <input type="hidden" name="id" value={message.id} />
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="notes">
                  Visible par les administrateurs uniquement
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={5}
                  className={styles.textarea}
                  defaultValue={message.notes ?? ""}
                  placeholder="Contexte, suite donnée, rappel…"
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryBtn}>
                  Enregistrer la note
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
