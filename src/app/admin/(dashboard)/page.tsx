import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Folder,
  MessageSquare,
  Shield,
  Sparkles,
} from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardCounts, type DashboardCounts } from "@/lib/admin-data";
import { shouldSkipOptimizer } from "@/lib/images";
import {
  getProjectCards,
  MIN_QUERY_LENGTH,
  readScope,
  sanitizeQuery,
  searchAdmin,
  type AdminSearchResult,
} from "./admin-search";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Tableau de bord | Administration Jtnova",
  robots: { index: false, follow: false },
};

const EMPTY: DashboardCounts = {
  publishedProjects: 0,
  draftProjects: 0,
  unreadMessages: 0,
  unresolvedErrors: 0,
};

/** Les deux portées du composer (mêmes formes que les pastilles « Fichiers / Projet »). */
const SCOPE_CHIPS = [
  { scope: "projets" as const, label: "Réalisations", Icon: Folder },
  { scope: "messages" as const, label: "Messages", Icon: MessageSquare },
];

const SHORTCUTS = [
  {
    href: "/admin/realisations",
    label: "Réalisations",
    Icon: Folder,
  },
  {
    href: "/admin/personnalisation",
    label: "Personnalisation",
    Icon: Sparkles,
  },
  {
    href: "/admin/messages",
    label: "Messages",
    Icon: MessageSquare,
  },
  {
    href: "/admin/sante",
    label: "Santé",
    Icon: Shield,
  },
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = sanitizeQuery(rawQuery);
  const scope = readScope(params.scope);

  const supabase = await createSupabaseServerClient();
  const counts = supabase ? await getDashboardCounts(supabase) : EMPTY;

  const results: AdminSearchResult[] =
    supabase && query.length >= MIN_QUERY_LENGTH
      ? await searchAdmin(supabase, query, scope)
      : [];
  const cards = supabase ? await getProjectCards(supabase) : [];

  const stats = [
    { label: "Réalisations publiées", value: counts.publishedProjects },
    { label: "Brouillons", value: counts.draftProjects },
    { label: "Messages non lus", value: counts.unreadMessages },
    { label: "Erreurs à traiter", value: counts.unresolvedErrors },
  ];

  const searched = query.length >= MIN_QUERY_LENGTH;

  return (
    <div className={styles.panel}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Pilotez avec
          <span className={styles.heroLogo}>
            <Image
              src="/images/logo.png"
              alt="Jtnova"
              width={732}
              height={231}
              sizes="160px"
              priority
            />
          </span>
        </h1>
        <p className={styles.heroSub}>
          Vos réalisations, vos textes et vos messages — depuis un seul endroit.
        </p>
      </header>

      <form className={styles.composer} action="/admin" method="get" role="search">
        <div className={styles.composerHead}>
          <span className={styles.composerFaces} aria-hidden>
            {SHORTCUTS.map(({ href, Icon }) => (
              <span key={href} className={styles.composerFace}>
                <Icon size={13} strokeWidth={2.2} />
              </span>
            ))}
          </span>
          <p className={styles.composerNote}>
            Recherche dans les réalisations et les messages reçus
          </p>
        </div>

        <label className={styles.srOnly} htmlFor="admin-search">
          Rechercher une réalisation ou un message
        </label>
        <input
          id="admin-search"
          name="q"
          type="search"
          defaultValue={rawQuery}
          className={styles.composerInput}
          placeholder="Rechercher une réalisation, un message…"
          autoComplete="off"
        />

        <div className={styles.composerBar}>
          <div className={styles.composerChips}>
            {SCOPE_CHIPS.map(({ scope: value, label, Icon }) => (
              <button
                key={value}
                type="submit"
                className={styles.composerChip}
                name="scope"
                value={value}
                data-on={scope === value ? "true" : undefined}
              >
                <Icon size={14} strokeWidth={2} aria-hidden />
                {label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className={styles.composerAsk}
            data-empty={searched ? undefined : "true"}
          >
            Rechercher
            <ChevronRight size={14} strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </form>

      {searched ? (
        <section className={styles.results} aria-live="polite">
          <p className={styles.resultsCount}>
            {results.length === 0
              ? `Aucun résultat pour « ${query} ».`
              : `${results.length} résultat${results.length > 1 ? "s" : ""} pour « ${query} »`}
          </p>
          {results.length > 0 ? (
            <ul className={styles.resultList}>
              {results.map((result) => (
                <li key={`${result.kind}-${result.id}`}>
                  <Link href={result.href} className={styles.result}>
                    <span className={styles.resultIcon} aria-hidden>
                      {result.kind === "projet" ? (
                        <Folder size={15} strokeWidth={2} />
                      ) : (
                        <MessageSquare size={15} strokeWidth={2} />
                      )}
                    </span>
                    <span className={styles.resultBody}>
                      <span className={styles.resultTitle}>{result.title}</span>
                      <span className={styles.resultDetail}>{result.detail}</span>
                    </span>
                    <span className={styles.resultStamp}>{result.stamp}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : (
        <>
          <ul className={styles.pills}>
            {stats.map((stat) => (
              <li key={stat.label} className={styles.pill}>
                <span className={styles.pillValue}>{stat.value}</span>
                <span className={styles.pillLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>

          <ul className={styles.pills}>
            {SHORTCUTS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} className={styles.pillLink}>
                  <span className={styles.pillIcon} aria-hidden>
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  <span className={styles.pillLabel}>{label}</span>
                  <span className={styles.pillChevron} aria-hidden>
                    <ChevronRight size={13} strokeWidth={2} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <section className={styles.projects}>
        <h2 className={styles.projectsTitle}>Réalisations publiées</h2>
        {cards.length === 0 ? (
          <p className={styles.projectsEmpty}>
            Aucune réalisation publiée pour l&apos;instant.
          </p>
        ) : (
          <ul className={styles.cardGrid}>
            {cards.map((card) => (
              <li key={card.id}>
                <Link
                  href={`/admin/realisations/${card.id}`}
                  className={styles.cardTile}
                >
                  <span className={styles.cardMedia}>
                    {card.image ? (
                      <Image
                        src={card.image}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 45vw, 260px"
                        className={styles.cardImage}
                        unoptimized={shouldSkipOptimizer(card.image)}
                      />
                    ) : (
                      <span className={styles.cardFallback} aria-hidden>
                        {card.title.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <span className={styles.cardBand}>
                    <span className={styles.cardName}>{card.title}</span>
                    <span className={styles.cardRole}>{card.subtitle}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
