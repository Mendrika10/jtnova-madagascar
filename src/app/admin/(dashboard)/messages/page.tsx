import type { Metadata } from "next";
import Link from "next/link";
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

function excerpt(message: string): string {
  const line = message.replace(/\s+/g, " ").trim();
  return line.length > 90 ? `${line.slice(0, 90)}…` : line;
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
      <>
        <h1 className={styles.pageTitle}>Messages</h1>
        <p className={styles.placeholder}>
          Supabase n&apos;est pas configuré sur cet environnement.
        </p>
      </>
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

  return (
    <>
      <h1 className={styles.pageTitle}>Messages</h1>

      <div className={styles.inboxToolbar}>
        <nav className={styles.tabs} aria-label="Filtrer par statut">
          {tabs.map((t) => (
            <Link
              key={t}
              href={buildHref({ status: t, q })}
              className={`${styles.tab} ${t === status ? styles.tabActive : ""}`}
            >
              {STATUS_LABELS[t]}
              <span className={styles.tabCount}>{counts[t]}</span>
            </Link>
          ))}
        </nav>
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
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher (nom, e-mail, message…)"
              className={styles.searchInput}
              aria-label="Rechercher un message"
            />
            <button type="submit" className={styles.secondaryBtn}>
              Rechercher
            </button>
          </form>
          <Link href="/admin/messages/export" prefetch={false} className={styles.secondaryBtn}>
            Exporter CSV
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className={styles.placeholder}>
          Aucun message{q ? ` pour « ${q} »` : ""}
          {status !== "all" ? ` avec le statut « ${statusLabel(status)} »` : ""}.
        </p>
      ) : (
        <div className={styles.inboxList}>
          {rows.map((m: ContactMessage) => (
            <Link
              key={m.id}
              href={`/admin/messages/${m.id}`}
              className={styles.inboxRow}
            >
              <div className={styles.inboxMain}>
                <span className={styles.inboxName}>{m.name}</span>
                <span className={styles.inboxEmail}>{m.email}</span>
                <span className={styles.inboxSnippet}>{excerpt(m.message)}</span>
              </div>
              <div className={styles.inboxSide}>
                <span
                  className={`${styles.statusPill} ${styles[PILL_BY_STATUS[m.status] ?? "pillRead"]}`}
                >
                  {statusLabel(m.status)}
                </span>
                <time dateTime={m.created_at}>
                  {dateFmt.format(new Date(m.created_at))}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
