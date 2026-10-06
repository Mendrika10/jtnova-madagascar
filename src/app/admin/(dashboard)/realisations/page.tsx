import type { Metadata } from "next";
import Link from "next/link";
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

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Réalisations</h1>
        <Link href="/admin/realisations/new" className={styles.primaryBtn}>
          Nouvelle réalisation
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className={styles.placeholder}>
          Aucune réalisation pour le moment. Créez-en une pour commencer.
        </p>
      ) : (
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
                      className={styles.iconBtn}
                      disabled={index === 0}
                      aria-label="Monter"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveProjectAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className={styles.iconBtn}
                      disabled={index === projects.length - 1}
                      aria-label="Descendre"
                    >
                      ↓
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
                    className={styles.linkBtn}
                  >
                    Éditer
                  </Link>
                  <Link
                    href={`/admin/realisations/${project.id}/apercu`}
                    className={styles.linkBtn}
                  >
                    Aperçu
                  </Link>
                  <form action={deleteProjectAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <ConfirmButton
                      message={`Supprimer « ${project.title} » et tout son contenu ?`}
                      className={styles.dangerBtn}
                    >
                      Supprimer
                    </ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
