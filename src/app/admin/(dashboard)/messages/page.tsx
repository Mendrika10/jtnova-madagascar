import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Inbox,
  Mail,
  MessageSquare,
  Search,
  Send,
} from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getInbox,
  getStatusCounts,
  parseStatusFilter,
  STATUS_LABELS,
  type ContactMessage,
  type StatusFilter,
} from "@/lib/admin-messages";
import { MESSAGE_STATUSES } from "@/lib/validation";
import { syncContactReadStatuses } from "@/lib/mail-sync";
import { initialsOf, toneOf } from "./avatar";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Messages | Administration Jtnova",
  robots: { index: false, follow: false },
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const PILL_BY_STATUS: Record<string, string> = {
  new: "pillNew",
  read: "pillRead",
  replied: "pillReplied",
  archived: "pillArchived",
};

/**
 * Une icône par filtre, comme les onglets des réalisations et de
 * Personnalisation : la barre se lit d'un coup d'œil sans perdre de place.
 */
const TAB_ICONS: Record<StatusFilter, typeof Mail> = {
  all: MessageSquare,
  new: Mail,
  read: Eye,
  replied: Send,
  archived: Archive,
};

function excerpt(message: string): string {
  const line = message.replace(/\s+/g, " ").trim();
  return line.length > 110 ? `${line.slice(0, 110)}…` : line;
}

function buildHref({ status, q }: { status: StatusFilter; q: string }): string {
  const sp = new URLSearchParams();
  if (status !== "all") sp.set("status", status);
  if (q) sp.set("q", q);
  const qs = sp.toString();
  return qs ? `/admin/messages?${qs}` : "/admin/messages";
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status as StatusFilter] ?? status;
}

/** « 3 messages » : accord du mot sans alourdir le JSX. */
function plural(count: number, word: string, suffix = "s"): string {
  return `${count} ${word}${count > 1 ? suffix : ""}`;
}

/**
 * S6 — Boîte de réception : les demandes reçues par le formulaire de contact,
 * filtrées par statut et par recherche plein texte. Chaque ligne est une
 * « conversation » : pastille d'initiales colorée, expéditeur, extrait du
 * message, pastille de statut, date — avec le message non lu mis en évidence
 * (nom en gras, point bleu, fond teinté) et un repère quand une note interne
 * existe déjà.
 */
export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = parseStatusFilter(params.status);
  const q = params.q ?? "";

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className={`${styles.panel} ${styles.inboxPanel}`}>
        <div className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <span className={styles.titleIcon} aria-hidden>
              <Inbox size={18} strokeWidth={2} />
            </span>
            <span className={styles.titleBlock}>
              <h1 className={styles.pageTitle}>Messages</h1>
              <p className={styles.subtitle}>Configuration requise</p>
            </span>
          </div>
        </div>
        <p className={styles.placeholder}>
          Supabase n&apos;est pas configuré sur cet environnement.
        </p>
      </div>
    );
  }

  // S8 — la boîte mail fait foi : on aligne les statuts **avant** de lire la
  // liste et les compteurs, pour que l'affichage soit juste du premier coup.
  await syncContactReadStatuses(supabase);

  const [rows, counts] = await Promise.all([
    getInbox(supabase, { status, q }),
    getStatusCounts(supabase),
  ]);

  const tabs: StatusFilter[] = ["all", ...MESSAGE_STATUSES];
  const filtered = status !== "all" || q !== "";

  return (
    <div className={`${styles.panel} ${styles.inboxPanel}`}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <Inbox size={18} strokeWidth={2} />
          </span>
          <span className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>Messages</h1>
            <p className={styles.subtitle}>
              {plural(counts.all, "message")} ·{" "}
              {plural(counts.new, "nouveau", "x")} · {counts.replied} réponse
              {counts.replied > 1 ? "s" : ""} ·{" "}
              {q
                ? `recherche « ${q} »`
                : "boîte synchronisée avec l’e-mail"}
            </p>
          </span>
        </div>
        <div className={styles.inboxTools}>
          <form
            method="get"
            action="/admin/messages"
            className={styles.searchForm}
            role="search"
          >
            {status !== "all" && (
              <input type="hidden" name="status" value={status} />
            )}
            <span className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden>
                <Search size={14} strokeWidth={2} />
              </span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Rechercher (nom, e-mail, message…)"
                className={styles.searchInput}
                aria-label="Rechercher un message"
              />
            </span>
            <button type="submit" className={styles.secondaryBtn}>
              Rechercher
            </button>
          </form>
          <Link
            href="/admin/messages/export"
            prefetch={false}
            className={styles.secondaryBtn}
          >
            <Download size={14} strokeWidth={2} aria-hidden />
            Exporter CSV
          </Link>
        </div>
      </div>

      <nav
        className={`${styles.tabs} ${styles.segmentedTabs}`}
        aria-label="Filtrer par statut"
      >
        {tabs.map((t) => {
          const Icon = TAB_ICONS[t];
          return (
            <Link
              key={t}
              href={buildHref({ status: t, q })}
              className={`${styles.tab} ${t === status ? styles.tabActive : ""}`}
              aria-current={t === status ? "true" : undefined}
            >
              <Icon size={14} strokeWidth={2} aria-hidden />
              {STATUS_LABELS[t]}
              <span className={styles.inboxCount}>{counts[t]}</span>
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden>
            <Inbox size={22} strokeWidth={1.8} />
          </span>
          <p className={styles.emptyTitle}>
            {filtered ? "Aucun message trouvé" : "La boîte est vide"}
          </p>
          <p className={styles.emptyText}>
            {q
              ? `Aucun message ne correspond à « ${q} »`
              : "Les demandes reçues depuis le formulaire de contact apparaîtront ici"}
            {status !== "all"
              ? ` avec le statut « ${statusLabel(status)} »`
              : ""}
            .
          </p>
          {filtered && (
            <Link href="/admin/messages" className={styles.secondaryBtn}>
              Réinitialiser les filtres
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.messageCard}>
          <p className={styles.messageHead}>
            <span className={styles.messageHeadLabel}>
              <Inbox size={13} strokeWidth={2} aria-hidden />
              {plural(rows.length, "message")}
              {filtered
                ? " filtré" + (rows.length > 1 ? "s" : "")
                : " affiché" + (rows.length > 1 ? "s" : "")}
            </span>
            <span className={styles.messageHeadCols} aria-hidden>
              <span className={styles.inboxStatusCol}>Statut</span>
              <span className={styles.inboxDateCol}>Reçu le</span>
              <span className={styles.inboxChevronSpacer} />
            </span>
          </p>
          <div className={styles.inboxList}>
            {rows.map((m: ContactMessage) => {
              const unread = m.status === "new";
              const hasNote = Boolean(m.notes?.trim());
              const tone = styles[toneOf(m.name + m.email)];
              return (
                <Link
                  key={m.id}
                  href={`/admin/messages/${m.id}`}
                  className={`${styles.inboxRow} ${unread ? styles.inboxRowNew : ""}`}
                >
                  <span
                    className={`${styles.inboxAvatar} ${tone}`}
                    aria-hidden
                  >
                    {initialsOf(m.name)}
                  </span>
                  <span className={styles.inboxMain}>
                    <span className={styles.inboxLine1}>
                      {unread && (
                        <span className={styles.inboxDot} aria-hidden />
                      )}
                      <span className={styles.inboxName}>{m.name}</span>
                      <span className={styles.inboxEmail}>{m.email}</span>
                      {hasNote && (
                        <span className={styles.inboxNote}>
                          <FileText size={10} strokeWidth={2.4} aria-hidden />
                          Note
                        </span>
                      )}
                    </span>
                    <span className={styles.inboxSnippet}>
                      {excerpt(m.message)}
                    </span>
                  </span>
                  <span className={styles.inboxStatusCol}>
                    <span
                      className={`${styles.statusPill} ${styles[PILL_BY_STATUS[m.status] ?? "pillRead"]}`}
                    >
                      {statusLabel(m.status)}
                    </span>
                  </span>
                  <time
                    className={`${styles.inboxDateCol} ${styles.inboxDate}`}
                    dateTime={m.created_at}
                  >
                    {dateFmt.format(new Date(m.created_at))}
                  </time>
                  <ChevronRight
                    className={styles.inboxChevron}
                    size={16}
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
