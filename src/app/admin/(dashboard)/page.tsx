import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart2,
  ChevronRight,
  Clock,
  FileText,
  Folder,
  Inbox,
  PieChart,
  Search,
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
} from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardCounts, type DashboardCounts } from "@/lib/admin-data";
import { shouldSkipOptimizer } from "@/lib/images";
import { initialsOf, toneOf } from "./messages/avatar";
import ProjectSlider from "./ProjectSlider";
import {
  getMessageFlow,
  getRecentErrors,
  getRecentMessages,
  getRecentUpdates,
  pingDatabase,
  relativeTime,
  type MessageFlow,
  type RecentError,
  type RecentMessage,
  type RecentUpdate,
} from "./dashboard-data";
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

const EMPTY_FLOW: MessageFlow = {
  days: [],
  total: 0,
  thisWeek: 0,
  lastWeek: 0,
  delta: 0,
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Portées du composer (mêmes formes que la barre latérale). */
const SCOPE_CHIPS = [
  { scope: "projets" as const, label: "Réalisations", Icon: Folder },
  { scope: "messages" as const, label: "Messages", Icon: Inbox },
];

/** Pastilles de statut des messages (variantes claires du panneau). */
const STATUS_PILL: Record<string, string> = {
  new: "pillNew",
  read: "pillRead",
  replied: "pillReplied",
  archived: "pillArchived",
};

const STATUS_TEXT: Record<string, string> = {
  new: "Nouveau",
  read: "Lu",
  replied: "Répondu",
  archived: "Archivé",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = sanitizeQuery(rawQuery);
  const scope = readScope(params.scope);
  const searched = query.length >= MIN_QUERY_LENGTH;

  const supabase = await createSupabaseServerClient();
  const counts = supabase ? await getDashboardCounts(supabase) : EMPTY;

  const results: AdminSearchResult[] =
    supabase && searched ? await searchAdmin(supabase, query, scope) : [];

  const [flow, recent, errors, updates, latency, cards]: [
    MessageFlow,
    RecentMessage[],
    { rows: RecentError[]; available: boolean },
    RecentUpdate[],
    number | null,
    Awaited<ReturnType<typeof getProjectCards>>,
  ] = supabase
    ? await Promise.all([
        getMessageFlow(supabase),
        getRecentMessages(supabase),
        getRecentErrors(supabase),
        getRecentUpdates(supabase),
        pingDatabase(supabase),
        getProjectCards(supabase, 50),
      ])
    : [EMPTY_FLOW, [], { rows: [], available: false }, [], null, []];

  const now = new Date();
  const totalProjects = counts.publishedProjects + counts.draftProjects;
  const publishedShare =
    totalProjects > 0
      ? Math.round((counts.publishedProjects / totalProjects) * 100)
      : 0;
  const peak = Math.max(1, ...flow.days.map((day) => day.count));
  const draftShare = totalProjects > 0 ? 100 - publishedShare : 0;
  const todayKey = flow.days.at(-1)?.key ?? "";
  const lastError = errors.rows[0];

  // Tracé de l'aire des demandes. La vue SVG est étirée (`preserveAspectRatio`
  // désactivé) : le trait garde son épaisseur grâce à `vector-effect`, et les
  // points sont posés en HTML pour rester parfaitement ronds.
  const chartW = 640;
  const chartH = 180;
  const padY = 18;
  const stepX = flow.days.length > 1 ? chartW / (flow.days.length - 1) : chartW;
  const points = flow.days.map((day, index) => ({
    key: day.key,
    label: day.label,
    count: day.count,
    x: index * stepX,
    y: chartH - padY - (day.count / peak) * (chartH - padY * 2),
  }));
  const curve = points.reduce((path, point, index) => {
    if (index === 0) return `M${point.x} ${point.y}`;
    const previous = points[index - 1]!;
    const midX = (previous.x + point.x) / 2;
    return `${path} C${midX} ${previous.y} ${midX} ${point.y} ${point.x} ${point.y}`;
  }, "");
  const areaPath = `${curve} L${chartW} ${chartH} L0 ${chartH} Z`;

  const kpis = [
    {
      href: "/admin/realisations",
      Icon: Folder,
      label: "Réalisations publiées",
      value: counts.publishedProjects,
      unit: null as string | null,
      note:
        counts.draftProjects > 0
          ? `${counts.draftProjects} brouillon${counts.draftProjects > 1 ? "s" : ""} à finir`
          : "Aucun brouillon en attente",
      tone: "kpiIconNeutral",
      delta: null as number | null,
      spark: false,
    },
    {
      href: "/admin/messages",
      Icon: Inbox,
      label: "Messages non lus",
      value: counts.unreadMessages,
      unit: null as string | null,
      note: `${flow.thisWeek} reçu${flow.thisWeek > 1 ? "s" : ""} ces 7 derniers jours`,
      tone: counts.unreadMessages > 0 ? "kpiIconInfo" : "kpiIconOk",
      delta: flow.delta,
      spark: true,
    },
    {
      href: "/admin/sante#journal",
      Icon: Shield,
      label: "Erreurs à traiter",
      value: counts.unresolvedErrors,
      unit: null as string | null,
      note: errors.available
        ? lastError
          ? `Dernière entrée ${relativeTime(lastError.createdAt, now)}`
          : "Journal sans incident"
        : "Journal indisponible",
      tone: counts.unresolvedErrors > 0 ? "kpiIconBad" : "kpiIconOk",
      delta: null as number | null,
      spark: false,
    },
    {
      href: "/admin/sante",
      Icon: Zap,
      label: "Réponse de la base",
      value: latency === null ? "—" : latency,
      unit: latency === null ? null : "ms",
      note:
        latency === null
          ? "Requête de contrôle échouée"
          : latency < 200
            ? "Réactif — sous 200 ms"
            : "Ralenti — au-dessus de 200 ms",
      tone: latency === null ? "kpiIconBad" : "kpiIconOk",
      delta: null as number | null,
      spark: false,
    },
  ];

  return (
    <div className={styles.panel}>
      <header className={styles.dashHead}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <BarChart2 size={18} strokeWidth={2} />
          </span>
          <span className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>Tableau de bord</h1>
            <p className={styles.subtitle}>
              {dateFmt.format(now)} ·              {totalProjects} réalisation
              {totalProjects === 1 ? "" : "s"} · {counts.unreadMessages} message
              {counts.unreadMessages === 1 ? "" : "s"} non lu
              {counts.unreadMessages === 1 ? "" : "s"} ·{" "}
              {counts.unresolvedErrors} erreur
              {counts.unresolvedErrors === 1 ? "" : "s"} à traiter
            </p>
          </span>
        </div>

        <form
          className={styles.dashSearch}
          action="/admin"
          method="get"
          role="search"
        >
          <span className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              <Search size={14} strokeWidth={2} />
            </span>
            <label className={styles.srOnly} htmlFor="admin-search">
              Rechercher une réalisation ou un message
            </label>
            <input
              id="admin-search"
              name="q"
              type="search"
              defaultValue={rawQuery}
              className={styles.searchInput}
              placeholder="Rechercher une réalisation, un message…"
              autoComplete="off"
            />
          </span>
          <span className={styles.dashScope}>
            {SCOPE_CHIPS.map(({ scope: value, label, Icon }) => (
              <button
                key={value}
                type="submit"
                name="scope"
                value={value}
                className={styles.dashScopeChip}
                data-on={scope === value ? "true" : undefined}
                aria-pressed={scope === value}
              >
                <Icon size={13} strokeWidth={2} aria-hidden />
                {label}
              </button>
            ))}
          </span>
          <button type="submit" className={styles.dashSearchGo}>
            Rechercher
            <ChevronRight size={14} strokeWidth={2.2} aria-hidden />
          </button>
        </form>
      </header>

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
                        <Inbox size={15} strokeWidth={2} />
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
          <p>
            <Link href="/admin" className={styles.secondaryBtn}>
              Revenir à la vue d&apos;ensemble
            </Link>
          </p>
        </section>
      ) : (
        <>
          {/* ── Indicateurs clés ── */}
          <ul className={styles.kpiGrid}>
            {kpis.map(
              ({ href, Icon, label, value, unit, note, tone, delta, spark }) => (
                <li key={label}>
                  <Link href={href} className={styles.kpi}>
                    <span className={styles.kpiTop}>
                      <span
                        className={`${styles.kpiIcon} ${styles[tone]}`}
                        aria-hidden
                      >
                        <Icon size={14} strokeWidth={2} />
                      </span>
                      <span className={styles.kpiLabel}>{label}</span>
                      {delta !== null && delta !== 0 ? (
                        <span
                          className={`${styles.kpiDelta} ${
                            delta > 0 ? styles.kpiDeltaUp : styles.kpiDeltaDown
                          }`}
                        >
                          {delta > 0 ? (
                            <TrendingUp size={12} strokeWidth={2.2} aria-hidden />
                          ) : (
                            <TrendingDown
                              size={12}
                              strokeWidth={2.2}
                              aria-hidden
                            />
                          )}
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.kpiValueRow}>
                      <span className={styles.kpiValue}>{value}</span>
                      {unit ? <span className={styles.kpiUnit}>{unit}</span> : null}
                    </span>
                    {spark && flow.days.length > 0 ? (
                      <span className={styles.kpiSpark} aria-hidden>
                        {flow.days.map((day) => (
                          <span
                            key={day.key}
                            className={styles.kpiSparkBar}
                            style={{
                              height: `${Math.max(12, Math.round((day.count / peak) * 100))}%`,
                            }}
                          />
                        ))}
                      </span>
                    ) : null}
                    <span className={styles.kpiNote}>{note}</span>
                  </Link>
                </li>
              ),
            )}
          </ul>

          {/* ── Rythme des demandes + répartition des contenus ── */}
          <div className={styles.dashRow}>
            <section className={styles.dashCard}>
              <div className={styles.dashCardHead}>
                <span className={styles.sectionIcon} aria-hidden>
                  <BarChart2 size={14} strokeWidth={2} />
                </span>
                <h2 className={styles.dashCardTitle}>Demandes reçues</h2>
                <span className={styles.dashCardMeta}>
                  14 derniers jours · {flow.total} message
                  {flow.total > 1 ? "s" : ""}
                </span>
              </div>
              <div className={styles.flowArea}>
                <svg
                  className={styles.flowAreaSvg}
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`${flow.total} message(s) reçu(s) sur les 14 derniers jours, ${flow.thisWeek} cette semaine`}
                >
                  <defs>
                    <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.34" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="flowStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#4338ca" />
                    </linearGradient>
                  </defs>
                  <g className={styles.flowGrid} aria-hidden>
                    <line x1="0" y1={padY} x2={chartW} y2={padY} />
                    <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} />
                    <line x1="0" y1={chartH - padY} x2={chartW} y2={chartH - padY} />
                  </g>
                  <path d={areaPath} fill="url(#flowFill)" />
                  <path
                    className={styles.flowLine}
                    d={curve}
                    fill="none"
                    stroke="url(#flowStroke)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                {points.map((point) =>
                  point.count > 0 || point.key === todayKey ? (
                    <span
                      key={point.key}
                      className={`${styles.flowDot} ${
                        point.key === todayKey ? styles.flowDotToday : ""
                      }`}
                      style={{
                        left: `${(point.x / chartW) * 100}%`,
                        top: `${(point.y / chartH) * 100}%`,
                      }}
                      title={`${point.label} : ${point.count} message${point.count > 1 ? "s" : ""}`}
                    />
                  ) : null,
                )}
              </div>
              <div className={styles.flowAxis} aria-hidden>
                {flow.days.map((day, index) => (
                  <span key={day.key} className={styles.flowAxisTick}>
                    {index % 2 === 1 ? day.weekday : ""}
                  </span>
                ))}
              </div>
              <p className={styles.flowFoot}>
                <span className={styles.flowStat}>
                  <b>{flow.thisWeek}</b> cette semaine
                </span>
                <span className={styles.flowStat}>
                  <b>{flow.lastWeek}</b> la semaine passée
                </span>
                <span
                  className={`${styles.flowTrend} ${
                    flow.delta > 0
                      ? styles.flowTrendUp
                      : flow.delta < 0
                        ? styles.flowTrendDown
                        : ""
                  }`}
                >
                  {flow.delta > 0
                    ? `+${flow.delta} de rythme`
                    : flow.delta < 0
                      ? `${flow.delta} de rythme`
                      : "rythme stable"}
                </span>
              </p>
            </section>

            <section className={`${styles.dashCard} ${styles.dashCardTinted}`}>
              <div className={styles.dashCardHead}>
                <span
                  className={`${styles.sectionIcon} ${styles.sectionIconTint}`}
                  aria-hidden
                >
                  <PieChart size={14} strokeWidth={2} />
                </span>
                <h2 className={styles.dashCardTitle}>Contenus du site</h2>
                <span className={styles.dashCardShare}>{publishedShare} % publié</span>
              </div>
              <div className={styles.mixRow}>
                <span
                  className={styles.mixDonut}
                  style={{
                    backgroundImage: `conic-gradient(from -90deg, #4f46e5 0 ${publishedShare}%, #fbbf24 ${publishedShare}% 100%)`,
                  }}
                  role="img"
                  aria-label={`${counts.publishedProjects} réalisations publiées sur ${totalProjects}, soit ${publishedShare} %`}
                >
                  <span className={styles.mixCenter}>
                    <span className={styles.mixValue}>{totalProjects}</span>
                    <span className={styles.mixCaption}>
                      réalisation{totalProjects > 1 ? "s" : ""}
                    </span>
                  </span>
                </span>
                <ul className={styles.mixLegend}>
                  <li className={`${styles.mixLegendRow} ${styles.mixLegendPub}`}>
                    <span className={styles.mixSwatch} aria-hidden />
                    <span className={styles.mixLegendLabel}>Publiées</span>
                    <b>{counts.publishedProjects}</b>
                    <span className={styles.mixShare}>{publishedShare} %</span>
                  </li>
                  <li className={`${styles.mixLegendRow} ${styles.mixLegendDraft}`}>
                    <span className={`${styles.mixSwatch} ${styles.mixSwatchDraft}`} aria-hidden />
                    <span className={styles.mixLegendLabel}>Brouillons</span>
                    <b>{counts.draftProjects}</b>
                    <span className={styles.mixShare}>{draftShare} %</span>
                  </li>
                </ul>
              </div>
              <p className={styles.mixFoot}>
                Le site public sert les {counts.publishedProjects} réalisation
                {counts.publishedProjects > 1 ? "s" : ""} publiée
                {counts.publishedProjects > 1 ? "s" : ""} ; les brouillons
                restent invisibles.
              </p>
            </section>
          </div>

          {/* ── Réalisations publiées : diaporama horizontal, à la largeur de
              la colonne des derniers messages, juste au-dessus de lui ── */}
          <div className={styles.dashRow}>
            <div className={styles.dashStack}>
              <section className={styles.dashCard}>
                <div className={styles.dashCardHead}>
                  <span className={styles.sectionIcon} aria-hidden>
                    <Folder size={14} strokeWidth={2} />
                  </span>
                  <h2 className={styles.dashCardTitle}>Réalisations publiées</h2>
                  <span className={styles.dashCardTools}>
                    <span className={styles.dashCardCount}>
                      {cards.length} en ligne
                    </span>
                    <Link href="/admin/realisations" className={styles.dashCardLink}>
                      Toutes les réalisations
                      <ChevronRight size={13} strokeWidth={2} aria-hidden />
                    </Link>
                  </span>
                </div>
                {cards.length === 0 ? (
                  <p className={styles.feedEmpty}>
                    Aucune réalisation publiée pour l&apos;instant.
                  </p>
                ) : (
                  <ProjectSlider label="Réalisations publiées">
                    {cards.map((card) => (
                      <li key={card.id} className={styles.sliderCard}>
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
                                sizes="(max-width: 640px) 240px, 420px"
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
                  </ProjectSlider>
                )}
              </section>

              {/* ── Derniers messages + dernières modifications ── */}
              <section className={styles.dashCard}>
                <div className={styles.dashCardHead}>
                  <span className={styles.sectionIcon} aria-hidden>
                    <Inbox size={14} strokeWidth={2} />
                  </span>
                  <h2 className={styles.dashCardTitle}>Derniers messages</h2>
                  <Link href="/admin/messages" className={styles.dashCardLink}>
                    Boîte de réception
                    <ChevronRight size={13} strokeWidth={2} aria-hidden />
                  </Link>
                </div>
                {recent.length === 0 ? (
                  <p className={styles.feedEmpty}>
                    Aucun message reçu pour l&apos;instant.
                  </p>
                ) : (
                  <ul className={styles.feed}>
                    {recent.map((message) => (
                      <li key={message.id}>
                        <Link
                          href={`/admin/messages/${message.id}`}
                          className={styles.feedRow}
                        >
                          <span
                            className={`${styles.inboxAvatar} ${styles[toneOf(`${message.name}${message.email}`)]}`}
                            aria-hidden
                          >
                            {initialsOf(message.name)}
                          </span>
                          <span className={styles.feedBody}>
                            <span className={styles.feedTitle}>
                              {message.subject || message.name}
                            </span>
                            <span className={styles.feedSub}>
                              {message.name} · {message.email}
                            </span>
                          </span>
                          <span className={styles.feedEnd}>
                            <span
                              className={`${styles.statusPill} ${
                                styles[STATUS_PILL[message.status] ?? "pillRead"]
                              }`}
                            >
                              {STATUS_TEXT[message.status] ?? message.status}
                            </span>
                            <span className={styles.feedStamp}>
                              {relativeTime(message.createdAt, now)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className={styles.dashCard}>
              <div className={styles.dashCardHead}>
                <span className={styles.sectionIcon} aria-hidden>
                  <Clock size={14} strokeWidth={2} />
                </span>
                <h2 className={styles.dashCardTitle}>Dernières modifications</h2>
                <Link href="/admin/realisations" className={styles.dashCardLink}>
                  Réalisations
                  <ChevronRight size={13} strokeWidth={2} aria-hidden />
                </Link>
              </div>

              {updates.length === 0 ? (
                <p className={styles.feedEmpty}>Aucune réalisation enregistrée.</p>
              ) : (
                <ul className={styles.feed}>
                  {updates.map((update) => (
                    <li key={update.id}>
                      <Link
                        href={`/admin/realisations/${update.id}`}
                        className={styles.feedRow}
                      >
                        <span
                          className={`${styles.feedIcon} ${
                            update.published
                              ? styles.feedIconOk
                              : styles.feedIconDraft
                          }`}
                          aria-hidden
                        >
                          {update.published ? (
                            <Folder size={13} strokeWidth={2} />
                          ) : (
                            <FileText size={13} strokeWidth={2} />
                          )}
                        </span>
                        <span className={styles.feedBody}>
                          <span className={styles.feedTitle}>{update.title}</span>
                          <span className={styles.feedSub}>
                            {update.published ? "Publiée" : "Brouillon"}
                          </span>
                        </span>
                        <span className={styles.feedStamp}>
                          {relativeTime(update.updatedAt, now)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

            </section>
          </div>

        </>
      )}
    </div>
  );
}
