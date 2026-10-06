import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardCounts, type DashboardCounts } from "@/lib/admin-data";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Tableau de bord | Administration Jtnova",
  robots: { index: false, follow: false },
};

const EMPTY: DashboardCounts = {
  publishedProjects: 0,
  draftProjects: 0,
  unreadMessages: 0,
};

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const counts = supabase ? await getDashboardCounts(supabase) : EMPTY;

  const cards = [
    { label: "Réalisations publiées", value: counts.publishedProjects },
    { label: "Brouillons", value: counts.draftProjects },
    { label: "Messages non lus", value: counts.unreadMessages },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>Tableau de bord</h1>
      <div className={styles.cards}>
        {cards.map((card) => (
          <div key={card.label} className={styles.card}>
            <div className={styles.cardValue}>{card.value}</div>
            <div className={styles.cardLabel}>{card.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
