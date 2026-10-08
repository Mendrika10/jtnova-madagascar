import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Folder,
  Plus,
  Trash,
} from "@deemlol/next-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listAllProjects } from "@/lib/admin-projects";
import { deleteProjectAction, moveProjectAction } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
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
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Titre</th>
                <th>Slug</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={project.id}>
                  <td className={styles.orderCell}>
                    <form action={moveProjectAction}>
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        className={styles.iconAction}
                        disabled={index === 0}
                        aria-label={`Monter « ${project.title} »`}
                        title="Monter"
                      >
                        <ChevronUp size={14} strokeWidth={2.2} aria-hidden />
                      </button>
                    </form>
                    <form action={moveProjectAction}>
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        className={styles.iconAction}
                        disabled={index === projects.length - 1}
                        aria-label={`Descendre « ${project.title} »`}
                        title="Descendre"
                      >
                        <ChevronDown size={14} strokeWidth={2.2} aria-hidden />
                      </button>
                    </form>
                  </td>
                  <td>{project.title}</td>
                  <td>
                    <code className={styles.code}>{project.slug}</code>
                  </td>
                  <td>
                    {project.published ? (
                      <span className={styles.badgeOk}>Publiée</span>
                    ) : (
                      <span className={styles.badgeDraft}>Brouillon</span>
                    )}
                  </td>
                  <td className={styles.actionsCell}>
                    <Link
                      href={`/admin/realisations/${project.id}`}
                      className={styles.iconAction}
                      aria-label={`Éditer « ${project.title} »`}
                      title="Éditer"
                    >
                      <Edit size={15} strokeWidth={2} aria-hidden />
                    </Link>
                    <Link
                      href={`/admin/realisations/${project.id}/apercu`}
                      className={styles.iconAction}
                      aria-label={`Aperçu de « ${project.title} »`}
                      title="Aperçu"
                    >
                      <Eye size={15} strokeWidth={2} aria-hidden />
                    </Link>
                    <form action={deleteProjectAction}>
                      <input type="hidden" name="id" value={project.id} />
                      <ConfirmButton
                        message={`Supprimer « ${project.title} » et tout son contenu ?`}
                        className={`${styles.iconAction} ${styles.iconActionDanger}`}
                      >
                        <Trash size={15} strokeWidth={2} aria-hidden />
                        <span className={styles.srOnly}>
                          Supprimer « {project.title} »
                        </span>
                      </ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
