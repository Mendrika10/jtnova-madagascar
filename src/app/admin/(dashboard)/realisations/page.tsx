import type { Metadata } from "next";
import Link from "next/link";
import { Folder, Plus } from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listAllProjects } from "@/lib/admin-projects";
import OrderableProjects from "./OrderableProjects";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Réalisations | Administration Jtnova",
  robots: { index: false, follow: false },
};

export default async function AdminRealisationsPage() {
  const supabase = await createSupabaseServerClient();
  const projects = supabase ? await listAllProjects(supabase) : [];

  const published = projects.filter((project) => project.published).length;
  const drafts = projects.length - published;

  return (
    <div className={styles.panel}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <Folder size={18} strokeWidth={2} />
          </span>
          <span className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>Réalisations</h1>
            <p className={styles.subtitle}>
              {projects.length} réalisation{projects.length > 1 ? "s" : ""} ·{" "}
              {published} publiée{published > 1 ? "s" : ""} · {drafts} brouillon
              {drafts > 1 ? "s" : ""}
            </p>
          </span>
        </div>
        <Link href="/admin/realisations/new" className={styles.primaryBtn}>
          <Plus size={14} strokeWidth={2.4} aria-hidden />
          Nouvelle réalisation
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className={styles.placeholder}>
          Aucune réalisation pour le moment. Créez-en une pour commencer.
        </p>
      ) : (
        <OrderableProjects
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
            slug: project.slug,
            published: project.published,
          }))}
        />
      )}
    </div>
  );
}
